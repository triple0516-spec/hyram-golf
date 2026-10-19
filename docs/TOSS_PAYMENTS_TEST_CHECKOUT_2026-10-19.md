# HYRAM GOLF — TossPayments test checkout integration (2026-10-19)

## IMPORTANT: NOT LIVE / NOT PUBLISHED

- This is a **draft test-only** payment integration, stacked on PR #11.
- The URL `https://business.toss.im/account/conversion/simple?...dashboard/home` is a **merchant account login/dashboard**, NOT a customer payment URL or SDK integration.
- The Toss POS merchant/terminal identifier is not a web PG client key.
- Only the **official TossPayments SDK v2** is used on the customer checkout page. Secrets stay inside a Cloudflare Worker.
- The Worker refuses all keys except `test_gck_*` and `test_gsk_*`. **Real payment is impossible by design in this branch.**
- `web/toss-payment-config.js` ships with an empty API origin, therefore without a separately configured backend even test payments stay disabled.
- No checkout is offered solely from an arbitrary user-entered budget, product name, quantity or query-string amount.

## Architecture

1. Authorized HYRAM staff verify real availability/quote manually.
2. Staff create a **test** quote via authenticated `POST /admin/quotes` to the Worker (server admin token; never from site JavaScript).
3. D1 stores one unguessable token, immutable test amount, order ID, item name, expiration and status.
4. Staff sends the generated `checkoutUrl` only to a test buyer.
5. The static `web/checkout.html#pay=...` requests `GET /payment/quote?token=...`.
6. For a valid pending quote, the browser initializes TossPayments SDK v2 and `widgets()`, `setAmount()`, `renderPaymentMethods()`, `renderAgreement()`.
7. Test payment `requestPayment()` returns to the Worker's `GET /payment/success` (or `/payment/fail`).
8. **Only the Worker** compares orderId and amount against the D1 quote and calls Toss's server confirm API, then records `PAID` after a verified Toss DONE response. Browser success redirects alone never mark paid.
9. Ambiguous API/network results become `REVIEW_REQUIRED` for merchant reconciliation. Concurrency locks prevent double approval.

## Setup — staging only

1. In [TossPayments developer center](https://developers.tosspayments.com/), select your online PG *test* merchant keys under 주문서형/결제창형. A merchant dashboard or POS code does **not** substitute for them.
2. In a separate Cloudflare account, create a **staging** D1 database `hyram-payments-test`.
3. Apply `payments-worker/schema.sql` to that database.
4. Copy `payments-worker/wrangler.toml.example` to `payments-worker/wrangler.toml` locally and replace the D1 database id and exact test site origin/checkout URL. Never commit real secrets.
5. Install Wrangler in the deploy environment. Set Worker **secrets** with `wrangler secret put TOSS_TEST_CLIENT_KEY`, `wrangler secret put TOSS_TEST_SECRET_KEY` and `wrangler secret put ADMIN_API_TOKEN`. Generate a random admin token of at least 32 characters and keep it outside GitHub and browser code.
6. Deploy the Worker. Confirm CORS allows **only** the exact test storefront origin. Add the verified Worker HTTPS origin (no trailing slash) to `web/toss-payment-config.js` on the **staging branch only**.
7. Authorized merchant staff may issue a quote from a secured command-line environment, not customer UI. Example (do not paste the real admin token into a chat or ticket):

```bash
curl -X POST "https://YOUR-STAGING-WORKER.workers.dev/admin/quotes" \
  -H "Authorization: Bearer $HYRAM_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemName":"HYRAM 테스트 피팅","amount":1000,"expiryHours":24}'
```

8. Open the returned `checkoutUrl` in a **test** browser. Verify the order/amount, test methods, success redirect, D1 status, and Toss developer-center test records. Test the same token multiple times, expired links, failed confirmations, and unknown/altered amounts; verify no unauthorized paid statuses occur.

## Release gates

- [ ] Worker deployed, D1 schema applied, and test/secret client keys are from one matching *online* MID.
- [ ] No secret keys in GitHub Pages, APKs, localStorage, CI logs, screenshots or URL parameters.
- [ ] Automated and mobile-browser tests PASS for widths 360/375/390/414 and Galaxy Chrome/Samsung Internet.
- [ ] Confirm valid, invalid, duplicate, expired and interrupted payment flows via actual Toss test merchant.
- [ ] Terms, privacy, cancellation/refund, delivery, inventory and quote ownership enforcement.
- [ ] Production requires a **separate** reviewed and approved implementation: real merchant keys, inventory/order DB, order/customer authorization, admin access control, retries & reconciliation, signed/verified webhooks when needed, receipts and refund/cancel workflows.
- [ ] No automatic merge, Pages deploy or public-live activation from this PR.

References:
- https://docs.tosspayments.com/guides/v2/payment-widget/integration
- https://docs.tosspayments.com/reference/using-api/api-keys
