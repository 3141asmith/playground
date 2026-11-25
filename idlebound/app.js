'use strict';
const $=id=>document.getElementById(id),key='idlebound-save-v1';let state=null,noticeTimeout,pendingReturn=null,background=null;
function notice(message){clearTimeout(noticeTimeout);$('notice').textContent=message;const inDialog=$('options-message');if(inDialog)inDialog.textContent=message;if(message)noticeTimeout=setTimeout(()=>$('notice').textContent='',6000);}
try{
 const saved=localStorage.getItem(key);
 if(saved){state=Idle.upgrade(JSON.parse(saved));state.paused=false;const now=Date.now(),away=Math.max(0,now-state.last)/1000;const report=Idle.catchUp(state,away);if(away>=30)pendingReturn=report;state.last=now;save();}
}catch{state=null;notice('Could not load the saved adventure. Start a new hero, or import a backup after starting.');}
function save(){if(!state)return;try{localStorage.setItem(key,JSON.stringify(state));}catch{notice('Device storage is unavailable. Export your save before closing.');}}
function text(id,value){$(id).textContent=value;}
function time(seconds){const n=Math.ceil(seconds);return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');}
function elapsedTime(seconds){const n=Math.floor(Math.max(0,seconds)),days=Math.floor(n/86400),hours=Math.floor(n%86400/3600),minutes=Math.floor(n%3600/60),rest=n%60;return [days?days+'d':'',hours?hours+'h':'',minutes?minutes+'m':'',!days&&!hours?rest+'s':''].filter(Boolean).join(' ')||'0s';}
const returnDialog=document.createElement('dialog');returnDialog.id='return-dialog';returnDialog.className='game-dialog';returnDialog.setAttribute('aria-labelledby','return-title');
const returnHeading=document.createElement('h2');returnHeading.id='return-title';returnHeading.textContent='Welcome back, artificer.';
returnHeading.tabIndex=-1;returnHeading.setAttribute('autofocus','');
const returnHeader=document.createElement('div');returnHeader.className='section-head';const returnDismiss=document.createElement('button');returnDismiss.className='quiet';returnDismiss.textContent='Close ×';returnDismiss.setAttribute('aria-label','Close return summary');returnDismiss.onclick=()=>returnDialog.close();returnHeader.append(returnHeading,returnDismiss);
const returnIntro=document.createElement('p');returnIntro.className='hint';returnIntro.textContent='The machinery kept turning while you were away.';
const returnTime=document.createElement('p');returnTime.id='return-time';const returnCap=document.createElement('p');returnCap.className='hint';returnCap.id='return-cap';
const returnStats=document.createElement('dl');returnStats.id='return-stats';const returnEquipment=document.createElement('div');returnEquipment.id='return-equipment';
const returnBoss=document.createElement('p');returnBoss.className='hint';returnBoss.id='return-boss';const returnSaved=document.createElement('p');returnSaved.className='hint';returnSaved.textContent='These gains are already saved. Your adventure continues while this report is open.';
const returnClose=document.createElement('button');returnClose.id='continue-adventure';returnClose.textContent='Continue adventure';returnClose.onclick=()=>returnDialog.close();
returnDialog.append(returnHeader,returnIntro,returnTime,returnCap,returnStats,returnEquipment,returnBoss,returnSaved,returnClose);document.body.append(returnDialog);
function showReturn(report){
 scene.clearInput();returnTime.textContent='Time away: '+elapsedTime(report.away);returnCap.textContent='Progress credited: '+elapsedTime(report.credited)+(report.away>43200?' (12-hour offline limit).':'.');
 returnStats.replaceChildren(...[['Steam Gems','+'+(report.steamGems??0)],['Gold earned','+'+report.gold.toLocaleString(undefined,{maximumFractionDigits:2})],['XP earned','+'+report.xp.toLocaleString()],['Levels gained','+'+report.levels+' (Lv '+report.fromLevel+' → '+report.toLevel+')'],['Skill points','+'+report.skillPoints],['Enemies defeated',report.kills],['Contracts completed',report.quests],['Loot found',report.loot],['Upgrades equipped',report.upgrades],['Items salvaged',report.sold]].map(([label,value])=>{const box=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;box.append(dt,dd);return box;}));
 const h=document.createElement('h3');h.textContent='Equipment upgrades';returnEquipment.replaceChildren(h);
 if(!report.equipment.length){const p=document.createElement('p');p.className='hint';p.textContent='No changes to your equipped items.';returnEquipment.append(p);}
 for(const item of report.equipment){const row=document.createElement('div');row.className='return-gear';const slot=document.createElement('small');slot.textContent=item.slot;const name=document.createElement('strong');name.className=item.after.rarity;name.textContent=item.after.name+' · '+item.after.rarity;const detail=document.createElement('span');detail.className='hint';detail.textContent=item.before.name+' (+'+item.before.power+') → +'+item.after.power+' power';row.append(slot,name,detail);returnEquipment.append(row);}
 returnBoss.textContent=report.bossPending?report.bossPending+' awaits. The final stage was farmed while the sector exit remained locked.':'';
 if(!returnDialog.open)returnDialog.showModal();returnDialog.scrollTop=0;returnHeading.focus({preventScroll:true});
}
const scene=new Frontier($('scene'),()=>state);
for(const c of Object.values(Idle.classes)){
 const card=document.createElement('label');card.className='avatar-card';
 const radio=document.createElement('input');radio.type='radio';radio.name='avatar';radio.value=c.name;radio.checked=c.name==='Mage';radio.onchange=()=>{$('calling').value=c.name;};
 const portrait=document.createElement('canvas');portrait.width=120;portrait.height=170;portrait.setAttribute('aria-hidden','true');
 const title=document.createElement('strong');title.textContent=c.name;const detail=document.createElement('span');detail.textContent=c.description;card.append(radio,portrait,title,detail);$('avatar-picker').append(card);
 // Preview the same illustrated equipment and avatar used in the running scene.
 const preview=Object.create(Frontier.prototype);preview.ctx=portrait.getContext('2d');preview.paths=new Map();preview.reduced={matches:true};preview.walk=0;preview.gait=0;preview.y=0;
 preview.person(48,160,.92,0,0,0,preview.appearance(Idle.fresh('Preview',c.name)));
}
const bossButton=document.createElement('button');bossButton.id='challenge-boss';bossButton.hidden=true;$('scene').parentElement.append(bossButton);
const playerHealth=document.createElement('div');playerHealth.id='player-health';playerHealth.hidden=true;playerHealth.innerHTML='<label for="healthbar">Your health <span id="healthtext"></span></label><progress id="healthbar" max="100" value="100"></progress>';$('activity').before(playerHealth);
bossButton.onclick=()=>{tick();if(state.bossFight){Idle.leaveBoss(state);state.control=false;}else{state.control=true;Idle.startBoss(state);}scene.clearInput();save();render();$('scene').focus({preventScroll:true});};
const treeToggle=document.createElement('button');treeToggle.id='open-tree';treeToggle.className='quiet';treeToggle.setAttribute('aria-haspopup','dialog');$('mode').parentElement.prepend(treeToggle);
treeToggle.onclick=()=>{tick();scene.clearInput();render();$('talent-dialog').showModal();};$('close-tree').onclick=()=>$('talent-dialog').close();
// Keep the adventure on one screen; move the existing live panels into dialogs.
const menu=document.createElement('nav');menu.id='game-menu';menu.setAttribute('aria-label','Game panels');document.querySelector('.toolbar').after(menu);
const detailsGrid=document.querySelector('#game > .grid');
function panelDialog(id,title,content){
 const dialog=document.createElement('dialog');dialog.id=id+'-dialog';dialog.className='game-dialog';dialog.setAttribute('aria-labelledby',id+'-title');
 const heading=document.createElement('div');heading.className='section-head';const h=document.createElement('h2');h.id=id+'-title';h.textContent=title;
 const close=document.createElement('button');close.className='quiet';close.textContent='Close ×';close.setAttribute('aria-label','Close '+title);close.onclick=()=>dialog.close();heading.append(h,close);dialog.append(heading,...content);document.body.append(dialog);
 const button=document.createElement('button');button.id='open-'+id;button.className='quiet';button.textContent=title;button.setAttribute('aria-haspopup','dialog');button.onclick=()=>{tick();scene.clearInput();dialog.showModal();};menu.append(button);return dialog;
}
panelDialog('character','Character',[detailsGrid.querySelector('aside > .panel')]);
const gemSummary=document.createElement('p');gemSummary.id='steam-gems';gemSummary.className='gem-summary';document.querySelector('#character-dialog .panel').append(gemSummary);
panelDialog('inventory','Inventory',[detailsGrid.querySelector('.equipment')]);
document.querySelector('#inventory-dialog .equipment .hint').textContent+=' Equipped weapons, armour and trinkets change your character’s appearance. Rarity changes their trim and energy colours.';
panelDialog('journal','Journal',[detailsGrid.querySelector('article > .panel:last-child')]);
panelDialog('contracts','Contracts',[detailsGrid.querySelector('article > .panel')]);
detailsGrid.remove();menu.append(treeToggle);
const saveControls=document.createElement('div');saveControls.className='save-controls';saveControls.append($('export'),$('import').parentElement);
const optionsMessage=document.createElement('p');optionsMessage.id='options-message';optionsMessage.setAttribute('role','status');optionsMessage.className='hint';
panelDialog('options','Save & options',[saveControls,optionsMessage,document.querySelector('footer')]);
const shopIntro=document.createElement('p');shopIntro.className='hint';shopIntro.textContent='The Brassmarket Exchange sells masterwork class equipment and permanent upgrades. Equipment equips immediately. Perks have 10 ranks; each rank doubles the next price. Your adventure continues while you browse.';
const shopBalance=document.createElement('p');shopBalance.id='shop-balance';
const shopStatus=document.createElement('p');shopStatus.id='shop-status';shopStatus.className='hint';shopStatus.setAttribute('role','status');
const shopGrid=document.createElement('div');shopGrid.id='shop-offers';
panelDialog('shop','Shop',[shopIntro,shopBalance,shopStatus,shopGrid]);
const shopRows=Idle.shopOffers(Idle.fresh('Shop','Artificer')).map(offer=>{const row=document.createElement('article');row.className='shop-offer';const name=document.createElement('h3'),description=document.createElement('p'),price=document.createElement('p'),button=document.createElement('button');description.className='hint';button.id='buy-'+offer.id;button.onclick=()=>{tick();if(Idle.buyShop(state,offer.id)){save();render();shopStatus.textContent='Purchased '+name.textContent+'.';}else shopStatus.textContent=state.bossFight?'Finish or retreat from the boss fight before buying.':'Purchase unavailable. Check your gold and upgrade rank.';};row.append(name,description,price,button);shopGrid.append(row);return {name,description,price,button};});
const hud=document.createElement('span');hud.id='hud';document.querySelector('.toolbar').prepend(hud);
const hudGroup=document.createElement('span');hudGroup.id='hud-group';hud.replaceWith(hudGroup);hudGroup.append(hud);
const bossGate=document.createElement('button');bossGate.id='boss-gate';bossGate.hidden=true;
bossGate.innerHTML='<svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true"><path d="M5 5l5 3 6-6 6 6 5-3-3 9H8z" fill="currentColor"/><rect x="7" y="16" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 16v-3a5 5 0 0110 0v3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="22" r="2" fill="currentColor"/><path d="M16 23v3" stroke="currentColor" stroke-width="2"/></svg>';
bossGate.onclick=()=>{if(!state.bossFight)bossButton.click();else $('scene').focus({preventScroll:true});};hudGroup.append(bossGate);
const healthSummary=document.createElement('p');healthSummary.id='health-summary';healthSummary.className='hint';document.querySelector('#inventory-dialog .equipment').append(healthSummary);
const talentNodes=[];
for(const [branch,title] of [['speed','Clockwork efficiency'],['gold','Guild prosperity'],['health','Vitality engineering'],['crit','Critical precision']]){
 const section=document.createElement('section');section.className='talent-branch';const h=document.createElement('h3');h.textContent=title;section.append(h);
 for(const talent of Idle.talents.filter(t=>t.branch===branch)){
  const node=document.createElement('article');node.className='talent-node';node.id='talent-'+talent.id;
  const heading=document.createElement('h4');heading.textContent=talent.name;const effect=document.createElement('p');effect.className='hint';effect.textContent=(branch==='crit'?'+1 percentage point ':'+1% ')+(branch==='speed'?'idle progression speed':branch==='health'?'maximum health':branch==='crit'?'critical-hit chance':'all gold earned')+' per rank.';
  const ranks=document.createElement('span');ranks.className='talent-ranks';const requirement=document.createElement('p');requirement.className='hint';const button=document.createElement('button');button.onclick=()=>{tick();if(Idle.train(state,talent.id)){save();render();}};
  node.append(heading,effect,ranks,requirement,button);section.append(node);talentNodes.push({talent,node,ranks,requirement,button});
 }
 $('talent-branches').append(section);
}
$('scene').parentElement.append($('controls'));
$('controls').querySelector('p').id='scene-help';
$('scene').setAttribute('aria-describedby','scene-help');
const skillButtons=Idle.skills.map((skill,i)=>{
 const b=document.createElement('button');b.className='skill';b.id='skill-'+skill.id;
 const symbol=document.createElement('span');symbol.className='symbol';symbol.textContent=skill.icon;
 const name=document.createElement('b');name.textContent=skill.name;
 const effect=document.createElement('small');effect.className='effect';effect.textContent=['Gold ×2 · 60s','Speed +50% · 30s','Luck +20% · 60s','XP +50% · 45s','Salvage ×2 · 60s','Combat ×3 · 20s'][i];
 const status=document.createElement('small'),hotkey=document.createElement('span'),meter=document.createElement('span');hotkey.className='key';hotkey.textContent=i+1;meter.className='timer';
 b.append(symbol,name,effect,status,hotkey,meter);b.onclick=()=>useSkill(i);$('skills').append(b);return {button:b,status,meter,symbol,name,effect};
});
function useSkill(i){if(!state)return;tick();if(Idle.activate(state,i)){scene.pulse(i);if(i===4&&Idle.classInfo(state).id==='artificer')scene.bomb();save();render();notice(Idle.classSkills(state)[i].name+': '+Idle.classSkills(state)[i].description);}}
let lastGear='',lastLog='';
function render(){
 if(!state)return;
 $('welcome').hidden=true;$('game').hidden=false;document.body.classList.add('adventuring');
 const s=state;
 text('hero',s.name);text('class',Idle.classInfo(s).name+' | '+Idle.classInfo(s).description);text('level','Level '+s.level);text('xp',s.xp+' / '+Idle.needed(s)+' XP');$('xpbar').value=s.xp/Idle.needed(s)*100;
 for(const k of ['gold','kills','quests'])text(k,s[k].toLocaleString());text('power',Math.round(Idle.power(s)*10)/10);
 text('gold',(s.gold+s.goldDust/100).toLocaleString(undefined,{maximumFractionDigits:2}));
 text('steam-gems','Steam Gems: '+(s.steamGems??0).toLocaleString()+' | '+(Idle.gemsUnlocked(s)?'Earn 1-2 per boss victory. Saved for future prestige.':'Unlock at stage 30. Saved for future prestige.'));
 text('shop-balance','Steam Gems: '+(s.steamGems??0).toLocaleString()+' (future prestige) | Available: '+(s.gold+s.goldDust/100).toLocaleString(undefined,{maximumFractionDigits:2})+' gold');
 Idle.shopOffers(s).forEach((offer,i)=>{const row=shopRows[i];row.name.textContent=offer.name;row.description.textContent=offer.description+(offer.rank!==undefined?' Rank '+offer.rank+'/10.':'');row.price.textContent=offer.maxed?'Fully upgraded':offer.price.toLocaleString()+' gold';row.button.disabled=offer.maxed||s.gold<offer.price||!!s.bossFight||s.paused;row.button.textContent=offer.maxed?'Mastered':s.bossFight?'Boss fight active':s.gold<offer.price?'Need '+(offer.price-s.gold).toLocaleString()+' more gold':offer.item?'Buy & equip':'Buy rank '+(offer.rank+1);});
 hud.textContent='S'+(Idle.sector(s)+1)+'.'+Idle.stage(s)+' · Lv '+s.level+' · '+Math.floor(s.gold).toLocaleString()+'g';
 if(Idle.bossReady(s))hud.textContent='S'+(Idle.sector(s)+1)+'.'+Idle.stage(s)+' · Lv '+s.level;
 bossGate.hidden=!Idle.bossReady(s);bossGate.disabled=s.paused;bossGate.classList.toggle('fighting',!!s.bossFight);
 const gateLabel=s.bossFight?'Boss fight active: '+Idle.foe(s)+'. Use manual attacks.':'Boss required: defeat '+Idle.bosses[Idle.sector(s)]+' to unlock the next sector. Click to take control and fight. Idle play will farm the final stage.';
 bossGate.title=gateLabel;bossGate.setAttribute('aria-label',gateLabel);
 treeToggle.textContent='Skill tree · '+s.skillPoints+' pt'+(s.skillPoints===1?'':'s');text('tree-points',s.skillPoints+' skill point'+(s.skillPoints===1?'':'s')+' available');text('tree-summary','Idle speed +'+Idle.bonus(s,'speed')+'% · Gold +'+Idle.bonus(s,'gold')+'% | Health +'+Idle.bonus(s,'health')+'%');
 for(const {talent,node,ranks,requirement,button} of talentNodes){
  const r=s.talents[talent.id]??0,locked=talent.parent&&s.talents[talent.parent]<5,cost=Idle.talentCost(s,talent.id);
  ranks.textContent='Rank '+r+' / 5 · +'+r+'%';node.classList.toggle('talent-locked',!!locked);node.classList.toggle('talent-maxed',r===5);
  requirement.textContent=locked?'Requires '+Idle.talents.find(t=>t.id===talent.parent).name+' rank 5':r===5?'Fully upgraded':s.skillPoints<cost?'Need '+(cost-s.skillPoints)+' more point'+(cost-s.skillPoints===1?'':'s'):'Ready to upgrade';
  button.disabled=!Idle.canTrain(s,talent.id);button.textContent=r===5?'Mastered':'Learn rank '+(r+1)+' · '+cost+' pt'+(cost===1?'':'s');button.setAttribute('aria-label',talent.name+': '+button.textContent);
 }
 text('chapter','SECTOR '+(Idle.sector(s)+1)+' / STAGE '+Idle.stage(s));
 bossButton.hidden=!Idle.bossReady(s);bossButton.disabled=s.paused;bossButton.textContent=s.bossFight?'Retreat · Farm stage 5':Idle.gemsUnlocked(s)?'Challenge boss | 1-2 Steam Gems':'Challenge sector boss';bossButton.title=s.bossFight?'Return to the final normal stage. Boss health will reset.':Idle.bosses[Idle.sector(s)]+'. '+Idle.bossDamage(s)+' damage every 3 seconds with your current defences; 5% chance of double-damage crits. Requires manual attacks. Idle play repeats stage 5.';
 text('status',s.paused?'Resting':s.control?'Direct control':'Autopilot engaged');text('mode',s.control?'Return to autopilot':'Take control');$('mode').setAttribute('aria-pressed',String(s.control));
 $('controls').hidden=!s.control;$('idlehint').hidden=s.control;
 playerHealth.hidden=!s.bossFight;if(s.bossFight){const hp=s.bossFight.health??Idle.playerHP(s);$('healthbar').max=Idle.playerHP(s);$('healthbar').value=hp;text('healthtext',Math.ceil(hp)+' / '+Idle.playerHP(s)+' HP · Next hit: '+Idle.bossDamage(s)+' in '+Math.ceil(s.bossFight.attackIn??3)+'s');}
 $('attack').disabled=s.paused;text('attack',Idle.classInfo(s).id==='mage'?'Cast / Space':Idle.classInfo(s).id==='warrior'?'Strike / Space':'Launch / Space');
 text('act',s.paused?'ENGINE IDLE':s.bossFight?'SECTOR BOSS':Idle.bossReady(s)?'BOSS READY':s.control?'DIRECT CONTROL':'AUTOPILOT');text('zone',Idle.zone(s));
 document.querySelector('.scene-label').textContent=Idle.environment(s).name.toUpperCase()+' / STAGE '+Idle.worldStage(s);
 text('activity',s.paused?'The boilers are cooling. Resume when ready.':Idle.activity(s));text('actionlabel',s.bossFight?'BOSS · Manual attacks required':Idle.bossReady(s)?'STAGE 5 · Farming':['Travelling','Combat','Salvaging'][Idle.phase(s)]);text('actiontime',s.bossFight?Math.ceil(Idle.bossHP(s)-s.bossFight.damage)+' HP · AFK retreat in '+Math.ceil(15-s.bossFight.idle)+'s':Idle.phase(s)===1?Math.ceil(Idle.enemyHP(s)*(1-Idle.progress(s)))+' / '+Math.ceil(Idle.enemyHP(s))+' HP':time((Idle.duration(s)-s.elapsed)/Idle.speed(s))+' remaining');$('actionbar').value=Idle.progress(s)*100;
 text('quest',Idle.quest(s));text('questdesc','Clear six encounters and reclaim the machinery.');$('questbar').value=s.questSteps;text('questprogress',s.questSteps+' / 6 encounters');text('reward','Base reward: '+Math.floor((50+s.level*10)*.5)+' XP · '+((25+s.level*5)*.5)+' gold');
 text('health-summary','Maximum health: '+Idle.playerHP(s)+' HP | Base '+(100+s.level*5)+' + equipment '+s.gear.reduce((sum,g,i)=>sum+Idle.itemHealth(g,i),0)+' | Skill tree +'+Idle.bonus(s,'health')+'% | Shop health +'+(Idle.shopRank(s,'vitality')*5)+'% | Shop power +'+(Idle.shopRank(s,'edge')*5)+'% | Boss damage reduction '+(Idle.shopRank(s,'plating')*3)+'% | Critical chance: '+(Idle.critChance(s)*100).toFixed(1)+'% (2x damage) | Class attack bonus: +'+Idle.traitPower(s));
 const gearKey=JSON.stringify(s.gear);
 if(gearKey!==lastGear){lastGear=gearKey;$('equipment').replaceChildren(...s.gear.map((g,i)=>{const d=document.createElement('div');d.className='gear';const label=document.createElement('span');label.textContent=Idle.slots[i];const b=document.createElement('b');b.textContent=g.name;b.className=g.rarity;const n=document.createElement('small');n.textContent='+'+g.power+' power'+(g.class?' | '+g.class+' gear':'')+(Idle.itemCrit(g,i)?' | +'+(Idle.itemCrit(g,i)*100)+'% crit':'')+(Idle.itemHealth(g,i)?' | +'+Idle.itemHealth(g,i)+' HP':'');d.append(label,b,n);return d;}));}
 const logKey=JSON.stringify(s.log);
 if(logKey!==lastLog){lastLog=logKey;$('journal').replaceChildren(...s.log.map(l=>{const li=document.createElement('li'),t=document.createElement('time');t.textContent=new Date(l.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});li.append(t,document.createTextNode(l.message));return li;}));}
 text('skillhint',s.paused?'Resume to use skills':s.control?'Click a skill or press 1–6':'Take control to use unlocked skills');
 Idle.classSkills(s).forEach((skill,i)=>{
  const {button,status,meter,symbol,name,effect}=skillButtons[i],timer=s.skills[i],r=Idle.rank(s,i),locked=r<1;
  name.textContent=skill.name;symbol.textContent=skill.icon;effect.textContent=skill.description;
  button.disabled=locked||!s.control||s.paused||timer.cooldown>0;
  button.className='skill'+(locked?' locked':'')+(timer.active>0?' active':'')+(button.disabled?' unavailable':'');
  status.textContent=locked?'Unlock at Lv '+skill.unlock:timer.active>0?'Active '+time(timer.active):timer.cooldown>0?'Ready in '+time(timer.cooldown):'Rank '+r+' · Ready';
  const description=skill.name+'. '+skill.description+' Unlocks at level '+skill.unlock+'. '+(locked?'Locked.':'Rank '+r+', '+Idle.cooldown(s,i)+' second cooldown. '+status.textContent+'.');
  button.title=description;button.setAttribute('aria-label',description);meter.style.width=(timer.active>0?timer.active/skill.duration*100:timer.cooldown>0?Math.min(100,timer.cooldown/skill.cooldown*100):0)+'%';
 });
}
$('create').onsubmit=e=>{e.preventDefault();const name=$('name').value.trim();if(!name)return;state=Idle.fresh(name,$('calling').value);notice('The boilers are lit. Your adventure has begun.');save();render();};
$('mode').onclick=()=>{tick();state.control=!state.control;if(!state.control)Idle.leaveBoss(state);scene.clearInput();save();render();if(state.control)$('scene').focus({preventScroll:true});};
$('export').onclick=()=>{if(!state)return;tick();save();if(window.AndroidSave){window.AndroidSave.exportSave(JSON.stringify(state));return;}const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(state)],{type:'application/json'}));a.href=url;a.download='idlebound-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>100000)throw Error();const data=Idle.upgrade(JSON.parse(await f.text()));state=data;state.paused=false;state.last=Date.now();scene.clearInput();save();render();$('options-dialog').close();notice('Adventure imported. Your existing progress was replaced.');}catch{notice('That file is not a valid Idlebound save. Your adventure is unchanged.');}e.target.value='';};
function fire(){if(!state)return;tick();if(Idle.attack(state)){scene.shot();render();}}
$('attack').onclick=fire;
window.addEventListener('keydown',e=>{
 if(!state||!state.control||state.paused||document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.isContentEditable||(e.target.tagName==='BUTTON'&&e.key===' '))return;
 const k=e.key.toLowerCase();
 if([' ','1','2','3','4','5','6'].includes(k))e.preventDefault();
 if(k===' '&&!e.repeat)fire();
 if(/^[1-6]$/.test(k)&&!e.repeat)useSkill(Number(k)-1);
});
window.addEventListener('blur',()=>scene.clearInput());
let count=0;
function tick(){if(!state)return;const now=Date.now(),seconds=Math.max(0,now-state.last)/1000,credited=background?Math.min(seconds,Math.max(0,43200-background.credited)):seconds;Idle.advance(state,credited,{offline:!!background||document.hidden||seconds>3,report:background?.report});if(background||document.hidden||seconds>3)scene.clearInput();if(background)background.credited+=credited;state.last=now;render();if(++count%10===0)save();}
setInterval(tick,250);document.addEventListener('visibilitychange',()=>{
 scene.clearInput();tick();if(!state)return;
 if(document.hidden){Idle.leaveBoss(state);background={at:Date.now(),before:Idle.snapshot(state),credited:0,report:{loot:0,upgrades:0,sold:0}};}
 else if(background){const report=Idle.earnings(background.before,state,(Date.now()-background.at)/1000,background.credited,background.report);background=null;save();if(report.away>=30)showReturn(report);}
 save();
});window.addEventListener('pagehide',()=>{if(state)Idle.leaveBoss(state);tick();save();});render();if(pendingReturn){showReturn(pendingReturn);pendingReturn=null;}
