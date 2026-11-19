import {OPS} from './vendor/pdf-6.5.438.js';

// Capture the text that PDF.js actually paints, rather than copying a source
// page behind a crop. Omitted regions and invisible OCR layers are not imported.
export async function editableFonts(doc){
  const {StandardFonts}=window.PDFLib,result={};
  for(const name of ['Helvetica','HelveticaBold','HelveticaOblique','HelveticaBoldOblique','TimesRoman','TimesRomanBold','TimesRomanItalic','TimesRomanBoldItalic','Courier','CourierBold','CourierOblique','CourierBoldOblique','Symbol'])result[name]=await doc.embedFont(StandardFonts[name]);
  return result;
}
function fontKey(font){const family=font.fallbackName||'',name=font.loadedName||'',bold=font.bold||/bold|black/i.test(name),italic=font.italic||/italic|oblique/i.test(name);if(/mono/i.test(family))return 'Courier'+(bold?'Bold':'')+(italic?'Oblique':'');if(/serif/i.test(family)&&!/sans/i.test(family))return 'TimesRoman'+(bold?'Bold':'')+(italic?'Italic':'');return 'Helvetica'+(bold?'Bold':'')+(italic?'Oblique':'');}
function colorOf(value){if(typeof value!=='string')return null;const hex=value.match(/^#([0-9a-f]{6})$/i);if(hex)return [0,2,4].map(i=>parseInt(hex[1].slice(i,i+2),16)/255);const rgb=value.match(/^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/);return rgb?rgb.slice(1,4).map(n=>Number(n)/255):null;}
export async function captureEditableText(page,ctx,fonts,{viewport,crop,masks=[]}){
  const operators=await page.getOperatorList(),records=new Map(),text=[],original=ctx.fillText;let current=null;const stack=[];
  for(let i=0;i<operators.fnArray.length;i++){
    const op=operators.fnArray[i],args=operators.argsArray[i];if(op===OPS.save)stack.push(current);else if(op===OPS.restore)current=stack.pop()||null;else if(op===OPS.setFont){try{const font=page.commonObjs.get(args[0]);current=!font.disableFontFace&&!font.isType3Font?font:null;}catch{current=null;}}
    else if(current&&[OPS.showText,OPS.showSpacedText,OPS.nextLineShowText,OPS.nextLineSetSpacingShowText].includes(op)){
      const name=current.loadedName;if(!name)continue;let record=records.get(name);if(!record){record={name,key:fontKey(current),glyphs:new Map()};records.set(name,record);}const glyphs=args.find(Array.isArray)||[];for(const glyph of glyphs){if(!glyph||typeof glyph!=='object'||!glyph.fontChar||!glyph.unicode)continue;const previous=record.glyphs.get(glyph.fontChar);record.glyphs.set(glyph.fontChar,record.glyphs.has(glyph.fontChar)&&previous!==glyph.unicode?null:glyph.unicode);}
    }
  }
  const list=[...records.values()].sort((a,b)=>b.name.length-a.name.length),encoded=new Map();let retained=0;
  const choose=(key,value)=>{const cacheKey=key+':'+value;if(encoded.has(cacheKey))return encoded.get(cacheKey);let result=null;for(const name of [key,'Symbol'])try{fonts[name].encodeText(value);result=name;break;}catch{}encoded.set(cacheKey,result);return result;};
  ctx.fillText=function(value,x,y,maxWidth){
    const record=list.find(r=>this.font.includes(r.name)),size=Number(this.font.match(/([\d.]+)px/)?.[1]),color=colorOf(this.fillStyle);
    if(!record||!size||!color||maxWidth!==undefined||this.globalCompositeOperation!=='source-over'){retained++;return maxWidth===undefined?original.call(this,value,x,y):original.call(this,value,x,y,maxWidth);}
    const matrix=this.getTransform();let prefix='';for(const char of [...String(value)]){
      const unicode=record.glyphs.has(char)?record.glyphs.get(char):null,dx=x+this.measureText(prefix).width,metrics=this.measureText(char),width=metrics.width;prefix+=char;
      const left=dx-(metrics.actualBoundingBoxLeft||0),right=dx+(metrics.actualBoundingBoxRight||width),top=y-(metrics.actualBoundingBoxAscent||size),bottom=y+(metrics.actualBoundingBoxDescent||0),corners=[[left,top],[right,top],[left,bottom],[right,bottom]].map(([a,b])=>({x:matrix.a*a+matrix.c*b+matrix.e,y:matrix.b*a+matrix.d*b+matrix.f})),bounds={x:Math.min(...corners.map(p=>p.x)),y:Math.min(...corners.map(p=>p.y)),right:Math.max(...corners.map(p=>p.x)),bottom:Math.max(...corners.map(p=>p.y))};
      const source={x:bounds.x/viewport.width+crop.x,y:bounds.y/viewport.height+crop.y,w:(bounds.right-bounds.x)/viewport.width,h:(bounds.bottom-bounds.y)/viewport.height},masked=masks.some(r=>source.x<r.x+r.w&&source.x+source.w>r.x&&source.y<r.y+r.h&&source.y+source.h>r.y),inside=bounds.x>=-.5&&bounds.y>=-.5&&bounds.right<=this.canvas.width+.5&&bounds.bottom<=this.canvas.height+.5,font=unicode&&choose(record.key,unicode);
      if(!unicode?.trim()||!font||!inside||masked){if(unicode?.trim()&&!font)retained++;original.call(this,char,dx,y);continue;}
      text.push({text:unicode,font,size,width,color,opacity:this.globalAlpha,matrix:{a:matrix.a,b:matrix.b,c:matrix.c,d:matrix.d,e:matrix.a*dx+matrix.c*y+matrix.e,f:matrix.b*dx+matrix.d*y+matrix.f}});
    }
  };
  return {text,get retained(){return retained;},restore(){ctx.fillText=original;}};
}
export function drawEditableText(page,image,{x,y,width,height},fonts){
  if(!image.editableText?.length)return;const {pushGraphicsState,popGraphicsState,concatTransformationMatrix,rgb}=window.PDFLib,sx=width/image.pixelWidth,sy=height/image.pixelHeight;let previousFont;
  for(const run of image.editableText){const font=fonts[run.font],m=run.matrix,measured=font.widthOfTextAtSize(run.text,run.size),stretch=measured?run.width/measured:1;if(font!==previousFont){page.setFont(font);previousFont=font;}page.pushOperators(pushGraphicsState(),concatTransformationMatrix(m.a*sx*stretch,-m.b*sy*stretch,-m.c*sx,m.d*sy,x+m.e*sx,y+height-m.f*sy));page.drawText(run.text,{x:0,y:0,size:run.size,color:rgb(...run.color),opacity:run.opacity===1?undefined:run.opacity});page.pushOperators(popGraphicsState());}
}
