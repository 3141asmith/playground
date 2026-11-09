(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.RevolveGeometry=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';const EPS=1e-8,MAX_POINTS=80,MAX_SAMPLES=512;
 const clonePoints=points=>points.map(p=>({x:p.x,y:p.y,...(p.curve?{curve:{c1:{...p.curve.c1},c2:{...p.curve.c2}}}:{})}));
 const lineControls=(a,b)=>({c1:{x:a.x+(b.x-a.x)/3,y:a.y+(b.y-a.y)/3},c2:{x:a.x+2*(b.x-a.x)/3,y:a.y+2*(b.y-a.y)/3}});
 const lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
 function bezier(a,c1,c2,b,t){const p=lerp(a,c1,t),q=lerp(c1,c2,t),r=lerp(c2,b,t);return lerp(lerp(p,q,t),lerp(q,r,t),t);}
 function checkControls(points){for(const p of points)if(p.curve)for(const key of ['c1','c2']){const c=p.curve[key];if(!c||!Number.isFinite(c.x)||!Number.isFinite(c.y)||Math.abs(c.x)>1000||Math.abs(c.y)>1000)throw Error('Use finite Bézier handle coordinates between −1000 and 1000 mm.');}}
 // Adaptive de Casteljau subdivision bounds each curve by its control polygon.
 // The length check also catches collinear reversals that a chord-distance test misses.
 function flattenProfile(points,closed=true,tolerance=.03){
  checkControls(points);if(!points.length)return[];const result=[{x:points[0].x,y:points[0].y}];
  const append=p=>{result.push({x:p.x,y:p.y});if(result.length>MAX_SAMPLES+1)throw Error('The curves need too many segments. Simplify the outline or use fewer curves.');};
  function flatten(a,c1,c2,b,depth=0){const chord=Math.hypot(b.x-a.x,b.y-a.y),length=Math.hypot(c1.x-a.x,c1.y-a.y)+Math.hypot(c2.x-c1.x,c2.y-c1.y)+Math.hypot(b.x-c2.x,b.y-c2.y),distance=p=>chord?Math.abs((b.x-a.x)*(a.y-p.y)-(a.x-p.x)*(b.y-a.y))/chord:Math.hypot(p.x-a.x,p.y-a.y);
   if(Math.max(distance(c1),distance(c2))<=tolerance&&length-chord<=tolerance){append(b);return;}
   if(depth>=18)throw Error('A curve is too intricate. Move its handles further apart.');
   const p=lerp(a,c1,.5),q=lerp(c1,c2,.5),r=lerp(c2,b,.5),s=lerp(p,q,.5),t=lerp(q,r,.5),m=lerp(s,t,.5);flatten(a,p,s,m,depth+1);flatten(m,t,r,b,depth+1);
  }
  for(let i=0;i<(closed?points.length:points.length-1);i++){const a=points[i],b=points[(i+1)%points.length];if(a.curve)flatten(a,a.curve.c1,a.curve.c2,b);else append(b);}
  if(closed)result.pop();return result;
 }
 function profileBounds(points,closed=true){
  checkControls(points);const candidates=points.map(p=>({x:p.x,y:p.y}));
  for(let i=0;i<(closed?points.length:points.length-1);i++){const a=points[i],b=points[(i+1)%points.length];if(!a.curve)continue;const {c1,c2}=a.curve;for(const key of ['x','y']){const A=-a[key]+3*c1[key]-3*c2[key]+b[key],B=2*(a[key]-2*c1[key]+c2[key]),C=c1[key]-a[key],roots=[];if(Math.abs(A)<1e-12){if(Math.abs(B)>1e-12)roots.push(-C/B);}else{const d=B*B-4*A*C;if(d>=0)roots.push((-B+Math.sqrt(d))/(2*A),(-B-Math.sqrt(d))/(2*A));}for(const t of roots)if(t>0&&t<1)candidates.push(bezier(a,c1,c2,b,t));}}
  return{minX:Math.min(...candidates.map(p=>p.x)),maxX:Math.max(...candidates.map(p=>p.x)),minY:Math.min(...candidates.map(p=>p.y)),maxY:Math.max(...candidates.map(p=>p.y))};
 }
 const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 const on=(a,b,p)=>Math.abs(cross(a,b,p))<EPS&&p.x>=Math.min(a.x,b.x)-EPS&&p.x<=Math.max(a.x,b.x)+EPS&&p.y>=Math.min(a.y,b.y)-EPS&&p.y<=Math.max(a.y,b.y)+EPS;
 function intersects(a,b,c,d){const u=cross(a,b,c),v=cross(a,b,d),s=cross(c,d,a),t=cross(c,d,b);return(u*v<0&&s*t<0)||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b);}
 function signedArea(points){return points.reduce((n,p,i)=>{const q=points[(i+1)%points.length];return n+p.x*q.y-q.x*p.y;},0)/2;}
 function validatePolygon(points,axis=0,limit=MAX_POINTS){
  if(!Number.isFinite(axis)||Math.abs(axis)>1000)return 'Choose a centre line between −1000 and 1000 mm.';
  if(points.length<3)return 'Add at least three vertices, then close the outline.';
  if(points.length>limit)return `Use at most ${limit} vertices.`;
  if(points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.abs(p.x)>1000||Math.abs(p.y)>1000))return 'Use finite coordinates between −1000 and 1000 mm.';
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if(Math.hypot(a.x-b.x,a.y-b.y)<EPS)return 'Two neighbouring vertices overlap. Move or remove one.';for(let j=i+1;j<points.length;j++){if(j===i+1||(i===0&&j===points.length-1))continue;if(intersects(a,b,points[j],points[(j+1)%points.length]))return 'The outline crosses or touches itself. Move or remove a vertex.';}}
  // Adjacent edges must not double back over each other either.
  for(let i=0;i<points.length;i++){const a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length];if(Math.abs(cross(a,b,c))<EPS&&(a.x-b.x)*(c.x-b.x)+(a.y-b.y)*(c.y-b.y)>EPS)return 'The outline doubles back along an edge. Move or remove a vertex.';}
  if(Math.abs(signedArea(points))<EPS)return 'The outline needs an area. Move a vertex away from the line.';
  const ds=points.map(p=>p.x-axis);if(Math.min(...ds)<-EPS&&Math.max(...ds)>EPS)return 'The centre line cuts through the outline. Move it to one side or onto an edge.';
  return null;
 }
 function validate(points,axis=0){
  if(points.length<3)return 'Add at least three vertices, then close the outline.';
  if(points.length>MAX_POINTS)return `Use at most ${MAX_POINTS} vertices.`;
  try{const bounds=profileBounds(points);if(bounds.minX<axis-EPS&&bounds.maxX>axis+EPS)return 'The centre line cuts through the outline or a curve. Move the line or a Bézier handle.';return validatePolygon(flattenProfile(points),axis,MAX_SAMPLES);}catch(error){return error.message;}
 }
 function triangulate(points){
  const ids=points.map((_,i)=>i);if(signedArea(points)<0)ids.reverse();const triangles=[];
  // Remove collinear boundary points for ear clipping; the surface mesh retains them.
  let changed=true;while(changed&&ids.length>3){changed=false;for(let i=0;i<ids.length;i++){if(Math.abs(cross(points[ids[(i+ids.length-1)%ids.length]],points[ids[i]],points[ids[(i+1)%ids.length]]))<EPS){ids.splice(i,1);changed=true;break;}}}
  const inside=(p,a,b,c)=>cross(a,b,p)>=-EPS&&cross(b,c,p)>=-EPS&&cross(c,a,p)>=-EPS;
  while(ids.length>3){let found=false;for(let i=0;i<ids.length;i++){const a=ids[(i+ids.length-1)%ids.length],b=ids[i],c=ids[(i+1)%ids.length];if(cross(points[a],points[b],points[c])<=EPS)continue;if(ids.some(id=>id!==a&&id!==b&&id!==c&&inside(points[id],points[a],points[b],points[c])))continue;triangles.push([a,b,c]);ids.splice(i,1);found=true;break;}if(!found)throw Error('Unable to triangulate outline');}
  triangles.push([...ids]);return triangles;
 }
 function measures(points,axis=0,degrees=360){
  const error=validate(points,axis);if(error)throw Error(error);const bounds=profileBounds(points);points=flattenProfile(points);const fraction=Math.max(0,Math.min(360,degrees))/360,r=points.map(p=>({x:Math.abs(p.x-axis),y:p.y}));
  let moment=0,surface=0;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];moment+=(a.x+b.x)*(a.x*b.y-b.x*a.y);surface+=Math.PI*(a.x+b.x)*Math.hypot(b.x-a.x,b.y-a.y);}
  const area=Math.abs(signedArea(points));return{height:bounds.maxY-bounds.minY,radius:Math.max(Math.abs(bounds.minX-axis),Math.abs(bounds.maxX-axis)),area,volume:Math.abs(moment)*Math.PI/3*fraction,surface:fraction===0?0:surface*fraction+(fraction<1?2*area:0)};
 }
 function mesh(points,axis=0,degrees=360){
  const metrics=measures(points,axis,degrees),positions=[],normals=[],lines=[],fraction=Math.max(0,Math.min(360,degrees))/360;points=flattenProfile(points);
  const midY=(Math.max(...points.map(p=>p.y))+Math.min(...points.map(p=>p.y)))/2,scale=Math.max(Math.hypot(metrics.radius,metrics.height/2),.01);
  const point=(p,t)=>[(p.x-axis)*Math.cos(t)/scale,(p.y-midY)/scale,(p.x-axis)*Math.sin(t)/scale];
  function tri(a,b,c){const u=b.map((v,i)=>v-a[i]),v=c.map((n,i)=>n-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n);if(len<EPS)return;positions.push(...a,...b,...c);for(let i=0;i<3;i++)normals.push(...n.map(x=>x/len));}
  if(fraction>0){const segments=Math.max(1,Math.ceil(96*fraction)),angle=fraction*2*Math.PI;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];for(let j=0;j<segments;j++){const t=j/segments*angle,t1=(j+1)/segments*angle,p=point(a,t),q=point(b,t),r=point(b,t1),s=point(a,t1);tri(p,q,r);tri(p,r,s);lines.push(...p,...s);if(j%Math.max(1,Math.round(segments/16))===0||j===segments-1)lines.push(...p,...q);}}
   if(fraction<1){for(const ids of triangulate(points)){tri(...ids.map(i=>point(points[i],0)));tri(...[...ids].reverse().map(i=>point(points[i],angle)));}for(const t of [0,angle])for(let i=0;i<points.length;i++)lines.push(...point(points[i],t),...point(points[(i+1)%points.length],t));}
  }
  return{positions,normals,lines,metrics,scale,axisLine:[0,-metrics.height/(2*scale)-.18,0,0,metrics.height/(2*scale)+.18,0]};
 }
 const presets={cylinder:[{x:0,y:0},{x:10,y:0},{x:10,y:20},{x:0,y:20}],cone:[{x:0,y:0},{x:12,y:0},{x:0,y:24}],tube:[{x:5,y:0},{x:10,y:0},{x:10,y:18},{x:5,y:18}],vase:[{x:0,y:0},{x:9,y:0},{x:10,y:2},{x:8,y:6},{x:6,y:10},{x:6,y:14},{x:9,y:18},{x:7.5,y:18},{x:4.5,y:14},{x:4.5,y:10},{x:6.5,y:6},{x:8,y:2},{x:0,y:2}]};
 // Printing uses original millimetres and a Z-up frame with its base at Z=0.
 // Build separately from the normalised display mesh so camera zoom never changes scale.
 function printableMesh(points,axis=0,degrees=360){
  const error=validate(points,axis);if(error)throw Error(error);
  if(!Number.isFinite(degrees)||degrees<=0||degrees>360)throw Error('Choose a revolution greater than 0° and no more than 360°.');
  points=flattenProfile(points,true,.01);const sampledError=validatePolygon(points,axis,MAX_SAMPLES);if(sampledError)throw Error(sampledError);
  const minY=Math.min(...points.map(p=>p.y));
  const profile=points.map(p=>({x:Math.abs(p.x-axis),y:p.y-minY}));
  if(signedArea(profile)<0)profile.reverse();
  // Keep cap and swept-surface boundaries identical: no collinear cap T-junctions.
  let changed=true;while(changed&&profile.length>3){changed=false;for(let i=0;i<profile.length;i++){if(Math.abs(cross(profile[(i+profile.length-1)%profile.length],profile[i],profile[(i+1)%profile.length]))<EPS){profile.splice(i,1);changed=true;break;}}}
  const vertices=[],triangles=[],lookup=new Map(),full=degrees===360,segments=Math.max(1,Math.ceil(degrees)),radians=degrees*Math.PI/180;
  const vertex=p=>{const q=p.map(n=>Math.fround(n)||0);if(!q.every(Number.isFinite))throw Error('The solid has an invalid coordinate.');const key=q.join(',');if(!lookup.has(key)){lookup.set(key,vertices.length);vertices.push(q);}return lookup.get(key);};
  const rings=profile.map(p=>Array.from({length:segments+1},(_,j)=>{const t=full&&j===segments?0:j/segments*radians;return vertex([p.x*Math.cos(t),p.x*Math.sin(t),p.y]);}));
  const tri=(a,b,c)=>{if(a===b||b===c||c===a)return;triangles.push([a,b,c]);};
  for(let i=0;i<profile.length;i++){const k=(i+1)%profile.length;for(let j=0;j<segments;j++){const p=rings[i][j],q=rings[k][j],r=rings[k][j+1],s=rings[i][j+1];tri(p,r,q);tri(p,s,r);}}
  if(!full)for(const [a,b,c]of triangulate(profile)){tri(rings[a][0],rings[b][0],rings[c][0]);tri(rings[c][segments],rings[b][segments],rings[a][segments]);}
  // Check the actual float32 vertices that STL will store, including seam and axis welds.
  const edges=new Map(),incident=vertices.map(()=>[]),adjacent=triangles.map(()=>[]);
  triangles.forEach((t,face)=>{for(let i=0;i<3;i++){const a=t[i],b=t[(i+1)%3],key=a<b?`${a}:${b}`:`${b}:${a}`;incident[a].push(face);if(!edges.has(key))edges.set(key,{a,b,face,count:1});else{const e=edges.get(key);if(e.count!==1||e.a!==b||e.b!==a)throw Error('This outline produces a non-manifold solid. Move vertices away from isolated contacts with the centre line.');e.count++;adjacent[e.face].push(face);adjacent[face].push(e.face);}}});
  if([...edges.values()].some(e=>e.count!==2))throw Error('The solid could not be closed for printing. Adjust the outline or revolution angle.');
  // An edge-closed mesh may still have two shells pinched together at one vertex.
  incident.forEach((faces,id)=>{if(!faces.length)return;const seen=new Set([faces[0]]),pending=[faces[0]];while(pending.length){for(const next of adjacent[pending.pop()])if(!seen.has(next)&&triangles[next].includes(id)){seen.add(next);pending.push(next);}}if(seen.size!==faces.length)throw Error('The solid pinches to a point on the centre line. Move that vertex off the line or remove the pinch before exporting.');});
  return{vertices,triangles};
 }
 function stl(points,axis=0,degrees=360){
  const {vertices,triangles}=printableMesh(points,axis,degrees),buffer=new ArrayBuffer(84+50*triangles.length),data=new DataView(buffer);
  const label='Playground Revolve Lab | millimetres | Z up | base Z=0';for(let i=0;i<label.length;i++)data.setUint8(i,label.charCodeAt(i));data.setUint32(80,triangles.length,true);
  triangles.forEach((ids,i)=>{const [a,b,c]=ids.map(id=>vertices[id]),u=b.map((n,j)=>n-a[j]),v=c.map((n,j)=>n-a[j]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...normal);if(!length)throw Error('A face is too small to export. Increase the angle or adjust the outline.');const values=[...normal.map(n=>n/length),...a,...b,...c];values.forEach((n,j)=>data.setFloat32(84+i*50+j*4,n,true));});
  return buffer;
 }
 return{validate,triangulate,measures,mesh,printableMesh,stl,presets,signedArea,MAX_POINTS,MAX_SAMPLES,clonePoints,lineControls,bezier,flattenProfile,profileBounds};
});
