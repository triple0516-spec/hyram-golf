"""Static checks: premium chat is safe when GPT backend is not configured."""
from pathlib import Path
import unittest
ROOT = Path(__file__).resolve().parents[1] / "web"
class Chat(unittest.TestCase):
    def test_all_pages_load_chat(self):
        for name in ("index.html","shop.html","fitting.html","checkout.html","login.html","signup.html"):
            html=(ROOT/name).read_text(encoding="utf-8")
            self.assertIn('href="chat-widget.css"',html,name)
            self.assertIn('src="chat-widget.js"',html,name)
    def test_single_home_concierge(self):
        html=(ROOT/"index.html").read_text(encoding="utf-8")
        self.assertNotIn('id="askAI"',html)
        self.assertIn('id="ai-consult"',html)
        self.assertIn('data-hyram-chat-open',html)
    def test_no_credentials_in_client(self):
        js=(ROOT/"chat-widget.js").read_text(encoding="utf-8")
        for forbidden in ("OPENAI_API_KEY","sk-proj-", "localStorage","sessionStorage","document.cookie"):
            self.assertNotIn(forbidden,js)
        self.assertIn("window.HYRAM_AI_ENDPOINT",js)
        self.assertIn("민감한 개인정보",js)
        self.assertIn("실시간 GPT 응답",js)
if __name__=="__main__":
    unittest.main()
