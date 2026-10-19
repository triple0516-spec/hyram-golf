#!/usr/bin/env python3
"""Static-only security and wiring smoke for TEST checkout. NOT a payment acceptance test."""
from html.parser import HTMLParser
from pathlib import Path
root = Path(__file__).resolve().parents[1]
html = (root / "web/checkout.html").read_text(encoding="utf-8")
frontend = (root / "web/toss-checkout.js").read_text(encoding="utf-8")
config = (root / "web/toss-payment-config.js").read_text(encoding="utf-8")
worker = (root / "payments-worker/worker.js").read_text(encoding="utf-8")
schema = (root / "payments-worker/schema.sql").read_text(encoding="utf-8")

class Tags(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.scripts = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            assert a["id"] not in self.ids, "Duplicate id: " + a["id"]
            self.ids.add(a["id"])
        if tag == "script" and "src" in a:
            self.scripts.append(a["src"])

parser = Tags()
parser.feed(html)
assert {"tossTestPanel", "tossQuoteSummary", "tossPayButton", "tossPaymentMethods",
        "tossPaymentAgreement", "tossTestStatus", "orderForm"}.issubset(parser.ids)
assert "toss-payment-config.js" in parser.scripts
assert "toss-checkout.js" in parser.scripts
assert "토스페이먼츠 결제 테스트" in html and "실제 결제 불가" in html
assert "test_gck_" in frontend and "test_gck_" in worker and "test_gsk_" in worker
assert "window.HYRAM_TOSS_TEST_API_ORIGIN = \"\"" in config
assert "widgets.renderAgreement" in frontend and "widgets.renderPaymentMethods" in frontend
assert "widgets.requestPayment" in frontend
assert "quote.amount" in frontend and "quote.orderId" in frontend
assert "/payment/quote?token=" in frontend
assert "/payment/success?token=" in frontend
assert "amount !== quote.amount_krw" in worker
assert "receipt.totalAmount !== quote.amount_krw" in worker
assert "status = 'PROCESSING'" in worker and "status = 'PAID'" in worker
assert "REVIEW_REQUIRED" in worker
assert "ADMIN_API_TOKEN" in worker
assert "CREATE TABLE IF NOT EXISTS payment_quotes" in schema
assert not any(value in html + frontend + config for value in
               ["live_gsk_", "live_sk_", "TOSS_TEST_SECRET_KEY", "ADMIN_API_TOKEN"])
print("PASS: Toss staging wiring, default fail-closed configuration and amount verification markers")
print("NOT TESTED: SDK rendering, provider approval, D1 behavior, mobile redirects and live PG")
