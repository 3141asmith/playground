// Heuristic question indexing from PDF text positions, not OCR or semantic AI.
// Coordinates are normalised to the displayed PDF page used by the crop viewer.
export function textRows(content,viewport){
  const rows=[];
  for(const item of content.items){if(!item.str?.trim()||!item.transform)continue;const point=viewport.convertToViewportPoint(item.transform[4],item.transform[5]),height=Math.max(5,Math.hypot(item.transform[2],item.transform[3])*viewport.scale),piece={text:item.str,x:point[0],y:point[1],height,width:item.width*viewport.scale};let row=rows.find(r=>Math.abs(r.baseline-piece.y)<Math.max(2,Math.min(r.height,height)*.35));if(!row){row={baseline:piece.y,height,items:[]};rows.push(row);}row.items.push(piece);row.height=Math.max(row.height,height);}
  return rows.sort((a,b)=>a.baseline-b.baseline).map(row=>{const pieces=row.items.sort((a,b)=>a.x-b.x);let text='',end=-Infinity;for(const p of pieces){text+=(text&&p.x-end>1?' ':'')+p.text;end=p.x+p.width;}return {text:text.replace(/\s+/g,' ').trim(),x:pieces[0].x/viewport.width,y:Math.max(0,(row.baseline-row.height*.95)/viewport.height),height:row.height/viewport.height};});
}

export function questionMarker(row,rows,index){
  if(/^Question\s+\d+(?:\.\d+)?\s+(?:is\s+)?(?:continues?\b|continued\b)/i.test(row.text))return null;
  const text=row.text.trim().replace(/^(\d{1,2})\*/, '$1 ');if(row.y<.065||row.y>.93||row.x>.30)return null;
  // Explicit headings, standard 1 / 1(a) / 1. labels, and AQA's 01 / 01.1
  // labels (including labels extracted as separate boxed digits: 0 1 . 1).
  let match=text.match(/^Question\s+(\d{1,3})(?:\s*[:.)-])?\s*(.*)$/i),number,tail,explicit=false,sub=false;
  if(match){number=Number(match[1]);tail=match[2];explicit=true;}
  else{
    match=text.match(/^(0\s*\d|[1-9]\s+\d)\s*(?:\.\s*(\d{1,2}))?(?=\s|[():.)-]|$)\s*[):.-]?\s*(.*)$/);
    if(match){number=Number(match[1].replace(/\s/g,''));sub=!!match[2];tail=match[3];}
    else{match=text.match(/^(\d{1,2})(?:\.(\d{1,2})(?=\s|\(|$))?(?=\s|[():.)-]|$)\s*[):.-]?\s*(.*)$/);if(!match)return null;number=Number(match[1]);sub=!!match[2];tail=match[3];}
  }
  if(number<1||number>100)return null;
  if(/^(?:of\s+\d|marks?\b|minutes?\b|hours?\b|cm\b|mm\b|kg\b|seconds?\b|N\s|[+−=])/i.test(tail))return null;
  // A number alone may be in a question-number gutter. Require nearby prose
  // rather than treating graph ticks, list values or page numbers as questions.
  if((tail.match(/[A-Za-z]/g)||[]).length<3){const next=rows.slice(index+1,index+4).find(r=>r.y-row.y<.055&&r.x>=row.x-.01&&r.x<.65&&(r.text.match(/[A-Za-z]/g)||[]).length>=6);if(!next&&!explicit)return null;tail=next?.text||tail;}
  return {number,summary:tail.replace(/^\([a-zivx]+\)\s*/i,'').slice(0,130),x:row.x,y:row.y,explicit,sub};
}

export function indexQuestions(pages){
  const runningHeads=new Map();for(const page of pages)for(const row of page.rows)if(row.y<.16||row.y>.88){const key=row.text.replace(/\d+/g,'#');if(!runningHeads.has(key))runningHeads.set(key,new Set());runningHeads.get(key).add(page.number);}
  const candidates=[];for(const page of pages)page.rows.forEach((row,i)=>{const marker=questionMarker(row,page.rows,i);if(marker)candidates.push({...marker,page:page.number});});
  if(!candidates.length)return [];
  // Top-level question numbers normally share a left gutter. Cluster by that
  // gutter to exclude indented numbered lists and numbers within diagrams.
  const clusters=[];for(const c of candidates){let cluster=clusters.find(g=>Math.abs(g.x-c.x)<.026);if(!cluster){cluster={x:c.x,items:[]};clusters.push(cluster);}cluster.items.push(c);}
  function score(group){const items=group.items;let transitions=0;for(let i=1;i<items.length;i++)if(items[i].number===items[i-1].number+1)transitions++;return new Set(items.map(c=>c.number)).size*3+transitions*4+items.filter(c=>c.explicit||c.sub).length*2+(items.some(c=>c.number===1)?4:0)-group.x*4;}
  clusters.sort((a,b)=>score(b)-score(a));const best=clusters[0];
  const anchors=best.items.filter(c=>c.explicit||c.sub||c.x<=best.x+.026).sort((a,b)=>a.page-b.page||a.y-b.y);
  const starts=[];
  for(const anchor of anchors){const last=starts.at(-1);if(!last){starts.push(anchor);continue;}if(anchor.number===last.number)continue; // subparts and repeated continuation headings
    if(anchor.number===last.number+1||anchor.explicit||(anchor.number>last.number&&anchor.number<=last.number+3)){starts.push(anchor);continue;}
    // A clearly restarted numbered section is retained with a distinct label.
    if(anchor.number===1&&last.number>=3&&anchor.page>last.page)starts.push({...anchor,restarted:true});
  }
  const questions=[];for(let i=0;i<starts.length;i++){const start=starts[i],next=starts[i+1],parts=[];for(let n=start.page;n<=(next?.page||pages.length);n++){const page=pages[n-1];if(!page)continue;const endMarker=page.rows.find(r=>/^END OF (?:QUESTIONS?(?: PAPER)?|PAPER|EXAMINATION)\b/i.test(r.text));const blank=page.rows.some(r=>/^(?:BLANK PAGE|THIS PAGE (?:IS )?INTENTIONALLY LEFT BLANK|There are no questions printed on this page|DO NOT WRITE ON THIS PAGE)\b/i.test(r.text));let top=n===start.page?Math.max(.025,start.y-.012):.065,bottom=n===next?.page?next.y-.016:.94;
      const footers=page.rows.filter(r=>r.y>.84&&/^(?:©|Turn over|IB\/|\*\d+\*)/i.test(r.text));for(const footer of footers)bottom=Math.min(bottom,footer.y-.008);
      if(endMarker)bottom=Math.min(bottom,endMarker.y-.008);
      // A new question at the top of the next page should not attach that
      // page's running header to the previous question as a continuation.
      const prefixOnly=n!==start.page&&n===next?.page&&next.y<.22&&!page.rows.some(r=>r.y>=top&&r.y<bottom&&/[A-Za-z]{3}/.test(r.text)&&!(runningHeads.get(r.text.replace(/\d+/g,'#'))?.size>=2));
      if(!blank&&!prefixOnly&&bottom-top>.015)parts.push({page:n,crop:{x:.025,y:top,w:.95,h:Math.min(.975,bottom)-top}});if(endMarker||n===next?.page)break;}
    if(parts.length){for(const part of parts)part.numberRows=anchors.filter(a=>a.number===start.number&&a.page===part.page&&a.y>=part.crop.y&&a.y<part.crop.y+part.crop.h).map(a=>({x:a.x,y:a.y}));const label='Question '+start.number+(start.restarted?' (new section)':'');questions.push({id:'q-'+i,number:start.number,label,summary:start.summary,parts});}}
  return questions;
}

export async function detectQuestions(pdf,onProgress=()=>{}){
  const pages=[];let characters=0,failures=0;
  for(let number=1;number<=pdf.numPages;number++){try{const page=await pdf.getPage(number),content=await page.getTextContent(),rows=textRows(content,page.getViewport({scale:1}));characters+=rows.reduce((n,r)=>n+r.text.length,0);pages.push({number,rows});}catch{failures++;pages.push({number,rows:[]});}onProgress(number,pdf.numPages);if(number%4===0)await new Promise(resolve=>setTimeout(resolve,0));}
  return {questions:indexQuestions(pages),characters,failures};
}
