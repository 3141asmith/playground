// Rebuild the bundled data using the original CDS fixed-width table and ESO list.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const dir=__dirname,read=name=>fs.readFileSync(path.join(dir,'data',name),'utf8');
const eso=JSON.parse(read('eso-types.json'));
const stars=read('synphot.dat').trimEnd().split(/\r?\n/).map(line=>{
 const number=(a,b)=>Number(line.slice(a-1,b).trim());
 const type=line.slice(22-1,27).trim(),file=line.slice(157-1,162).trim();
 const match=type.match(/^([rw]?)([OBAFGKM])(.+?)(IV|III|II|I|V)$/);assert(match,type);
 const logT=number(29,33),mbol=number(90,93),temperature=10**logT;
 const luminosity=10**((4.74-mbol)/2.5),radius=Math.sqrt(luminosity)*(5772/temperature)**2;
 const id='uk'+file.replace('m2p5v','m2.5v');assert(eso.includes(id),'Missing ESO template '+id);
 assert(temperature>0&&luminosity>0&&radius>0);
 return {id,number:number(1,3),type,group:match[2],luminosityClass:match[4],abundance:match[1]==='r'?'Metal rich':match[1]==='w'?'Metal weak':'Normal',logT,mbol,metallicity:number(84,88),temperature,luminosity,radius};
});
assert.equal(stars.length,131);assert.equal(new Set(stars.map(s=>s.id)).size,131);assert.equal(eso.length,131);
fs.writeFileSync(path.join(dir,'stars.js'),'// Pickles (1998), CDS J/PASP/110/863; see data/SOURCES.md.\nwindow.HR_STARS = '+JSON.stringify(stars,null,2)+';\n');
console.log('Built '+stars.length+' ESO-matched templates. Radius range:',Math.min(...stars.map(s=>s.radius)),Math.max(...stars.map(s=>s.radius)));
