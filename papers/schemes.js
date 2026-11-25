import {textRows,indexQuestions} from './detect.js?v=4';
import {findQuestionParts,includedQuestionParts} from './subparts.js?v=2';

export async function detectMarkScheme(pdf,onProgress=()=>{}){
  const pages=[],answers=new Map();let characters=0,failures=0,started=false,previous=null;
  const add=(number,page,crop,rows)=>{if(crop.h<.005)return;let answer=answers.get(number);if(!answer){answer={id:'answer-'+number,number,label:'Question '+number,summary:'Mark scheme answer',parts:[]};answers.set(number,answer);}answer.parts.push({page,crop,numberRows:rows.map(r=>({x:r.x,y:r.y}))});};
  for(let number=1;number<=pdf.numPages;number++){
    try{const page=await pdf.getPage(number),viewport=page.getViewport({scale:1}),content=await page.getTextContent(),rows=textRows(content,viewport);characters+=rows.reduce((sum,r)=>sum+r.text.length,0);pages.push({number,rows});
      const header=rows.find(r=>r.y<.4&&/^Question\b/i.test(r.text)&&/\b(?:answers?|marks?|guidance|response)\b/i.test(r.text));
      if(!header&&!started)continue;if(header)started=true;if(!header&&rows.some(r=>/^Copyright Information|^OCR is committed|^BLANK PAGE|^THIS PAGE IS/i.test(r.text)))continue;
      // Multiple-choice schemes may have two Question/Answer columns on a page.
      const heads=content.items.filter(i=>/^Question$/i.test(i.str?.trim()||'')).map(i=>{const [x,y]=viewport.convertToViewportPoint(i.transform[4],i.transform[5]);return {x:x/viewport.width,y:y/viewport.height};}).filter(p=>header&&Math.abs(p.y-(header.y+header.height*.95))<.025).sort((a,b)=>a.x-b.x);
      const columns=heads.length>1?heads.map((p,i)=>({x:Math.max(.015,p.x-.02),right:heads[i+1]?heads[i+1].x-.025:.985,gutter:p.x})):[{x:.025,right:.975,gutter:header?.x??.06}];
      for(const column of columns){const columnRows=columns.length===1?rows:textRows({items:content.items.filter(i=>{if(!i.transform)return false;const x=viewport.convertToViewportPoint(i.transform[4],i.transform[5])[0]/viewport.width;return x>=column.x&&x<column.right;})},viewport),top=header?header.y+header.height+.008:.065,bottom=.94,candidates=[];
        for(const row of columnRows){if(row.y<top||row.y>bottom||row.x>column.gutter+.065||row.x<column.x-.005||row.y>.85&&/^\d{1,3}$/.test(row.text))continue;const m=row.text.match(/^(?:Question\s+)?(0\s*\d|[1-9]\s+\d|\d{1,3})(?:\s*\.\s*(\d{1,2}))?(?=\s|[(*.)]|$)/i);if(!m)continue;const n=Number(m[1].replace(/\s/g,''));if(n<1||n>100)continue;candidates.push({...row,number:n});}
        const starts=candidates.filter((r,i)=>!i||r.number!==candidates[i-1].number);
        if(previous&&columns.length===1&&(!starts.length||starts[0].y>top+.035)&&columnRows.some(r=>r.y>=top&&r.y<(starts[0]?.y??bottom)&&/[a-z]{3}/i.test(r.text)&&!/^Question|^MARK SCHEME|^H\d{3}/i.test(r.text)))add(previous,number,{x:column.x,y:top,w:column.right-column.x,h:(starts[0]?starts[0].y-.006:bottom)-top},[]);
        for(let i=0;i<starts.length;i++){const start=starts[i],end=starts[i+1]?.y??bottom,y=Math.max(top,start.y-.006);add(start.number,number,{x:column.x,y,w:column.right-column.x,h:end-.006-y},candidates.filter(r=>r.number===start.number&&r.y>=start.y&&r.y<end));previous=start.number;}
      }
    }
    catch{failures++;pages[number-1]={number,rows:[]};}onProgress(number,pdf.numPages);if(number%4===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
  // Explicit Question headings also support teacher-made schemes without tables.
  const firstAnswer=answers.get(1)?.parts[0]?.page;if(firstAnswer)for(const [key,answer] of answers){answer.parts=answer.parts.filter(p=>p.page>=firstAnswer);if(!answer.parts.length)answers.delete(key);}
  return {questions:started?[...answers.values()].sort((a,b)=>a.number-b.number):indexQuestions(pages),characters,failures};
}
export function matchingScheme(paper,schemes){
  const stem=name=>name.toLowerCase().replace(/\.pdf$/,'').replace(/question\s*paper|mark\s*scheme|\b(?:qp|ms)\b/g,' ').replace(/[^a-z0-9]/g,'');
  const key=stem(paper.name);if(!key)return null;const found=schemes.filter(s=>stem(s.name)===key);return found.length===1?found[0]:null;
}
export async function schemePartsForQuestion(question,parts,answerNumber,{custom=false}={}){
  const choices=question.partChoices?.groups.slice(1),partial=choices?.some(g=>!g.included);
  if(!partial||custom)return parts;
  const model=await findQuestionParts(parts,answerNumber,{tableMode:true}),labels=new Set(model.groups.slice(1).map(g=>g.label));
  if(!model.found||choices.some(g=>!labels.has(g.label)))throw Error(question.label+': could not match all omitted/retained part labels in the mark scheme. Review and select its answer regions manually.');
  const included=new Set(choices.filter(g=>g.included).map(g=>g.label));for(const group of model.groups.slice(1))group.included=included.has(group.label);
  return includedQuestionParts(model);
}
