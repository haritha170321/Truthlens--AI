import re

class ClaimExtractor:
    @staticmethod
    def extract_claims(text: str, max_claims: int = 5) -> list[dict]:
        """
        Extracts factual claims from text using rule-based and linguistic patterns.
        Identifies statements with numbers, dates, organizations, verbs of assertion, and causal claims.
        """
        if not text:
            return []

        # Split into candidate sentences
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        claims = []

        # Patterns indicative of factual claims
        claim_patterns = [
            r'\b(\d+(?:\.\d+)?%?|\$\d+|\d+\s*(?:billion|million|trillion|thousand|years|percent|people|cases))\b',
            r'\b(confirmed|discovered|announced|proved|cures|admits|admitted|leaked|revealed|reported|found that|stated that|warned that|banned|approved)\b',
            r'\b(in 20\d\d|in 19\d\d|yesterday|last week|recently|this month)\b',
            r'\b(NASA|WHO|UN|FBI|CIA|CDC|White House|Pentagon|Government|Federal Reserve|Ministry|Scientists|Researchers|Doctors)\b'
        ]

        for sentence in sentences:
            sentence_clean = sentence.strip()
            if len(sentence_clean) < 20 or len(sentence_clean) > 300:
                continue

            match_count = sum(1 for pattern in claim_patterns if re.search(pattern, sentence_clean, re.IGNORECASE))
            
            # If strong factual or assertion signals are detected
            if match_count >= 1:
                # Assess verifiable type
                claim_type = "Factual Assertion"
                if re.search(r'\b(cures|dissolves|miracle|secret|aliens|shapeshifter|microchip)\b', sentence_clean, re.IGNORECASE):
                    claim_type = "High-Risk Extraordinary Claim"
                elif re.search(r'\b(\d+%|\$\d+|\d+\s*(?:billion|million|thousand))\b', sentence_clean, re.IGNORECASE):
                    claim_type = "Statistical / Quantitative Claim"
                elif re.search(r'\b(NASA|WHO|UN|FDA|CDC|Government|President|Minister)\b', sentence_clean, re.IGNORECASE):
                    claim_type = "Official Institutional Attribution"

                claims.append({
                    "claim": sentence_clean,
                    "type": claim_type,
                    "confidence": min(0.95, 0.65 + (match_count * 0.1)),
                    "requires_cross_verification": True
                })

            if len(claims) >= max_claims:
                break

        # Fallback if no specific pattern matched
        if not claims and sentences:
            claims.append({
                "claim": sentences[0].strip(),
                "type": "Primary Central Claim",
                "confidence": 0.70,
                "requires_cross_verification": True
            })

        return claims
