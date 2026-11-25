const assert=require('node:assert/strict'),E=require('../idlebound/engine.js');
function ready(){const s=E.fresh('Health tester','Reluctant Knight');s.control=true;s.sectorStage=5;s.stageEncounters=6;assert(E.startBoss(s));return s;}
let s=ready(),hp=s.bossFight.health;E.advance(s,2.99);assert.equal(s.bossFight.health,hp);E.advance(s,.01);assert(s.bossFight.health<hp);assert.equal(s.bossFight.attackIn,3);assert(E.valid(s));
const armour=ready();armour.gear[1].power=50;armour.bossFight.health=E.playerHP(armour);const full=armour.bossFight.health;E.advance(armour,3);assert(full-armour.bossFight.health<hp-s.bossFight.health);
s=ready();s.bossFight.health=1;const gold=s.gold,xp=s.xp;E.advance(s,3);assert.equal(s.bossFight,null);assert.equal(s.sectorStage,4);assert.equal(s.stageEncounters,0);assert.equal(s.elapsed,0);assert.equal(s.control,false);assert.equal(s.bossesDefeated,0);assert.equal(s.gold,gold);assert.equal(s.xp,xp);assert(!E.startBoss(s));assert(E.valid(s));E.advance(s,400);assert(E.bossReady(s));s.control=true;assert(E.startBoss(s));assert.equal(s.bossFight.health,E.playerHP(s));
s=ready();s.bossFight.health=1;E.advance(s,60,{offline:true});assert.equal(s.bossFight,null);assert.equal(s.sectorStage,5);
s=ready();delete s.bossFight.health;delete s.bossFight.attackIn;assert(E.valid(s));E.advance(s,3);assert(s.bossFight.health>0);assert(E.valid(s));
const saved=E.upgrade(JSON.parse(JSON.stringify(s)));assert.equal(saved.bossFight.health,s.bossFight.health);saved.bossFight.health=-1;assert(!E.valid(saved));
let a=ready(),b=structuredClone(a);a.bossFight.health=b.bossFight.health=1;E.advance(a,9);for(let i=0;i<36;i++)E.advance(b,.25);assert.deepEqual(a.gear,b.gear);for(const key of ['sectorStage','stageEncounters','steps','control'])assert.equal(a[key],b[key]);assert(Math.abs(a.elapsed-b.elapsed)<1e-9);
console.log('PASS: boss attack timing, armour, defeat, stage recovery, healing, offline safety, legacy saves and deterministic simulation');
