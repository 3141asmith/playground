const assert=require('node:assert/strict'),E=require('../idlebound/engine.js');
function ready(sector=5){const s=E.fresh('Gem tester','Mage');s.bossesDefeated=sector;s.sectorStage=5;s.stageEncounters=6;s.control=true;return s;}
function win(s){s.attackWait=0;assert(E.startBoss(s));s.bossFight.damage=E.bossHP(s)-1;assert(E.attack(s));assert(E.valid(s));}
let s=ready(4);win(s);assert.equal(s.steamGems,0);assert(!E.gemsUnlocked(s));
s=ready();s.sectorStage=4;s.stageEncounters=5;s.steps=2;E.advance(s,4/E.speed(s));assert.equal(E.worldStage(s),30);assert(E.gemsUnlocked(s));assert(s.steamUnlocked);assert.equal(s.steamGems,0);
const awards=new Set();for(let seed=1;seed<30;seed++){s=ready();s.seed=seed*100003;win(s);assert(s.steamGems===1||s.steamGems===2);awards.add(s.steamGems);assert.equal(s.bossesDefeated,6);assert.equal(s.stageEncounters,0);assert(!E.bossReady(s));}assert.equal(awards.size,2);
const gems=s.steamGems;E.advance(s,600,{offline:true});assert(E.bossReady(s));assert.equal(s.steamGems,gems);win(s);assert(s.steamGems>=gems+1&&s.steamGems<=gems+2);assert.equal(s.bossesDefeated,6);assert.deepEqual(E.upgrade(JSON.parse(JSON.stringify(s))),s);
s=ready();E.startBoss(s);s.bossFight.health=1;E.advance(s,3);assert.equal(s.sectorStage,4);assert(s.steamUnlocked);assert(E.gemsUnlocked(s));assert.equal(s.steamGems,0);assert(E.valid(s));
let old=ready();old.bossesDefeated=6;delete old.steamGems;delete old.steamUnlocked;old=E.upgrade(old);assert.equal(old.steamGems,0);assert(old.steamUnlocked);assert(E.bossReady(old));
for(const value of [-1,.5,NaN,Infinity])assert(!E.valid({...old,steamGems:value}));assert(!E.valid({...old,steamUnlocked:'yes'}));assert(!E.valid({...E.fresh('Bad','Mage'),steamGems:1}));
s=ready();const report=E.catchUp(s,43200);assert.equal(report.steamGems,0);assert.equal(s.steamGems,0);assert(E.bossReady(s));
console.log('PASS: stage-30 milestone, 1-2 gems per manual victory, repeatable final boss, no offline gems, persistent unlock after defeat, old saves, currency validation and export/import');
