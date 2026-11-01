import test from "node:test";
import assert from "node:assert/strict";
import worker from "./core-api.mjs";
const origin = "https://staging.example.com";
const products = [{id:"demo-1",sku:"DEMO-CLUB-1",name:"Sample club",category:"CLUB",
  condition:"USED",sale_price_krw:1000,stock_qty:1}];
const fakeDB = {
 prepare(sql) {
   assert.equal(/\b(?:insert|update|delete|drop|alter)\b/i.test(sql),false);
   return {bind(...values) { return {
     async all() { return {results:products.slice(0,values.at(-1))}; }
   }; },async first(){return {ok:1}}};
 }
};
const env = {DB:fakeDB,ENVIRONMENT:"staging",ALLOWED_ORIGIN:origin};
const req = (path,method="GET",from=origin) => new Request("https://api.example.com"+path,{method,headers:{"Origin":from}});
test("health proves D1 read access",async()=>{
 const res=await worker.fetch(req("/api/health"),env);
 assert.equal(res.status,200);assert.equal((await res.json()).database,"connected");
});
test("public catalog exposes only safe schema fields",async()=>{
 const res=await worker.fetch(req("/api/products?limit=1&category=CLUB"),env);
 assert.equal(res.status,200);
 const j=await res.json();assert.equal(j.count,1);
 assert.deepEqual(Object.keys(j.items[0]).sort(),Object.keys(products[0]).sort());
});
test("rejects unexpected origin and production environment",async()=>{
 assert.equal((await worker.fetch(req("/api/products","GET","https://other.example"),env)).status,403);
 assert.equal((await worker.fetch(req("/api/health"),{...env,ENVIRONMENT:"production"})).status,503);
});
test("cannot create or change orders or products",async()=>{
 assert.equal((await worker.fetch(req("/api/orders","POST"),env)).status,405);
 assert.equal((await worker.fetch(req("/api/products","DELETE"),env)).status,405);
});
test("rejects invalid filters, returns 404 and is safe on DB outage",async()=>{
 assert.equal((await worker.fetch(req("/api/products?limit=9999"),env)).status,400);
 assert.equal((await worker.fetch(req("/api/products?category=ADMIN"),env)).status,400);
 assert.equal((await worker.fetch(req("/api/payment/confirm"),env)).status,404);
 assert.equal((await worker.fetch(req("/api/products"),{...env,DB:{prepare(){throw Error("DB failure")}}})).status,503);
});
test("preflight declares GET only",async()=>{
 const res=await worker.fetch(req("/api/products","OPTIONS"),env);
 assert.equal(res.status,204);
 assert.match(res.headers.get("access-control-allow-methods"),/GET/);
 assert.doesNotMatch(res.headers.get("access-control-allow-methods"),/POST/);
});