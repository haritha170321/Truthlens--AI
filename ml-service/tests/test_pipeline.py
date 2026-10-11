import pytest
from fastapi.testclient import TestClient

from app.preprocessing.text_cleaner import TextCleaner
from app.nlp.claim_extractor import ClaimExtractor
from app.nlp.similar_claims_engine import SimilarClaimsEngine
from app.nlp.multilingual_engine import MultilingualEngine
from app.inference.predictor import NewsPredictor
from app.main import app

client = TestClient(app)

def test_text_cleaner():
    raw_text = "Breaking News! Visit https://example.com/fake &amp; test &#39;quotes&#39; now!"
    cleaned = TextCleaner.clean(raw_text)
    assert "https://" not in cleaned
    assert "example.com" not in cleaned
    assert "&amp;" not in cleaned
    assert "quotes" in cleaned

def test_text_cleaner_keywords():
    text = "The James Webb Space Telescope detected ancient galaxy formations in deep space."
    keywords = TextCleaner.extract_keywords(text)
    assert isinstance(keywords, list)
    assert len(keywords) > 0
    assert any(k in ["telescope", "galaxy", "ancient", "space", "formations"] for k in keywords)

def test_claim_extractor():
    text = "WHO confirmed 154 million lives saved by childhood vaccines over the past 50 years."
    claims = ClaimExtractor.extract_claims(text)
    assert len(claims) >= 1
    assert "WHO" in claims[0]["claim"] or "vaccines" in claims[0]["claim"]
    assert claims[0]["confidence"] > 0.5
    assert claims[0]["requires_cross_verification"] is True

def test_similar_claims_engine():
    engine = SimilarClaimsEngine()
    # Query for lemon juice baking soda cancer myth
    query = "Drinking lemon juice with baking soda dissolves cancer cells in 8 hours"
    results = engine.find_similar(query, top_k=3, threshold=0.20)
    
    assert len(results) > 0
    top = results[0]
    assert top["similarity_score"] > 0.30
    assert top["stance"] in ["SUPPORTS", "CONTRADICTS", "CONTEXT"]
    assert top["url"].startswith("http")
    assert "Semantic similarity indicates linguistic closeness" in top["disclaimer"]

def test_multilingual_detection():
    en_text = "NASA scientists published new peer-reviewed findings regarding cosmic exoplanets."
    ta_text = "விண்வெளி ஆய்வு மையம் புதிய விண்மீன் மண்டலத்தை கண்டறிந்தது."
    
    en_res = MultilingualEngine.detect_language(en_text)
    assert en_res["language"] == "en"
    assert en_res["is_tamil"] is False
    
    ta_res = MultilingualEngine.detect_language(ta_text)
    assert ta_res["language"] == "ta"
    assert ta_res["is_tamil"] is True
    assert ta_res["tamil_ratio"] > 0.3

def test_multilingual_tamil_claim_extraction():
    ta_text = "தேன் மற்றும் சுடுதண்ணீர் குடித்தால் அனைத்து நோய்களும் குணமாகும் என்று மருத்துவர்கள் தெரிவித்துள்ளனர்."
    claims = MultilingualEngine.extract_tamil_claims(ta_text)
    assert len(claims) >= 1
    assert claims[0]["language"] == "ta"

def test_news_predictor():
    predictor = NewsPredictor()
    pred = predictor.predict("NASA James Webb telescope confirmed ancient cosmic redshift observations.")
    assert "prediction" in pred
    assert 0.0 <= pred["probability_real"] <= 1.0
    assert 0.0 <= pred["probability_fake"] <= 1.0

def test_api_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "TruthLens" in data["service"]

def test_api_methodology_endpoint():
    response = client.get("/methodology/info")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "TruthLens AI"
    assert "outcome_categories" in data
    assert len(data["outcome_categories"]) == 5

def test_api_analyze_text():
    payload = {
        "headline": "Secret Lab Admits Birds Are Solar Drones",
        "text": "An anonymous whistleblower claimed pigeons were replaced with solar cameras in 1986."
    }
    response = client.post("/analyze/text", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "outcome_category" in data
    assert data["outcome_category"] in [
        "Supporting evidence found",
        "Conflicting evidence found",
        "Insufficient evidence",
        "Context required",
        "Unable to verify"
    ]
    assert "similar_claims" in data
    assert "xai_explanation" in data

def test_api_similar_claims():
    payload = {"claim": "Moon is hollow titanium alien satellite", "top_k": 2}
    response = client.post("/claims/similar", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["similar_claims"], list)
