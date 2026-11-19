import {textRows} from './detect.js?v=3';

export async function estimateMarks(parts){
  const seen=new Set(),totals=[],awards=[];
  for(const part of parts){const page=await part.paper.pdf.getPage(part.page),rows=textRows(await page.getTextContent(),page.getViewport({scale:1}));for(const row of rows){if(row.y<part.crop.y||row.y>=part.crop.y+part.crop.h||row.x+0.01<part.crop.x||row.x>=part.crop.x+part.crop.w)continue;const key=part.paper.id+':'+part.page+':'+row.y.toFixed(4)+':'+row.text;if(seen.has(key))continue;seen.add(key);
      const total=row.text.match(/(?:total\s+(?:for\s+)?(?:this\s+)?question\s*\d*\s*(?:is|:|=)?\s*|[\[(]\s*total\s*:?\s*)(\d+(?:\.\d+)?)\s*(?:marks?|[\])])/i);
      if(total){totals.push(Number(total[1]));continue;}
      for(const m of row.text.matchAll(/\[\s*(\d{1,3}(?:\.\d+)?)\s*(marks?)?\s*\]|\(\s*(\d{1,3}(?:\.\d+)?)\s+marks?\s*\)/gi)){if(!m[2]&&!m[3]&&(m.index>0&&!/\s/.test(row.text[m.index-1])||row.text.slice(m.index+m[0].length).trim()))continue;awards.push(Number(m[1]??m[3]));}
    }}
  // A repeated explicit question-total line is not a second allocation.
  if(totals.length&&new Set(totals).size===1)return {value:totals[0],method:'Printed question total'};
  return {value:awards.length?awards.reduce((a,b)=>a+b,0):null,method:awards.length?'Sum of printed mark allocations':'No mark allocation found'};
}

export function marksSummary(questions){const unknown=questions.filter(q=>!Number.isFinite(q.marks)||q.marks<0||q.marksPending).length;return {total:questions.reduce((n,q)=>n+(Number.isFinite(q.marks)&&q.marks>=0?q.marks:0),0),unknown};}
