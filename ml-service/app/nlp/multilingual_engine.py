import re
import unicodedata

class MultilingualEngine:
    """
    Multilingual NLP engine supporting English and Tamil (தமிழ்) claim processing,
    script detection, morphological tokenization, and cross-lingual stance mapping.
    """

    TAMIL_UNICODE_RANGE = r'[\u0B80-\u0BFF]'
    
    TAMIL_STOPWORDS = {
        "மற்றும்", "அல்லது", "ஆனால்", "என்று", "என", "இந்த", "அந்த", "அவர்", 
        "அவர்கள்", "ஒரு", "அதை", "இதில்", "அதன்", "மேலும்", "செய்தி", "கூறியது", 
        "தெரிவித்தது", "உள்ளது", "இருந்தது", "ஆகும்", "ஆகிய", "பற்றி", "மீது", 
        "எனவே", "இருந்து", "செய்து", "வந்த", "என்ற", "கூறி", "சொன்னார்", "இருப்பினும்"
    }

    TAMIL_ASSERTION_KEYWORDS = [
        "உறுதிப்படுத்தப்பட்டுள்ளது",  # Confirmed
        "கண்டுபிடிக்கப்பட்டுள்ளது",  # Discovered
        "அறிவித்துள்ளது",            # Announced
        "தெரிவித்துள்ளது",            # Reported
        "எச்சரிக்கை",                 # Warning
        "ஆராய்ச்சி",                  # Research
        "ஆய்வு",                      # Study
        "அரசு",                      # Government
        "மருத்துவர்கள்",              # Doctors
        "விஞ்ஞானிகள்",                # Scientists
        "குணமாகும்",                  # Cures
        "தடை",                       # Banned
        "நீதிமன்றம்"                 # Court
    ]

    TAMIL_OUTCOME_TRANSLATIONS = {
        "Supporting evidence found": "ஆதரிக்கும் சான்றுகள் கண்டறியப்பட்டன",
        "Conflicting evidence found": "முரண்பாடான சான்றுகள் கண்டறியப்பட்டன",
        "Insufficient evidence": "போதுமான சான்றுகள் இல்லை",
        "Context required": "கூடுதல் சூழல் தேவைப்படுகிறது",
        "Unable to verify": "சரிபார்க்க இயலவில்லை"
    }

    @staticmethod
    def detect_language(text: str) -> dict:
        """
        Detects primary language of text: English ('en'), Tamil ('ta'), or Code-Mixed ('mixed').
        Calculates script character distribution.
        """
        if not text or not text.strip():
            return {"language": "en", "is_tamil": False, "confidence": 1.0, "distribution": {"en": 1.0, "ta": 0.0}}

        total_chars = len([c for c in text if not c.isspace()])
        if total_chars == 0:
            return {"language": "en", "is_tamil": False, "confidence": 1.0, "distribution": {"en": 1.0, "ta": 0.0}}

        tamil_chars = len(re.findall(MultilingualEngine.TAMIL_UNICODE_RANGE, text))
        tamil_ratio = tamil_chars / total_chars

        if tamil_ratio >= 0.30:
            primary_lang = "ta"
            is_tamil = True
            confidence = min(0.99, 0.60 + (tamil_ratio * 0.40))
        elif tamil_ratio >= 0.05:
            primary_lang = "mixed"
            is_tamil = True
            confidence = 0.75
        else:
            primary_lang = "en"
            is_tamil = False
            confidence = 0.95

        return {
            "language": primary_lang,
            "is_tamil": is_tamil,
            "tamil_ratio": round(tamil_ratio, 3),
            "confidence": round(confidence, 2),
            "distribution": {
                "en": round(1.0 - tamil_ratio, 2),
                "ta": round(tamil_ratio, 2)
            }
        }

    @staticmethod
    def extract_tamil_claims(text: str, max_claims: int = 5) -> list[dict]:
        """
        Extracts factual claims from Tamil text using morphological assertion heuristics.
        """
        if not text:
            return []

        # Sentence split on punctuation
        sentences = re.split(r'[.!?|\n]+', text.strip())
        claims = []

        for sent in sentences:
            sent_clean = sent.strip()
            if len(sent_clean) < 15 or len(sent_clean) > 350:
                continue

            matches = sum(1 for kw in MultilingualEngine.TAMIL_ASSERTION_KEYWORDS if kw in sent_clean)
            has_numbers = bool(re.search(r'\d+', sent_clean))

            if matches >= 1 or has_numbers:
                claim_type = "உண்மை தகவல் கூற்று (Factual Assertion)"
                if "குணமாகும்" in sent_clean or "அதிசயம்" in sent_clean:
                    claim_type = "மருத்துவ/ஆதாரமற்ற கூற்று (Extraordinary Medical Claim)"
                elif "அரசு" in sent_clean or "அறிவித்துள்ளது" in sent_clean:
                    claim_type = "அரசு/அதிகாரப்பூர்வ அறிவிப்பு (Official Attribution)"

                claims.append({
                    "claim": sent_clean,
                    "type": claim_type,
                    "confidence": min(0.92, 0.65 + (matches * 0.1) + (0.1 if has_numbers else 0)),
                    "language": "ta",
                    "requires_cross_verification": True
                })

            if len(claims) >= max_claims:
                break

        if not claims and sentences and sentences[0].strip():
            claims.append({
                "claim": sentences[0].strip(),
                "type": "முக்கிய கூற்று (Primary Claim)",
                "confidence": 0.70,
                "language": "ta",
                "requires_cross_verification": True
            })

        return claims

    @staticmethod
    def get_localized_outcome(outcome_en: str) -> str:
        return MultilingualEngine.TAMIL_OUTCOME_TRANSLATIONS.get(outcome_en, outcome_en)

    @staticmethod
    def get_tamil_nlp_limitations() -> list[str]:
        return [
            "Tamil agglutinative morphology: Words combine root nouns with case markers, which can reduce simple n-gram overlap.",
            "Absence of large-scale offline Tamil fact-checking models in lightweight local inference; system combines rule-based assertion mining with cross-lingual embeddings.",
            "Code-mixed (Tanglish / Tamil written in Latin script) inputs have lower syntactic parsing accuracy compared to pure Tamil unicode script."
        ]
