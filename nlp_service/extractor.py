"""
Entity Extraction Pipeline for Nutrify AI.
Extracts Food Entities, Quantities, Meal Types, Temporal Expressions, and Nutrition Terms
using spaCy NLP parsing augmented with validated domain dictionaries and morphological matching.
"""
import re
import spacy
from typing import Dict, List, Any, Optional

# Load spaCy English pipeline
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = spacy.blank("en")

# Known application food catalog (matches nutritionService.js and common foods)
CATALOG_FOODS = [
    {"canonical": "Cheese Burst Pizza", "aliases": ["cheese burst pizza", "cheese pizza", "pepperoni pizza", "margherita", "pizza", "slice of pizza"]},
    {"canonical": "Zinger Burger", "aliases": ["zinger burger", "chicken burger", "veg burger", "hamburger", "cheeseburger", "burger"]},
    {"canonical": "Grilled Chicken Salad", "aliases": ["grilled chicken salad", "chicken salad", "grilled salad", "caesar salad"]},
    {"canonical": "Coke", "aliases": ["coca cola", "cold drink", "soft drink", "coke", "soda", "pepsi", "cola", "carbonated drink"]},
    {"canonical": "Sprout Salad", "aliases": ["sprout salad", "sprouted beans", "green sprout", "lentil sprouts", "sprouts", "sprout"]},
    {"canonical": "French Fries", "aliases": ["french fries", "potato fries", "fries", "chips"]},
    {"canonical": "Whole Wheat Wrap", "aliases": ["whole wheat wrap", "chicken wrap", "veggie wrap", "wrap"]},
    {"canonical": "Quinoa Bowl", "aliases": ["quinoa bowl", "quinoa", "grain bowl"]},
    {"canonical": "Baked Sweet Potato", "aliases": ["baked sweet potato", "sweet potato"]},
    {"canonical": "Green Tea", "aliases": ["green tea", "herbal tea", "tea"]},
    {"canonical": "Lemon Water", "aliases": ["lemon water", "lime water"]},
    {"canonical": "Kombucha", "aliases": ["kombucha", "probiotic drink"]},
    {"canonical": "Greek Yogurt", "aliases": ["greek yogurt", "yogurt", "curd", "dahi"]},
    {"canonical": "Pasta", "aliases": ["white sauce pasta", "pasta", "spaghetti", "macaroni"]},
    {"canonical": "Biryani", "aliases": ["chicken biryani", "biryani", "rice bowl"]},
    {"canonical": "Chocolate Cake", "aliases": ["chocolate cake", "cake", "pastry", "dessert"]}
]

WORD_TO_NUM = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "single": 1, "double": 2, "triple": 3, "couple": 2, "pair": 2,
    "half": 0.5, "few": 3, "several": 4
}

MEAL_TYPES = [
    "breakfast", "lunch", "dinner", "snack", "midnight snack", "supper",
    "brunch", "midnight meal", "cheat meal", "pre-workout", "post-workout"
]

TIME_KEYWORDS = [
    "last night", "tonight", "today", "yesterday", "this week", "past week",
    "last week", "past 7 days", "this month", "last month", "earlier today",
    "at midnight", "10 pm", "11 pm", "12 am", "1 am", "2 am", "3 am", "4 am",
    "morning", "evening", "afternoon", "recently"
]

NUTRITION_TERMS = [
    "calories", "calorie", "kcal", "cal", "protein", "carbs", "carbohydrates",
    "fat", "fats", "trans fat", "saturated fat", "sugar", "sugars", "sodium",
    "salt", "fiber", "dietary fiber", "vitamins", "minerals", "cholesterol",
    "macros", "macronutrients", "micronutrients", "glycemic index", "insulin"
]

class EntityExtractor:
    """
    Hybrid Entity Extraction combining spaCy linguistic parsing (POS tagging, NER,
    noun chunks) with validated domain dictionaries.
    """

    def __init__(self):
        self.nlp = nlp
        self.catalog = CATALOG_FOODS

    def extract_quantity(self, text: str, doc) -> Optional[float]:
        # Check digit numbers: "2 burgers", "3.5 slices"
        digit_match = re.search(r'\b(\d+(?:\.\d+)?)\s*(?:slices?|pieces?|can|cans?|bottle|bottles?|bowls?|plates?|portions?)?\b', text, re.IGNORECASE)
        if digit_match:
            try:
                return float(digit_match.group(1))
            except ValueError:
                pass

        # Check word-based numbers like 'two', 'three'
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        for i, w in enumerate(words):
            if w in ("couple", "pair") and i > 0 and words[i-1] == "a":
                return 2.0
            if w in WORD_TO_NUM:
                return float(WORD_TO_NUM[w])

        # Check spaCy CARDINAL entities
        for ent in doc.ents:
            if ent.label_ in ("CARDINAL", "QUANTITY"):
                low = ent.text.lower().strip()
                if low in WORD_TO_NUM:
                    return float(WORD_TO_NUM[low])
                try:
                    return float(low)
                except ValueError:
                    pass

        return None

    def extract_meal_type(self, text: str) -> Optional[str]:
        low = text.lower()
        for meal in sorted(MEAL_TYPES, key=lambda x: -len(x)):
            if re.search(r'\b' + re.escape(meal) + r'\b', low):
                return meal
        return None

    def extract_time_reference(self, text: str, doc) -> Optional[str]:
        low = text.lower()
        # Direct phrase match first (for phrases like "last night", "past 7 days")
        for t in sorted(TIME_KEYWORDS, key=lambda x: -len(x)):
            if t in low:
                return t

        # spaCy DATE / TIME entities
        for ent in doc.ents:
            if ent.label_ in ("DATE", "TIME"):
                return ent.text.strip()

        return None

    def extract_nutrition_terms(self, text: str) -> List[str]:
        low = text.lower()
        found = []
        for term in NUTRITION_TERMS:
            if re.search(r'\b' + re.escape(term) + r'\b', low):
                found.append(term)
        return list(dict.fromkeys(found))

    def extract_foods(self, text: str, doc) -> List[Dict[str, Any]]:
        low = text.lower()
        detected = []

        # 1. Match known catalog items and aliases (greedy longest-first)
        all_aliases = []
        for item in self.catalog:
            for alias in item["aliases"]:
                all_aliases.append((alias, item["canonical"]))
        all_aliases.sort(key=lambda x: -len(x[0]))

        matched_spans = []
        for alias, canonical in all_aliases:
            # Allow optional plural suffix ('s' or 'es') on the alias
            pattern = r'\b' + re.escape(alias) + r'(?:s|es)?\b'
            for match in re.finditer(pattern, low):
                span = match.span()
                # Check overlap with already matched span
                if any(s[0] <= span[0] and span[1] <= s[1] for s in matched_spans):
                    continue
                matched_spans.append(span)
                detected.append({
                    "raw_text": match.group(0),
                    "matched_catalog_item": canonical,
                    "is_in_catalog": True,
                    "confidence": 0.98
                })

        # 2. Extract potential food candidates using spaCy noun chunks if no catalog match
        if not detected:
            for chunk in doc.noun_chunks:
                clean_chunk = chunk.root.lemma_.lower()
                # Exclude pronouns, meal types, time references, nutrition terms
                if clean_chunk in MEAL_TYPES or clean_chunk in TIME_KEYWORDS or clean_chunk in NUTRITION_TERMS:
                    continue
                if chunk.root.pos_ in ("NOUN", "PROPN") and len(clean_chunk) > 2:
                    detected.append({
                        "raw_text": chunk.text,
                        "matched_catalog_item": clean_chunk.title(),
                        "is_in_catalog": False,
                        "confidence": 0.65
                    })

        # Remove duplicate canonical entries
        unique_detected = []
        seen = set()
        for d in detected:
            key = d["matched_catalog_item"].lower()
            if key not in seen:
                seen.add(key)
                unique_detected.append(d)

        return unique_detected

    def parse(self, text: str) -> Dict[str, Any]:
        """
        Parses text and returns structured entities.
        """
        doc = self.nlp(text)
        foods = self.extract_foods(text, doc)
        quantity = self.extract_quantity(text, doc)
        meal_type = self.extract_meal_type(text)
        time_ref = self.extract_time_reference(text, doc)
        nutrition_terms = self.extract_nutrition_terms(text)

        food_names = [f["matched_catalog_item"] for f in foods]

        return {
            "food_items": food_names,
            "foods_detailed": foods,
            "quantity": quantity,
            "meal_type": meal_type,
            "time_reference": time_ref,
            "nutrition_terms": nutrition_terms
        }

if __name__ == "__main__":
    extractor = EntityExtractor()
    test_queries = [
        "I ate two burgers last night.",
        "How many calories are in a pizza?",
        "Suggest a healthier alternative to cheese burst pizza.",
        "What did I eat yesterday for dinner?",
        "How much sugar and protein in coke?"
    ]
    for q in test_queries:
        print(f"\nQuery: {q}")
        print(extractor.parse(q))
