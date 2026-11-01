# HYRAM GOLF — Core database starter

Status: **DRAFT / NOT DEPLOYED**. Intended target: Cloudflare D1 (SQLite), proposed database name `hyram-golf-main`. This is a shared data model for both web and mobile clients, **accessed only through an authenticated backend API**.

## Scope
Seven starter tables: `customers`, `products`, `orders`, `order_items`, `lessons`, `memberships`, `inventory_movements`. All customer records must be fictitious in local testing.

This is separate from PR #12's `payments-worker/schema.sql`, which is **TossPayments TEST-ONLY**. No payment keys or live payment integrations are included here.

## Local-only validation

```sh
sqlite3 :memory: < database/schema.sql
npx wrangler d1 execute hyram-golf-main --local --file=./database/schema.sql
```
The Wrangler command requires a properly configured local D1 binding; do not run it against remote production. SQL was checked against Python SQLite locally, creating seven tables successfully.

## Remote setup — requires separate approval
1. Set up a Cloudflare account/project with minimum privileges.
2. Create a **staging-only** D1 and reviewed Worker configuration. Keep database IDs and credentials in appropriate secure configuration.
3. Apply schema to staging, run migrations and rollback/restore tests.
4. Build authenticated API with per-role authorization and audit logging.
5. Verify web and app against the same API in staging.
6. Review retention policies, payment reconciliation and release gates before production.

## Blocking gaps before launch
- Customer/staff identity, login, consent, access control and secure API.
- Transactional/idempotent order and stock updates; stock quantity and movement history must not diverge.
- Membership billing, lesson packages, constraints, time zone policies.
- Payment confirmation, refund/cancel, ledger/reconciliation and correct PR #12 separation.
- PII retention/deletion policy, backups, restore tests, monitoring and migration versioning.

Do not merge or deploy as a live database without a separate review.


## Implemented in this Draft (2026-11-01)
- `core-api.mjs`: Cloudflare Worker **staging-only** API supporting `GET /api/health` and `GET /api/products?limit=20&category=CLUB`.
- Public product API exposes ONLY product ID, SKU, name, category, condition, sale price and stock count; never customer info, supplier purchase cost or payment data.
- Fail-closed guard: `ENVIRONMENT=staging`, exact HTTPS `ALLOWED_ORIGIN`, D1 `DB` binding required; all POST/PUT/PATCH/DELETE methods return 405.
- `wrangler.toml.example` placeholder only: no production IDs or secrets.
- `core-api.test.mjs` and `test_schema.py` run in GitHub Actions using Node builtins/Python SQLite.

### Local QA (no Cloudflare credentials)
```sh
python -m unittest discover -s database -p 'test_schema.py'
node --test database/core-api.test.mjs
```

### Actual cloud staging connection (NOT YET DONE)
1. Owner reviews and approves staging Cloudflare account, D1 project, expected domains and account control.
2. Create staging D1, apply schema, store binding ID in uncommitted local `wrangler.toml`.
3. Publish **staging Worker only**, validate `GET /api/health` and `GET /api/products` against safe sample data; verify CORS and no writable methods.
4. Implement audited admin auth, atomic order/reservation/stock flow, member consent/PII controls and web/app consumption **before** any production migration.
5. Independently test Toss test-mode quote/confirm; design shared order ownership and payment-event ledger before production.
6. Only after end-to-end QA, legal checks, merchant verification and explicit release approval consider production.

This PR is not connected to public hyramgolf.kr, and cannot process real orders or charge customers.
