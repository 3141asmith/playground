const assert=require('node:assert/strict'),G=require('../revolve/geometry'),E=require('../revolve/extrusion'),{audit}=require('./revolve-stl-models.cjs');
const close=(a,b,tolerance=1e-5)=>assert(Math.abs(a-b)<tolerance,`${a} should equal ${b}`);
for(const [name,p]of Object.entries(E.presets))for(const thickness of [.1,5,37.5,1000])for(const shape of [p,[...p].reverse(),p.map(q=>({x:q.x-23,y:q.y-17}))]){
 const result=audit(E.stl(shape,thickness)),m=E.measures(shape,thickness),display=E.mesh(shape,thickness);
 close(result.max[0]-result.min[0],m.width);close(result.max[1]-result.min[1],m.height);close(result.max[2],thickness,1e-4);assert(Math.abs(result.volume/m.volume-1)<1e-6);assert(display.positions.every(Number.isFinite));assert.equal(display.axisLine.length,0);
}
const box=E.measures(E.presets.rectangle,5);assert.equal(box.area,300);assert.equal(box.volume,1500);assert.equal(box.surface,950);
const collinear=[{x:0,y:0},{x:10,y:0},{x:20,y:0},{x:20,y:15},{x:0,y:15}];close(audit(E.stl(collinear,5)).volume,1500);
const across=E.presets.rectangle.map(p=>({x:p.x-10,y:p.y}));assert.match(G.validate(across),/centre line/);assert.equal(E.validate(across,5),null);close(audit(E.stl(across,5)).volume,1500);
const curve=[{x:0,y:0,curve:{c1:{x:5,y:-5},c2:{x:15,y:-5}}},{x:20,y:0},{x:20,y:15},{x:0,y:15}];const curved=audit(E.stl(curve,5)),cm=E.measures(curve,5);assert(Math.abs(curved.volume/cm.volume-1)<.002);assert(curved.count>12);
for(const depth of [0,-1,.01,1001,NaN,Infinity])assert.throws(()=>E.stl(E.presets.rectangle,depth),/thickness/);
const crossed=[{x:0,y:0},{x:10,y:10},{x:0,y:10},{x:10,y:0}];assert.throws(()=>E.stl(crossed,5),/crosses/);assert.throws(()=>E.stl([{x:0,y:0},{x:10,y:0}],5),/three/);
console.log('PASS extruded rectangle/triangle/concave/curved profiles, both windings, translation, crossing former axis, collinear caps, analytic volume/surface, thickness bounds and independent STL manifold/normal/dimension audits');
