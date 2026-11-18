/* CPython runs off the UI thread so Stop works without SharedArrayBuffer. */
'use strict';
const INDEX_URL='https://cdn.jsdelivr.net/pyodide/v0.29.3/full/';
let runtime=null,activeId=null;
const send=(type,data={})=>postMessage({type,id:activeId,...data});
self.onmessage=async({data})=>{
  if(data.type!=='run')return;
  activeId=data.id;
  let globals,bytes=0,truncated=false,phase='loading',pending='',pendingChannel='stdout';
  const flush=()=>{if(pending){send('output',{channel:pendingChannel,text:pending});pending='';}};
  try{
    if(!runtime){
      send('status',{text:'Loading Python for the first run…'});
      importScripts(INDEX_URL+'pyodide.js');
      runtime=await loadPyodide({indexURL:INDEX_URL});
    }
    const decoders={stdout:new TextDecoder(),stderr:new TextDecoder()};
    const output=(channel,buffer)=>{
      if(bytes<50000){
        const remaining=50000-bytes,slice=buffer.subarray(0,remaining);
        bytes+=slice.length;
        if(channel!==pendingChannel){flush();pendingChannel=channel;}
        pending+=decoders[channel].decode(slice,{stream:true});
        if(pending.length>=1024)flush();
      }else if(!truncated){truncated=true;flush();send('output',{channel:'stderr',text:'\n[Output limited to 50 KB. Stop is available for a running program.]\n'});}
      return buffer.length;
    };
    runtime.setStdout({write:buffer=>output('stdout',buffer)});
    runtime.setStderr({write:buffer=>output('stderr',buffer)});
    const lines=data.stdin===''?[]:data.stdin.replace(/\r\n?/g,'\n').split('\n');
    if(lines.length>1&&lines.at(-1)==='')lines.pop();
    runtime.setStdin({stdin:()=>lines.length?lines.shift():null});
    send('status',{text:'Checking imports and loading supported packages…'});
    await runtime.loadPackagesFromImports(data.code,{messageCallback:text=>send('status',{text}),errorCallback:text=>send('output',{channel:'stderr',text:text+'\n'})});
    globals=runtime.runPython("dict(__name__='__main__')");
    phase='execution';
    send('executing',{version:runtime.runPython('import sys; sys.version.split()[0]')});
    const started=performance.now();
    const result=await runtime.runPythonAsync(data.code,{globals,filename:'student.py'});
    if(result&&typeof result.destroy==='function')result.destroy();
    flush();send('done',{elapsed:performance.now()-started});
  }catch(error){flush();send('failed',{text:error.message||String(error),phase});}
  finally{globals?.destroy();}
};
