from pathlib import Path
from html.parser import HTMLParser
import sqlite3
import unittest
root=Path(__file__).parent
class Smoke(unittest.TestCase):
 def test_schema_and_checkout(self):
  con=sqlite3.connect(":memory:")
  con.executescript((root/"schema.sql").read_text())
  cols={r[1] for r in con.execute("PRAGMA table_info(payment_quotes)")}
  self.assertTrue({"order_id","public_token","amount_krw","status","payment_key"}<=cols)
  doc=(root/"checkout.html").read_text()
  class H(HTMLParser):
   def __init__(self): super().__init__();self.ids=set();self.scripts=[]
   def handle_starttag(self, tag,attrs):
    d=dict(attrs)
    if "id" in d:self.ids.add(d["id"])
    if tag=="script":self.scripts.append(d.get("src"))
  h=H();h.feed(doc)
  self.assertTrue({"tossTestPanel","tossTestStatus","tossQuoteSummary","tossPayButton","tossPaymentMethods","tossPaymentAgreement","tossWidgetArea"}<=h.ids)
  self.assertIn("./toss-checkout.js",h.scripts)
  self.assertIn("./toss-payment-config.js",h.scripts)
  self.assertIn('window.HYRAM_TOSS_TEST_API_ORIGIN = "";',(root/"toss-payment-config.js").read_text())
  self.assertIn("실거래·운영 PG 연결은 별도 승인",doc)
  con.close()
if __name__=="__main__":unittest.main()
