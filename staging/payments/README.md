# HYRAM GOLF — TossPayments v2 test + Cloudflare D1 staging
**NOT LIVE.** This branch is intentionally isolated from the live `web/` Pages deploy. It does not charge actual cards or accept real orders.
This extracts the test-only payment logic from stacked PR #12 without merging PR #11.

## What is implemented
- `checkout.html`: isolated payment UI; automatically disabled if there is no D1/Worker HTTPS origin and signed staff-issued test quote token.
- `toss-checkout.js`: official TossPayments v2 lazy-loaded SDK. Uses amount and order number read from server, never customer input.
- `worker.mjs`: authenticated server-issued immutable quotes, D1 status, server-side Toss confirmation on success, atomic PROCESSING lock, PAID only after verified DONE response, REVIEW_REQUIRED on ambiguity.
- `schema.sql`: separate payment-test D1 database.
- `worker.test.mjs`: mocked Toss API tests for bad credentials, wrong amount, idempotency, approval, and failure.
- `checkout-smoke.py`: Python SQLite and HTML selector validation.
- Client config is blank and Worker demands staging + test keys.

## Cloudflare staging setup (requires account authority; do not paste secrets into ChatGPT)
1. Log into an authorized Cloudflare account and create **staging-only** D1 `hyram-payments-staging`. From a secured terminal with Wrangler installed:
   `npx wrangler d1 create hyram-payments-staging`
2. Copy `wrangler.toml.example` to a **gitignored/uncommitted** `wrangler.toml`. Fill the D1 UUID and your exact approved staging HTTPS origin and test-checkout URL.
3. Apply `npx wrangler d1 execute hyram-payments-staging --remote --file=./schema.sql` from this directory **only to staging**; verify migration and D1 backup/restore readiness.
4. Obtain a matched pair of Toss **online test MID** client/secret keys from the [Toss developer center](https://developers.tosspayments.com/). A POS terminal or business dashboard URL is not a web API key.
5. In Cloudflare Worker encrypted secrets, set `TOSS_TEST_CLIENT_KEY`, `TOSS_TEST_SECRET_KEY` and `ADMIN_API_TOKEN` (32+ random characters). Never put these in GitHub, files, browser JS, commit, or issue.
6. After preparing the assets, deploy `npx wrangler deploy --config wrangler.toml` from this folder to **staging**. The resulting Worker URL must exactly match the values of `ALLOWED_ORIGIN` and `PUBLIC_CHECKOUT_URL`; otherwise the fail-closed check blocks payment.
7. Run `sh prepare-staging-assets.sh` to package only the 3 safe browser assets into `public/` (no Worker source, D1 schema, or secrets). The Wrangler `[assets]` binding serves them on the **same staging Worker HTTPS origin** as the API. `public/toss-payment-config.js` uses `window.location.origin`, so no second hosting project or hardcoded API domain is needed. Confirm `ALLOWED_ORIGIN` and `PUBLIC_CHECKOUT_URL` exactly match your Worker HTTPS hostname before deploying.
8. Test quote creation from secured operator server/CLI, valid/invalid/expired/duplicated callbacks, mismatched amount rejection, matching Toss payment records, cancellations/refunds and D1 reconciliation; capture redacted QA evidence.

## Preconditions before live checkout
- Staff authentication and quote ownership, real product/stock/order DB, immutable totals, atomic stock reservation.
- Order-payment event ledger, receipt, refund/cancel flows, merchant reconciliation, webhook validation and alerting.
- Approved online live MID and production-only secrets separate from staging.
- Privacy/consent and consumer policies, merchant identity, real mobile-browser E2E evidence and written go-live approval.
- Never mark PAID from browser redirects alone.

## Local tests
```sh
python -m unittest discover -s . -p '*smoke.py'
node --test worker.test.mjs
```
