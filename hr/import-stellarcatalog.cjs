// Run with Node --use-system-ca. Resumable public-page import; never executes source HTML/JS.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),cache=path.join(root,'artifacts','stellar-cache');fs.mkdirSync(cache,{recursive:true});
const clean=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]*>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&(?:minus|ndash);/g,'−').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
function parse(html,url){
 const sections=[...html.matchAll(/<h2 class=['"]title['"]>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2\b|$)/g)],result=[];
 const ld=[...html.matchAll(/<script type=['"]application\/ld\+json['"]>([\s\S]*?)<\/script>/g)].map(m=>{try{return JSON.parse(m[1]);}catch{return {};}}).find(o=>o['@type']==='Thing')||{};
 for(const [index,m]of sections.entries()){
  const body=m[2],id=body.match(/infocircle_(\d+)_/),text=clean(body);if(!id)continue;
  const val=pattern=>{const value=text.match(pattern)?.[1];if(!value)return null;const n=Number(value.replace(/,/g,''));return Number.isFinite(n)&&n>0?n:null;};
  const temperature=val(/Temperature:\s*([\d.,eE+-]+)\s*K\b/),luminosity=val(/Luminosity:\s*([\d.,eE+-]+)\s*L\b/);
  const radius=val(/Radius of the star .+? is ([\d.,eE+-]+) solar radii/),percent=val(/Size:\s*([\d.,eE+-]+)\s*%/);
  const type=clean(body.match(/Spectral class:\s*<span[^>]*>(.*?)<\/span>/)?.[1]||'')||'Not listed';
  const category=clean(body.match(/<div class=['"]noteBig['"]>(.*?)<\/div>/)?.[1]||'').replace(/,.*$/,'');
  result.push({catalogueId:id[1],name:clean(m[1]),type,category,temperature,luminosity,radius:radius||percent/100||null,radiusMethod:radius?'catalogue':percent?'catalogue-rounded':'derived',aliases:index===0?(ld.alternateName||'').split(',').map(s=>s.trim()).filter(Boolean):[],url});
 }
 return result;
}
async function run(){
 const index=fs.readFileSync(path.join(root,'artifacts','stellarcatalog-all.html'),'utf8');
 const slugs=[...new Set([...index.matchAll(/href=['"]stars\/([^'"?#]+)['"]/g)].map(m=>m[1]))];assert(slugs.length>10000);
 let done=0,cursor=0,failed=[],rateLimited=false;const started=Date.now();
 async function worker(){while(cursor<slugs.length&&!rateLimited){const slug=slugs[cursor++],file=path.join(cache,slug+'.json');if(!fs.existsSync(file)){
   try{const url='https://www.stellarcatalog.com/stars/'+slug,r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(r.status===429){rateLimited=true;throw Error('Rate limited; Retry-After: '+(r.headers.get('retry-after')||'not specified'));}if(!r.ok)throw Error('HTTP '+r.status);const html=await r.text();const records=parse(html,url);if(!records.length)throw Error('No identifiable stellar sections');fs.writeFileSync(file,JSON.stringify(records));}
   catch(e){failed.push({slug,error:e.message});}
   if(!rateLimited)await new Promise(r=>setTimeout(r,2000));
  }done++;if(done%100===0)console.log(`${done}/${slugs.length} pages; failures ${failed.length}; ${Math.round((Date.now()-started)/1000)}s`);
 }}
 if(process.argv.includes('--offline'))rateLimited=true;else await worker();
 fs.writeFileSync(path.join(cache,'failures.json'),JSON.stringify(failed,null,2));
 const records=slugs.flatMap(slug=>{const file=path.join(cache,slug+'.json');return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[];});
 fs.writeFileSync(path.join(__dirname,'data','stellar-records.json'),JSON.stringify(records));
 const completedPages=slugs.filter(slug=>fs.existsSync(path.join(cache,slug+'.json'))).length;
 fs.writeFileSync(path.join(__dirname,'data','stellar-import.json'),JSON.stringify({retrieved:'2026-10-13',indexUrl:'https://www.stellarcatalog.com/allstars.php',indexPages:slugs.length,completedPages,unretrievedPages:slugs.length-completedPages,rateLimited,failedPages:failed,rawComponents:records.length},null,2));
 console.log('Snapshot saved:',completedPages,'of',slugs.length,'pages;',records.length,'components;',failed.length,'failures; rate limited:',rateLimited);if(failed.length)process.exitCode=1;
}
if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={parse};
