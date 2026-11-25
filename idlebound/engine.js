(function(root){
'use strict';
const zones=['Brasswick Foundry','The Sootfall Viaduct','Coppercoil Works','The Cinder Docks','Ironspire Heights','The Clockwork Citadel'];
const foes=['Clockwork Rat','Boiler Spider','Scrap Automaton','Soot Wraith','Rogue Surveyor','Ironclad Sentinel'];
const quests=['A cog in the machine','Pressure in the pipes','The missing artificer','A fistful of rivets','Trouble on the skyrail','The last furnace'];
const slots=['Weapon','Armour','Trinket'];
const bosses=['The Furnace Warden','The Viaduct Colossus','Coppercoil Prime','Admiral Cinderclaw','The Ironspire Regent','The Clockwork Sovereign'];
function sector(s){return Math.min(5,s.bossesDefeated??Math.floor((s.level-1)/5));}
function stage(s){return s.sectorStage??Math.min(5,Math.max(1,s.level-sector(s)*5));}
const environments=[
 {id:'foundry',name:'The Sootfall Works',sky:['#111c29','#30414b','#6a5a46'],moon:'#ded8b5',fog:'#b8ac891c',floor:['#394043','#17232c']},
 {id:'docks',name:'The Cinderwater Docks',sky:['#101d32','#264959','#577a7b'],moon:'#b9dce2',fog:'#9fd5d424',floor:['#4d4a40','#202e36']},
 {id:'highlands',name:'The Ironspire Highlands',sky:['#1c2038','#595a76','#9c999e'],moon:'#e8d8ed',fog:'#d9d8ec30',floor:['#626870','#283441']}
];
function worldStage(s){return sector(s)*5+stage(s);}
function environment(s){return environments[Math.min(environments.length-1,Math.floor((worldStage(s)-1)/10))];}
function bossReady(s){return s.sectorStage===5&&s.stageEncounters===6;}
function gemsUnlocked(s){return !!s.steamUnlocked||worldStage(s)>=30||s.bossesDefeated>=6;}
function unlockSteam(s){if(!s.steamUnlocked&&gemsUnlocked(s)){s.steamUnlocked=true;log(s,'Stage 30 reached. Steam Gems unlocked: earn 1–2 per boss victory for future prestige.');}}
function bossHP(s){return 150+sector(s)*75;}
function itemHealth(item,slot){return item.power*(slot===1?(item.class==='warrior'?6:4):slot===2?2:0);}
function playerHP(s){return Math.floor((100+s.level*5+s.gear.reduce((sum,g,i)=>sum+itemHealth(g,i),0))*(1+bonus(s,'health')/100)*(1+shopRank(s,'vitality')*.05));}
function bossDamage(s){return Math.max(1,Math.ceil((36+sector(s)*18)*100/(100+s.gear[1].power*2)*(1-shopRank(s,'plating')*.03)*(active(s,2)&&classes[s.calling]?({mage:.6,artificer:.8,warrior:.5}[classInfo(s).id]):1)));}
function bossStrike(s){const f=s.bossFight;f.health=Math.max(0,f.health-rollDamage(s,bossDamage(s),'player',false));f.attackIn=3;if(f.health===0){s.bossFight=null;s.sectorStage=4;s.stageEncounters=0;s.elapsed=0;s.steps=Math.floor(s.steps/3)*3;s.attackWait=0;s.control=false;log(s,'Defeated by '+bosses[sector(s)]+'. Recovered at stage 4. Clear the remaining stages to challenge the boss again.');}}
function phase(s){return s.bossFight?1:s.steps%3;}
function progress(s){return s.bossFight?s.bossFight.damage/bossHP(s):s.steps%3===1?(s.enemy?s.enemy.damage/s.enemy.maxHP:Math.min(1,s.elapsed/duration(s))):s.elapsed/duration(s);}
function attackDamage(s,boss=false){return (2+power(s)/10)*(boss&&active(s,1)?1.5:1)*(boss&&active(s,5)?3:1);}
function itemCrit(item,slot){return slot===1?0:({common:0,rare:.005,epic:.01,legendary:.02}[item.rarity]??0);}
function critChance(s,enemy=false){return enemy ? .05 : Math.min(.5,.05+bonus(s,'crit')/100+shopRank(s,'precision')*.01+s.gear.reduce((n,g,i)=>n+itemCrit(g,i),0)+(active(s,2)?.1:0));}
function rollDamage(s,base,target='enemy',variable=true){const damage=base*(variable ? .9+rand(s)*.2 : 1),critical=rand(s)<critChance(s,target==='player');if(critical){s.critSerial=(s.critSerial??0)+1;s.critEvents??=[];s.critEvents.push({id:s.critSerial,target});s.critEvents=s.critEvents.slice(-8);}return damage*(critical?2:1);}
function ensureEnemy(s){if(!s.enemy||s.enemy.step!==s.steps){const maxHP=attackDamage(s)*duration(s);s.enemy={step:s.steps,maxHP,damage:maxHP*Math.min(.999999,s.elapsed/duration(s)),hits:0,lastDamage:0};s.elapsed=0;}return s.enemy;}
function enemyHP(s){return s.bossFight?bossHP(s):s.enemy?.maxHP??attackDamage(s)*duration(s);}
function hitEnemy(s,damage,report){const enemy=ensureEnemy(s);enemy.lastDamage=Math.min(damage,enemy.maxHP-enemy.damage);enemy.damage+=enemy.lastDamage;enemy.hits++;if(enemy.damage>=enemy.maxHP-1e-9){s.elapsed=0;complete(s,report);}}
function startBoss(s){if(!bossReady(s)||!s.control||s.paused||s.bossFight)return false;unlockSteam(s);s.enemy=null;s.elapsed=0;s.bossFight={damage:0,idle:0,health:playerHP(s),attackIn:3};log(s,'Challenging '+bosses[sector(s)]+'. The boss attacks every 3 seconds. Fire manually to defeat it.');return true;}
function leaveBoss(s){if(!s.bossFight)return false;s.bossFight=null;log(s,'Returned to sector '+(sector(s)+1)+', stage 5. The boss awaits your return.');return true;}
// Each branch has three five-rank nodes; later nodes require the previous one.
const talents=[
 {id:'gears',name:'Fine-tuned gears',branch:'speed',tier:0,parent:null},
 {id:'flywheel',name:'Balanced flywheel',branch:'speed',tier:1,parent:'gears'},
 {id:'drive',name:'Perpetual drive',branch:'speed',tier:2,parent:'flywheel'},
 {id:'sorter',name:'Coin sorter',branch:'gold',tier:0,parent:null},
 {id:'ledger',name:'Guild ledger',branch:'gold',tier:1,parent:'sorter'},
 {id:'foundry',name:'Gilded foundry',branch:'gold',tier:2,parent:'ledger'},
 {id:'vitality',name:'Reinforced constitution',branch:'health',tier:0,parent:null},
 {id:'heart',name:'Clockwork heart',branch:'health',tier:1,parent:'vitality'},
 {id:'aegis',name:'Aetherbound vitality',branch:'health',tier:2,parent:'heart'},
 {id:'aim',name:'Calibrated sights',branch:'crit',tier:0,parent:null},
 {id:'weakpoint',name:'Weak-point analysis',branch:'crit',tier:1,parent:'aim'},
 {id:'deadeye',name:'Aether precision',branch:'crit',tier:2,parent:'weakpoint'}
];
const skills=[
 {id:'gold',name:'Gilded gears',icon:'G',unlock:2,duration:60,cooldown:180,description:'Double all gold earned for 60 seconds.'},
 {id:'haste',name:'Steam surge',icon:'»',unlock:4,duration:30,cooldown:100,description:'Travel, fight and loot 50% faster for 30 seconds.'},
 {id:'luck',name:'Lucky cog',icon:'✦',unlock:7,duration:60,cooldown:180,description:'Add 20 percentage points to the loot roll for 60 seconds. More rare, epic and legendary finds.'},
 {id:'xp',name:'Eureka engine',icon:'XP',unlock:10,duration:45,cooldown:240,description:'Earn 50% more combat and quest XP for 45 seconds.'},
 {id:'salvage',name:'Magnetron',icon:'M',unlock:15,duration:60,cooldown:240,description:'Double the sale value of inferior loot for 60 seconds. Stacks with Gilded gears.'},
 {id:'barrage',name:'Tesla barrage',icon:'ϟ',unlock:20,duration:20,cooldown:150,description:'Triple combat speed for 20 seconds. Stacks with Steam surge.'}
];
const classes={
 Mage:{id:'mage',name:'Mage',description:'Cast aether bolts and spells. Rune weapons and enchanted focuses increase magic damage.',items:[['Aether staff','Runebound wand','Storm sceptre'],['Runic greatcoat','Aetherweave robe','Spellbinder vest'],['Mana prism','Runic focus','Aether crystal']],names:['Golden transmutation','Aether step','Runic ward','Arcane insight','Soul siphon','Aether tempest'],extra:['','','Also reduces incoming boss damage by 40%.','','Also restores 25% maximum health during a boss fight.','']},
 Artificer:{id:'artificer',name:'Artificer',description:'Launch bombs and build explosive devices. Tools and detonators increase bomb damage.',items:[['Bomb launcher','Tesla carbine','Grenade gauntlet'],['Artificer vest','Blastproof coat','Mechanist mail'],['Clockwork detonator','Pressure regulator','Bomb targeting lens']],names:['Coin automaton','Overclock','Predictive optics','Blueprint analysis','Build bomb','Cluster barrage'],extra:['','','Also reduces incoming boss damage by 20%.','','Also builds and detonates a bomb for a burst of boss damage.','']},
 Warrior:{id:'warrior',name:'Warrior',description:'Fight with blades and heavy armour. Warrior armour grants extra health; blades and war tokens strengthen attacks.',items:[['Pneumatic blade','Foundry sword','Cogsteel axe'],['Bulwark mail','Boilerplate coat','Ironclad mail'],['Vanguard token','War chronometer','Iron oath seal']],names:['Spoils of war','Battle charge','Iron guard','Veteran resolve','Second wind','Berserker fury'],extra:['','','Also reduces incoming boss damage by 50%.','','Also restores 35% maximum health during a boss fight.','']}
};
function classInfo(s){return classes[s.calling]||classes[{'Reluctant Knight':'Warrior','Hedge Wizard':'Mage','Unionised Rogue':'Artificer'}[s.calling]]||classes.Artificer;}
function classSkills(s){const c=classes[s.calling];return c?skills.map((skill,i)=>({...skill,name:c.names[i],description:(c.extra[i]+' '+skill.description+(i===2?' Also adds 10 percentage points critical-hit chance.':'')).trim(),icon:[c.id==='mage'?'A':c.id==='warrior'?'W':'G','>>','+','XP',c.id==='artificer'?'B':'+','!'][i]})):skills;}
function classGear(c){return c.items.map((pool,i)=>({name:pool[0],power:1,rarity:'common',class:c.id}));}
function traitPower(s){const c=classInfo(s);return s.gear.reduce((n,g,i)=>n+(g.class===c.id?(i===0?g.power*.5:i===2?g.power*(c.id==='mage'?1:.5):0):0),0);}
const shopPerks=[{id:'precision',name:'Precision optics',description:'+1 percentage point critical-hit chance per rank.'},{id:'vitality',name:'Aether heart',description:'+5% maximum health per rank.'},{id:'edge',name:'Masterwork calibration',description:'+5% attack power per rank.'},{id:'plating',name:'Ablative lining',description:'Reduce incoming boss damage by 3 percentage points per rank.'}];
function shopRank(s,id){return s.shop?.[id]??0;}
function shopOffers(s){const c=classInfo(s);return [...slots.map((slot,i)=>{const power=Math.min(1000000,Math.max(s.gear[i].power+Math.max(5,Math.ceil(s.level*.4)),s.level+10)),item={name:'Masterwork '+c.items[i][0],power,rarity:'epic',class:c.id};return {id:'gear-'+i,name:item.name,description:slot+': +'+s.gear[i].power+' to +'+power+' power. Class-matched; equips immediately.',price:Math.ceil(500*(s.level+1)*(1+s.gear[i].power/10)),item,slot:i,maxed:s.gear[i].power>=1000000};}),...shopPerks.map(p=>({...p,rank:shopRank(s,p.id),price:1500*2**shopRank(s,p.id),maxed:shopRank(s,p.id)>=10}))];}
function buyShop(s,id){if(s.bossFight||s.paused)return false;const offer=shopOffers(s).find(o=>o.id===id);if(!offer||offer.maxed||s.gold<offer.price)return false;s.gold-=offer.price;if(offer.item)s.gear[offer.slot]={...offer.item};else{if(!s.shop)s.shop={vitality:0,edge:0,plating:0};s.shop[id]=(s.shop[id]??0)+1;}log(s,'Purchased '+offer.name+' for '+offer.price+' gold.'+(offer.item?' Equipped immediately.':' Permanent rank '+s.shop[id]+'/10.'));return true;}
function fresh(name,calling){return {version:4,critSerial:0,critEvents:[],enemy:null,steamGems:0,steamUnlocked:false,shop:{vitality:0,edge:0,plating:0,precision:0},bossesDefeated:0,bossFight:null,sectorStage:1,stageEncounters:0,skillPoints:1,talents:Object.fromEntries(talents.map(t=>[t.id,0])),goldDust:0,name,calling,level:1,xp:0,gold:0,kills:0,quests:0,steps:0,questSteps:0,elapsed:0,last:Date.now(),paused:false,control:false,attackWait:0,skills:skills.map(()=>({active:0,cooldown:0})),seed:Math.floor(Math.random()*2147483646)+1,gear:classes[calling]?classGear(classes[calling]):[{name:'Rusty rivet pistol',power:1,rarity:'common'},{name:'Soot-stained greatcoat',power:1,rarity:'common'},{name:'Cracked pocket watch',power:1,rarity:'common'}],log:[]};}
function talentCost(s,id){const t=talents.find(t=>t.id===id);return t?t.tier*5+(s.talents?.[id]||0)+1:Infinity;}
function talentSpent(s){return talents.reduce((n,t)=>{const r=s.talents[t.id]??0;return n+r*(2*(t.tier*5+1)+r-1)/2;},0);}
function bonus(s,branch){return talents.filter(t=>t.branch===branch).reduce((n,t)=>n+(s.talents?.[t.id]||0),0);}
function canTrain(s,id){const t=talents.find(t=>t.id===id);return !!t&&s.version>=3&&(s.talents[id]??0)<5&&(!t.parent||s.talents[t.parent]===5)&&s.skillPoints>=talentCost(s,id);}
function train(s,id){if(!canTrain(s,id))return false;const t=talents.find(t=>t.id===id),cost=talentCost(s,id);s.skillPoints-=cost;s.talents[id]=(s.talents[id]??0)+1;log(s,t.name+' rank '+s.talents[id]+' learned. Permanent '+t.branch+' bonus: +'+bonus(s,t.branch)+'%.');return true;}
function rand(s){s.seed=s.seed*16807%2147483647;return (s.seed-1)/2147483646;}
function log(s,message){s.log.unshift({at:Date.now(),message});s.log.length=Math.min(s.log.length,40);}
function needed(s){return Math.floor(70*Math.pow(s.level,1.32));}
function duration(s){return s.steps%3===0?5:s.steps%3===1?Math.max(3,8-Math.floor(s.gear.reduce((n,g)=>n+g.power,0)/12)):4;}
function zone(s){return zones[sector(s)];}
function quest(s){return quests[s.quests%quests.length];}
function power(s){return (s.level*2+s.gear.reduce((a,g)=>a+g.power,0)+traitPower(s))*(1+shopRank(s,'edge')*.05);}
function foe(s){return s.bossFight?bosses[sector(s)]:foes[bossReady(s)?(sector(s)+4)%foes.length:Math.floor(s.steps/3)%foes.length];}
function activity(s){return s.bossFight?'Boss: '+foe(s)+' — fire manually to defeat it.':bossReady(s)?'Repeating stage 5. Take control and challenge the sector boss.':s.steps%3===0?'Following the skyrail through the smoke.':s.steps%3===1?'Engaging '+foe(s)+'.':'Recovering gears, gold and improbable inventions.';}
function active(s,i){return !!s.skills&&s.skills[i].active>0;}
function speed(s){return 1.8*(1+bonus(s,'speed')/100)*(active(s,1)?1.5:1)*(s.steps%3===1&&active(s,5)?3:1);}
function rank(s,i){return Math.max(0,1+Math.floor((s.level-skills[i].unlock)/10));}
function cooldown(s,i){return Math.round(skills[i].cooldown*Math.max(.45,1-.08*(rank(s,i)-1)));}
function activate(s,i){if(!Number.isInteger(i)||i<0||i>=6||!s.control||s.paused||rank(s,i)<1||s.skills[i].cooldown>0)return false;s.skills[i]={active:skills[i].duration,cooldown:cooldown(s,i)};if(s.bossFight&&classes[s.calling]&&i===4){if(classInfo(s).id==='artificer'){s.bossFight.damage+=rollDamage(s,20+power(s)*1.5);finishBoss(s);}else s.bossFight.health=Math.min(playerHP(s),s.bossFight.health+Math.ceil(playerHP(s)*(classInfo(s).id==='warrior'?.35:.25)));}if(!s.bossFight&&s.steps%3===1&&classes[s.calling]&&classInfo(s).id==='artificer'&&i===4)hitEnemy(s,rollDamage(s,20+power(s)*1.5));const skill=classSkills(s)[i];log(s,skill.name+' activated. '+skill.description);return true;}
function addGold(s,n){const reward=Math.round(n*.5*(100+bonus(s,'gold'))*(active(s,0)?2:1)),hundredths=reward+(s.goldDust||0);s.gold+=Math.floor(hundredths/100);s.goldDust=hundredths%100;return reward/100;}
function addXP(s,n){s.xp+=Math.floor(n*.5*(active(s,3)?1.5:1));}
function levelUp(s){while(s.xp>=needed(s)){s.xp-=needed(s);s.level++;s.skillPoints++;log(s,'Level '+s.level+'! +1 skill point.');for(let i=0;i<6;i++)if(s.level===skills[i].unlock)log(s,'Skill unlocked: '+classSkills(s)[i].name+'. Take control to use it.');}}
function complete(s,report){
 const phase=s.steps%3;s.enemy=null;
 if(phase===1){s.kills++;let xp=15+s.level*3;addXP(s,xp);addGold(s,3+s.level);log(s,'Dismantled '+foe(s)+'. +'+Math.floor(xp*.5*(active(s,3)?1.5:1))+' XP.');}
 if(phase===2){
  if(report)report.loot++;
  let i=Math.floor(rand(s)*3),roll=Math.min(1,rand(s)+(active(s,2)?.2:0));
  let rarity=roll>.98?'legendary':roll>.88?'epic':roll>.6?'rare':'common',bonus={common:0,rare:3,epic:7,legendary:14}[rarity];
  let item={name:(classes[s.calling]?classes[s.calling].items[i]:[['Rivet pistol','Tesla carbine','Pneumatic blade'],['Boilerplate coat','Artificer vest','Ironweave mail'],['Chronometer','Aether compass','Pressure regulator']][i])[Math.floor(rand(s)*3)]+' of '+['the Foundry','Coppercoil','the Skyrail','Lost Inventions'][Math.floor(rand(s)*4)],power:Math.max(1,s.level+Math.floor(rand(s)*5)+bonus),rarity};
  if(classes[s.calling])item.class=classInfo(s).id;
  if(item.power>s.gear[i].power){s.gear[i]=item;if(report)report.upgrades++;log(s,'Equipped '+rarity+' '+item.name+' (+'+item.power+').');}
  else {if(report)report.sold++;let value=item.power*2*(active(s,4)?2:1),earned=addGold(s,value);log(s,'Salvaged '+item.name+' for '+earned+' gold.');}
  s.questSteps++;
  if(!bossReady(s)){s.stageEncounters++;if(s.stageEncounters>=6&&s.sectorStage<5){s.sectorStage++;s.stageEncounters=0;log(s,'Sector '+(sector(s)+1)+', stage '+s.sectorStage+' reached.');}else if(bossReady(s))log(s,bosses[sector(s)]+' blocks the sector exit. Challenge it in direct control; idle play will farm stage 5.');}
  if(s.questSteps>=6){let reward=50+s.level*10;s.questSteps=0;s.quests++;addGold(s,25+s.level*5);addXP(s,reward);log(s,'Contract complete. The foundry pays its debts.');}
 }
 unlockSteam(s);
 levelUp(s);
 s.steps++;
}
function advance(s,seconds,options={}){
 unlockSteam(s);
 if(options.offline||(!s.control&&s.bossFight))leaveBoss(s);
 if(s.paused||!Number.isFinite(seconds))return;
 let remaining=Math.max(0,Math.min(seconds,43200));
 while(remaining>1e-9){
  const normalCombat=!s.bossFight&&s.steps%3===1;if(normalCombat)ensureEnemy(s);
  let rate=speed(s),boundary=Math.min(...s.skills.filter(t=>t.active>1e-9).map(t=>t.active),Infinity);
  if(s.bossFight){s.bossFight.health??=playerHP(s);s.bossFight.attackIn??=3;}
  let chunk=Math.min(remaining,s.bossFight?Math.max(0,Math.min(15-s.bossFight.idle,s.bossFight.attackIn)):Math.max(0,((normalCombat?1:duration(s))-s.elapsed)/rate),boundary);
  if(s.bossFight){s.bossFight.idle+=chunk;s.bossFight.attackIn-=chunk;if(s.bossFight.attackIn<=1e-9)bossStrike(s);if(s.bossFight&&s.bossFight.idle>=15-1e-9)leaveBoss(s);}else s.elapsed+=chunk*rate;remaining-=chunk;
  // Finish this interval's encounter before expiring its reward bonuses.
  if(normalCombat&&s.elapsed>=1-1e-9){s.elapsed=0;hitEnemy(s,rollDamage(s,attackDamage(s)),options.report);}
  else if(!s.bossFight&&s.steps%3!==1&&s.elapsed>=duration(s)-1e-9){s.elapsed=0;complete(s,options.report);}
  for(const timer of s.skills){timer.active=Math.max(0,timer.active-chunk);timer.cooldown=Math.max(0,timer.cooldown-chunk);if(timer.active<1e-9)timer.active=0;if(timer.cooldown<1e-9)timer.cooldown=0;}
  s.attackWait=Math.max(0,s.attackWait-chunk);
 }
}
function finishBoss(s){if(s.bossFight.damage>=bossHP(s)){const name=bosses[sector(s)],reward=sector(s)+1;addGold(s,250*reward);addXP(s,120*reward);s.kills++;unlockSteam(s);const gems=gemsUnlocked(s)?1+Math.floor(rand(s)*2):0;if(gems){s.steamGems=(s.steamGems??0)+gems;log(s,'Recovered '+gems+' Steam Gem'+(gems===1?'':'s')+'. Reserved for future prestige.');}s.bossesDefeated=Math.min(6,s.bossesDefeated+1);s.sectorStage=s.bossesDefeated===6?5:1;s.stageEncounters=0;s.bossFight=null;s.elapsed=0;s.steps=Math.floor(s.steps/3)*3;levelUp(s);log(s,name+' defeated! '+(s.bossesDefeated===6?'All six sectors cleared. Clear six more encounters at stage 30 to challenge this boss again for Steam Gems.':'Sector '+(sector(s)+1)+' unlocked.'));}}
function attack(s){
 if(s.paused||!s.control||phase(s)!==1||s.attackWait>0)return false;s.attackWait=.25;
 if(s.bossFight){s.bossFight.idle=0;s.bossFight.lastDamage=rollDamage(s,attackDamage(s,true));s.bossFight.damage+=s.bossFight.lastDamage;finishBoss(s);return true;}
 hitEnemy(s,rollDamage(s,attackDamage(s)));return true;
}
function snapshot(s){return {steamGems:s.steamGems??0,level:s.level,xp:s.xp,gold:s.gold,goldDust:s.goldDust,kills:s.kills,quests:s.quests,skillPoints:s.skillPoints,gear:s.gear.map(g=>({...g}))};}
function earnings(before,s,away,credited,report){
 let xp=s.xp-before.xp;for(let level=before.level;level<s.level;level++)xp+=needed({level});
 return {steamGems:(s.steamGems??0)-(before.steamGems??0),away:Math.max(0,away),credited,gold:((s.gold-before.gold)*100+s.goldDust-before.goldDust)/100,xp,levels:s.level-before.level,fromLevel:before.level,toLevel:s.level,skillPoints:s.skillPoints-before.skillPoints,kills:s.kills-before.kills,quests:s.quests-before.quests,...report,equipment:s.gear.map((g,i)=>({slot:slots[i],before:before.gear[i],after:{...g}})).filter(g=>JSON.stringify(g.before)!==JSON.stringify(g.after)),bossPending:bossReady(s)?bosses[sector(s)]:null};
}
function catchUp(s,seconds){const before=snapshot(s),report={loot:0,upgrades:0,sold:0},credited=Math.max(0,Math.min(Number.isFinite(seconds)?seconds:0,43200));advance(s,credited,{offline:true,report});return earnings(before,s,seconds,credited,report);}
function valid(s){
 if(!s||![1,2,3,4].includes(s.version)||typeof s.name!=='string'||s.name.length>24||![...Object.keys(classes),'Reluctant Knight','Hedge Wizard','Unionised Rogue'].includes(s.calling))return false;
 if(!['level','xp','gold','kills','quests','steps','questSteps','elapsed','last','seed'].every(k=>Number.isFinite(s[k])&&s[k]>=0&&s[k]<=1e13))return false;
 if(!['level','xp','gold','kills','quests','steps','questSteps','seed'].every(k=>Number.isInteger(s[k]))||s.level<1||s.level>=100000||s.xp>=needed(s)||s.seed<=0||s.seed>=2147483647||s.questSteps>=6||typeof s.paused!=='boolean')return false;
 if(!Array.isArray(s.gear)||s.gear.length!==3||!s.gear.every(g=>g&&typeof g.name==='string'&&g.name.length<120&&Number.isInteger(g.power)&&g.power>=1&&g.power<=1000000&&['common','rare','epic','legendary'].includes(g.rarity)&&(g.class===undefined||['mage','artificer','warrior'].includes(g.class))))return false;
 if(s.elapsed>=duration(s)||!Array.isArray(s.log)||s.log.length>40||!s.log.every(l=>l&&Number.isFinite(l.at)&&typeof l.message==='string'&&l.message.length<500))return false;
 if(s.version>=2&&(typeof s.control!=='boolean'||!Number.isFinite(s.attackWait)||s.attackWait<0||s.attackWait>.35||!Array.isArray(s.skills)||s.skills.length!==6||!s.skills.every((t,i)=>t&&Number.isFinite(t.active)&&t.active>=0&&t.active<=skills[i].duration&&Number.isFinite(t.cooldown)&&t.cooldown>=t.active&&t.cooldown<=skills[i].cooldown&&(s.level>=skills[i].unlock||t.cooldown===0))))return false;
 if(s.enemy!==undefined&&s.enemy!==null&&(!s.enemy||s.bossFight||s.steps%3!==1||s.enemy.step!==s.steps||!Number.isFinite(s.enemy.maxHP)||s.enemy.maxHP<=0||s.enemy.maxHP>1e13||!Number.isFinite(s.enemy.damage)||s.enemy.damage<0||s.enemy.damage>=s.enemy.maxHP||!Number.isSafeInteger(s.enemy.hits)||s.enemy.hits<0||!Number.isFinite(s.enemy.lastDamage)||s.enemy.lastDamage<0||s.enemy.lastDamage>s.enemy.maxHP||s.elapsed>=1))return false;
 if(s.critSerial!==undefined&&(!Number.isSafeInteger(s.critSerial)||s.critSerial<0))return false;
 if(s.critEvents!==undefined&&(!Array.isArray(s.critEvents)||s.critEvents.length>8||!s.critEvents.every((e,i)=>e&&Number.isSafeInteger(e.id)&&e.id>0&&e.id<=(s.critSerial??0)&&['enemy','player'].includes(e.target)&&(!i||e.id>s.critEvents[i-1].id))))return false;
 if(s.steamGems!==undefined&&(!Number.isSafeInteger(s.steamGems)||s.steamGems<0||s.steamGems>1e13))return false;
 if(s.steamUnlocked!==undefined&&typeof s.steamUnlocked!=='boolean')return false;
 if((s.steamGems??0)>0&&!gemsUnlocked(s))return false;
 if(s.shop!==undefined&&(!s.shop||typeof s.shop!=='object'||Array.isArray(s.shop)||Object.keys(s.shop).some(id=>!shopPerks.some(p=>p.id===id))||!shopPerks.every(p=>(p.id==='precision'&&s.shop[p.id]===undefined)||(Number.isInteger(s.shop[p.id])&&s.shop[p.id]>=0&&s.shop[p.id]<=10))))return false;
 if(s.version>=3){
  if(!Number.isInteger(s.skillPoints)||s.skillPoints<0||!Number.isInteger(s.goldDust)||s.goldDust<0||s.goldDust>=100||!s.talents||typeof s.talents!=='object'||Array.isArray(s.talents)||Object.keys(s.talents).some(id=>!talents.some(t=>t.id===id)))return false;
  if(!talents.every(t=>(['health','crit'].includes(t.branch)&&s.talents[t.id]===undefined)||(Number.isInteger(s.talents[t.id])&&s.talents[t.id]>=0&&s.talents[t.id]<=5&&(!s.talents[t.id]||!t.parent||s.talents[t.parent]===5))))return false;
  if(s.skillPoints+talentSpent(s)!==s.level)return false;
 }
 if(s.version===4){
  if(!Number.isInteger(s.bossesDefeated)||s.bossesDefeated<0||s.bossesDefeated>6||!Number.isInteger(s.sectorStage)||s.sectorStage<1||s.sectorStage>5||!Number.isInteger(s.stageEncounters)||s.stageEncounters<0||s.stageEncounters>6||(s.stageEncounters===6&&s.sectorStage!==5))return false;
  if(s.bossFight!==null&&(!s.bossFight||!bossReady(s)||!s.control||!Number.isFinite(s.bossFight.damage)||s.bossFight.damage<0||s.bossFight.damage>=bossHP(s)||!Number.isFinite(s.bossFight.idle)||s.bossFight.idle<0||s.bossFight.idle>=15))return false;
  if(s.bossFight?.lastDamage!==undefined&&(!Number.isFinite(s.bossFight.lastDamage)||s.bossFight.lastDamage<0||s.bossFight.lastDamage>1e13))return false;
  if(s.bossFight&&((s.bossFight.health!==undefined&&(!Number.isFinite(s.bossFight.health)||s.bossFight.health<=0||s.bossFight.health>playerHP(s)))||(s.bossFight.attackIn!==undefined&&(!Number.isFinite(s.bossFight.attackIn)||s.bossFight.attackIn<=0||s.bossFight.attackIn>3))))return false;
 }
 return true;
}
function upgrade(s){if(!valid(s))throw Error('Invalid save');if(s.version===1){s.version=2;s.control=false;s.attackWait=0;s.skills=skills.map(()=>({active:0,cooldown:0}));}if(s.version===2){s.version=3;s.skillPoints=s.level;s.talents=Object.fromEntries(talents.map(t=>[t.id,0]));s.goldDust=0;}if(s.version===3){s.version=4;s.bossesDefeated=Math.min(5,Math.floor((s.level-1)/5));s.bossFight=null;s.sectorStage=Math.min(5,Math.max(1,s.level-s.bossesDefeated*5));s.stageEncounters=s.sectorStage===5?6:s.questSteps;}s.enemy??=null;s.steamGems??=0;s.steamUnlocked??=gemsUnlocked(s);s.shop??={vitality:0,edge:0,plating:0};s.shop.precision??=0;s.critSerial??=0;s.critEvents??=[];for(const t of talents)s.talents[t.id]??=0;if(!classes[s.calling])s.calling=classInfo(s).name;return s;}
const api={fresh,advance,needed,duration,zone,quest,power,foe,activity,valid,upgrade,slots,skills,rank,cooldown,activate,attack,speed,talents,talentCost,talentSpent,bonus,canTrain,train,bosses,sector,stage,bossReady,bossHP,bossDamage,playerHP,itemHealth,classes,classInfo,classSkills,traitPower,shopOffers,buyShop,shopRank,shopPerks,phase,progress,startBoss,leaveBoss,snapshot,earnings,catchUp,environments,worldStage,environment,gemsUnlocked,attackDamage,enemyHP,critChance,itemCrit};
if(typeof module!=='undefined')module.exports=api;else root.Idle=api;
})(globalThis);
