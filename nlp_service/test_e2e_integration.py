"""
End-to-End System Verification Test.
Tests the full pipeline from Python NLP Service -> Node.js Backend API -> MongoDB Order Analytics.
"""
import requests
import json
import unittest

NLP_URL = "http://127.0.0.1:8000"
BACKEND_URL = "http://127.0.0.1:5000/api"

class TestE2EIntegration(unittest.TestCase):

    def test_01_nlp_health(self):
        res = requests.get(f"{NLP_URL}/health", timeout=3)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["model_loaded"])

    def test_02_nlp_parse_direct(self):
        payload = {"text": "How many calories are in a pizza?"}
        res = requests.post(f"{NLP_URL}/parse", json=payload, timeout=3)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["intent"], "calorie_lookup")
        self.assertIn("Cheese Burst Pizza", data["entities"]["food_items"])

    def test_03_backend_calorie_lookup(self):
        payload = {"message": "How many calories are in a pizza?", "userId": "test_user_123"}
        res = requests.post(f"{BACKEND_URL}/ai-chat", json=payload, timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["intent"], "calorie_lookup")
        self.assertIn("850", data["response"])
        self.assertEqual(data["data"]["food"], "Cheese Burst Pizza")

    def test_04_backend_food_substitution(self):
        payload = {"message": "Suggest a healthier alternative to a burger.", "userId": "test_user_123"}
        res = requests.post(f"{BACKEND_URL}/ai-chat", json=payload, timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["intent"], "food_substitution")
        self.assertIn("Zinger Burger", data["entities"]["food"])
        self.assertIn("Nutritional Comparison", data["response"])
        self.assertIn("calories_saved", data["data"])

    def test_05_backend_habit_advice(self):
        payload = {"message": "I ate two burgers yesterday. How can I balance my meals today?", "userId": "test_user_123"}
        res = requests.post(f"{BACKEND_URL}/ai-chat", json=payload, timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["intent"], "habit_advice")
        self.assertEqual(data["entities"]["quantity"], 2)
        self.assertEqual(data["entities"]["time_reference"], "yesterday")
        self.assertIn("water", data["response"].lower())

    def test_06_backend_order_history(self):
        payload = {"message": "What did I eat most frequently this week?", "userId": "test_user_123"}
        res = requests.post(f"{BACKEND_URL}/ai-chat", json=payload, timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["intent"], "order_history")
        self.assertIn("Order History Summary", data["response"])
        self.assertIn("total_orders", data["data"])

    def test_07_backend_food_recommendation(self):
        payload = {"message": "Give me a healthy dinner suggestion.", "userId": "test_user_123"}
        res = requests.post(f"{BACKEND_URL}/ai-chat", json=payload, timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["intent"], "food_recommendation")
        self.assertIn("recommendations for your dinner", data["response"].lower())

    def test_08_backend_unsupported(self):
        payload = {"message": "Who won the cricket match yesterday?", "userId": "test_user_123"}
        res = requests.post(f"{BACKEND_URL}/ai-chat", json=payload, timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["intent"], "unsupported")
        self.assertIn("specialize specifically in nutrition", data["response"])

    def test_09_empty_message_validation(self):
        payload = {"message": "   ", "userId": "test_user_123"}
        res = requests.post(f"{BACKEND_URL}/ai-chat", json=payload, timeout=5)
        self.assertEqual(res.status_code, 400)

    def test_10_greeting(self):
        payload = {"message": "hi", "userId": "test_user_123"}
        res = requests.post(f"{BACKEND_URL}/ai-chat", json=payload, timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["intent"], "greeting")
        self.assertIn("Hello", data["response"])

if __name__ == "__main__":
    unittest.main()
