(()=>{
 'use strict';
 const $=id=>document.getElementById(id), W=10,H=6,R=.25,DT=1/120,INTERVAL=1/60,WINDOW=12;
 const world=$('world'),ctx=world.getContext('2d'),charts=['distance','velocity','acceleration'].map(name=>({canvas:$(name+'-chart'),key:name,color:{distance:'#b64223',velocity:'#3c705d',acceleration:'#695695'}[name]}));
 const state={x:3,y:4,vx:0,vy:0,t:0,g:9.81,bounce:.75,paused:false,dragging:false};
 let target={x:3,y:4},samples=[],trail=[],history=[],pointer=null,offset={x:0,y:0},accumulator=0,last=0,steps=0,lastSampleV=0,keys=new Set();
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function reset(){Object.assign(state,{x:3,y:4,vx:0,vy:0,t:0,paused:false,dragging:false});target={x:3,y:4};samples=[{t:0,distance:4,velocity:0,acceleration:-state.g}];trail=[];history=[];keys.clear();pointer=null;accumulator=0;steps=0;lastSampleV=0;$('pause').textContent='Pause';}
 function step(dt){
  const oldX=state.x,oldY=state.y;
  if(state.dragging){
   if(keys.size){const speed=4*dt;target.x+=((keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0))*speed;target.y+=((keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0))*speed;}
   state.x=clamp(target.x,R,W-R);state.y=clamp(target.y,R,H-R);state.vx=(state.x-oldX)/dt;state.vy=(state.y-oldY)/dt;
  }else{
   state.y+=state.vy*dt-.5*state.g*dt*dt;state.vy-=state.g*dt;state.x+=state.vx*dt;
   if(state.x<R){state.x=R;state.vx=Math.abs(state.vx)*state.bounce;}
   if(state.x>W-R){state.x=W-R;state.vx=-Math.abs(state.vx)*state.bounce;}
   if(state.y<R){state.y=R;state.vy=Math.abs(state.vy)*state.bounce;if(state.vy<.16){state.vy=0;state.vx*=Math.exp(-4*dt);}}
   if(state.y>H-R){state.y=H-R;state.vy=-Math.abs(state.vy)*state.bounce;}
  }
  state.t+=dt;history.push({t:state.t,x:state.x,y:state.y});while(history.length>1&&history[0].t<state.t-.09)history.shift();
  if(++steps%2===0){const acceleration=(state.vy-lastSampleV)/INTERVAL;lastSampleV=state.vy;samples.push({t:state.t,distance:state.y,velocity:state.vy,acceleration});while(samples.length>1&&samples[0].t<state.t-WINDOW)samples.shift();trail.push({x:state.x,y:state.y});if(trail.length>70)trail.shift();}
 }
 function size(canvas){const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);return {c,w:rect.width,h:rect.height};}
 function mapping(){const r=world.getBoundingClientRect(),s=Math.max(1,Math.min((r.width-56)/W,(r.height-46)/H));return {s,left:(r.width-W*s)/2,top:(r.height-H*s)/2};}
 function drawWorld(){const {w,h}=size(world),{s,left,top}=mapping(),px=x=>left+x*s,py=y=>top+(H-y)*s;ctx.clearRect(0,0,w,h);ctx.strokeStyle='#cbd3c1';ctx.lineWidth=1;
  for(let x=0;x<=W;x++){ctx.beginPath();ctx.moveTo(px(x),py(0));ctx.lineTo(px(x),py(H));ctx.stroke();}
  for(let y=0;y<=H;y++){ctx.beginPath();ctx.moveTo(px(0),py(y));ctx.lineTo(px(W),py(y));ctx.stroke();}
  ctx.fillStyle='#707a64';ctx.font='9px sans-serif';ctx.textAlign='right';for(let y=0;y<=H;y+=2)ctx.fillText(y+' m',left-7,py(y)+3);
  ctx.strokeStyle='#849275';ctx.lineWidth=2;ctx.strokeRect(left,top,W*s,H*s);
  trail.forEach((p,i)=>{ctx.beginPath();ctx.fillStyle=`rgba(182,66,35,${i/trail.length*.22})`;ctx.arc(px(p.x),py(p.y),Math.max(1,R*s*.22),0,Math.PI*2);ctx.fill();});
  ctx.beginPath();ctx.fillStyle='#b64223';ctx.arc(px(state.x),py(state.y),R*s,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.fillStyle='#eab699';ctx.arc(px(state.x)-R*s*.28,py(state.y)-R*s*.3,R*s*.22,0,Math.PI*2);ctx.fill();
  if(state.dragging){ctx.beginPath();ctx.strokeStyle='#b64223';ctx.lineWidth=1;ctx.arc(px(state.x),py(state.y),R*s+5,0,Math.PI*2);ctx.stroke();}
 }
 function chart({canvas,key,color}){
  const {c,w,h}=size(canvas),box={x:49,y:12,w:w-65,h:h-35},end=Math.max(WINDOW,state.t),start=end-WINDOW;
  let min=0,max=H;if(key!=='distance'){let peak=key==='velocity'?5:Math.max(12,state.g*1.5);if(key==='velocity')for(const p of samples)peak=Math.max(peak,Math.abs(p[key])*1.12);min=-peak;max=peak;}
  const px=t=>box.x+(t-start)/WINDOW*box.w,py=v=>box.y+box.h-(v-min)/(max-min)*box.h;
  c.clearRect(0,0,w,h);c.font='9px sans-serif';c.lineWidth=1;
  for(let i=0;i<=4;i++){const value=min+(max-min)*i/4,y=py(value);c.strokeStyle=Math.abs(value)<1e-8?'#b4b7a9':'#e3e3d9';c.beginPath();c.moveTo(box.x,y);c.lineTo(box.x+box.w,y);c.stroke();c.fillStyle='#777b6f';c.textAlign='right';c.fillText(Math.abs(value)>=100?value.toFixed(0):value.toFixed(1),box.x-7,y+3);}
  for(let i=0;i<=4;i++){const t=start+WINDOW*i/4,x=px(t);c.strokeStyle='#e3e3d9';c.beginPath();c.moveTo(x,box.y);c.lineTo(x,box.y+box.h);c.stroke();c.fillStyle='#777b6f';c.textAlign='center';c.fillText(t.toFixed(0)+' s',x,h-6);}
  if(key==='acceleration'){const y=py(-state.g);c.strokeStyle='#9b8db5';c.setLineDash([4,4]);c.beginPath();c.moveTo(box.x,y);c.lineTo(box.x+box.w,y);c.stroke();c.setLineDash([]);c.fillStyle='#695695';c.textAlign='right';c.fillText('−g = −'+state.g.toFixed(2)+' m/s²',box.x+box.w-4,y-5);}
  c.save();c.beginPath();c.rect(box.x,box.y,box.w,box.h);c.clip();c.strokeStyle=color;c.lineWidth=1.6;c.beginPath();samples.forEach((p,i)=>{if(i===0)c.moveTo(px(p.t),py(p[key]));else c.lineTo(px(p.t),py(p[key]));});c.stroke();
  if(key==='acceleration'){c.fillStyle=color;for(const p of samples){if(p[key]>=min&&p[key]<=max)continue;const x=px(p.t),top=p[key]>max,y=top?box.y+1:box.y+box.h-1;c.beginPath();c.moveTo(x,y);c.lineTo(x-3,y+(top?5:-5));c.lineTo(x+3,y+(top?5:-5));c.closePath();c.fill();}}
  c.restore();canvas.dataset.min=min;canvas.dataset.max=max;
 }
 function render(){drawWorld();charts.forEach(chart);$('height').textContent=state.y.toFixed(2)+' m';$('velocity').textContent=state.vy.toFixed(2)+' m/s';$('time').textContent=state.t.toFixed(1)+' s';$('status').textContent=state.paused?'Paused':state.dragging?'In your hands':state.y<=R+.001&&Math.abs(state.vy)<.01?'At rest':state.vy>0?'Rising':'Falling';$('recording').textContent=(state.paused?'Paused':'Live')+' · last 12 seconds';}
 function position(e){const rect=world.getBoundingClientRect(),m=mapping();return {x:(e.clientX-rect.left-m.left)/m.s,y:H-(e.clientY-rect.top-m.top)/m.s};}
 world.addEventListener('pointerdown',e=>{if(pointer!==null||e.button!==0)return;const p=position(e);if(Math.hypot(p.x-state.x,p.y-state.y)>R+.18)return;e.preventDefault();world.focus();pointer=e.pointerId;world.setPointerCapture(pointer);offset={x:state.x-p.x,y:state.y-p.y};target={x:state.x,y:state.y};history=[{t:state.t,x:state.x,y:state.y}];state.dragging=true;state.vx=state.vy=0;});
 world.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;const p=position(e);target={x:clamp(p.x+offset.x,R,W-R),y:clamp(p.y+offset.y,R,H-R)};if(state.paused){state.x=target.x;state.y=target.y;}});
 function release(cancel=false){if(!state.dragging)return;if(!cancel&&!state.paused&&history.length>1){const p=history[0],elapsed=state.t-p.t;state.vx=elapsed?clamp((state.x-p.x)/elapsed,-18,18):0;state.vy=elapsed?clamp((state.y-p.y)/elapsed,-18,18):0;}else state.vx=state.vy=0;state.dragging=false;pointer=null;keys.clear();}
 world.addEventListener('pointerup',e=>{if(e.pointerId===pointer)release();});world.addEventListener('pointercancel',()=>release(true));world.addEventListener('lostpointercapture',()=>{if(pointer!==null)release(true);});
 world.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow')||pointer!==null)return;e.preventDefault();if(!state.dragging){target={x:state.x,y:state.y};history=[];state.dragging=true;}keys.add(e.key);});
 world.addEventListener('keyup',e=>{keys.delete(e.key);if(pointer===null&&!keys.size)release();});world.addEventListener('blur',()=>{if(pointer===null)release(true);});
 $('pause').addEventListener('click',()=>{state.paused=!state.paused;accumulator=0;$('pause').textContent=state.paused?'Resume':'Pause';});$('reset').addEventListener('click',reset);
 $('gravity').addEventListener('input',e=>{state.g=Number(e.target.value);$('gravity-value').textContent=state.g.toFixed(2)+' m/s²';});$('bounce').addEventListener('input',e=>{state.bounce=Number(e.target.value);$('bounce-value').textContent=Math.round(state.bounce*100)+'%';});
 document.addEventListener('visibilitychange',()=>{last=0;accumulator=0;if(document.hidden)release(true);});
 function frame(now){if(last&&!state.paused&&!document.hidden){accumulator+=Math.min((now-last)/1000,.1);while(accumulator>=DT){step(DT);accumulator-=DT;}}last=now;render();requestAnimationFrame(frame);}
 reset();requestAnimationFrame(frame);
 window.motionLab={state,get samples(){return samples;},step,reset,constants:{W,H,R,DT}};
})();
