/**
 * HYRAM GOLF / TossPayments TEST-ONLY checkout gateway.
 * No live keys or production mode are accepted in this worker.
 * Deploy only with a D1 database and secrets set in Cloudflare.
 */
const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";
const TOKEN_RE = /^[a-f0-9]{64}$/;
const json = (payload, status = 200, cors = {}) =>
  new Response(JSON.stringify(payload), {
    status, headers: { "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store", "referrer-policy": "no-referrer", ...cors }
  });
const hex = (length) => Array.from(crypto.getRandomValues(new Uint8Array(length)),
  byte => byte.toString(16).padStart(2, "0")).join("");
const validToken = token => typeof token === "string" && TOKEN_RE.test(token);

function checkoutUrl(env, token) {
  const target = new URL(env.PUBLIC_CHECKOUT_URL);
  if (target.protocol !== "https:") throw Error("Public checkout must use HTTPS");
  target.hash = "pay=" + encodeURIComponent(token);
  return target.toString();
}
async function findQuote(env, token) {
  return env.DB.prepare("SELECT * FROM payment_quotes WHERE public_token = ?")
    .bind(token).first();
}
function testConfigReady(env) {
  return Boolean(env.DB && typeof env.ALLOWED_ORIGIN === "string" &&
    typeof env.PUBLIC_CHECKOUT_URL === "string" &&
    /^test_gck_/.test(env.TOSS_TEST_CLIENT_KEY || "") &&
    /^test_gsk_/.test(env.TOSS_TEST_SECRET_KEY || ""));
}
function statusOf(row) {
  if (!row) return "NOT_FOUND";
  if (row.status === "PENDING" && row.expires_at_ms <= Date.now()) return "EXPIRED";
  return row.status;
}
async function confirmWithToss(env, token, params) {
  const quote = await findQuote(env, token);
  if (!quote || statusOf(quote) !== "PENDING") return;
  const paymentKey = params.get("paymentKey");
  const orderId = params.get("orderId");
  const amount = Number(params.get("amount"));
  if (!paymentKey || !/^[-_a-zA-Z0-9]{6,256}$/.test(paymentKey) ||
      orderId !== quote.order_id || !Number.isSafeInteger(amount) ||
      amount !== quote.amount_krw) return;

  // The conditional update prevents two parallel return requests from approving twice.
  const locked = await env.DB.prepare(
    "UPDATE payment_quotes SET status = 'PROCESSING' " +
    "WHERE public_token = ? AND status = 'PENDING' AND expires_at_ms > ?"
  ).bind(token, Date.now()).run();
  if (locked.meta?.changes !== 1) return;

  try {
    const reply = await fetch(TOSS_CONFIRM_URL, {
      method: "POST",
      headers: { "Authorization": "Basic " + btoa(env.TOSS_TEST_SECRET_KEY + ":"),
        "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount })
    });
    const receipt = await reply.json().catch(() => ({}));
    if (!reply.ok || receipt.status !== "DONE" ||
        receipt.paymentKey !== paymentKey ||
        receipt.orderId !== orderId || receipt.totalAmount !== quote.amount_krw) {
      // API error or ambiguous response: do NOT label the payment as paid.
      await env.DB.prepare("UPDATE payment_quotes SET status = 'REVIEW_REQUIRED' WHERE public_token = ? AND status = 'PROCESSING'")
        .bind(token).run();
      return;
    }
    await env.DB.prepare(
      "UPDATE payment_quotes SET status = 'PAID', payment_key = ?, confirmed_at_ms = ? " +
      "WHERE public_token = ? AND status = 'PROCESSING'"
    ).bind(paymentKey, Date.now(), token).run();
  } catch (_error) {
    // In case of network failure the remote payment might still be approved.
    // A merchant must reconcile with Toss before refunding or retrying.
    await env.DB.prepare(
      "UPDATE payment_quotes SET status = 'REVIEW_REQUIRED' WHERE public_token = ? AND status = 'PROCESSING'"
    ).bind(token).run();
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const cors = { "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type" };
    if (origin && origin !== env.ALLOWED_ORIGIN) return json({ error: "Origin not allowed" }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (!testConfigReady(env)) return json({ error: "Test payment gateway not configured" }, 503, cors);

    try {
      if (request.method === "POST" && url.pathname === "/admin/quotes") {
        // ADMIN_API_TOKEN must remain in Worker secrets, never in browser code.
        const auth = request.headers.get("Authorization") || "";
        if (!env.ADMIN_API_TOKEN || env.ADMIN_API_TOKEN.length < 32 ||
            auth !== "Bearer " + env.ADMIN_API_TOKEN) return json({ error: "Unauthorized" }, 401, cors);
        const body = await request.json().catch(() => null);
        const itemName = body?.itemName?.trim();
        const amount = body?.amount;
        const expiryHours = body?.expiryHours ?? 24;
        if (typeof itemName !== "string" || !itemName || itemName.length > 80 ||
            !Number.isSafeInteger(amount) || amount < 1 || amount > 100000000 ||
            !Number.isSafeInteger(expiryHours) || expiryHours < 1 || expiryHours > 168) {
          return json({ error: "Invalid approved item, amount, or expiry" }, 400, cors);
        }
        const now = Date.now();
        const token = hex(32);
        const orderId = "HYRAM" + hex(16).toUpperCase();
        await env.DB.prepare(
          "INSERT INTO payment_quotes (order_id,public_token,item_name,amount_krw,status,created_at_ms,expires_at_ms) " +
          "VALUES (?,?,?,?, 'PENDING',?,?)"
        ).bind(orderId, token, itemName, amount, now, now + expiryHours * 3600000).run();
        return json({ orderId, amount, itemName, testOnly: true,
          checkoutUrl: checkoutUrl(env, token) }, 201, cors);
      }

      if (request.method === "GET" && url.pathname === "/payment/quote") {
        const token = url.searchParams.get("token");
        if (!validToken(token)) return json({ error: "Invalid payment link" }, 400, cors);
        const row = await findQuote(env, token);
        if (!row) return json({ error: "Payment link not found" }, 404, cors);
        const status = statusOf(row);
        return json({ orderId: row.order_id, itemName: row.item_name,
          amount: row.amount_krw, status, testOnly: true,
          clientKey: status === "PENDING" ? env.TOSS_TEST_CLIENT_KEY : null }, 200, cors);
      }

      if (request.method === "GET" &&
        (url.pathname === "/payment/success" || url.pathname === "/payment/fail")) {
        const token = url.searchParams.get("token");
        if (!validToken(token)) return json({ error: "Invalid return link" }, 400, cors);
        if (url.pathname === "/payment/success")
          await confirmWithToss(env, token, url.searchParams);
        return Response.redirect(checkoutUrl(env, token), 303);
      }

      return json({ error: "Not found" }, 404, cors);
    } catch (_error) {
      return json({ error: "Payment gateway failed; please contact HYRAM support" }, 500, cors);
    }
  }
};
