# 🌊 CarbonIQ — AI Carbon Footprint Calculator

An intelligent, conversational carbon footprint calculator that analyzes your lifestyle across 7 categories through 8 targeted questions, then generates a personalized CO₂ reduction plan with real-time impact simulation.

## ✨ Features

- **8-Question Deep Analysis** — Transport, commute distance, diet, food waste, energy, shopping, digital footprint, and flights
- **7-Category Breakdown** — Color-coded visual bars showing where your emissions come from
- **Dual Engine** — Local Simulator (instant, offline) + Google Gemini LLM (AI-powered)
- **Live Analytics Dashboard** — Real-time gauge, global benchmarks, and category breakdown
- **Action Plan Simulator** — Check off recommended actions and watch your score drop live
- **Google Authentication** — Sign in with Google for persistent history via Firestore
- **Ocean-Themed UI** — Glassmorphism, animated bubbles, custom footprint+CO₂ logo

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI Framework |
| **Vite** | Build Tool |
| **Firebase Auth** | Google Sign-In |
| **Cloud Firestore** | Calculation History |
| **Gemini 2.0 Flash** | LLM Engine (optional) |
| **Lucide React** | Icons |
| **Canvas Confetti** | Celebration Effects |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project (free tier)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/CarbonIQ.git
cd CarbonIQ

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Firebase credentials

# Start dev server
npm run dev
```

### Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable **Authentication → Google Sign-In**
3. Register a **Web App** and copy the config values
4. Paste them into your `.env` file

## 📊 How It Works

1. Answer 8 lifestyle questions via the conversational UI
2. CarbonIQ calculates your CO₂ across 7 categories using real emission coefficients
3. Your score is compared against global benchmarks (India avg, World avg, 2050 target)
4. You receive 3 personalized actions ranked by impact
5. Check off actions to simulate your reduced footprint in real-time

## 🧪 Testing

```bash
npm test
```

14 tests covering calculation logic, category breakdown, distance modifiers, and action plan generation.

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.jsx            # Top bar with auth + branding
│   ├── PromptLab.jsx         # Settings panel + About card
│   ├── ChatSandbox.jsx       # 8-question calculator engine
│   ├── AnalyticsDashboard.jsx # Live analytics + action simulator
│   └── FootprintLogo.jsx     # Custom SVG logo
├── utils/
│   └── carbonRules.js        # Emission coefficients + calculations
├── __tests__/
│   └── carbonRules.test.js   # Unit tests
├── firebase.js               # Auth + Firestore + offline fallback
├── App.jsx                   # Root layout
└── index.css                 # Ocean theme design system
```

## 🌍 Emission Sources

All CO₂ coefficients are based on publicly available data from the EPA, IPCC, and academic research.

## 📄 License

MIT

---

Built with 🌊 by Sumed
