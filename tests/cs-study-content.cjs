const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const M = require('../computer-science/shared/models.js');
const S = require('../computer-science/slr-09/models.js');
const context = {window: {}};
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
vm.runInNewContext(read('computer-science/shared/content.js'), context);
const guides = {};
let examples = 0, checks = 0;
for (const id of ['02', '03', '04', '09']) {
  vm.runInNewContext(read(`computer-science/shared/study-${id}.js`), context);
  const unit = guides[id] = context.window.CSStudyGuides;
  const expected = id === '09' ? ['compression','coding','encryption','hashing'] : context.window.CSUnits[id].topics.map(t => t.id);
  assert.deepEqual(Object.keys(unit), Array.from(expected));
  for (const [key, guide] of Object.entries(unit)) {
    assert(guide.sections.length >= 3, `${id}/${key} needs a developed explanation`);
    assert(guide.examples.length >= 2, `${id}/${key} needs worked reasoning`);
    assert.equal(guide.checks.length, 3);
    assert.equal(guide.terms.length, 4);
    for (const example of guide.examples) {
      assert(example.given && example.answer && example.steps.length >= 3);
      if (example.table) for (const row of example.table.rows) assert.equal(row.length, example.table.head.length);
    }
    for (const section of guide.sections) assert(section.length >= 3);
    examples += guide.examples.length; checks += guide.checks.length;
  }
  const html = read(`computer-science/slr-${id}/index.html`);
  assert(html.indexOf(`study-${id}.js`) < html.indexOf('shared/study.js'));
  assert(html.includes('shared/study.css'));
}
assert.equal(examples, 42); assert.equal(checks, 57);

// Cross-check worked traces against the original independently implemented labs.
const text = (unit, key) => JSON.stringify(guides[unit][key]);
assert.equal(M.parallel(.5, 4).time, 62.5);
assert(text('02','parallel').includes('62.5'));
assert.equal(M.gpu(16, false).length, 4);
assert.equal(M.gpu(16, true).length, 64);
const paging = M.paging([0,1,2,0,3,0]).at(-1);
assert.equal(paging.faults, 5);
assert.deepEqual(paging.frames, [3,0,2]);
assert(text('04','memory').includes('Total faults = 5'));
const jobs = [{arrival:0,burst:6},{arrival:0,burst:2},{arrival:0,burst:1}];
const waits = policy => M.schedule(jobs, policy, 2).jobs.map(j => j.waiting);
assert.deepEqual(waits('fcfs'), [0,6,8]);
assert.deepEqual(waits('sjf'), [3,1,0]);
assert.deepEqual(waits('rr'), [3,2,4]);
assert.deepEqual(M.schedule(jobs,'rr',2).jobs.map(j=>j.response), [0,2,4]);
const srtf = M.schedule([{arrival:0,burst:7},{arrival:2,burst:2}], 'srtf');
assert.equal(srtf.jobs[0].finish, 9); assert.equal(srtf.jobs[1].finish, 4);
// Check literal numerical statements against independently calculated results.
assert.equal(7 * 1024 + (2500 % 1024), 7620);
assert(text('04','memory').includes('7,620'));
assert.equal(96 * 64 * 3 * 8 / 8, 18432);
assert.equal(96 * 64 * 3 * 4 / 8, 9216);
assert(text('09','compression').includes('18,432'));
assert(text('09','compression').includes('9,216'));
assert.equal((67+65+84)%10, 6);
assert(text('09','hashing').includes('216 mod 10 = 6'));
// Shared scripts must parse, even though browser-only DOM code is not executed here.
new vm.Script(read('computer-science/shared/study.js'));
assert(S, 'Original SLR 9 models remain importable');
console.log('PASS all 19 topics, 42 worked examples, 57 explained checks, worked FIFO/CPU schedules, address translation, quantisation sizes and hash collision');
