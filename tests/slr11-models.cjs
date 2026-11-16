const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const M=require('../computer-science/slr-11/models.js');
assert(M.connection({remote:false,online:false}).ok);
assert(!M.connection({remote:true,online:false}).ok);
assert(!M.connection({compatible:false}).ok);
assert(M.connection({remote:true}).ok);
assert.equal(M.dns({}).length,7);assert.equal(M.dns({cached:true}).length,3);
assert.equal(M.dns({}).at(-1).answer,'192.0.2.40');
assert.equal(M.dns({cached:true,exists:false}).at(-1).answer,null);
for(const failed of [false,true]){
  const states=M.switching({failed}),final=states.at(-1);
  assert.equal(final.message,'DATA');assert.deepEqual(final.received,[1,3,0,2]);
  if(failed)for(const state of states)assert(!state.path.includes('A'));
  for(const state of states)for(let i=0;i<state.path.length-1;i++)assert(M.edges.some(([a,b])=>a===state.path[i]&&b===state.path[i+1]));
}
assert.equal(M.switching({circuit:true}).at(-1).message,'DATA');
assert.equal(M.switching({circuit:true,failed:true}).at(-1).message,null);
assert.equal(M.switching({loss:true,reliable:false}).at(-1).message,null);
assert.equal(M.switching({loss:true,reliable:true}).at(-1).message,'DATA');
assert.deepEqual(M.forward('switch','C').ports,['C']);
assert.deepEqual(M.forward('switch','C',false).ports,['B','C','D']);
assert.deepEqual(M.forward('hub','C').ports,['B','C','D']);
assert.throws(()=>M.forward('router','C'));assert.throws(()=>M.forward('switch','Z'));
assert(!M.availability({server:true,failed:true,replica:true}).ok);
assert(!M.availability({server:false,failed:true}).ok);
assert(M.availability({server:false,failed:true,replica:true}).ok);
for(const [threat,control]of [['phishing','training'],['malware','updates'],['dos','filter'],['eavesdrop','encrypt'],['access','firewall']])assert(M.threat(threat,control).matched);
assert(!M.threat('phishing','encrypt').matched);assert.throws(()=>M.threat('unknown','encrypt'));
assert(M.protection({}).delivered);assert(!M.protection({direction:'in'}).delivered);
assert(!M.protection({web:false}).firewall);assert(!M.protection({allowedSite:false}).proxy);
assert(M.protection({encrypted:false}).visible.includes('Exam revision'));
assert(!M.protection({encrypted:true}).visible.includes('Exam revision'));
const ctx={window:{}},read=name=>fs.readFileSync(path.join(__dirname,'../computer-science/slr-11/',name),'utf8');
vm.runInNewContext(read('content.js'),ctx);vm.runInNewContext(read('study.js'),ctx);vm.runInNewContext(read('scope.js'),ctx);
const unit=ctx.window.CSUnits['11'],guides=ctx.window.CSStudyGuides,scopes=ctx.window.CSExtraScopes['11'];
assert.equal(unit.topics.length,8);assert.equal(unit.topics.flatMap(t=>t.questions).length,16);
let examples=0,checks=0;
for(const topic of unit.topics){
  const guide=guides[topic.id];assert(guide&&scopes[topic.id]);
  assert.equal(guide.sections.length,3);assert.equal(guide.terms.length,4);
  assert.equal(guide.examples.length,2);assert.equal(guide.checks.length,3);
  for(const example of guide.examples)assert(example.given&&example.answer&&example.steps.length>=4);
  for(const q of topic.questions)assert(q.answer>=0&&q.answer<q.options.length&&q.why.length>30);
  examples+=guide.examples.length;checks+=guide.checks.length;
}
assert.equal(examples,16);assert.equal(checks,24);
assert.equal(new Set(unit.topics.flatMap(t=>t.questions).map(q=>q.answer)).size,3);
new vm.Script(read('labs.js'));
console.log('PASS LAN/WAN/protocol failures, DNS cache/name errors, packet paths/order/loss/recovery, circuit failure, frame forwarding, provider availability, threat/control matches, firewall/proxy rules and 8-topic teaching coverage');
