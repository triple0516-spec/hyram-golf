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
