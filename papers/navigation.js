import {textRows} from './detect.js?v=3';

export function isNavigationNotice(text){
  const value=text.replace(/\s+/g,' ').trim().replace(/[►▶→»]+$/u,'').trim().replace(/^\((.*)\)$/,'$1').replace(/[.!:]+$/,'').trim();
  return /^(?:Please\s+)?turn over(?:\s+for\s+(?:the\s+)?next\s+question)?$/i.test(value)
    || /^(?:(?:Question\s+\d+(?:\.\d+)?|This question)\s+)?(?:is\s+)?(?:continues?|continued)\s+(?:(?:on|from|over)\s+(?:the\s+)?(?:next|previous|following|opposite)\s+page|(?:on|from)\s+page\s+\d+)$/i.test(value)
    || /^Question\s+\d+(?:\.\d+)?\s*\(?continued\)?$/i.test(value)
    || /^END OF (?:QUESTIONS?(?: PAPER)?|PAPER|EXAMINATION)$/i.test(value);
}

export async function navigationLocations(part){
  const page=await part.paper.pdf.getPage(part.page),viewport=page.getViewport({scale:1}),content=await page.getTextContent(),items=content.items.filter(i=>i.str?.trim()&&i.transform),rows=textRows(content,viewport),chunks=[];
  for(const row of rows){const line=items.filter(item=>Math.abs(viewport.convertToViewportPoint(item.transform[4],item.transform[5])[1]/viewport.height-(row.y+row.height*.95))<row.height*.4).sort((a,b)=>viewport.convertToViewportPoint(a.transform[4],a.transform[5])[0]-viewport.convertToViewportPoint(b.transform[4],b.transform[5])[0]);let group=[],right=-Infinity;
    const flush=()=>{if(!group.length)return;for(const r of textRows({items:group},viewport))chunks.push({...r,right});group=[];};
    for(const item of line){const left=viewport.convertToViewportPoint(item.transform[4],item.transform[5])[0]/viewport.width;if(left-right>.05)flush();group.push(item);right=left+item.width*viewport.scale/viewport.width;}flush();
  }
  const found=new Set();for(let i=0;i<chunks.length;i++){const current=chunks[i];if(isNavigationNotice(current.text)){found.add(current);continue;}for(const next of chunks.slice(i+1,i+4)){if(next.y-current.y>Math.max(.045,current.height*2.2))break;if(next.y<=current.y||Math.abs(next.x-current.x)>.2)continue;if(isNavigationNotice(current.text+' '+next.text)){found.add(current);found.add(next);break;}}}
  return [...found].map(row=>({x:row.x-1/viewport.width,y:row.y-1/viewport.height,w:row.right-row.x+2/viewport.width,h:row.height*1.18+2/viewport.height,text:row.text})).filter(r=>r.x<part.crop.x+part.crop.w&&r.x+r.w>part.crop.x&&r.y<part.crop.y+part.crop.h&&r.y+r.h>part.crop.y);
}

export function eraseNavigation(context,rects,viewport,crop){context.save();context.fillStyle='#fff';for(const r of rects)context.fillRect((r.x-crop.x)*viewport.width,(r.y-crop.y)*viewport.height,r.w*viewport.width,r.h*viewport.height);context.restore();}

export function pageTransition(current,next,renumber){
  if(!next)return 'END OF QUESTIONS';
  if(current.questionIndex===next.questionIndex){const number=renumber?current.questionIndex+1:current.sourceNumber;if(Number.isInteger(number))return 'Question '+number+' continues on the next page.';return 'This question continues on the next page.';}
  return 'Turn over for the next question.';
}
