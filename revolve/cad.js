(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./geometry'));else root.CadTools=factory(root.RevolveGeometry);})(typeof globalThis!=='undefined'?globalThis:this,function(G){
 'use strict';
 function bounds(rings,closed=true){const list=rings.filter(r=>r.length).map(r=>G.profileBounds(r,closed,4000));if(!list.length)throw Error('Draw an outline first.');const minX=Math.min(...list.map(b=>b.minX)),maxX=Math.max(...list.map(b=>b.maxX)),minY=Math.min(...list.map(b=>b.minY)),maxY=Math.max(...list.map(b=>b.maxY));return{minX,maxX,minY,maxY,width:maxX-minX,height:maxY-minY,center:{x:(minX+maxX)/2,y:(minY+maxY)/2}};}
 function transform(rings,{dx=0,dy=0,degrees=0,sx=1,sy=1,pivot={x:0,y:0}},limit=1000){if(![dx,dy,degrees,sx,sy,pivot.x,pivot.y].every(Number.isFinite)||sx===0||sy===0)throw Error('Enter finite transform values and nonzero scale factors.');const angle=degrees*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
  const point=p=>{const x=(p.x-pivot.x)*sx,y=(p.y-pivot.y)*sy,q={x:pivot.x+x*c-y*s+dx,y:pivot.y+x*s+y*c+dy};if(![q.x,q.y].every(n=>Number.isFinite(n)&&Math.abs(n)<=limit))throw Error('The transform would move the outline outside ±'+limit+' mm.');for(const key of ['x','y'])if(Math.abs(q[key])<1e-10)q[key]=0;return q;};
  return rings.map(r=>r.map(p=>({...point(p),...(p.curve?{curve:{c1:point(p.curve.c1),c2:point(p.curve.c2)}}:{})})));
 }
 function split(points,index,t=.5,closed=true,limit=80){if(!Number.isInteger(index)||index<0||index>=points.length||(!closed&&index===points.length-1))throw Error('Select an edge to split.');if(!Number.isFinite(t)||t<=0||t>=1)throw Error('Choose a split position between 0% and 100%.');if(points.length>=limit)throw Error('This outline has reached its vertex limit.');const result=G.clonePoints(points),a=result[index],b=result[(index+1)%result.length],lerp=(p,q)=>({x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t});let next;
  if(a.curve){const p=lerp(a,a.curve.c1),q=lerp(a.curve.c1,a.curve.c2),r=lerp(a.curve.c2,b),u=lerp(p,q),v=lerp(q,r),m=lerp(u,v);a.curve={c1:p,c2:u};next={...m,curve:{c1:v,c2:r}};}else next=lerp(a,b);result.splice(index+1,0,next);return result;
 }
 function primitive({kind,width,height,cx,cy,sides=6},limit=1000){if(![width,cx,cy].every(Number.isFinite)||width<=0||(kind==='rectangle'&&(!Number.isFinite(height)||height<=0)))throw Error('Enter positive dimensions and finite centre coordinates.');let points;
  if(kind==='rectangle')points=[{x:cx-width/2,y:cy-height/2},{x:cx+width/2,y:cy-height/2},{x:cx+width/2,y:cy+height/2},{x:cx-width/2,y:cy+height/2}];
  else if(kind==='circle'){const r=width/2,k=4*(Math.SQRT2-1)/3;points=Array.from({length:4},(_,i)=>{const a=i*Math.PI/2,b=(i+1)*Math.PI/2;return{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a),curve:{c1:{x:cx+r*(Math.cos(a)-k*Math.sin(a)),y:cy+r*(Math.sin(a)+k*Math.cos(a))},c2:{x:cx+r*(Math.cos(b)+k*Math.sin(b)),y:cy+r*(Math.sin(b)-k*Math.cos(b))}}};});}
  else if(kind==='polygon'){if(!Number.isInteger(sides)||sides<3||sides>32)throw Error('Choose 3–32 polygon sides.');points=Array.from({length:sides},(_,i)=>({x:cx+width/2*Math.cos(i*2*Math.PI/sides),y:cy+width/2*Math.sin(i*2*Math.PI/sides)}));}else throw Error('Choose a supported shape.');
  return transform([points],{},limit)[0];
 }
 function measure(points,closed=true,index=null){if(!points.length)return null;const b=bounds([points],closed),flat=G.flattenProfile(points,closed,.01,8192,4000);let perimeter=0;for(let i=0;i<(closed?flat.length:flat.length-1);i++){const a=flat[i],q=flat[(i+1)%flat.length];perimeter+=Math.hypot(a.x-q.x,a.y-q.y);}let edge=null;
  if(index!==null&&index>=0&&index<points.length&&(closed||index<points.length-1)){const a=points[index],q=points[(index+1)%points.length],sample=G.flattenProfile([a,q],false,.01,8192,4000);let length=0;for(let i=1;i<sample.length;i++)length+=Math.hypot(sample[i].x-sample[i-1].x,sample[i].y-sample[i-1].y);edge={length,degrees:Math.atan2(q.y-a.y,q.x-a.x)*180/Math.PI,curved:Boolean(a.curve)};}
  return{...b,perimeter,area:closed?Math.abs(G.signedArea(flat)):null,edge};
 }
 return{bounds,transform,split,primitive,measure};
});
