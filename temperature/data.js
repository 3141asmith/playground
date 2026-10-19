(function(root){
 'use strict';
 const DAY=86400000;
 const dateKey=t=>new Date(t).toISOString().slice(0,10);
 // UTC is a neutral coordinate for the wall-clock timestamps in these logs.
 // Never convert an unzoned logger timestamp through the viewer's timezone.
 function timestamp(text){
  const m=text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);if(!m)return NaN;
  const [,y,mo,d,h,mi,se='0']=m,values=[y,mo,d,h,mi,se].map(Number),t=Date.UTC(values[0],values[1]-1,...values.slice(2)),dt=new Date(t);
  return dt.getUTCFullYear()===values[0]&&dt.getUTCMonth()===values[1]-1&&dt.getUTCDate()===values[2]&&dt.getUTCHours()===values[3]&&dt.getUTCMinutes()===values[4]&&dt.getUTCSeconds()===values[5]?t:NaN;
 }
 function parse(text){
  const rows=[],invalid=[],lines=text.replace(/^\uFEFF/,'').split(/\r?\n/);let skipped=0,header=0;
  for(let i=0;i<lines.length;i++){
   const line=lines[i].trim();if(!line)continue;
   if(/^(?:timestamp|date[ _]?time)\s*[,;\t]\s*temperature(?:_c)?$/i.test(line)){header++;continue;}
   const m=line.match(/^"?(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?)"?\s*[,;\t]\s*"?([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:°?\s*([CF]))?"?$/i);
   let t=m?timestamp(m[1]):NaN,value=m?Number(m[2]):NaN;if(m&&m[3]?.toUpperCase()==='F')value=(value-32)*5/9;
   if(!Number.isFinite(t)||!Number.isFinite(value)||value< -273.15){skipped++;if(invalid.length<5)invalid.push(i+1);continue;}
   rows.push({t,value});
  }
  return {rows,skipped,invalid,header};
 }
 function merge(rows){const map=new Map();let duplicates=0,conflicts=0;for(const row of rows){if(map.has(row.t)){duplicates++;if(map.get(row.t).value!==row.value)conflicts++;}map.set(row.t,row);}return {rows:[...map.values()].sort((a,b)=>a.t-b.t),duplicates,conflicts};}
 function median(values){if(!values.length)return null;const sorted=[...values].sort((a,b)=>a-b),i=Math.floor(sorted.length/2);return sorted.length%2?sorted[i]:(sorted[i-1]+sorted[i])/2;}
 function stats(rows){
  if(!rows.length)return null;let sum=0,min=rows[0],max=rows[0];for(const row of rows){sum+=row.value;if(row.value<min.value)min=row;if(row.value>max.value)max=row;}
  const mean=sum/rows.length,intervals=rows.slice(1).map((r,i)=>r.t-rows[i].t),cadence=median(intervals);let variance=0,gaps=0,largestGap=0;
  for(const row of rows)variance+=(row.value-mean)**2;for(const interval of intervals){if(cadence&&interval>3*cadence)gaps++;largestGap=Math.max(largestGap,interval);}
  return {count:rows.length,mean,min,max,median:median(rows.map(r=>r.value)),sd:Math.sqrt(variance/rows.length),cadence,gaps,largestGap,days:new Set(rows.map(r=>dateKey(r.t))).size};
 }
 function range(mode,anchor,start,end){
  let from=Date.parse(anchor+'T00:00:00Z'),to;const d=new Date(from);
  if(mode==='all')return [-Infinity,Infinity];
  if(mode==='custom')return [Date.parse(start+'T00:00:00Z'),Date.parse(end+'T00:00:00Z')+DAY];
  if(mode==='week'){from-=((d.getUTCDay()+6)%7)*DAY;to=from+7*DAY;}
  else if(mode==='month'){from=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1);to=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1);}
  else if(mode==='year'){from=Date.UTC(d.getUTCFullYear(),0,1);to=Date.UTC(d.getUTCFullYear()+1,0,1);}
  else to=from+DAY;
  return [from,to];
 }
 function aggregate(rows,unit){
  if(unit==='raw')return rows.map(r=>({...r,min:r.value,max:r.value,n:1}));const buckets=new Map();
  for(const row of rows){const d=new Date(row.t),t=unit==='month'?Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1):Math.floor(row.t/(unit==='hour'?3600000:DAY))*(unit==='hour'?3600000:DAY);let b=buckets.get(t);if(!b){b={t,sum:0,min:row.value,max:row.value,n:0};buckets.set(t,b);}b.sum+=row.value;b.n++;b.min=Math.min(b.min,row.value);b.max=Math.max(b.max,row.value);}
  return [...buckets.values()].map(b=>({...b,value:b.sum/b.n}));
 }
 // A bounded chart preserves both extrema in every time bucket.
 function thin(points,limit=1600){if(points.length<=limit)return points;const first=points[0].t,span=points.at(-1).t-first+1,buckets=new Map();for(const p of points){const k=Math.floor((p.t-first)/span*(limit/2));let b=buckets.get(k);if(!b){b={...p,sum:0,n:0};buckets.set(k,b);}b.sum+=p.value*p.n;b.n+=p.n;b.breakBefore ||= p.breakBefore;b.min=Math.min(b.min,p.min);b.max=Math.max(b.max,p.max);}return [...buckets.values()].map(b=>({...b,value:b.sum/b.n}));}
 const api={DAY,dateKey,timestamp,parse,merge,median,stats,range,aggregate,thin};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TemperatureData=api;
})(typeof window==='undefined'?globalThis:window);
