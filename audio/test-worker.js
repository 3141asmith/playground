importScripts('test-signal.js?v=2');
self.onmessage=({data})=>{
 try{const result=AudioTest.create(data.channels,data.sourceRate,data.rate,data.bits);self.postMessage(result,[...result.samples,...result.playback].map(a=>a.buffer));}
 catch(error){self.postMessage({error:error.message});}
};
