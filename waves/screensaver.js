(()=>{
 'use strict';
 const $=id=>document.getElementById(id),board=document.querySelector('.board'),svg=$('wave'),lab=window.waveLab;
 const stages=[
  {name:'Calm',amplitude:.3,wavelength:6.8,frequency:.18,coverage:0,rain:0,fog:0,code:0},
  {name:'Cloudy',amplitude:.65,wavelength:6,frequency:.28,coverage:65,rain:0,fog:0,code:3},
  {name:'Rain',amplitude:1.1,wavelength:4.8,frequency:.42,coverage:85,rain:.55,fog:0,code:63},
  {name:'Storm',amplitude:1.85,wavelength:3.6,frequency:.65,coverage:100,rain:1,fog:0,code:95},
  {name:'Clearing mist',amplitude:.55,wavelength:6.2,frequency:.24,coverage:35,rain:0,fog:1,code:45}
 ];
 let active=false,saved=null,frameId=0,startTime=0,lastWeather=-Infinity,hiddenAt=null,native=false;
 const overlay=document.createElement('div');overlay.className='screensaver-overlay';overlay.hidden=true;
 const caption=document.createElement('p');caption.id='screensaver-caption';
 const exit=document.createElement('button');exit.type='button';exit.id='exit-screensaver';exit.textContent='Exit screensaver · Esc';overlay.append(caption,exit);board.append(overlay);
 function sample(seconds){const t=((seconds%240)+240)%240,index=Math.floor(t/48),from=stages[index],to=stages[(index+1)%stages.length],u=t%48/48,ease=u*u*(3-2*u),value={name:from.name,next:to.name,code:ease<.5?from.code:to.code};for(const key of ['amplitude','wavelength','frequency','coverage','rain','fog'])value[key]=from[key]+(to[key]-from[key])*ease;return value;}
 function tick(now){if(!active)return;if(!document.hidden){const condition=sample((now-startTime)/1000);for(const key of ['amplitude','wavelength','frequency'])lab.state[key]=condition[key];if(now-lastWeather>=200){window.waveEnvironment.setPreview(condition);caption.textContent='Illustrative weather cycle · '+condition.name+' → '+condition.next;lastWeather=now;}}frameId=requestAnimationFrame(tick);}
 function start(){if(active)return;active=true;native=false;saved={state:{...lab.state},aspect:svg.getAttribute('preserveAspectRatio'),focus:document.activeElement,inert:[...document.querySelectorAll('main > :not(.workspace),.workspace > aside')].map(el=>({el,value:el.inert}))};for(const {el}of saved.inert)el.inert=true;
  document.body.classList.add('screensaver-active');overlay.hidden=false;Object.assign(lab.state,{realLife:true,running:true,speed:1,direction:1,position:6});$('real-life').checked=true;svg.setAttribute('preserveAspectRatio','xMidYMid slice');lab.view();startTime=performance.now();lastWeather=-Infinity;hiddenAt=null;tick(startTime);lab.render();exit.focus({preventScroll:true});
  // Keep the immersive layout when native fullscreen is unavailable (for example, an embedded browser).
  try{const request=board.requestFullscreen?.();request?.then(()=>{if(!active&&document.fullscreenElement===board)document.exitFullscreen?.().catch(()=>{});}).catch(()=>{});}catch{}
 }
 function stop(){if(!active)return;active=false;cancelAnimationFrame(frameId);const restore=saved;saved=null;document.body.classList.remove('screensaver-active');overlay.hidden=true;Object.assign(lab.state,restore.state);$('real-life').checked=lab.state.realLife;for(const key of ['amplitude','wavelength','frequency','position','speed'])$(key).value=lab.state[key];if(restore.aspect===null)svg.removeAttribute('preserveAspectRatio');else svg.setAttribute('preserveAspectRatio',restore.aspect);lab.view();lab.render();window.waveEnvironment.setPreview(null);for(const {el,value}of restore.inert)el.inert=value;restore.focus?.focus({preventScroll:true});if(document.fullscreenElement===board)document.exitFullscreen?.().catch(()=>{});native=false;}
 $('screensaver').addEventListener('click',start);exit.addEventListener('click',stop);document.addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape'){e.preventDefault();stop();}else if(e.key==='Tab'){e.preventDefault();exit.focus();}});
 document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement===board)native=true;else if(active&&native)stop();});document.addEventListener('visibilitychange',()=>{if(!active)return;if(document.hidden)hiddenAt=performance.now();else if(hiddenAt!==null){startTime+=performance.now()-hiddenAt;hiddenAt=null;}});
 window.waveScreensaver={start,stop,sample,get active(){return active;}};
})();
