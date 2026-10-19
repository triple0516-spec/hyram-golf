'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base='http://127.0.0.1:8765/';
const out=path.resolve('qa/screenshots/campaign-account');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  for (const width of [375,390,1280]) {
   const page=await browser.newPage({viewport:{width,height:812},deviceScaleFactor:1});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   for (const part of ['','shop.html','login.html','signup.html']) {
    const label=part||'index.html';
    const response=await page.goto(base+part,{waitUntil:'networkidle'});
    if (!response || !response.ok()) throw Error(label+': HTTP failure');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
    if (overflow) throw Error(label+': horizontal overflow @'+width);
    if (part===''||part==='shop.html') {
     const count=await page.locator('.hyram-campaign .hc-card').count();
     if(count!==3) throw Error(label+': expected 3 campaign cards, got '+count);
     if(!await page.locator('a[href="login.html"]').first().isVisible()) throw Error(label+': login menu hidden');
     if(!await page.locator('a[href="signup.html"]').first().isVisible()) throw Error(label+': signup menu hidden');
    } else {
     if(!await page.locator('fieldset[disabled]').isVisible()) throw Error(label+': credentials must be disabled');
     if(await page.locator('.panel fieldset button[type="submit"]:enabled').count()) throw Error(label+': live signup/login submit exposed');
    }
    await page.screenshot({path:path.join(out,width+'-'+(part||'index.html').replace('.html','')+'.png'),fullPage:true});
    console.log('PASS '+label+' @'+width+'px — no horizontal overflow; expected UI present');
   }
   await page.goto(base,{waitUntil:'networkidle'});
   await page.locator('.hyram-account-links a[href="signup.html"]').click();
   if(!page.url().endsWith('/signup.html')) throw Error('Home signup navigation failed @'+width);
   await page.goto(base+'shop.html',{waitUntil:'networkidle'});
   await page.locator('.hyram-campaign a[href="fitting.html#custom"]').click();
   if(!page.url().includes('/fitting.html#custom')) throw Error('Custom LAB CTA navigation failed @'+width);
   if(errors.length)throw Error('Page JS errors @'+width+': '+errors.join(' | '));
   console.log('PASS navigation + browser JavaScript @'+width+'px');
   await page.close();
  }
 } finally {await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
