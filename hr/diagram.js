(()=>{
 'use strict';
 const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg',stars=window.HR_CATALOGUE;
 const colours={O:'#88acff',B:'#a9c7ff',A:'#e2ecff',F:'#fff2c4',G:'#ffd878',K:'#ffa75c',M:'#f57760',L:'#dba17f',T:'#a78ac5',Y:'#c974b1',D:'#e8e7ff','?':'#90aaa8'};
 const classes={I:'Supergiant',II:'Bright giant',III:'Giant',IV:'Subgiant',V:'Main-sequence dwarf'};
 const plot=$('plot'),bounds={left:88,right:880,top:38,bottom:556},maxRadius=Math.max(...stars.map(s=>s.radius)),smallScreen=matchMedia('(max-width:560px)');
 function layout(){bounds.left=smallScreen.matches?70:88;bounds.right=smallScreen.matches?470:880;plot.setAttribute('viewBox',smallScreen.matches?'0 0 500 640':'0 0 920 640');}layout();
 let visible=stars,domain={hot:50000,cool:200,low:-8,high:6};
 const x=t=>bounds.left+(Math.log10(domain.hot)-Math.log10(t))/Math.log10(domain.hot/domain.cool)*(bounds.right-bounds.left);
 const y=l=>bounds.bottom-(Math.log10(l)-domain.low)/(domain.high-domain.low)*(bounds.bottom-bounds.top);
 const dotRadius=r=>$('size-mode').value==='linear'?36*r/maxRadius:3+5*Math.log10(1+r);
 const format=n=>n.toLocaleString('en-GB',{maximumSignificantDigits:3});
 function node(tag,attrs={},text){const n=document.createElementNS(NS,tag);for(const [key,value]of Object.entries(attrs))n.setAttribute(key,value);if(text!==undefined)n.textContent=text;return n;}
 function label(text,xx,yy,attrs={}){axes.append(node('text',{x:xx,y:yy,class:'axis',...attrs},text));}
 const axes=node('g',{id:'axes'});plot.append(axes);
 function drawAxes(){axes.replaceChildren();
 for(let e=domain.low;e<=domain.high;e++){
  const yy=y(10**e);axes.append(node('line',{x1:bounds.left,x2:bounds.right,y1:yy,y2:yy,stroke:'#2b3b48','stroke-width':1}));
  label(e< -3?'10^'+e:e<0?String(10**e):(10**e).toLocaleString('en-GB'),bounds.left-13,yy+4,{'text-anchor':'end'});
 }
 const ticks=smallScreen.matches?(domain.cool===2000?[50000,20000,7000,3000,2000]:[50000,10000,2000,500,200]):(domain.cool===2000?[50000,30000,20000,10000,7000,5000,3000,2000]:[50000,20000,10000,5000,2000,1000,500,200]);
 for(const t of ticks){const xx=x(t);axes.append(node('line',{x1:xx,x2:xx,y1:bounds.top,y2:bounds.bottom,stroke:'#2b3b48','stroke-width':1}));label(t.toLocaleString('en-GB'),xx,bounds.bottom+25,{'text-anchor':'middle'});}
 label('Effective temperature / K',(bounds.left+bounds.right)/2,613,{class:'axis-title','text-anchor':'middle'});
 label('HOTTER ←',bounds.left,613,{'font-size':10});label('→ COOLER',bounds.right,613,{'text-anchor':'end','font-size':10});
 label('Luminosity / L☉',23,298,{class:'axis-title','text-anchor':'middle',transform:'rotate(-90 23 298)'});
 label('SUPERGIANTS',x(12000),y(500000),{class:'region'});label('GIANTS',x(3200),y(200),{class:'region','text-anchor':'middle'});label('MAIN SEQUENCE',x(11000),y(.3),{class:'region'});
 if(domain.cool<2000){label('WHITE DWARFS',x(22000),y(.0005),{class:'region'});label('BROWN DWARFS',x(1000),y(.000001),{class:'region','text-anchor':'middle'});}
 }
 const sun=stars.find(s=>s.source==='catalogue'&&s.name==='Sol');
 const sunReference=node('g',{id:'sun-reference','pointer-events':'none',role:'img','aria-label':'Sun reference: '+format(sun.temperature)+' kelvin and one solar luminosity'});plot.append(sunReference);
 function drawSunReference(){const xx=x(sun.temperature),yy=y(sun.luminosity);sunReference.replaceChildren(node('line',{id:'sun-temperature',x1:xx,x2:xx,y1:bounds.top,y2:bounds.bottom}),node('line',{id:'sun-luminosity',x1:bounds.left,x2:bounds.right,y1:yy,y2:yy}),node('circle',{cx:xx,cy:yy,r:6,fill:'none'}),node('text',{x:bounds.right-8,y:yy-9,'text-anchor':'end'},'Sun · '+format(sun.temperature)+' K · 1 L☉ (catalogue)'));}
 const group=node('g',{id:'stars'});plot.append(group);
 // Large circles first; smaller templates remain reachable on top.
 for(const s of [...stars].sort((a,b)=>b.radius-a.radius)){
  const g=node('g',{class:'point',tabindex:0,role:'button','aria-label':s.name+', '+s.type+', '+format(s.temperature)+' kelvin, '+format(s.luminosity)+' solar luminosities, '+format(s.radius)+' solar radii','data-id':s.id,transform:`translate(${x(s.temperature)} ${y(s.luminosity)})`});
  g.append(node('circle',{class:'hit',r:8,fill:'transparent'}),node('circle',{class:'star',fill:colours[s.group]}),node('circle',{class:'halo'}));
  g.addEventListener('focus',()=>select(s));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(s);}});
  group.append(g);s.element=g;
 }
 for(const [type,colour]of Object.entries(colours)){const el=document.createElement('span');el.className='swatch';const swatch=document.createElement('i');swatch.style.background=colour;el.append(swatch,document.createTextNode(type));$('spectral-legend').append(el);}

 let selected=null,animation=null,animationFrame=0;
 function position(s,xx,yy){s.plotX=xx;s.plotY=yy;s.element.setAttribute('transform',`translate(${xx} ${yy})`);}
 function select(s){if(selected)selected.element.classList.remove('selected');selected=s;s.element.classList.add('selected');$('template').value=s.id;const eso=s.source==='eso';$('star-kind').textContent=eso?'ESO · TEMPLATE '+s.number:'STELLAR CATALOG · NAMED OBJECT';$('star-name').textContent=s.name;$('star-type').textContent=s.type;$('star-description').textContent=eso?classes[s.luminosityClass]+'. Representative properties from the Pickles spectral library.':(s.category||'Stellar object')+'. Temperature: '+s.temperatureMethod+'; luminosity: '+s.luminosityMethod+'.';$('star-temperature').textContent=format(s.temperature)+' K';$('star-luminosity').textContent=format(s.luminosity)+' L☉';$('radius-label').textContent=s.radiusMethod==='derived'?'Derived radius':'Catalogue radius';$('star-radius').textContent=format(s.radius)+' R☉';$('star-class').textContent=s.luminosityClass?s.luminosityClass+' · '+classes[s.luminosityClass]:'Not listed';$('star-abundance').textContent=s.abundance;$('star-mbol').textContent=eso?s.mbol.toFixed(1)+' mag':'Not listed';$('star-file').textContent=eso?'ESO spectrum: '+s.id+'.dat.gz':'Catalogue ID: '+s.catalogueId+(s.aliases.length?' · Also known as '+s.aliases.slice(0,5).join(', '):'');$('star-source').href=eso?'https://www.eso.org/sci/facilities/paranal/decommissioned/isaac/tools/lib.html':s.url;$('star-source').textContent=eso?'Open ESO spectral library ↗':'Open Stellar Catalog entry ↗';}
 function filter(){finishAnimation();const source=$('dataset').value,query=$('search').value.trim().toLowerCase();const sourceStars=stars.filter(s=>source==='all'||s.source===source);visible=sourceStars.filter(s=>[s.name,s.type,...(s.aliases||[])].some(v=>v.toLowerCase().includes(query)));domain=source==='eso'?{hot:50000,cool:2000,low:-3,high:6}:{hot:50000,cool:200,low:-8,high:6};drawAxes();drawSunReference();const ids=new Set(visible.map(s=>s.id));for(const s of stars){s.element.style.display=ids.has(s.id)?'':'none';position(s,x(s.temperature),y(s.luminosity));}const options=visible.map(s=>{const option=document.createElement('option');option.value=s.id;option.textContent=s.name+' · '+(s.source==='eso'?'ESO template':s.type);return option;});$('template').replaceChildren(...options);$('template').disabled=!visible.length;$('animate').disabled=!visible.length;$('point-count').textContent=visible.length+' points';$('tooltip').hidden=true;$('star-details').hidden=!visible.length;if(visible.length)select(visible.includes(selected)?selected:visible.find(s=>s.name==='Sol')||visible[0]);}
 const coverage=window.HR_COVERAGE;$('coverage').textContent=coverage.plottedNamedObjects+' named objects + '+coverage.esoTemplates+' ESO templates. Partial catalogue import: '+coverage.completedPages.toLocaleString('en-GB')+' of '+coverage.indexPages.toLocaleString('en-GB')+' linked pages retrieved; source rate-limited further requests. '+coverage.omittedObjects+' objects lack sufficient data. Snapshot: '+coverage.retrieved+'.';
 $('dataset').addEventListener('change',filter);$('search').addEventListener('input',filter);smallScreen.addEventListener('change',()=>{layout();filter();});
 function sizes(){for(const s of stars){const r=dotRadius(s.radius);s.element.querySelector('.star').setAttribute('r',r);s.element.querySelector('.halo').setAttribute('r',Math.max(5,r)+3);s.element.querySelector('.hit').setAttribute('r',Math.max(8,r));}const linear=$('size-mode').value==='linear';$('size-note').textContent=linear?'Dot radius is directly proportional to stellar radius. Dwarfs become tiny; hover near them or use the template selector.':'A compressed radius scale keeps small stars visible. Larger dots mean larger stellar radii.';const key=$('size-key');key.replaceChildren();for(const [i,r]of (linear?[10,100,1000]:[1,10,100,1000]).entries()){const xx=42+i*(linear?115:85);key.append(node('circle',{cx:xx,cy:27,r:dotRadius(r),fill:'#748a80',stroke:'#526347','stroke-width':.5}),node('text',{x:xx,y:68,'text-anchor':'middle',fill:'#686a60','font-size':10},r+' R☉'));}}
 $('size-mode').addEventListener('change',()=>{sizes();$('tooltip').hidden=true;});$('template').addEventListener('change',()=>{select(stars.find(s=>s.id===$('template').value));$('tooltip').hidden=true;});
 function nearest(e){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(plot.getScreenCTM().inverse());let best=null,distance=Infinity;for(const s of visible){const d=Math.hypot(p.x-s.plotX,p.y-s.plotY);if(d<=Math.max(9,dotRadius(s.radius))&&d<distance){best=s;distance=d;}}return best;}
 plot.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const s=nearest(e),tip=$('tooltip');if(!s){tip.hidden=true;return;}select(s);tip.replaceChildren();const title=document.createElement('strong');title.textContent=s.name+' · '+(classes[s.luminosityClass]||s.type);tip.append(title,document.createTextNode(format(s.temperature)+' K · '+format(s.luminosity)+' L☉'),document.createElement('br'),document.createTextNode(format(s.radius)+' R☉ · '+s.abundance));tip.hidden=false;const rect=$('plot-wrap').getBoundingClientRect();tip.style.left=Math.max(8,Math.min(e.clientX-rect.left+14,rect.width-tip.offsetWidth-8))+'px';tip.style.top=Math.max(8,Math.min(e.clientY-rect.top+14,rect.height-tip.offsetHeight-8))+'px';});
 plot.addEventListener('pointerleave',()=>{$('tooltip').hidden=true;});plot.addEventListener('click',e=>{const s=nearest(e);if(s)select(s);});
 function finishAnimation(){cancelAnimationFrame(animationFrame);const wasPlaying=Boolean(animation);animation=null;plot.dataset.animationStage='diagram';axes.style.opacity='1';sunReference.style.display='';$('animate').textContent='Animate';$('animate').setAttribute('aria-pressed','false');$('tooltip').hidden=true;for(const s of visible)position(s,x(s.temperature),y(s.luminosity));if(wasPlaying)$('animation-status').textContent='H–R diagram: hotter to the left, more luminous towards the top.';}
 function animate(){
  if(animation){finishAnimation();return;}
  if(!visible.length)return;
  $('tooltip').hidden=true;$('animate').textContent='Skip animation';$('animate').setAttribute('aria-pressed','true');axes.style.opacity='.25';sunReference.style.display='none';
  // Scatter within the plotting area; these are illustrative positions, not sky coordinates.
  animation={elapsed:0,last:0,stage:'',points:visible.map(s=>({s,startX:s.plotX,startY:s.plotY,skyX:bounds.left+28+Math.random()*(bounds.right-bounds.left-56),skyY:bounds.top+28+Math.random()*(bounds.bottom-bounds.top-56)}))};
  const messages={scatter:'Mixing the stars into an illustrative night sky…',sky:'A scattered sky: random positions, not actual sky coordinates.',temperature:'Move left / right by temperature: hotter left, cooler right.',aligned:'Temperature sorted. Next, arrange the stars by luminosity.',luminosity:'Move up / down by luminosity: brighter up, fainter down.'};
  const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  function frame(now){
   if(!animation)return;const a=animation;if(a.last&&!document.hidden)a.elapsed+=Math.min(now-a.last,100);a.last=now;const t=a.elapsed;
   if(t>=7000){finishAnimation();return;}
   const stage=t<1000?'scatter':t<2000?'sky':t<4200?'temperature':t<4800?'aligned':'luminosity';
   if(stage!==a.stage){a.stage=stage;plot.dataset.animationStage=stage;$('animation-status').textContent=messages[stage];}
   for(const p of a.points){let xx=p.skyX,yy=p.skyY;if(t<1000){const f=ease(t/1000);xx=p.startX+(p.skyX-p.startX)*f;yy=p.startY+(p.skyY-p.startY)*f;}else if(t>=2000){xx=p.skyX+(x(p.s.temperature)-p.skyX)*ease((t-2000)/2200);if(t>=4800)yy=p.skyY+(y(p.s.luminosity)-p.skyY)*ease((t-4800)/2200);}position(p.s,xx,yy);}
   animationFrame=requestAnimationFrame(frame);
  }
  frame(performance.now());
 }
 $('animate').addEventListener('click',animate);
 document.addEventListener('visibilitychange',()=>{if(animation)animation.last=0;});
 sizes();filter();
 window.stellarAtlas={stars,colours,x,y,dotRadius,get selected(){return selected;}};
})();
