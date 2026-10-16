'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const base='http://127.0.0.1:8765/';
const screenshotDir=path.resolve('qa/screenshots/campaign-account');
fs.mkdirSync(screenshotDir,{recursive:true});
(async()=>{
const browser=await chromium.launch({headless:true});
try{
for(const width of [375,390,1280]){
  const page=await browser.newPage({viewport:{width,height:812},deviceScaleFactor:1});
  const problems=[];
  page.on('pageerror',e=>problems.push(e.message));
  for(const file of ['','shop.html','fitting.html','checkout.html','login.html','signup.html']){
    const label=file||'index.html';
    const res=await page.goto(base+file,{waitUntil:'networkidle'});
    if(!res||!res.ok())throw Error(label+': bad HTTP status');
    const launch=page.locator('#hc-launcher');
    const panel=page.locator('#hc-widget');
    if(!await launch.isVisible())throw Error(label+': missing chat launcher @'+width);
    if(await panel.isVisible())throw Error(label+': chat unexpectedly open');
    if(file==='shop.html'){
      await page.locator('#search').fill('GT2');
      const count=(await page.locator('#count').textContent()||'');
      if(!count.includes('1개'))throw Error('Shop model search failed @'+width+': '+count);
      await page.locator('#search').fill('');
      await page.locator('button[data-filter="중고"]').click();
      const used=(await page.locator('#count').textContent()||'');
      if(!used.includes('2개'))throw Error('Shop used filter failed @'+width+': '+used);
      await page.locator('button[data-filter="전체"]').click();
      await page.locator('[data-hyram-chat-product]').first().click();
      if(!await panel.isVisible())throw Error('Shop product consultation did not open chat @'+width);
      const draft=await page.locator('#hc-input').inputValue();
      if(!draft.includes('가격, 재고와 샤프트'))throw Error('Shop product was not prefilled @'+width);
      await page.keyboard.press('Escape');
    }
    await launch.click();
    if(!await panel.isVisible())throw Error(label+': opening chat failed');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    if(overflow)throw Error(label+': horizontal overflow @'+width);
    const quick=page.locator('#hc-quick button');
    if(await quick.count()!==6)throw Error(label+': six quick services expected');
    await page.screenshot({path:path.join(screenshotDir,'chat-'+width+'-'+(file||'index.html').replace('.html','')+'.png')});
    if(file===''){
      await page.locator('[data-topic="club"]').click();
      const link=page.locator('#hc-chat-scroll a[href="shop.html"]').last();
      if(!await link.isVisible())throw Error('Shop CTA not shown @'+width);
      await page.locator('#hc-input').fill('피팅 상담이 궁금해요');
      await page.locator('#hc-send').click();
      if(!await page.locator('#hc-chat-scroll a[href="fitting.html#custom"]').last().isVisible())throw Error('Guided free text failed @'+width);
    }
    await page.keyboard.press('Escape');
    if(await panel.isVisible())throw Error(label+': Escape did not close');
    console.log('PASS chat '+label+' '+width+'px');
  }
  if(problems.length)throw Error('Browser console errors '+width+': '+problems.join('; '));
  await page.close();
}
}finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
