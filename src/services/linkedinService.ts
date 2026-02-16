
import { GoogleGenAI, Type } from "@google/genai";
import { LinkedInImportedData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_PRO = "gemini-3-pro-preview";

export interface LinkedInRawProfile {
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  location: string;
  industry: string;
  positions: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  skills: Array<{
    name: string;
    endorsements?: number;
  }>;
  education: Array<{
    school: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
  }>;
  certifications?: string[];
}

export class LinkedInService {
  /**
   * Parses a LinkedIn PDF Export using Gemini 3 Pro's vision/document understanding.
   */
  static async parseLinkedInPDF(fileBase64: string): Promise<LinkedInImportedData> {
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: fileBase64
          }
        },
        {
          text: `Extract structured career data from this LinkedIn PDF profile. 
          Return a valid JSON object matching this schema:
          {
            "name": "full name",
            "headline": "current headline",
            "summary": "about section",
            "experience": [{"title": "role", "company": "name", "duration": "dates", "description": "tasks"}],
            "education": [{"school": "name", "degree": "level", "field": "major"}],
            "skills": ["skill1", "skill2"],
            "certifications": ["cert1", "cert2"]
          }
          Ensure Arabic output where the source text is Arabic.`
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            headline: { type: Type.STRING },
            summary: { type: Type.STRING },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  school: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  field: { type: Type.STRING }
                }
              }
            },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            certifications: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "experience", "skills"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      ...result,
      importedAt: new Date().toISOString()
    };
  }

  static async fetchProfileViaRapidAPI(profileUrl: string): Promise<LinkedInRawProfile> {
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.RAPIDAPI_KEY : undefined;
    if (!apiKey || apiKey === 'YOUR_RAPIDAPI_KEY') {
      throw new Error('RapidAPI key is missing. Use PDF upload.');
    }
    
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'linkedin-api8.p.rapidapi.com'
      }
    };

    const response = await fetch(
      `https://linkedin-api8.p.rapidapi.com/?url=${encodeURIComponent(profileUrl)}`,
      options
    );
    
    if (!response.ok) throw new Error('RapidAPI fetch failed');
    return await response.json();
  }

  static processProfileData(profile: LinkedInRawProfile): LinkedInImportedData {
    return {
      name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
      headline: profile.headline || '',
      summary: profile.summary || '',
      experience: profile.positions?.map(pos => ({
        title: pos.title,
        company: pos.company,
        duration: `${pos.startDate || ''} - ${pos.endDate || 'Present'}`,
        description: pos.description || ''
      })) || [],
      education: profile.education?.map(edu => ({
        school: edu.school,
        degree: edu.degree,
        field: edu.fieldOfStudy || ''
      })) || [],
      skills: profile.skills?.map(skill => skill.name) || [],
      certifications: profile.certifications || [],
      importedAt: new Date().toISOString()
    };
  }
}
