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
 function percentile(sorted,p){if(!sorted.length)return null;const index=(sorted.length-1)*p,lo=Math.floor(index),hi=Math.ceil(index);return sorted[lo]+(sorted[hi]-sorted[lo])*(index-lo);}
 function dailySummary(rows){
  const buckets=new Map();for(const r of rows){const t=Math.floor(r.t/DAY)*DAY;let b=buckets.get(t);if(!b){b={t,n:0,sum:0,min:r.value,max:r.value,minAt:r.t,maxAt:r.t};buckets.set(t,b);}b.n++;b.sum+=r.value;if(r.value<b.min){b.min=r.value;b.minAt=r.t;}if(r.value>b.max){b.max=r.value;b.maxAt=r.t;}}
  return [...buckets.values()].map(b=>({...b,value:b.sum/b.n,range:b.max-b.min}));
 }
 function regression(points){
  if(points.length<2)return null;const origin=points[0].t,meanX=points.reduce((s,p)=>s+(p.t-origin)/DAY,0)/points.length,meanY=points.reduce((s,p)=>s+p.value,0)/points.length;let xx=0,xy=0,yy=0;
  for(const p of points){const x=(p.t-origin)/DAY-meanX,y=p.value-meanY;xx+=x*x;xy+=x*y;yy+=y*y;}if(!xx)return null;
  const slope=xy/xx;return {slope,origin,intercept:meanY-slope*meanX,r2:yy?Math.max(0,Math.min(1,xy*xy/(xx*yy))):null,n:points.length};
 }
 function circularTime(times){if(!times.length)return null;let x=0,y=0;for(const t of times){const angle=((t%DAY)+DAY)%DAY/DAY*2*Math.PI;x+=Math.cos(angle);y+=Math.sin(angle);}if(Math.hypot(x,y)/times.length<1e-8)return null;return ((Math.atan2(y,x)/(2*Math.PI)+1)%1)*DAY;}
 function analysis(rows,{from=rows[0]?.t,to=rows.at(-1)?.t,cadence=null,lower=10,upper=25,windowMinutes=30}={}){
  if(!rows.length)return null;
  cadence=cadence||median(rows.slice(1).map((r,i)=>r.t-rows[i].t));const gapLimit=cadence?cadence*3:0,span=Math.max(0,to-from),sorted=rows.map(r=>r.value).sort((a,b)=>a-b),daily=dailySummary(rows);
  let covered=0,integral=0,above=0,below=0,gaps=0,excluded=0;const largestGaps=[];
  const thresholdsValid=Number.isFinite(lower)&&Number.isFinite(upper)&&lower<=upper;
  // Linear interpolation is used only between nearby observations. Nothing is
  // inferred before the first reading, after the last, or across a long gap.
  function fractionAbove(a,b,level){if(a===b)return a>level?1:0;const low=Math.min(a,b),high=Math.max(a,b);return level<=low?1:level>=high?0:(high-level)/(high-low);}
  for(let i=1;i<rows.length;i++){
   const a=rows[i-1],b=rows[i],dt=b.t-a.t;if(dt<=0)continue;if(!gapLimit||dt>gapLimit){gaps++;excluded+=dt;largestGaps.push({from:a.t,to:b.t,duration:dt});largestGaps.sort((a,b)=>b.duration-a.duration);if(largestGaps.length>5)largestGaps.pop();continue;}
   const start=Math.max(from,a.t),end=Math.min(to,b.t);if(end<=start)continue;
   const av=a.value+(b.value-a.value)*(start-a.t)/dt,bv=a.value+(b.value-a.value)*(end-a.t)/dt,length=end-start;
   covered+=length;integral+=(av+bv)/2*length;
   if(thresholdsValid){above+=length*fractionAbove(av,bv,upper);below+=length*fractionAbove(-av,-bv,-lower);}
  }
  const windowMs=windowMinutes*60000;let warming=null,cooling=null,left=0,segmentStart=0,rateWindows=0;
  if(Number.isFinite(windowMs)&&windowMs>0)for(let i=1;i<rows.length;i++){
   if(rows[i].t-rows[i-1].t>gapLimit){segmentStart=i;left=i;}
   const target=rows[i].t-windowMs;if(target<rows[segmentStart].t)continue;
   while(left+1<i&&rows[left+1].t<=target)left++;
   const a=rows[left],b=rows[left+1];if(!b||b.t<=a.t)continue;
   const initial=a.value+(b.value-a.value)*(target-a.t)/(b.t-a.t),rate=(rows[i].value-initial)/(windowMs/3600000),r={rate,from:target,to:rows[i].t};
   rateWindows++;if(rate>0&&(!warming||rate>warming.rate))warming=r;if(rate<0&&(!cooling||rate<cooling.rate))cooling=r;
  }
  // Each observed day has equal weight in weekly means and trend fits.
  const weeks=new Map();for(const d of daily){const weekday=new Date(d.t).getUTCDay(),t=d.t-((weekday+6)%7)*DAY;let w=weeks.get(t);if(!w){w={t,sum:0,n:0};weeks.set(t,w);}w.sum+=d.value;w.n++;}
  const weekly=[...weeks.values()].map(w=>({...w,value:w.sum/w.n})),rangeDays=daily.filter(d=>d.n>1),variableDays=daily.filter(d=>d.min<d.max);let largestDailyRange=null;
  for(const d of rangeDays)if(!largestDailyRange||d.range>largestDailyRange.range)largestDailyRange=d;
  return {p5:percentile(sorted,.05),p95:percentile(sorted,.95),weightedMean:covered?integral/covered:null,covered,unknown:Math.max(0,span-covered),span,coverage:span?covered/span:null,cadence,gapLimit,gaps,largestGaps,excluded,expected:cadence?Math.floor(span/cadence)+(rows.at(-1).t===to?1:0):null,above:thresholdsValid&&covered?above:null,below:thresholdsValid&&covered?below:null,between:thresholdsValid&&covered?Math.max(0,covered-above-below):null,thresholdsValid,lower,upper,windowMinutes,rateWindows,warming,cooling,daily,weekly,dailyTrend:regression(daily),weeklyTrend:regression(weekly),meanDailyRange:rangeDays.length?rangeDays.reduce((s,d)=>s+d.range,0)/rangeDays.length:null,largestDailyRange,rangeDayCount:rangeDays.length,highTime:circularTime(variableDays.map(d=>d.maxAt)),lowTime:circularTime(variableDays.map(d=>d.minAt)),timingDayCount:variableDays.length};
 }
 const api={DAY,dateKey,timestamp,parse,merge,median,stats,range,aggregate,thin,percentile,dailySummary,regression,circularTime,analysis};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TemperatureData=api;
})(typeof window==='undefined'?globalThis:window);
