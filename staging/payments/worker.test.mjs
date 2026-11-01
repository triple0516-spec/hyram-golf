import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.mjs";
const url="https://worker.example";
const origin="https://staging.example";
function makeEnv() {
 const rows = new Map();
 const db={prepare(sql){return {
  bind(...values){return {
   async first(){return [...rows.values()].find(row=>row.public_token===values[0]) ?? null},
   async run(){
    if(sql.startsWith("INSERT")){const [order_id, public_token, item_name, amount_krw, created_at_ms, expires_at_ms]=values; rows.set(public_token,{order_id,public_token,item_name,amount_krw,created_at_ms,expires_at_ms,status:"PENDING"});return {meta:{changes:1}}}
    if(sql.startsWith("UPDATE payment_quotes SET status = 'PROCESSING'")){const [token, now]=values;const row=rows.get(token); if(row && row.status==="PENDING"&&row.expires_at_ms>now){row.status="PROCESSING";return {meta:{changes:1}}}return {meta:{changes:0}}}
    if(sql.includes("status = 'PAID'")){const [payment_key,time,token]=values;let row=rows.get(token);if(row?.status==="PROCESSING"){row.status="PAID";row.payment_key=payment_key;row.confirmed_at_ms=time;return {meta:{changes:1}}}return {meta:{changes:0}}}
    if(sql.includes("status = 'REVIEW_REQUIRED'")){const [token]=values;let row=rows.get(token);if(row?.status==="PROCESSING")row.status="REVIEW_REQUIRED";return {meta:{changes:1}}}
    throw Error("Unexpected query");
   }
  }}
 }}};
 return {env:{DB:db,ENVIRONMENT:"staging",ALLOWED_ORIGIN:origin,PUBLIC_CHECKOUT_URL:origin+"/checkout.html",TOSS_TEST_CLIENT_KEY:"test_gck_example",TOSS_TEST_SECRET_KEY:"test_gsk_example",ADMIN_API_TOKEN:"A".repeat(40)},rows};
}
const req=(path,options={})=>new Request(url+path,options);
async function issueQuote(env) {
 const res=await worker.fetch(req("/admin/quotes",{method:"POST",headers:{Authorization:"Bearer "+env.ADMIN_API_TOKEN,"Content-Type":"application/json"},body:JSON.stringify({itemName:"샘플 피팅",amount:1000,expiryHours:1})}),env);
 assert.equal(res.status,201);
 return res.json();
}
test("fails closed without staging D1 or with live merchant keys",async()=>{
 const {env}=makeEnv();
 assert.equal((await worker.fetch(req("/payment/quote"),{...env,ENVIRONMENT:"production"})).status,503);
 assert.equal((await worker.fetch(req("/payment/quote"),{...env,DB:null})).status,503);
 assert.equal((await worker.fetch(req("/payment/quote"),{...env,TOSS_TEST_SECRET_KEY:"live_gsk_wrong"})).status,503);
 assert.equal((await worker.fetch(req("/payment/quote",{headers:{Origin:"https://evil.example"}}),env)).status,403);
});
test("quote issuance is authenticated and exact amount is stored in D1",async()=>{
 const {env,rows}=makeEnv();
 const denied=await worker.fetch(req("/admin/quotes",{method:"POST",headers:{"Content-Type":"application/json"},body:'{}'}),env);
 assert.equal(denied.status,401);
 const quote=await issueQuote(env);
 assert.equal(quote.amount,1000);assert.equal(quote.testOnly,true);
 const token=new URL(quote.checkoutUrl).hash.slice(5);
 assert.match(token,/^[a-f0-9]{64}$/);
 assert.equal(rows.get(token).amount_krw,1000);
 const info=await worker.fetch(req("/payment/quote?token="+token),env);
 assert.equal((await info.json()).amount,1000);
});
test("tampered callback cannot approve; legitimate callback approves once",async()=>{
 const {env,rows}=makeEnv();const q=await issueQuote(env);
 const token=new URL(q.checkoutUrl).hash.slice(5);
 const path="/payment/success?token="+token+"&paymentKey=PAYKEY123456&orderId="+q.orderId+"&amount=";
 let remote=0;const saved=globalThis.fetch;
 try{
  globalThis.fetch=async (_url,opts)=>{remote++; const body=JSON.parse(opts.body);return new Response(JSON.stringify({status:"DONE",paymentKey:body.paymentKey,orderId:body.orderId,totalAmount:body.amount}),{status:200,headers:{"Content-Type":"application/json"}})};
  let tampered=await worker.fetch(req(path+"2"),env);
  assert.equal(tampered.status,303);assert.equal(rows.get(token).status,"PENDING");assert.equal(remote,0);
  let approved=await worker.fetch(req(path+"1000"),env);
  assert.equal(approved.status,303);assert.equal(rows.get(token).status,"PAID");assert.equal(remote,1);
  await worker.fetch(req(path+"1000"),env);assert.equal(remote,1);
 }finally{globalThis.fetch=saved}
});
test("unconfirmed server-side result needs reconciliation, never fake PAID",async()=>{
 const {env,rows}=makeEnv();const q=await issueQuote(env);
 const token=new URL(q.checkoutUrl).hash.slice(5);
 const saved=globalThis.fetch;
 try{globalThis.fetch=async()=>{throw Error("connection failed")};
 await worker.fetch(req("/payment/success?token="+token+"&paymentKey=PAYKEY123456&orderId="+q.orderId+"&amount=1000"),env);
 assert.equal(rows.get(token).status,"REVIEW_REQUIRED");
 }finally{globalThis.fetch=saved}
});
