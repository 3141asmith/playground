const assert=require('node:assert/strict'),G=require('../moonward/engine.js'),near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const s=G.fresh();G.settle(s,0);const c=s.colonies[0];assert.equal(c.solar,2);near(G.power(s,c).generated,20);near(G.power(s,c).demand,0);near(G.power(s,c).factor,1);
c.smelter=4;c.assignments.iron=0;s.stock.iron=100;near(G.power(s,c).demand,24);near(G.power(s,c).factor,20/24);G.tick(s,4);near(s.stock.metal,4*20/24);near(s.stock.iron,100-8*20/24);
s.stock.iron=100;s.stock.rock=100;const cost=G.buildCost(c,'solar');assert(G.build(s,'solar'));assert.equal(c.solar,3);near(s.stock.iron,100-cost.iron);near(s.stock.rock,100-cost.rock);near(G.power(s,c).factor,1);
const before=s.stock.metal;G.tick(s,4);near(s.stock.metal-before,4);c.solar=0;const stopped={...s.stock};G.tick(s,20);assert.deepEqual(s.stock,stopped,'unpowered processors consume and produce nothing');c.assignments.iron=2;G.tick(s,10);near(s.stock.iron,stopped.iron+20,'mining independent of power');
c.solar=3;s.tech.push('processingUpgrade1');near(G.power(s,c).demand,28.8);s.tech.push('processingUpgrade2','processingUpgrade3');near(G.power(s,c).demand,48);near(G.power(s,c).factor,30/48);
// The same panel count produces different power on bright and dim planets.
for(let id=0;id<8;id++){const local={...c,world:id};for(const key of Object.keys(G.buildings))if(key!=='drone')local[key]=0;local.solar=2;local[G.worlds[id].buildings[0]]=1;near(G.power(s,local).generated,20*G.worlds[id].solarEfficiency);assert(Object.keys(G.buildCost(local,'solar')).every(r=>G.worlds[id].resources.includes(r)));}
const away=G.fresh();G.settle(away,0);away.colonies[0].smelter=4;away.colonies[0].assignments.iron=0;away.stock.iron=1000;away.lastSeen=1000;G.offline(away,17000);near(away.stock.metal,4*20/24);
const legacy=G.fresh();G.settle(legacy,0);legacy.version=3;delete legacy.colonies[0].solar;legacy.colonies[0].smelter=6;const migrated=G.migrate(legacy);assert(migrated);assert.equal(migrated.version,7);assert.equal(migrated.colonies[0].solar,2);assert.equal(migrated.colonies[0].smelter,6);assert(G.valid(migrated));migrated.colonies[0].solar=-1;assert(!G.valid(migrated));
console.log('PASS: starter panels, demand, proportional brownouts, input/output accounting, solar construction costs, zero power, independent mining, upgrade demand, planet irradiance, offline power and v3 migration');



