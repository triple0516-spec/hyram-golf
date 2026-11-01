/**
 * HYRAM core catalog API — STAGING ONLY.
 * Read-only, no customer PII, orders, payments or mutation endpoints.
 * D1 is the authoritative source; no client-supplied prices are trusted.
 */
const safeJson = (data, status, origin) => new Response(JSON.stringify(data), {
  status, headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "vary": "Origin",
    ...(origin ? {"access-control-allow-origin": origin} : {})
  }
});
const allowedCategories = new Set(["CLUB", "ACCESSORY", "OTHER"]);
export default {
  async fetch(request, env) {
    const requestOrigin = request.headers.get("Origin");
    if (env?.ENVIRONMENT !== "staging" || !env.DB ||
        !/^https:\/\/[a-z0-9.-]+(?::[0-9]+)?$/i.test(env.ALLOWED_ORIGIN || "")) {
      return safeJson({error:"Staging core API is not configured"},503);
    }
    if (requestOrigin && requestOrigin !== env.ALLOWED_ORIGIN) {
      return safeJson({error:"Origin not allowed"},403);
    }
    const origin = requestOrigin === env.ALLOWED_ORIGIN ? requestOrigin : null;
    if (request.method === "OPTIONS") {
      return new Response(null, {status:204,headers:{
        "vary":"Origin",
        "access-control-allow-methods":"GET, OPTIONS",
        "access-control-allow-headers":"Content-Type",
        ...(origin ? {"access-control-allow-origin":origin} : {})
      }});
    }
    if (request.method !== "GET") return safeJson({error:"Method not allowed"},405,origin);
    let url;
    try { url = new URL(request.url); }
    catch { return safeJson({error:"Invalid URL"},400,origin); }
    try {
      if (url.pathname === "/api/health") {
        const check = await env.DB.prepare("SELECT 1 AS ok").first();
        return check?.ok === 1
          ? safeJson({status:"ok",database:"connected",mode:"staging-readonly"},200,origin)
          : safeJson({status:"unavailable"},503,origin);
      }
      if (url.pathname === "/api/products") {
        const rawLimit = url.searchParams.get("limit") ?? "20";
        if (!/^(?:[1-9]|[1-4][0-9]|50)$/.test(rawLimit))
          return safeJson({error:"Invalid limit (1..50)"},400,origin);
        const category = url.searchParams.get("category");
        if (category && !allowedCategories.has(category))
          return safeJson({error:"Invalid category"},400,origin);
        const columns = "id, sku, name, category, condition, sale_price_krw, stock_qty";
        const sql = "SELECT " + columns +
          " FROM products WHERE status = 'ACTIVE'" +
          (category ? " AND category = ?" : "") +
          " ORDER BY name ASC LIMIT ?";
        const stmt = env.DB.prepare(sql);
        const params = category ? [category,Number(rawLimit)] : [Number(rawLimit)];
        const result = await stmt.bind(...params).all();
        const items = Array.isArray(result.results) ? result.results : [];
        return safeJson({items,count:items.length,mode:"staging-readonly"},200,origin);
      }
      return safeJson({error:"Not found"},404,origin);
    } catch {
      return safeJson({error:"Database unavailable"},503,origin);
    }
  }
};