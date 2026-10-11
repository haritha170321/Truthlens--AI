import re
from urllib.parse import urlparse

class SourceEvaluator:
    # High-credibility known mainstream and scientific domains
    HIGH_CREDIBILITY_DOMAINS = {
        "reuters.com", "apnews.com", "bbc.com", "bbc.co.uk", "nature.com",
        "science.org", "nasa.gov", "who.int", "cdc.gov", "nih.gov",
        "theguardian.com", "nytimes.com", "washingtonpost.com", "wsj.com",
        "bloomberg.com", "aljazeera.com", "un.org", "economist.com",
        "ft.com", "scientificamerican.com", "pbs.org", "npr.org"
    }

    # Low credibility / satire / conspiracy / unvetted clickbait domains
    KNOWN_MISLEADING_DOMAINS = {
        "theonion.com", "babylonbee.com", "infowars.com", "worldnewsdailyreport.com",
        "beforeitsnews.com", "naturalnews.com", "newspunch.com", "yournewswire.com",
        "nationalreport.net", "empirenews.net", "huzlers.com"
    }

    @classmethod
    def evaluate_url_or_domain(cls, source_input: str) -> dict:
        if not source_input:
            return {
                "source_name": "Unknown / Direct Submission",
                "credibility_tier": "Limited Information",
                "credibility_score": 0.50,
                "is_https": False,
                "domain": None,
                "notes": "Direct text or manual submission without explicit verified web domain header."
            }

        domain = source_input.lower().strip()
        is_https = False

        if source_input.startswith("http://") or source_input.startswith("https://"):
            parsed = urlparse(source_input)
            domain = parsed.netloc.lower()
            is_https = parsed.scheme == "https"
            # Strip www.
            if domain.startswith("www."):
                domain = domain[4:]
        else:
            if domain.startswith("www."):
                domain = domain[4:]

        # Assess domain
        if any(h in domain for h in cls.HIGH_CREDIBILITY_DOMAINS):
            return {
                "source_name": domain,
                "credibility_tier": "High Credibility",
                "credibility_score": 0.92,
                "is_https": is_https,
                "domain": domain,
                "notes": "Established mainstream news or institutional scientific outlet with rigorous editorial oversight."
            }
        
        if any(m in domain for m in cls.KNOWN_MISLEADING_DOMAINS):
            return {
                "source_name": domain,
                "credibility_tier": "Low Credibility / Satire",
                "credibility_score": 0.15,
                "is_https": is_https,
                "domain": domain,
                "notes": "Domain recognized for satire, conspiracy theorizing, or frequent false claims."
            }

        # Educational / Gov top-level domains
        if domain.endswith(".edu") or domain.endswith(".gov") or domain.endswith(".mil"):
            return {
                "source_name": domain,
                "credibility_tier": "High Credibility (Institutional)",
                "credibility_score": 0.90,
                "is_https": is_https,
                "domain": domain,
                "notes": "Governmental or Academic institutional domain (.gov / .edu)."
            }

        # Neutral / unvetted domain
        return {
            "source_name": domain or "Independent Source",
            "credibility_tier": "Moderate / Unverified Outlet",
            "credibility_score": 0.60 if is_https else 0.45,
            "is_https": is_https,
            "domain": domain,
            "notes": "Domain active with HTTPS. Not listed in high-priority peer-reviewed indices, requires claim cross-referencing."
        }
