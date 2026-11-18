// Display FFT is independent of BirdNET's internal mel-spectrogram layer.
export function spectrum(samples,offset=0,size=2048){
  const re=new Float64Array(size),im=new Float64Array(size);
  for(let i=0;i<size;i++)re[i]=(samples[offset+i]||0)*(.5-.5*Math.cos(2*Math.PI*i/size));
  for(let i=1,j=0;i<size;i++){let bit=size>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j)[re[i],re[j]]=[re[j],re[i]];}
  for(let len=2;len<=size;len<<=1){const angle=-2*Math.PI/len;for(let start=0;start<size;start+=len){for(let j=0;j<len/2;j++){const c=Math.cos(angle*j),s=Math.sin(angle*j),a=start+j,b=a+len/2,tr=re[b]*c-im[b]*s,ti=re[b]*s+im[b]*c;re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;}}}
  return Float32Array.from(re.subarray(0,size/2+1),(r,i)=>20*Math.log10(Math.max(1e-9,Math.hypot(r,im[i])*(i===0||i===size/2?2:4)/size)));
}
export function windows(start,end){const positions=[];for(let t=start;t<end;t+=1.5){positions.push(t);if(t+3>=end)break;}return positions;}
export function groupResults(segments,threshold){const groups=new Map();for(const segment of segments)for(const candidate of segment.top){if(candidate.score<threshold)continue;let group=groups.get(candidate.scientific);if(!group){group={...candidate,segments:[]};groups.set(candidate.scientific,group);}group.score=Math.max(group.score,candidate.score);group.segments.push({start:segment.start,end:segment.end,score:candidate.score});}return [...groups.values()].sort((a,b)=>b.score-a.score);}
export function testSound(rate=48000){const samples=new Float32Array(rate*9);for(let i=0;i<samples.length;i++){const t=i/rate,phase=t%1.5,env=Math.sin(Math.PI*Math.min(1,phase/.6))**2;if(phase<.6)samples[i]=.35*env*Math.sin(2*Math.PI*(1800*t+500*t*t+80*Math.sin(t*25)));}return samples;}
export function wav(samples,rate){const bytes=new ArrayBuffer(44+samples.length*2),v=new DataView(bytes);const text=(at,s)=>{for(let i=0;i<s.length;i++)v.setUint8(at+i,s.charCodeAt(i));};text(0,'RIFF');v.setUint32(4,36+samples.length*2,true);text(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,samples.length*2,true);samples.forEach((s,i)=>v.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,s))*32767),true));return bytes;}
