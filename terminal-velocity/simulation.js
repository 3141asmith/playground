(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const g=9.81,airDensity=1.225,dt=1/120,sampleInterval=1/30;
 const presets={
  steel:{mass:.5,area:.003,volume:.06},
  tennis:{mass:.058,area:.0035,volume:.157},
  skydiver:{mass:75,area:.7,volume:70},
  custom:{mass:.5,area:.01,volume:.5}
 };
 const world=$('world'),worldCtx=world.getContext('2d'),chart=$('chart'),chartCtx=chart.getContext('2d');
 const state={time:0,distance:0,velocity:0,acceleration:g,running:false,paused:false,landed:false,enteredLiquid:false};
 let samples=[],lastSample=0,lastFrame=0,accumulator=0;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function config(){
  const liquid=$('liquid').checked;
  return {
   mass:Number($('mass').value),area:Number($('area').value),volume:Number($('volume').value)/1000,
   parachute:$('parachute').checked,canopyArea:Number($('canopy-area').value),
   liquid,liquidDensity:$('liquid-type').value==='water'?1000:900,
   surface:Number($('surface-depth').value),liquidDepth:Number($('liquid-depth').value),
   dropHeight:Number($('drop-height').value)
  };
 }
 function dragArea(c,submerged){
  return submerged?c.area*.47:(c.area*.47+(c.parachute?c.canopyArea*1.5:0));
 }
 function terminalSpeed(c,submerged){
  const density=submerged?c.liquidDensity:airDensity;
  const effectiveWeight=c.mass*g-(submerged?density*c.volume*g:0);
  return Math.sign(effectiveWeight)*Math.sqrt(2*Math.abs(effectiveWeight)/(density*dragArea(c,submerged)));
 }
 function recordImpact(time,velocity,liquid){
  samples.push({time,velocity,liquid},{time,velocity:0,liquid});
  lastSample=time;
 }
 function prepare(){
  Object.assign(state,{time:0,distance:0,velocity:0,acceleration:g,running:false,paused:false,landed:false,enteredLiquid:false});
  samples=[{time:0,velocity:0,liquid:false}];lastSample=0;accumulator=0;lastFrame=0;
  $('status').textContent='Ready';$('pause').textContent='Pause';$('pause').disabled=true;
  render();
 }
 function start(){
  if(state.running&&!state.landed)return;
  if(!$('volume').checkValidity()){
   $('status').textContent='Enter a valid object volume';
   $('volume').reportValidity();
   return;
  }
  prepare();state.running=true;$('status').textContent='Falling';$('pause').disabled=false;
 }
 function step(delta){
  if(!state.running||state.paused||state.landed)return;
  const c=config(),submerged=c.liquid&&state.distance>=c.surface;
  if(submerged&&!state.enteredLiquid)state.enteredLiquid=true;
  const density=submerged?c.liquidDensity:airDensity;
  const buoyancy=submerged?density*c.volume*g:0;
  const oldVelocity=state.velocity,oldDistance=state.distance;
  const freeAcceleration=(c.mass*g-buoyancy)/c.mass;
  const dragRate=.5*density*dragArea(c,submerged)/c.mass;
  const unopposedVelocity=oldVelocity+freeAcceleration*delta;
  const dragStep=dragRate*delta;
  state.velocity=Math.sign(unopposedVelocity)*2*Math.abs(unopposedVelocity)/(1+Math.sqrt(1+4*dragStep*Math.abs(unopposedVelocity)));
  state.acceleration=(state.velocity-oldVelocity)/delta;
  state.distance+=(oldVelocity+state.velocity)*.5*delta;
  if(c.liquid&&oldDistance<c.surface&&state.distance>=c.surface)state.distance=c.surface;
  if(c.liquid&&submerged&&oldDistance>=c.surface&&state.distance<c.surface){
   recordImpact(state.time+delta,state.velocity,true);
   state.distance=c.surface;state.velocity=0;state.acceleration=0;state.landed=true;state.running=false;
  }
  const end=c.liquid?c.surface+c.liquidDepth:c.dropHeight;
  if(state.distance>=end){
   recordImpact(state.time+delta,state.velocity,submerged);
   state.distance=end;state.velocity=0;state.landed=true;state.running=false;
  }
  state.time+=delta;
  if(state.time-lastSample>=sampleInterval){
   samples.push({time:state.time,velocity:state.velocity,liquid:state.enteredLiquid});
   lastSample=state.time;
   if(samples.length>5000)samples.shift();
  }
  if(state.landed){
   $('status').textContent=c.liquid&&state.distance<=c.surface?'Floating at the surface':'At the bottom';
   $('pause').disabled=true;
  }
 }
 function resize(canvas,ctx){
  const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
  const width=Math.max(1,Math.round(rect.width*dpr)),height=Math.max(1,Math.round(rect.height*dpr));
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return {width:rect.width,height:rect.height};
 }
 function drawWorld(){
  const {width:w,height:h}=resize(world,worldCtx),c=config(),ctx=worldCtx;
  ctx.clearRect(0,0,w,h);
  const total=c.liquid?c.surface+c.liquidDepth:c.dropHeight;
  const top=18,bottom=h-21,scale=(bottom-top)/total,surfaceY=top+c.surface*scale;
  ctx.fillStyle='#e7ecdf';ctx.fillRect(0,top,w,bottom-top);
  if(c.liquid){
   ctx.fillStyle=$('liquid-type').value==='water'?'#dcebf0':'#e9e3ce';
   ctx.fillRect(0,surfaceY,w,bottom-surfaceY);
   ctx.strokeStyle=$('liquid-type').value==='water'?'#4785a0':'#b29350';ctx.lineWidth=2;
   ctx.beginPath();ctx.moveTo(0,surfaceY);ctx.lineTo(w,surfaceY);ctx.stroke();
   ctx.fillStyle='#536b70';ctx.font='10px DM Sans, sans-serif';ctx.textAlign='left';ctx.fillText($('liquid-type').value==='water'?'WATER':'OIL',12,surfaceY+17);
  }
  ctx.strokeStyle='#cbd1c4';ctx.lineWidth=1;
  for(let i=0;i<=4;i++){
   const y=top+(bottom-top)*i/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
   ctx.fillStyle='#73786e';ctx.font='9px DM Sans, sans-serif';ctx.textAlign='right';ctx.fillText((total*i/4).toFixed(0)+' m',w-9,y-4);
  }
  const itemY=clamp(top+state.distance*scale,top+14,bottom-12),x=w*.5;
  if(c.parachute){
   const canopyWidth=clamp(24+Math.sqrt(c.canopyArea)*9,38,100),canopyTop=Math.max(2,itemY-38);
   ctx.beginPath();ctx.moveTo(x-canopyWidth/2,canopyTop+15);ctx.quadraticCurveTo(x,canopyTop-12,x+canopyWidth/2,canopyTop+15);ctx.quadraticCurveTo(x,canopyTop+25,x-canopyWidth/2,canopyTop+15);ctx.fillStyle='#c96b48';ctx.fill();
   ctx.strokeStyle='#765241';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-canopyWidth/2,canopyTop+15);ctx.lineTo(x-5,itemY-5);ctx.moveTo(x+canopyWidth/2,canopyTop+15);ctx.lineTo(x+5,itemY-5);ctx.stroke();
  }
  ctx.beginPath();ctx.arc(x,itemY,11,0,Math.PI*2);ctx.fillStyle='#b64223';ctx.fill();
  ctx.beginPath();ctx.arc(x-3,itemY-3,3,0,Math.PI*2);ctx.fillStyle='#f3c4a5';ctx.fill();
 }
 function drawChart(){
  const {width:w,height:h}=resize(chart,chartCtx),ctx=chartCtx;
  ctx.clearRect(0,0,w,h);
  const left=48,right=w-12,top=12,bottom=h-30,plotW=Math.max(1,right-left),plotH=Math.max(1,bottom-top);
  const tMax=Math.max(10,state.time*1.12),c=config();
  let maxV=Math.max(2,terminalSpeed(c,false)*1.12,terminalSpeed(c,true)*1.12);
  samples.forEach(p=>{maxV=Math.max(maxV,Math.abs(p.velocity)*1.12);});
  const minV=c.liquid?Math.min(0,terminalSpeed(c,true)*1.12):0;
  const range=Math.max(1,maxV-minV),x=t=>left+clamp(t/tMax,0,1)*plotW,y=v=>top+(maxV-v)/range*plotH;
  ctx.font='9px DM Sans, sans-serif';ctx.lineWidth=1;
  for(let i=0;i<=4;i++){
   const value=minV+(maxV-minV)*i/4,py=y(value);
   ctx.strokeStyle=Math.abs(value)<.001?'#b4b7a9':'#e3e3d9';ctx.beginPath();ctx.moveTo(left,py);ctx.lineTo(right,py);ctx.stroke();
   ctx.fillStyle='#777b6f';ctx.textAlign='right';ctx.fillText(value.toFixed(1),left-7,py+3);
   const time=tMax*i/4,px=x(time);ctx.strokeStyle='#ecebe2';ctx.beginPath();ctx.moveTo(px,top);ctx.lineTo(px,bottom);ctx.stroke();
   ctx.fillStyle='#777b6f';ctx.textAlign='center';ctx.fillText(time.toFixed(0)+' s',px,h-8);
  }
  ctx.save();ctx.beginPath();ctx.rect(left,top,plotW,plotH);ctx.clip();
  ctx.lineWidth=2;ctx.lineJoin='round';
  for(let i=1;i<samples.length;i++){
   const a=samples[i-1],b=samples[i];ctx.strokeStyle=b.liquid?'#4785a0':'#3c705d';
   ctx.beginPath();ctx.moveTo(x(a.time),y(a.velocity));ctx.lineTo(x(b.time),y(b.velocity));ctx.stroke();
  }
  ctx.restore();
  $('chart').setAttribute('aria-label','Velocity-time graph. Current time '+state.time.toFixed(2)+' seconds, downward velocity '+state.velocity.toFixed(2)+' metres per second.');
 }
 function render(){
  drawWorld();drawChart();
  $('velocity').textContent=state.velocity.toFixed(2)+' m/s';
  $('time').textContent=state.time.toFixed(2)+' s';
  $('distance').textContent=state.distance.toFixed(2)+' m';
  if(state.running&&!state.paused)$('status').textContent=state.velocity<-.05?'Rising through liquid':state.enteredLiquid?'Falling through liquid':'Falling';
  const c=config();
  $('air-terminal').textContent=terminalSpeed(c,false).toFixed(2)+' m/s';
  const liquidTerminal=terminalSpeed(c,true);
  $('liquid-terminal').textContent=c.liquid?(liquidTerminal<0?liquidTerminal.toFixed(2)+' m/s (up)':liquidTerminal.toFixed(2)+' m/s (down)'):'—';
  $('liquid-terminal-wrap').hidden=!c.liquid;
 }
 function updateLabels(){
  $('mass-value').textContent=Number($('mass').value).toFixed(2)+' kg';
  $('area-value').textContent=Number($('area').value).toFixed(3)+' m²';
  $('canopy-value').textContent=Number($('canopy-area').value).toFixed(1)+' m²';
  $('surface-value').textContent=$('surface-depth').value+' m';
  $('depth-value').textContent=$('liquid-depth').value+' m';
  $('drop-height-value').textContent=$('drop-height').value+' m';
 }
 $('preset').addEventListener('change',()=>{
  const p=presets[$('preset').value];
  $('mass').value=p.mass;$('area').value=p.area;$('volume').value=p.volume;
  updateLabels();prepare();
 });
 ['mass','area','volume','canopy-area','surface-depth','liquid-depth','liquid-type','drop-height'].forEach(id=>{
  $(id).addEventListener('input',()=>{updateLabels();prepare();});
  $(id).addEventListener('change',()=>{updateLabels();prepare();});
 });
 $('parachute').addEventListener('change',()=>{$('canopy-field').hidden=!$('parachute').checked;prepare();});
 $('liquid').addEventListener('change',()=>{
  $('liquid-options').hidden=!$('liquid').checked;
  $('drop-height-field').hidden=$('liquid').checked;
  prepare();
 });
 $('drop').addEventListener('click',start);
 $('reset').addEventListener('click',prepare);
 $('pause').addEventListener('click',()=>{
  if(!state.running)return;
  state.paused=!state.paused;$('status').textContent=state.paused?'Paused':(state.enteredLiquid?'Falling through liquid':'Falling');
  $('pause').textContent=state.paused?'Resume':'Pause';lastFrame=0;accumulator=0;
 });
 document.addEventListener('visibilitychange',()=>{lastFrame=0;accumulator=0;});
 window.addEventListener('resize',render);
 function frame(now){
  if(lastFrame&&!state.paused&&!document.hidden&&state.running){
   accumulator+=Math.min((now-lastFrame)/1000,.1);
   while(accumulator>=dt){step(dt);accumulator-=dt;}
  }
  lastFrame=now;render();requestAnimationFrame(frame);
 }
 updateLabels();prepare();requestAnimationFrame(frame);
 window.terminalVelocityLab={state,get samples(){return samples;},step,prepare,start,config,terminalSpeed};
})();
