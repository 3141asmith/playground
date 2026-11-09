const assert=require('node:assert/strict'),G=require('../revolve/geometry.js'),{audit}=require('./revolve-stl-models.cjs');
const curved=G.clonePoints(G.presets.cylinder);curved[1].curve={c1:{x:16,y:20/3},c2:{x:16,y:40/3}};
assert.equal(G.validate(curved),null);const mid=G.bezier(curved[1],curved[1].curve.c1,curved[1].curve.c2,curved[2],.5);assert.deepEqual(mid,{x:14.5,y:10});assert.equal(G.profileBounds(curved).maxX,14.5);
const coarse=G.flattenProfile(curved),fine=G.flattenProfile(curved,true,.01);assert(fine.length>coarse.length);assert(coarse.length>curved.length);assert.equal(G.flattenProfile(curved,false).at(-1).y,20);
const expected=Math.PI*20*(100+60+10.8),metrics=G.measures(curved);assert.equal(metrics.radius,14.5);assert.equal(metrics.height,20);assert(Math.abs(metrics.volume/expected-1)<.003);assert(Math.abs(metrics.area/260-1)<.001);
for(const angle of [90,180,360]){const decoded=audit(G.stl(curved,0,angle));assert(Math.abs(decoded.volume/(expected*angle/360)-1)<.001);assert.equal(decoded.max[2],20);assert(G.mesh(curved,0,angle).positions.every(Number.isFinite));}
const clone=G.clonePoints(curved);clone[1].curve.c1.x=25;assert.equal(curved[1].curve.c1.x,16);
const shifted=curved.map(p=>({x:p.x-23,y:p.y+17,...(p.curve?{curve:{c1:{x:p.curve.c1.x-23,y:p.curve.c1.y+17},c2:{x:p.curve.c2.x-23,y:p.curve.c2.y+17}}}:{})}));assert(Math.abs(audit(G.stl(shifted,-23)).volume/audit(G.stl(curved)).volume-1)<1e-7);
const crossing=G.clonePoints(curved);crossing[1].curve={c1:{x:-10,y:5},c2:{x:-10,y:15}};assert.match(G.validate(crossing),/centre line/);assert.throws(()=>G.stl(crossing),/centre line/);
const invalid=G.clonePoints(curved);invalid[1].curve.c1.x=NaN;assert.match(G.validate(invalid),/handle coordinates/);
// Collinear control polygons can reverse direction: never flatten them to one chord.
const reversed=G.clonePoints(G.presets.cylinder);reversed[1].curve={c1:{x:10,y:30},c2:{x:10,y:-10}};assert(G.flattenProfile(reversed).length>4);assert(G.validate(reversed));
const closing=G.clonePoints(G.presets.cylinder);closing[3].curve=G.lineControls(closing[3],closing[0]);assert.equal(G.validate(closing),null);assert(Math.abs(G.measures(closing).volume-G.measures(G.presets.cylinder).volume)<1e-8);audit(G.stl(closing,0,180));
console.log('PASS cubic endpoints/midpoint/extrema, adaptive flattening, analytic curved volume, curved closed STL and partial caps, translated controls, history cloning and invalid/axis-crossing/reversing curves');
