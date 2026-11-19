// Locate only the leading question-number digits, never numbers in question prose.
// Per-character positions are estimated from PDF text-run widths and font metrics.
let measuring;
function measureRun(item,styles,viewport){
  measuring??=document.createElement('canvas').getContext('2d');
  const style=styles[item.fontName]||{},height=Math.max(5,Math.hypot(item.transform[2],item.transform[3])*viewport.scale),point=viewport.convertToViewportPoint(item.transform[4],item.transform[5]);
  measuring.font=height+'px '+(style.fontFamily||'sans-serif');
  const text=item.str,total=measuring.measureText(text).width||1,scale=item.width*viewport.scale/total;
  const chars=[];for(let i=0;i<text.length;i++){const left=measuring.measureText(text.slice(0,i)).width*scale,right=measuring.measureText(text.slice(0,i+1)).width*scale;chars.push({char:text[i],x:(point[0]+left)/viewport.width,y:(point[1]-height*.92)/viewport.height,w:(right-left)/viewport.width,h:height/viewport.height,baseline:point[1]/viewport.height});}
  return {x:point[0]/viewport.width,y:(point[1]-height*.95)/viewport.height,height:height/viewport.height,chars};
}
export async function numberLocations(part,sourceNumber){
  if(!Number.isInteger(sourceNumber)||!part.numberRows?.length)return [];
  const page=await part.paper.pdf.getPage(part.page),viewport=page.getViewport({scale:1}),content=await page.getTextContent(),runs=content.items.filter(i=>i.str?.trim()&&i.transform).map(i=>measureRun(i,content.styles,viewport)),labels=[];
  for(const row of part.numberRows){const line=runs.filter(r=>Math.abs(r.y-row.y)<Math.max(.004,r.height*.4)).sort((a,b)=>a.x-b.x);let chars=[];for(const run of line){if(chars.length&&run.x-(chars.at(-1).x+chars.at(-1).w)>.002)chars.push({char:' '});chars.push(...run.chars);}while(chars[0]?.char===' ')chars.shift();const text=chars.map(c=>c.char).join(''),match=text.match(/^(?:Question\s+)?(0\s*\d|[1-9]\s+\d|\d{1,3})(?=\s|[*.():-]|$)/i);if(!match||Number(match[1].replace(/\s/g,''))!==sourceNumber)continue;
    const offset=match[0].length-match[1].length,digits=chars.slice(offset,offset+match[1].length).filter(c=>/\d/.test(c.char)&&Number.isFinite(c.x));if(!digits.length)continue;
    const next=chars.slice(offset+match[1].length).find(c=>c.char!==' '&&Number.isFinite(c.x)),first=digits[0],last=digits.at(-1),gap=digits.length>1?digits[1].x-first.x-first.w:0,boxed=digits.length===2&&gap>first.w*.4;
    const right=last.x+last.w,limit=next?Math.min(right+.02,next.x-.002):right+.02;
    // A correction may trim a section after detection. Skip any clipped label.
    if(first.x<part.crop.x||right>part.crop.x+part.crop.w||first.y<part.crop.y||first.baseline>part.crop.y+part.crop.h)continue;
    labels.push({digits,boxed,padded:match[1].replace(/\s/g,'').startsWith('0'),x:first.x,y:first.y,h:Math.max(...digits.map(d=>d.h)),baseline:first.baseline,width:Math.max(right-first.x,limit-first.x),sourceNumber});
  }
  return labels;
}

export function eraseNumbers(context,locations,viewport,crop){
  context.save();context.fillStyle='#fff';
  for(const label of locations)for(const digit of label.digits){const x=(digit.x-crop.x)*viewport.width,y=(digit.baseline-digit.h*.8-crop.y)*viewport.height,w=digit.w*viewport.width,h=digit.h*.86*viewport.height;context.fillRect(x-.4*viewport.scale,y-.3*viewport.scale,w+.8*viewport.scale,h+.6*viewport.scale);}
  context.restore();
}

export function drawNumbers(page,locations,number,placement,font){
  const {natural,crop,x,y,height,factor}=placement;
  for(const label of locations){const digits=String(number).padStart(label.padded||label.boxed?2:1,'0');
    const draw=(text,left,width)=>{const baseSize=label.h*natural.height*factor,fontSize=Math.min(baseSize,width*natural.width*factor/font.widthOfTextAtSize(text,1));page.drawText(text,{x:x+(left-crop.x)*natural.width*factor,y:y+height-(label.baseline-crop.y)*natural.height*factor,size:fontSize,font});};
    if(label.boxed&&digits.length===label.digits.length){for(let i=0;i<digits.length;i++)draw(digits[i],label.digits[i].x,label.digits[i].w*1.1);}
    else draw(digits,label.x,label.width);
  }
}
