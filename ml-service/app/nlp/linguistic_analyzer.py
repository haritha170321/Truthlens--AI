import re

class LinguisticAnalyzer:
    SENSATIONAL_WORDS = {
        "shocking", "unbelievable", "mind-blowing", "miracle", "furious",
        "conspiracy", "exposed", "banned", "secret", "hidden", "apocalypse",
        "catastrophe", "bombshell", "jaw-dropping", "must-see", "insane",
        "terrifying", "destroyed", "nightmare", "cures all", "big pharma",
        "whistleblower", "hoax", "truth revealed", "they don't want you to know"
    }

    SUBJECTIVE_WORDS = {
        "obviously", "clearly", "undeniably", "evil", "disgraceful",
        "corrupt", "idiotic", "genius", "pure", "flawless", "monstrous"
    }

    @classmethod
    def analyze(cls, text: str, headline: str = "") -> dict:
        combined = f"{headline} {text}".strip()
        if not combined:
            return {
                "sensationalism_score": 0.0,
                "urgency_score": 0.0,
                "all_caps_ratio": 0.0,
                "excessive_punctuation": False,
                "detected_patterns": [],
                "manipulative_phrases": [],
                "linguistic_credibility_score": 0.5
            }

        words = re.findall(r'\b[a-zA-Z]+\b', combined)
        total_words = max(1, len(words))

        # Detect sensational words
        found_sensational = [w.lower() for w in words if w.lower() in cls.SENSATIONAL_WORDS]
        
        # Check all caps words (length >= 3)
        all_caps_words = [w for w in words if len(w) >= 3 and w.isupper()]
        all_caps_ratio = len(all_caps_words) / total_words

        # Check excessive punctuation (!!!, ???, !?, ...)
        excessive_punct_matches = re.findall(r'[!?]{2,}|\.{4,}', combined)
        excessive_punctuation = len(excessive_punct_matches) > 0

        # Detect manipulative / urgency patterns
        urgency_patterns = [
            r'\b(before it\'s deleted|share immediately|urgent|act now|hurry|vital warning)\b',
            r'\b(doctors are (?:furious|speechless|stunned))\b',
            r'\b(what they are hiding from you|the government doesn\'t want you to)\b',
            r'\b(100% cure|reverses aging|instant miracle)\b'
        ]

        detected_patterns = []
        for pat in urgency_patterns:
            matches = re.findall(pat, combined, re.IGNORECASE)
            if matches:
                detected_patterns.extend(matches)

        sensationalism_score = min(1.0, (len(found_sensational) * 0.15) + (all_caps_ratio * 1.5) + (0.2 if excessive_punctuation else 0.0))
        urgency_score = min(1.0, len(detected_patterns) * 0.3)

        # Suspicious Indicators list
        indicators = []
        if len(found_sensational) >= 2:
            indicators.append(f"Contains {len(found_sensational)} sensational or hyperbolic terms")
        if all_caps_ratio > 0.08:
            indicators.append("Unusually high proportion of ALL-CAPS words (emotional shouting)")
        if excessive_punctuation:
            indicators.append("Uses non-standard excessive punctuation (e.g., '!!!', '???')")
        if detected_patterns:
            indicators.append("Detects manipulative urgency triggers (e.g. 'before it gets deleted')")

        # Linguistic Credibility Score (1.0 = highly professional & neutral, 0.0 = highly manipulative)
        linguistic_credibility = max(0.05, min(0.98, 1.0 - (sensationalism_score * 0.5 + urgency_score * 0.4)))

        return {
            "sensationalism_score": round(sensationalism_score, 3),
            "urgency_score": round(urgency_score, 3),
            "all_caps_ratio": round(all_caps_ratio, 3),
            "excessive_punctuation": excessive_punctuation,
            "detected_patterns": list(set(detected_patterns)),
            "manipulative_phrases": list(set(found_sensational)),
            "indicators": indicators,
            "linguistic_credibility_score": round(linguistic_credibility, 3)
        }
