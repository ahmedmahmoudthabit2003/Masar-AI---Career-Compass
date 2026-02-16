# 🧭 Masar AI – Career Compass (مسار AI)

[![Vision 2030](https://img.shields.io/badge/MENA-Vision%202030-blue.svg)](https://www.vision2030.gov.sa/)
[![AI Powered](https://img.shields.io/badge/AI-Gemini%203.0%20Pro-orange.svg)](https://deepmind.google/technologies/gemini/)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue.svg)](https://react.dev/)

**Masar AI** is a next-generation Agentic Career Partner. It transforms the job search journey from a passive task into a strategic, AI-guided simulation. By combining behavioral psychology, real-time market grounding, and generative reasoning, Masar AI helps the MENA region's talent build recession-proof careers.

---

## 🌟 Product Vision
The current job market is volatile, disrupted by AI, and saturated with generic advice. Masar AI solves this by implementing the **"Golden Triangle Methodology"**:
1.  **Cognitive Mirroring:** Moving past self-reporting to scenario-based behavioral assessment.
2.  **Market Strategic Grounding:** Using real-time search data to find "Stability Scores" against AI automation.
3.  **Narrative Architecture:** Building career stories that resonate with both ATS algorithms and human recruiters.

### 👤 User Journey
1.  **The Probing:** User interacts with the *Cognitive Mirror* chat to reveal latent skills via crisis scenarios.
2.  **The Discovery:** AI suggests 4 high-alignment paths based on Saudi Vision 2030 trends.
3.  **The Grounding:** User investigates live salary data, demand maps, and AI-risk indices.
4.  **The Blueprint:** A maximum-reasoning (Gemini 3 Pro) execution plan is generated with milestones.
5.  **The Launchpad:** User uses the *Resume Architect*, *Mock Interviewer*, and *LinkedIn Arbitrage* tools to land the role.

---

## 🛠️ Tech Stack & Architecture

### Core Stack
- **Engine:** Google Gemini 3.0 Pro (Complex Reasoning) & 2.5 Flash (Grounding/Search).
- **Frontend:** React 19 + TypeScript + Vite.
- **Styling:** Tailwind CSS + Framer Motion (Animations).
- **APIs:** Google Search Grounding, Adzuna (Job Postings), RapidAPI (LinkedIn Scraping).

### Folder Structure
```text
/src
  ├── components/       # UI Components (Atomic Design)
  │   ├── tools/        # Specialized AI modules (Resume, Interview, etc.)
  │   └── UI/           # Reusable Design System elements
  ├── contexts/         # State Management (Theme, Toast)
  ├── hooks/            # Custom Logic (useAppEngine)
  ├── services/         # API & AI integrations (Gemini, LinkedIn)
  ├── layouts/          # Page Wrappers
  └── types/            # TypeScript Definitions
/public                 # Static Assets
├── metadata.json       # App Permissions (Microphone, etc.)
└── package.json        # Dependencies
```

---

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/masar-ai.git
cd masar-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Mandatory for AI Functionality
API_KEY=YOUR_GOOGLE_GEMINI_API_KEY

# Optional: Real-time Job Search (Adzuna)
VITE_ADZUNA_APP_ID=your_id
VITE_ADZUNA_APP_KEY=your_key

# Optional: LinkedIn Integration
RAPIDAPI_KEY=your_rapidapi_key
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 🗺️ Roadmap & Phases

### Phase 1: The Foundation (Current)
- [x] Gemini 3.0 Pro Integration (Thinking Mode).
- [x] Conversational Probing (Cognitive Mirror).
- [x] Real-time Market Grounding with Google Search.
- [x] Impact-Logic Resume Analysis.

### Phase 2: High Performance (Q3 2024)
- [ ] **Live Audio Mock Interviews:** Using Gemini Live API for real-time vocal feedback.
- [ ] **Portfolio Ghostwriter:** Automated generation of GitHub Readmes or Portfolio copy.
- [ ] **Regional Benchmarking:** Specific localized data for NEOM, Riyadh, and Dubai hubs.

### Phase 3: Agentic Ecosystem (2025)
- [ ] **Auto-Apply Agent:** AI that modifies resumes and submits applications automatically.
- [ ] **Life Trailer Simulation:** 60-second video simulations of "A Day in your Future Career".

---

## 🎨 UI Flow Mockups

| Step | Appearance | Feature |
| :--- | :--- | :--- |
| **01. Welcome** | Professional Glassmorphism | Quick session restoration & Hero Vision |
| **02. Mirror** | Clean Chat Interface | Behavioral probing instead of forms |
| **03. Market** | Dynamic Dashboards | AI Stability Scores & Live Salary Bars |
| **04. Blueprint** | Interactive Timeline | Checkable milestones & Skill Galaxy |

---

## 🤝 Contributing
We welcome contributions from career experts and AI engineers. Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ for the future of Saudi & Arab Talent.*