// Run once to prepare the bundled, real-codec examples; not needed by the website.
// node audio/build-audio.cjs /path/to/ffmpeg[.exe]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=__dirname,ffmpeg=process.argv[2]||'ffmpeg',ffprobe=path.join(path.dirname(ffmpeg),process.platform==='win32'?'ffprobe.exe':'ffprobe'),data=path.join(root,'data'),source=path.join(data,'source.wav');
const run=(args)=>execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-y',...args],{maxBuffer:32*1024*1024});
const probe=file=>JSON.parse(execFileSync(ffprobe,['-v','error','-show_streams','-show_format','-of','json',file],{encoding:'utf8'}));
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const original=fs.readFileSync(source);if(crypto.createHash('sha1').update(original).digest('hex')!=='e8c449fba4fe1eb5e67e0923b6b696f2105584c5')throw Error('Unexpected piano source; verify provenance before rebuilding');
const info=probe(source),stream=info.streams.find(s=>s.codec_type==='audio'),duration=Number(info.format.duration);if(Number(stream.sample_rate)!==44100||stream.channels!==2||stream.bits_per_sample!==16)throw Error('Unexpected source format');
const variants=[],rates=[44100,22050,11025],refs={};
function record(codec,rate,file,settings={}){
 const audio=probe(file).streams.find(s=>s.codec_type==='audio');if(Number(audio.sample_rate)!==rate||audio.channels!==2)throw Error('Encoder changed sample rate or channel count');
 const pcm=run(['-i',file,'-map','0:a:0','-c:a','pcm_s16le','-f','s16le','-']),pcmHash=hash(pcm),reference=refs[rate],sameAsRateReference=pcmHash===reference;
 if((codec==='wav'||codec==='flac')&&!sameAsRateReference)throw Error('Lossless round trip changed samples');
 const id=[codec,rate,settings.targetKbps??settings.level??'pcm'].join('-');
 const entry={id,codec,sampleRate:rate,channels:2,bits:codec==='wav'||codec==='flac'?16:null,duration,file:'data/'+path.basename(file),bytes:fs.statSync(file).size,...settings,decodedPcmSha256:pcmHash,sameAsRateReference,identicalToSource:rate===44100&&sameAsRateReference};variants.push(entry);
}
for(const rate of rates){
 const master=rate===44100?source:path.join(data,`pcm-${rate}.wav`);
 if(rate!==44100)run(['-i',source,'-map_metadata','-1','-af',`aresample=${rate}:filter_size=64:cutoff=0.95`,'-ar',String(rate),'-c:a','pcm_s16le','-bitexact',master]);
 refs[rate]=hash(run(['-i',master,'-c:a','pcm_s16le','-f','s16le','-']));record('wav',rate,master);
 for(const level of [0,5,8]){const file=path.join(data,`flac-${rate}-${level}.flac`);run(['-i',master,'-map_metadata','-1','-c:a','flac','-compression_level',String(level),file]);record('flac',rate,file,{level});}
 const mp3Rates=rate===44100?[32,64,96,128,192,320]:rate===22050?[16,32,64,96,128]:[8,16,32,48,64];
 for(const kbps of mp3Rates){const file=path.join(data,`mp3-${rate}-${kbps}.mp3`);run(['-i',master,'-map_metadata','-1','-c:a','libmp3lame','-b:a',`${kbps}k`,'-ar',String(rate),file]);record('mp3',rate,file,{targetKbps:kbps});}
 const aacRates=rate===44100?[32,64,96,128,192,256]:rate===22050?[16,32,64,96,128]:[16,24,32,48,64];
 for(const kbps of aacRates){const file=path.join(data,`aac-${rate}-${kbps}.m4a`);run(['-i',master,'-map_metadata','-1','-c:a','aac','-b:a',`${kbps}k`,'-ar',String(rate),'-movflags','+faststart',file]);record('aac',rate,file,{targetKbps:kbps});}
}
const manifest={title:'Emotional Piano',author:'triangelx',sourceUrl:'https://commons.wikimedia.org/wiki/File:Emotional_piano.wav',originalUrl:'https://freesound.org/people/triangelx/sounds/189175/',license:'CC0 1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',sourceSha1:'e8c449fba4fe1eb5e67e0923b6b696f2105584c5',duration,sourceRate:44100,channels:2,bitDepth:16,referenceId:'wav-44100-pcm',encoder:execFileSync(ffmpeg,['-version'],{encoding:'utf8'}).split(/\r?\n/)[0],variants};
fs.writeFileSync(path.join(root,'catalogue.json'),JSON.stringify(manifest,null,2)+'\n');console.log(`Prepared ${variants.length} real encodings (${(variants.reduce((s,v)=>s+v.bytes,0)/1e6).toFixed(2)} MB). Verified all WAV/FLAC PCM hashes.`);
