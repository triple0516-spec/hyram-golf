// Deploy as a Cloudflare Worker with OPENAI_API_KEY and ALLOWED_ORIGIN secrets.
// Set a strict rate limit in Cloudflare before making this endpoint public.
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "";
    const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
    if (!allowed || origin !== allowed) return new Response(JSON.stringify({ error: "Origin not allowed" }), { status: 403, headers });
    headers["Access-Control-Allow-Origin"] = allowed;
    headers["Vary"] = "Origin";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...headers, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
    if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
    if (!env.OPENAI_API_KEY) return new Response(JSON.stringify({ error: "AI 상담 준비 중" }), { status: 503, headers });
    if (Number(request.headers.get("Content-Length") || 0) > 4096) return new Response(JSON.stringify({ error: "Request too large" }), { status: 413, headers });
    let data;
    try { data = await request.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers }); }
    const question = data?.message;
    if (typeof question !== "string" || !question.trim() || question.length > 1000) return new Response(JSON.stringify({ error: "1~1000자로 질문해 주세요" }), { status: 400, headers });
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: "Bearer " + env.OPENAI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || "gpt-4.1-mini",
        max_output_tokens: 450,
        instructions: "너는 HYRAM GOLF(하람골프)의 AI 상담 도우미다. 한국어로 친절하고 간결하게 골프클럽, 피팅, 레슨, 중고클럽, 골프 부킹의 일반 안내만 한다. 실제 재고, 가격, 주문, 예약, 결제, 제휴 여부는 확인할 수 없으며 절대 확정하거나 지어내지 않는다. 확정이 필요하면 카카오톡 상담 https://open.kakao.com/o/sFKnP4Qi 로 안내한다. 개인정보와 카드정보를 요구하지 않는다.",
        input: question.trim(),
        store: false
      })
    });
    if (!upstream.ok) return new Response(JSON.stringify({ error: "AI 응답을 받을 수 없습니다. 카카오톡으로 문의해 주세요." }), { status: 502, headers });
    const output = await upstream.json();
    const answer = (output.output || []).flatMap(item => item.content || []).filter(item => item.type === "output_text").map(item => item.text).join("\n");
    return new Response(JSON.stringify({ answer: answer || "카카오톡 상담으로 문의해 주세요." }), { status: 200, headers });
  }
};
