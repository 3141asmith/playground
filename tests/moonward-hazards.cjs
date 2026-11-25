const assert=require('node:assert/strict'),G=require('../moonward/engine.js');
assert.equal(G.worlds.length,8);let last=0;
for(let id=0;id<8;id++){const w=G.worlds[id],total=Object.values(w.rocketCost).reduce((a,b)=>a+b,0);assert.equal(total,100*2**id);assert(total>last);last=total;if(id<3)continue;
 const origin=G.worlds[id-1],tech=G.techs[w.protectionTech];assert.equal(tech.world,id-1);assert(Object.keys(tech.cost).every(r=>origin.products.includes(r)));assert(origin.techs.includes(w.protectionTech));
 const s=G.fresh();G.settle(s,0);for(const k of Object.keys(s.stock))s.stock[k]=1e7;
 // Reach the predecessor with the intended engine gates, then omit this protection.
 for(let dest=1;dest<id;dest++){const prev=G.worlds[s.current];for(const k of prev.techs)if(!s.tech.includes(k))s.tech.push(k);assert(G.settle(s,dest));}
 for(const k of origin.techs.filter(k=>k!==w.protectionTech))if(!s.tech.includes(k))s.tech.push(k);
 const cargo={...s.stock};assert(!G.canLaunch(s,id));assert(!G.settle(s,id));assert.deepEqual(s.stock,cargo,'blocked launch does not spend cargo');
 assert(G.research(s,w.protectionTech));G.tick(s,tech.duration-1);assert(!G.canLaunch(s,id));G.tick(s,1);assert(G.canLaunch(s,id));assert(G.settle(s,id));assert(G.protectedWorld(s,id));
 s.tech=s.tech.filter(k=>k!==w.protectionTech);const c=s.colonies.at(-1),raw=w.resources[0],before=s.stock[raw];assert(!G.assign(s,raw));assert(G.adjust(s,raw,-1));assert(!G.adjust(s,raw,1));G.tick(s,100);assert.equal(s.stock[raw],before,'unprotected drones cannot mine');s.lastSeen=1000;G.offline(s,401000);assert.equal(s.stock[raw],before,'offline mining also blocked');
}
// v2 saves retain colonies, cargo, completed expeditions and in-flight research.
const old=G.fresh();G.settle(old,0);old.version=2;old.stock.iron=99;old.stock.rock=99;assert(G.research(old,'smelting'));G.tick(old,20);old.expeditions=2;
for(const k of Object.keys(old.stock))if(!G.worlds.slice(0,3).some(w=>[...w.resources,...w.products].includes(k)))delete old.stock[k];
for(const c of old.colonies)for(const key of Object.keys(G.buildings))if(G.buildings[key].world>=3)delete c[key];
const migrated=G.migrate(old);assert(migrated);assert.equal(migrated.version,7);assert.equal(migrated.stock.iron,old.stock.iron);assert.equal(migrated.expeditions,2);assert.equal(migrated.activeResearch.remaining,40);assert.equal(migrated.stock.voidore,0);assert.equal(migrated.colonies[0].forge7,0);assert(G.valid(migrated));
console.log('PASS: eight exponentially scaled rocket costs, five prior-world protection technologies, timed hazard gates, atomic blocked launches, active/offline mining protection and v2 save migration');




