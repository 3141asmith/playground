const {chromium}=require('../../.runtime/tools/node_modules/playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));const base=process.env.PLAYGROUND_URL||'http://127.0.0.1:4185/playground/';await page.goto(base+'moments/');
 assert(await page.locator('#game-panel').isHidden());const sandbox=await page.evaluate(()=>structuredClone(momentsLab.state));await page.locator('#game-mode').click();assert(await page.locator('#game-panel').isVisible());assert.equal(await page.locator('#level-select option').count(),10);assert.equal(await page.locator('#level-select option:disabled').count(),9);assert(await page.locator('#release').isDisabled());assert(await page.locator('#length').isDisabled());
 const solutions=[{id:2,key:'position',v:2.4},{id:2,key:'position',v:4},{add:true,id:2,key:'position',v:1.2},{id:2,key:'kg',v:3},{pivot:3},{add:true,id:2,key:'position',v:1},{id:2,key:'position',v:0},{id:3,key:'position',v:4},{id:2,key:'kg',v:3},{add:true,id:3,key:'position',v:3}];
 for(let i=0;i<10;i++){
  assert.equal(await page.evaluate(()=>momentsGame.index),i);assert(Math.abs(await page.evaluate(()=>momentsLab.calculate().net))>.2);
  await page.waitForFunction(()=>document.getElementById('scene').dataset.scenario===momentsGame.levels[momentsGame.index].art);
  const arcs=await page.evaluate(()=>[...document.querySelectorAll('[data-moment]')].map(el=>{const n=el.getAttribute('d').match(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi).map(Number);const cx=Number(el.dataset.centreX),cy=Number(el.dataset.centreY),r=Number(el.dataset.radius);return {direction:el.dataset.moment,sweep:n[6],cross:(n[0]-cx)*(n[8]-cy)-(n[1]-cy)*(n[7]-cx),startRadius:Math.hypot(n[0]-cx,n[1]-cy),endRadius:Math.hypot(n[7]-cx,n[8]-cy),r,cx,cy,pivotX:momentsLab.state.x,pivotY:momentsLab.state.y};}));
  assert(arcs.length<=2);for(const arc of arcs){assert.equal(arc.cx,arc.pivotX);assert.equal(arc.cy,arc.pivotY);assert(Math.abs(arc.startRadius-arc.r)<1e-8);assert(Math.abs(arc.endRadius-arc.r)<1e-8);assert.equal(arc.sweep,arc.direction==='cw'?1:0);assert(arc.direction==='cw'?arc.cross>0:arc.cross<0);}
  assert.equal(await page.locator('[data-scenario-object]').count(),await page.evaluate(()=>momentsLab.state.masses.length));
  const forces=await page.evaluate(()=>[...document.querySelectorAll('[data-force-reference="false"]')].map(el=>{const line=el.querySelector('line'),tip=Number(el.querySelector('path').getAttribute('d').split(' ')[2]);return {force:Number(el.dataset.force),length:tip-Number(line.getAttribute('y1'))};}));
  for(const force of forces)assert(Math.abs(force.length-force.force)<1e-8);
  await page.locator('#scene').screenshot({path:`artifacts/scenario-${i+1}.png`});
  if(i===0){
   const box=await page.evaluate(()=>{const r=document.querySelector('[data-scenario-object][data-id="2"] rect[fill="transparent"]').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};});const initial=await page.evaluate(()=>momentsLab.state.masses[1].position);
   await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+30,box.y+box.height/2,{steps:4});await page.mouse.up();assert(await page.evaluate(()=>momentsLab.state.masses[1].position)>initial);
   await page.locator('#retry').click();
  }
  await page.locator('#check-balance').click();assert.equal((await page.evaluate(()=>momentsGame.completed)).length,i);assert(await page.locator('#next-level').isDisabled());
  assert(await page.getByRole('button',{name:'Remove mass A',exact:true}).isDisabled());
  await page.locator('#hint').click();assert(await page.locator('#hint-text').isVisible());
  const s=solutions[i];if(s.add){await page.locator('#add').click();assert(await page.locator('#add').isDisabled());const newName='Remove mass '+String.fromCharCode(64+s.id);await page.getByRole('button',{name:newName,exact:true}).click();assert(await page.locator('#add').isEnabled());await page.locator('#add').click();s.id=await page.evaluate(()=>momentsLab.state.masses.at(-1).id);}
  const input=s.pivot!==undefined?page.locator('#pivot'):page.getByRole('spinbutton',{name:`Mass ${String.fromCharCode(64+s.id)} ${s.key==='kg'?'in kilograms':'position in metres'}`,exact:true});assert(await input.isEnabled());await input.fill(String(s.pivot??s.v));await input.press('Tab');
  assert(Math.abs(await page.evaluate(()=>momentsLab.calculate().net))<1e-8);await page.locator('#check-balance').click();assert.equal((await page.evaluate(()=>momentsGame.completed)).length,i+1);assert((await page.locator('#game-feedback').textContent()).startsWith('Balanced!'));
  if(i===0){await page.screenshot({path:'artifacts/moments-game-desktop.png',fullPage:true});await page.locator('#retry').click();assert(Math.abs(await page.evaluate(()=>momentsLab.calculate().net))>.2);await input.fill('2.4');await input.press('Tab');await page.locator('#check-balance').click();}
  if(i<9)await page.locator('#next-level').click();
 }
 assert((await page.locator('#game-feedback').textContent()).includes('All ten'));assert.equal(await page.locator('#level-select option:disabled').count(),0);await page.locator('#level-select').selectOption('2');assert.equal(await page.evaluate(()=>momentsGame.index),2);
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'artifacts/moments-game-mobile.png',fullPage:true});
 await page.locator('#sandbox-mode').click();assert(await page.locator('#game-panel').isHidden());assert(await page.locator('#release').isEnabled());assert(await page.locator('#length').isEnabled());assert.deepEqual(await page.evaluate(()=>momentsLab.state.masses),sandbox.masses);
 await page.locator('#add').click();assert.equal(await page.locator('.mass-row').count(),3);await page.getByRole('button',{name:'Remove mass C',exact:true}).click();assert.equal(await page.locator('.mass-row').count(),2);assert.deepEqual(errors,[]);
 console.log('PASS all 10 levels initially unbalanced and solvable via UI; add/remove required weights, fixed loads locked, hints, retries, sequential unlocking, final completion, replay, sandbox restoration, mobile layout and no browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
