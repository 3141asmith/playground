(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.RevolveGeometry=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';const EPS=1e-8,MAX_POINTS=80;
 const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 const on=(a,b,p)=>Math.abs(cross(a,b,p))<EPS&&p.x>=Math.min(a.x,b.x)-EPS&&p.x<=Math.max(a.x,b.x)+EPS&&p.y>=Math.min(a.y,b.y)-EPS&&p.y<=Math.max(a.y,b.y)+EPS;
 function intersects(a,b,c,d){const u=cross(a,b,c),v=cross(a,b,d),s=cross(c,d,a),t=cross(c,d,b);return(u*v<0&&s*t<0)||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b);}
 function signedArea(points){return points.reduce((n,p,i)=>{const q=points[(i+1)%points.length];return n+p.x*q.y-q.x*p.y;},0)/2;}
 function validate(points,axis=0){
  if(!Number.isFinite(axis)||Math.abs(axis)>1000)return 'Choose a centre line between −1000 and 1000 mm.';
  if(points.length<3)return 'Add at least three vertices, then close the outline.';
  if(points.length>MAX_POINTS)return `Use at most ${MAX_POINTS} vertices.`;
  if(points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.abs(p.x)>1000||Math.abs(p.y)>1000))return 'Use finite coordinates between −1000 and 1000 mm.';
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if(Math.hypot(a.x-b.x,a.y-b.y)<EPS)return 'Two neighbouring vertices overlap. Move or remove one.';for(let j=i+1;j<points.length;j++){if(j===i+1||(i===0&&j===points.length-1))continue;if(intersects(a,b,points[j],points[(j+1)%points.length]))return 'The outline crosses or touches itself. Move or remove a vertex.';}}
  // Adjacent edges must not double back over each other either.
  for(let i=0;i<points.length;i++){const a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length];if(Math.abs(cross(a,b,c))<EPS&&(a.x-b.x)*(c.x-b.x)+(a.y-b.y)*(c.y-b.y)>EPS)return 'The outline doubles back along an edge. Move or remove a vertex.';}
  if(Math.abs(signedArea(points))<EPS)return 'The outline needs an area. Move a vertex away from the line.';
  const ds=points.map(p=>p.x-axis);if(Math.min(...ds)<-EPS&&Math.max(...ds)>EPS)return 'The centre line cuts through the outline. Move it to one side or onto an edge.';
  return null;
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
  const error=validate(points,axis);if(error)throw Error(error);const fraction=Math.max(0,Math.min(360,degrees))/360,r=points.map(p=>({x:Math.abs(p.x-axis),y:p.y}));
  let moment=0,surface=0;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];moment+=(a.x+b.x)*(a.x*b.y-b.x*a.y);surface+=Math.PI*(a.x+b.x)*Math.hypot(b.x-a.x,b.y-a.y);}
  const area=Math.abs(signedArea(points));return{height:Math.max(...r.map(p=>p.y))-Math.min(...r.map(p=>p.y)),radius:Math.max(...r.map(p=>p.x)),area,volume:Math.abs(moment)*Math.PI/3*fraction,surface:fraction===0?0:surface*fraction+(fraction<1?2*area:0)};
 }
 function mesh(points,axis=0,degrees=360){
  const metrics=measures(points,axis,degrees),positions=[],normals=[],lines=[],fraction=Math.max(0,Math.min(360,degrees))/360;
  const midY=(Math.max(...points.map(p=>p.y))+Math.min(...points.map(p=>p.y)))/2,scale=Math.max(Math.hypot(metrics.radius,metrics.height/2),.01);
  const point=(p,t)=>[(p.x-axis)*Math.cos(t)/scale,(p.y-midY)/scale,(p.x-axis)*Math.sin(t)/scale];
  function tri(a,b,c){const u=b.map((v,i)=>v-a[i]),v=c.map((n,i)=>n-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n);if(len<EPS)return;positions.push(...a,...b,...c);for(let i=0;i<3;i++)normals.push(...n.map(x=>x/len));}
  if(fraction>0){const segments=Math.max(1,Math.ceil(96*fraction)),angle=fraction*2*Math.PI;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];for(let j=0;j<segments;j++){const t=j/segments*angle,t1=(j+1)/segments*angle,p=point(a,t),q=point(b,t),r=point(b,t1),s=point(a,t1);tri(p,q,r);tri(p,r,s);lines.push(...p,...s);if(j%Math.max(1,Math.round(segments/16))===0||j===segments-1)lines.push(...p,...q);}}
   if(fraction<1){for(const ids of triangulate(points)){tri(...ids.map(i=>point(points[i],0)));tri(...[...ids].reverse().map(i=>point(points[i],angle)));}for(const t of [0,angle])for(let i=0;i<points.length;i++)lines.push(...point(points[i],t),...point(points[(i+1)%points.length],t));}
  }
  return{positions,normals,lines,metrics,scale,axisLine:[0,-metrics.height/(2*scale)-.18,0,0,metrics.height/(2*scale)+.18,0]};
 }
 const presets={cylinder:[{x:0,y:0},{x:10,y:0},{x:10,y:20},{x:0,y:20}],cone:[{x:0,y:0},{x:12,y:0},{x:0,y:24}],tube:[{x:5,y:0},{x:10,y:0},{x:10,y:18},{x:5,y:18}],vase:[{x:0,y:0},{x:9,y:0},{x:10,y:2},{x:8,y:6},{x:6,y:10},{x:6,y:14},{x:9,y:18},{x:7.5,y:18},{x:4.5,y:14},{x:4.5,y:10},{x:6.5,y:6},{x:8,y:2},{x:0,y:2}]};
 return{validate,triangulate,measures,mesh,presets,signedArea,MAX_POINTS};
});
