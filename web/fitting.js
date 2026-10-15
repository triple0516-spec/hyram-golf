'use strict';
/* HYRAM MY FITTING v1 - client-only prototype. No payments, backend accounts or external sync. */
(() => {
  const KEY='hyram-my-fitting-v1', brands=Array.isArray(window.HYRAM_BRANDS)?window.HYRAM_BRANDS:[];
  const $=id=>document.getElementById(id);
  const defaultState=()=>({measurements:[],builds:[],care:[]});
  let data;
  try {
    const saved=JSON.parse(localStorage.getItem(KEY)||'null');
    data=saved && ['measurements','builds','care'].every(x=>Array.isArray(saved[x])) ? saved : defaultState();
  } catch {data=defaultState();}
  const stateSave=()=>{
    try {localStorage.setItem(KEY,JSON.stringify(data));return true;}
    catch {alert('브라우저 저장에 실패했어요. 저장 공간 또는 개인정보 보호 설정을 확인해 주세요.');return false;}
  };
  const newId=()=>String(Date.now())+'-'+Math.random().toString(36).slice(2,9);
  const div=(cls,txt)=>{const el=document.createElement('div');if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;};
  const make=(tag,txt)=>{const e=document.createElement(tag);if(txt!==undefined)e.textContent=String(txt);return e;};
  const fieldData=form=>Object.fromEntries(new FormData(form).entries());
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});
  const cleanValue=(n,min,max)=>{
    const x=Number(n);
    return Number.isFinite(x)&&x>=min&&x<=max?x:null;
  };
  const go=section=>document.getElementById(section)?.scrollIntoView({behavior:'smooth',block:'start'});
  const empty=(root,msg)=>{root.replaceChildren(div('placeholder',msg));};
  const showStatus=(id,msg)=>$(id).textContent=msg;
  // Simple brand discovery using editorial focus tags; never claims this is a validated fitting algorithm.
  const goals={direction:['관용성','피팅','정확성'],distance:['비거리','기술'],feel:['타구감','컨트롤'],ease:['경량','관용성'],custom:['커스텀','피팅','프리미엄']};
  const types={driver:['TITLEIST','TAYLORMADE','CALLAWAY','PING','PXG','COBRA','XXIO','HONMA','YAMAHA','BRIDGESTONE','MAJESTY','PRGR','YONEX','ONOFF','TOUR EDGE'],iron:['TITLEIST','MIZUNO','SRIXON','PING','PXG','MIURA','EPON','ROMARO','HONMA','BRIDGESTONE','WILSON','FOURTEEN','CALLAWAY','TAYLORMADE'],wedge:['CLEVELAND','FOURTEEN','TITLEIST','MIZUNO','SRIXON','PING','CALLAWAY'],putter:['ODYSSEY','SCOTTY CAMERON','PING','TAYLORMADE','PXG']};
  $('matchForm').addEventListener('submit',e=>{
    e.preventDefault();
    const q=fieldData(e.currentTarget), preferences=goals[q.goal]||[];
    const candidates=brands.filter(b=>(types[q.type]||[]).includes(b.name));
    candidates.sort((a,b)=>preferences.filter(t=>b.tags.includes(t)).length-preferences.filter(t=>a.tags.includes(t)).length);
    const root=$('matchResults');root.replaceChildren();
    candidates.slice(0,3).forEach((b,i)=>{
      const card=div('card');card.append(make('small','후보 '+(i+1)+' · '+b.category));
      const h=make('h3',b.ko+' · '+b.name);card.append(h);
      card.append(make('p',b.focus),make('p',b.note));
      const c=make('small','비교 포인트: '+b.tags.join(' · '));card.append(c);root.append(card);
    });
  });
  // Measurement records and before/after comparisons
  const stages={before:'구매 전',after:'구매 후',check:'재점검'};
  ['performanceForm','careForm'].forEach(id=>{const f=$(id);if(f.elements.date)f.elements.date.value=today();});
  $('performanceForm').addEventListener('submit',e=>{
    e.preventDefault();const f=fieldData(e.currentTarget);
    const values={launch:cleanValue(f.launch,-10,75),spin:cleanValue(f.spin,0,15000),direction:cleanValue(f.direction,-90,90),carry:cleanValue(f.carry,0,450)};
    if(Object.values(values).some(x=>x===null)){showStatus('performanceStatus','숫자 입력 범위를 확인해 주세요.');return;}
    const record={id:newId(),date:f.date,stage:f.stage,club:f.club.trim().slice(0,70),device:f.device.slice(0,60),conditions:f.conditions.slice(0,70),memo:f.memo.slice(0,280),...values};
    if(!record.club){showStatus('performanceStatus','클럽명을 입력해 주세요.');return;}
    data.measurements.push(record);
    if(stateSave()){showStatus('performanceStatus','이 브라우저에 측정 기록을 저장했어요.');e.currentTarget.reset();e.currentTarget.elements.date.value=today();renderMeasurements();}
  });
  function renderMeasurements(){
    const root=$('measureRows');root.replaceChildren();
    const list=data.measurements.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    for(const r of list){
      const tr=make('tr');
      [r.date,stages[r.stage]||r.stage,r.club,r.launch+'°',r.spin+' rpm',r.direction+'°',r.carry+' m'].forEach(v=>{const td=make('td',v);tr.append(td);});
      const td=make('td'),btn=make('button','삭제');btn.type='button';btn.className='secondary';btn.setAttribute('aria-label',r.club+' 측정 기록 삭제');
      btn.addEventListener('click',()=>{if(!confirm('선택한 측정 기록을 삭제할까요?'))return;data.measurements=data.measurements.filter(x=>x.id!==r.id);stateSave();renderMeasurements();});
      td.append(btn);tr.append(td);root.append(tr);
    }
    if(!list.length){const tr=make('tr'),td=make('td','아직 측정 기록이 없어요.');td.colSpan=8;tr.append(td);root.append(tr);}
    const updateOptions=(id,entries)=>{
      const sel=$(id),old=sel.value;sel.replaceChildren();
      entries.forEach(r=>{const opt=make('option',r.date+' · '+r.club+' ('+(stages[r.stage]||r.stage)+')');opt.value=r.id;sel.append(opt);});
      if([...sel.options].some(o=>o.value===old))sel.value=old;
    };
    updateOptions('compareBefore',list.filter(r=>r.stage==='before'));
    updateOptions('compareAfter',list.filter(r=>r.stage==='after'||r.stage==='check'));
    if(!list.length)$('metrics').replaceChildren();
  }
  $('compareBtn').addEventListener('click',()=>{
    const before=data.measurements.find(r=>r.id===$('compareBefore').value),after=data.measurements.find(r=>r.id===$('compareAfter').value);
    const root=$('metrics');root.replaceChildren();
    if(!before||!after){empty(root,'구매 전·후 측정 기록을 각각 입력하면 차이를 계산할 수 있어요.');return;}
    for(const [field,label,unit] of [['launch','발사각','°'],['spin','백스핀','rpm'],['direction','출발 방향','°'],['carry','캐리','m']]){
      const delta=after[field]-before[field],box=div('metric');
      box.append(make('small',label),make('strong',(delta>0?'+':'')+Number(delta.toFixed(2)).toLocaleString('ko-KR')+unit),make('small',before[field]+unit+' → '+after[field]+unit));
      root.append(box);
    }
  });
  // Build proposals, two independent candidates can be selected and quoted together.
  const brandSel=$('customBrand');brands.forEach(b=>{const o=make('option',b.ko+' ('+b.name+')');o.value=b.name;brandSel.append(o);});
  $('customForm').addEventListener('submit',e=>{
    e.preventDefault();const f=fieldData(e.currentTarget);
    if(!f.head.trim()||!f.shaft.trim()){showStatus('customStatus','헤드와 샤프트 정보를 입력해 주세요.');return;}
    const build={...f,id:newId(),created:today()};data.builds.push(build);
    if(stateSave()){showStatus('customStatus','커스텀 구성 후보를 저장했어요.');e.currentTarget.reset();renderBuilds();}
  });
  function renderBuilds(){
    const root=$('buildCards');root.replaceChildren();
    if(!data.builds.length){empty(root,'아직 저장한 커스텀 구성이 없어요.');return;}
    data.builds.slice().reverse().forEach(b=>{
      const card=div('card');card.append(make('small','CUSTOM LAB · '+b.created),make('h3',b.brand+' · '+b.head));
      const spec=[b.type,b.shaft,b.flex,b.weight?(b.weight+'g'):null,b.loft?(b.loft+'° 로프트'):null,b.lie?(b.lie+'° 라이'):null,b.length?(b.length+'" 길이'):null,b.grip?('그립 '+b.grip):null].filter(Boolean).join(' / ');
      card.append(make('p',spec),make('p',b.reason||'상세 조합은 담당자 확인이 필요합니다.'));
      const label=make('label'),check=make('input');check.type='checkbox';check.className='buildPick';check.value=b.id;check.style.width='auto';label.append(check,make('span','견적 비교에 포함'));card.append(label);
      const del=make('button','후보 삭제');del.type='button';del.className='secondary';del.style.marginTop='10px';
      del.addEventListener('click',()=>{if(!confirm('선택한 구성 후보를 삭제할까요?'))return;data.builds=data.builds.filter(x=>x.id!==b.id);stateSave();renderBuilds();});
      card.append(del);root.append(card);
    });
  }
  $('requestQuote').addEventListener('click',()=>{
    const ids=[...document.querySelectorAll('.buildPick:checked')].map(x=>x.value);
    if(ids.length===0||ids.length>2){alert('비교할 구성을 1~2개 선택해 주세요.');return;}
    const list=data.builds.filter(x=>ids.includes(x.id));
    const body=list.map((b,i)=>[String(i+1)+'. '+b.brand+' '+b.head,b.type+' / '+b.shaft+' '+b.flex,'로프트 '+(b.loft||'미정')+'°, 라이 '+(b.lie||'미정')+'°, 길이 '+(b.length||'미정')+' inch','그립 '+(b.grip||'미정'),'목표: '+(b.reason||'미정')].join('\n')).join('\n\n');
    setShare('[HYRAM GOLF CUSTOM LAB 견적 상담]\n'+body+'\n\n실제 제작 가능 여부·총금액·납기 확인 부탁드립니다.');go('checkout');
  });
  // Trade, care and post-purchase follow-ups - planning only; no push/email notification
  $('careForm').addEventListener('submit',e=>{
    e.preventDefault();const f=fieldData(e.currentTarget);
    if(!f.club.trim()){showStatus('careStatus','클럽명을 입력해 주세요.');return;}
    data.care.push({...f,id:newId()});
    if(stateSave()){showStatus('careStatus','이 브라우저에 관리 일정을 저장했어요. 알림은 발송되지 않습니다.');e.currentTarget.reset();e.currentTarget.elements.date.value=today();renderCare();}
  });
  function renderCare(){
    const root=$('careList');root.replaceChildren();
    if(!data.care.length){empty(root,'매입·보상판매 또는 재점검 일정을 기록해 보세요.');return;}
    data.care.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(c=>{
      const card=div('card');card.style.marginBottom='10px';
      card.append(make('small',c.date+' · '+c.kind),make('h3',c.club),make('p','상태: '+c.condition+' / '+(c.memo||'메모 없음')));
      const del=make('button','기록 삭제');del.type='button';del.className='secondary';
      del.addEventListener('click',()=>{if(!confirm('이 관리 기록을 삭제할까요?'))return;data.care=data.care.filter(x=>x.id!==c.id);stateSave();renderCare();});
      card.append(del);root.append(card);
    });
  }
  const setShare=s=>{$('share').value=s;showStatus('shareStatus','상담 요약이 준비됐어요. 복사해 담당자에게 전송해 주세요.');};
  $('requestCare').addEventListener('click',()=>{
    if(!data.care.length){alert('관리 기록을 먼저 작성해 주세요.');return;}
    const text=data.care.slice(-5).map(c=>c.date+' · '+c.kind+' / '+c.club+' / 상태 '+c.condition+' / '+(c.memo||'메모 없음')).join('\n');
    setShare('[HYRAM GOLF TRADE & CARE 상담]\n'+text+'\n\n상담 가능 여부와 실제 감정·방문 일정을 확인해 주세요.');
  });
  $('copySummary').addEventListener('click',()=>{
    const m=data.measurements.slice(-5).map(x=>x.date+' '+(stages[x.stage]||x.stage)+' '+x.club+' / 탄도 '+x.launch+'° / 백스핀 '+x.spin+'rpm / 방향 '+x.direction+'° / 캐리 '+x.carry+'m').join('\n');
    const b=data.builds.slice(-2).map(x=>x.brand+' '+x.head+' / '+x.shaft+' '+x.flex).join('\n');
    const c=data.care.slice(-3).map(x=>x.date+' '+x.kind+' '+x.club).join('\n');
    setShare('[HYRAM GOLF MY FITTING 요약]\n측정 기록:\n'+(m||'미입력')+'\n\n커스텀 구성:\n'+(b||'미입력')+'\n\n관리·재점검:\n'+(c||'미입력')+'\n\n담당자의 검토와 견적 안내를 부탁드립니다.');
  });
  $('copyBtn').addEventListener('click',async()=>{
    const val=$('share').value;if(!val){showStatus('shareStatus','먼저 상담 요약을 만들어 주세요.');return;}
    try{await navigator.clipboard.writeText(val);showStatus('shareStatus','복사됐어요. 카카오톡에서 붙여넣어 주세요.');}
    catch{$('share').focus();$('share').select();showStatus('shareStatus','자동 복사 제한. 내용을 선택했으니 직접 복사해 주세요.');}
  });
  $('exportBtn').addEventListener('click',()=>{
    const out={format:'hyram-fitting-local-v1',exportedAt:new Date().toISOString(),data};
    const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
    const u=URL.createObjectURL(blob),a=make('a');a.href=u;a.download='hyram-my-fitting-'+today()+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1200);
  });

  $('importBtn').addEventListener('click',()=>$('importFile').click());
  $('importFile').addEventListener('change',async e=>{
    const file=e.target.files && e.target.files[0];
    if(!file)return;
    e.target.value='';
    if(file.size>1024*1024){showStatus('shareStatus','백업 파일이 너무 큽니다. (최대 1MB)');return;}
    try{
      const json=JSON.parse(await file.text());
      if(json.format!=='hyram-fitting-local-v1'||!json.data)throw Error('형식 불일치');
      const next=json.data;
      if(!['measurements','builds','care'].every(k=>Array.isArray(next[k])&&next[k].length<=1000))throw Error('목록 범위 초과');
      for(const m of next.measurements){
        if(!m||!['before','after','check'].includes(m.stage)||!['launch','spin','direction','carry'].every(k=>Number.isFinite(m[k]))||typeof m.club!=='string'||m.club.length>70)throw Error('측정 데이터 이상');
      }
      for(const b of next.builds){
        if(!b||typeof b.brand!=='string'||b.brand.length>50||typeof b.head!=='string'||b.head.length>70||typeof b.shaft!=='string'||b.shaft.length>90)throw Error('커스텀 데이터 이상');
      }
      for(const c of next.care){
        if(!c||typeof c.club!=='string'||c.club.length>85||typeof c.kind!=='string'||c.kind.length>30)throw Error('관리 데이터 이상');
      }
      if(!confirm('현재 기록을 이 백업 파일의 기록으로 교체할까요? 현재 기록은 백업하지 않으면 복구할 수 없습니다.'))return;
      data={measurements:next.measurements,builds:next.builds,care:next.care};
      stateSave();renderMeasurements();renderBuilds();renderCare();$('metrics').replaceChildren();
      showStatus('shareStatus','백업 기록을 불러왔어요. 이 브라우저에만 저장됩니다.');
    }catch{showStatus('shareStatus','유효하지 않은 HYRAM 백업 파일입니다. 데이터는 변경하지 않았어요.');}
  });
  $('clearBtn').addEventListener('click',()=>{
    if(!confirm('이 브라우저에 저장된 모든 피팅·구성·관리 기록을 지울까요? 백업이 없으면 복구할 수 없습니다.'))return;
    data=defaultState();stateSave();renderMeasurements();renderBuilds();renderCare();$('metrics').replaceChildren();$('share').value='';showStatus('shareStatus','이 브라우저의 저장 기록을 초기화했습니다.');
  });
  renderMeasurements();renderBuilds();renderCare();
})();