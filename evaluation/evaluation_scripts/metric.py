import nltk
nltk.download('punkt')

from collections import Counter
from nltk import word_tokenize
from nltk.util import ngrams
import numpy as np
from sentence_transformers import SentenceTransformer
import numpy as np
from sentence_transformers import SentenceTransformer
import numpy as np
from nltk import ngrams, word_tokenize


def has_exact_match(ground_truths, candidates):
    for ground_truth in ground_truths:
        if ground_truth in candidates:
            return True
    return False

def compute_rouge_n(predicted_text, ground_truth, n=1):
    """
    Computes ROUGE-N score (n-grams overlap) for given predicted text and ground truth. n specifies the n-gram overlap.
    """
    pred_tokens = word_tokenize(predicted_text)
    ref_tokens = word_tokenize(ground_truth)
    
    pred_ngrams = list(ngrams(pred_tokens, n))
    ref_ngrams = list(ngrams(ref_tokens, n))

    pred_counter = Counter(pred_ngrams)
    ref_counter = Counter(ref_ngrams)

    overlap = sum((min(pred_counter[gram], ref_counter[gram]) for gram in pred_counter))

    precision = overlap / max(1, len(pred_ngrams))
    recall = overlap / max(1, len(ref_ngrams))
    f1 = 2 * precision * recall / max(1e-9, (precision + recall))

    return {
        "precision": precision,
        "recall": recall,
        "f1_score": f1
    }

def compute_rouge_n_embed(sent1, sent2, n=1, model_name="all-MiniLM-L6-v2"):
    """
    Compute ROUGE-N score between two sentences using sentence-transformers embeddings.

    Args:
    - sent1 (str): First sentence.
    - sent2 (str): Second sentence.
    - n (int): N-gram size, default is 1 (ROUGE-1).
    - model_name (str): Sentence-Transformers model name (default: "all-MiniLM-L6-v2").

    Returns:
    - dict: ROUGE-N score (precision, recall, f1).
    """
    # Load the Sentence-Transformers model
    model = SentenceTransformer(model_name)

    def get_ngrams(sentence, n):
        """
        Extract n-grams from a sentence.
        """
        tokens = word_tokenize(sentence.lower())
        return [" ".join(ng) for ng in ngrams(tokens, n)]

    def compute_similarity(ngrams1, ngrams2):
        """
        Compute the number of matching n-grams based on embedding similarity.
        """
        if not ngrams1 or not ngrams2:
            return 0

        # Generate embeddings for each n-gram
        embeddings1 = model.encode(ngrams1, convert_to_tensor=True)
        embeddings2 = model.encode(ngrams2, convert_to_tensor=True)

        # Compute cosine similarity between each pair
        cosine_similarities = np.inner(embeddings1.cpu().detach().numpy(), embeddings2.cpu().detach().numpy())

        # Count matches based on a similarity threshold
        match_threshold = 0.8  # Adjust this threshold as needed
        matches = sum((cosine_similarities.max(axis=1) > match_threshold))

        return matches

    # Get n-grams for both sentences
    ngrams1 = get_ngrams(sent1, n)
    ngrams2 = get_ngrams(sent2, n)

    # Compute the number of matching n-grams
    matches = compute_similarity(ngrams1, ngrams2)

    # Calculate Precision, Recall, and F1
    precision = matches / len(ngrams1) if ngrams1 else 0
    recall = matches / len(ngrams2) if ngrams2 else 0

    if precision + recall == 0:
        return {"precision": 0.0, "recall": 0.0, "f1": 0.0}

    rouge_f1 = 2 * (precision * recall) / (precision + recall)

    return {"precision": precision, "recall": recall, "f1_score": rouge_f1}