/* HYRAM GOLF TossPayments v2 - TEST-ONLY, approved-quote payment checkout.
 * No payment amount is accepted from the browser or URL.
 * The cloud Worker verifies the authoritative D1 quote and confirms with Toss.
 */
(() => {
  "use strict";
  const root = document.getElementById("tossTestPanel");
  if (!root) return;
  const statusEl = document.getElementById("tossTestStatus");
  const summary = document.getElementById("tossQuoteSummary");
  const widgetArea = document.getElementById("tossWidgetArea");
  const payButton = document.getElementById("tossPayButton");
  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const token = fragment.get("pay");
  const apiValue = (window.HYRAM_TOSS_TEST_API_ORIGIN || "").trim().replace(/\/$/, "");

  function status(message) { statusEl.textContent = message; }
  function disable(message) {
    widgetArea.hidden = true;
    payButton.disabled = true;
    status(message);
  }
  if (!token) {
    disable("확정된 견적 전용 테스트 결제 링크가 없습니다. 아래 주문 상담으로 문의해 주세요.");
    return;
  }
  if (!/^[a-f0-9]{64}$/.test(token)) {
    disable("결제 링크 형식이 올바르지 않습니다. HYRAM 담당자에게 새 링크를 요청해 주세요.");
    return;
  }
  let api;
  try {
    api = new URL(apiValue);
    if (api.protocol !== "https:" || api.origin !== apiValue) throw Error("Invalid gateway");
  } catch (_) {
    disable("토스 테스트 결제 서버가 아직 설정되지 않았습니다. 현재는 상담만 가능합니다.");
    return;
  }
  async function loadSdk() {
    if (typeof window.TossPayments === "function") return;
    await new Promise((resolve, reject) => {
      const sdk = document.createElement("script");
      sdk.src = "https://js.tosspayments.com/v2/standard";
      sdk.onload = resolve;
      sdk.onerror = () => reject(Error("Payment SDK unavailable"));
      document.head.appendChild(sdk);
    });
    if (typeof window.TossPayments !== "function") throw Error("Payment SDK not initialized");
  }
  async function showQuote() {
    const response = await fetch(api.origin + "/payment/quote?token=" + encodeURIComponent(token),
      { cache: "no-store", mode: "cors" });
    if (!response.ok) throw Error("견적 링크를 불러오지 못했습니다.");
    const quote = await response.json();
    if (quote.testOnly !== true || !Number.isSafeInteger(quote.amount) ||
        quote.amount <= 0 || typeof quote.orderId !== "string") {
      throw Error("테스트 견적 정보가 올바르지 않습니다.");
    }
    summary.textContent = quote.itemName + " · " +
      quote.amount.toLocaleString("ko-KR") + "원 · " + quote.orderId;
    if (quote.status === "PAID") {
      disable("테스트 결제가 서버에서 승인됐습니다. 실제 결제나 매출 발생은 없습니다.");
      return;
    }
    if (quote.status === "PROCESSING" || quote.status === "REVIEW_REQUIRED") {
      disable("토스 테스트 승인 내역을 확인 중입니다. 중복 결제 요청 없이 HYRAM 담당자에게 문의해 주세요.");
      return;
    }
    if (quote.status !== "PENDING" || !/^test_gck_/.test(quote.clientKey || "")) {
      disable(quote.status === "EXPIRED"
        ? "견적 결제 링크 유효기간이 지났습니다. 새 견적을 요청해 주세요."
        : "결제 준비가 완료되지 않았습니다. 상담 채널로 문의해 주세요.");
      return;
    }
    await loadSdk();
    const payments = window.TossPayments(quote.clientKey);
    const widgets = payments.widgets({ customerKey: window.TossPayments.ANONYMOUS || "ANONYMOUS" });
    await widgets.setAmount({ currency: "KRW", value: quote.amount });
    widgetArea.hidden = false;
    await Promise.all([
      widgets.renderPaymentMethods({ selector: "#tossPaymentMethods", variantKey: "DEFAULT" }),
      widgets.renderAgreement({ selector: "#tossPaymentAgreement", variantKey: "AGREEMENT" })
    ]);
    payButton.disabled = false;
    status("테스트 전용 결제창입니다. 실제 카드 청구는 발생하지 않습니다.");
    payButton.addEventListener("click", () => {
      payButton.disabled = true;
      widgets.requestPayment({
        orderId: quote.orderId,
        orderName: quote.itemName,
        successUrl: api.origin + "/payment/success?token=" + encodeURIComponent(token),
        failUrl: api.origin + "/payment/fail?token=" + encodeURIComponent(token)
      }).catch(() => {
        payButton.disabled = false;
        status("결제 요청이 취소되거나 실패했습니다. 카드 청구 여부는 토스 테스트 내역에서 확인해 주세요.");
      });
    });
  }
  showQuote().catch(() => disable("테스트 결제 정보를 확인하지 못했습니다. 다시 시도하거나 상담 채널로 문의해 주세요."));
})();
