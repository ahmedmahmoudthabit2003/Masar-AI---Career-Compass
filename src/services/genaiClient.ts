
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface RequestOptions {
  model?: string;
  retries?: number;
  thinkingBudget?: number;
}

export class GenAIClient {
  private static defaultRetries = 2;

  static async safeGenerate(prompt: string, schema: any, options: RequestOptions = {}) {
    let lastError;
    const retries = options.retries ?? this.defaultRetries;
    
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await ai.models.generateContent({
          model: options.model || "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            thinkingConfig: options.thinkingBudget ? { thinkingBudget: options.thinkingBudget } : undefined
          }
        });

        const text = response.text;
        if (!text) throw new Error("استجابة فارغة من النموذج");
        return JSON.parse(text);
      } catch (error) {
        console.warn(`GenAI attempt ${i + 1} failed:`, error);
        lastError = error;
        // Exponential backoff
        if (i < retries) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      }
    }
    throw lastError;
  }
}
