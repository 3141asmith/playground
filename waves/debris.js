(()=>{
 'use strict';
 const svg=document.getElementById('wave'),lab=window.waveLab,NS='http://www.w3.org/2000/svg';
 const group=document.createElementNS(NS,'g');group.id='sea-debris';group.classList.add('real-life-scene');group.setAttribute('aria-hidden','true');group.style.pointerEvents='none';svg.insertBefore(group,document.getElementById('boat'));
 const drawings={
  seaweed:'<path d="M-15 8Q-5 3 5 7T24 5M-5 6Q-18-7-11-16Q-6-10-5 6M3 6Q-2 21 7 25Q12 16 3 6M12 7Q8-5 17-12Q20-2 12 7" fill="none" stroke="#466d44" stroke-width="4" stroke-linecap="round"/><path d="M-15 9Q-1 1 24 6" fill="none" stroke="#92a66b" stroke-width="1.5"/>',
  boot:'<path d="M-12-20H1L2-7Q6-4 14-4Q22-4 22 4L-12 5Q-16 2-13-5Z" fill="#635541" stroke="#3c4035" stroke-width="1.5"/><path d="M-13 5H22M-12-18H0" fill="none" stroke="#ab9773" stroke-width="3"/><path d="M-1-14H-6M0-10H-5" stroke="#c5b38f" stroke-width="1.5"/>',
  driftwood:'<path d="M-26 0L-21-6L22-4L27 1L21 6L-22 5Z" fill="#9a7951" stroke="#65563d" stroke-width="1.5"/><path d="M-19-1L17 1M-13 3L7 3M14-4L17-10L21-10L20-3" fill="none" stroke="#c2a274" stroke-width="2"/>'
 };
 const random=(min,max)=>min+Math.random()*(max-min);
 let waiting=random(35,70),item=null,lastType=null;
 function advance(seconds){
  if(!lab.state.realLife)return;
  if(item){item.age+=seconds;if(item.age>=item.duration){item=null;group.replaceChildren();waiting=random(65,130);}}
  else{waiting-=seconds;if(waiting<=0){const types=Object.keys(drawings).filter(type=>type!==lastType),type=types[Math.floor(Math.random()*types.length)];lastType=type;item={age:0,duration:random(26,38),direction:lab.state.direction,type};group.innerHTML=drawings[type];group.dataset.kind=type;}}
 }
 function render(){
  group.style.display=lab.state.realLife&&item?'':'none';if(!item)return;
  const width=svg.viewBox.baseVal.width,progress=item.age/item.duration,pixel=item.direction===1?-45+(width+90)*progress:width+45-(width+90)*progress;
  const left=lab.screenX(0),span=lab.screenX(12)-left,x=12*(pixel-left)/span,y=lab.screenY(lab.displacement(x))+4;
  const slope=-70*lab.state.amplitude*(2*Math.PI/lab.state.wavelength)*Math.cos(2*Math.PI*x/lab.state.wavelength-lab.state.phase)*12/span;
  const tilt=Math.max(-14,Math.min(14,Math.atan(slope)*180/Math.PI*.3));
  group.setAttribute('transform',`translate(${pixel} ${y}) rotate(${tilt})`);group.style.opacity=Math.min(1,progress*12,(1-progress)*12)*.9;
 }
 function reset(){item=null;waiting=random(35,70);group.replaceChildren();render();}
 window.waveDebris={advance,render,reset};render();
})();
