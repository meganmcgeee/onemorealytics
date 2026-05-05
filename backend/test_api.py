import unittest
import urllib.request
import urllib.error
import json
import threading
import time

BASE_URL = "http://localhost:3000/api"

class TestAPI(unittest.TestCase):
    
    def test_status_endpoint(self):
        """Test that the /api/status endpoint returns a 200 and a status string."""
        req = urllib.request.Request(f"{BASE_URL}/status")
        try:
            with urllib.request.urlopen(req) as response:
                self.assertEqual(response.getcode(), 200)
                data = json.loads(response.read().decode('utf-8'))
                self.assertIn("status", data)
                self.assertIsInstance(data["status"], str)
        except urllib.error.URLError as e:
            self.fail(f"Status endpoint failed: {e}")

    def test_synthesize_invalid_method(self):
        """Test that sending a GET to POST-only /api/synthesize fails or gets routed elsewhere."""
        # Note: the current server routes non-POST /api/ to a 404 or file not found.
        # It's good to ensure it doesn't crash.
        req = urllib.request.Request(f"{BASE_URL}/synthesize")
        try:
            with urllib.request.urlopen(req) as response:
                pass
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 404)

    def test_synthesize_valid_payload(self):
        """Test that sending a valid POST to /api/synthesize returns success."""
        payload = json.dumps({"sources": ["reddit:sleep"], "dateRange": "week"}).encode('utf-8')
        req = urllib.request.Request(f"{BASE_URL}/synthesize", data=payload, method="POST")
        req.add_header('Content-Type', 'application/json')
        try:
            with urllib.request.urlopen(req) as response:
                self.assertEqual(response.getcode(), 200)
                data = json.loads(response.read().decode('utf-8'))
                self.assertTrue(data.get("success"))
        except urllib.error.URLError as e:
            self.fail(f"Synthesize endpoint failed: {e}")

if __name__ == "__main__":
    print("Ensure the server is running on http://localhost:3000 before running tests.")
    unittest.main()
