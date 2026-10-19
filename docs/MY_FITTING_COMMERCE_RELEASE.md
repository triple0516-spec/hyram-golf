# HYRAM GOLF — MY FITTING & COMMERCE release gates

## Current implementation (prototype on `feature/hyram-fitting-lifecycle-20261016`)

- `web/shop.html`: 25 curated brand introductions using `web/brand-data.js`; no unauthorized manufacturer product images. These are editorial introductions, **not 25 inventory items**.
- `web/fitting.html` + `web/fitting.js`:
  1. HYRAM MATCH: simple editorial brand filtering; not a clinically/technically validated fitting algorithm.
  2. HYRAM PERFORMANCE: before/after/recheck measurements (launch angle°, spin rpm, launch direction°, carry m); differences calculated without interpreting them as automatic improvement.
  3. HYRAM CUSTOM LAB: head, shaft, flex, weight, loft, lie, length, grip; save and compare up to 2 quote candidates.
  4. HYRAM TRADE & CARE: appraisal inquiry, trade-in inquiry, recheck dates; **no automatic reminder, valuation, official booking, or price guarantees**.
  - Records are saved **only in browser localStorage**. JSON export/import and delete exist; no authentication or cross-device backup.
- `web/checkout.html`: POS card, bank transfer, and planned online PG displayed as **inquiry options**, not charge capture. Bank account and confirmed invoice are provided manually once a real quote exists.
- `web/index.html`: landing links to the lifecycle and payment consultation.
- `qa/install_my_fitting_native.py`: injects a separate Flutter MY FITTING screen and HomeScreen entry during the RC24 archive Android build. Native match/performance/custom/care records persist locally via shared_preferences; checkout opens external web inquiry. Website/browser records and Android records do not sync.

## Mandatory before publishing or enabling live payment

1. Complete PR #4 mobile and Pages verification separately; no implicit merge and no assertion of production readiness from repository changes alone.
2. Verify accessible 375px / 390px mobile layouts, input limits, keyboard, clipboard fallback, back/forward navigation, and file export/import on Android Chrome and desktop.
3. Verify **Toss POS terminal** independently after physical arrival, activation, merchant account alignment, card approval/void and receipt reconciliation. A POS terminal alone does **not** activate payment via website or Play Store app.
4. For online card/instant payments: obtain activated TossPayments PG live merchant credentials, deploy server-side order creation/price authority, API confirmation, amount and order-id verification, webhook processing, idempotency and status database. Do not put any secret key in GitHub, HTML, mobile bundles or localStorage.
5. Before real bank-transfer order acceptance: verify business bank account, order reference and seller-issued final price, settlement workflow, manual receipt verification or bank/PG automation, cash receipt and cancellation/refund policy; **never mark paid on screenshot or self-report alone**.
6. Build real quote/inventory database, price consistency, shipping/tax disclosures, terms, privacy policy, customer consent and access controls before accepting orders or syncing identifiable user measurement records.
7. Implement a real fitting backend for accounts, staff roles, per-session multi-shot data, device imports, timestamps, units, measurement context, consent, data portability/deletion, access logs and cross-device synchronization.
8. If club manufacturer images are desired, obtain written use licenses, seller-accessible authorized media or own product photography. Keep original manufacturer logos and marks attributable to their owners; do not simulate manufacturer endorsements or a manufacturer-issued warranty.
9. Android source integration is **staged** by `qa/install_my_fitting_native.py` in the Android build workflow. Patch smoke test and Flutter analysis/integration must pass before marking native QA complete. It does not install or publish a new APK, and the app and website currently have separate local records. Play Store deployment requires rebuilt/signed and tested artifact; changing `web/` alone does not change the APK.

## Next release phases

- **V0**: branded discovery + local measurement history + quote/inquiry handoff + manual POS/transfer reconciliation.
- **V1**: server-side customer profiles, fit sessions, verified pricing and an admin console with audit logs; full Android UI integration.
- **V2**: live payment after PG approval, virtual account/webhook settlement, fitting partner device imports, follow-up reminders with opt-in.
- **V3**: compare normalized multi-shot dispersion, performance follow-up, model suitability feedback validated by actual fittings.

### Payment state model

`QUOTE_DRAFT -> QUOTE_APPROVED -> ORDER_PENDING -> PAYMENT_PENDING -> PAID_VERIFIED -> FULFILLMENT -> COMPLETED`

Failures branch to `PAYMENT_FAILED`, cancellations to `CANCELLED` / `REFUNDED`. Never allow client-only state to transition an order to `PAID_VERIFIED`.

### Brand and performance integrity

All brand comments are HYRAM editorial guidance, vary by model and are not independent test results. Measured shots need environment and equipment context; launch direction and carry differences alone do not prove better on-course performance.