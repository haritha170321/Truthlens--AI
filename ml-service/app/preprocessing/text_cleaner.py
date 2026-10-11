import re
import html
import unicodedata

class TextCleaner:
    @staticmethod
    def clean(text: str) -> str:
        if not text or not isinstance(text, str):
            return ""
        
        # Decode HTML entities
        cleaned = html.unescape(text)
        
        # Normalize unicode characters
        cleaned = unicodedata.normalize('NFKD', cleaned)
        
        # Remove URLs
        cleaned = re.sub(r'https?://\S+|www\.\S+', ' ', cleaned)
        
        # Remove email addresses
        cleaned = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', ' ', cleaned)
        
        # Remove extra whitespace and newlines
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        
        return cleaned

    @staticmethod
    def extract_keywords(text: str, max_keywords: int = 8) -> list[str]:
        cleaned = TextCleaner.clean(text).lower()
        # Common English stop words
        stopwords = {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
            "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
            "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
            "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
            "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
            "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
            "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
            "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
            "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
            "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
            "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
            "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
            "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
            "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
            "they've", "this", "those", "through", "to", "too", "under", "until", "up",
            "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
            "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
            "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
            "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
            "yourself", "yourselves", "news", "report", "said", "says", "according", "new", "also"
        }
        
        words = re.findall(r'\b[a-zA-Z]{3,}\b', cleaned)
        filtered = [w for w in words if w not in stopwords]
        
        # Word frequencies
        freq = {}
        for w in filtered:
            freq[w] = freq.get(w, 0) + 1
            
        sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        return [w[0] for w in sorted_words[:max_keywords]]
