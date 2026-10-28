const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage();
 await page.goto('http://localhost:3000');
 await page.locator('[name=name]').fill('Local Test');await page.locator('[name=email]').fill('visitor@example.com');await page.locator('[name=subject]').fill('Test');await page.locator('[name=message]').fill('This is a browser test message');
 let calls=0, release;const pending=new Promise(r=>release=r);
 await page.route('**/api/contact',async route=>{calls++;await pending;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({accepted:true,messageId:'mock-id'})});});
 await page.locator('.pro-send-btn').click();await page.waitForTimeout(100);
 assert.equal(await page.locator('.pro-send-btn').isDisabled(),true);
 await page.locator('.pro-contact-form').evaluate(f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 release();await page.waitForFunction(()=>document.getElementById('contactFormStatus').textContent.includes('accepted'));
 assert.equal(calls,1);assert.equal(await page.locator('[name=name]').inputValue(),'');assert.equal(await page.locator('.pro-send-btn').isEnabled(),true);
 await page.unroute('**/api/contact');
 for(const mode of ['network','unexpected','authentication']) {
 await page.locator('[name=name]').fill('Local Test');await page.locator('[name=email]').fill('visitor@example.com');await page.locator('[name=subject]').fill('Test');await page.locator('[name=message]').fill('This is a browser test message');
 await page.route('**/api/contact',route=>mode==='network'?route.abort():route.fulfill({status:502,contentType:mode==='unexpected'?'text/html':'application/json',body:mode==='unexpected'?'<html>Error</html>':JSON.stringify({error:'Email provider authentication failed.'})}));
 await page.locator('.pro-send-btn').click();await page.waitForFunction(()=>!document.querySelector('.pro-send-btn').disabled);
 assert.equal(await page.locator('[name=name]').inputValue(),'Local Test');
 assert.match(await page.locator('#contactFormStatus').innerText(),mode==='network'?/Network error/:mode==='unexpected'?/Unexpected/:/authentication/);
 await page.unroute('**/api/contact');
 }
 for(const path of ['/.env','/lib/contact.js','/server.js','/.git/config']){const r=await page.request.get('http://localhost:3000'+path);assert.equal(r.status(),404);}
 console.log('PASS: duplicate prevention, sending state, success reset, failure retention/restoration, network, non-JSON, authentication feedback, private files blocked. All email responses mocked; no live email sent.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
