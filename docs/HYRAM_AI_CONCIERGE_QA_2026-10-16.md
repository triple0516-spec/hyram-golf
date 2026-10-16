# HYRAM AI Concierge — premium chat QA / rollout

## Visual target
Recreate the previously approved desktop mockup's bottom-right AI chat panel: pale lavender robot avatar, white rounded panel, purple status chip, six quick topic pills, bottom message composer, with a compact mobile launcher.

## Implemented
- One shared floating widget across six pages: /, shop, fitting, checkout, login, signup.
- Guided non-GPT responses in six subjects (club, fitting, lesson, used, booking, member).
- Optional secured HTTPS AI endpoint via `window.HYRAM_AI_ENDPOINT`, backend-required, with timeout/error fallback. No API key or service credentials in browser.
- Close button, Escape dismissal, role/log and aria-live, keyboard focus and mobile responsive styling.
- Replaced previous disabled inline homepage AI section with concise entry CTA.
- Local guidance must not claim confirmed prices, actual availability, accounts, bookings or real payment. Never pass personal information to public chat.

## Release gates
- [ ] Static syntax, integration, safety checks.
- [ ] Chromium 375px/390px/desktop chat opening, six topics, free-text guidance, close, CTA and screenshots.
- [ ] Samsung Galaxy on-device QA and screen reader.
- [ ] If enabling GPT: contract, server/Worker endpoint, rate limiting, origin policy, anti-abuse, privacy notice/retention, API cost control, error handling, no exposed secret.
- [ ] Actual public DNS/HTTPS and `www.hyramgolf.kr` deployment.
- [ ] PR #7 → #6 → #4 release dependencies. Do not merge before prerequisite QA and production sanity checks.

**Prototype ≠ real AI chatbot backend. Do not advertise GPT as operational while endpoint is not verified.**
