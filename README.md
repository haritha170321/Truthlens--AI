# Fake News Detector (TruthGuard)
> **"Detect. Verify. Understand. Before You Share."**
> A Production-Quality Full-Stack AIML Web Application for Explainable Misinformation Detection and Evidence Verification.

---

## 🌟 Executive Overview
**Fake News Detector** is a full-stack, AI/ML-powered Single Page Application (SPA) designed to combat online misinformation through transparent, explainable AI. Rather than issuing unexplainable binary labels, TruthGuard implements a **Hybrid Multi-Factor Scoring Architecture** that calculates an audited **Verification Confidence Score (0–100%)** combining:

1. **Machine Learning Model (30%)** — Supervised classification (MultinomialNB, Logistic Regression, Random Forest) with TF-IDF n-grams trained on factual vs deceptive linguistic markers.
2. **External Evidence Matching (25%)** — Real-time cross-referencing against NewsAPI and verified journalism registries.
3. **Source Credibility Index (20%)** — Domain authority scoring, SSL certification audit, and satire blacklist checks.
4. **LLM Multi-Claim Reasoning (15%)** — Generative AI reasoning (Google Gemini) assessing claim plausibility and institutional attribution.
5. **Linguistic & Neutrality Analysis (10%)** — Extraction of emotional manipulation, clickbait syntax, all-caps shouting, and excessive punctuation.

---

## 🚀 Key Features

- **Multi-Modal Verification Ingestion:**
  - **Raw Text / Social Media Post:** Analyze headlines, tweets, WhatsApp forwards, or long-form investigative articles.
  - **Live URL Verification:** Scrapes web pages, extracts metadata, verifies SSL certificates, and evaluates publisher reputation.
  - **Image & Screenshot OCR:** Optical Character Recognition extracts text from mobile screenshots or photos.
  - **PDF Document Analysis:** Multi-page parsing and claim extraction for academic papers or press releases.
- **Explainable AI (XAI) Dashboard:**
  - **Discrete Claim-by-Claim Extraction:** Breaks down complex stories into verifiable assertions with status (`Supported`, `Contradicted`, `Unsupported`, `Unverified`).
  - **Supporting vs Contradicting Evidence Panel:** Live citations and stances from external sources.
  - **Calibrated Verification Confidence:** Clear differentiation between `REAL`, `LIKELY REAL`, `MISLEADING`, `LIKELY FAKE`, and `UNVERIFIED`.
- **Zero-API College Demo Mode:** Built-in verified sample cases and local ML fallbacks allowing flawless live demonstrations without paid API keys.
- **Reporting Suite:** 1-Click export to professional **PDF Verification Audit Reports** and **CSV datasets**.
- **Responsive & Mobile-First UI:** Tailored layout for smartphones (touch navigation, bottom navigation bar, camera upload) and desktop monitors (interactive Recharts, multi-column audits).
- **Dark & Light Mode:** Sleek glassmorphism visual design with deep navy tones and vibrant indicators.

---

## 🏗️ System Architecture

```
                                  [ User / Client Browser ]
                                              │
                                   (React + Vite + Tailwind)
                                              │ HTTP / JSON
                                              ▼
                                 [ Node.js Express API Server ]
                                  (Auth, Routing, Orchestration)
                                              │
                ┌─────────────────────────────┼─────────────────────────────┐
                │                             │                             │
                ▼                             ▼                             ▼
       [ Python AIML Service ]       [ MongoDB Database ]          [ External APIs ]
    - FastAPI Microservice          - User Authentication          - Google Gemini API
    - Scikit-Learn Classifiers      - Audit History                - NewsAPI
    - TF-IDF Vectorizer (5k Feat)   - Saved Bookmarks              - Scraper Engine
    - NLP & Sentiment Analyzer      - Analytics Cache
    - OCR Engine (Pytesseract/PIL)
    - PyPDF Text Extractor
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide React, Axios, jsPDF, html2canvas, PWA Manifest |
| **Backend** | Node.js, Express.js, Mongoose, JWT, bcryptjs, Multer, Cheerio, Helmet, Express-Rate-Limit |
| **AIML Service** | Python 3.11+, FastAPI, Uvicorn, scikit-learn, pandas, numpy, nltk, PyPDF, Pillow, Pytesseract |
| **Database** | MongoDB / MongoDB Atlas (with automatic local in-memory fallback for offline testing) |
| **External AI** | Google Gemini API (`gemini-1.5-flash`), NewsAPI |

---

## 📁 Repository Structure

```
FakeNews-Detector/
├── frontend/                     # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/           # UI components (common, dashboard, result)
│   │   ├── context/              # Auth & Theme providers
│   │   ├── pages/                # All 14 route pages
│   │   └── services/             # Axios API clients & PDF report generator
│   ├── public/                   # PWA manifest and SVG icons
│   └── package.json
│
├── backend/                      # Node.js Express REST API
│   ├── src/
│   │   ├── config/               # DB and environment configuration
│   │   ├── controllers/          # Auth, News, Saved, Analytics controllers
│   │   ├── middleware/           # JWT, Rate limiting, Upload, Error handler
│   │   ├── models/               # Mongoose schemas (User, Analysis, Saved)
│   │   ├── routes/               # Express endpoints
│   │   ├── services/             # Gemini, NewsAPI, Scraper, Hybrid Scorer
│   │   └── utils/                # Realistic demo cases & database seeder
│   ├── server.js                 # Server entry point
│   └── package.json
│
├── ml-service/                   # Python FastAPI AIML Microservice
│   ├── app/
│   │   ├── main.py               # FastAPI endpoints
│   │   ├── preprocessing/        # Text cleaning and keyword extractor
│   │   ├── nlp/                  # Claim extraction, linguistic & sentiment engines
│   │   ├── ocr/                  # Optical character recognition & PDF extractor
│   │   ├── inference/            # Prediction pipeline and probability calibration
│   │   └── utils/                # Domain & publisher credibility evaluator
│   ├── datasets/                 # Training dataset (sample_news_dataset.csv)
│   ├── models/                   # Pre-trained pipeline artifacts & metrics JSON
│   ├── training/                 # train_model.py multi-model training script
│   └── requirements.txt
│
├── docker-compose.yml            # Multi-container deployment
└── README.md                     # Comprehensive documentation
```

---

## ⚙️ Environment Configuration

Create a `.env` file in `backend/.env` (a template is provided in `backend/.env.example`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database (Local MongoDB or MongoDB Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/fakenews_db

# JWT Authentication
JWT_SECRET=super_secure_fake_news_detector_jwt_secret_key_2026
JWT_EXPIRES_IN=7d

# Python AIML Microservice URL
ML_SERVICE_URL=http://localhost:8000

# Optional External API Keys (App operates seamlessly in Demo/Local ML mode if empty)
GEMINI_API_KEY=
NEWS_API_KEY=
```

---

## 🏃 Local Development Quickstart

### 1. Start Python AIML Service
```bash
cd ml-service
py -m pip install -r requirements.txt
py training/train_model.py
py -m uvicorn app.main:app --reload --port 8000
```
*The service will run at `http://localhost:8000` with interactive API docs at `http://localhost:8000/docs`.*

### 2. Start Node.js Backend API
```bash
cd backend
npm install
npm run dev
```
*The backend API will run at `http://localhost:5000` with health check at `http://localhost:5000/api/health`.*

### 3. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
*The web app will open at `http://localhost:5173`.*

---

## 🎓 College Presentation & Live Demonstration Guide

TruthGuard includes zero-friction demo features built specifically for classroom and jury presentations:

1. **1-Click Demo Login:** On the login page, click **"1-Click Demo Presentation Login"** to instantly sign in as a Lead Researcher (`Dr. Alex Morgan`) without typing credentials.
2. **Instant Demo Presets:** On the **Check News** page, select any of the 4 demo case cards:
   - **Reliable NASA Galaxy Discovery** (Demonstrates `REAL` 94% verdict with spectroscopic claims & NASA citations).
   - **Viral Miracle Cure Hoax** (Demonstrates `LIKELY FAKE` 96% verdict with pseudoscience flags & WHO counter-evidence).
   - **Misleading Tech Layoff Rumor** (Demonstrates `MISLEADING` 82% verdict with 100% vs 2% exaggeration detection).
   - **Unverified Diplomatic Accord** (Demonstrates `UNVERIFIED` 64% verdict with anonymous sourcing flags).
3. **Animated Pipeline Visualization:** Watch the step-by-step progress modal during analysis.
4. **PDF Report Generation:** Click **"Download PDF Report"** on any result page to download an audit summary.

---

## 🛡️ Important Disclaimer
> **AI-generated verification is an investigative aid, not an absolute guarantee of truth.** News stories develop continuously as new primary evidence emerges. Always review cited sources and apply critical thinking before sharing information.

---

## 📜 License
This project is open-source under the MIT License.
