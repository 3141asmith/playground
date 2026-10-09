const {chromium}=require('../../.runtime/tools/node_modules/playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.PLAYGROUND_URL||'http://127.0.0.1:4185/playground/';await page.goto(base+'moments/');
 const physics=await page.evaluate(()=>{const l=momentsLab,s=l.state;l.reset();const balanced=l.calculate();s.pivot=1;s.beamMass=3;const offset=l.calculate();s.angle=Math.PI/2;const vertical=l.calculate();s.angle=0;s.running=true;l.step(1/120);const cwAngle=s.angle;l.reset();s.masses[0].kg=4;s.running=true;l.step(1/120);const ccwAngle=s.angle;l.reset();s.masses=[];s.running=true;l.step(1/120);const empty=s.angle;return {balanced,offset,vertical,cwAngle,ccwAngle,empty};});
 assert(Math.abs(physics.balanced.cw-39.24)<1e-9);assert.equal(physics.balanced.net,0);
 assert(Math.abs(physics.offset.net-(78.48+58.86))<1e-9);assert(Math.abs(physics.vertical.net)<1e-9);
 assert(physics.cwAngle>0);assert(physics.ccwAngle<0);assert.equal(physics.empty,0);
 await page.locator('#reset').click();await page.waitForFunction(()=>document.getElementById('ccw').textContent==='39.24 N m');assert.equal(await page.locator('#cw').textContent(),'39.24 N m');assert.equal(await page.locator('#arrow-cw path').count(),1);await page.locator('#vectors').uncheck();await page.waitForFunction(()=>!document.querySelector('[data-moment]'));await page.locator('#vectors').check();await page.waitForFunction(()=>document.querySelectorAll('[data-moment]').length===2);
 await page.locator('#add').click();assert.equal(await page.locator('.mass-row').count(),3);
 const kg=page.getByRole('spinbutton',{name:'Mass C in kilograms'});await kg.fill('3');await kg.press('Tab');
 const pos=page.getByRole('spinbutton',{name:'Mass C position in metres'});await pos.fill('6');await pos.press('Tab');assert(await page.evaluate(()=>momentsLab.calculate().net>0));
 await page.locator('#release').click();await page.waitForFunction(()=>momentsLab.state.angle>.03);await page.locator('#release').click();assert.equal(await page.evaluate(()=>momentsLab.state.angle),0);
 await page.getByRole('button',{name:'Remove mass C'}).click();assert.equal(await page.locator('.mass-row').count(),2);
 const ends=await page.evaluate(()=>[momentsLab.point(0),momentsLab.point(momentsLab.state.length)]);
 for(const preset of ['Left end','Right end','Centre']){await page.getByRole('button',{name:preset,exact:true}).click();assert.deepEqual(await page.evaluate(()=>[momentsLab.point(0),momentsLab.point(momentsLab.state.length)]),ends);}
 await page.locator('#pivot').fill('1.5');await page.locator('#pivot').press('Tab');assert.deepEqual(await page.evaluate(()=>[momentsLab.point(0),momentsLab.point(momentsLab.state.length)]),ends);
 await page.getByRole('button',{name:'Left end',exact:true}).click();assert.equal(await page.evaluate(()=>momentsLab.state.pivot),0);
 await page.locator('#length').fill('2');await page.locator('#length').press('Tab');assert(await page.evaluate(()=>momentsLab.state.masses.every(m=>m.position<=2)));
 await page.locator('#reset').click();
 async function screenPoint(x,y){return page.evaluate(({x,y})=>{const svg=document.getElementById('scene'),p=svg.createSVGPoint();p.x=x;p.y=y;const q=p.matrixTransform(svg.getScreenCTM());return {x:q.x,y:q.y};},{x,y});}
 let p=await screenPoint(350,328);await page.mouse.move(p.x,p.y);await page.mouse.down();let q=await screenPoint(400,328);await page.mouse.move(q.x,q.y,{steps:6});await page.mouse.up();assert(await page.evaluate(()=>momentsLab.state.masses[0].position>1.5));
 const beforeDrag=await page.evaluate(()=>[momentsLab.point(0),momentsLab.point(momentsLab.state.length)]);
 p=await screenPoint(500,380);q=await screenPoint(530,380);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(q.x,q.y,{steps:5});await page.mouse.up();assert(await page.evaluate(()=>momentsLab.state.pivot>3));assert.deepEqual(await page.evaluate(()=>[momentsLab.point(0),momentsLab.point(momentsLab.state.length)]),beforeDrag);
 for(let i=0;i<6;i++)await page.locator('#add').click();assert.equal(await page.locator('.mass-row').count(),8);assert(await page.locator('#add').isDisabled());
 while(await page.locator('.remove').count())await page.locator('.remove').first().click();assert.equal(await page.locator('.mass-row').count(),0);assert(await page.locator('#add').isEnabled());await page.locator('#add').click();assert.equal(await page.locator('.mass-row').count(),1);
 await page.locator('#reset').click();p=await screenPoint(425,350);q=await screenPoint(450,365);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(q.x,q.y,{steps:5});await page.mouse.up();assert(await page.evaluate(()=>momentsLab.state.x>500));
 await page.locator('#reset').click();await page.locator('#scene').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>momentsLab.state.x),510);await page.locator('#reset').click();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(80);await page.screenshot({path:'artifacts/moments-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const touch=await page.context().newCDPSession(page);p=await screenPoint(350,328);q=await screenPoint(385,328);await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[q]});await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert(await page.evaluate(()=>momentsLab.state.masses[0].position>1));
 await page.screenshot({path:'artifacts/moments-mobile.png',fullPage:true});await page.goto(base);assert.equal(await page.locator('.project').count(),4);await page.locator('.moments').click();assert(page.url().endsWith('/moments/'));assert.deepEqual(errors,[]);
 console.log('PASS balanced and unequal moments, uniform beam weight, perpendicular distance at an angle, rotation direction, zero inertia, vector toggle, mass editing/removal, beam length, pivot presets, dragging beam/pivot/mass, touch, mobile, hub link, no browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
