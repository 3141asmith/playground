(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AudioModels=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const pcmBitrate=(rate,bits,channels)=>rate*bits*channels;
 const fileKbps=(bytes,seconds)=>bytes*8/seconds/1000;
 function classification(v){if(v.identicalToSource)return{title:'The decoded samples are identical.',copy:v.codec==='flac'?'FLAC reconstructs every source PCM sample exactly. Its compression effort changes storage, not the decoded sound.':'This is the original uncompressed PCM recording. It is the reference for the comparisons.'};if(v.sampleRate<44100&&(v.codec==='wav'||v.codec==='flac'))return{title:'The codec keeps what resampling leaves.',copy:'Reducing sample rate discarded information first. '+(v.codec==='flac'?'FLAC preserves the reduced-rate PCM exactly; it does not restore the original.':'This WAV stores the reduced-rate PCM without compression; uncompressed does not mean unchanged from the source.')};return{title:'Some information is removed.',copy:(v.codec==='mp3'?'MP3':'AAC')+' uses lossy encoding. Its decoded samples differ from the input even when the change is hard to hear.'+(v.sampleRate<44100?' Reducing sample rate also removed information before encoding.':'')};}
 function nearest(variants,codec,rate,quality){const entries=variants.filter(v=>v.codec===codec&&v.sampleRate===rate);if(!entries.length)throw Error('Unsupported encoding');const key=codec==='flac'?'level':'targetKbps';return entries.find(v=>v[key]===quality)||entries.reduce((a,b)=>Math.abs((b[key]||0)-quality)<Math.abs((a[key]||0)-quality)?b:a);}
 // Hann-windowed radix-2 FFT: linear-frequency bins, amplitudes in dBFS.
 function spectrum(samples,rate,time){let n=1;while(n<rate*.075)n*=2;const re=new Float64Array(n),im=new Float64Array(n);let sum=0;const start=Math.floor(time*rate)-n/2;for(let i=0;i<n;i++){const w=.5-.5*Math.cos(2*Math.PI*i/(n-1));re[i]=(samples[start+i]||0)*w;sum+=w;}
  for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j)[re[i],re[j]]=[re[j],re[i]];}
  for(let len=2;len<=n;len*=2){const step=-2*Math.PI/len;for(let i=0;i<n;i+=len)for(let j=0;j<len/2;j++){const c=Math.cos(step*j),s=Math.sin(step*j),a=i+j,b=a+len/2,tr=re[b]*c-im[b]*s,ti=re[b]*s+im[b]*c;re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;}}
  return Array.from({length:n/2+1},(_,i)=>({frequency:i*rate/n,db:Math.max(-100,20*Math.log10(Math.max(1e-8,Math.hypot(re[i],im[i])*(i===0?1:2)/sum)))}));
 }
 return{pcmBitrate,fileKbps,classification,nearest,spectrum};
});
