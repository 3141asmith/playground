(() => {
  'use strict';
  const $=id=>document.getElementById(id),scripts=window.PythonScripts;
  const custom={id:'custom',title:'Your script',group:'Your workspace',description:'Write your own Python, or open a .py file. Use print() for output and enter any input() answers in the input box before running.',scope:'Programming practice. Named cipher algorithms and cryptography-library details are supporting examples rather than additional OCR encryption requirements.',challenge:'Start with print("Hello!"). You can import Python standard-library modules and packages available in this Pyodide distribution.',code:'# Write your Python here.\nprint("Hello, Playground!")\n'};
  const all=[...scripts,custom],key='playground-python-drafts-v1';
  let saved={},storageOK=true,current=null,worker=null,sequence=0,active=null,timeout=null,saveTimer=null,outputLength=0;
  try{const data=JSON.parse(localStorage.getItem(key)||'{}');for(const item of all){const draft=data[item.id];if(draft&&typeof draft.code==='string'&&typeof draft.stdin==='string')saved[item.id]=draft;}}catch{storageOK=false;}
  function status(text,state='ready'){$('runtime-status').textContent=text;$('runtime-status').dataset.state=state;}
  function save(){if(!current)return;saved[current.id]={code:$('code').value,stdin:$('stdin').value};try{localStorage.setItem(key,JSON.stringify(saved));storageOK=true;}catch{storageOK=false;}$('draft-state').textContent=storageOK?'Draft saved on this device':'Draft kept in this session';}
  function position(){const area=$('code'),before=area.value.slice(0,area.selectionStart),lines=before.split('\n');$('cursor-position').textContent=`Line ${lines.length}, column ${lines.at(-1).length+1}`;}
  function numbers(){$('line-numbers').textContent=Array.from({length:$('code').value.split('\n').length},(_,i)=>i+1).join('\n');$('line-numbers').scrollTop=$('code').scrollTop;position();}
  function changed(){numbers();$('draft-state').textContent='Saving draft…';clearTimeout(saveTimer);saveTimer=setTimeout(save,250);}
  function choose(id){
    const script=all.find(item=>item.id===id)||scripts[0];if(current){clearTimeout(saveTimer);save();}
    current=script;const draft=saved[script.id];$('code').value=draft?.code??script.code;$('stdin').value=draft?.stdin??script.stdin??'';
    $('script-title').textContent=script.title;$('script-category').textContent=script.group.toUpperCase();$('script-description').textContent=script.description;$('scope-description').textContent=script.scope;$('script-challenge').textContent=script.challenge;
    $('reset').textContent=id==='custom'?'Reset script':'Reset example';$('draft-state').textContent=draft?'Your saved draft':'Original example';$('code').setSelectionRange(0,0);$('code').scrollTop=0;$('code').scrollLeft=0;numbers();
    document.querySelectorAll('#script-list button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.script===script.id)));
    try{history.replaceState(null,'','#'+script.id);}catch{}
    if(active===null){$('output').replaceChildren();outputLength=0;status('Ready. Run this script to see its output.');}
  }
  function library(){const query=$('script-search').value.trim().toLocaleLowerCase();$('script-list').replaceChildren();let count=0;
    for(const group of new Set(scripts.map(item=>item.group))){const entries=scripts.filter(item=>item.group===group&&`${item.title} ${item.description}`.toLocaleLowerCase().includes(query));if(!entries.length)continue;const section=document.createElement('section'),title=document.createElement('h2');title.textContent=group;section.append(title);for(const item of entries){const button=document.createElement('button');button.type='button';button.textContent=item.title;button.dataset.script=item.id;button.setAttribute('aria-pressed',String(current?.id===item.id));button.onclick=()=>choose(item.id);section.append(button);count++;}$('script-list').append(section);}$('search-empty').hidden=count!==0;
  }
  function busy(value){$('run').disabled=value;$('stop').disabled=!value;$('new-script').disabled=value;$('reset').disabled=value;$('upload').disabled=value;document.querySelectorAll('#script-list button').forEach(button=>button.disabled=value);}
  function append(text,channel='stdout'){
    const remaining=60000-outputLength;if(remaining<=0)return;const node=document.createElement('span');node.textContent=text.slice(0,remaining);if(channel==='stderr')node.className='stderr';$('output').append(node);outputLength+=node.textContent.length;$('output').scrollTop=$('output').scrollHeight;
  }
  function finish(text,state='ready'){clearTimeout(timeout);timeout=null;active=null;busy(false);status(text,state);}
  function terminate(text){worker?.terminate();worker=null;finish(text);}
  function startWorker(){
    worker=new Worker('worker.js?v=1');
    worker.onmessage=({data})=>{
      if(data.id!==active)return;
      if(data.type==='status')status(data.text,'loading');
      if(data.type==='output')append(data.text,data.channel);
      if(data.type==='executing'){
        status(`Running with Python ${data.version}…`,'running');clearTimeout(timeout);
        timeout=setTimeout(()=>{append('\n[Execution stopped after 30 seconds.]\n','stderr');terminate('Time limit reached. Edit the code and run again.');},30000);
      }
      if(data.type==='done')finish(`Finished in ${(data.elapsed/1000).toFixed(2)} s.`, 'ready');
      if(data.type==='failed'){append(data.text+'\n','stderr');finish(data.phase==='loading'?'Python or its packages could not load. Check your connection and try Run again.':'Python reported an error. Check the output for the line and message.','error');}
    };
    worker.onerror=event=>{event.preventDefault();append((event.message||'The Python runtime could not be loaded.')+'\n','stderr');worker?.terminate();worker=null;finish('Unable to run Python. Check your connection, then try Run again.','error');};
  }
  function run(){if(active!==null)return;save();$('output').replaceChildren();outputLength=0;active=++sequence;busy(true);status('Preparing Python…','loading');
    try{if(!worker)startWorker();worker.postMessage({type:'run',id:active,code:$('code').value,stdin:$('stdin').value});timeout=setTimeout(()=>{append('\n[Python or its packages did not finish loading. Try again with a working connection.]\n','stderr');terminate('Loading timed out. Your code is still in the editor.');},120000);}catch(error){append(error.message+'\n','stderr');worker?.terminate();worker=null;finish('The Python worker could not start.','error');}
  }
  $('run').onclick=run;$('stop').onclick=()=>{append('\n[Stopped by you. The Python runtime has been reset.]\n','stderr');terminate('Stopped. Run again when you are ready.');};
  $('clear-output').onclick=()=>{$('output').replaceChildren();outputLength=0;};
  $('reset').onclick=()=>{if($('code').value!==current.code&&!confirm('Replace this draft with the original example? Download it first if you want a separate copy.'))return;$('code').value=current.code;$('stdin').value=current.stdin||'';numbers();save();};
  $('new-script').onclick=()=>choose('custom');$('script-search').oninput=()=>{library();if(active!==null)busy(true);};
  $('download').onclick=()=>{save();const url=URL.createObjectURL(new Blob([$('code').value],{type:'text/x-python;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=current.id==='custom'?'playground.py':current.id+'.py';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  $('upload').onclick=()=>$('file-input').click();$('file-input').onchange=async()=>{const file=$('file-input').files[0];if(!file)return;if(file.size>250000){status('Choose a Python source file smaller than 250 KB.','error');$('file-input').value='';return;}try{const code=await file.text();choose('custom');$('code').value=code;numbers();save();status('Opened '+file.name+'. Run it when you are ready.');}catch(error){status('The file could not be read: '+error.message,'error');}$('file-input').value='';};
  $('code').addEventListener('input',changed);$('stdin').addEventListener('input',changed);$('code').addEventListener('scroll',()=>{$('line-numbers').scrollTop=$('code').scrollTop;});for(const event of ['click','keyup','select'])$('code').addEventListener(event,position);
  $('code').addEventListener('keydown',event=>{
    const area=$('code');if(event.key==='Tab'){
      event.preventDefault();const start=area.selectionStart,end=area.selectionEnd,lineStart=area.value.lastIndexOf('\n',start-1)+1;
      if(start===end&&!event.shiftKey){area.setRangeText('    ',start,end,'end');}
      else{const lastIncluded=end>start&&area.value[end-1]==='\n'?end-1:end,lineEnd=area.value.indexOf('\n',lastIncluded),stop=lineEnd<0?area.value.length:lineEnd,chunk=area.value.slice(lineStart,stop),replacement=chunk.split('\n').map(line=>event.shiftKey?line.replace(/^ {1,4}/,''):'    '+line).join('\n');area.setRangeText(replacement,lineStart,stop,'select');}
      changed();
    }else if(event.key==='Enter'&&!event.ctrlKey&&!event.metaKey){event.preventDefault();const start=area.selectionStart,line=area.value.slice(area.value.lastIndexOf('\n',start-1)+1,start),indent=line.match(/^ */)[0]+(line.trimEnd().endsWith(':')?'    ':'');area.setRangeText('\n'+indent,start,area.selectionEnd,'end');changed();}
  });
  document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();run();}});
  window.addEventListener('pagehide',()=>{clearTimeout(saveTimer);save();worker?.terminate();});
  window.addEventListener('hashchange',()=>{if(active===null)choose(location.hash.slice(1));});
  library();choose(location.hash.slice(1)||scripts[0].id);document.body.dataset.ready='true';
})();
