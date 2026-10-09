(()=>{
 'use strict';
 const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg',G=9.81,colors=['#b64223','#36715e','#695695','#9a6e24','#387991','#8d4667'];
 const state={length:6,pivot:3,beamMass:0,x:500,y:350,angle:0,omega:0,running:false,vectors:true,masses:[],nextId:1};
 let drag=null,last=0,accumulator=0,lastTable=0,policy=null;
 function allowed(action,id,key){return !policy||policy.allow(action,id,key);}
 function sync(){if(policy)policy.sync();}
 function changed(){if(policy)policy.changed();}
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const fmt=(v,n=2)=>(Math.abs(v)<.0005?0:v).toFixed(n);
 const name=id=>String.fromCharCode(65+(id-1)%26);
 function scale(){return 75;}
 function setPivot(value){hold();state.x+=(value-state.pivot)*scale();state.pivot=value;}
 function moveBeam(dx,dy){const offset=(state.length/2-state.pivot)*scale();state.x=clamp(state.x+offset+dx,320,680)-offset;state.y=clamp(state.y+dy,290,410); }
 function point(position){const d=(position-state.pivot)*scale();return {x:state.x+d*Math.cos(state.angle),y:state.y+d*Math.sin(state.angle)};}
 function loads(){const a=state.masses.map(m=>({...m,label:m.label||'Mass '+name(m.id)}));if(state.beamMass>0)a.push({id:0,kg:state.beamMass,position:state.length/2,label:'Beam'});return a;}
 function calculate(){let cw=0,ccw=0;const rows=loads().map(m=>{const arm=(m.position-state.pivot)*Math.cos(state.angle),force=m.kg*G,moment=arm*force;if(moment>0)cw+=moment;else ccw-=moment;return {...m,arm,force,moment};});return {cw,ccw,net:cw-ccw,rows};}
 function inertia(){return state.beamMass*(state.length**2/12+(state.length/2-state.pivot)**2)+state.masses.reduce((sum,m)=>sum+m.kg*(m.position-state.pivot)**2,0);}
 function step(dt){if(!state.running)return;const i=inertia();if(i<1e-9){state.omega=0;return;}state.omega+=(calculate().net/i-.65*state.omega)*dt;state.angle+=state.omega*dt;state.angle=Math.atan2(Math.sin(state.angle),Math.cos(state.angle));}
 function node(tag,attrs={},text){const el=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!==undefined)el.textContent=text;return el;}
 function forceArrow(group,x,y,force,reference=false){
  const length=force,head=Math.min(10,length*.35),halfWidth=Math.min(5,length*.2);
  const arrow=node('g',{'pointer-events':'none','data-force':force,'data-force-scale':1,'data-force-reference':String(reference)});
  arrow.append(node('line',{x1:x,y1:y,x2:x,y2:y+length-head,stroke:'#695695','stroke-width':Math.min(3,length*.12),'stroke-linecap':'butt'}));
  arrow.append(node('path',{d:`M ${x} ${y+length} L ${x-halfWidth} ${y+length-head} L ${x+halfWidth} ${y+length-head} Z`,fill:'#695695'}));
  group.append(arrow);return y+length;
 }
 function draw(){
  const svg=$('scene'),group=node('g'),scenario=policy?.scene;
  let sceneDrawing=null;
  const radius=Math.max(state.pivot,state.length-state.pivot)*scale()+230;
  svg.setAttribute('viewBox',state.running?`${state.x-Math.max(500,radius)} ${state.y-Math.max(350,radius)} ${Math.max(1000,2*radius)} ${Math.max(700,2*radius)}`:'0 0 1000 700');
  if(scenario){const width=Math.max(600,state.length*scale()+200),centre=(point(0).x+point(state.length).x)/2;svg.setAttribute('viewBox',`${centre-width/2} ${state.y-250} ${width} 560`);svg.dataset.scenario=scenario;}else delete svg.dataset.scenario;
  const defs=node('defs');for(const [id,color]of [['weight','#695695'],['cw','#b64223'],['ccw','#36715e']]){const marker=node('marker',{id:'arrow-'+id,viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'});marker.append(node('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:color}));defs.append(marker);}group.append(defs);
  for(let x=0;x<=1000;x+=50)group.append(node('line',{x1:x,y1:0,x2:x,y2:700,stroke:'#d4ddca','stroke-width':1}));
  for(let y=0;y<=700;y+=50)group.append(node('line',{x1:0,y1:y,x2:1000,y2:y,stroke:'#d4ddca','stroke-width':1}));
  if(scenario)sceneDrawing=window.MomentsScenes.render({type:scenario,group,state,point,node,name,fmt,allowed});
  if(!scenario)group.append(node('path',{d:`M ${state.x-30} ${state.y+48} L ${state.x} ${state.y} L ${state.x+30} ${state.y+48} Z`,fill:'#7a896b',stroke:'#526347','stroke-width':2,'data-drag':'pivot',class:'draggable'}));
  const a=point(0),b=point(state.length);if(!scenario)group.append(node('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:'#b8a181','stroke-width':22,'stroke-linecap':'round','data-drag':'beam',class:'draggable'}));
  for(let p=0;p<=state.length+.001;p+=.5){const q=point(p),s=Math.sin(state.angle),c=Math.cos(state.angle);group.append(node('line',{x1:q.x-6*s,y1:q.y+6*c,x2:q.x+6*s,y2:q.y-6*c,stroke:'#75634e','stroke-width':1.5,'pointer-events':'none'}));if(Number.isInteger(p))group.append(node('text',{x:q.x-26*s,y:q.y+26*c+4,'text-anchor':'middle',fill:'#625b4d','font-size':13},p+' m'));}
  group.append(node('circle',{cx:state.x,cy:state.y,r:10,fill:'#faf9f5',stroke:'#526347','stroke-width':3,'data-drag':'pivot',class:'draggable'}));
  group.append(node('text',{x:state.x,y:state.y+(scenario?200:72),'text-anchor':'middle',fill:'#526347','font-size':13},'PIVOT · '+fmt(state.pivot,1)+' m'));
  const result=calculate();
  if(state.vectors){
   for(const m of result.rows){const q=sceneDrawing?.anchors.get(m.id)||point(m.position);if(m.kg<=0)continue;const tip=forceArrow(group,q.x,q.y,m.force);group.append(node('text',{x:q.x+10,y:tip+4,fill:'#695695','font-size':13},fmt(m.force,1)+' N'));

   }
   for(const [direction,total,radius,startAngle,endAngle,color]of [
    ['cw',result.cw,70,30,150,'#b64223'],
    ['ccw',result.ccw,100,150,30,'#36715e']
   ]){
    if(total<.005)continue;
    const radians=degrees=>degrees*Math.PI/180;
    const start={x:state.x+radius*Math.cos(radians(startAngle)),y:state.y+radius*Math.sin(radians(startAngle))};
    const end={x:state.x+radius*Math.cos(radians(endAngle)),y:state.y+radius*Math.sin(radians(endAngle))};
    const clockwise=direction==='cw';
    group.append(node('path',{d:`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${clockwise?1:0} ${end.x} ${end.y}`,fill:'none',stroke:color,'stroke-width':3,'marker-end':`url(#arrow-${direction})`,'data-moment':direction,'data-centre-x':state.x,'data-centre-y':state.y,'data-radius':radius,'aria-label':`${clockwise?'Clockwise':'Anticlockwise'} moment: ${fmt(total)} newton metres`}));
    group.append(node('text',{x:state.x+(clockwise?-radius-15:radius+15),y:state.y+radius*.72,'text-anchor':clockwise?'end':'start',fill:color,'font-size':13,'font-weight':600},`${clockwise?'CW':'ACW'} ${fmt(total)} N m`));
   }
   const legendX=scenario?(point(0).x+point(state.length).x)/2-Math.max(600,state.length*scale()+200)/2+32:38,legendY=scenario?state.y-210:52;
   forceArrow(group,legendX,legendY,50,true);group.append(node('text',{x:legendX+13,y:legendY+28,fill:'#695695','font-size':12},'50 N reference'));
   group.append(node('text',{x:scenario?(point(0).x+point(state.length).x)/2-Math.max(600,state.length*scale()+200)/2+20:26,y:scenario?state.y-230:32,fill:'#695695','font-size':13},'↓ Weight    ↶ Anticlockwise    ↷ Clockwise'));
  }
  if(!scenario)for(const m of state.masses){const q=point(m.position),color=colors[(m.id-1)%colors.length];group.append(node('circle',{cx:q.x,cy:q.y-22,r:22,fill:color,stroke:'#faf9f5','stroke-width':3,'data-drag':'mass','data-id':m.id,class:'draggable'}));group.append(node('text',{x:q.x,y:q.y-17,'text-anchor':'middle',fill:'#fff','font-size':14,'pointer-events':'none'},name(m.id)));group.append(node('text',{x:q.x,y:q.y-54,'text-anchor':'middle',fill:color,'font-size':14,'pointer-events':'none'},fmt(m.kg,1)+' kg'));}
  svg.replaceChildren(group);$('ccw').textContent=fmt(result.ccw)+' N m';$('cw').textContent=fmt(result.cw)+' N m';$('net').textContent=fmt(Math.abs(result.net))+' N m '+(Math.abs(result.net)<.005?'':result.net>0?'↷':'↶');
  $('status').textContent=state.running?(Math.abs(state.omega)<.002&&Math.abs(result.net)<.005?'Balanced':'Beam released'):Math.abs(result.net)<.005?'Balanced':result.net>0?'Clockwise moment':'Anticlockwise moment';$('angle').textContent=fmt(state.angle*180/Math.PI,1)+'°';
 }
 function table(){const body=$('moment-rows');body.replaceChildren();for(const m of calculate().rows){const tr=document.createElement('tr');for(const value of [m.label,fmt(m.force),fmt(m.position),fmt(Math.abs(m.arm)),fmt(Math.abs(m.moment)),Math.abs(m.moment)<.005?'None':m.moment>0?'Clockwise ↷':'Anticlockwise ↶']){const td=document.createElement('td');td.textContent=value;tr.append(td);}body.append(tr);}if(!body.children.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.textContent='Add a mass or give the beam a mass to explore turning moments.';tr.append(td);body.append(tr);}}
 function hold(){state.running=false;state.angle=0;state.omega=0;$('release').textContent='Release beam';$('mode-note').textContent='Beam held level while you arrange the experiment.';}
 function fields(){ $('length').value=state.length;$('beam-mass').value=state.beamMass;$('pivot').max=state.length;$('pivot').value=fmt(state.pivot,1);$('vectors').checked=state.vectors;const list=$('masses');list.replaceChildren();for(const m of state.masses){const row=document.createElement('div');row.className='mass-row';const label=document.createElement('span');label.className='mass-name';label.textContent=name(m.id);label.style.color=colors[(m.id-1)%colors.length];row.append(label);for(const [key,unit,min,max]of [['kg','kg',.1,20],['position','m',0,state.length]]){const l=document.createElement('label'),input=document.createElement('input');input.type='number';input.min=min;input.max=max;input.step=.1;input.value=fmt(m[key],1);input.disabled=!allowed('mass',m.id,key);input.setAttribute('aria-label','Mass '+name(m.id)+' '+(key==='kg'?'in kilograms':'position in metres'));input.addEventListener('change',()=>{if(!allowed('mass',m.id,key))return;const v=input.valueAsNumber;if(!Number.isFinite(v)){input.value=fmt(m[key],1);return;}m[key]=clamp(v,min,max);input.value=fmt(m[key],1);hold();table();changed();});l.append(input,document.createTextNode(unit));row.append(l);}const remove=document.createElement('button');remove.className='remove';remove.textContent='Remove';remove.setAttribute('aria-label','Remove mass '+name(m.id));remove.disabled=!allowed('remove',m.id);remove.addEventListener('click',()=>{if(!allowed('remove',m.id))return;state.masses=state.masses.filter(v=>v.id!==m.id);hold();fields();table();changed();$('add').focus();});row.append(remove);list.append(row);}$('add').disabled=state.masses.length>=8||!allowed('add');sync();}
 function reset(){Object.assign(state,{length:6,pivot:3,beamMass:0,x:500,y:350,angle:0,omega:0,running:false,vectors:true,nextId:3,masses:[{id:1,kg:2,position:1},{id:2,kg:2,position:5}]});drag=null;hold();fields();table();draw();}
 for(const [id,key,min,max]of [['length','length',2,8],['beam-mass','beamMass',0,20],['pivot','pivot',0,8]])$(id).addEventListener('change',e=>{if(!allowed(key))return;const value=e.target.valueAsNumber;if(!Number.isFinite(value)){fields();return;}const centre=state.x+(state.length/2-state.pivot)*scale();state[key]=clamp(value,min,key==='pivot'?state.length:max);state.pivot=Math.min(state.pivot,state.length);state.x=centre+(state.pivot-state.length/2)*scale();for(const m of state.masses)m.position=Math.min(m.position,state.length);hold();fields();table();changed();});
 document.querySelectorAll('[data-pivot]').forEach(b=>b.addEventListener('click',()=>{if(!allowed('pivot'))return;setPivot(state.length*Number(b.dataset.pivot));fields();table();changed();}));
 $('add').addEventListener('click',()=>{if(state.masses.length>=8||!allowed('add'))return;const id=state.nextId++;state.masses.push(policy?{id,...policy.newMass}:{id,kg:1,position:clamp(state.length/2+(state.masses.length%2?1:-1)*Math.ceil(state.masses.length/2)*.5,0,state.length)});hold();fields();table();const inputs=$('masses').querySelectorAll('input');const editable=[...inputs].findLast(input=>!input.disabled);if(editable)editable.focus();changed();});
 $('vectors').addEventListener('change',e=>{state.vectors=e.target.checked;});$('reset').addEventListener('click',()=>{if(policy)policy.retry();else reset();});$('release').addEventListener('click',()=>{if(!allowed('release'))return;if(state.running)hold();else{state.running=true;$('release').textContent='Hold level';$('mode-note').textContent='Beam rotates about the pivot. Masses stay attached. Editing the setup holds it level again.';}});
 const svg=$('scene');svg.addEventListener('keydown',e=>{if(!allowed('beam')||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();hold();moveBeam(e.key==='ArrowRight'?10:e.key==='ArrowLeft'?-10:0,e.key==='ArrowDown'?10:e.key==='ArrowUp'?-10:0);});function coordinates(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
 svg.addEventListener('pointerdown',e=>{const target=e.target.closest('[data-drag]');if(!target||e.button!==0||drag||!allowed(target.dataset.drag,Number(target.dataset.id),'position'))return;e.preventDefault();hold();const p=coordinates(e);drag={kind:target.dataset.drag,id:Number(target.dataset.id),pointer:e.pointerId,start:p,x:state.x,y:state.y,scale:scale(),pivot:state.pivot};svg.setPointerCapture(e.pointerId);});
 svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointer)return;const p=coordinates(e);if(drag.kind==='beam'){state.x=drag.x;state.y=drag.y;moveBeam(p.x-drag.start.x,p.y-drag.start.y);}else if(drag.kind==='pivot'){const pivot=clamp(drag.pivot+(p.x-drag.start.x)/drag.scale,0,state.length);state.pivot=Math.round(pivot*10)/10;state.x=drag.x+(state.pivot-drag.pivot)*drag.scale;$('pivot').value=fmt(state.pivot,1);}else{const m=state.masses.find(m=>m.id===drag.id);if(m)m.position=Math.round(clamp(state.pivot+(p.x-state.x)/scale(),0,state.length)*10)/10;}table();changed();});
 function end(e){if(drag&&e.pointerId===drag.pointer){drag=null;fields();table();}}svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);svg.addEventListener('lostpointercapture',end);
 document.addEventListener('visibilitychange',()=>{last=0;accumulator=0;});
 function frame(now){if(last&&!document.hidden){accumulator+=Math.min((now-last)/1000,.1);while(accumulator>=1/120){step(1/120);accumulator-=1/120;}}last=now;draw();if(now-lastTable>100){table();lastTable=now;}requestAnimationFrame(frame);}
 reset();requestAnimationFrame(frame);window.momentsLab={state,calculate,inertia,step,reset,point,
  setPolicy(value){policy=value;fields();},
  loadSetup(setup){hold();drag=null;Object.assign(state,{x:500,y:350,beamMass:0,angle:0,omega:0,vectors:true},structuredClone(setup));state.x=500+(state.pivot-state.length/2)*scale();state.nextId=Math.max(0,...state.masses.map(m=>m.id))+1;fields();table();draw();}
 };
})();
