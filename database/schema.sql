-- HYRAM GOLF core business DB — Cloudflare D1 / SQLite
-- Draft only. Separate from payments-worker/schema.sql (test-only).
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customers (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT,
 email TEXT, kakao_contact TEXT, notes TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS products (
 id TEXT PRIMARY KEY, sku TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
 category TEXT NOT NULL CHECK(category IN ('CLUB','ACCESSORY','OTHER')),
 condition TEXT NOT NULL CHECK(condition IN ('NEW','USED')),
 purchase_cost_krw INTEGER NOT NULL DEFAULT 0 CHECK(purchase_cost_krw >= 0),
 sale_price_krw INTEGER NOT NULL CHECK(sale_price_krw >= 0),
 stock_qty INTEGER NOT NULL DEFAULT 0 CHECK(stock_qty >= 0),
 status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','HIDDEN','DISCONTINUED')),
 description TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
 id TEXT PRIMARY KEY, customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
 status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PENDING','PAID','FULFILLED','CANCELLED','REFUNDED')),
 subtotal_krw INTEGER NOT NULL DEFAULT 0 CHECK(subtotal_krw >= 0),
 discount_krw INTEGER NOT NULL DEFAULT 0 CHECK(discount_krw >= 0),
 total_krw INTEGER NOT NULL DEFAULT 0 CHECK(total_krw >= 0),
 channel TEXT NOT NULL DEFAULT 'DIRECT', notes TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS order_items (
 id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
 product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
 product_name_snapshot TEXT NOT NULL,
 qty INTEGER NOT NULL CHECK(qty > 0),
 unit_price_krw INTEGER NOT NULL CHECK(unit_price_krw >= 0),
 line_total_krw INTEGER NOT NULL CHECK(line_total_krw >= 0)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

CREATE TABLE IF NOT EXISTS lessons (
 id TEXT PRIMARY KEY, customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
 coach_name TEXT NOT NULL, scheduled_at TEXT NOT NULL,
 duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK(duration_minutes > 0),
 status TEXT NOT NULL DEFAULT 'BOOKED' CHECK(status IN ('BOOKED','COMPLETED','CANCELLED','NO_SHOW')),
 fee_krw INTEGER NOT NULL DEFAULT 0 CHECK(fee_krw >= 0), notes TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lessons_schedule ON lessons(scheduled_at);

CREATE TABLE IF NOT EXISTS memberships (
 id TEXT PRIMARY KEY, customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
 tier TEXT NOT NULL CHECK(tier IN ('SILVER','GOLD','PREMIUM','VIP')),
 status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','PAUSED','EXPIRED','CANCELLED')),
 started_at TEXT NOT NULL, ends_at TEXT, price_paid_krw INTEGER NOT NULL DEFAULT 0 CHECK(price_paid_krw >= 0),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_memberships_customer ON memberships(customer_id);

CREATE TABLE IF NOT EXISTS inventory_movements (
 id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
 change_qty INTEGER NOT NULL CHECK(change_qty <> 0),
 movement_type TEXT NOT NULL CHECK(movement_type IN ('PURCHASE','SALE','RETURN','ADJUSTMENT')),
 order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
 note TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_movements(product_id);
