const assert=require('node:assert/strict'),E=require('../idlebound/engine.js');
const names=new Set();
for(const name of Object.keys(E.classes)){
 const s=E.fresh('Class tester',name);s.seed=42;assert(E.valid(s));assert.equal(E.classInfo(s).name,name);assert(s.gear.every(g=>g.class===E.classInfo(s).id));assert(E.traitPower(s)>0);for(const skill of E.classSkills(s)){assert(!names.has(skill.name));names.add(skill.name);}
 E.advance(s,1000,{offline:true});assert(E.bossReady(s));assert(s.gear.every(g=>g.class===E.classInfo(s).id));assert(E.valid(s));assert.equal(E.upgrade(JSON.parse(JSON.stringify(s))).calling,name);
 s.level=20;s.skillPoints=20;s.control=true;E.startBoss(s);s.bossFight.health=10;const before=s.bossFight.damage;assert(E.activate(s,4));if(name==='Artificer')assert(!s.bossFight||s.bossFight.damage>before);else assert(s.bossFight.health>10);assert(E.valid(s));
 const a=E.fresh('Guard',name);a.level=7;a.skillPoints=7;a.control=true;a.sectorStage=5;a.stageEncounters=6;E.startBoss(a);const b=structuredClone(a);E.activate(b,2);E.advance(a,3);E.advance(b,3);assert(b.bossFight.health>a.bossFight.health);assert(E.valid(b));
}
let s=E.fresh('Legacy','Hedge Wizard');const gear=structuredClone(s.gear);s=E.upgrade(s);assert.equal(s.calling,'Mage');assert.deepEqual(s.gear,gear);assert(E.valid(s));
s=E.fresh('Fast','Warrior');assert.equal(E.speed(s),1.8);E.advance(s,10);assert(s.kills>=1);s.gear[0].class='invalid';assert(!E.valid(s));
console.log('PASS: three classes, 18 named skills, exclusive loot, item traits, bombs, healing, guard, save migration and faster progression');
