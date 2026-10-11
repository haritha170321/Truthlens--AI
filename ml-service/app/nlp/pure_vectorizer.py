import re
import math
from collections import Counter, defaultdict

class PureTfidfVectorizer:
    """
    Pure Python TF-IDF Vectorizer and Cosine Similarity Engine.
    Requires zero external C-extension DLLs, perfectly portable across all platforms,
    and supports both Latin and Tamil (தமிழ்) scripts.
    """
    def __init__(self, ngram_range=(1, 2), min_df=1, max_features=5000):
        self.ngram_range = ngram_range
        self.min_df = min_df
        self.max_features = max_features
        self.vocabulary_ = {}
        self.idf_ = {}
        self.token_pattern = re.compile(r'(?u)\b[\w\u0B80-\u0BFF]{2,}\b')

    def _tokenize(self, text: str) -> list[str]:
        if not text or not isinstance(text, str):
            return []
        raw_tokens = self.token_pattern.findall(text.lower())
        tokens = []
        min_n, max_n = self.ngram_range
        # Generate n-grams
        for n in range(min_n, max_n + 1):
            for i in range(len(raw_tokens) - n + 1):
                tokens.append(" ".join(raw_tokens[i:i + n]))
        return tokens

    def fit(self, documents: list[str]):
        n_docs = len(documents)
        df_counter = Counter()
        
        # Count document frequencies
        for doc in documents:
            tokens = set(self._tokenize(doc))
            for tok in tokens:
                df_counter[tok] += 1

        # Filter by min_df and select top max_features
        valid_terms = [(tok, count) for tok, count in df_counter.items() if count >= self.min_df]
        valid_terms.sort(key=lambda x: x[1], reverse=True)
        top_terms = valid_terms[:self.max_features]

        self.vocabulary_ = {term: idx for idx, (term, _) in enumerate(top_terms)}
        
        # Calculate standard smoothed IDF: log((1 + n_docs) / (1 + df)) + 1
        self.idf_ = {}
        for term, df in top_terms:
            self.idf_[term] = math.log((1.0 + n_docs) / (1.0 + df)) + 1.0
        return self

    def transform_single(self, document: str) -> dict[str, float]:
        """
        Transforms a single text document into a sparse L2-normalized TF-IDF vector (dict).
        """
        tokens = self._tokenize(document)
        tf_counter = Counter(tokens)
        vec = {}
        sum_sq = 0.0

        for term, count in tf_counter.items():
            if term in self.vocabulary_:
                # Sublinear term frequency scaling: 1 + log(tf)
                tf = 1.0 + math.log(count)
                tfidf = tf * self.idf_[term]
                vec[term] = tfidf
                sum_sq += tfidf * tfidf

        # L2 Unit Normalization
        norm = math.sqrt(sum_sq)
        if norm > 0.0:
            for term in vec:
                vec[term] /= norm
        return vec

    def transform(self, documents: list[str]) -> list[dict[str, float]]:
        return [self.transform_single(doc) for doc in documents]

    def fit_transform(self, documents: list[str]) -> list[dict[str, float]]:
        self.fit(documents)
        return self.transform(documents)

    @staticmethod
    def cosine_similarity_vectors(vec1: dict[str, float], vec2: dict[str, float]) -> float:
        """
        Computes cosine similarity between two L2-normalized sparse vector dictionaries.
        Since both vectors are already L2-normalized, cosine similarity is simply the dot product.
        """
        if not vec1 or not vec2:
            return 0.0
        # Dot product on intersecting keys
        common_terms = set(vec1.keys()) & set(vec2.keys())
        dot = sum(vec1[t] * vec2[t] for t in common_terms)
        return max(0.0, min(1.0, float(dot)))


class PureNaiveBayesClassifier:
    """
    Pure Python Multinomial Naive Bayes Classifier for explainable text categorization.
    Computes class priors, smoothed feature likelihoods, and posterior probabilities.
    """
    def __init__(self, alpha=1.0):
        self.alpha = alpha
        self.classes_ = [0, 1]  # 0: Fake/Misleading, 1: Real/Verified
        self.class_priors_ = {}
        self.feature_log_probs_ = {}
        self.vocab_ = set()

    def fit(self, tokenized_docs: list[list[str]], labels: list[int]):
        n_samples = len(labels)
        label_counts = Counter(labels)
        self.class_priors_ = {c: math.log(label_counts.get(c, 1) / n_samples) for c in self.classes_}

        class_word_counts = {0: Counter(), 1: Counter()}
        total_class_words = {0: 0, 1: 0}

        for tokens, lbl in zip(tokenized_docs, labels):
            for t in tokens:
                class_word_counts[lbl][t] += 1
                total_class_words[lbl] += 1
                self.vocab_.add(t)

        vocab_size = max(1, len(self.vocab_))
        self.feature_log_probs_ = {0: {}, 1: {}}

        for c in self.classes_:
            denominator = total_class_words[c] + (self.alpha * vocab_size)
            for word in self.vocab_:
                count = class_word_counts[c][word]
                prob = (count + self.alpha) / denominator
                self.feature_log_probs_[c][word] = math.log(prob)

        return self

    def predict_proba(self, tokens: list[str]) -> tuple[float, float]:
        """
        Returns (prob_fake, prob_real) normalized via softmax.
        """
        log_posts = {}
        for c in self.classes_:
            log_p = self.class_priors_.get(c, -0.693)
            for t in tokens:
                if t in self.feature_log_probs_[c]:
                    log_p += self.feature_log_probs_[c][t]
            log_posts[c] = log_p

        # Softmax normalization
        max_log = max(log_posts.values())
        exp_0 = math.exp(log_posts[0] - max_log)
        exp_1 = math.exp(log_posts[1] - max_log)
        sum_exp = exp_0 + exp_1

        prob_fake = exp_0 / sum_exp
        prob_real = exp_1 / sum_exp
        return float(prob_fake), float(prob_real)
