from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.preprocessing.text_cleaner import TextCleaner
from app.nlp.claim_extractor import ClaimExtractor
from app.nlp.linguistic_analyzer import LinguisticAnalyzer
from app.nlp.sentiment_analyzer import SentimentAnalyzer
from app.nlp.clickbait_detector import ClickbaitDetector
from app.nlp.similar_claims_engine import SimilarClaimsEngine
from app.nlp.multilingual_engine import MultilingualEngine
from app.utils.source_evaluator import SourceEvaluator
from app.ocr.ocr_engine import OCREngine
from app.inference.predictor import NewsPredictor

app = FastAPI(
    title="TruthLens AI – Verification & NLP Microservice",
    description="Explainable Hybrid AI/ML, NLP, Semantic Similarity and Fact-Checking Engine for TruthLens AI",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = NewsPredictor()
similar_engine = SimilarClaimsEngine()

class TextAnalysisRequest(BaseModel):
    headline: Optional[str] = ""
    text: str
    source_url: Optional[str] = ""
    language: Optional[str] = None

class SimilarClaimRequest(BaseModel):
    claim: str
    top_k: Optional[int] = 4
    threshold: Optional[float] = 0.20

class ClaimAnalysisRequest(BaseModel):
    text: str
    language: Optional[str] = None

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TruthLens AI Verification & NLP Engine",
        "model_loaded": predictor.classifier is not None,
        "indexed_fact_checks": len(similar_engine.repository),
        "supported_languages": ["en", "ta"]
    }

@app.get("/metrics")
def get_metrics():
    return predictor.get_metrics()

@app.get("/methodology/info")
def get_methodology_info():
    """
    Returns scientific documentation of AI models, evaluation metrics,
    Tamil multilingual limitations, and ethical guidelines for TruthLens AI.
    """
    metrics = predictor.get_metrics()
    return {
        "platform": "TruthLens AI",
        "primary_sdg": "SDG 16 – Peace, Justice and Strong Institutions",
        "secondary_sdg": "SDG 4 – Quality Education",
        "pipeline_stages": [
            {"stage": "1. Ingestion & Sanitization", "method": "HTML strip, Unicode NFKD normalization, script detection"},
            {"stage": "2. Claim Extraction", "method": "Syntactic assertion mining (quantifiers, temporal anchors, attributions)"},
            {"stage": "3. Supervised Plausibility", "method": "TF-IDF (1-2 ngrams) + MultinomialNB classifier trained on linguistic markers"},
            {"stage": "4. Semantic Fact-Check Retrieval", "method": "Vectorized cosine similarity over IFCN-accredited database with Jaccard overlap"},
            {"stage": "5. Epistemic Calibrated Scoring", "method": "Multi-factor probabilistic synthesis mapping to 5 outcome categories"}
        ],
        "supervised_model": {
            "name": metrics.get("best_model", "MultinomialNB"),
            "features": "TF-IDF (1-2 ngrams, 5000 max features)",
            "metrics": metrics.get("metrics", {}),
            "all_evaluated_models": metrics.get("all_model_evaluations", {})
        },
        "outcome_categories": [
            {"category": "Supporting evidence found", "description": "Credible independent records corroborate primary factual premise."},
            {"category": "Conflicting evidence found", "description": "Reputable fact-checks or official records directly contradict the assertions."},
            {"category": "Insufficient evidence", "description": "No authoritative primary sources currently establish or disprove the assertion."},
            {"category": "Context required", "description": "Assertion contains a grain of truth but omits critical timeline or qualification details."},
            {"category": "Unable to verify", "description": "Assertions are too subjective, ambiguous, or unverifiable by public records."}
        ],
        "multilingual_capabilities": {
            "supported": ["English (en)", "Tamil (ta)"],
            "tamil_features": ["Script detection", "Agglutinative tokenization", "Tamil assertion mining", "Bilingual outcome mapping"],
            "tamil_limitations": MultilingualEngine.get_tamil_nlp_limitations()
        },
        "epistemic_disclaimer": "TruthLens AI communicates uncertainty and distinguishes retrieved evidence from automated inference. Semantic similarity does not imply factual equivalence."
    }

@app.post("/claims/similar")
def find_similar_claims(request: SimilarClaimRequest):
    results = similar_engine.find_similar(
        query_claim=request.claim,
        top_k=request.top_k or 4,
        threshold=request.threshold or 0.20
    )
    return {
        "success": True,
        "query": request.claim,
        "matches_count": len(results),
        "similar_claims": results
    }

@app.post("/analyze/text")
def analyze_text(request: TextAnalysisRequest):
    cleaned_text = TextCleaner.clean(request.text)
    cleaned_headline = TextCleaner.clean(request.headline or "")
    
    if not cleaned_text and not cleaned_headline:
        raise HTTPException(status_code=400, detail="Please provide headline or article content.")

    full_content = f"{cleaned_headline} {cleaned_text}".strip()

    # 1. Language detection
    lang_info = MultilingualEngine.detect_language(full_content)
    is_tamil = lang_info["is_tamil"]

    # 2. Claim extraction (Tamil or English)
    if is_tamil:
        claims = MultilingualEngine.extract_tamil_claims(cleaned_text or cleaned_headline)
    else:
        claims = ClaimExtractor.extract_claims(cleaned_text or cleaned_headline)

    # 3. Linguistic analysis
    linguistic = LinguisticAnalyzer.analyze(cleaned_text, cleaned_headline)
    
    # 4. Sentiment & Emotion
    sentiment = SentimentAnalyzer.analyze(cleaned_text or cleaned_headline)
    
    # 5. Clickbait detection
    clickbait = ClickbaitDetector.analyze_headline(cleaned_headline)
    
    # 6. Source credibility
    source_cred = SourceEvaluator.evaluate_url_or_domain(request.source_url or "")
    
    # 7. ML Model prediction
    ml_result = predictor.predict(cleaned_text, cleaned_headline)
    
    # 8. Key topics/keywords
    keywords = TextCleaner.extract_keywords(full_content)

    # 9. Similar claims retrieval against verified fact-checks
    primary_query = cleaned_headline if cleaned_headline else (claims[0]["claim"] if claims else cleaned_text[:200])
    similar_claims = similar_engine.find_similar(primary_query, top_k=4)

    # 10. Combine suspicious indicators
    indicators = list(linguistic.get("indicators", []))
    if clickbait.get("is_clickbait"):
        indicators.extend(clickbait.get("reasons", []))
    if source_cred.get("credibility_score", 0.5) < 0.4:
        indicators.append(f"Domain '{source_cred.get('domain')}' has a low historical credibility rating.")

    # 11. Epistemic Calibrated Outcome Category & XAI
    prob_real = ml_result.get("probability_real", 0.5)
    
    # Check if high-similarity verified fact-checks exist
    has_contradicting_match = any(m["stance"] == "CONTRADICTS" and m["similarity_score"] >= 0.55 for m in similar_claims)
    has_supporting_match = any(m["stance"] == "SUPPORTS" and m["similarity_score"] >= 0.55 for m in similar_claims)
    has_context_match = any(m["stance"] == "CONTEXT" and m["similarity_score"] >= 0.50 for m in similar_claims)

    if has_contradicting_match or (prob_real < 0.30 and len(indicators) >= 2):
        outcome_category = "Conflicting evidence found"
        uncertainty_score = 15
    elif has_supporting_match or (prob_real >= 0.75 and len(indicators) == 0):
        outcome_category = "Supporting evidence found"
        uncertainty_score = 15
    elif has_context_match or clickbait.get("is_clickbait"):
        outcome_category = "Context required"
        uncertainty_score = 35
    elif len(claims) == 0 or len(full_content.split()) < 10:
        outcome_category = "Unable to verify"
        uncertainty_score = 65
    else:
        outcome_category = "Insufficient evidence"
        uncertainty_score = 50

    localized_outcome = MultilingualEngine.get_localized_outcome(outcome_category) if is_tamil else outcome_category

    # Explainable AI (XAI) feature attributions
    xai_features = {
        "sensational_cues_found": [ind for ind in indicators if "sensational" in ind.lower() or "clickbait" in ind.lower()],
        "linguistic_score": linguistic.get("linguistic_credibility_score", 0.5),
        "epistemic_uncertainty": uncertainty_score,
        "why_verification_needed": (
            "Claim asserts extraordinary phenomena without primary institutional corroboration."
            if outcome_category == "Conflicting evidence found" else
            ("Claim lacks sufficient published independent reporting." if outcome_category == "Insufficient evidence" else
             "Claim omits crucial context or timeline nuances.")
        ),
        "limitations": [
            "ML model evaluated lexical and stylistic markers; external domain context must be corroborated.",
            "Semantic similarity does not constitute mathematical proof of claim falsity."
        ] + (MultilingualEngine.get_tamil_nlp_limitations() if is_tamil else [])
    }

    return {
        "success": True,
        "platform": "TruthLens AI",
        "input_summary": {
            "headline": cleaned_headline,
            "word_count": len(cleaned_text.split()),
            "keywords": keywords,
            "detected_language": lang_info["language"],
            "language_details": lang_info
        },
        "outcome_category": outcome_category,
        "localized_outcome": localized_outcome,
        "claims": claims,
        "similar_claims": similar_claims,
        "linguistic_analysis": linguistic,
        "sentiment_analysis": sentiment,
        "clickbait_analysis": clickbait,
        "source_credibility": source_cred,
        "ml_prediction": ml_result,
        "suspicious_indicators": indicators,
        "xai_explanation": xai_features
    }

@app.post("/analyze/claims")
def analyze_claims_only(request: ClaimAnalysisRequest):
    cleaned = TextCleaner.clean(request.text)
    lang_info = MultilingualEngine.detect_language(cleaned)
    if lang_info["is_tamil"]:
        claims = MultilingualEngine.extract_tamil_claims(cleaned)
    else:
        claims = ClaimExtractor.extract_claims(cleaned)
    return {
        "success": True,
        "detected_language": lang_info["language"],
        "claims": claims
    }

@app.post("/analyze/image")
async def analyze_image(file: UploadFile = File(...), headline: Optional[str] = Form("")):
    contents = await file.read()
    ocr_result = OCREngine.extract_text_from_image(contents)
    
    if not ocr_result.get("success") or not ocr_result.get("text"):
        raise HTTPException(status_code=400, detail="Could not extract readable text from the provided image.")
        
    extracted_text = ocr_result["text"]
    analysis = analyze_text(TextAnalysisRequest(headline=headline or "", text=extracted_text, source_url=""))
    analysis["ocr_details"] = ocr_result
    return analysis

@app.post("/analyze/pdf")
async def analyze_pdf(file: UploadFile = File(...), headline: Optional[str] = Form("")):
    contents = await file.read()
    pdf_result = OCREngine.extract_text_from_pdf(contents)
    
    if not pdf_result.get("success") or not pdf_result.get("text"):
        raise HTTPException(status_code=400, detail="Could not extract readable text from PDF document.")
        
    extracted_text = pdf_result["text"]
    analysis = analyze_text(TextAnalysisRequest(headline=headline or "", text=extracted_text, source_url=""))
    analysis["pdf_details"] = pdf_result
    return analysis

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
