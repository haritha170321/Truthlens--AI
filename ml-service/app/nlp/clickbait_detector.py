import re

class ClickbaitDetector:
    CLICKBAIT_HEADLINE_PATTERNS = [
        r'^(you won\'t believe|this one trick|what happens next|doctors hate him|shocking truth)',
        r'\b(will blow your mind|jaw dropping|left speechless|changed everything)\b',
        r'\b(reason why|reasons why)\b',
        r'\b(is this the end of|why you need to)\b',
        r'^\d+\s+(things|ways|secrets|reasons|hacks|foods)\s+',
        r'\?{2,}|\!{2,}'
    ]

    @classmethod
    def analyze_headline(cls, headline: str) -> dict:
        if not headline:
            return {
                "is_clickbait": False,
                "clickbait_score": 0.0,
                "reasons": []
            }

        reasons = []
        score = 0.0

        for pattern in cls.CLICKBAIT_HEADLINE_PATTERNS:
            if re.search(pattern, headline, re.IGNORECASE):
                score += 0.35
                reasons.append("Contains classic curiosity gap or sensational hook phrasing")

        # Number listicle test
        if re.search(r'^\d+\s+\w+', headline.strip()):
            score += 0.2
            reasons.append("Listicle format commonly utilized for engagement farming")

        # Shouting or question mark hook
        if headline.endswith('?') and score > 0:
            score += 0.15
            reasons.append("Speculative question-framed headline to bypass factual liability")

        clickbait_score = min(1.0, score)
        return {
            "is_clickbait": clickbait_score >= 0.5,
            "clickbait_score": round(clickbait_score, 3),
            "reasons": list(set(reasons))
        }
