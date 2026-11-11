(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ShapeProject=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';const FORMAT='playground-shape',VERSION=1,MAX_BYTES=5*1024*1024,MAX_VERTICES=16384;
 const fail=message=>{throw Error(message);};
 function object(value,label){if(!value||typeof value!=='object'||Array.isArray(value))fail('Missing or invalid '+label+'.');return value;}
 function number(value,min,max,label){if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)fail('Invalid '+label+'; use a value from '+min+' to '+max+'.');return value;}
 function integer(value,min,max,label){number(value,min,max,label);if(!Number.isInteger(value))fail('Invalid '+label+'; use a whole number.');return value;}
 function boolean(value,label){if(typeof value!=='boolean')fail('Invalid '+label+'.');return value;}
 function state(input){const s=object(input,'shape data'),hasRetained=s.retained!==null,limit=hasRetained?4000:1000;let count=0,rings=0;
  function position(value,label){const p=object(value,label);return{x:number(p.x,-limit,limit,label+' x'),y:number(p.y,-limit,limit,label+' y')};}
  function ring(value,max){if(++rings>512)fail('The project has too many outlines.');if(!Array.isArray(value)||value.length>max)fail('An outline has too many vertices or is missing.');count+=value.length;if(count>MAX_VERTICES)fail('The project has too many vertices.');return value.map(p=>{const q=position(p,'vertex');if(p.curve!==undefined){const curve=object(p.curve,'curve');q.curve={c1:position(curve.c1,'first handle'),c2:position(curve.c2,'second handle')};}return q;});}
  if(!['revolve','extrude'].includes(s.mode))fail('Unknown shape mode.');
  const symmetry=object(s.symmetry,'symmetry settings'),centre=object(symmetry.center,'symmetry centre'),sym={enabled:boolean(symmetry.enabled,'symmetry mode'),order:integer(symmetry.order,2,24,'symmetry order'),center:{x:number(centre.x,-1000,1000,'symmetry centre x'),y:number(centre.y,-1000,1000,'symmetry centre y')}};
  let points,retained=null,activeOutline={polygon:0,ring:0};
  if(hasRetained){if(s.mode!=='extrude'||sym.enabled)fail('Retained outlines must use extrusion without active symmetry.');if(!Array.isArray(s.retained)||!s.retained.length||s.retained.length>256)fail('Invalid retained shapes.');
   retained=s.retained.map(p=>{if(!Array.isArray(p)||!p.length||p.length>256)fail('Invalid retained outlines.');return p.map(r=>ring(r,4096));});
   const active=object(s.activeOutline,'selected outline'),polygon=integer(active.polygon,0,retained.length-1,'selected shape'),r=integer(active.ring,0,retained[polygon].length-1,'selected outline');activeOutline={polygon,ring:r};points=retained[polygon][r].map(p=>({...p,...(p.curve?{curve:{c1:{...p.curve.c1},c2:{...p.curve.c2}}}:{})}));
  }else points=ring(s.points,80);
  const snap=number(s.snap,.5,5,'grid snap');if(![.5,1,2,5].includes(snap))fail('Unsupported grid snap.');if(!['line','bezier'].includes(s.drawType))fail('Unknown edge drawing mode.');
  return{points,closed:boolean(s.closed,'outline closure'),axis:number(s.axis,-1000,1000,'centre line'),mode:s.mode,thickness:number(s.thickness,.1,1000,'thickness'),symmetry:sym,retained,activeOutline,snap,angle:number(s.angle,0,360,'revolution angle'),drawType:s.drawType};
 }
 function encode(input){const result=JSON.stringify({format:FORMAT,version:VERSION,units:'mm',state:state(input)},null,2);if(new TextEncoder().encode(result).length>MAX_BYTES)fail('The project exceeds the 5 MB file limit.');return result;}
 function decode(text){if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_BYTES)fail('Choose a project file smaller than 5 MB.');let input;try{input=JSON.parse(text.replace(/^\uFEFF/,''));}catch{fail('This file is not valid JSON. Choose a saved Playground shape project.');}object(input,'project');if(input.format!==FORMAT)fail('This is not a Playground shape project.');if(input.version!==VERSION)fail('This project version is not supported.');if(input.units!=='mm')fail('Project coordinates must be in millimetres.');return state(input.state);}
 return{encode,decode,state,FORMAT,VERSION,MAX_BYTES};
});
