import pathlib, sqlite3, unittest
class SchemaSmoke(unittest.TestCase):
    def test_schema_and_foreign_keys(self):
        conn = sqlite3.connect(":memory:")
        conn.executescript((pathlib.Path(__file__).parent / "schema.sql").read_text())
        tables = {r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        self.assertTrue({"customers","products","orders","order_items","lessons","memberships","inventory_movements"} <= tables)
        self.assertEqual(list(conn.execute("PRAGMA foreign_key_check")), [])
        conn.execute("""INSERT INTO products(id,sku,name,category,condition,sale_price_krw,stock_qty)
            VALUES ('demo','DEMO-001','Sample club','CLUB','USED',1000,1)""")
        self.assertEqual(conn.execute("SELECT stock_qty FROM products WHERE id='demo'").fetchone(),(1,))
        with self.assertRaises(sqlite3.IntegrityError):
            conn.execute("""INSERT INTO products(id,sku,name,category,condition,sale_price_krw,stock_qty)
               VALUES ('bad','DEMO-002','Negative club','CLUB','USED',-1,0)""")
        conn.close()
if __name__ == "__main__": unittest.main()
