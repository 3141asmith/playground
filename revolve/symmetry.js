(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./geometry'),require('./extrusion'),require('./vendor/clipper-6.4.2'),require('./vendor/earcut-2.2.4'));else root.SymmetryGeometry=factory(root.RevolveGeometry,root.ExtrudeGeometry,root.ClipperLib,root.earcut);})(typeof globalThis!=='undefined'?globalThis:this,function(G,E,clip,earcut){
 'use strict';
 function validateSettings(s){if(!s||!Number.isInteger(s.order)||s.order<2||s.order>24)return 'Choose a whole-number symmetry order from 2 to 24.';if(!s.center||![s.center.x,s.center.y].every(n=>Number.isFinite(n)&&Math.abs(n)<=1000))return 'Choose symmetry centre coordinates between −1000 and 1000 mm.';return null;}
 function rotate(p,s,k){const a=2*Math.PI*k/s.order,c=Math.cos(a),t=Math.sin(a),x=p.x-s.center.x,y=p.y-s.center.y;return{x:s.center.x+x*c-y*t,y:s.center.y+x*t+y*c};}
 function copies(points,s){const error=validateSettings(s);if(error)throw Error(error);return Array.from({length:s.order},(_,k)=>points.map(p=>({...rotate(p,s,k),...(p.curve?{curve:{c1:rotate(p.curve.c1,s,k),c2:rotate(p.curve.c2,s,k)}}:{})})));}
 const cache=new Map();
 function footprint(points,s,tolerance=.03){const error=validateSettings(s)||G.validateOutline(points,tolerance);if(error)throw Error(error);const key=JSON.stringify([points,s,tolerance]);if(cache.has(key))return cache.get(key);
  const seed=G.flattenProfile(points,true,tolerance),scale=100000,input=copies(seed,s).map(p=>p.map(q=>({X:Math.round(q.x*scale),Y:Math.round(q.y*scale)}))),engine=new clip.Clipper(),tree=new clip.PolyTree(),polygons=[];
  engine.StrictlySimple=true;engine.AddPaths(input,clip.PolyType.ptSubject,true);if(!engine.Execute(clip.ClipType.ctUnion,tree,clip.PolyFillType.pftNonZero,clip.PolyFillType.pftNonZero))throw Error('The repeated outline could not be merged. Adjust the centre.');
  function collect(node){for(const child of node.Childs()){if(!child.IsHole())polygons.push([child.Contour(),...child.Childs().filter(n=>n.IsHole()).map(n=>n.Contour())]);collect(child);}}collect(tree);
  const result=polygons.map(polygon=>polygon.map((ring,index)=>{
   const p=clip.Clipper.CleanPolygon(ring,2).map(q=>({x:q.X/scale,y:q.Y/scale}));let changed=true;
   while(changed&&p.length>3){changed=false;for(let i=0;i<p.length;i++){const a=p[(i+p.length-1)%p.length],b=p[i],c=p[(i+1)%p.length],cross=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);if(Math.abs(cross)<1e-9&&((b.x-a.x)*(c.x-b.x)+(b.y-a.y)*(c.y-b.y))>=0){p.splice(i,1);changed=true;break;}}}
   if((G.signedArea(p)>0)!==(index===0))p.reverse();return p;
  })).map(p=>[p[0],...p.slice(1).filter(r=>r.length>=3&&Math.abs(G.signedArea(r))>1e-10)]).filter(p=>p[0].length>=3&&Math.abs(G.signedArea(p[0]))>1e-10);
  if(!result.length)throw Error('The repeated outline needs an area.');cache.set(key,result);while(cache.size>2)cache.delete(cache.keys().next().value);return result;
 }
 function validate(points,thickness,s){return validateSettings(s)||E.validate(points,thickness);}
 function metrics(polygons,thickness){const all=polygons.flat(2),xs=all.map(p=>p.x),ys=all.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);let area=0,perimeter=0;
  for(const polygon of polygons)for(const [i,ring]of polygon.entries()){area+=(i===0?1:-1)*Math.abs(G.signedArea(ring));ring.forEach((p,j)=>{const q=ring[(j+1)%ring.length];perimeter+=Math.hypot(p.x-q.x,p.y-q.y);});}
  return{minX,minY,width:maxX-minX,height:maxY-minY,area,perimeter,thickness,volume:area*thickness,surface:2*area+perimeter*thickness,components:polygons.length};
 }
 function printableMesh(points,thickness,s,tolerance=.01){const error=validate(points,thickness,s);if(error)throw Error(error);const polygons=footprint(points,s,tolerance),m=metrics(polygons,thickness),vertices=[],triangles=[],boundary=[],lookup=new Map();
  const vertex=p=>{const q=p.map(n=>Math.fround(n)||0),key=q.join(',');if(!lookup.has(key)){lookup.set(key,vertices.length);vertices.push(q);}return lookup.get(key);};
  for(const polygon of polygons){const flat=polygon.flat(),data=flat.flatMap(p=>[p.x,p.y]),holes=[];let offset=polygon[0].length;for(let i=1;i<polygon.length;i++){holes.push(offset);offset+=polygon[i].length;}
   const bottom=flat.map(p=>vertex([p.x-m.minX,p.y-m.minY,0])),top=flat.map(p=>vertex([p.x-m.minX,p.y-m.minY,thickness])),caps=earcut(data,holes,2);
   if(earcut.deviation(data,holes,2,caps)>1e-7)throw Error('The repeated shape could not be filled. Adjust the outline or centre.');
   for(let i=0;i<caps.length;i+=3){let[a,b,c]=caps.slice(i,i+3);const p=flat[a],q=flat[b],r=flat[c],cross=(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);if(Math.abs(cross)<1e-9)continue;if(cross<0)[b,c]=[c,b];
    // Hole bridges can leave an existing boundary vertex on a cap triangle edge.
    // Split those edges in both caps so the STL has no T-junctions.
    const perimeter=[];for(const [u,v]of [[a,b],[b,c],[c,a]]){const p=flat[u],q=flat[v],dx=q.x-p.x,dy=q.y-p.y,length2=dx*dx+dy*dy,between=[];for(let j=0;j<flat.length;j++){if(j===u||j===v)continue;const point=flat[j],t=((point.x-p.x)*dx+(point.y-p.y)*dy)/length2;if(t>1e-9&&t<1-1e-9&&Math.abs(dx*(point.y-p.y)-dy*(point.x-p.x))<1e-8*Math.sqrt(length2))between.push({j,t});}perimeter.push(u,...between.sort((x,y)=>x.t-y.t).map(x=>x.j));}
    if(perimeter.length===3)triangles.push([bottom[a],bottom[c],bottom[b]],[top[a],top[b],top[c]]);
    else{const x=(flat[a].x+flat[b].x+flat[c].x)/3-m.minX,y=(flat[a].y+flat[b].y+flat[c].y)/3-m.minY,lo=vertex([x,y,0]),hi=vertex([x,y,thickness]);for(let j=0;j<perimeter.length;j++){const u=perimeter[j],v=perimeter[(j+1)%perimeter.length];triangles.push([lo,bottom[v],bottom[u]],[hi,top[u],top[v]]);}}
   }
   let start=0;for(const ring of polygon){for(let i=0;i<ring.length;i++){const a=start+i,b=start+(i+1)%ring.length;triangles.push([bottom[a],bottom[b],top[b]],[bottom[a],top[b],top[a]]);boundary.push([bottom[a],bottom[b]],[top[a],top[b]],[bottom[a],top[a]]);}start+=ring.length;}
  }
  const edges=new Map(),incident=vertices.map(()=>new Set()),adjacent=triangles.map(()=>[]);
  triangles.forEach((face,id)=>{const [a,b,c]=face.map(i=>vertices[i]),u=b.map((x,k)=>x-a[k]),v=c.map((x,k)=>x-a[k]);if(Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])<1e-12)throw Error('The symmetry creates an edge too small to print. Move the centre or adjust a vertex.');
   for(let k=0;k<3;k++){const a=face[k],b=face[(k+1)%3],key=a<b?a+':'+b:b+':'+a,e=edges.get(key);incident[a].add(id);if(e){if(e.count!==1||e.a!==b||e.b!==a)throw Error('Repeated shapes touch without forming a printable join. Move the centre so they overlap, or separate them.');e.count++;adjacent[e.face].push(id);adjacent[id].push(e.face);}else edges.set(key,{a,b,face:id,count:1});}
  });
  if([...edges.values()].some(e=>e.count!==2))throw Error('The repeated solid could not be closed. Adjust the outline or centre.');
  incident.forEach((faces,vertex)=>{if(!faces.size)return;const first=faces.values().next().value,seen=new Set([first]),pending=[first];while(pending.length)for(const next of adjacent[pending.pop()])if(faces.has(next)&&!seen.has(next)){seen.add(next);pending.push(next);}if(seen.size!==faces.size)throw Error('Repeated shapes meet at a point. Move the centre so they overlap, or separate them.');});
  return{vertices,triangles,boundary,metrics:m};
 }
 function mesh(points,thickness,s){const solid=printableMesh(points,thickness,s,.03),m=solid.metrics,scale=Math.max(Math.hypot(m.width/2,m.height/2,thickness/2),.01),positions=[],normals=[],lines=[],point=p=>[(p[0]-m.width/2)/scale,(p[1]-m.height/2)/scale,(p[2]-thickness/2)/scale];
  for(const face of solid.triangles){const [a,b,c]=face.map(i=>point(solid.vertices[i])),u=b.map((x,k)=>x-a[k]),v=c.map((x,k)=>x-a[k]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n);positions.push(...a,...b,...c);for(let i=0;i<3;i++)normals.push(...n.map(x=>x/length));}for(const edge of solid.boundary)lines.push(...point(solid.vertices[edge[0]]),...point(solid.vertices[edge[1]]));return{positions,normals,lines,metrics:m,scale,axisLine:[]};
 }
 function stl(points,thickness,s){return G.stlFromMesh(printableMesh(points,thickness,s),'Playground rotational symmetry | millimetres | Z up | base Z=0');}
 return{copies,rotate,footprint,validateSettings,validate,mesh,stl,printableMesh};
});
