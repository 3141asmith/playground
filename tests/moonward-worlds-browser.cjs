const {chromium}=require('../../.runtime/tools/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4185/playground/moonward/');await page.locator('#enter-game').click();await page.locator('#launch').click();await page.locator('[data-resource="iron"]').waitFor();
 async function gather(){await page.evaluate(()=>{const c=current();for(const r of G.worlds[state.current].resources){for(const k of Object.keys(c.assignments))while(c.assignments[k])G.adjust(state,k,-1);while(G.idle(c))G.adjust(state,r,1);G.tick(state,Math.max(600,...Object.values(G.worlds[state.current].rocketCost).map(n=>n*80)));}while(G.power(state,c).factor<1)G.build(state,'solar');render();});}
 for(let id=0;id<8;id++){
  assert.equal(await page.evaluate(()=>state.current),id);const world=await page.evaluate(()=>G.worlds[state.current]);
  await page.locator('[data-tab="build"]').click();assert.equal(await page.locator('[data-build]').count(),5);assert(await page.locator(`[data-build="${world.buildings[0]}"]`).isVisible());
  await page.locator('[data-tab="research"]').click();assert.equal(await page.locator('[data-research]').count(),world.techs.length);
  for(let t=0;t<world.techs.length;t++){
   await gather();const key=world.techs[t];await page.locator(`[data-research="${key}"]`).click();assert(await page.locator('[role="progressbar"]').isVisible());await page.evaluate(key=>{G.tick(state,G.techs[key].duration);render();},key);
   if(t<2){await page.locator('[data-tab="build"]').click();await page.locator(`[data-build="${world.buildings[t]}"]`).click();await page.locator('[data-tab="research"]').click();}
  }
  await gather();await page.locator('[data-tab="mission"]').click();const text=await page.locator('#panel').innerText();for(const r of Object.keys(world.rocketCost)){const name=await page.evaluate(r=>G.resources[r].name,r);assert(text.includes(name));}
  if(id<7){await page.locator('#map-button').click();if(id===0){await page.locator('[data-map-world="2"]').click();assert(await page.locator('[data-settle="2"]').isDisabled());}await page.locator(`[data-map-world="${id+1}"]`).click();await page.locator(`[data-settle="${id+1}"]`).click();await page.locator('#flight').waitFor({state:'hidden'});if(id===3)await page.locator('#acknowledge-hostiles').click();}
  else{await page.locator('#launch-expedition').click();assert.equal(await page.evaluate(()=>state.expeditions),1);assert.match(await page.locator('#modal-content').innerText(),/MISSION ACCOMPLISHED/);await page.locator('#close-modal').click();}
 }
 await page.reload();await page.locator('#enter-game').click();assert.equal(await page.evaluate(()=>state.expeditions),1);assert.equal(await page.evaluate(()=>state.colonies.length),8);await page.locator('[data-tab="build"]').click();assert(await page.locator('[data-build="forge7"]').isVisible());assert.equal(await page.locator('[data-build="smelter"]').count(),0);
 await page.setViewportSize({width:320,height:700});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#map-button').click();assert(await page.locator('.modal').evaluate(el=>el.scrollWidth<=el.clientWidth));await page.screenshot({path:'C:/Users/asmith/Code/playground/artifacts/moonward-worlds-mobile.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS: all eight local research/build panels, timed unlocks, planet-specific mission costs, skip lock, eight-world travel, final expedition, reload and mobile map');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});





