"""Static launch checks for HYRAM campaign banners and account preview pages.
This is NOT live-browser QA or a production authentication security audit.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import unittest

ROOT = Path(__file__).resolve().parents[1] / "web"

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []
    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "a" and "href" in attributes:
            self.hrefs.append(attributes["href"])

class CampaignAndAccount(unittest.TestCase):
    def test_new_paths_exist(self):
        for filename in ("login.html", "signup.html", "account.css", "campaign.css"):
            self.assertTrue((ROOT / filename).is_file(), filename)

    def test_banners_in_home_and_shop(self):
        for filename in ("index.html", "shop.html"):
            html = (ROOT / filename).read_text(encoding="utf-8")
            self.assertIn('href="campaign.css"', html)
            self.assertIn('class="hyram-campaign"', html)
            self.assertEqual(html.count('class="hc-card"'), 3)
            for anchor in ("performance", "custom", "care"):
                self.assertIn('href="fitting.html#' + anchor + '"', html)

    def test_account_navigation(self):
        for filename in ("index.html", "shop.html", "fitting.html", "checkout.html"):
            html = (ROOT / filename).read_text(encoding="utf-8")
            self.assertIn('href="login.html"', html, filename)
            self.assertIn('href="signup.html"', html, filename)

    def test_account_preview_does_not_accept_credentials(self):
        for filename in ("login.html", "signup.html"):
            html = (ROOT / filename).read_text(encoding="utf-8")
            self.assertIn('<fieldset disabled>', html)
            self.assertIn('type="submit" disabled', html)
            self.assertIn('name="password"', html)
            self.assertIn('name="email"', html)
            self.assertIn('content="noindex,follow"', html)
            self.assertNotIn("fetch(", html)
            self.assertNotIn("localStorage", html)
            self.assertNotIn("sessionStorage", html)
            self.assertNotIn('method="post"', html)

    def test_new_page_local_links_resolve(self):
        for filename in ("login.html", "signup.html"):
            html = (ROOT / filename).read_text(encoding="utf-8")
            p = Links()
            p.feed(html)
            for href in p.hrefs:
                parsed = urlsplit(href)
                if parsed.scheme or parsed.netloc or href.startswith(("#", "//")):
                    continue
                target = parsed.path or "./"
                self.assertTrue((ROOT / target).exists(), f"{filename} -> {href}")

if __name__ == "__main__":
    unittest.main()
