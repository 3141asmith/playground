(()=>{
 'use strict';
 const palette=['#b64223','#36715e','#695695','#9a6e24','#387991','#8d4667'];
 function render({type,group,state,point,node,name,fmt,allowed}){
  const a=point(0),b=point(state.length),y=state.y,px=state.x,anchors=new Map();
  const add=(parent,tag,attrs,text)=>{const el=node(tag,attrs,text);parent.append(el);return el;};
  const line=(x1,y1,x2,y2,color='#526347',width=4,parent=group)=>add(parent,'line',{x1,y1,x2,y2,stroke:color,'stroke-width':width,'stroke-linecap':'round'});
  const rect=(x,yy,width,height,fill,parent=group,extra={})=>add(parent,'rect',{x,y:yy,width,height,rx:4,fill,stroke:'#526347','stroke-width':2,...extra});
  const path=(d,fill='none',parent=group,extra={})=>add(parent,'path',{d,fill,stroke:'#526347','stroke-width':3,'stroke-linejoin':'round',...extra});
  const text=(x,yy,value,parent=group,extra={})=>add(parent,'text',{x,y:yy,'text-anchor':'middle',fill:'#526347','font-size':14,...extra},value);
  const circle=(cx,cy,r,fill,parent=group)=>add(parent,'circle',{cx,cy,r,fill,stroke:'#526347','stroke-width':2});
  // All artwork uses the same metre-to-screen mapping as the physics model.
  const floor=y+210;
  rect(a.x-100,floor,b.x-a.x+200,55,'#d6dccb',group,{'stroke-width':0});
  line(a.x-100,floor,b.x+100,floor,'#9aa88c',2);
  const support=add(group,'g',{'data-drag':'pivot',class:allowed('pivot')?'draggable':'', 'data-scenario-support':type});
  if(type==='book'){
   rect(a.x-24,y+12,px-a.x+24,18,'#b8a181');
   rect(a.x-6,y+30,15,floor-y-30,'#b8a181');rect(px-22,y+30,15,floor-y-30,'#b8a181');
   text((a.x+px)/2,floor-20,'TABLE');line(px,y+10,px,y+95,'#b64223',2);text(px+30,y+115,'Edge',group,{'font-size':12});
  }else if(type==='wardrobe'){
   rect(a.x-30,y+9,b.x-a.x+60,12,'#c3b699');line(px,y+12,px,y+100,'#b64223',2);text(px,y+122,'Tipping edge');
  }else if(type==='mobile'){
   line(px,y-215,px,y,'#777e70',3,support);line(px-65,y-215,px+65,y-215,'#777e70',5,support);
  }else if(type==='crane'){
   rect(px-24,y+18,48,floor-y-18,'#d3b75f',support);for(let yy=y+25;yy<floor-25;yy+=35)path(`M ${px-24} ${yy} L ${px+24} ${yy+35} M ${px+24} ${yy} L ${px-24} ${yy+35}`,'none',support,{'stroke-width':2});rect(px-65,floor-14,130,14,'#7a896b',support);
  }else if(type==='camera'){
   line(px,y+8,px-75,floor,'#526347',5,support);line(px,y+8,px+75,floor,'#526347',5,support);line(px,y+8,px,floor,'#526347',5,support);circle(px,y+22,16,'#b8a181',support);
  }else if(type==='bridge'){
   rect(px-32,y+20,64,floor-y-20,'#aab2a1',support);for(let yy=y+45;yy<floor;yy+=25)line(px-30,yy,px+30,yy,'#89977e',2,support);
  }else if(type==='scales'){
   rect(px-9,y+12,18,floor-y-25,'#b8a181',support);rect(px-62,floor-15,124,15,'#7a896b',support);
  }else{
   path(`M ${px-44} ${y+70} L ${px} ${y} L ${px+44} ${y+70} Z`,'#7a896b',support);
   if(type==='seesaw'){line(px,y+70,px,floor,'#526347',9,support);rect(px-55,floor-12,110,12,'#7a896b',support);}
   else if(type==='sign'){line(px,y+70,px,floor,'#526347',7,support);}
   else{rect(px-40,y+70,80,floor-y-70,'#b8a181',support);}
  }
  const beam=add(group,'g',{'data-drag':'beam'});
  const beamColor=type==='crane'?'#d3b75f':type==='camera'?'#74827c':type==='seesaw'?'#b64223':'#b8a181';
  rect(a.x-7,y-10,b.x-a.x+14,20,beamColor,beam);
  if(type==='crane'||type==='bridge'){
   line(a.x,y-38,b.x,y-38,beamColor,5,beam);
   for(let xx=a.x;xx<b.x-1;xx+=45){const end=Math.min(xx+45,b.x);path(`M ${xx} ${y-10} L ${(xx+end)/2} ${y-38} L ${end} ${y-10}`,'none',beam,{'stroke-width':2});}
  }
  if(type==='sign'){
   const mid=point(state.length/2).x;line(mid-70,y,mid-70,y+38);line(mid+70,y,mid+70,y+38);rect(mid-100,y+38,200,55,'#e6d3a6');text(mid,y+72,'SUMMER FESTIVAL');anchors.set(0,{x:mid,y:y+64});
  }
  for(const m of state.masses){
   const q=point(m.position),color=palette[(m.id-1)%palette.length],canMove=allowed('mass',m.id,'position');
   const object=add(group,'g',{'data-drag':'mass','data-id':m.id,'data-scenario-object':m.label||'Load',class:canMove?'draggable':'',role:'img','aria-label':`${name(m.id)}: ${m.label}, ${fmt(m.kg,1)} kg${canMove?', drag to move':', fixed position'}`});
   add(object,'title',{},`${m.label} · ${fmt(m.kg,1)} kg${canMove?' · drag to move':''}`);
   let top=y-65,forceY=y-26;
   // Each object's centre line is the actual force application x coordinate.
   if(type==='book'&&m.id===1){
    rect(q.x-32,y-63,64,52,color,object);rect(q.x-26,y-55,51,34,'#fff5db',object);line(q.x-24,y-46,q.x+20,y-46,'#c4b799',2,object);line(q.x-24,y-37,q.x+20,y-37,'#c4b799',2,object);top=y-82;forceY=y-36;
   }else if(type==='wardrobe'&&m.id===1){
    const x=q.x,cy=y-108,cabinet=add(object,'g',{transform:'rotate(42.1 '+x+' '+cy+')'});rect(x-50,cy-100,100,200,'#b8a181',cabinet);rect(x-42,cy-91,39,182,'#cbb494',cabinet);rect(x+3,cy-91,39,182,'#cbb494',cabinet);circle(x-10,cy,3,'#526347',cabinet);circle(x+10,cy,3,'#526347',cabinet);circle(x,cy,5,'#b64223',object);text(x+14,cy-12,'Centre of mass',object,{'text-anchor':'start','font-size':12});top=y-235;forceY=cy;
   }else if(type==='seesaw'){
    rect(q.x-24,y-17,48,8,color,object);circle(q.x,y-74,14,'#e5b592',object);path(`M ${q.x} ${y-58} L ${q.x} ${y-28} L ${q.x+22} ${y-28} L ${q.x+22} ${y-7} M ${q.x} ${y-48} L ${q.x-19} ${y-27}`,'none',object,{stroke:color,'stroke-width':9,'stroke-linecap':'round'});top=y-103;forceY=y-45;
   }else if(type==='scales'){
    line(q.x,y+10,q.x-34,y+65,'#8a7257',2,object);line(q.x,y+10,q.x+34,y+65,'#8a7257',2,object);path(`M ${q.x-37} ${y+65} Q ${q.x} ${y+106} ${q.x+37} ${y+65} Z`,'#b8a181',object);
    if(m.id===1){for(const dx of [-16,0,16]){circle(q.x+dx,y+59,10,'#b64223',object);line(q.x+dx,y+50,q.x+dx+3,y+44,'#36715e',2,object);}}
    else{rect(q.x-18,y+37,36,30,color,object);path(`M ${q.x-8} ${y+37} Q ${q.x} ${y+20} ${q.x+8} ${y+37}`,'none',object);}
    top=y-44;forceY=y+58;
   }else if(type==='plank'&&m.id===1){
    rect(q.x-32,y-50,64,40,color,object);path(`M ${q.x-13} ${y-50} V ${y-61} H ${q.x+13} V ${y-50}`,'none',object);line(q.x-31,y-31,q.x+31,y-31,'#f5f2ea',2,object);top=y-83;
   }else if(type==='plank'&&m.id===2){
    path(`M ${q.x-25} ${y-48} L ${q.x-18} ${y-11} H ${q.x+18} L ${q.x+25} ${y-48} Z`,color,object);path(`M ${q.x-22} ${y-47} Q ${q.x} ${y-85} ${q.x+22} ${y-47}`,'none',object);top=y-88;
   }else if(type==='crane'&&m.id===1){
    line(q.x,y-40,q.x,y+65,'#526347',3,object);path(`M ${q.x} ${y+65} q 16 18 0 26`,'none',object);rect(q.x-27,y+92,54,42,color,object);line(q.x-27,y+92,q.x+27,y+134,'#d8ba8d',2,object);line(q.x+27,y+92,q.x-27,y+134,'#d8ba8d',2,object);top=y+181;forceY=y+112;
   }else if(type==='bridge'&&m.id===1){
    rect(q.x-33,y-53,66,32,color,object);circle(q.x-20,y-15,8,'#526347',object);circle(q.x+20,y-15,8,'#526347',object);line(q.x-28,y-54,q.x-28,y-68,'#526347',3,object);top=y-90;forceY=y-37;
   }else if(type==='mobile'){
    line(q.x,y+10,q.x,y+62,'#526347',2,object);
    if(m.id===1)path(`M ${q.x+14} ${y+63} A 25 25 0 1 0 ${q.x+14} ${y+111} A 23 23 0 0 1 ${q.x+14} ${y+63}`,color,object);
    else if(m.id===2)path(`M ${q.x} ${y+60} l 8 17 19 2 -14 13 4 19 -17 -9 -17 9 4 -19 -14 -13 19 -2 Z`,color,object);
    else{path(`M ${q.x-29} ${y+88} Q ${q.x} ${y+53} ${q.x+25} ${y+84} L ${q.x+39} ${y+80} L ${q.x+27} ${y+93} Q ${q.x} ${y+119} ${q.x-29} ${y+88}`,color,object);circle(q.x+17,y+83,2,'#f5f2ea',object);}
    top=y+145+(m.id===2?38:0);forceY=y+86;
   }else if(type==='camera'&&m.id===1){
    rect(q.x-35,y-59,60,42,'#526347',object);path(`M ${q.x+25} ${y-51} L ${q.x+48} ${y-63} V ${y-13} L ${q.x+25} ${y-25} Z`,'#74827c',object);rect(q.x-20,y-72,26,13,'#74827c',object);line(q.x,y-17,q.x,y-10,'#526347',5,object);top=y-92;forceY=y-38;
   }else if(type==='sign'&&m.id<=2){
    line(q.x,y+10,q.x,y+56,'#526347',2,object);path(`M ${q.x-12} ${y+65} Q ${q.x} ${y+45} ${q.x+12} ${y+65}`,'none',object);rect(q.x-24,y+65,48,51,color,object);rect(q.x-15,y+74,30,31,'#f1cf79',object);line(q.x,y+74,q.x,y+105,'#b18339',2,object);top=y+143;forceY=y+90;
   }else{
    // Paperweights and added ballast remain recognisable draggable weights.
    rect(q.x-25,y-49,50,38,color,object);path(`M ${q.x-10} ${y-49} Q ${q.x} ${y-68} ${q.x+10} ${y-49}`,'none',object);top=y-79;
   }
   // Transparent hit area grows the object target without changing its geometry.
   rect(q.x-30,Math.min(forceY-28,y-35),60,Math.max(56,Math.abs(forceY-y)+48),'transparent',object,{'stroke-width':0});
   text(q.x,top,`${name(m.id)} · ${m.label}`,object,{'font-size':14,fill:color,'font-weight':600});text(q.x,top+18,`${fmt(m.kg,1)} kg${canMove?' · drag':''}`,object,{'font-size':12});
   anchors.set(m.id,{x:q.x,y:forceY});
  }
  return {anchors};
 }
 window.MomentsScenes={render};
})();
