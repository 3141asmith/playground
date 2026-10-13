// Combine named catalogue objects with ESO templates without treating a spectral type as an identity.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=__dirname,read=name=>JSON.parse(fs.readFileSync(path.join(dir,'data',name),'utf8'));
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(dir,'stars.js'),'utf8'),context);
const templates=context.window.HR_STARS.map(s=>({...s,source:'eso',name:s.type,radiusMethod:'derived',temperatureMethod:'Pickles calibration',luminosityMethod:'Pickles bolometric magnitude'}));
const rows=read('stellar-records.json'),meta=read('stellar-import.json');
const {objects,duplicates}=require('./catalogue-data.cjs').deduplicate(rows);
const omitted=[],named=[];
for(const row of objects){
 let {temperature,luminosity,radius}=row;let temperatureMethod='catalogue',luminosityMethod='catalogue',radiusMethod=row.radiusMethod;
 if(!temperature&&luminosity&&radius){temperature=5772*(luminosity/radius**2)**.25;temperatureMethod='derived from L and R';}
 if(!luminosity&&temperature&&radius){luminosity=radius**2*(temperature/5772)**4;luminosityMethod='derived from R and T';}
 if(!radius&&temperature&&luminosity){radius=Math.sqrt(luminosity)*(5772/temperature)**2;radiusMethod='derived';}
 if(![temperature,luminosity,radius].every(v=>Number.isFinite(v)&&v>0)){omitted.push({id:row.catalogueId,name:row.name,reason:'Insufficient positive temperature, luminosity and radius data (need any two)'});continue;}
 const group=/white dwarf/i.test(row.category)?'D':row.type.match(/^(?:(?:esd|usd|sd|d)(?=[OBAFGKM]))?([OBAFGKMLTYCSWD])/i)?.[1].toUpperCase()||'?';
 const luminosityClass=row.type.match(/\b(IV|III|II|I|V)(?:[ab]|e)?\b/)?.[1]||'';
 named.push({...row,id:'sc-'+row.catalogueId,source:'catalogue',group,luminosityClass,abundance:'Not listed',temperature,luminosity,radius,temperatureMethod,luminosityMethod,radiusMethod});
}
const all=[...templates,...named];assert.equal(new Set(all.map(s=>s.id)).size,all.length);
const report={...meta,rawComponents:rows.length,duplicateRecordsRemoved:duplicates.length,uniqueNamedObjects:objects.length,plottedNamedObjects:named.length,omittedObjects:omitted.length,esoTemplates:templates.length,totalPoints:all.length,duplicates,omitted};
fs.writeFileSync(path.join(dir,'catalogue.js'),'// Public catalogue snapshot; sources and import coverage in data/SOURCES.md.\nwindow.HR_CATALOGUE = '+JSON.stringify(all)+';\nwindow.HR_COVERAGE = '+JSON.stringify({...report,duplicates:undefined,omitted:undefined,failedPages:undefined})+';\n');
fs.writeFileSync(path.join(dir,'data','import-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,duplicates:undefined,omitted:undefined,failedPages:undefined},null,2));
