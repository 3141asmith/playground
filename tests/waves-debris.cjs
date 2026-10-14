const {chromium}=require('../../.runtime/tools/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>Math.random=()=>.5);await page.clock.install();
  await page.goto((process.env.PLAYGROUND_URL||'http://127.0.0.1:4185/playground/')+'waves/');await page.clock.pauseAt(await page.evaluate(()=>Date.now()+1000));
  const debris=page.locator('#sea-debris');assert(!(await debris.isVisible()));await page.locator('#real-life').check();
  const advance=seconds=>page.evaluate(seconds=>{waveLab.advance(seconds);waveLab.render();},seconds);
  await advance(52);assert(!(await debris.isVisible()));await advance(1);assert.equal(await debris.getAttribute('data-kind'),'boot');
  await advance(8);const first=await debris.getAttribute('transform');await advance(2);const second=await debris.getAttribute('transform');assert.notEqual(first,second);
  const position=await page.evaluate(()=>{const g=document.getElementById('sea-debris'),t=g.transform.baseVal.getItem(0).matrix,width=document.getElementById('wave').viewBox.baseVal.width,x=(t.e-waveLab.screenX(0))*12/(waveLab.screenX(12)-waveLab.screenX(0));return {x:t.e,y:t.f,expected:waveLab.screenY(waveLab.displacement(x))+4,width};});
  assert(position.x>0&&position.x<position.width);assert(Math.abs(position.y-position.expected)<.001);assert(await debris.isVisible());
  await page.clock.runFor(1000);assert.equal(await debris.getAttribute('transform'),second);await page.screenshot({path:'artifacts/waves-debris-boot.png'});
  await page.locator('#real-life').uncheck();await advance(10);assert(!(await debris.isVisible()));await page.locator('#real-life').check();assert.equal((await debris.getAttribute('transform')).match(/translate\(([^ ]+)/)[1],second.match(/translate\(([^ ]+)/)[1]);
  await advance(23);assert(!(await debris.isVisible()));await advance(97);assert(!(await debris.isVisible()));await advance(1);assert.equal(await debris.getAttribute('data-kind'),'driftwood');await advance(12);assert(await debris.isVisible());
  await page.locator('#restart').click();assert(!(await debris.isVisible()));await page.locator('#reverse').click();await advance(53);await advance(8);const rightX=await debris.evaluate(g=>g.transform.baseVal.getItem(0).matrix.e);await advance(2);assert(await debris.evaluate(g=>g.transform.baseVal.getItem(0).matrix.e)<rightX);
  await page.locator('#restart').click();await page.evaluate(()=>Math.random=()=>0);await advance(53);assert.equal(await debris.getAttribute('data-kind'),'seaweed');await advance(12);assert(await debris.isVisible());
  await page.locator('#restart').click();await page.locator('#screensaver').click();await page.clock.runFor(50);await advance(36);await advance(10);assert(await debris.isVisible());await page.locator('#exit-screensaver').click();assert.deepEqual(errors,[]);
  console.log('PASS occasional boot/seaweed/driftwood, surface bobbing, pause, abstract-view hiding, gaps, reverse drift, restart and screensaver');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
