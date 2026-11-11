(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./geometry'));else root.ExtrudeGeometry=factory(root.RevolveGeometry);})(typeof globalThis!=='undefined'?globalThis:this,function(G){
 'use strict';
 function validate(points,thickness){const error=G.validateOutline(points);if(error)return error;if(!Number.isFinite(thickness)||thickness<.1||thickness>1000)return 'Choose a thickness from 0.1 to 1000 mm.';return null;}
 function profile(points,tolerance){const error=G.validateOutline(points,tolerance);if(error)throw Error(error);const p=G.flattenProfile(points,true,tolerance);if(G.signedArea(p)<0)p.reverse();
  // Caps and walls must share exactly the same boundary to avoid T-junctions.
  let changed=true;while(changed&&p.length>3){changed=false;for(let i=0;i<p.length;i++){const a=p[(i+p.length-1)%p.length],b=p[i],c=p[(i+1)%p.length];if(Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x))<1e-8){p.splice(i,1);changed=true;break;}}}return p;
 }
 function measures(points,thickness){const error=validate(points,thickness);if(error)throw Error(error);const p=profile(points,.03),bounds=G.profileBounds(points),area=Math.abs(G.signedArea(p)),perimeter=p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+Math.hypot(b.x-a.x,b.y-a.y);},0);return{width:bounds.maxX-bounds.minX,height:bounds.maxY-bounds.minY,thickness,area,volume:area*thickness,surface:2*area+perimeter*thickness};}
 function printableMesh(points,thickness,tolerance=.01){const error=validate(points,thickness);if(error)throw Error(error);const p=profile(points,tolerance),n=p.length,minX=Math.min(...p.map(a=>a.x)),minY=Math.min(...p.map(a=>a.y));
  const vertices=[0,thickness].flatMap(z=>p.map(a=>[Math.fround(a.x-minX),Math.fround(a.y-minY),Math.fround(z)])),triangles=[];
  for(const [a,b,c]of G.triangulate(p)){triangles.push([a,c,b],[a+n,b+n,c+n]);}
  for(let i=0;i<n;i++){const j=(i+1)%n;triangles.push([i,j,j+n],[i,j+n,i+n]);}
  // Audit the actual float32 coordinates stored by STL, not just ideal doubles.
  const edges=new Map();for(const face of triangles){const [a,b,c]=face.map(i=>vertices[i]),u=b.map((v,k)=>v-a[k]),v=c.map((x,k)=>x-a[k]);if(!Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]))throw Error('An edge is too small to print. Move or remove a vertex.');for(let k=0;k<3;k++){const a=vertices[face[k]].join(','),b=vertices[face[(k+1)%3]].join(','),key=a<b?a+'|'+b:b+'|'+a,e=edges.get(key)||{count:0,direction:0};e.count++;e.direction+=a<b?1:-1;edges.set(key,e);}}
  if([...edges.values()].some(e=>e.count!==2||e.direction!==0))throw Error('The outline could not form a closed solid. Adjust its vertices.');return{vertices,triangles};
 }
 function mesh(points,thickness){const metrics=measures(points,thickness),solid=printableMesh(points,thickness,.03),positions=[],normals=[],lines=[],scale=Math.max(Math.hypot(metrics.width/2,metrics.height/2,thickness/2),.01);
  // Display the drawn outline upright; exported thickness is the Z-up print height.
  const point=p=>[(p[0]-metrics.width/2)/scale,(p[1]-metrics.height/2)/scale,(p[2]-thickness/2)/scale];
  for(const ids of solid.triangles){const [a,b,c]=ids.map(i=>point(solid.vertices[i])),u=b.map((x,k)=>x-a[k]),v=c.map((x,k)=>x-a[k]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n);positions.push(...a,...b,...c);for(let k=0;k<3;k++)normals.push(...n.map(x=>x/length));}
  const count=solid.vertices.length/2;for(let i=0;i<count;i++){const j=(i+1)%count;for(const [a,b]of [[i,j],[i+count,j+count],[i,i+count]])lines.push(...point(solid.vertices[a]),...point(solid.vertices[b]));}
  return{positions,normals,lines,metrics,scale,axisLine:[]};
 }
 function stl(points,thickness){return G.stlFromMesh(printableMesh(points,thickness),'Playground Extrusion | millimetres | Z up | base Z=0');}
 const presets={rectangle:[{x:0,y:0},{x:20,y:0},{x:20,y:15},{x:0,y:15}],triangle:[{x:-10,y:0},{x:10,y:0},{x:0,y:20}],bracket:[{x:0,y:0},{x:20,y:0},{x:20,y:6},{x:6,y:6},{x:6,y:20},{x:0,y:20}]};
 return{validate,measures,mesh,printableMesh,stl,presets};
});
