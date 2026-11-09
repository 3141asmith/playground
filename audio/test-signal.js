(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AudioTest=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const MIN_RATE=100,MAX_RATE=192000;
 function settings(rate,bits){return{rate:Math.round(Math.max(MIN_RATE,Math.min(MAX_RATE,Number(rate)||8000))),bits:Math.round(Math.max(1,Math.min(24,Number(bits)||8)))}};
 // Windowed-sinc resampling. The low-pass cutoff follows the lower Nyquist limit.
 // A polyphase table avoids evaluating trigonometry for every audio sample.
 function resample(input,from,to){
  if(from===to)return input.slice();
  const length=Math.round(input.length*to/from),output=new Float32Array(length),cutoff=.94*Math.min(1,to/from),radius=Math.ceil(16/cutoff),width=radius*2+1,phases=256,table=new Float32Array((phases+1)*width);
  for(let p=0;p<=phases;p++)for(let k=-radius;k<=radius;k++){
   const d=k-p/phases,x=d*cutoff,u=d/radius;
   table[p*width+k+radius]=Math.abs(u)>1?0:(Math.abs(x)<1e-10?cutoff:Math.sin(Math.PI*x)/(Math.PI*d))*(.42+.5*Math.cos(Math.PI*u)+.08*Math.cos(2*Math.PI*u));
  }
  for(let i=0;i<length;i++){
   const at=i*from/to,base=Math.floor(at),offset=Math.round((at-base)*phases)*width;
   let value=0,weight=0;
   for(let k=Math.max(-radius,-base);k<=Math.min(radius,input.length-1-base);k++){const w=table[offset+k+radius];value+=input[base+k]*w;weight+=w;}
   output[i]=Math.abs(weight)>1e-9?value/weight:0;
  }
  return output;
 }
 function quantise(input,bits){const output=new Float32Array(input.length),scale=2**(bits-1);for(let i=0;i<input.length;i++)output[i]=(Math.max(-scale,Math.min(scale-1,Math.floor(input[i]*scale)))+.5)/scale;return output;}
 function create(channels,sourceRate,rate,bits){
  ({rate,bits}=settings(rate,bits));
  const samples=channels.map(data=>quantise(resample(data,sourceRate,rate),bits));
  // Browsers cannot play a 100 Hz AudioBuffer. Reconstruct at the source rate;
  // retain the actual experimental samples separately for honest plots.
  const playback=samples.map(data=>resample(data,rate,sourceRate));
  return{rate,bits,samples,playback};
 }
 return{MIN_RATE,MAX_RATE,settings,resample,quantise,create};
});
