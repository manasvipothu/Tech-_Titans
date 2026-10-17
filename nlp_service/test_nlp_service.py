"""
Automated Unit and Integration Tests for Nutrify AI NLP Microservice.
Tests:
- Intent Classification accuracy on key user queries
- Entity Extraction for foods, quantities, meals, times, and nutrients
- Edge case handling and validation
- FastAPI endpoint responses
"""
import unittest
from fastapi.testclient import TestClient
from nlp_service.main import app, get_pipeline, get_extractor
from nlp_service.extractor import EntityExtractor

class TestNLPService(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.extractor = EntityExtractor()
        cls.pipeline = get_pipeline()

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["model_loaded"])

    def test_intents_endpoint(self):
        response = self.client.get("/intents")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["intents"]), 8)

    def test_entity_extraction_two_burgers_last_night(self):
        query = "I ate two burgers last night."
        result = self.extractor.parse(query)
        self.assertIn("Zinger Burger", result["food_items"])
        self.assertEqual(result["quantity"], 2.0)
        self.assertEqual(result["time_reference"], "last night")

    def test_entity_extraction_pizza_calories(self):
        query = "How many calories are in a pizza?"
        result = self.extractor.parse(query)
        self.assertIn("Cheese Burst Pizza", result["food_items"])
        self.assertIn("calories", result["nutrition_terms"])

    def test_entity_extraction_dinner_yesterday(self):
        query = "What did I order yesterday for dinner?"
        result = self.extractor.parse(query)
        self.assertEqual(result["meal_type"], "dinner")
        self.assertEqual(result["time_reference"], "yesterday")

    def test_intent_calorie_lookup(self):
        response = self.client.post("/parse", json={"text": "How many calories are in a pizza?"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intent"], "calorie_lookup")
        self.assertGreater(data["confidence"], 0.2)

    def test_intent_food_substitution(self):
        response = self.client.post("/parse", json={"text": "Suggest a healthier alternative to a burger."})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intent"], "food_substitution")
        self.assertIn("Zinger Burger", data["entities"]["food_items"])

    def test_intent_habit_advice(self):
        response = self.client.post("/parse", json={"text": "I want to reduce my late-night junk food consumption."})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intent"], "habit_advice")

    def test_intent_order_history(self):
        response = self.client.post("/parse", json={"text": "What did I eat most frequently this week?"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intent"], "order_history")
        self.assertEqual(data["entities"]["time_reference"], "this week")

    def test_intent_food_recommendation(self):
        response = self.client.post("/parse", json={"text": "Give me a healthy dinner suggestion."})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intent"], "food_recommendation")

    def test_intent_general_nutrition(self):
        response = self.client.post("/parse", json={"text": "How much water should I drink every day?"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intent"], "general_nutrition")

    def test_intent_unsupported(self):
        response = self.client.post("/parse", json={"text": "Who won the cricket match yesterday?"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intent"], "unsupported")

    def test_intent_greeting(self):
        response = self.client.post("/parse", json={"text": "hi"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intent"], "greeting")

    def test_empty_query_validation(self):
        response = self.client.post("/parse", json={"text": "   "})
        self.assertEqual(response.status_code, 400)

if __name__ == "__main__":
    unittest.main()
