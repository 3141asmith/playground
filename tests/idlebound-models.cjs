const assert=require('node:assert/strict'),E=require('../idlebound/engine.js');
const fresh=(level=1)=>{let s=E.fresh('Tester','Reluctant Knight');s.level=level;s.skillPoints=level;s.seed=42;return s;};
let s=fresh();E.advance(s,3600);assert(s.level>1&&s.quests>0&&s.kills>0);assert(s.gear.some(g=>g.power>1));assert(E.valid(s));
const old=structuredClone(s);old.version=1;delete old.skills;delete old.control;delete old.attackWait;assert(E.valid(old));let migrated=E.upgrade(old);assert.equal(migrated.version,4);assert.equal(migrated.gold,s.gold);assert.equal(migrated.level,s.level);assert.equal(migrated.skills.length,6);assert(E.valid(migrated));
for(const bad of [{gear:[]},{gear:null},{skills:[null]},{seed:0},{elapsed:999},{level:NaN},{attackWait:-1}])assert(!E.valid({...s,...bad}));
let locked=fresh();locked.control=true;for(let i=0;i<6;i++)assert(!E.activate(locked,i));
for(let i=0;i<6;i++){
 let a=fresh(E.skills[i].unlock);assert(!E.activate(a,i));a.control=true;assert(E.activate(a,i));assert(!E.activate(a,i));assert.equal(a.skills[i].active,E.skills[i].duration);assert.equal(a.skills[i].cooldown,E.skills[i].cooldown);
 let before=JSON.stringify(a);a.paused=true;let paused=JSON.stringify(a);E.advance(a,999);assert.equal(JSON.stringify(a),paused);a.paused=false;a.control=false;E.advance(a,E.skills[i].duration);assert.equal(a.skills[i].active,0);assert(a.skills[i].cooldown>0);assert(E.valid(a));
 a.control=true;E.advance(a,E.skills[i].cooldown);assert(E.activate(a,i));assert(E.valid(a));
 let ranked=fresh(E.skills[i].unlock+10);assert.equal(E.rank(ranked,i),2);assert(E.cooldown(ranked,i)<E.skills[i].cooldown);
}
// Compare rewards for exactly the same encounter, with and without buffs.
let a=fresh(20);a.steps=1;a.control=true;let b=structuredClone(a);E.activate(b,0);E.activate(b,3);E.advance(a,8);E.advance(b,8);assert.equal(b.gold*100+b.goldDust,(a.gold*100+a.goldDust)*2);assert.equal(b.xp,Math.floor((15+20*3)*.5*1.5));
a=fresh(20);a.steps=2;a.control=true;a.gear=a.gear.map(g=>({...g,power:100}));b=structuredClone(a);E.activate(b,0);E.activate(b,4);E.advance(a,4);E.advance(b,4);assert.equal(b.gold,a.gold*4);
// Luck raises rarity for identical seeded loot rolls, never reduces it.
const rarities=['common','rare','epic','legendary'];let improvements=0;
for(let seed=1;seed<=150;seed++){a=fresh(20);a.steps=2;a.seed=seed;a.control=true;b=structuredClone(a);E.activate(b,2);E.advance(a,4);E.advance(b,4);const ra=Math.max(...a.gear.map(g=>rarities.indexOf(g.rarity))),rb=Math.max(...b.gear.map(g=>rarities.indexOf(g.rarity)));assert(rb>=ra);if(rb>ra)improvements++;}assert(improvements>0);
// Chunked catch-up and frame-by-frame play agree, including buff expiry.
a=fresh(25);a.control=true;for(let i=0;i<6;i++)E.activate(a,i);b=structuredClone(a);E.advance(a,3600);for(let i=0;i<14400;i++)E.advance(b,.25);for(const k of ['level','xp','gold','kills','quests','steps','seed'])assert.equal(a[k],b[k],k);assert.deepEqual(a.gear,b.gear);
a=fresh(20);a.control=true;E.activate(a,1);E.activate(a,5);a.steps=1;assert(Math.abs(E.speed(a)-8.1)<1e-12);E.advance(a,2);assert.equal(a.kills,1);
a=fresh();a.steps=1;assert(!E.attack(a));a.control=true;assert(E.attack(a));assert(!E.attack(a));E.advance(a,.35);assert(E.attack(a));assert(E.valid(a));
a=fresh();b=structuredClone(a);E.advance(a,1e8);E.advance(b,43200);assert.equal(a.steps,b.steps);assert.equal(a.gold,b.gold);
console.log('PASS: old saves, validation, 6 unlocks, activation, cooldowns, ranks, pause, reward stacking, luck, haste, barrage, manual attacks and deterministic offline expiry');
