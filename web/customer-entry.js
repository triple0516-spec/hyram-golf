/* Progressive enhancement for the GitHub home and the current public home.
 * No API, storage, analytics, booking, account or payment mutations. */
(() => {
  'use strict';
  const main = document.querySelector('main');
  const hero = main?.querySelector('.expert-hero, .hero');
  if (!hero || document.getElementById('customer-start')) return;

  const kakao = 'https://open.kakao.com/o/gaQIRfSi';
  const publicHome = Boolean(document.querySelector('.expert-header'));
  const shop = publicHome ? 'catalog.html' : 'shop.html';
  const services = [
    ['레슨', '골프를 배우고 싶어요', '처음 시작해도, 스윙을 다듬고 싶어도', '01'],
    ['피팅', '내 클럽이 맞는지 궁금해요', '스윙 고민과 사용 중인 클럽부터 확인', '02'],
    ['클럽 구매', '클럽을 사고 싶어요', '신품·중고, 원하는 모델과 예산 상담', '03'],
    ['중고 판매', '쓰던 클럽을 팔고 싶어요', '모델·스펙을 알려주시면 매입 가능 여부 안내', '04'],
  ];
  document.body.classList.add('customer-entry-enabled');
  if (publicHome) {
    const brand = document.querySelector('.expert-header a.brand');
    if (brand) {
      const logo = document.createElement('img');
      logo.className = 'customer-brand-logo';
      logo.src = 'images/hyram-signature-light.svg';
      logo.alt = '하람골프 · HYRAM GOLF';
      logo.width = 200; logo.height = 55;
      brand.replaceChildren(logo);
      brand.setAttribute('aria-label', '하람골프 홈');
    }
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.href = 'images/hyram-friendly-mark.svg';
  }
  const heroActions = hero.querySelector('.expert-actions');
  if (heroActions) {
    // Replacing the links also removes the old per-link service-prefill listener.
    heroActions.innerHTML = `<a class="expert-btn primary" href="#customer-consult">상담 시작하기 ↗</a><a class="expert-btn secondary" href="${shop}">클럽 둘러보기 →</a>`;
  }
  const summary = hero.querySelector('.expert-summary');
  if (summary) summary.textContent = '레슨, 클럽 피팅, 신품·중고 클럽까지. 원하는 서비스부터 골라보세요. 전문 용어를 몰라도 편하게 상담할 수 있어요.';
  const homeStart = hero.querySelector('[data-customer-start]');
  if (homeStart) homeStart.href = '#customer-start';
  const headerTalk = document.querySelector('header .talk');
  if (headerTalk) {
    headerTalk.href = '#customer-consult'; headerTalk.removeAttribute('target');
  }

  const translations = new Map([
    ['SHOP', '클럽 구매'], ['CLUB SHOP', '클럽 구매'], ['USED', '중고클럽'],
    ['MASTER FITTER', '피팅 소개'], ['LESSON PRO', '레슨 소개'],
    ['FITTING · LESSON', '피팅·레슨'], ['BOOKING', '부킹 문의'],
    ['CONTACT', '상담하기'], ['GUIDE', '이용 안내'], ['FAQ', '자주 묻는 질문'],
  ]);
  document.querySelectorAll('header nav a, header .links a').forEach(a => {
    const label = translations.get(a.textContent.trim());
    if (label) a.textContent = label;
    if (['#reserve', '#consult'].includes(a.getAttribute('href'))) a.href = '#customer-consult';
  });
  if (!main.id) main.id = 'main-content';
  if (!document.querySelector('.skip-link, a[href="#main-content"]')) {
    const skip = document.createElement('a');
    skip.className = 'customer-skip'; skip.href = '#main-content'; skip.textContent = '본문 바로가기';
    document.body.prepend(skip);
  }
  const section = document.createElement('section');
  section.id = 'customer-start'; section.className = 'customer-start';
  section.setAttribute('aria-labelledby', 'customer-start-title');
  section.innerHTML = `
    <div class="customer-wrap">
      <div class="customer-heading"><div><p class="customer-kicker">골프가 처음이어도 괜찮아요</p>
      <h2 id="customer-start-title">오늘, 무엇을 도와드릴까요?</h2></div>
      <p>필요한 것 하나만 골라보세요.<br>자세한 내용은 함께 알아가면 돼요.</p></div>
      <div class="customer-paths"></div>
      <div class="customer-next"><span>아직 어떤 클럽을 고를지 모르겠다면?</span><a href="#customer-consult">고민부터 편하게 물어보기 <span aria-hidden="true">↗</span></a></div>
      ${publicHome ? '<div class="customer-more"><a href="#membership">회원 혜택</a><a href="faq.html">자주 묻는 질문</a></div>' : ''}
    </div>`;
  const paths = section.querySelector('.customer-paths');
  for (const [kind, title, detail, number] of services) {
    const a = document.createElement('a');
    a.className = 'customer-path'; a.href = '#customer-consult'; a.dataset.customerKind = kind;
    const num = document.createElement('span'); num.className = 'customer-path-num'; num.textContent = number;
    const heading = document.createElement('h3'); heading.textContent = title;
    const description = document.createElement('p'); description.textContent = detail;
    const action = document.createElement('span'); action.className = 'customer-path-action'; action.textContent = '상담 준비하기 ↗';
    a.append(num, heading, description, action); paths.append(a);
  }
  hero.after(section);
  const previousPaths = main.querySelector('.expert-services');
  if (previousPaths) previousPaths.hidden = true;

  const consult = document.createElement('section');
  consult.id = 'customer-consult'; consult.className = 'customer-consult';
  consult.setAttribute('aria-labelledby', 'customer-consult-title');
  consult.innerHTML = `
    <div class="customer-wrap customer-consult-grid">
      <div class="customer-consult-copy"><p class="customer-kicker">부담 없이 시작하는 골프 상담</p>
        <h2 id="customer-consult-title">어려운 용어 대신,<br>궁금한 것부터요.</h2>
        <p>이름이나 연락처를 적지 않아도 돼요.<br>내용을 준비하고 카카오톡에서 직접 보내주세요.</p>
        <ol><li>상담 주제 고르기</li><li>궁금한 내용 준비하기</li><li>카카오톡에서 직접 보내기</li></ol>
        <a class="customer-phone" href="tel:01031316436">전화로 문의하기 <span>010-3131-6436</span></a>
      </div>
      <div class="customer-form-panel">
        <form id="customer-form">
          <label for="customer-kind">무엇이 궁금하세요?</label>
          <select id="customer-kind" name="kind"><option>레슨</option><option>피팅</option><option>클럽 구매</option><option>중고 판매</option><option>기타 문의</option></select>
          <label for="customer-message">궁금한 내용 <span class="customer-optional">선택</span></label>
          <textarea id="customer-message" name="message" maxlength="1000" rows="3" aria-describedby="customer-message-help" placeholder="예: 골프가 처음인데 레슨을 받아보고 싶어요."></textarea>
          <p id="customer-message-help" class="customer-help">이름·전화번호·주소 등 개인정보는 적지 마세요.</p>
          <button class="customer-primary" type="submit">상담 내용 준비하기 <span aria-hidden="true">→</span></button>
        </form>
        <div id="customer-draft-panel" hidden>
          <label for="customer-draft">카카오톡에 보낼 내용</label>
          <textarea id="customer-draft" readonly rows="5"></textarea>
          <button id="customer-copy" class="customer-secondary" type="button">내용 복사하기</button>
          <a class="customer-primary customer-chat" href="${kakao}" target="_blank" rel="noopener noreferrer">카카오톡 열고 직접 보내기 ↗</a>
        </div>
        <p id="customer-status" class="customer-status" role="status" aria-live="polite"></p>
        <p class="customer-help customer-disclosure">연결되는 곳은 그룹 오픈채팅이에요. 개인정보는 올리지 마세요. 이 화면에서는 내용이 저장·전송되지 않으며, 결제나 예약이 확정되지 않아요.</p>
      </div>
    </div>`;
  const oldConsult = document.getElementById('reserve');
  if (oldConsult) oldConsult.before(consult); else section.after(consult);

  const kind = document.getElementById('customer-kind');
  const message = document.getElementById('customer-message');
  const draft = document.getElementById('customer-draft');
  const panel = document.getElementById('customer-draft-panel');
  const status = document.getElementById('customer-status');
  function invalidateDraft() {
    panel.hidden = true; draft.value = ''; status.textContent = '';
  }
  kind.addEventListener('change', invalidateDraft); message.addEventListener('input', invalidateDraft);
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-customer-kind]');
    if (!link) return;
    kind.value = link.dataset.customerKind; invalidateDraft();
    // Preserve native anchor navigation, including modifier-key/new-tab behavior.
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
      requestAnimationFrame(() => kind.focus({preventScroll: true}));
    }
  });
  document.getElementById('customer-form').addEventListener('submit', event => {
    event.preventDefault();
    draft.value = `[하람골프 상담 문의]\n상담 주제: ${kind.value}\n${message.value.trim() || '상담 가능한 내용과 이용 방법을 알고 싶어요.'}`;
    panel.hidden = false;
    status.textContent = '내용을 준비했어요. 복사한 뒤 카카오톡에서 직접 보내주세요. 아직 접수된 상태는 아니에요.';
    draft.focus({preventScroll: true});
  });
  document.getElementById('customer-copy').addEventListener('click', async () => {
    const value = draft.value;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      if (panel.hidden || draft.value !== value) return;
      status.textContent = '복사했어요. 카카오톡을 열어 붙여넣고 직접 보내주세요. 아직 접수된 상태는 아니에요.';
    } catch (_) {
      if (panel.hidden || draft.value !== value) return;
      draft.focus(); draft.select();
      status.textContent = '자동 복사가 제한됐어요. 위 내용을 길게 누르거나 선택해 직접 복사한 뒤 카카오톡에 보내주세요.';
    }
  });
  // Current public home keeps its existing detailed reservation form available.
  if (oldConsult) {
    const details = document.createElement('details'); details.className = 'customer-detailed';
    const summary = document.createElement('summary'); summary.textContent = '날짜·시간을 정해서 문의하고 싶어요';
    oldConsult.before(details); details.append(summary, oldConsult);
    const reveal = () => {
      const target = /^#[\w-]+$/.test(location.hash) ? document.querySelector(location.hash) : null;
      if (location.hash === '#reserve' || (target && oldConsult.contains(target))) {
        details.open = true;
      }
    };
    reveal(); window.addEventListener('hashchange', reveal);
    document.addEventListener('click', event => {
      if (event.target.closest('a[href="#reserve"]')) details.open = true;
    });
  }

  const mobile = document.createElement('nav');
  mobile.className = 'customer-mobile'; mobile.setAttribute('aria-label', '빠른 메뉴');
  mobile.innerHTML = `<a href="${shop}">클럽 둘러보기</a><a class="customer-mobile-main" href="#customer-consult">상담 시작하기 <span aria-hidden="true">↗</span></a>`;
  document.body.append(mobile);
  document.querySelectorAll('.mobile-quick').forEach(e => { e.hidden = true; });
})();
