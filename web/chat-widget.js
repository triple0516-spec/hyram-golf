
(function(){
'use strict';
if(document.getElementById('hyram-concierge-root'))return;
var endpoint=typeof window.HYRAM_AI_ENDPOINT==='string'&&/^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(window.HYRAM_AI_ENDPOINT)?window.HYRAM_AI_ENDPOINT:null;
var root=document.createElement('div');
root.id='hyram-concierge-root';
root.innerHTML='<button type="button" class="hc-launcher" id="hc-launcher" aria-label="HYRAM 상담 도우미 열기" aria-expanded="false" aria-controls="hc-widget"><span class="hc-spark" aria-hidden="true">✦</span>HYRAM 상담하기</button>'
+'<section id="hc-widget" class="hc-widget" role="region" aria-label="HYRAM 상담 도우미" hidden>'
+'<header class="hc-top"><span class="hc-avatar" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="12" width="32" height="26" rx="10" fill="#7B78CD"/><rect x="12" y="16" width="24" height="16" rx="7" fill="#F5F4FF"/><circle cx="19" cy="24" r="2.7" fill="#5958B0"/><circle cx="29" cy="24" r="2.7" fill="#5958B0"/><path d="M20 30 Q24 33 28 30" stroke="#5958B0" stroke-width="2" stroke-linecap="round"/><path d="M24 12V7" stroke="#6563A9" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="6" r="3" fill="#BEADEE"/></svg></span>'
+'<div class="hc-heading"><strong>HYRAM AI 상담 <span class="hc-mode" id="hc-mode">안내</span></strong><small><span class="hc-dot"></span><span id="hc-mode-text">상담 도우미 · 간단한 질문에 답변해요</span></small></div>'
+'<button id="hc-close" class="hc-close" type="button" aria-label="상담창 닫기">×</button></header>'
+'<div class="hc-chat-scroll" id="hc-chat-scroll" role="log" aria-live="polite" aria-relevant="additions">'
+'<div class="hc-message hc-bot">안녕하세요! 👋<br>HYRAM GOLF 상담 도우미입니다.<br>클럽 구매, 피팅, 레슨, 중고클럽, 골프장 부킹 등을 편하게 물어보세요.</div>'
+'<div class="hc-quick" id="hc-quick">'
+'<button type="button" data-topic="club">클럽 추천받기</button><button type="button" data-topic="fitting">피팅 상담하기</button><button type="button" data-topic="lesson">레슨 예약하기</button>'
+'<button type="button" data-topic="used">중고클럽 문의</button><button type="button" data-topic="booking">골프장 부킹</button><button type="button" data-topic="member">회원 혜택</button></div>'
+'<p class="hc-info" id="hc-chat-info">현재는 자동 안내 기능입니다. 실시간 GPT 응답과 예약·결제 확정 기능은 연결 준비 중입니다.</p></div>'
+'<form id="hc-form" class="hc-composer"><input id="hc-input" name="question" type="text" maxlength="500" autocomplete="off" aria-label="상담 질문" placeholder="궁금한 내용을 입력해 주세요"><button class="hc-send" id="hc-send" type="submit" aria-label="메시지 보내기">➤</button></form>'
+'<div class="hc-footer">민감한 개인정보를 입력하지 마세요 · 최종 가격·일정은 담당자 확인</div></section>';
document.body.appendChild(root);
var button=root.querySelector('#hc-launcher');
var panel=root.querySelector('#hc-widget');
var close=root.querySelector('#hc-close');
var scroller=root.querySelector('#hc-chat-scroll');
var form=root.querySelector('#hc-form');
var input=root.querySelector('#hc-input');
var send=root.querySelector('#hc-send');
if(endpoint){root.querySelector('#hc-mode').textContent='AI 연결 설정';root.querySelector('#hc-mode-text').textContent='AI 서버 응답을 확인하며 상담합니다';}
var topics={
 club:{title:'클럽 추천',text:'사용 목적(비거리·방향성), 구력, 원하는 클럽 종류와 예산을 알려주시면 상담 방향을 안내할게요. 실제 재고와 가격은 직원이 확인해 드립니다.',url:'shop.html',label:'클럽 둘러보기'},
 fitting:{title:'맞춤 피팅',text:'탄도·스핀·캐리 기록을 비교하고, 헤드·샤프트·그립 조합을 검토할 수 있어요. 기록은 현재 사용하는 기기의 브라우저에만 보관됩니다.',url:'fitting.html#custom',label:'MY FITTING 시작'},
 lesson:{title:'골프 레슨',text:'입문·스윙교정·비거리 향상 중 목표를 정해 상담해 주세요. 희망 지역과 날짜는 담당자가 확인하며 자동 예약 확정은 지원하지 않습니다.',url:'index.html#consult',label:'레슨 상담 작성'},
 used:{title:'중고클럽 · 보상판매',text:'브랜드, 모델, 샤프트, 상태를 확인한 뒤 매입·보상판매 가능 여부를 상담해요. 사진과 최종 감정은 담당자 확인이 필요합니다.',url:'fitting.html#care',label:'TRADE & CARE 보기'},
 booking:{title:'골프장 · 스크린 부킹',text:'지역, 인원, 희망 날짜와 시간대를 정해 상담할 수 있어요. 실제 예약 가능 여부와 확정은 담당자가 안내합니다.',url:'index.html#consult',label:'부킹 상담 작성'},
 member:{title:'회원 혜택',text:'회원제 혜택은 준비 중이에요. 아직 유료 멤버십 결제나 자동 갱신은 제공하지 않습니다. 정식 오픈 시 운영 조건을 안내할 예정입니다.',url:'signup.html',label:'회원가입 안내'}
};
function append(text,who,link){
 var node=document.createElement('div');node.className='hc-message hc-'+who;node.textContent=text;
 if(link){var wrap=document.createElement('div'),a=document.createElement('a');a.href=link.url;a.textContent=link.label+' →';wrap.appendChild(a);node.appendChild(document.createElement('br'));node.appendChild(wrap);}
 scroller.insertBefore(node,root.querySelector('#hc-chat-info'));
 scroller.scrollTop=scroller.scrollHeight;
}
function quick(topic){
 var t=topics[topic];if(!t)return;
 append(t.title,'user');
 append(t.text,'bot',{url:t.url,label:t.label});
}
function chooseTopic(message){
 var m=message.toLowerCase();
 if(/(중고|보상판매|매입|팔고)/.test(m))return 'used';
 if(/(피팅|샤프트|로프트|그립|스핀|캐리|탄도)/.test(m))return 'fitting';
 if(/(레슨|스윙|교육|입문|강습)/.test(m))return 'lesson';
 if(/(부킹|골프장|스크린|예약)/.test(m))return 'booking';
 if(/(회원|혜택|vip|실버|골드|멤버십)/.test(m))return 'member';
 if(/(클럽|드라이버|아이언|우드|가격|견적|재고|추천)/.test(m))return 'club';
 return null;
}
function toggle(force){
 var open=typeof force==='boolean'?force:panel.hidden;
 panel.hidden=!open;button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'HYRAM 상담 도우미 닫기':'HYRAM 상담 도우미 열기');
 if(open){input.focus()}else{button.focus()}
}
button.addEventListener('click',function(){toggle()});
close.addEventListener('click',function(){toggle(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden){e.preventDefault();toggle(false)}});
document.querySelectorAll('[data-hyram-chat-open]').forEach(function(el){
 el.addEventListener('click',function(e){e.preventDefault();toggle(true)});
});
document.addEventListener('click',function(e){
 var el=e.target.closest('[data-hyram-chat-product]');
 if(!el)return;
 e.preventDefault();
 toggle(true);
 input.value=el.getAttribute('data-hyram-chat-product')+' 제품의 가격, 재고와 샤프트 구성 상담을 받고 싶어요.';
 input.focus();
});
root.querySelectorAll('[data-topic]').forEach(function(el){el.addEventListener('click',function(){quick(el.getAttribute('data-topic'))})});
form.addEventListener('submit',async function(e){
 e.preventDefault();if(send.disabled)return;
 var message=input.value.trim();if(!message)return;
 input.value='';append(message,'user');
 var fallback=chooseTopic(message);
 if(!endpoint){
  if(fallback){var t=topics[fallback];append(t.text,'bot',{url:t.url,label:t.label})}
  else append('질문을 확인했어요. 현재 실시간 AI 답변 기능은 준비 중입니다. 클럽·피팅·레슨·중고·부킹·회원 혜택 중 하나를 선택하시거나 직원에게 문의해 주세요.','bot',{url:'https://open.kakao.com/o/gaQIRfSi',label:'카카오 직원 상담'});
  return;
 }
 send.disabled=true;
 var ctrl=new AbortController(),timer=setTimeout(function(){ctrl.abort()},12000);
 try{
  var res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:message}),signal:ctrl.signal,credentials:'omit'});
  if(!res.ok)throw new Error('AI endpoint unavailable');
  var data=await res.json();
  if(!data||typeof data.answer!=='string'||!data.answer.trim())throw new Error('Empty AI response');
  append(data.answer.slice(0,2400),'bot');
 }catch(err){
  append('현재 실시간 AI 상담에 연결할 수 없어요. 기본 상담 안내로 도와드릴게요.','bot');
  if(fallback){var tt=topics[fallback];append(tt.text,'bot',{url:tt.url,label:tt.label})}
  else append('직원과 상담하시려면 아래 링크를 이용해 주세요.','bot',{url:'https://open.kakao.com/o/gaQIRfSi',label:'카카오 직원 상담'});
 }finally{clearTimeout(timer);send.disabled=false;input.focus()}
});
})();
