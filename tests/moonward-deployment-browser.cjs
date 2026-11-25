const {chromium}=require('../../.runtime/tools/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4185/playground/moonward/');await page.locator('#enter-game').click();await page.locator('#launch').click();await page.locator('[data-recall="iron"]').waitFor();
 assert(await page.locator('[data-resource="ice"]').isDisabled());assert(await page.locator('[data-recall="ice"]').isDisabled());
 await page.locator('[data-recall="iron"]').tap();assert.equal(await page.evaluate(()=>G.idle(current())),1);assert.equal(await page.locator('[data-deposit="iron"] output').textContent(),'1');
 await page.locator('[data-resource="ice"]').tap();assert.deepEqual(await page.evaluate(()=>({...current().assignments})),{iron:1,rock:0,ice:1});assert(await page.locator('[data-resource="rock"]').isDisabled());
 await page.locator('[data-recall="ice"]').tap();assert.equal(await page.evaluate(()=>G.idle(current())),1);
 await page.reload();await page.locator('#enter-game').click();assert.equal(await page.evaluate(()=>G.idle(current())),1);assert(await page.locator('[data-resource="rock"]').isEnabled());
 await page.locator('[data-resource="rock"]').tap();assert.equal(await page.locator('[data-deposit="rock"] output').textContent(),'1');
 await page.locator('[data-recall="iron"]').tap();await page.locator('[data-recall="rock"]').tap();
 await page.waitForFunction(()=>colonyScene.drones.length===2&&colonyScene.drones.every(d=>d.phase==='idle'));assert.equal(await page.evaluate(()=>G.idle(current())),2);
 for(const width of [320,390,700]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));for(const key of ['iron','rock','ice']){const box=await page.locator(`[data-resource="${key}"]`).boundingBox();assert(box.width>=30&&box.height>=36);}}
 assert.deepEqual(errors,[]);console.log('PASS: touch arrows, exact counts, available pool, disabled limits, idle persistence, recalled drone return and mobile layout');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
