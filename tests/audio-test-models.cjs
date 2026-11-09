const assert=require('node:assert/strict'),T=require('../audio/test-signal'),M=require('../audio/models');
const tone=(hz,rate=44100,seconds=1)=>Float32Array.from({length:rate*seconds},(_,i)=>.4*Math.sin(2*Math.PI*hz*i/rate));
const rms=a=>Math.sqrt(a.reduce((sum,v)=>sum+v*v,0)/a.length);
for(const bits of [1,2,4,8,16,24]){
 const input=Float32Array.from({length:10001},(_,i)=>i/5000-1),q=T.quantise(input,bits),levels=2**bits;
 assert(new Set(q).size<=levels);assert(q.every((x,i)=>Math.abs(x-input[i])<=1/levels+1e-7&&x>=-1&&x<=1));
 if(bits===1)assert.deepEqual([...new Set(q)],[-.5,.5]);
}
assert.deepEqual(T.settings(-50,100),{rate:100,bits:24});assert.deepEqual(T.settings(Infinity,0),{rate:192000,bits:8});
const low=T.resample(tone(200),44100,4000),high=T.resample(tone(5000),44100,4000);
assert(Math.abs(rms(low.slice(100,-100))-.4/Math.SQRT2)<.001);assert(rms(high.slice(100,-100))<.0001,'Suppress frequencies above the new Nyquist limit rather than aliasing');
const reconstructed=T.resample(low,4000,44100);let error=0;const original=tone(200);for(let i=2000;i<42000;i++)error+=(original[i]-reconstructed[i])**2;assert(Math.sqrt(error/40000)<.001,'Keep original pitch, timing and level');
for(const rate of [100,7777,44100,192000]){
 const result=T.create([tone(20),new Float32Array(44100)],44100,rate,24);
 assert.equal(result.samples[0].length,rate);assert.equal(result.playback[0].length,44100);assert.equal(result.samples[1].length,rate);
 assert(result.playback.every(channel=>channel.every(Number.isFinite)));assert(rms(result.playback[1])<1e-6,'Do not mix channels');
}
assert.equal(M.pcmBitrate(100,1,2),200);assert.equal(M.pcmBitrate(192000,24,2),9216000);assert.match(M.classification({codec:'test'}).copy,/experimental PCM/);
console.log('PASS extreme-rate resampling, Nyquist filtering, pitch/timing/level preservation, stereo independence, quantisation levels/errors and PCM bitrate bounds');
