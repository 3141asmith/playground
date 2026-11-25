const assert=require('node:assert/strict'),E=require('../idlebound/engine.js');
function fresh(level=1){const s=E.fresh('Artificer','Hedge Wizard');s.level=level;s.skillPoints=level;s.seed=42;return s;}
let s=fresh();assert.equal(s.skillPoints,1);assert(E.train(s,'gears'));assert.equal(s.skillPoints,0);assert.equal(E.talentCost(s,'gears'),2);assert(!E.train(s,'gears'));assert(!E.train(s,'flywheel'));assert(!E.train(s,'not-a-skill'));assert(E.valid(s));
E.advance(s,3600);assert.equal(s.skillPoints,s.level-1);assert(E.valid(s));
s=fresh(120);for(const id of ['gears','flywheel','drive']){for(let i=0;i<5;i++){assert.equal(E.talentCost(s,id),E.talents.find(t=>t.id===id).tier*5+i+1);assert(E.train(s,id));assert(E.valid(s));}assert(!E.train(s,id));}assert.equal(E.bonus(s,'speed'),15);assert.equal(s.skillPoints,0);assert.equal(E.talentSpent(s),120);assert(Math.abs(E.speed(s)-1.8*1.15)<1e-12);
// Backfill points exactly once, retaining v2 active skills and progression.
let old=fresh(25);old.control=true;E.activate(old,0);old.version=2;delete old.skillPoints;delete old.talents;delete old.goldDust;const cooldown=old.skills[0].cooldown;let migrated=E.upgrade(old);assert.equal(migrated.skillPoints,25);assert.equal(migrated.skills[0].cooldown,cooldown);assert.equal(E.upgrade(migrated).skillPoints,25);assert(E.valid(migrated));
old=fresh(10);old.version=1;delete old.skills;delete old.control;delete old.attackWait;delete old.skillPoints;delete old.talents;delete old.goldDust;assert.equal(E.upgrade(old).skillPoints,10);
// Impossible allocations, negative points and bypassed prerequisites are rejected.
for(const mutate of [x=>x.skillPoints++,x=>x.skillPoints=-1,x=>x.talents.gears=6,x=>{x.talents.flywheel=1;x.skillPoints-=6;},x=>x.goldDust=100,x=>x.talents=null]){let bad=fresh(100);mutate(bad);assert(!E.valid(bad));}
s=fresh(15);E.train(s,'sorter');s.steps=1;E.advance(s,8);assert.equal(s.gold,9);assert.equal(s.goldDust,9);assert(E.valid(s));
// Fractional gold, allocations and unspent points survive export/import exactly.
let roundtrip=E.upgrade(JSON.parse(JSON.stringify(s)));assert.deepEqual(roundtrip,{...s,calling:'Mage'});
let a=fresh(40);E.train(a,'sorter');a.steps=1;a.control=true;let b=structuredClone(a);E.activate(b,0);E.advance(a,8);E.advance(b,8);assert(Math.abs((b.gold*100+b.goldDust)-(a.gold*100+a.goldDust)*2)<=1);
a=fresh(40);E.train(a,'gears');a.control=true;E.activate(a,1);assert(Math.abs(E.speed(a)-1.8*1.515)<1e-12);const before=a.skills[1].cooldown;E.advance(a,2);assert.equal(a.skills[1].cooldown,before-2);
a=fresh(100);for(const id of ['gears','sorter'])for(let i=0;i<5;i++)E.train(a,id);b=structuredClone(a);E.advance(a,3600);for(let i=0;i<14400;i++)E.advance(b,.25);for(const key of ['steps','gold','goldDust','level','xp','skillPoints'])assert.equal(a[key],b[key],key);assert(E.valid(a));assert(E.valid(b));
console.log('PASS: points per level, rising costs, prerequisites, rank cap, migration, budget validation, fractional gold, bonus stacking, unchanged cooldowns and offline equivalence');
