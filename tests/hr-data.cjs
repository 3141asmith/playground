const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {deduplicate}=require('../hr/catalogue-data.cjs');
const row=(id,name,extra={})=>({catalogueId:id,name,aliases:['Shared system alias'],temperature:6000,luminosity:null,radius:1,...extra});
const records=[row('1','Binary A'),row('2','Binary B'),row('1','Alternate name A',{luminosity:2}),row('3',' binary a '),row('4','Other star',{temperature:6000})];
const result=deduplicate(records);assert.equal(result.objects.length,3);assert.equal(result.duplicates.length,2);assert.equal(result.objects[0].luminosity,2);assert(result.objects[0].aliases.includes('Alternate name A'));assert(result.objects.some(s=>s.name==='Binary B'));assert(result.objects.some(s=>s.name==='Other star'));assert.equal(records[0].luminosity,null);
const context={window:{}};vm.runInNewContext(fs.readFileSync('hr/catalogue.js','utf8'),context);const stars=context.window.HR_CATALOGUE,named=stars.filter(s=>s.source==='catalogue');assert.equal(new Set(stars.map(s=>s.id)).size,stars.length);assert.equal(new Set(named.map(s=>s.name.toLowerCase().replace(/\s/g,''))).size,named.length);
assert.equal(stars.filter(s=>s.source==='eso').length,131);assert(stars.some(s=>s.name==='Sol'));assert(stars.some(s=>s.id==='ukg2v'));assert(named.some(s=>s.name==='Sirius A'));assert(named.some(s=>s.name==='Sirius B'));
for(const s of named){assert([s.temperature,s.luminosity,s.radius].every(v=>Number.isFinite(v)&&v>0));if(s.luminosityMethod==='derived from R and T')assert(Math.abs(s.luminosity-s.radius**2*(s.temperature/5772)**4)<1e-12);}
assert.equal(context.window.HR_COVERAGE.totalPoints,stars.length);assert.equal(context.window.HR_COVERAGE.plottedNamedObjects,named.length);
console.log('PASS catalogue ID and canonical-name deduplication, shared aliases preserve components, equal physical values preserve separate stars, derived luminosities and import coverage');
