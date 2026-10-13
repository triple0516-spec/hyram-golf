# HYRAM AI CONCIERGE — 24/7 GPT 상담

**Status: code ready; NOT LIVE until deployed and verified.**

## Deployment
1. Create a Cloudflare account, deploy Worker from this directory with `npx wrangler deploy`.
2. Add `OPENAI_API_KEY` using `npx wrangler secret put OPENAI_API_KEY`. Do not paste the key in GitHub, HTML, or chat.
3. Set `ALLOWED_ORIGIN` to the **exact** published site origin (for example `https://example.com`; no trailing slash) in Worker environment settings.
4. Enable per-IP rate limiting and bot protection on the Worker route; set OpenAI API usage budgets and alerts. Origin/CORS alone is **not** an abuse control.
5. Test OPTIONS and POST from the deployed site, invalid input, missing secret, denied origin and API failures. Confirm no invented prices, inventory or booking confirmation.
6. In `web/index.html`, insert `<script>window.HYRAM_AI_ENDPOINT="https://YOUR-WORKER.workers.dev";</script>` **before** the existing AI chat script, replacing the URL with the actual deployed endpoint. Redeploy Pages.
7. Check mobile Chrome and desktop. If endpoint unavailable, AI button stays disabled and Kakao consultation remains available.

## Scope
AI can answer general questions about club fitting, lesson inquiries, used club inquiries, and booking guidance. It cannot check live inventory, accept orders, charge cards, or confirm reservations. Route confirmations to https://open.kakao.com/o/sFKnP4Qi.

## Privacy and operations
Avoid collecting personal identifiers or payment details in AI questions. Requests are sent to the server-side Worker and OpenAI API when enabled. Publish an accurate privacy policy before enabling the service. Review costs and abuse logs regularly. An actual 24/7 availability SLA cannot be guaranteed without production monitoring.
