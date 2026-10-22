'use strict';
const C = SchoolCalendar, $ = id => document.getElementById(id);
const today = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const format = key => C.parse(key).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
let actualToday = today();
$('from').value = actualToday;
const milestones = [['Autumn half term','2026-10-23'],['Christmas','2026-12-17'],['Spring half term','2027-02-12'],['Easter','2027-03-19'],['Summer half term','2027-05-28'],['Mayfield Day','2027-06-26'],['Summer holidays','2027-07-08']];
$('target').value = (milestones.find(([,key]) => key >= actualToday) || milestones.at(-1))[1];
for (const [name,key] of milestones) {
  const button = document.createElement('button'); button.type='button'; button.textContent=name;
  button.addEventListener('click',()=>{$('target').value=key;render();}); $('presets').append(button);
}
function render() {
  const from=$('from').value, to=$('target').value, induction=$('induction').checked;
  let valid=false;
  $('message').textContent=''; $('stats').replaceChildren(); $('range').textContent='';
  try {
    const result=C.count(from,to,induction); valid=true;
    $('number').textContent=result.school;
    $('unit').textContent=result.school===1?'school day to go':'school days to go';
    $('range').textContent=`After ${format(from)} → ${format(to)}`;
    for(const [value,label] of [[result.total,'calendar days'],[result.weekend,'weekend days off'],[result.holiday,'holiday days']]) {
      const span=document.createElement('span'), strong=document.createElement('strong'); strong.textContent=value;span.append(strong,label);$('stats').append(span);
    }
    if(result.special) $('message').textContent='Includes Saturday 26 June · Mayfield Day.';
    if(to===from) $('message').textContent='That’s your starting date. No days in between.';
  } catch(error) { $('number').textContent='—';$('unit').textContent='Let’s check those dates';$('message').textContent=error.message; }
  $('result-label').textContent=from===actualToday?'FROM TODAY · LONDON':'FROM YOUR CHOSEN START DATE';
  $('months').replaceChildren();
  for(let month=8;month<=18;month++) {
    const first=new Date(Date.UTC(2026,month,1,12));
    const last=new Date(Date.UTC(2026,month+1,0,12));
    const a=first.toISOString().slice(0,10),b=last.toISOString().slice(0,10);
    if(valid && (b<from || a>to)) continue;
    const panel=document.createElement('section');panel.className='month';
    const title=document.createElement('h3');title.textContent=first.toLocaleDateString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'});panel.append(title);
    const grid=document.createElement('div');grid.className='grid';
    for(const name of ['M','T','W','T','F','S','S']) {const el=document.createElement('span');el.className='weekday';el.textContent=name;grid.append(el);}
    for(let i=0;i<(first.getUTCDay()+6)%7;i++) grid.append(document.createElement('span'));
    for(let key=a;key<=b;key=C.next(key)) {
      const type=C.kind(key,induction), included=valid && key>from && key<=to;
      const labels={school:'School day',special:'Mayfield Day · compulsory school day',weekend:'Weekend',holiday:'School holiday / no pupil lessons',unknown:'Outside supplied calendar'};
      const button=document.createElement('button');button.type='button';button.textContent=Number(key.slice(-2));
      button.className=`day ${type}${included?'':' outside'}${key===to?' selected':''}`;
      const label=`${format(key)}: ${labels[type]}${included?' · in your countdown':''}`;
      button.title=label;button.setAttribute('aria-label',label);button.addEventListener('click',()=>{$('day-detail').textContent=label;});grid.append(button);
    }
    panel.append(grid);$('months').append(panel);
  }
}
for(const id of ['target','from','induction']) $(id).addEventListener('change',render);
$('reset').addEventListener('click',()=>{$('from').value=today();actualToday=today();render();});
for(const [name,a,b] of C.terms) {const row=document.createElement('div');row.className='term-row';const label=document.createElement('span'), dates=document.createElement('span');label.textContent=name;dates.textContent=`${format(a)} – ${format(b)}`;row.append(label,dates);$('term-list').append(row);}
setInterval(()=>{const now=today();if(now!==actualToday){if($('from').value===actualToday)$('from').value=now;actualToday=now;render();}},60000);
render();
