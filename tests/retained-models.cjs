const assert=require('node:assert/strict'),G=require('../revolve/geometry'),E=require('../revolve/extrusion'),S=require('../revolve/symmetry'),R=require('../revolve/retained'),{audit}=require('./revolve-stl-models.cjs');
for(const [seed,symmetry]of [[E.presets.rectangle,{order:4,center:{x:10,y:7.5}}],[G.presets.vase,{order:8,center:{x:5,y:9}}],[E.presets.rectangle,{order:3,center:{x:-30,y:-30}}]]){
 const outlines=R.clone(S.footprint(seed,symmetry,.01)),before=audit(S.stl(seed,5,symmetry)),after=audit(R.stl(null,5,{outlines}));assert(Math.abs(before.volume-after.volume)<.001);assert.deepEqual(before.min,after.min);assert.deepEqual(before.max,after.max);assert.equal(R.validate(null,5,{outlines}),null);
 const history=R.clone(outlines);outlines[0][0][0].x+=.5;assert.notEqual(outlines[0][0][0].x,history[0][0][0].x);
}
const bar=[{x:6,y:-10},{x:14,y:-10},{x:14,y:10},{x:6,y:10}],outlines=R.clone(S.footprint(bar,{order:4,center:{x:0,y:0}},.01));assert.equal(outlines[0].length,2);assert(Math.abs(audit(R.stl(null,5,{outlines})).volume-2880)<1e-5);
const rectangle=G.clonePoints(E.presets.rectangle),cutout=[{x:5,y:5},{x:10,y:5},{x:10,y:10},{x:5,y:10}];assert(Math.abs(audit(R.stl(null,5,{outlines:[[rectangle,cutout]]})).volume-1375)<1e-6);
assert(Math.abs(audit(R.stl(null,5,{outlines:[[rectangle,cutout,[...cutout].reverse()]]})).volume-1375)<1e-6,'Overlapping cut-outs must subtract once regardless of winding');
// A cut-out outside the material must never add new material.
const outside=cutout.map(p=>({x:p.x+30,y:p.y}));assert(Math.abs(audit(R.stl(null,5,{outlines:[[rectangle,outside]]})).volume-1500)<1e-6);
const big=Array.from({length:160},(_,i)=>({x:20*Math.cos(i*2*Math.PI/160),y:20*Math.sin(i*2*Math.PI/160)}));assert.equal(R.validate(null,5,{outlines:[[big]]}),null);audit(R.stl(null,5,{outlines:[[big]]}));
const curved=G.clonePoints(rectangle);curved[0].curve={c1:{x:5,y:-3},c2:{x:15,y:-3}};audit(R.stl(null,5,{outlines:[[curved]]}));assert.match(R.validate(null,5,{outlines:[[[]]]}),/three/);
console.log('PASS retained merged geometry/holes/disconnected parts, exact dimensions and volume, independent edits, deep history, new cut-outs, outside-hole handling, large editable contours, curves and closed STL audits');
