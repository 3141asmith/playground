'use strict';
// Resolution-independent illustrated rigs. Animation never changes simulation state.
class Frontier {
 constructor(canvas,getState){
  this.canvas=canvas;canvas.tabIndex=0;canvas.addEventListener('pointerdown',()=>canvas.focus({preventScroll:true}));
  this.ctx=canvas.getContext('2d');this.getState=getState;this.x=.27;this.y=0;this.vy=0;this.direction=0;this.velocity=0;
  this.scroll=0;this.scrollSpeed=0;this.clock=0;this.walk=0;this.gait=0;this.flash=0;this.aura=0;this.last=0;this.oldStep=-1;
  this.combatBlend=0;this.impactRings=[];this.damageTexts=[];this.dustTimer=0;this.hurt=0;this.lastHealth=null;
  this.critLabels=[];this.critSeen=getState()?.critSerial??0;
  this.sparks=[];this.bullets=[];this.death=null;this.enemyX=.9;this.enemyHit=0;this.shotTimer=.3;this.serial=0;this.paths=new Map();
  this.reduced=matchMedia('(prefers-reduced-motion: reduce)');this.resize=new ResizeObserver(()=>this.fit());this.resize.observe(canvas);this.fit();requestAnimationFrame(t=>this.frame(t));
 }
 fit(){const r=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);this.w=Math.max(1,r.width);this.h=Math.max(1,r.height);this.canvas.width=Math.round(this.w*d);this.canvas.height=Math.round(this.h*d);this.ctx.setTransform(d,0,0,d,0,0);this.ctx.lineCap='round';this.ctx.lineJoin='round';}
 clearInput(){this.direction=0;this.critSeen=this.getState()?.critSerial??0;this.critLabels=[];}
 shot(){const s=this.getState();if(s?.enemy)this.lastEnemyHitKey=s.steps+':'+s.enemy.hits;this.flash=.28;this.emitShot();}
 bomb(){const {ground,scale}=this.geometry();this.bullets.push({x:this.w*this.x+40*scale,y:ground-80*scale,tx:this.w*this.enemyX,ty:ground-44*scale,age:0,life:.45,tesla:false,kind:'bomb',color:'#ffbd65'});this.flash=.28;}
 pulse(i){this.aura=1;this.auraColor=['#e7bf67','#dce9d2','#a0dbaa','#a8cddd','#dda85e','#91dbef'][i];}
 damp(a,b,speed,dt){return a+(b-a)*(1-Math.exp(-speed*dt));}
 footPose(cycle,near,blend){const u=((cycle/(Math.PI*2)+(near?.5:0))%1+1)%1,stance=.58,v=u<stance?u/stance:(u-stance)/(1-stance);return {x:(u<stance?Math.cos(v*Math.PI):-Math.cos(v*Math.PI))*24*blend,y:-3-(u<stance?0:Math.pow(Math.sin(v*Math.PI),2)*23*blend)};}
 rand(){return (Math.sin(++this.serial*127.1)*43758.5453)%1*.5+.5;}
 rect(x,y,w,h,color){this.ctx.fillStyle=color;this.ctx.fillRect(x,y,w,h);}
 ellipse(x,y,rx,ry,color){const c=this.ctx;c.fillStyle=color;c.beginPath();c.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),0,0,Math.PI*2);c.fill();}
 circle(x,y,r,color){this.ellipse(x,y,r,r,color);}
 line(x,y,a,b,color,width=2){const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();}
 shape(d,fill,stroke='#10191e',width=1.3,cache=true){let p=cache?this.paths.get(d):null;if(!p){p=new Path2D(d);if(cache)this.paths.set(d,p);}const c=this.ctx;if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke(p);}}
 metal(x1,y1,x2,y2,dark='#514335',light='#c39c62'){const g=this.ctx.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,dark);g.addColorStop(.35,light);g.addColorStop(.55,'#8c734e');g.addColorStop(1,dark);return g;}
 glow(x,y,r,color){const g=this.ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#00000000');this.ctx.fillStyle=g;this.ctx.fillRect(x-r,y-r,r*2,r*2);}
 cog(x,y,r,angle,color){const c=this.ctx;c.save();c.translate(x,y);c.rotate(angle);c.beginPath();for(let i=0;i<48;i++){const a=i*Math.PI/24,rr=r*(i%4<2?1:.83);c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fillStyle=color;c.fill();this.circle(0,0,r*.62,'#182326');for(let i=0;i<5;i++){const a=i*Math.PI*2/5;this.line(0,0,Math.cos(a)*r*.67,Math.sin(a)*r*.67,color,r*.12);}this.circle(0,0,r*.2,'#c7ad78');this.circle(0,0,r*.08,'#273237');c.restore();}
 geometry(){return {ground:this.h-64,scale:Math.max(.4,Math.min(this.w<600?.91:1.24,(this.h-65)/170))};}
 appearance(s){
  const key=s.calling+JSON.stringify(s.gear);if(this.lookKey===key)return this.look;
  const [weapon,armour,trinket]=s.gear,n=weapon.name.toLowerCase(),a=armour.name.toLowerCase(),r=trinket.name.toLowerCase();
  const palette={common:{trim:'#bea273',light:'#ebd3a3',energy:'#efd39b'},rare:{trim:'#79b9d2',light:'#c1ebef',energy:'#a1e4ed'},epic:{trim:'#b99bd7',light:'#edcfff',energy:'#d8b3f1'},legendary:{trim:'#efbc55',light:'#ffebaa',energy:'#ffe38c'}};
  this.lookKey=key;this.look={avatar:Idle.classInfo(s).id,weapon:/staff|wand|sceptre/.test(n)?'magic':/bomb|grenade/.test(n)?'bomb':/blade|sword|dagger|axe/.test(n)?'blade':/carbine/.test(n)?'carbine':'pistol',armour:/mail/.test(a)?'mail':/vest/.test(a)?'vest':'coat',trinket:/compass/.test(r)?'compass':/regulator/.test(r)?'regulator':/\b(watch|chronometer|ring)\b/.test(r)?'watch':'charm',weaponColors:palette[weapon.rarity]||palette.common,armourColors:palette[armour.rarity]||palette.common,trinketColors:palette[trinket.rarity]||palette.common,studs:Math.min(3,Math.floor(armour.power/15))};
  return this.look;
 }
 emitShot(){
  const s=this.getState();if(!s||s.paused||Idle.phase(s)!==1)return;
  const look=this.appearance(s),{ground,scale}=this.geometry(),x=this.w*this.x+(look.weapon==='carbine'?96:65)*scale,y=ground-this.y-87*scale;
  this.bullets.push({x,y,tx:this.w*this.enemyX-12*scale,ty:ground-44*scale,age:0,life:.18,damage:s.bossFight?.lastDamage??s.enemy?.lastDamage??0,tesla:s.skills[5].active>0||look.weapon==='carbine',kind:look.weapon,color:look.weapon==='magic'?'#b8d5ff':look.weaponColors.energy});
  this.flash=.28;
 }
 burst(x,y,count=15){if(this.reduced.matches)return;for(let i=0;i<count;i++){const angle=this.rand()*Math.PI*2,v=30+this.rand()*110;this.sparks.push({x,y,vx:Math.cos(angle)*v,vy:Math.sin(angle)*v-65,life:.5+this.rand()*.7,max:1.2,size:1+this.rand()*3,angle:this.rand()*6,spin:this.rand()*8-4});}}
 frame(now){
  const dt=Math.min(.05,(now-(this.last||now))/1000);this.last=now;const s=this.getState();
  if(s&&!document.hidden&&!s.paused){
   this.clock+=dt;const phase=Idle.phase(s),motion=!this.reduced.matches;
   for(const event of s.critEvents??[])if(event.id>this.critSeen){const {ground,scale}=this.geometry();this.critLabels.push({x:this.w*(event.target==='player'?this.x:this.enemyX),y:ground-(event.target==='player'?110:100)*scale,age:0,target:event.target});this.critSeen=event.id;}
   for(const label of this.critLabels)label.age+=dt;this.critLabels=this.critLabels.filter(label=>label.age<1).slice(-12);
   const walking=phase!==1;
   this.walk=this.damp(this.walk,walking?1:0,7,dt);
   this.combatBlend=this.damp(this.combatBlend,phase===1?1:0,10,dt);
   this.scrollSpeed=this.damp(this.scrollSpeed,(phase===0?70:phase===1?16:50)*Idle.speed(s),3,dt);
   if(motion){this.scroll+=dt*this.scrollSpeed;this.gait+=dt*10*Math.min(1.5,Idle.speed(s)/1.8);}
   this.x=this.damp(this.x,.27,8,dt);this.y=0;this.vy=0;
   const elapsed=Math.max(0,(Date.now()-s.last)/1000),ratio=Math.min(1,(s.elapsed+elapsed*Idle.speed(s))/Idle.duration(s));
   this.enemyX=this.damp(this.enemyX,phase===0?1.06-.32*ratio:.74,12,dt);
   if(this.oldStep!==s.steps){
    if(this.oldStep>=0&&phase===2){this.death={x:this.enemyX,type:Math.floor((s.steps-1)/3)%3,age:0};this.burst(this.w*this.enemyX,this.geometry().ground-35,24);}
    if(phase===0){this.enemyX=1.06;this.death=null;}
    this.oldStep=s.steps;
   }
   if(phase===1&&!s.bossFight&&s.enemy){const key=s.steps+':'+s.enemy.hits;if(key!==this.lastEnemyHitKey){this.lastEnemyHitKey=key;if(s.enemy.hits>0&&motion)this.emitShot();}}
   this.flash=Math.max(0,this.flash-dt);this.aura=Math.max(0,this.aura-dt);this.enemyHit=Math.max(0,this.enemyHit-dt*5);
   const hp=s.bossFight?.health??null;if(hp!==null&&this.lastHealth!==null&&hp<this.lastHealth)this.hurt=.3;this.lastHealth=hp;this.hurt=Math.max(0,this.hurt-dt);
   for(const b of this.bullets){b.age+=dt;if(b.age>=b.life&&!b.hit){b.hit=true;this.enemyHit=1;this.burst(b.tx,b.ty,b.kind==='bomb'?16:5);if(motion){this.impactRings.push({x:b.tx,y:b.ty,age:0,color:b.color,bomb:b.kind==='bomb'});if(b.damage>0)this.damageTexts.push({x:b.tx,y:b.ty-25,age:0,damage:b.damage});}}}
   for(const label of this.damageTexts)label.age+=dt;this.damageTexts=this.damageTexts.filter(label=>label.age<.75).slice(-12);
   for(const ring of this.impactRings)ring.age+=dt;this.impactRings=this.impactRings.filter(r=>r.age<.4).slice(-12);
   this.dustTimer-=dt;if(motion&&this.walk>.6&&this.dustTimer<=0){const {ground}=this.geometry();this.sparks.push({x:this.w*this.x-10,y:ground,vx:-25,vy:-12,life:.35,max:.35,size:2,angle:0,spin:1});this.dustTimer=.22;}
   this.bullets=this.bullets.filter(b=>b.age<b.life+.08);
   if(this.death){this.death.age+=dt;if(this.death.age>1)this.death=null;}
   for(const p of this.sparks){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=190*dt;p.angle+=p.spin*dt;p.life-=dt;}
   this.sparks=this.sparks.filter(p=>p.life>0).slice(-90);
  }
  if(s&&!document.hidden)this.draw(s);requestAnimationFrame(t=>this.frame(t));
 }
 draw(s){
  const c=this.ctx,w=this.w,h=this.h,{ground:g,scale}=this.geometry(),t=this.reduced.matches?0:this.clock,environment=Idle.environment(s);
  c.save();c.lineCap='round';c.lineJoin='round';
  const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,environment.sky[0]);sky.addColorStop(.55,environment.sky[1]);sky.addColorStop(1,environment.sky[2]);c.fillStyle=sky;c.fillRect(0,0,w,h);
  this.glow(w*.79,h*.19,Math.min(h*.5,160),'#d2d8c426');this.circle(w*.79,h*.19,24,environment.moon);this.circle(w*.79-8,h*.19-5,23,environment.sky[0]);
  if(environment.id==='docks')this.docks(g,t);else if(environment.id==='highlands')this.highlands(g,t);else this.skyline(g,t);
  // Atmospheric haze lifts the characters away from the architecture.
  const fog=c.createLinearGradient(0,g-100,0,g);fog.addColorStop(0,'#b8ac8900');fog.addColorStop(1,environment.fog);c.fillStyle=fog;c.fillRect(0,g-100,w,100);
  this.walkway(g,t,environment);
  this.atmosphere(g,t,environment);
  const px=w*this.x,py=g-this.y,phase=Idle.phase(s);
  this.ellipse(px,g+4,23*scale*(1-this.y/500),5*scale,'#050e1499');
  if(this.aura>0){c.globalAlpha=this.aura;this.glow(px,py-65*scale,80*scale,this.auraColor+'45');c.globalAlpha=1;}
  const recoil=this.flash>0?Math.sin(this.flash/.28*Math.PI)*3:0;
  this.person(px,py,scale,t,phase,recoil,this.appearance(s));
  if(this.hurt>0&&!this.reduced.matches){c.globalAlpha=this.hurt*1.5;this.glow(px,py-70*scale,65*scale,'#ff795955');c.globalAlpha=1;}
  if(s.bossFight){const timer=s.bossFight.attackIn??3;c.font='bold 11px system-ui';c.textAlign='center';c.fillStyle=timer<.8?'#ff997f':'#e6c28b';c.fillText(timer<.8?'INCOMING ATTACK':'BOSS ATTACK IN '+Math.ceil(timer)+'s',w*.6,32);if(timer>2.65){const hit=(timer-2.65)/.35;this.line(w*this.enemyX,g-100*scale,px,py-75*scale,'#ff997f'+Math.round(hit*200).toString(16).padStart(2,'0'),3);this.glow(px,py-75*scale,45*scale,'#ff624433');}}
  const ex=w*this.enemyX;
  if(phase!==2){this.ellipse(ex,g+4,28*scale,5*scale,'#050e1488');if(s.bossFight)this.boss(ex,g,t,scale,Idle.sector(s));else this.enemy(ex,g,Idle.bossReady(s)?(Idle.sector(s)+4)%3:Math.floor(s.steps/3)%3,t,scale,this.enemyHit);if(phase===1)this.health(s,ex,g,scale);}
  if(this.death){const d=this.death,p=d.age; c.save();c.translate(w*d.x,g);c.rotate(Math.min(1,p*2)*.9);c.globalAlpha=Math.max(0,1-p*1.4);this.enemy(0,0,d.type,t,scale*(1-p*.2),0);c.restore();}
  this.projectiles();
  for(const label of this.critLabels){c.save();c.globalAlpha=Math.max(0,1-label.age);c.font='bold 19px Georgia';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#172027';const y=label.y-(this.reduced.matches?0:label.age*20);c.strokeText('crit',label.x,y);c.fillStyle=label.target==='player'?'#ff9c85':'#ffe09a';c.fillText('crit',label.x,y);c.restore();}
  for(const label of this.damageTexts){c.save();c.globalAlpha=Math.min(1,(.75-label.age)*3);c.font='bold 12px system-ui';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#14202b';const text='-'+label.damage.toFixed(1);c.strokeText(text,label.x,label.y-label.age*30);c.fillStyle='#ffe1a2';c.fillText(text,label.x,label.y-label.age*30);c.restore();}
  for(const ring of this.impactRings){const p=ring.age/.4;c.save();c.globalAlpha=(1-p)*(1-p);c.strokeStyle=ring.color;c.lineWidth=2*(1-p)+.5;c.beginPath();c.ellipse(ring.x,ring.y,5+p*(ring.bomb?42:20),4+p*(ring.bomb?30:15),0,0,Math.PI*2);c.stroke();c.restore();}
  for(const p of this.sparks){c.save();c.globalAlpha=Math.min(1,p.life*2);c.translate(p.x,p.y);c.rotate(p.angle);this.rect(-p.size/2,-p.size/2,p.size,p.size*.65,p.size>2?'#a98d5e':'#ffe0a1');c.restore();}
  if(phase===2){c.globalAlpha=.8;this.glow(ex,g-24,30,'#d8a74c28');this.cog(ex,g-17-Math.sin(t*2)*3,11,t*.4,'#c29b5b');c.font='10px system-ui';c.fillStyle='#e3c88d';c.textAlign='center';c.fillText('SALVAGE',ex,g-45);c.globalAlpha=1;}
  const vignette=c.createLinearGradient(0,0,w,0);vignette.addColorStop(0,'#07111b44');vignette.addColorStop(.15,'#07111b00');vignette.addColorStop(.85,'#07111b00');vignette.addColorStop(1,'#07111b44');c.fillStyle=vignette;c.fillRect(0,0,w,h);
  if(s.paused){this.rect(0,0,w,h,'#10161977');c.fillStyle='#e3c48b';c.font='16px Georgia';c.textAlign='center';c.fillText('ENGINE AT REST',w/2,h/2);}
  c.restore();
 }
 atmosphere(g,t,environment){
  const c=this.ctx,w=this.w;
  // Fixed world seeds keep the haze coherent as the camera moves.
  for(let i=0;i<11;i++){const x=((i*137.7-this.scroll*.18+Math.sin(t*.3+i)*12)%(w+80)+w+80)%(w+80)-40,y=g-25-((i*47)%Math.max(30,g-35))+Math.sin(t*.5+i*2)*6;c.globalAlpha=.035+(i%3)*.012;c.save();c.translate(x,y);c.scale(1,.3);this.glow(0,0,45+i%4*15,environment.id==='highlands'?'#e1e7ef99':'#c9c9ae99');c.restore();}
  c.globalAlpha=1;
  if(this.reduced.matches)return;
  for(let i=0;i<14;i++){const x=((i*83.1-this.scroll*.35+t*(environment.id==='highlands'?-7:3))%w+w)%w,y=(i*41+t*(environment.id==='highlands'?12:-8)+this.h*20)%this.h;c.globalAlpha=.12+(Math.sin(t+i)*.5+.5)*.2;this.circle(x,y,i%3===0?1.2:.65,environment.id==='foundry'?'#ecc88a':'#dce9ed');}c.globalAlpha=1;
 }
 skyline(g,t){
  const c=this.ctx,w=this.w,scroll=this.scroll;
  // World-indexed repetition prevents buildings changing shape at wrap boundaries.
  for(let i=Math.floor(scroll*.11/110)-1;i<(scroll*.11+w)/110+1;i++){
   const x=i*110-scroll*.11,bh=70+(Math.sin(i*4.23)+1)*50;
   this.rect(x,g-bh,91,bh,'#20303b');this.shape(`M${x-8} ${g-bh} Q${x+45} ${g-bh-30} ${x+98} ${g-bh}Z`,'#283843',null,1,false);
   this.rect(x+15,g-bh-55,10,53,'#263741');this.rect(x+12,g-bh-57,16,5,'#40505a');
   for(let j=0;j<4;j++)this.rect(x+12+j*19,g-bh+17,4,8,'#c6aa6333');
  }
  const ax=w*.55-scroll*.025%(w+200),ay=Math.max(45,g*.24);
  c.save();c.translate(ax,ay+Math.sin(t*.3)*3);const hull=c.createLinearGradient(0,-21,0,20);hull.addColorStop(0,'#83928b');hull.addColorStop(.5,'#52656a');hull.addColorStop(1,'#243a44');
  this.shape('M-78 0 C-60-28 45-28 76 0 C45 24-60 24-78 0Z',hull,'#82908366',1);for(let i=-2;i<=2;i++)this.shape(`M${i*20} -17 Q${i*22+8} 0 ${i*20} 16`,null,'#bdba9466',.6,false);
  this.shape('M-68-3 L-86-17 L-82 3 L-86 13 L-65 5Z','#3b5056','#78877b',.7);this.line(-43,12,-23,38,'#8a907a',.7);this.line(36,13,16,38,'#8a907a',.7);this.shape('M-28 33 L23 33 L13 43 L-19 42Z','#6c624d','#a2956b',1);this.line(-56,-1,61,-1,'#bcc0a044',.6);c.restore();
  for(let i=Math.floor(scroll*.33/235)-1;i<(scroll*.33+w)/235+1;i++){
   const x=i*235-scroll*.33,bh=80+(Math.sin(i*3.7)+1)*27,y=g-bh;
   const wall=c.createLinearGradient(x,y,x,g);wall.addColorStop(0,'#424342');wall.addColorStop(1,'#293339');this.rect(x,y,166,bh,wall);this.rect(x-4,y,174,5,'#8a7857');this.rect(x,y+7,166,3,'#242f34');
   // Faint brick courses and inset arched factory windows.
   for(let row=0;row<Math.ceil(bh/17);row++){const by=y+16+row*17;this.line(x,by,x+166,by,'#a18c6520',.7);for(let col=0;col<5;col++)this.line(x+col*37+(row%2?18:0),by-15,x+col*37+(row%2?18:0),by,'#a18c6517',.7);}
   for(let j=0;j<4;j++){c.save();c.translate(x+16+j*37,y+23);this.shape('M0 28 L0 6 Q9-6 18 6 L18 28Z','#171f25','#807254',1);const light=c.createLinearGradient(0,0,0,28);light.addColorStop(0,'#c59f60');light.addColorStop(1,'#7f633d');this.shape('M3 25 L3 7 Q9-1 15 7 L15 25Z',light,null);this.line(9,4,9,25,'#4c4d43',1.7);this.line(3,14,15,14,'#4c4d43',1.7);c.restore();}
   const stackX=x+117,stackY=y-75;this.rect(stackX,stackY,20,75,this.metal(stackX,0,stackX+20,0,'#3c4445','#7d8272'));this.rect(stackX-4,stackY-4,28,6,'#8c815f');for(let j=0;j<3;j++)this.line(stackX,stackY+18+j*18,stackX+20,stackY+18+j*18,'#a4987460',1);
   for(let j=0;j<5;j++){const age=(t*.17+j/5+(i%7)*.1)%1;c.globalAlpha=Math.sin(age*Math.PI)*.13;this.ellipse(stackX+10+age*28+Math.sin(t*.5+j)*7,stackY-9-age*100,10+age*27,12+age*21,'#c1c6b5');}c.globalAlpha=1;
   c.save();c.translate(x+186,g-5);this.shape('M0 0 L0-64 Q0-76 12-76 L31-76',null,'#17262d',11);this.shape('M0 0 L0-64 Q0-76 12-76 L31-76',null,'#927b55',7);this.shape('M-2 0 L-2-62 Q-2-74 12-74 L31-74',null,'#c3ad7566',1.5);this.cog(21,-25,21,t*.35,'#72694e');this.cog(49,-11,13,-t*.55,'#8b7955');c.restore();
  }
 }
 docks(g,t){
  const c=this.ctx,w=this.w,scroll=this.scroll,waterY=g-58;
  // Distant harbour, warehouses and the suspension cables of the skyrail.
  for(let i=Math.floor(scroll*.1/130)-1;i<(scroll*.1+w)/130+1;i++){const x=i*130-scroll*.1,h=55+(Math.sin(i*2.3)+1)*17;this.rect(x,g-h-35,103,h,'#203b48');this.shape(`M${x-8} ${g-h-35} L${x+50} ${g-h-62} L${x+110} ${g-h-35}Z`,'#294552',null,1,false);for(let j=0;j<5;j++)this.rect(x+9+j*18,g-h-16,6,10,'#d0b37655');}
  const sea=c.createLinearGradient(0,waterY,0,g);sea.addColorStop(0,'#567c7c');sea.addColorStop(1,'#173c4c');this.rect(0,waterY,w,g-waterY,sea);
  for(let row=0;row<7;row++){const y=waterY+8+row*7;for(let i=-1;i<w/85+2;i++){const x=i*85-scroll*.16%85+Math.sin(t*.7+row)*8;this.line(x,y,x+24+row*3,y,'#b4c9b52c',1);}}
  for(let i=Math.floor(scroll*.27/290)-1;i<(scroll*.27+w)/290+1;i++){
   const x=i*290-scroll*.27,top=g-175;
   this.shape(`M${x} ${g-30} L${x} ${top} L${x+13} ${top} L${x+13} ${g-30}Z`,this.metal(x,0,x+13,0,'#233e49','#7e8e87'),'#152f3d',1,false);
   this.shape(`M${x-7} ${top+5} L${x+104} ${top-28} L${x+108} ${top-16} L${x+6} ${top+17}Z`,'#526c6c','#9aab98',1,false);
   this.line(x+9,top+10,x+98,top-21,'#aebea0',1);for(let j=0;j<4;j++)this.line(x+22+j*20,top+1-j*5,x+33+j*20,top+8-j*6,'#a8b39b',1);
   this.line(x+98,top-18,x+98,g-77,'#192f3b',1);this.shape(`M${x+98} ${g-77} q-9 0-9 8 q0 8 8 3`,null,'#b8b791',3,false);
   // Cargo barge and warm portholes, gently rising with the water.
   c.save();c.translate(x+140,waterY+8+Math.sin(t*.8+i)*2);this.shape('M-54-2 L61-2 L44 15 L-38 14Z','#273f49','#9eaa92',1.3);this.rect(-22,-26,50,24,'#4c615e');this.rect(-12,-39,22,13,'#6c7770');this.rect(14,-40,8,14,'#344e55');for(let j=0;j<4;j++)this.circle(-24+j*19,5,2.2,'#d4bb7f');this.line(-42,-6,50,-6,'#b29a6b',1);c.restore();
  }
  // Near pier supports, ropes and stacked cargo.
  for(let i=Math.floor(scroll*.48/245)-1;i<(scroll*.48+w)/245+1;i++){const x=i*245-scroll*.48;this.rect(x,g-34,41,34,this.metal(x,0,x+41,0,'#473e32','#84775c'));this.rect(x+46,g-23,32,23,'#58645a');this.shape(`M${x+3} ${g-31} L${x+37} ${g-3} M${x+37} ${g-31} L${x+3} ${g-3}`,null,'#b3a37b',1,false);this.line(x+106,g,x+106,g-43,'#54717a',7);this.line(x+177,g,x+177,g-43,'#54717a',7);this.shape(`M${x+106} ${g-32} Q${x+142} ${g-10} ${x+177} ${g-32}`,null,'#b2ad82',2,false);}
 }
 highlands(g,t){
  const c=this.ctx,w=this.w,scroll=this.scroll;
  // Three mountain layers: angular ridges, snow caps and nearer rocky slopes.
  for(let layer=0;layer<3;layer++){
   const spacing=layer===0?300:230,offset=scroll*(.055+layer*.065),base=g-(layer===0?60:layer===1?18:0);
   for(let i=Math.floor(offset/spacing)-1;i<(offset+w)/spacing+1;i++){
    const x=i*spacing-offset,peak=base-(layer===0?210:layer===1?150:95)-(Math.sin(i*4.7)+1)*25;
    this.shape(`M${x-60} ${base} L${x+spacing*.45} ${peak} L${x+spacing+70} ${base}Z`,['#434d66','#536375','#63737c'][layer],null,1,false);
    if(layer<2)this.shape(`M${x+spacing*.45} ${peak} L${x+spacing*.65} ${peak+44} L${x+spacing*.46} ${peak+32} L${x+spacing*.39} ${peak+47} L${x+spacing*.26} ${peak+39}Z`,layer===0?'#c4c5d2':'#dddcd9',null,1,false);
   }
  }
  // Observatory towers and aerial pipelines built into the mountainside.
  for(let i=Math.floor(scroll*.24/370)-1;i<(scroll*.24+w)/370+1;i++){
   const x=i*370-scroll*.24,y=g-120;
   this.rect(x+26,y+20,56,100,this.metal(x+26,0,x+82,0,'#394a5a','#93a2a6'));this.shape(`M${x+17} ${y+21} Q${x+54} ${y-30} ${x+91} ${y+21}Z`,'#657a89','#c1c6bd',1.2,false);this.line(x+54,y-5,x+54,y+21,'#bbc2b5',1);
   this.rect(x+40,y+37,27,31,'#1e3949');this.rect(x+43,y+40,21,25,'#d7bc88');this.line(x+53,y+39,x+53,y+65,'#657c86',2);this.circle(x+54,y+88,11,'#c1c6b6');this.circle(x+54,y+88,8,'#334f61');this.line(x+54,y+88,x+58,y+81,'#d4d9c1',1.2);
   this.line(x+82,g-30,x+230,g-30,'#253c50',12);this.line(x+82,g-33,x+230,g-33,'#bdc6c1',3);for(let j=0;j<4;j++)this.line(x+100+j*33,g-36,x+100+j*33,g-24,'#6b8691',2);
  }
  // Frosted firs in the closest parallax layer.
  for(let i=Math.floor(scroll*.45/145)-1;i<(scroll*.45+w)/145+1;i++){
   const x=i*145-scroll*.45,height=65+(Math.sin(i*7.1)+1)*20;this.line(x,g,x,g-height,'#354c59',5);
   for(let j=0;j<3;j++){const y=g-height+j*18,r=14+j*9;this.shape(`M${x} ${y-12} Q${x-r*.4} ${y+1} ${x-r} ${y+16} Q${x} ${y+11} ${x+r} ${y+16}Z`,'#2c4e5b',null,1,false);this.shape(`M${x} ${y-12} L${x-r*.5} ${y+3} Q${x} ${y+6} ${x+r*.35} ${y+1}Z`,'#c3cecd',null,1,false);}
  }
  for(let i=0;i<24;i++){const x=((i*97+t*8-scroll*.04)%(w+40)+w+40)%(w+40)-20,y=((i*53+t*12)%(g+20)+g+20)%(g+20);this.circle(x,y,i%3===0?1.4:.7,'#edf0e185');}
 }
 walkway(g,t,environment){
  const c=this.ctx,w=this.w,scroll=this.scroll;
  const floor=c.createLinearGradient(0,g,0,this.h);floor.addColorStop(0,environment.floor[0]);floor.addColorStop(1,environment.floor[1]);this.rect(0,g,w,this.h-g,floor);this.rect(0,g,w,3,environment.id==='highlands'?'#dce1d8':'#c7aa71');this.rect(0,g+4,w,4,'#101b22');
  for(let i=Math.floor(scroll/60)-1;i<(scroll+w)/60+1;i++){const x=i*60-scroll;this.line(x,g+9,x-20,this.h,'#71807955',1);this.circle(x+18,g+1,1.5,'#ead39b');this.line(x+3,g+11,x+39,g+11,'#a69c7355',1);}
  this.line(0,this.h-10,w,this.h-10,'#827453',2);
  for(let i=Math.floor(scroll*.65/380)-1;i<(scroll*.65+w)/380+1;i++){
   const x=i*380-scroll*.65;c.save();c.translate(x,g);this.shape('M0 0 L0-129 Q0-145 15-145 L29-145',null,'#15232c',5);this.shape('M1-6 L1-127 Q1-142 15-142',null,'#7b7b6566',1);
   this.shape('M20-142 L37-142 L40-118 L17-118Z',this.metal(17,-140,40,-118,'#6a573c','#bf9c60'),'#17242a',1.5);this.rect(23,-137,10,15,'#f2d999');this.line(28,-137,28,-122,'#b38b47',1);this.glow(28,-127,49,'#ebba5c20');c.restore();
  }
 }
 // Two-bone inverse kinematics gives planted feet and bending knees.
 leg(hipX,hipY,footX,footY,near){
  const c=this.ctx,dx=footX-hipX,dy=footY-hipY,d=Math.min(53,Math.hypot(dx,dy)),a=Math.atan2(dy,dx),bend=Math.acos(Math.max(-1,Math.min(1,d/55)));
  const kx=hipX+27.5*Math.cos(a-bend),ky=hipY+27.5*Math.sin(a-bend);
  this.limb(hipX,hipY,kx,ky,near?12:11,near?'#625445':'#353e40',near?'#968369':'#5b655e');
  this.limb(kx,ky,footX,footY,9,near?'#343f44':'#242f34',near?'#697369':'#495953');
  this.circle(kx,ky,3.8,near?'#aa9260':'#686449');this.circle(kx,ky,1.6,'#25363b');
  c.save();c.translate(footX,footY);c.rotate(Math.max(-.3,Math.min(.12,(footY+3)*.012)));this.shape('M-6-11 Q-1-14 5-10 L6-3 Q11-2 14 2 L14 5 L-7 5 Q-9 0-6-11Z',this.metal(-7,-8,11,7,'#1b292f',near?'#6c6555':'#46504b'),'#0d1b22',1.2);this.shape('M-7 3 Q4 5 14 3',null,'#ac9772',1);this.line(-3,-7,5,-6,'#c0a16c',1);c.restore();
 }
 limb(ax,ay,bx,by,width,dark,light){const c=this.ctx,len=Math.hypot(bx-ax,by-ay);c.save();c.translate(ax,ay);c.rotate(Math.atan2(by-ay,bx-ax)-Math.PI/2);const gradient=c.createLinearGradient(-width/2,0,width/2,0);gradient.addColorStop(0,dark);gradient.addColorStop(.55,light);gradient.addColorStop(1,dark);this.shape(`M${-width*.5} 2 Q0-5 ${width*.5} 2 L${width*.35} ${len-2} Q0 ${len+3} ${-width*.35} ${len-2}Z`,gradient,'#17242a',1,false);c.restore();}
 person(x,y,scale,t,phase,recoil,look){
  const c=this.ctx,walking=this.reduced.matches?0:this.walk,cycle=this.gait,combat=this.combatBlend??(phase===1?1:0),far=this.footPose(cycle,false,walking),near=this.footPose(cycle,true,walking);
  const bob=-walking*(1.7+Math.sin(cycle*2-.4)*1.5)+(this.reduced.matches?0:Math.sin(t*2.2)*.65),coatSwing=(Math.sin(cycle-.8)*6+Math.sin(cycle*2-1.2)*2)*walking;
  c.save();c.translate(x-recoil*scale,y);c.scale(scale,scale);
  this.leg(-6,-49+bob,far.x-5,far.y,false);
  this.leg(5,-49+bob,near.x+6,near.y,true);
  c.translate(0,bob);c.rotate(walking*.085+Math.sin(cycle-.3)*walking*.012-recoil*.006);
  // Wind-lifted split coat tails, lining and stitched hem.
  const trim=look.armourColors.trim,light=look.armourColors.light;
  if(look.armour==='coat'){
   const tail=this.metal(-25,-72,19,-34,'#26373d','#655e4d');
   this.shape(`M-14-75 Q-20-52 ${-27-coatSwing}-31 Q-12-25 -2-39 L7-63 L18-32 Q9-25 0-32 L-5-52Z`,tail,'#101f27',1.6,false);
   this.shape(`M-18-56 Q-20-42 ${-24-coatSwing}-33 L-12-34 Q-6-44-5-55`,null,trim,1,false);
  }
  // Back arm swings during walking, braces the weapon in combat.
  {const swing=Math.sin(cycle+.3)*walking,elbowX=(-19+swing*10)*(1-combat)+4*combat,handX=(-17+swing*18)*(1-combat)+36*combat,handY=-52-31*combat;this.limb(-10,-94,elbowX,-71+2*combat,10,'#273b43','#82735a');this.limb(elbowX,-71+2*combat,handX,handY,8,'#394950','#b0925b');this.ellipse(handX,handY,4.7,5,'#7c684e');}
  // Fitted jacket with sculpted shoulders and leather lapels.
  const coat=this.metal(-18,-96,17,-54,look.armour==='mail'?'#344853':look.armour==='vest'?'#42312e':'#26373e',look.armour==='mail'?'#a1b6b4':look.armour==='vest'?'#a38465':'#807257');
  this.shape('M-7-103 Q-19-100-19-88 L-13-68 L-14-53 Q-1-47 12-53 L11-77 Q18-91 10-100 L3-104Z',coat,'#0e2029',1.7);
  this.shape('M-8-101 L-1-87 L-7-74 L-13-96Z',trim,'#354046',1);this.shape('M2-101 L10-97 L4-84 L-1-87Z',light,'#354046',1);
  this.shape('M-1-84 L-1-55',null,trim,1);for(let j=0;j<3;j++)this.circle(3,-78+j*8,1.1,light);
  // Edge stitching and softer specular highlights give the cloth some weight.
  this.shape('M-16-91 Q-13-83-10-77 M8-95 Q12-88 8-79 M-12-55 Q0-51 10-55',null,'#e0d4ac38',.8);
  this.shape('M-10-82 Q-6-77-8-70 M6-72 L9-67',null,'#101e2944',1.6);
  this.shape('M-15-61 Q0-57 13-61 L12-54 Q-1-50-14-54Z','#372e29','#13232a',1);this.shape('M-2-61 L6-61 L6-54 L-2-54Z','#b89a60','#ead29b',.7);
  this.shape('M-15-75 L-7-75 L-7-67 Q-12-64-15-68Z','#3e443e','#a58c5b',.7);
  if(look.armour==='mail'){
   this.shape('M-13-91 Q0-96 12-89 L10-70 Q-1-65-13-72Z',this.metal(-14,-90,12,-68,'#354952','#9dafad'),trim,1.3);
   for(let row=0;row<3;row++)this.shape(`M-12 ${-85+row*6} Q0 ${-80+row*6} 11 ${-85+row*6}`,null,'#dae4d473',1,false);
   this.shape('M-18-99 Q-28-98-23-86 L-12-86 L-9-94Z',this.metal(-23,-99,-9,-85,'#344851','#aab9b4'),trim,1.4);
   this.shape('M8-99 Q23-100 23-86 L10-85 L5-93Z',this.metal(6,-100,22,-85,'#344851','#aab9b4'),trim,1.4);
   for(let i=0;i<3;i++)this.circle(12+i*3,-93,1,light);
  }else if(look.armour==='vest'){
   this.shape('M-14-95 L-9-91 L-12-77 L-18-80Z','#c1b59a','#3a4545',1);this.shape('M9-95 Q18-92 15-78 L9-78Z','#c1b59a','#3a4545',1);
   this.shape('M-12-66 Q0-61 11-66 L12-54 Q-2-49-14-55Z','#5b3e32',trim,1);this.shape('M-11-59 L9-59',null,'#b6946b',.7);
  }
  for(let i=0;i<look.studs;i++)this.circle(-11+i*5,-60,1.6,light);
  // Compact boiler pack with curved pressure hose.
  this.shape('M-23-95 Q-29-94-28-84 L-26-68 Q-22-63-17-68 L-17-91Z',this.metal(-28,0,-16,0,'#4e493c','#b59965'),'#172932',1.3);this.line(-27,-86,-18,-86,'#d4b986',1);this.circle(-23,-77,3.8,'#ddc18a');this.circle(-23,-77,2.6,'#203d45');this.line(-23,-77,-22,-79,'#c8e6d7',.7);
  this.shape('M-22-94 C-29-111-9-115-8-100',null,'#1a2a30',5);this.shape('M-22-94 C-29-111-9-115-8-100',null,'#a28b59',2.2);
  this.trinket(look);
  const ribbon=Math.sin(cycle-.9)*walking*5+(this.reduced.matches?0:Math.sin(t*3)*1.5);
  this.shape(`M-7-104 Q-19-100 -30-108 Q-35 ${-110+ribbon} -44 ${-104+ribbon} L-35 ${-99+ribbon} Q-24-96 -7-100Z`,look.avatar==='mage'?'#68668b':look.avatar==='warrior'?'#9a5643':'#927143','#192831',.9,false);
  this.shape(`M-16-102 Q-27-101 -39 ${-103+ribbon}`,null,look.avatar==='mage'?'#bab5db66':'#dbb48b66',.8,false);
  // Neck, collar and an actual facial profile: brow, nose, lips and jaw.
  this.shape('M-5-110 L-5-99 L4-95 L9-102 L7-113Z','#a98c69','#172630',1);
  this.shape('M-7-127 C-15-123-14-112-10-107 L-5-102 Q4-99 10-106 L12-111 L17-113 Q19-115 14-117 L12-125 Q7-133-7-127Z',this.metal(-12,-126,15,-103,'#7a6655','#c0a27a'),'#16252d',1.1);
  this.shape('M-13-121 Q-17-131-9-135 Q6-140 11-129 L7-124 L-3-127 L-8-116Z','#302e2a','#18252b',1);this.ellipse(-9,-115,3.2,4.4,'#b49a76');this.shape('M-10-117 Q-7-118-8-112',null,'#695b4c',.8);
  this.shape('M7-109 L12-109 M3-106 Q7-104 10-107',null,'#645447',.8);this.shape('M-5-107 Q2-100 8-105',null,'#594b3e',1);
  // Riveted top hat and tinted, brass-rimmed goggles.
  if(look.avatar==='mage'){this.shape('M-17-124 Q-20-146 -3-166 Q7-148 13-126 L4-130 L-10-126Z','#48445f',trim,1.5);this.glow(0,-145,14,'#a1bdf033');this.shape('M-22-89 Q-18-53 -35-33 L-16-39 L-5-82Z','#39384e',trim,1.2);}else if(look.avatar==='warrior'){this.shape('M-15-128 Q-13-148 4-145 Q17-139 15-122 L7-118 L5-130 L-9-126Z',this.metal(-14,-144,15,-122,'#34454e','#b6bbaf'),trim,1.5);this.shape('M-5-144 Q-13-153 -21-145 L-13-136Z','#a55e43',trim,1);}else{
  this.shape('M-13-134 L-14-150 Q-3-155 9-150 L12-133Z',this.metal(-15,-150,10,-128,'#1d2d35','#58615b'),'#10212b',1.6);
  this.shape('M-14-139 Q-1-135 11-139 L12-134 Q-1-131-13-134Z',trim,light,.7);
  this.shape('M-19-133 Q-2-129 17-132 Q20-127 11-127 L-12-127 Q-23-128-19-133Z',this.metal(0,-134,0,-126,'#514638','#c5a66e'),'#12242c',1.1);
  this.line(-10,-120,12,-119,'#6e5133',4);this.ellipse(9,-119,6,5,trim);this.ellipse(10,-119,4,3.3,'#26444e');this.ellipse(10.5,-120,2.2,1.6,light);this.line(8,-121,10,-121.5,'#e7f5dc',.9);this.circle(-5,-120,1.4,light);
  }
  // Forearm bracer, glove and a machined rivet pistol.
  this.limb(10,-94,17-recoil*.3,-76,11,'#35424a','#897456');this.limb(17-recoil*.3,-76,34-recoil*.6,-84,9,'#5b6256','#c2a26b');
  c.save();c.translate(33-recoil*.6,-85+Math.sin(cycle+.5)*walking*1.7);c.rotate(look.weapon==='blade'?-.55+combat*.2+Math.sin(recoil*.7)*.8:.16*(1-combat)-recoil*.035);
  if(look.weapon==='magic'){this.line(4,8,36,-20,look.weaponColors.trim,5);this.circle(36,-20,8,'#698dbd');this.glow(36,-20,18,'#aacfff66');this.shape('M30-26 L36-36 L42-26 L36-16Z','#d7e7ff',look.weaponColors.trim,1);}else if(look.weapon==='bomb'){this.circle(10,-3,12,'#344a4f');this.circle(10,-3,8,look.weaponColors.trim);this.line(10,-15,17,-21,'#be9d5f',2);this.glow(17,-21,9,'#ffbf5555');this.circle(17,-21,2,'#ffce75');}
  else if(look.weapon==='blade')this.blade(look.weaponColors);
  else if(look.weapon==='carbine')this.carbine(look.weaponColors);
  else {
  this.shape('M-4-3 L5-3 L5 6 L0 12 L-5 9Z','#70563e','#17262c',1.2);this.shape('M-5-8 L24-8 L29-5 L30 1 L3 3 L-6 0Z',this.metal(0,-9,0,3,'#465555','#c0ae7d'),'#17272e',1.3);
  this.shape('M13-7 L33-7 L36-4 L35 0 L14 0Z',this.metal(0,-8,0,1,'#303f47','#a0aca0'),'#14272f',1);this.ellipse(35,-3.5,2.2,3.6,'#bfa269');this.ellipse(35.7,-3.5,1,2,'#1b2c33');
  this.circle(6,-3,6,look.weaponColors.trim);this.circle(6,-3,3.5,'#4c5c5c');for(let j=0;j<4;j++)this.circle(6+Math.cos(j*Math.PI/2)*4,-3+Math.sin(j*Math.PI/2)*4,.7,look.weaponColors.light);this.line(18,-9,25,-9,look.weaponColors.trim,1);this.line(27,-10,27,-7,'#a1ad9a',1.4);
  }
  this.shape('M-8-1 Q-5-7-1-3 L3 3 L0 8 L-5 6Z','#6c5943','#233138',1);this.shape('M-3 1 L1 3 M-4 3 L0 5',null,'#ad9470',.7);c.restore();c.restore();
 }
 trinket(look){
  const {trim,light,energy}=look.trinketColors;
  if(look.trinket==='regulator'){
   this.shape('M-30-97 Q-36-96-35-85 L-33-60 Q-27-56-22-62 L-24-91Z',this.metal(-36,0,-22,0,'#3d4b4b',trim),'#172d35',1.3);
   this.line(-35,-86,-25,-87,trim,2);this.line(-34,-67,-24,-68,trim,2);this.circle(-28,-79,6.2,trim);this.circle(-28,-79,4.5,'#e1d8b6');this.line(-28,-79,-25,-82,'#704a38',1.3);this.shape('M-29-96 C-37-116-14-121-10-99',null,trim,2);
  }else if(look.trinket==='compass'){
   this.shape('M-5-91 Q-4-81 8-73',null,trim,1.3);this.circle(10,-70,8,trim);this.circle(10,-70,6.1,'#213c45');this.shape('M10-76 L12-70 L10-64 L8-70Z',energy,null);this.shape('M4-70 L10-72 L16-70 L10-68Z',light,null);this.circle(10,-70,1,'#dfe5c6');this.glow(10,-70,13,energy+'24');
  }else if(look.trinket==='watch'){
   this.shape('M-8-72 Q1-47 11-66',null,trim,1.1);this.circle(11,-68,6.2,trim);this.circle(11,-68,4.5,'#e0d6ae');this.line(11,-68,11,-71,'#273b40',.9);this.line(11,-68,14,-67,'#273b40',.9);this.circle(11,-75,1.7,trim);
  }else {this.shape('M-7-95 Q-3-77 6-80',null,trim,1);this.shape('M6-83 L11-78 L6-72 L2-78Z',energy,trim,1.3);}
 }
 carbine(colors){
  this.shape('M-15-7 Q-19-4-16 3 L-5 5 L2-2Z','#5b4232','#14272f',1.4);
  this.shape('M-5-9 L25-9 L33-5 L30 2 L1 3 L-4 9 L-8 7Z',this.metal(0,-10,0,3,'#3a4c56','#a6b4a7'),'#162e39',1.4);
  this.shape('M25-6 L61-6 L64-3 L62 1 L27 1Z',this.metal(0,-7,0,2,'#293e4c','#a1b8b7'),'#172a36',1);
  for(let i=0;i<5;i++){this.ellipse(28+i*6,-3,2,6,colors.trim);this.line(28+i*6,-7,28+i*6,-.5,colors.light,.7);}
  this.circle(8,-4,5,colors.trim);this.circle(8,-4,3,'#2b4752');this.circle(8,-4,1.8,colors.energy);this.line(9,-11,20,-11,colors.trim,2);this.ellipse(62,-3,2,4,colors.trim);this.glow(51,-3,13,colors.energy+'22');
 }
 blade(colors){
  this.shape('M-7-3 L5-3 L6 3 L-7 4 Q-12 0-7-3Z','#554030',colors.trim,1.1);
  this.shape('M4-10 Q12-9 12-4 L12 8 L6 10 L7-8Z',colors.trim,'#142c37',1.2);
  this.shape('M12-5 Q39-15 65-9 L55-1 Q35 4 12 3Z',this.metal(0,-11,0,4,'#3b5865','#b8d5cf'),'#14303c',1.4);
  this.shape('M14 1 Q41 0 63-8',null,colors.energy,2);this.line(16,-6,42,-9,colors.trim,1);this.circle(11,-2,3,colors.trim);this.shape('M-1-5 L0-10 L9-10 L11-5Z',this.metal(-1,0,11,0,'#4b5651',colors.trim),'#203841',1);
 }
 enemy(x,y,type,t,scale=1,hit=0){
  const c=this.ctx;c.save();c.translate(x+hit*3,y);c.scale(scale*(1-hit*.035),scale*(1+hit*.025));c.rotate(Math.sin(t*18)*hit*.035);
  if(type===0)this.rat(t);else if(type===1)this.spider(t);else this.sentinel(t);
  if(hit>0){c.globalAlpha=hit*.6;this.glow(-8,-36,30,'#f3c37d70');c.globalAlpha=1;}c.restore();
 }
 rat(t){
  const c=this.ctx;
  this.shape('M23-27 C47-17 37-51 57-42 C69-37 60-22 72-20',null,'#152730',5);this.shape('M23-27 C47-17 37-51 57-42 C69-37 60-22 72-20',null,'#a68a57',2.3);
  for(let j=0;j<4;j++){const q=t*9+j*Math.PI*.85,xx=(j<2?-16:13),yy=-20;this.limb(xx,yy,xx+Math.sin(q)*9,-10,5,'#394747','#ac925e');this.line(xx+Math.sin(q)*9,-10,xx+Math.sin(q)*12-5,Math.min(0,-Math.max(0,Math.cos(q))*5),'#b49b68',3);}
  this.shape('M-30-19 Q-34-38-14-48 C6-59 33-44 32-26 Q28-12 3-15Z',this.metal(-25,-48,22,-15,'#434945','#b69b64'),'#142730',1.8);
  this.shape('M-15-46 Q1-32 29-34 M-1-48 Q15-35 29-34',null,'#e2c58b',1);this.shape('M-16-45 Q-9-32-14-18 M4-49 Q12-33 8-17',null,'#5c644f',1.2);
  for(let j=0;j<4;j++)this.circle(-13+j*11,-26,1.5,'#e3c688');
  this.shape('M-24-33 Q-41-44-47-29 L-57-23 L-48-17 L-28-18Z',this.metal(-48,-37,-29,-16,'#434b49','#bc9e68'),'#152b35',1.5);
  this.shape('M-31-36 Q-43-59-49-41 Q-48-35-39-32Z','#8d815e','#1b3039',1.3);this.shape('M-37-39 Q-42-48-45-41Z','#cfad72',null);
  this.circle(-42,-28,4.5,'#352f29');this.circle(-43,-28,2.5,'#e6a46b');this.circle(-44,-29,1,'#ffe1a0');this.ellipse(-55,-22,3,2.5,'#283d45');
  this.shape('M-48-19 L-53-16 M-45-18 L-47-14',null,'#d4bf86',.7);
 }
 spider(t){
  const c=this.ctx;
  for(let layer=0;layer<2;layer++){
   for(let i=0;i<3;i++)for(const side of [-1,1]){
    if((side===1?1:0)!==layer)continue;const p=t*5.5+i*2+side,baseX=side*11,baseY=-34,elbowX=side*(28+i*7),elbowY=-50+i*7+Math.sin(p)*4,footX=side*(43+i*9)+Math.sin(p)*5,footY=-Math.max(0,Math.cos(p))*8;
    this.limb(baseX,baseY,elbowX,elbowY,5,'#35484c','#b8a26c');this.limb(elbowX,elbowY,footX,footY,3.7,'#34484f','#87977f');this.circle(elbowX,elbowY,3.3,'#c9ad70');this.circle(elbowX,elbowY,1.4,'#2c444b');this.line(footX,footY,footX-side*6,footY+1,'#b4b58b',2);
   }
   if(layer===0){this.ellipse(0,-33,24,20,this.metal(-24,-52,24,-14,'#38494a','#b5a174'));this.shape('M-17-46 Q2-55 18-43 L14-28 Q0-20-15-30Z',this.metal(0,-51,0,-24,'#56594c','#d1b77a'),'#293e45',1.4);this.shape('M0-50 L0-24 M-16-36 L16-36',null,'#6e7860',1);this.circle(0,-35,7,'#283f48');this.circle(0,-35,4,'#a6d2bf');this.glow(0,-35,14,'#b7e9d030');}
  }
  this.ellipse(-15,-24,13,8,'#5d7068');for(let j=0;j<3;j++){this.circle(-23+j*7,-25,3,'#343e3b');this.circle(-23+j*7,-25,1.7,'#e6aa6d');}this.shape('M-25-18 L-31-12 L-29-8 M-15-17 L-20-10 L-18-7',null,'#c9b579',2);
 }
 sentinel(t){
  const c=this.ctx,walk=Math.sin(t*3.2)*6;
  this.limb(-11,-47,-15+walk,-23,13,'#334950','#7f8d7b');this.limb(-15+walk,-23,-17+walk,0,10,'#35474b','#a08e63');this.limb(12,-47,16-walk,-23,13,'#425256','#a5a179');this.limb(16-walk,-23,18-walk,0,10,'#3c4e52','#b1a875');
  this.shape('M-24-7 L-9-7 L-6 3 L-28 3Z','#566761','#142c36',1.6);this.shape('M10-7 L24-7 L29 3 L8 3Z','#798573','#142c36',1.6);
  this.limb(-25,-81,-36,-55,12,'#3d5359','#a59e76');this.limb(-36,-55,-37,-33,11,'#3b4e51','#c0a775');this.circle(-37,-32,7,'#697b71');
  this.shape('M-20-91 Q0-104 22-90 L27-58 Q20-39 0-42 Q-22-41-27-58Z',this.metal(-27,-90,25,-42,'#3b5159','#aab08d'),'#142a35',2);
  this.shape('M-18-88 Q0-98 19-86 L21-69 Q0-62-21-69Z','#526b70','#bdbe91',1);this.circle(0,-61,15,'#203f49');this.cog(0,-61,12,-t*.7,'#b8aa71');this.circle(0,-61,5,'#a4d3bc');this.glow(0,-61,18,'#bbf2c835');
  this.ellipse(-25,-84,10,11,this.metal(-33,-94,-16,-75,'#43565d','#bfaf7b'));this.ellipse(25,-84,10,11,this.metal(16,-94,34,-75,'#43565d','#bfaf7b'));
  this.shape('M-15-119 Q0-128 15-119 L17-99 Q2-90-16-99Z',this.metal(-16,-122,16,-96,'#3d535c','#b1ad81'),'#152e39',1.8);this.shape('M-12-114 Q0-118 13-113 L12-107 Q0-105-12-108Z','#283f47','#9caa8b',1);this.line(-8,-111,9,-111,'#f0c07f',2);this.shape('M-7-101 L-7-98 M0-102 L0-97 M7-101 L7-98',null,'#3f595c',1.2);
  this.limb(27,-82,34,-59,12,'#405962','#b6b18b');this.limb(34,-59,28,-36,10,'#48616a','#d1bd85');this.circle(28,-34,7,'#7f8976');
 }
 boss(x,y,t,scale,sector){
  const c=this.ctx,accent=['#ed9b62','#81c2d6','#b3e1bd','#ef9f7a','#c9b1ed','#ffe39c'][sector];c.save();c.translate(x,y);c.scale(scale*1.36,scale*1.36);
  this.glow(0,-70,55,accent+'25');this.sentinel(t*.7);
  this.shape('M-18-121 L-23-139 L-9-132 L0-145 L9-132 L23-139 L18-121Z',this.metal(-20,-140,20,-120,'#735536',accent),'#182f3a',1.5);
  this.circle(0,-61,8,'#24333b');this.circle(0,-61,5,accent);this.line(-8,-111,9,-111,accent,3);
  for(const side of [-1,1]){this.shape(`M${side*27}-90 L${side*38}-100 L${side*33}-78Z`,accent,'#233742',1,false);this.line(side*25,-79,side*30,-51,accent,2);}
  c.restore();
 }
 health(s,x,g,scale){const c=this.ctx,ratio=Idle.progress(s),max=Idle.enemyHP(s),y=Math.max(46,g-(s.bossFight?214:151)*scale);
  c.font='10px system-ui';c.textAlign='center';c.fillStyle='#dfd1ac';c.fillText(Idle.foe(s),x,y-8);this.rect(x-36,y,72,4,'#0a1721');this.rect(x-36,y,72*Math.max(0,1-ratio),4,'#d4aa69');c.font='9px system-ui';c.fillText(Math.ceil(max*(1-ratio))+' / '+Math.ceil(max)+' HP',x,y+15);
 }
 projectiles(){
  const c=this.ctx;
  for(const b of this.bullets){
   const p=Math.min(1,b.age/b.life),x=b.x+(b.tx-b.x)*p,y=b.y+(b.ty-b.y)*p;
   if(b.kind==='magic'){const bend=Math.sin(p*Math.PI)*12;for(let j=3;j>0;j--){const f=Math.max(0,p-j*.065);c.globalAlpha=(1-j/4)*.5;this.circle(b.x+(b.tx-b.x)*f,b.y+(b.ty-b.y)*f-Math.sin(f*Math.PI)*12,5-j,b.color);}c.globalAlpha=1;this.glow(x,y-bend,18,b.color+'66');this.circle(x,y-bend,4,b.color);this.circle(x+1,y-bend-1,1.8,'#f4f4ff');}else if(b.kind==='bomb'){const arc=-Math.sin(Math.min(1,p)*Math.PI)*45;this.circle(x,y+arc,7,'#263b43');this.circle(x,y+arc,4,b.color);this.line(x,y+arc-6,x+3,y+arc-12,'#ffc37d',2);if(p>=1)this.glow(b.tx,b.ty,30,'#ffb35b88');}else if(b.kind==='blade'){if(p<1){c.save();c.translate(x,y);c.rotate(Math.atan2(b.ty-b.y,b.tx-b.x));c.globalAlpha=1-p*.65;this.shape('M0-20 Q19 0 0 20 Q9 0 0-20Z',b.color,null);this.glow(4,0,18,b.color+'35');c.restore();}}
   else if(b.tesla){c.save();c.globalAlpha=Math.max(0,1-b.age/(b.life+.08));c.beginPath();c.moveTo(b.x,b.y);for(let i=1;i<=9;i++){const f=i/9;c.lineTo(b.x+(b.tx-b.x)*f,b.y+(b.ty-b.y)*f+Math.sin(i*7+this.clock*30)*6);}c.strokeStyle=b.color;c.lineWidth=3;c.stroke();c.strokeStyle='#e2f5d8';c.lineWidth=1;c.stroke();c.restore();}
   else if(p<1){this.line(x-(b.tx-b.x)*.12,y-(b.ty-b.y)*.12,x,y,b.color,1.4);this.glow(x,y,7,b.color+'70');this.circle(x,y,1.8,'#fff2c2');}
   if(b.age<.06&&b.kind!=='blade'){const f=1-b.age/.06;c.save();c.globalAlpha=f;this.glow(b.x,b.y,20,b.color+'70');c.translate(b.x,b.y);this.shape('M0 0 L8-4 L6-1 L16 0 L7 2 L9 5Z',b.color,null);c.restore();}
  }
 }
}
