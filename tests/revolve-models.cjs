const assert=require('node:assert/strict'),G=require('../revolve/geometry.js'),near=(a,b)=>assert(Math.abs(a-b)<1e-7*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const c=G.presets.cylinder,cone=G.presets.cone,tube=G.presets.tube;
near(G.measures(c).volume,Math.PI*100*20);near(G.measures(c).surface,2*Math.PI*100+2*Math.PI*10*20);
near(G.measures(cone).volume,Math.PI*144*24/3);near(G.measures(cone).surface,Math.PI*144+Math.PI*12*Math.hypot(12,24));
near(G.measures(tube).volume,Math.PI*(100-25)*18);near(G.measures(tube).surface,2*Math.PI*75+2*Math.PI*15*18);
const full=G.measures(c),half=G.measures(c,0,180);near(half.volume,full.volume/2);near(half.surface,full.surface/2+2*full.area);near(G.measures(c,0,0).surface,0);
for(const p of Object.values(G.presets)){
 assert.equal(G.validate(p),null);const reference=G.measures(p);near(G.measures([...p].reverse()).volume,reference.volume);near(G.measures(p.map(q=>({x:-q.x,y:q.y}))).volume,reference.volume);near(G.measures(p.map(q=>({x:q.x+23,y:q.y-17})),23).volume,reference.volume);
 const bigger=G.measures(p.map(q=>({x:q.x*2,y:q.y*2})));near(bigger.volume,reference.volume*8);near(bigger.surface,reference.surface*4);
 const triangles=G.triangulate(p);near(triangles.reduce((sum,t)=>sum+Math.abs(G.signedArea(t.map(i=>p[i]))),0),Math.abs(G.signedArea(p)));
 for(const angle of [0,1,90,180,359,360]){const m=G.mesh(p,0,angle);assert(m.positions.every(Number.isFinite));assert(m.normals.every(Number.isFinite));assert.equal(m.positions.length,m.normals.length);assert.equal(m.positions.length%9,0);if(angle>0)assert(m.positions.length>0);else assert.equal(m.positions.length,0);}
}
assert.match(G.validate([{x:0,y:0},{x:5,y:5},{x:0,y:5},{x:5,y:0}]),/crosses/);assert.match(G.validate(c,5),/centre line cuts/);assert.match(G.validate(c.concat(c[0])),/overlap|touches/);assert(G.validate([{x:0,y:0},{x:1,y:0},{x:2,y:0}]));assert(G.validate([{x:NaN,y:0},...c]));assert(G.validate(c,Infinity));assert(G.validate(c.slice(0,2)));
const collinear=[{x:0,y:0},{x:5,y:0},{x:10,y:0},{x:10,y:20},{x:0,y:20}];assert.equal(G.validate(collinear),null);near(G.measures(collinear).volume,full.volume);assert(G.mesh(collinear,0,45).positions.length>0);
console.log('PASS cylinder/cone/hollow-tube volumes and areas, partial cut faces, winding, reflection, translation and scaling invariants, concave triangulation, finite meshes and invalid outlines');
