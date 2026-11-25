const assert=require('node:assert/strict'),G=require('../moonward/engine.js');
const s=G.fresh();assert(G.settle(s,0));
function gatherLocal(seconds=Math.max(600,...Object.values(G.worlds[s.current].rocketCost).map(n=>n*80))){const c=s.colonies.find(c=>c.world===s.current);for(const resource of G.worlds[s.current].resources){for(const r of Object.keys(c.assignments))while(c.assignments[r])assert(G.adjust(s,r,-1));while(G.idle(c))assert(G.adjust(s,resource,1));G.tick(s,seconds);}while(G.power(s,c).factor<1)assert(G.build(s,'solar'));}
function unlock(key){const t=G.techs[key];assert(G.research(s,key),'start '+key);assert(!s.tech.includes(key));G.tick(s,t.duration-1);assert(!s.tech.includes(key));G.tick(s,1);assert(s.tech.includes(key));}
for(let id=0;id<G.worlds.length;id++){
 const w=G.worlds[id];assert.equal(s.current,id);assert(G.valid(s));
 if(id>0){assert(!G.settle(s,id+1));assert(!G.expedition(s));for(const r of w.products)assert.equal(s.stock[r],0,'new products cannot come from earlier worlds');}
 const snapshot={...s.stock};assert(!G.build(s,G.worlds[(id+1)%3].buildings[0]));assert(!G.research(s,G.worlds[(id+1)%3].techs[0]));assert.deepEqual(s.stock,snapshot);
 gatherLocal();unlock(w.techs[0]);assert(G.build(s,w.buildings[0]));gatherLocal();unlock(w.techs[1]);assert(G.build(s,w.buildings[1]));gatherLocal();unlock(w.rocketTech);for(const key of w.techs.slice(3)){gatherLocal();unlock(key);}gatherLocal();
 assert(G.canPay(s,w.rocketCost));assert(G.valid(s));
 if(id<G.worlds.length-1){const before={...s.stock};assert(G.settle(s,id+1));for(const[r,n]of Object.entries(w.rocketCost))assert.equal(s.stock[r],before[r]-n);}
 else{const before={...s.stock};assert(G.expedition(s));assert.equal(s.expeditions,1);for(const[r,n]of Object.entries(w.rocketCost))assert.equal(s.stock[r],before[r]-n);}
}
assert.equal(new Set(G.worlds.flatMap(w=>w.resources)).size,24,'raw resources are unique');
assert.equal(new Set(G.worlds.flatMap(w=>w.products)).size,16,'products are unique');
const skip=G.fresh();G.settle(skip,0);skip.tech.push('smelting','chemistry','rocketry');for(const k of Object.keys(skip.stock))skip.stock[k]=1e6;assert(!G.settle(skip,2),'cannot skip Ember even with cargo');assert(G.settle(skip,1));assert(!G.settle(skip,2),'Selene flight research does not unlock Ember flight');
const blocked={...skip.stock};for(const k of [...G.worlds[1].resources,...G.worlds[1].products])skip.stock[k]=0;skip.tech.push('ceramics','plasmaPhysics','thermalFlight');assert(!G.settle(skip,2),'old cargo cannot pay the Ember rocket');assert.equal(skip.stock.metal,blocked.metal);
// Offline processing honours all local recipes, including multiple inputs.
const away=JSON.parse(JSON.stringify(s)),beforeAway={...away.stock};away.lastSeen=1000;G.offline(away,401000);assert(away.stock.ionfuel>beforeAway.ionfuel);assert(G.valid(away));
// Existing v1 colonies preserve drone numbers and convert their processing slots.
const old={version:1,started:true,current:1,elapsed:123,lastSeen:1000,tech:['smelting','chemistry','rocketry'],activeResearch:null,stock:{iron:44,rock:33,ice:22,metal:11,fuel:8,crystal:7},colonies:[{world:0,drones:3,assignments:{iron:1,rock:1,ice:0},smelter:1,refinery:1},{world:1,drones:4,assignments:{iron:1,rock:2,crystal:0},smelter:2,refinery:1}]};
const migrated=G.migrate(old);assert(migrated);assert.equal(migrated.version,7);assert.equal(migrated.stock.iron,44);assert.equal(migrated.stock.basalt,0);assert.equal(migrated.colonies[1].kiln,2);assert.equal(migrated.colonies[1].plasmaForge,1);assert.deepEqual(migrated.colonies[1].assignments,{basalt:1,sulfur:2,crystal:0});assert.equal(G.idle(migrated.colonies[1]),1);assert(!migrated.tech.includes('thermalFlight'));assert(G.valid(migrated));assert.deepEqual(old.colonies[1].assignments,{iron:1,rock:2,crystal:0});assert.equal(G.migrate({version:1}),null);
console.log('PASS: all eight local progression chains without injected resources, escalating research, origin/skip locks, unique inputs/buildings, rocket payments, final expedition, offline processing and v1 migration');





