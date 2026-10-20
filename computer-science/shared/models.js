(function(root){
 'use strict';
 function processor(type,latency=2){const operations=type==='risc'?[['LOAD R1, [X]',1+latency,{r1:5}],['LOAD R2, [Y]',1+latency,{r2:7}],['ADD R3, R1, R2',1,{r3:12}],['STORE [Z], R3',1+latency,{z:12}]]:[['ADD [Z], [X], [Y]',2+3*latency,{z:12}]],states=[{r1:null,r2:null,r3:null,z:null,cycle:0,instruction:0}];for(let i=0;i<operations.length;i++){const [instruction,cycles,changes]=operations[i];for(let tick=1;tick<=cycles;tick++)states.push({...states.at(-1),...(tick===cycles?changes:{}),cycle:states.length,instruction:i,label:instruction,completed:tick===cycles});}return {operations,states};}
 function parallel(serial,cores){const time=100*serial+100*(1-serial)/cores;return {time,speedup:100/time,serialTime:100*serial,parallelTime:100*(1-serial)/cores};}
 function gpu(lanes,dependent){const batches=[];let previous=0;for(let i=0;i<64;i+=dependent?1:lanes){const work=[];for(let j=i;j<Math.min(64,i+(dependent?1:lanes));j++){const input=j*17%256,value=dependent?(previous+input)%256:Math.min(255,input+40);work.push({index:j,input,value});previous=value;}batches.push(work);}return batches;}
 function paging(references,frameCount=3){const frames=Array(frameCount).fill(null),queue=[],states=[{frames:[...frames],page:null,fault:false,faults:0,evicted:null}];let faults=0;for(const page of references){let frame=frames.indexOf(page),evicted=null;const fault=frame===-1;if(fault){faults++;frame=frames.indexOf(null);if(frame===-1){frame=queue.shift();evicted=frames[frame];}frames[frame]=page;queue.push(frame);}states.push({page,frame,fault,faults,evicted,frames:[...frames]});}return states;}
 function schedule(input,policy='fcfs',quantum=2){
  if(!['fcfs','sjf','srtf','rr','mlfq'].includes(policy))throw Error('Unknown scheduling policy.');
  if(!Number.isInteger(quantum)||quantum<1||quantum>10)throw Error('Quantum must be an integer from 1 to 10.');
  if(!input.length||input.length>8||input.some(j=>!Number.isInteger(j.arrival)||j.arrival<0||j.arrival>30||!Number.isInteger(j.burst)||j.burst<1||j.burst>30))throw Error('Use 1–8 jobs, arrivals 0–30 and CPU bursts 1–30, all whole numbers.');
  const jobs=input.map((j,i)=>({...j,id:j.id||String.fromCharCode(65+i),order:i,remaining:j.burst,first:null,finish:null,level:0,used:0})),ready=[],queues=[[],[],[]],trace=[];let current=null,pending=null,finished=0,t=0;
  while(finished<jobs.length&&t<1000){
   for(const job of jobs.filter(j=>j.arrival===t)){if(policy==='mlfq')queues[0].push(job);else ready.push(job);}
   if(pending){if(policy==='mlfq')queues[pending.level].push(pending);else ready.push(pending);pending=null;}
   if(policy==='srtf'){if(current){ready.push(current);current=null;}ready.sort((a,b)=>a.remaining-b.remaining||a.arrival-b.arrival||a.order-b.order);}
   if(policy==='mlfq'){
    const top=queues.findIndex(q=>q.length);if(current&&top!==-1&&top<current.level){queues[current.level].unshift(current);current=null;}
    if(!current){const level=queues.findIndex(q=>q.length);if(level!==-1)current=queues[level].shift();}
   }else if(!current){if(policy==='sjf')ready.sort((a,b)=>a.burst-b.burst||a.arrival-b.arrival||a.order-b.order);current=ready.shift()||null;}
   if(current){if(current.first===null)current.first=t;current.remaining--;current.used++;}
   const running=current,runningLevel=current?.level??null;const waiting=policy==='mlfq'?queues.flat().map(j=>j.id):ready.map(j=>j.id);
   if(current?.remaining===0){current.finish=t+1;finished++;current=null;}
   else if(current&&(policy==='rr'||policy==='mlfq')&&current.used>=(policy==='rr'?quantum:[1,2,4][current.level])){if(policy==='mlfq')current.level=Math.min(2,current.level+1);current.used=0;pending=current;current=null;}
   trace.push({t,id:running?.id??null,queue:waiting,level:runningLevel,remaining:jobs.map(j=>j.remaining)});t++;
  }
  return {trace,jobs:jobs.map(j=>({id:j.id,arrival:j.arrival,burst:j.burst,finish:j.finish,waiting:j.finish-j.arrival-j.burst,turnaround:j.finish-j.arrival,response:j.first-j.arrival})),time:t};
 }
 const api={processor,parallel,gpu,paging,schedule};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CSModels=api;
})(typeof window==='undefined'?globalThis:window);
