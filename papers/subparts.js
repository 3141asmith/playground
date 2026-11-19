import {textRows} from './detect.js?v=4';

// Full-width bands preserve diagrams and answer space between printed labels.
// This is text/layout detection, so users must review inferred boundaries.
function marker(row,sourceNumber){
  if(row.x>.38)return null;
  const text=row.text.trim();let match=text.match(/^(?:Question\s+)?(0\s*\d|[1-9]\s+\d|\d{1,3})\s*\.\s*(\d{1,2})(?=\s|\(|$)/i);
  if(match&&(!sourceNumber||Number(match[1].replace(/\s/g,''))===sourceNumber))return {family:'decimal',key:'.'+match[2],label:'.'+match[2]};
  match=text.match(/^(?:(?:Question\s+)?(\d{1,3})\s*)?(?:\(([a-z]+)\)|([a-z])\))(?=\s|\(|$)/i);
  if(!match||match[1]&&sourceNumber&&Number(match[1])!==sourceNumber)return null;
  const key=(match[2]||match[3]).toLowerCase();if(key.length>1&&!/^[ivx]+$/.test(key))return null;
  return {family:/^[ivx]+$/.test(key)?'roman':'letter',key,label:'('+key+')'};
}
const totalLine=text=>/^(?:\(?\[?\s*total\s+(?:for\s+)?(?:this\s+)?question\s*\d*\s*(?:is|:|=)?\s*\d+(?:\.\d+)?\s*(?:marks?|[\])])|[\[(]\s*total\s*:?\s*\d+(?:\.\d+)?\s*(?:marks?|[\])]))/i.test(text);
export async function findQuestionParts(parts,sourceNumber){
  const pages=[];for(const part of parts){const page=await part.paper.pdf.getPage(part.page),rows=textRows(await page.getTextContent(),page.getViewport({scale:1})).filter(r=>r.y>=part.crop.y&&r.y<part.crop.y+part.crop.h&&r.x>=part.crop.x-.01&&r.x<part.crop.x+part.crop.w);pages.push({part,rows});}
  const candidates=pages.flatMap((p,index)=>p.rows.map(row=>({row,index,...marker(row,sourceNumber)})).filter(m=>m.key));
  const family=candidates.some(m=>m.family==='decimal')?'decimal':candidates.some(m=>m.family==='letter')?'letter':'roman';
  const groups=[{key:'shared',label:'Shared introduction',included:true,parts:[]}];let current=groups[0],previous='';
  for(let index=0;index<pages.length;index++){
    const {part,rows}=pages[index];let top=part.crop.y;
    const add=bottom=>{if(bottom-top<.001)return;current.parts.push({...part,id:crypto.randomUUID(),thumbnail:null,crop:{...part.crop,y:top,h:bottom-top},numberRows:(part.numberRows||[]).filter(r=>r.y>=top&&r.y<bottom),totalRows:rows.filter(r=>totalLine(r.text)).map(r=>({y:r.y,h:r.height}))});};
    for(const m of candidates.filter(m=>m.index===index)){
      const alphabetRoman=family==='letter'&&m.family==='roman'&&m.key.length===1&&previous&&m.key.charCodeAt(0)===previous.charCodeAt(0)+1;
      if(m.family!==family&&!alphabetRoman||m.key===previous)continue;
      const boundary=Math.max(top,m.row.y-.004);add(boundary);top=boundary;previous=m.key;current={key:m.key+'-'+groups.length,label:m.label,included:true,parts:[]};groups.push(current);
    }
    add(part.crop.y+part.crop.h);
  }
  return {original:parts,groups,found:groups.length>1};
}
export function includedQuestionParts(model){
  const selectable=model.groups.slice(1),partial=selectable.some(g=>!g.included);
  if(!partial)return model.original;
  const result=[];
  for(const group of model.groups.filter(g=>g.included))for(const part of group.parts){
    // A printed total for the original whole question would now be incorrect.
    let bands=[{...part.crop}];for(const row of part.totalRows||[]){const start=row.y-.002,end=row.y+row.h*1.2+.002;bands=bands.flatMap(b=>{const bottom=b.y+b.h;if(end<=b.y||start>=bottom)return [b];const keep=[];if(start>b.y+.001)keep.push({...b,h:start-b.y});if(end<bottom-.001)keep.push({...b,y:end,h:bottom-end});return keep;});}
    for(const crop of bands)result.push({...part,id:part.id+':'+crop.y,partLabel:group.label,crop,numberRows:(part.numberRows||[]).filter(r=>r.y>=crop.y&&r.y<crop.y+crop.h)});
  }
  return result;
}
