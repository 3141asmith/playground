const assert=require('node:assert/strict'),G=require('../revolve/geometry.js');
// Decode the file as a slicer would, rather than inspecting the exporter's mesh.
function audit(buffer){
 const view=new DataView(buffer.buffer||buffer,buffer.byteOffset||0,buffer.byteLength),count=view.getUint32(80,true),edges=new Map(),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];let volume=0;
 assert(count>0);assert.equal(view.byteLength,84+50*count);
 for(let i=0;i<count;i++){
  const offset=84+i*50,n=[0,1,2].map(j=>view.getFloat32(offset+j*4,true)),p=[0,1,2].map(j=>[0,1,2].map(k=>view.getFloat32(offset+12+j*12+k*4,true)));
  assert([...n,...p.flat()].every(Number.isFinite));assert.equal(view.getUint16(offset+48,true),0);
  p.forEach(q=>q.forEach((v,k)=>{min[k]=Math.min(min[k],v);max[k]=Math.max(max[k],v);}));
  const [a,b,c]=p,u=b.map((v,k)=>v-a[k]),v=c.map((v,k)=>v-a[k]),cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...cross);assert(len>0);assert(Math.abs(Math.hypot(...n)-1)<1e-6);assert(cross.reduce((sum,x,k)=>sum+x/len*n[k],0)>.999999);
  volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
  const keys=p.map(q=>q.join(','));for(let j=0;j<3;j++){const a=keys[j],b=keys[(j+1)%3],key=a<b?a+'|'+b:b+'|'+a,e=edges.get(key)||{count:0,direction:0};e.count++;e.direction+=a<b?1:-1;edges.set(key,e);}
 }
 for(const e of edges.values()){assert.equal(e.count,2,'Every edge belongs to two facets');assert.equal(e.direction,0,'Shared edges have opposite winding');}
 assert(volume>0,'Outward facets enclose positive volume');assert.equal(min[2],0,'Base is on the print bed');return{count,min,max,volume};
}
if(require.main===module){
 const collinear=[{x:0,y:0},{x:5,y:0},{x:10,y:0},{x:10,y:20},{x:0,y:20}];
 for(const p of [...Object.values(G.presets),collinear])for(const degrees of [1,90,180,359,360])for(const variant of [p,[...p].reverse(),p.map(q=>({x:-q.x,y:q.y})),p.map(q=>({x:q.x+23,y:q.y-17}))]){
  // Explicitly identify the translated case; other variants all revolve about zero.
  const translated=variant.every((q,i)=>q.x===p[i].x+23&&q.y===p[i].y-17),pivot=translated?23:0;
  const file=G.stl(variant,pivot,degrees),result=audit(file),expected=G.measures(variant,pivot,degrees);assert(Math.abs(result.volume/expected.volume-1)<.0001);assert(Math.abs(result.max[2]-expected.height)<1e-5);if(degrees===360){assert(Math.abs(result.min[0]+expected.radius)<1e-5);assert(Math.abs(result.max[0]-expected.radius)<1e-5);}
 }
 assert.throws(()=>G.stl(G.presets.cylinder,0,0),/revolution/);assert.throws(()=>G.stl(G.presets.cylinder,5,360),/centre line/);assert.throws(()=>G.stl(G.presets.cylinder,0,NaN),/revolution/);
 const pinch=[{x:0,y:5},{x:4,y:0},{x:8,y:5},{x:4,y:10}];assert.equal(G.validate(pinch),null);assert.throws(()=>G.stl(pinch),/pinch/);
 console.log('PASS binary STL structure, original millimetre scale, Z-up bed placement, outward normals, watertight oriented edges, concave/collinear cut caps, volume, reversed/left/translated profiles and pinched-solid rejection');
}
module.exports={audit};
