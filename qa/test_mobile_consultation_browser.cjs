'use strict';
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const base = 'http://127.0.0.1:8765/';
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    for(const width of [360,375,390,414]){
      const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
      const errors=[];
      page.on('pageerror', e=>errors.push(e.message));
      const res=await page.goto(base,{waitUntil:'networkidle'});
      assert(res&&res.ok(),'homepage unavailable');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'horizontal overflow @'+width);
      const account=await page.locator('.premium-header .hyram-account-links a').evaluateAll(links=>links.map(a=>({text:a.textContent,height:a.getBoundingClientRect().height,width:a.getBoundingClientRect().width})));
      assert(account.length>=2,'account links absent');
      for(const a of account) assert(a.height>=44,'mobile account link below 44px target: '+JSON.stringify(a));
      const manual=page.locator('#consultForm a[href="https://open.kakao.com/o/gaQIRfSi"]');
      assert(await manual.isVisible(),'manual open-chat fallback missing');
      await page.locator('#consultForm select[name=kind]').selectOption({label:'클럽 피팅'});
      await page.locator('#consultForm input[name=target]').fill('부산 드라이버 상담');
      await page.locator('#consultForm textarea[name=detail]').fill('9도 헤드와 샤프트 상담');
      await page.evaluate(()=>{
        window.__copyText='';
        window.__popupCalls=[];
        window.__resolveCopy=null;
        Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:text=>{
          window.__copyText=text;
          return new Promise(resolve=>{window.__resolveCopy=resolve;});
        }}});
        window.open=(url,target,features)=>{window.__popupCalls.push({url,target,features});return null;};
      });
      await page.locator('#consultForm button[type=submit]').click();
      await page.waitForFunction(()=>window.__popupCalls.length===1);
      const before=await page.evaluate(()=>({popup:window.__popupCalls[0],text:window.__copyText,pending:typeof window.__resolveCopy==='function'}));
      assert(before.pending,'clipboard promise not pending');
      assert(before.popup.url==='https://open.kakao.com/o/gaQIRfSi','incorrect popup URL');
      assert(before.text.includes('부산 드라이버 상담'),'copy payload missing target');
      await page.evaluate(()=>window.__resolveCopy());
      await page.waitForFunction(()=>document.getElementById('consultStatus').textContent.includes('복사됐습니다'));
      await page.evaluate(()=>{navigator.clipboard.writeText=()=>Promise.reject(new Error('blocked'));});
      await page.locator('#consultForm button[type=submit]').click();
      await page.waitForFunction(()=>document.getElementById('consultStatus').textContent.includes('자동 복사가 제한'));
      assert(await page.locator('#consultStatus').innerText().then(x=>x.includes('9도 헤드와 샤프트 상담')),'manual copy fallback incomplete');
      const after=await page.evaluate(()=>window.__popupCalls.length);
      assert(after===2,'popup did not invoke for clipboard error path');
      assert(errors.length===0,'browser JS errors: '+errors.join(' | '));
      console.log('PASS HYRAM mobile consultation: '+width+'px targets, synchronous popup, copy success/failure, direct link');
      await page.close();
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
