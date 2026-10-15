#!/usr/bin/env python3
"""Static checks for the HYRAM MY FITTING prototype. Not a browser/device test."""
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1] / "web"

class Scanner(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.src = set()
        self.links = set()
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            assert a["id"] not in self.ids, f"Duplicate ID: {a['id']}"
            self.ids.add(a["id"])
        if tag == "script" and "src" in a:
            self.src.add(a["src"])
        if tag == "a" and "href" in a:
            self.links.add(a["href"])

def parse(file):
    s=Scanner()
    text=(ROOT/file).read_text(encoding="utf-8")
    s.feed(text)
    return s,text

fit,fit_html=parse("fitting.html")
shop,shop_html=parse("shop.html")
index,index_html=parse("index.html")
checkout,checkout_html=parse("checkout.html")
js=(ROOT/"fitting.js").read_text(encoding="utf-8")
brands=(ROOT/"brand-data.js").read_text(encoding="utf-8")

assert {"brand-data.js","fitting.js"} <= fit.src
assert "brand-data.js" in shop.src
assert len(re.findall(r'\{name:"[^"]+",ko:',brands)) == 25, "Exactly 25 brand profiles"
for anchor in ("match","performance","custom","care","checkout"):
    assert anchor in fit.ids, anchor
for ident in re.findall(r"\$\('([A-Za-z0-9]+)'\)",js):
    assert ident in fit.ids, f"JS references missing HTML id {ident}"
for section in ("fitting.html","checkout.html"):
    assert section in index.links, section
assert "fitting.html#match" in shop.links
assert "25 BRAND CURATION" in shop_html
assert "운영키" in checkout_html and "현재는 결제가 실행되지 않습니다" in checkout_html
assert "브라우저" in fit_html and "PG" in fit_html
assert "live_gsk" not in (fit_html+shop_html+index_html+checkout_html+js+brands)
assert "secretKey=" not in (fit_html+shop_html+index_html+checkout_html+js+brands)
print("PASS: brand count, file links, form control references, basic payment disclosures")
print("NOTE: browser UX, Toss POS settlement and online PG remain NOT TESTED")
