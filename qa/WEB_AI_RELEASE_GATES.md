# HYRAM web / Android release gates (2026-10-09)

## Web mobile (NOT TESTED in physical browser)
- Open web/index.html in Chrome at 375px, 390px and tablet width.
- Confirm bottom actions lead to #shop and #consult without obscuring controls.
- Submit consultation with all categories. Verify clipboard text contains real line breaks and Kakao opens; if clipboard is blocked, verify manual-copy fallback.
- Confirm no automatic order, booking, payment or data transmission occurs.
- AI button must remain disabled until server endpoint is explicitly configured.

## GitHub Pages (BLOCKED by repository settings)
Run 37753119821 job 113230956119 failed at configure-pages with "Get Pages site failed ... Not Found".
In GitHub repository Settings > Pages > Build and deployment, select Source: GitHub Actions, and enable Pages if currently disabled. This is a repository setting, not an HTML change. Check that Actions workflow has Pages write and id-token write permissions. The workflow uploads path: web; therefore web/index.html maps to the Pages site root /, and web/shop.html maps to /shop.html. docs/index.html is not in this artifact.
Once Pages is configured, manually dispatch Deploy HYRAM Web Store on main. Changes on the feature branch will not deploy until merged. Verify public URL returned by the deploy job; do not assume a custom domain works before DNS and Pages configuration are verified.

## Android CI (NEEDS VERIFICATION)
The main workflow contained literal backslash-n sequences in the Add HYRAM consultation screen step. Fixed on this branch; no job ran in latest failed run 37880907813. Merge only after review and dispatch workflow from the corrected ref. If jobs start, evaluate analyze, tests, integration, APK and SHA256 independently. Do not mark Galaxy QA PASS without physical device testing.

## GPT 상담 (BLOCKED until infrastructure provisioned)
The web-ai-worker/worker.js Cloudflare Worker proxies GPT calls from server side. Do NOT put OPENAI_API_KEY in web HTML or GitHub Pages.
1. Deploy Worker to Cloudflare; set secret OPENAI_API_KEY, variable ALLOWED_ORIGIN to the exact deployed web origin, optional OPENAI_MODEL.
2. Apply Cloudflare per-IP rate limits, bot protection and cost budgets. Origin checks are not authentication and do not prevent direct abuse.
3. Set window.HYRAM_AI_ENDPOINT to the deployed Worker HTTPS URL in web/index.html **only after** testing CORS, API response, failure handling, usage cost and rate limiting.
4. Test a real question from the public site, ensure no invented stock/booking confirmation. Existing Kakao link is the live human-contact fallback.
