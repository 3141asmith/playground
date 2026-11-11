const assert=require('node:assert/strict'),G=require('../revolve/geometry'),E=require('../revolve/extrusion'),S=require('../revolve/symmetry'),{audit}=require('./revolve-stl-models.cjs');
const settings=(order,x=10,y=7.5)=>({order,center:{x,y}});
for(let order=2;order<=24;order++){
 const s=settings(order),polygons=S.footprint(E.presets.rectangle,s),file=audit(S.stl(E.presets.rectangle,5,s)),display=S.mesh(E.presets.rectangle,5,s);
 assert(polygons.length);assert(display.positions.every(Number.isFinite));assert(Math.abs(file.volume/display.metrics.volume-1)<.00001);assert.equal(file.max[2],5);assert.equal(S.copies(E.presets.rectangle,s).length,order);
}
// Overlapping copies count once: a rectangle already has twofold symmetry.
assert.equal(audit(S.stl(E.presets.rectangle,5,settings(2))).volume,1500);
const four=S.mesh(E.presets.rectangle,5,settings(4));assert.equal(four.metrics.area,375);assert.equal(four.metrics.volume,1875);
// Four bars join into a frame. The hole must remain empty and have closed walls.
const bar=[{x:6,y:-10},{x:14,y:-10},{x:14,y:10},{x:6,y:10}],frame=settings(4,0,0);assert.equal(S.footprint(bar,frame)[0].length,2);assert(Math.abs(audit(S.stl(bar,5,frame)).volume-2880)<1e-6);
const apart=settings(3,-30,-30);assert.equal(S.footprint(E.presets.rectangle,apart).length,3);assert(Math.abs(audit(S.stl(E.presets.rectangle,5,apart)).volume-4500)<.01);
// These outlines exercise collinear hole bridges in cap triangulation.
for(const order of [2,4,8,12,24])audit(S.stl(G.presets.vase,5,settings(order,5,9)));
const curve=G.clonePoints(E.presets.rectangle);curve[0].curve={c1:{x:5,y:-4},c2:{x:15,y:-4}};audit(S.stl(curve,2,settings(5)));
const rotated=S.copies(curve,settings(4,0,0))[1];assert(Math.abs(rotated[0].curve.c1.x-4)<1e-8);assert(Math.abs(rotated[0].curve.c1.y-5)<1e-8);
const reversed=[...E.presets.rectangle].reverse();assert(Math.abs(audit(S.stl(reversed,5,settings(4))).volume-1875)<1e-6);
for(const order of [0,1,2.5,25,NaN])assert.throws(()=>S.stl(E.presets.rectangle,5,settings(order)),/whole-number/);
assert.throws(()=>S.stl(E.presets.rectangle,5,settings(4,Infinity,0)),/centre/);assert.throws(()=>S.stl(E.presets.rectangle,5,settings(2,0,0)),/touch|point/);
console.log('PASS every order 2–24, union without double-counting, holes, disconnected components, complex hole caps, curves/control rotation, winding, invalid settings and independent closed-STL audits');
