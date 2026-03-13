"""
Feedback Analyzer - NLP Module

Analyzes coach feedback on athlete videos using sentiment analysis.

Features:
- Bilingual support (Arabic + English)
- Sentiment analysis (positive/negative/neutral)
- Toxicity detection
- Summary statistics
"""

from transformers import pipeline
from langdetect import detect, LangDetectException
from typing import List, Dict
import warnings
warnings.filterwarnings('ignore')  # Ignores model loading warnings


class FeedbackAnalyzer:
    """
    Analyzes text feedback from coaches using NLP.
    
    This class handles:
    1. Language detection (Arabic vs English)
    2. Sentiment analysis for each feedback
    3. Overall sentiment calculation
    4. Toxicity detection
    """
    
    def __init__(self):
        """
        Initialize the analyzer with pre-trained models.
        
        Models loaded:
        - English sentiment: RoBERTa trained on Twitter data
        - Arabic sentiment: BERT trained on Arabic text
        - Toxicity: BERT trained to detect toxic content
        
        Note: First run will download models (~1.5 GB total)
        This takes 5-10 minutes
        """
        print("Initializing Feedback Analyzer...")
        print("Loading models (this may take a few minutes on first run)...\n")
        
        # ENGLISH SENTIMENT MODEL
        # Uses RoBERTa (Robustly Optimized BERT) trained on Twitter
        # Good at understanding casual/informal language like coach feedback
        print("Loading English sentiment model...")
        self.english_sentiment = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            max_length=512,
            truncation=True
        )
        print("English model loaded\n")
        
        # ARABIC SENTIMENT MODEL
        # Uses CAMeLBERT (BERT for Arabic) trained on mixed Arabic dialects
        # Handles both Modern Standard Arabic and dialectal text
        print("Loading Arabic sentiment model...")
        self.arabic_sentiment = pipeline(
            "sentiment-analysis",
            model="CAMeL-Lab/bert-base-arabic-camelbert-mix-sentiment",
            max_length=512,
            truncation=True
        )
        print("Arabic model loaded\n")
        
        # TOXICITY DETECTION MODEL
        # Detects inappropriate/toxic language in English
        # Helps flag unprofessional feedback
        print("Loading toxicity detection model...")
        self.toxicity_detector = pipeline(
            "text-classification",
            model="unitary/toxic-bert",
            max_length=512,
            truncation=True
        )
        print("Toxicity model loaded\n")
        
        print("All models ready\n")
    
    def _detect_language(self, text: str) -> str:
        """
        Detect if text is Arabic or English.
        Uses langdetect library which analyzes character patterns.
        
        Args:
            text: Feedback text to analyze
            
        Returns:
            'ar' for Arabic, 'en' for English, 'unknown' if can't detect
        """
        lang = detect(text)
            
        SUPPORTED_LANGUAGES = ['ar', 'en']

        if lang in SUPPORTED_LANGUAGES:
            return lang
        else:
            return 'en'
    
    def _analyze_single_feedback(self, text: str) -> Dict:
        """
        Analyze sentiment of a single feedback.
        
        Args:
            text: Single feedback text (max 500 chars)
            
        Returns:
            Dictionary with sentiment info:
            {
                'text': original text,
                'language': 'ar' or 'en',
                'sentiment': 'positive', 'neutral', or 'negative',
                'confidence': 0.0-1.0,
                'is_toxic': True/False
            }
        """
        # Step 1: Detect language
        language = self._detect_language(text)
        
        # Step 2: Choose correct sentiment model
        if language == 'ar':
            # Use Arabic model
            result = self.arabic_sentiment(text)[0] # The [0] is because we analyze one feedback at a time
        else:
            # Use English model
            result = self.english_sentiment(text)[0]
        
        # Step 3: Parse model output
        # Models return different label formats, normalize them
        label = result['label'].lower()
        
        # Mapping model labels to our standard format
        if 'pos' in label or label == 'positive':
            sentiment = 'positive'
        elif 'neg' in label or label == 'negative':
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        # Step 4: Check for toxicity (English only for now)
        is_toxic = False
        if language == 'en':
            try:
                toxicity_result = self.toxicity_detector(text)[0]
                # If model says "toxic" with high confidence
                is_toxic = toxicity_result['label'] == 'toxic' and toxicity_result['score'] > 0.7
            except:
                is_toxic = False
        
        return {
            'text': text,
            'language': language,
            'sentiment': sentiment,
            'confidence': result['score'],
            'is_toxic': is_toxic
        }
    
    def analyze_feedbacks(self, feedbacks: List[str]) -> Dict:
        """
        Analyze multiple feedbacks and generate summary.
        
        Args:
            feedbacks: List of feedback strings from coaches
            
        Returns:
            Complete analysis with:
            - Overall sentiment score (0-1)
            - Sentiment breakdown (counts)
            - Language statistics
            - Toxicity info
            - Individual feedback results
        """
        if not feedbacks:
            return {
                'error': 'No feedbacks provided',
                'total_feedbacks': 0
            }
        
        print(f"\nAnalyzing {len(feedbacks)} feedbacks...\n")
        
        # Step 1: Analyze each feedback
        results = []
        for i, feedback in enumerate(feedbacks, 1):
            if not feedback or not feedback.strip():
                continue  # Skip empty feedbacks
            
            result = self._analyze_single_feedback(feedback.strip())
            results.append(result)
            
            # Progress indicator
            print(f"  [{i}/{len(feedbacks)}] {result['language'].upper()} - {result['sentiment']}")
        
        if not results:
            return {
                'error': 'No valid feedbacks to analyze',
                'total_feedbacks': 0
            }
        
        # Step 2: Calculate statistics
        
        # Count sentiments
        positive_count = sum(1 for r in results if r['sentiment'] == 'positive')
        neutral_count = sum(1 for r in results if r['sentiment'] == 'neutral')
        negative_count = sum(1 for r in results if r['sentiment'] == 'negative')
        
        # Count languages
        arabic_count = sum(1 for r in results if r['language'] == 'ar')
        english_count = sum(1 for r in results if r['language'] == 'en')
        
        # Count toxic feedbacks
        toxic_count = sum(1 for r in results if r['is_toxic'])
        
        # Calculate OVERALL SENTIMENT SCORE
        # Positive = +1, Neutral = 0, Negative = -1
        # Then normalize to 0-1 scale
        sentiment_sum = positive_count - negative_count
        total = len(results)
        
        # Convert to 0-1 scale: -total to +total → 0 to 1
        overall_score = (sentiment_sum + total) / (2 * total)
        
        # Determine overall label
        if overall_score >= 0.6:
            overall_label = 'positive'
        elif overall_score <= 0.4:
            overall_label = 'negative'
        else:
            overall_label = 'neutral'
        
        print(f"\n{'='*60}")
        print("ANALYSIS COMPLETE")
        print(f"{'='*60}")
        print(f"Overall Sentiment: {overall_label.upper()} ({overall_score:.2%})")
        print(f"Positive: {positive_count} | Neutral: {neutral_count} | Negative: {negative_count}")
        if toxic_count > 0:
            print(f"⚠️  Warning: {toxic_count} toxic feedback(s) detected")
        print(f"{'='*60}\n")
        
        # Step 3: Build final result in a json 
        return {
            'total_feedbacks': len(results),
            
            'overall_sentiment': {
                'score': round(overall_score, 3),
                'label': overall_label,
                'description': self._get_sentiment_description(overall_score)
            },
            
            'sentiment_breakdown': {
                'positive': positive_count,
                'neutral': neutral_count,
                'negative': negative_count,
                'positive_percentage': round((positive_count / total) * 100, 1),
                'negative_percentage': round((negative_count / total) * 100, 1)
            },
            
            'language_stats': {
                'arabic': arabic_count,
                'english': english_count
            },
            
            'toxicity': {
                'has_toxic': toxic_count > 0,
                'toxic_count': toxic_count,
                'toxic_feedbacks': [
                    r['text'][:100] + '...' if len(r['text']) > 100 else r['text']
                    for r in results if r['is_toxic']
                ]
            },
            
            'individual_results': results
        }
    
    def _get_sentiment_description(self, score: float) -> str:
        """
        Convert sentiment score to human-readable description.
        
        Args:
            score: Sentiment score (0-1)
            
        Returns:
            Descriptive text for the score
        """
        if score >= 0.8:
            return "Outstanding coach feedback"
        elif score >= 0.6:
            return "Strong positive coach feedback"
        elif score >= 0.5:
            return "Positive coach feedback"
        elif score >= 0.4:
            return "Balanced coach feedback"
        elif score >= 0.2:
            return "Mostly negative coach feedback"
        else:
            return "Strong negative coach feedback"
    
    def generate_summary_text(self, analysis: Dict, athlete_name: str = "You") -> str:
        """
        Generate a human-readable summary for the monthly report.
        
        This creates the text that goes in the athlete's monthly report.
        
        Args:
            analysis: Result from analyze_feedbacks()
            
        Returns:
            Formatted summary text
        """
        total = analysis['total_feedbacks']
        sentiment = analysis['overall_sentiment']
        breakdown = analysis['sentiment_breakdown']
        
        summary = f"""
{athlete_name} received {total} feedback(s) from coaches this month.


Overall Sentiment: {sentiment['label'].upper()} ({sentiment['score']:.1%})
{sentiment['description']}

Breakdown:
  • Positive: {breakdown['positive']} ({breakdown['positive_percentage']}%)
  • Neutral: {breakdown['neutral']}
  • Negative: {breakdown['negative']} ({breakdown['negative_percentage']}%)
"""
        
        if analysis['toxicity']['has_toxic']:
            summary += f"\n⚠️  Note: {analysis['toxicity']['toxic_count']} feedback(s) contained inappropriate language and have been flagged for review.\n"
        
        return summary


# Example usage (for testing)
if __name__ == "__main__":
    print("This module should be imported, not run directly.")
    print("See test_feedback_analysis.py for usage examples.")
