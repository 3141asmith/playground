const {chromium}=require('../../.runtime/tools/node_modules/playwright');const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});try{const page=await browser.newPage({viewport:{width:1100,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto('http://127.0.0.1:4185/playground/idlebound/');await page.locator('#create button').click();await page.clock.runFor(100);
const result=await page.evaluate(()=>{
 const base=Idle.fresh('Equipment test','Reluctant Knight');base.steps=1;const before=JSON.stringify(base);
 const paint=s=>{scene.draw(s);return scene.canvas.toDataURL();};
 const groups=[['Rivet pistol','Tesla carbine','Pneumatic blade'],['Boilerplate coat','Artificer vest','Ironweave mail'],['Chronometer','Aether compass','Pressure regulator','Reassuring pebble']];
 const counts=groups.map((names,slot)=>new Set(names.map(name=>{const s=structuredClone(base);s.gear[slot].name=name;return paint(s);})).size);
 const rarityCount=new Set(['common','rare','epic','legendary'].map(rarity=>{const s=structuredClone(base);s.gear=s.gear.map(g=>({...g,rarity}));return paint(s);})).size;
 const legacy=structuredClone(base);legacy.gear=[{name:'Old Sword',rarity:'common',power:1},{name:'Old Mail',rarity:'common',power:1},{name:'Reassuring pebble',rarity:'common',power:1}];const look=scene.appearance(legacy);
 const restored=paint(base)===paint(Idle.upgrade(JSON.parse(JSON.stringify(base)))),unchanged=before===JSON.stringify(base);
 state=base;state.control=true;for(const name of groups[0]){state.gear[0].name=name;scene.emitShot();}const kinds=scene.bullets.map(b=>b.kind);scene.bullets=[];
 // Create a comparison image directly from the same live character renderer.
 const art=document.createElement('canvas');art.width=1050;art.height=360;const ctx=art.getContext('2d');ctx.fillStyle='#17232b';ctx.fillRect(0,0,1050,360);const original=scene.ctx;scene.ctx=ctx;
 try{for(let i=0;i<3;i++){const s=structuredClone(base);s.gear=[{name:groups[0][i],rarity:['common','rare','legendary'][i],power:30},{name:groups[1][i],rarity:['common','rare','legendary'][i],power:30},{name:groups[2][i],rarity:['common','epic','legendary'][i],power:30}];scene.person(130+i*350,285,1.48,0,1,0,scene.appearance(s));ctx.fillStyle='#deca9e';ctx.font='14px system-ui';ctx.textAlign='center';ctx.fillText(groups[0][i],155+i*350,322);ctx.font='11px system-ui';ctx.fillText(groups[1][i]+' / '+groups[2][i],155+i*350,344);}}finally{scene.ctx=original;}
 return {counts,rarityCount,legacy:{weapon:look.weapon,armour:look.armour,trinket:look.trinket},restored,unchanged,kinds,art:art.toDataURL()};
});
assert.deepEqual(result.counts,[3,3,4]);assert.equal(result.rarityCount,4);assert.deepEqual(result.legacy,{weapon:'blade',armour:'mail',trinket:'charm'});assert(result.restored&&result.unchanged);assert.deepEqual(result.kinds.slice(-3),['pistol','carbine','blade']);assert.deepEqual(errors,[]);require('node:fs').writeFileSync(path.resolve(__dirname,'../artifacts/idlebound-equipment.png'),Buffer.from(result.art.split(',')[1],'base64'));console.log('PASS: distinct weapons, armour, trinkets, four rarities, legacy item mapping, save appearance restoration and matching projectile types');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
