const assert=require('node:assert/strict'),G=require('../moonward/engine.js');
const s=G.fresh();assert(G.valid(s));assert(!G.settle(s,1));assert(G.settle(s,0));assert(!G.settle(s,0));G.tick(s,10);assert.equal(s.stock.iron,20);assert(G.assign(s,'rock'));G.tick(s,10);assert.equal(s.stock.rock,10);assert(G.research(s,'smelting'));assert(!G.research(s,'smelting'));assert(!G.research(s,'rocketry'));
// Play the full production chain without injecting materials.
function gather(){G.tick(s,60);}
gather();assert(G.build(s,'smelter'));assert(G.assign(s,'ice'));gather();assert(G.research(s,'chemistry'));G.tick(s,180);gather();assert(G.build(s,'refinery'));G.assign(s,'iron');gather();gather();assert(G.research(s,'rocketry'));G.tick(s,600);gather();gather();gather();assert(G.settle(s,1));assert.equal(s.colonies.length,2);assert(G.valid(s));assert(!G.settle(s,1));assert(!G.assign(s,'ice'));
const x=G.fresh();G.settle(x,0);x.lastSeen=1000;const result=G.offline(x,1000+40*3600*1000);assert.equal(result.seconds,28800);assert.equal(x.stock.iron,14400);const before=x.stock.iron;G.offline(x,1000+40*3600*1000);assert.equal(x.stock.iron,before);G.offline(x,0);assert.equal(x.stock.iron,before);
const y=JSON.parse(JSON.stringify(s));assert(G.valid(y));y.colonies[0].assignments.iron=-1;assert(!G.valid(y));assert(!G.valid({}));console.log('PASS: launch, assignments, full progression, prerequisite checks, interplanetary settlement, offline rate/cap/idempotency and save validation');

