const {chromium}=require('../../.runtime/tools/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.clock.install();
  await page.goto('http://127.0.0.1:4185/playground/moonward/');await page.locator('#enter-game').click();
  await page.locator('#launch').click();await page.clock.runFor(200);
  assert.equal(await page.evaluate(()=>colonyScene.animate),true);
  await page.locator('[data-recall="iron"]').click();await page.locator('[data-resource="rock"]').click();
  const snapshot=()=>page.evaluate(()=>JSON.parse(JSON.stringify(colonyScene.drones)));
  async function untilPhase(id,phase){for(let i=0;i<120;i++){const d=(await snapshot()).find(d=>d.id===id);if(d.phase===phase)return d;await page.clock.runFor(100);}assert.fail('Drone did not reach '+phase);}
  const start=(await snapshot()).find(d=>d.resource==='rock');assert(start);
  await page.clock.runFor(1700);
  const outbound=(await snapshot()).find(d=>d.id===start.id);
  assert.equal(outbound.phase,'outbound');assert(outbound.x>start.x+20);
  await untilPhase(start.id,'mining');
  await page.clock.runFor(1400);
  const returning=(await snapshot()).find(d=>d.id===start.id);
  assert.equal(returning.phase,'returning');assert.equal(returning.cargo,'rock');assert(returning.x<160);
  const delivered=await untilPhase(start.id,'unloading');
  assert.equal(delivered.phase,'unloading');assert.equal(delivered.x,0);assert.equal(delivered.y,40);
  await page.clock.runFor(800);assert.equal((await snapshot()).find(d=>d.id===start.id).cargo,null);
  for(let cycle=0;cycle<3;cycle++){
   await untilPhase(start.id,'mining');
   const loaded=await untilPhase(start.id,'returning');assert.equal(loaded.cargo,'rock');
   const home=await untilPhase(start.id,'unloading');assert.equal(home.x,0);assert.equal(home.y,40);
   const next=await untilPhase(start.id,'outbound');assert.equal(next.cargo,null);
  }
  // Retasking a moving drone keeps its position and sends it home first.
  const before=await snapshot();
  const deposit=await page.evaluate(()=>colonyScene.deposits.find(d=>d.resource==='ice'));
  await page.locator('#scene').click({position:{x:deposit.x,y:deposit.y}});
  const reassigned=(await snapshot()).find(d=>d.resource==='ice');
  const original=before.find(d=>d.id===reassigned.id);
  assert.equal(reassigned.phase,'returning');assert(Math.hypot(reassigned.x-original.x,reassigned.y-original.y)<10);
  await page.locator('#drone-motion').click();
  const paused=await snapshot();await page.clock.runFor(1000);assert.deepEqual(await snapshot(),paused);
  await page.setViewportSize({width:320,height:568});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);
  console.log('PASS: automatic animation with reduced-motion preference, repeated complete mining loops, resource-button/canvas dispatch, loaded returns, continuous reassignment, pause and mobile layout');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

