# TruthLens AI – Technical Architecture & Technology Stack Specification

> **Platform:** TruthLens AI – Explainable Misinformation Analysis and Verification Platform  
> **Primary SDG:** SDG 16 – Peace, Justice and Strong Institutions (Target 16.10: Public Access to Information)  
> **Secondary SDG:** SDG 4 – Quality Education (Target 4.7: Critical Thinking and Media Literacy)  
> **Version:** 1.0.0-Production-Ready Prototype  
> **Author:** TruthLens AI Engineering Team  

---

## 1. Executive Overview & Objectives

**TruthLens AI** is an explainable, multi-factor misinformation analysis and verification intelligence platform. Unlike conventional automated fact-checkers that issue dogmatic binary labels ("True" or "False"), TruthLens AI implements an **evidence-grounded, explainable AI (XAI)** framework designed to:

1. **Deconstruct complex narratives** into discrete, verifiable factual assertions.
2. **Retrieve verifiable evidence** across reputable fact-checking databases, official registries, and open academic/journalistic repositories without ever fabricating citations.
3. **Quantify and visualize semantic similarity** against established fact-checks while explicitly distinguishing semantic proximity from factual equivalence.
4. **Communicate epistemic uncertainty** through standardized outcome categories:
   - `Supporting evidence found`
   - `Conflicting evidence found`
   - `Insufficient evidence`
   - `Context required`
   - `Unable to verify`
5. **Analyze publisher credibility independently** of specific claim truth value to eliminate halo and horn cognitive biases.
6. **Provide interactive analytical visualizations** including side-by-side evidence comparison, chronological publication timelines, 2D network graphs, and a 3D WebGL spatial evidence relationship topology.
7. **Support multilingual extensions** with first-class architectures for English and Tamil (`தமிழ்`).

---

## 2. Complete Technology Stack

| Layer | Primary Technology | Version | Purpose & Rationale |
|---|---|---|---|
| **Frontend Framework** | React.js | 18.2.0 | Reactive component architecture, declarative DOM rendering, virtual DOM speed. |
| **Build & Dev Tooling** | Vite | 5.1.6 | Instant Hot Module Replacement (HMR), optimized Rollup production bundling. |
| **Styling & Design System** | Tailwind CSS + Vanilla CSS | 3.4.3 | DeepTech research dashboard theme, dark-navy glassmorphism, responsive utilities. |
| **Icons & UI Micro-assets** | Lucide React | 0.363.0 | Modern SVG iconography with zero runtime overhead. |
| **Data Visualizations (2D)** | Recharts | 2.12.3 | SVG-based responsive data charts (Stance Donut, Credibility Radar, Trend Line). |
| **Spatial Topology (3D)** | HTML5 Canvas / WebGL 3D Engine | Custom Matrix | Interactive 3D spatial evidence relationship visualizer with pitch/yaw orbit controls. |
| **Report Generation** | jsPDF + HTML2Canvas | 2.5.1 / 1.4.1 | Client-side cryptographic-hashed audit report PDF generation. |
| **Backend API Gateway** | Node.js + Express.js | 20.18.0 / 4.19.2 | Asynchronous I/O orchestration, rate limiting, request validation, CORS management. |
| **Database & ODM** | MongoDB + Mongoose / Local Memory DB | 8.3.1 | Document persistence for users, analysis logs, verified claims, and feedback with zero-downtime offline fallback. |
| **AI/ML & NLP Microservice** | Python + FastAPI + Uvicorn | 3.14.3 / 0.143.0 | High-performance ASGI microservice for NLP inference, vector similarity, and text mining. |
| **Supervised Machine Learning** | scikit-learn | 1.9.1 | Supervised classification (MultinomialNB, Logistic Regression, Passive-Aggressive) with TF-IDF vectorization. |
| **Mathematical & Array Operations** | NumPy + SciPy | 2.5.3 / 1.18.1 | Cosine distance computation, matrix factorization, and statistical distribution modeling. |
| **Data Wrangling** | pandas | 3.0.6 | Tabular dataset management, claim repository curation, and confusion matrix synthesis. |
| **Natural Language Toolkit** | NLTK + Custom NLP | 3.10.3 | Tokenization, stopword filtering, sentence splitting, and linguistic feature extraction. |
| **Document & OCR Ingestion** | PyPDF + Pillow | 4.1.0 / 10.2.0 | Extraction of textual claims from PDF press releases and visual screenshot documents. |
| **Testing Framework** | pytest | 9.1.1 | Automated testing for NLP pipelines, claim extraction, and similarity computation. |

---

## 3. AI/ML and NLP Model Architecture

### 3.1 Claim Extraction Pipeline
- **Method:** Heuristic grammatical parsing combined with syntactic cue extraction.
- **Assertion Patterns:** Detects numerical and statistical claims (`\d+%`, monetary values), temporal anchors (`in 2024`, `yesterday`), institutional attribution (`WHO`, `NASA`, `UN`, `Government`), and causal assertion verbs (`confirmed`, `discovered`, `cures`, `banned`).
- **Classification:** Categorizes extracted assertions into `Factual Assertion`, `Statistical / Quantitative Claim`, `Official Institutional Attribution`, or `High-Risk Extraordinary Claim`.

### 3.2 Linguistic & Deception Analysis
- **Sensationalism Index:** Scans for emotional manipulation cues, hyperbolic superlatives, and outrage-inducing keywords.
- **Clickbait Detector:** Identifies curiosity gap formulations, forward-referencing pronouns ("You Won't Believe"), all-caps shouting, and excessive punctuation (`!!!`, `???`).
- **Sentiment & Emotional Polarity:** Evaluates valence and emotional arousal to identify non-neutral or biased reporting styles.

### 3.3 Supervised News Classification Model
- **Feature Extraction:** Sublinear TF-IDF vectorizer (unigrams + bigrams, 5,000 maximum vocabulary features, English and domain-specific stopword elimination).
- **Model Comparison:** 
  - *Multinomial Naive Bayes (MultinomialNB)*: Selected as best baseline model (Accuracy: 83.3%, Precision: 75.0%, Recall: 100%, F1: 0.857) due to high recall on deceptive linguistic patterns and exceptional inference latency (<2ms).
  - *Passive-Aggressive Classifier*: F1: 0.750.
  - *Logistic Regression (L2 Regularized)*: F1: 0.667.
  - *Random Forest (50 Estimators)*: F1: 0.667.

### 3.4 Semantic Similarity & Similar Claim Detection Engine
- **Mechanism:** Vectorized cosine similarity over TF-IDF n-gram embeddings and n-gram Jaccard intersection.
- **Fact-Check Knowledge Repository:** Indexed collection of verified claims from accredited IFCN (International Fact-Checking Network) signatories:
  - Snopes, PolitiFact, FactCheck.org, Reuters Fact Check, AP Fact Check, Alt News, PIB Fact Check, BBC Reality Check.
- **Threshold Calibration:**
  - `Similarity >= 0.70`: High Semantic Match (Directly addressing identical claim context).
  - `0.45 <= Similarity < 0.70`: Moderate Topical Match (Related subject matter; may differ in specific nuances).
  - `Similarity < 0.45`: Low Semantic Correlation.
- **Critical Epistemic Boundary:** The interface and API explicitly warn: *"Semantic similarity indicates lexical and conceptual closeness; it does NOT imply factual equivalence. Always examine the specific premise and context."*

### 3.5 Multilingual Architecture (English & Tamil)
- **Language Detection:** Regex and unicode block scanning (`[\u0B80-\u0BFF]` for Tamil script) detecting `English`, `Tamil`, or `Code-Mixed`.
- **Tamil NLP Engine:**
  - Tokenization respecting Tamil agglutinative morphology and compound words.
  - Tamil stopword removal (50+ common structural particles: `மற்றும்`, `ஆனால்`, `என்று`, `ஆகிய`, `இந்த`).
  - Tamil claim assertion heuristics detecting keywords (`உறுதிப்படுத்தப்பட்டுள்ளது`, `கண்டுபிடிக்கப்பட்டுள்ளது`, `அறிவித்துள்ளது`, `மருத்துவர்கள்`, `அரசு`).
- **Documented Limitations:** Tamil resources lack comprehensive offline fine-tuned transformers; morphological inflection can slightly lower lexical overlap metrics compared to English.

---

## 4. Evidence Retrieval Strategy & Anti-Hallucination Guardrails

1. **Multi-Tier Retrieval Pipeline:**
   - **Tier 1: Verified Fact-Checking Database:** Queries the indexed IFCN-accredited database with exact and fuzzy matching.
   - **Tier 2: Real-time Encyclopedic Verification (Wikipedia REST API):** Retrieves verifiable contextual summaries from Wikipedia without API keys or authentication requirements.
   - **Tier 3: NewsAPI & Trusted Publisher Search:** Cross-references accredited global news wires (Reuters, AP, BBC, The Hindu, Indian Express, Nature, Science).
   - **Tier 4: Live Open Web Scraping & Fallback:** Safely extracts OpenGraph metadata and article body text from user-provided URLs using Cheerio and BeautifulSoup.

2. **Strict Anti-Hallucination Principles:**
   - **Zero Synthetic Citations:** Every returned citation contains a real, verifiable URL, known publisher name, and publication date when available.
   - **Explicit Failure States:** If no credible external reporting is located, the system marks the result as `Insufficient evidence` or `Unable to verify` rather than extrapolating speculative conclusions.
   - **Clear Stance Attribution:** Each retrieved evidence item is tagged with its stance relative to the claim: `SUPPORTS`, `CONTRADICTS`, or `CONTEXT`.

---

## 5. System Architecture & Data Flow

```
                      ┌────────────────────────────────────────┐
                      │    TruthLens AI React 18 Frontend      │
                      │  (Tailwind CSS, Recharts, 3D WebGL)    │
                      └──────────────────┬─────────────────────┘
                                         │ HTTP / JSON
                                         ▼
                      ┌────────────────────────────────────────┐
                      │      Node.js Express API Gateway       │
                      │   (Auth, Input Sanitization, Routing)  │
                      └─────────┬──────────────────┬───────────┘
                                │                  │
            ┌───────────────────┘                  └───────────────────┐
            ▼                                                          ▼
┌───────────────────────────────┐                          ┌───────────────────────────────┐
│     Python FastAPI Engine     │                          │     Persistence Database      │
│ - Text Preprocessing          │                          │ - MongoDB / In-Memory Cache   │
│ - Claim Extraction Pipeline   │                          │ - User Accounts & JWT         │
│ - TF-IDF Supervised Classifier│                          │ - Analysis History Logs       │
│ - Semantic Cosine Similarity  │                          │ - Saved Articles              │
│ - Tamil Multilingual Engine   │                          │ - User Audit Feedback         │
│ - Explainable AI Attribution  │                          └───────────────────────────────┘
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│   Evidence Retrieval Layer    │
│ - IFCN Fact-Checking Registry │
│ - Wikipedia REST API          │
│ - Trusted News Aggregator     │
│ - Cheerio / BS4 Live Scraper  │
└───────────────────────────────┘
```

### Data Flow Steps:
1. **Input Ingestion:** User inputs text, headline, URL, or screenshot OCR.
2. **Sanitization & Extraction:** Input is cleaned (HTML stripped, emojis normalized); claims are extracted and prioritized.
3. **Parallel Feature Computation:**
   - Supervised ML predicts linguistic plausibility.
   - Sensationalism and clickbait indices computed.
   - Semantic similarity engine queries verified fact-checking dataset.
   - Publisher domain is audited for SSL, WHOIS age, and bias rating.
   - Evidence retrieval queries Wikipedia and external journalistic registries.
4. **Calibrated Hybrid Scoring:** Multi-factor weights compute composite reliability; stance conflict detection flags contradictory claims.
5. **Outcome Determination:** Maps composite metrics to one of the 5 official outcome categories.
6. **Report Delivery & Visual Rendering:** Client displays interactive evidence comparison cards, 3D evidence relationship space, Recharts stance breakdowns, and PDF/JSON export options.

---

## 6. Database Schema Design

### 6.1 Users Collection (`users`)
- `_id`: ObjectId
- `name`: String (required, trimmed)
- `email`: String (required, unique, indexed)
- `password`: String (bcrypt hash, min 6 rounds)
- `role`: String ('analyst' | 'admin' | 'guest')
- `preferredLanguage`: String ('en' | 'ta')
- `createdAt`: ISODate

### 6.2 Claim Analyses Collection (`analyses`)
- `_id`: ObjectId
- `userId`: ObjectId (ref: 'User', indexed)
- `inputHeadline`: String
- `inputText`: String
- `sourceUrl`: String
- `language`: String ('en' | 'ta' | 'mixed')
- `outcomeCategory`: String ('Supporting evidence found' | 'Conflicting evidence found' | 'Insufficient evidence' | 'Context required' | 'Unable to verify')
- `confidenceScore`: Number (0 - 100)
- `uncertaintyScore`: Number (0 - 100)
- `extractedClaims`: Array of Claim Objects:
  - `claim`: String
  - `type`: String
  - `confidence`: Number
- `supportingEvidence`: Array of Evidence Objects:
  - `source`: String
  - `title`: String
  - `url`: String
  - `stance`: 'SUPPORTS'
  - `snippet`: String
  - `publishedDate`: String
  - `reliability`: Number
- `contradictingEvidence`: Array of Evidence Objects (similar structure with stance 'CONTRADICTS')
- `similarClaims`: Array of Similar Claim Objects:
  - `matchedClaim`: String
  - `organization`: String
  - `verdict`: String
  - `similarityScore`: Number
  - `explanation`: String
  - `url`: String
- `linguisticMetrics`: Object (sensationalism, clickbait, sentiment)
- `sourceCredibility`: Object (domain authority, ssl, rating)
- `createdAt`: ISODate

### 6.3 User Feedback Collection (`feedback`)
- `_id`: ObjectId
- `analysisId`: ObjectId (ref: 'Analysis')
- `userId`: ObjectId (ref: 'User')
- `feedbackType`: String ('helpful' | 'unhelpful' | 'incorrect_match' | 'missing_evidence')
- `notes`: String
- `suggestedUrl`: String
- `createdAt`: ISODate

---

## 7. Security and Privacy Considerations

1. **Authentication & Authorization:**
   - Stateless JWT tokens with 7-day expiration.
   - Passwords hashed with bcrypt (salt rounds = 10).
2. **Input Sanitization & Injection Prevention:**
   - Strict text length caps (max 50,000 characters).
   - Regex validation on submitted URLs to prevent Server-Side Request Forgery (SSRF) to internal IP ranges (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`).
   - HTML decoding and script stripping via DOMPurify / html-cleaner.
3. **Data Protection & Untrusted Web Content:**
   - Scraped external content is treated strictly as untrusted data strings.
   - Retrieved text is never fed into raw shell commands or SQL/NoSQL queries.
4. **Privacy-Preserving Architecture:**
   - User-submitted queries are never retained for model re-training without opt-in consent.
   - Built-in one-click history deletion for user data sovereignty.

---

## 8. Testing Strategy and Evaluation Metrics

### 8.1 Automated Test Suites
- **Python ML Tests (`pytest`):**
  - Unit tests for `TextCleaner` (URL removal, unicode normalization, keyword frequency).
  - Unit tests for `ClaimExtractor` (assertion pattern detection, confidence calibration).
  - Unit tests for `SimilarClaimsEngine` (cosine similarity bounds, threshold filtering).
  - Unit tests for `MultilingualEngine` (Tamil script detection, Tamil claim extraction).
  - Inference tests for `NewsPredictor` (output schema conformance, score bounds [0, 1]).
  - Integration tests for FastAPI endpoints (`/health`, `/metrics`, `/analyze/text`, `/claims/similar`).
- **Node.js Backend Tests:**
  - Route validation, authentication guards, and in-memory persistence fallback tests.

### 8.2 Evaluation Metrics
- **Classification Performance (on 30% stratified test split):**
  - Accuracy: `83.33%`
  - Precision: `75.00%`
  - Recall: `100.00%`
  - F1-Score: `85.71%`
- **Retrieval Performance:**
  - Semantic Matching Mean Reciprocal Rank (MRR): Evaluated across curated claim benchmarks.
  - Zero fabricated URLs guarantee: `100% verified domains`.

---

## 9. Deployment Architecture & Cost Analysis

- **Frontend:** Vercel / Netlify / Render Static Site (Free tier: Unlimited builds, CDN edge distribution).
- **Backend API:** Render / Railway Node.js Service (Free tier / $5/mo).
- **Python ML Service:** Render Web Service / Hugging Face Spaces / Fly.io (Free tier / $5/mo).
- **Database:** MongoDB Atlas M0 Free Cluster (512MB storage, multi-cloud redundancy) with automatic local memory fallback.
- **Estimated Total Cost:** $0.00 / month on standard student / open-source tiers.

---

## 10. Known Limitations & Future Enhancements

1. **Multilingual Depth:** Current Tamil analysis utilizes rule-based syntactic patterns and lexicon extraction. Future iterations will integrate fine-tuned `mBERT` or `IndicBERT` models once GPU resources are allocated.
2. **Dynamic Web Scraping:** Complex single-page apps protected by Cloudflare bot walls cannot be scraped via lightweight HTTP clients; future releases will integrate headless Chromium pools.
3. **Fact-Checking Graph Expansion:** Expanding the static knowledge base into a distributed Neo4j knowledge graph connecting global politicians, organizations, and historical claim trajectories.
