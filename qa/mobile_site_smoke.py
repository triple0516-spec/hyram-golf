#!/usr/bin/env python3
"""HYRAM static mobile smoke QA. No live charges, booking, or data submissions."""
from __future__ import annotations
import functools
import http.server
import json
import os
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "web"
OUT = ROOT / "evidence" / "mobile"
OUT.mkdir(parents=True, exist_ok=True)
errors = []

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

server = http.server.ThreadingHTTPServer(
    ("127.0.0.1", 0),
    functools.partial(Quiet, directory=str(SITE)),
)
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}"

try:
    with sync_playwright() as play:
        browser = play.chromium.launch(headless=True, args=["--no-sandbox"])
        for width in (375, 390):
            context = browser.new_context(
                viewport={"width": width, "height": 844}, device_scale_factor=1,
            )
            page = context.new_page()
            page.on("pageerror", lambda exc: errors.append(str(exc)))
            response = page.goto(base + "/index.html", wait_until="networkidle")
            assert response and response.status == 200, "Home did not load"
            assert "HYRAM" in page.title()
            assert page.locator("h1").count() > 0, "Homepage hero absent"
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"), f"Home overflow at {width}px"
            page.screenshot(path=str(OUT / f"home-{width}.png"), full_page=True)
            if page.locator("#consultForm").count():
                assert page.locator(".mobile-quick").is_visible(), "Quick action missing"
                page.locator(".mobile-quick a[href='#consult']").click()
                assert page.evaluate("location.hash") == "#consult"
                page.locator("#consultForm select[name=kind]").select_option(label="클럽 피팅")
                page.locator("#consultForm input[name=target]").fill("부산 T300")
                page.locator("#consultForm textarea[name=detail]").fill("스펙과 방문 일정 상담")
                page.evaluate("""() => {
                    window.__copied = null;
                    window.__opened = null;
                    navigator.clipboard.writeText = async (text) => { window.__copied = text; };
                    window.open = (url, target, flags) => { window.__opened = [url, target, flags]; };
                }""")
                page.locator("#consultForm button[type=submit]").click()
                page.wait_for_function("window.__copied !== null")
                assert "부산 T300" in page.evaluate("window.__copied")
                assert "open.kakao.com/o/gaQIRfSi" in page.evaluate("window.__opened[0]")
                assert "복사" in page.locator("#consultStatus").inner_text()
                page.evaluate("""() => {
                    navigator.clipboard.writeText = async () => { throw Error("clipboard denied"); };
                }""")
                page.locator("#consultForm button[type=submit]").click()
                page.wait_for_function("document.querySelector('#consultStatus').textContent.includes('자동 복사가 제한')")
                assert "스펙과 방문 일정 상담" in page.locator("#consultStatus").inner_text()
                page.screenshot(path=str(OUT / f"consult-{width}.png"), full_page=True)
            response = page.goto(base + "/shop.html", wait_until="networkidle")
            assert response and response.status == 200, "Shop did not load"
            assert page.locator("#products .card").count() >= 1, "No products rendered"
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"), f"Shop overflow at {width}px"
            page.locator("#search").fill("T300")
            assert page.locator("#products .card").count() == 1, "Search filter failed"
            page.locator("#search").fill("no-match-xyz-1017")
            assert page.locator("#products .card").count() == 0, "Empty result failed"
            page.locator("#search").fill("")
            page.locator("button[data-filter='중고']").click()
            assert page.locator("button[data-filter='중고']").get_attribute("aria-pressed") == "true"
            assert page.locator("#products .card").count() >= 1, "Used-club filter failed"
            page.screenshot(path=str(OUT / f"shop-{width}.png"), full_page=True)
            context.close()
        browser.close()
    if errors:
        raise AssertionError("Browser JavaScript exceptions: " + json.dumps(errors, ensure_ascii=False))
    print("PASS: 375/390 viewport, home/shop navigation, search, filters, consultation where present, clipboard/fallback, popup URL, screenshots")
finally:
    server.shutdown()
