-- HYRAM TossPayments TEST-ONLY staging. D1 SQL migration.
CREATE TABLE IF NOT EXISTS payment_quotes (
  order_id TEXT PRIMARY KEY,
  public_token TEXT NOT NULL UNIQUE,
  item_name TEXT NOT NULL,
  amount_krw INTEGER NOT NULL CHECK(amount_krw > 0 AND amount_krw <= 100000000),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK(status IN ('PENDING','PROCESSING','PAID','REVIEW_REQUIRED')),
  created_at_ms INTEGER NOT NULL,
  expires_at_ms INTEGER NOT NULL,
  payment_key TEXT,
  confirmed_at_ms INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_hyram_quote_token ON payment_quotes(public_token);
