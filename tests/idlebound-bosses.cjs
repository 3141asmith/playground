const assert=require('node:assert/strict'),E=require('../idlebound/engine.js');
const fresh=()=>{const s=E.fresh('Boss tester','Reluctant Knight');s.seed=42;return s;};
let s=fresh();E.advance(s,600);assert(E.bossReady(s));assert.equal(E.sector(s),0);assert.equal(E.stage(s),5);assert.equal(s.stageEncounters,6);assert(E.valid(s));const gold=s.gold,kills=s.kills,foe=E.foe(s);E.advance(s,43200,{offline:true});assert.equal(E.sector(s),0);assert.equal(E.stage(s),5);assert.equal(E.foe(s),foe);assert.equal(s.bossesDefeated,0);assert(s.gold>gold&&s.kills>kills);assert(E.valid(s));
assert(!E.startBoss(s));s.control=true;assert(E.startBoss(s));assert(!E.startBoss(s));const hp=E.bossHP(s);E.advance(s,5);assert.equal(s.bossFight.damage,0);assert.equal(E.bossHP(s),hp);assert(E.attack(s));assert(s.bossFight.damage>0);E.advance(s,15);assert.equal(s.bossFight,null);assert.equal(s.bossesDefeated,0);assert(E.valid(s));
assert(E.startBoss(s));E.attack(s);E.advance(s,100,{offline:true});assert.equal(s.bossFight,null);assert.equal(s.bossesDefeated,0);assert(E.valid(s));
assert(E.startBoss(s));s.control=false;E.advance(s,.5);assert.equal(s.bossFight,null);s.control=true;
// Clear all six bosses through manual attacks. Each new sector needs its stages.
for(let boss=0;boss<6;boss++){
 s.sectorStage=5;s.stageEncounters=6;s.attackWait=0;assert(E.startBoss(s));let count=0;while(s.bossFight&&count++<1000){E.attack(s);E.advance(s,.35);}assert(count<1000);assert.equal(s.bossesDefeated,boss+1);assert(E.valid(s));if(boss<5){assert.equal(E.stage(s),1);assert(!E.bossReady(s));}else assert(!E.bossReady(s));
}assert.equal(E.sector(s),5);E.advance(s,10000,{offline:true});assert.equal(s.bossesDefeated,6);assert(E.valid(s));
// Old saves retain reached sectors; current-sector bosses still gate future travel.
let old=fresh();old.version=3;old.level=20;old.skillPoints=20;delete old.bossesDefeated;delete old.bossFight;delete old.sectorStage;delete old.stageEncounters;s=E.upgrade(old);assert.equal(s.version,4);assert.equal(E.sector(s),3);assert(E.bossReady(s));assert.equal(s.level,20);assert(E.valid(s));
const broken=structuredClone(s);broken.bossFight={damage:0,idle:15};broken.control=true;assert(!E.valid(broken));const broken2=structuredClone(s);broken2.bossesDefeated=7;assert(!E.valid(broken2));
s=fresh();E.advance(s,600);s.control=true;E.startBoss(s);E.attack(s);const roundtrip=E.upgrade(JSON.parse(JSON.stringify(s)));assert(E.valid(roundtrip));E.advance(roundtrip,1,{offline:true});assert.equal(roundtrip.bossFight,null);
let a=fresh(),b=structuredClone(a);E.advance(a,3600,{offline:true});for(let i=0;i<14400;i++)E.advance(b,.25);for(const k of ['bossesDefeated','sectorStage','stageEncounters','gold','xp','level','steps'])assert.equal(a[k],b[k],k);
console.log('PASS: five-stage sector gates, AFK/offline farming, manual-only boss damage, retreat, all six bosses, post-boss stages, final sector, migration, validation and deterministic catch-up');
