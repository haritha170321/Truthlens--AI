import re

class SentimentAnalyzer:
    POSITIVE_WORDS = {
        "good", "great", "excellent", "breakthrough", "success", "innovative",
        "beneficial", "positive", "progress", "growth", "approved", "landmark",
        "cure", "advance", "solution", "reliable", "promising", "historic"
    }

    NEGATIVE_WORDS = {
        "bad", "terrible", "crisis", "disaster", "danger", "fraud", "scam",
        "corrupt", "failure", "threat", "destroy", "lethal", "toxic", "panic",
        "furious", "outrage", "collapse", "fake", "deception", "alarming"
    }

    @classmethod
    def analyze(cls, text: str) -> dict:
        if not text:
            return {
                "sentiment": "neutral",
                "polarity": 0.0,
                "subjectivity": 0.0,
                "emotion": "neutral",
                "tone": "objective"
            }

        words = [w.lower() for w in re.findall(r'\b[a-zA-Z]+\b', text)]
        total = max(1, len(words))

        pos_count = sum(1 for w in words if w in cls.POSITIVE_WORDS)
        neg_count = sum(1 for w in words if w in cls.NEGATIVE_WORDS)

        # Polarity between -1.0 (very negative) and +1.0 (very positive)
        net_sentiment = (pos_count - neg_count) / max(1, (pos_count + neg_count)) if (pos_count + neg_count) > 0 else 0.0
        
        # Subjectivity between 0 (strictly factual/neutral) and 1.0 (highly subjective/opinionated)
        emotional_density = (pos_count + neg_count) / total
        subjectivity = min(1.0, emotional_density * 8.0)

        sentiment_label = "neutral"
        if net_sentiment > 0.2:
            sentiment_label = "positive"
        elif net_sentiment < -0.2:
            sentiment_label = "negative"

        emotion = "neutral"
        if neg_count > pos_count and neg_count >= 2:
            emotion = "alarmist / high anxiety"
        elif pos_count > neg_count and pos_count >= 2:
            emotion = "hyperbolic optimism / excitement"

        tone = "objective"
        if subjectivity > 0.45:
            tone = "sensational / emotive"
        elif subjectivity > 0.25:
            tone = "opinion-leaning"

        return {
            "sentiment": sentiment_label,
            "polarity": round(net_sentiment, 3),
            "subjectivity": round(subjectivity, 3),
            "emotion": emotion,
            "tone": tone
        }
