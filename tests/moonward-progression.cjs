const assert=require('node:assert/strict'),G=require('../moonward/engine.js');
const s=G.fresh();assert.equal(G.nextWorld(s),0);assert.equal(G.worldAccess(s,0).status,'next');assert.equal(G.worldAccess(s,7).status,'locked');assert(!G.visit(s,7));
for(let next=0;next<8;next++){
 assert.equal(G.nextWorld(s),next);for(const key of Object.keys(s.stock))s.stock[key]=1e8;
 if(next)for(const key of G.worlds[next-1].techs)if(!s.tech.includes(key))s.tech.push(key);
 for(let future=next+1;future<8;future++){assert.equal(G.worldAccess(s,future).status,'locked');const before=JSON.stringify(s);assert(!G.settle(s,future));assert(!G.visit(s,future));assert.equal(JSON.stringify(s),before);}
 assert(G.canLaunch(s,next));assert(G.settle(s,next));assert.equal(G.worldAccess(s,next).status,'colony');assert(G.visit(s,0));if(next<7){assert(!G.canLaunch(s,next+1)||next===0);assert(G.visit(s,next));}
}
assert.equal(G.nextWorld(s),-1);for(let id=0;id<8;id++)assert(G.visit(s,id));assert(!G.visit(s,8));assert(!G.visit(s,1.5));
const legacy=G.fresh();G.settle(legacy,0);for(const key of Object.keys(legacy.stock))legacy.stock[key]=1e8;legacy.tech.push(...G.worlds[0].techs);G.settle(legacy,1);legacy.tech.push(...G.worlds[1].techs);G.settle(legacy,2);legacy.colonies=legacy.colonies.filter(c=>c.world!==1);legacy.tech.push(...G.worlds[2].techs);assert.equal(G.nextWorld(legacy),1);assert(!G.canLaunch(legacy,3));assert.match(G.worldAccess(legacy,3).reason,/Ember first/);assert(G.visit(legacy,0));assert(G.settle(legacy,1));assert.equal(G.nextWorld(legacy),3);assert(G.visit(legacy,2));assert(G.canLaunch(legacy,3));
console.log('PASS: single next destination, ordered launches, locked future visits, atomic rejection, free colony revisits, completed route and legacy gap backfill');
