const {chromium}=require('../../.runtime/tools/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1200,height:900},hasTouch:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4185/playground/moonward/');await page.locator('#enter-game').click();await page.locator('#launch').click();
  await page.locator('[data-resource="iron"]').waitFor();
  const tooltip=page.locator('#production-tooltip');
  async function hoverScene(kind,key){const p=await page.evaluate(({kind,key})=>(kind==='resource'?colonyScene.deposits.find(d=>d.resource===key):colonyScene.processors.find(d=>d.key===key)),{kind,key});assert(p);const rect=await page.locator('#scene').boundingBox();await page.mouse.move(rect.x+p.x,rect.y+p.y);}
  await hoverScene('resource','iron');await tooltip.waitFor({state:'visible'});assert.match(await tooltip.innerText(),/2 mining drones assigned/);assert.match(await tooltip.innerText(),/Gathering: 2 \/ sec/);
  await page.locator('[data-resource="ice"]').hover();assert.match(await tooltip.innerText(),/0 mining drones assigned/);
  await page.locator('[data-recall="iron"]').click();await page.locator('[data-resource="ice"]').click();await tooltip.waitFor({state:'visible'});await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>current().assignments.ice),1);assert.match(await tooltip.innerText(),/1 mining drone assigned/);assert.match(await tooltip.innerText(),/Gathering: 1 \/ sec/);
  await page.evaluate(()=>{current().smelter=2;current().refinery=3;current().solar=10;render();});
  await page.waitForFunction(()=>colonyScene.processors.length===2);
  await hoverScene('processor','smelter');assert.match(await tooltip.innerText(),/2 processors built/);assert.match(await tooltip.innerText(),/0.5 Alloy \/ sec/);assert.match(await tooltip.innerText(),/Input: 1 Iron ore \/ sec/);
  await hoverScene('processor','refinery');assert.match(await tooltip.innerText(),/3 processors built/);assert.match(await tooltip.innerText(),/0.75 Fuel \/ sec/);assert.match(await tooltip.innerText(),/Input: 1.5 Water ice \/ sec/);
  await page.locator('[data-processor="smelter"]').hover();assert.match(await tooltip.innerText(),/2 processors built/);
  await page.mouse.move(0,0);await tooltip.waitFor({state:'hidden'});
  await page.locator('[data-stock="iron"]').focus();assert.match(await tooltip.innerText(),/ALL COLONIES/);await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>document.activeElement.dataset.stock),'iron');await page.keyboard.press('Escape');await tooltip.waitFor({state:'hidden'});
  await page.setViewportSize({width:320,height:568});
  await page.waitForTimeout(150);
  await page.locator('[data-recall="iron"]').tap();await page.locator('[data-resource="ice"]').tap();await tooltip.waitFor({state:'visible'});assert.match(await tooltip.innerText(),/Water ice/);
  const box=await tooltip.boundingBox();assert(box.x>=0&&box.x+box.width<=320&&box.y>=0&&box.y+box.height<=568);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#map-button').click();await tooltip.waitFor({state:'hidden'});
  assert.deepEqual(errors,[]);console.log('PASS: scene/resource-button hover, live drone counts, gathering rates, processor counts/input/output, keyboard focus, dismissal and touch tooltip bounds');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});



