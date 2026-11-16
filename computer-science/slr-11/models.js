(function(root){
  'use strict';
  function connection({remote=false,online=true,compatible=true}) {
    if(!compatible)return {ok:false,path:['Client','Network link','Incompatible message rules'],reason:'A working link alone is insufficient: the endpoints disagree about the message format.'};
    if(remote&&!online)return {ok:false,path:['Client NIC','Local switch','WAN link unavailable'],reason:'The remote resource needs the WAN connection. Local resources can still be reachable.'};
    return {ok:true,path:remote?['Client NIC','Local switch','Router','WAN / internet','Remote router','Remote service']:['Client NIC','Local switch','Local printer'],reason:remote?'Routers connect the local networks across the WAN.':'The local exchange stays within this LAN; the WAN need not be available.'};
  }
  function dns({cached=false,exists=true}) {
    if(cached&&exists)return [
      {node:0,text:'Ask for library.example. This model has a still-valid cached answer.',answer:null},
      {node:1,text:'The recursive resolver returns its cached address; no hierarchy lookup is needed.',answer:'192.0.2.40'},
      {node:0,text:'The client can now use 192.0.2.40 to contact the service. DNS did not transfer the page.',answer:'192.0.2.40'}
    ];
    return [
      {node:0,text:'The client asks a recursive resolver for the address of '+(exists?'library.example.':'missing.example.'),answer:null},
      {node:1,text:'No suitable cached answer: the resolver starts an illustrative hierarchy lookup.',answer:null},
      {node:2,text:'The root directs the resolver towards servers for the relevant top-level domain; it does not send the webpage.',answer:null},
      {node:3,text:'The top-level-domain server directs the resolver to the domain’s authoritative server.',answer:null},
      {node:4,text:exists?'The authoritative server supplies the address 192.0.2.40.':'The authoritative server reports that this name does not exist.',answer:exists?'192.0.2.40':null},
      {node:1,text:exists?'The resolver returns the address and can cache the result for its permitted lifetime.':'The resolver returns the name error. Negative caching is omitted in this model.',answer:exists?'192.0.2.40':null},
      {node:0,text:exists?'The client can contact the address. DNS lookup and fetching the resource are separate operations.':'The client has no address from this lookup, so it cannot continue by this name.',answer:exists?'192.0.2.40':null}
    ];
  }
  const edges=[['S','A'],['S','B'],['A','C'],['B','C'],['C','D']];
  function route(failed=false,via='A') {return ['S',failed?'B':via,'C','D'];}
  function switching({circuit=false,failed=false,loss=false,reliable=true}) {
    const states=[{path:[],received:[],message:null,text:circuit?'Establish a circuit via A before sending. Reserved capacity is a model assumption.':'Split DATA into four numbered chunks. Links are shared; no dedicated circuit is reserved.'}];
    if(circuit&&failed){states.push({path:['S','A'],received:[],message:null,text:'The established A–C circuit fails. This circuit cannot simply deliver over B without establishing a new route.'});return states;}
    const arrival=circuit?[0,1,2,3]:[1,3,0,2],received=[];
    for(const id of arrival){const path=circuit?route(false):route(failed,id%2?'B':'A');
      if(loss&&id===2){states.push({path,received:[...received],id,missing:true,message:null,text:'Chunk 3 is lost in this scripted demonstration. Packet switching itself does not guarantee retransmission.'});continue;}
      for(let hop=1;hop<path.length;hop++)states.push({path:path.slice(0,hop+1),received:[...received],id,message:null,text:`Chunk ${id+1}: forward from ${path[hop-1]} to ${path[hop]}. ${circuit?'Use the established circuit.':'This packet uses an available route.'}`});
      received.push(id);states.push({path,received:[...received],id,message:null,text:`Chunk ${id+1} arrives. Arrival order so far: ${received.map(n=>n+1).join(', ')}.`});
    }
    if(loss&&reliable){received.push(2);states.push({path:route(failed),received:[...received],id:2,message:null,text:'A simplified reliable transport detects the missing chunk and retransmits it. This is transport behaviour, not a guarantee made by IP.'});}
    const message=received.length===4?'DATA':null;
    states.push({path:[],received:[...received],message,text:message?'Reorder the numbered chunks and reconstruct DATA. Arrival order and message order are different.':'Without a recovery mechanism, chunk 3 remains missing. Do not invent the missing data.'});
    return states;
  }
  function forward(kind,destination,known=true){
    if(!['switch','hub'].includes(kind))throw Error('Choose switch or hub.');
    if(!['B','C','D'].includes(destination))throw Error('Destination must be B, C or D.');
    return {ports:kind==='switch'&&known?[destination]:['B','C','D'],reason:kind==='hub'?'The hub repeats incoming signals to the other ports.':known?'The switch has a learned destination-MAC entry and forwards this unicast frame only to the matching port.':'Unknown destination: this switch floods the frame to other ports in the model LAN. A switch does not always send to exactly one port.'};
  }
  function availability({server=true,failed=false,replica=false,request='B'}){
    const provider=server?'File server':'Peer A',ok=!failed||(!server&&replica);
    return {ok,provider,path:server?[request,'Switch',failed?'Server unavailable':'File server']:[request,'Switch',failed&&replica?'Peer C replica':failed?'Peer A unavailable':'Peer A'],text:ok?(failed?'Peer C holds a separate copy, so the requested file remains available.':'The provider returns the requested file.'):'The network may still work, but this file’s only provider is unavailable.'};
  }
  const threatData={
    phishing:{risk:'A forged message asks a pupil to enter their password on a lookalike page.',best:'training',why:'Checking the request independently and recognising suspicious messages reduces credential disclosure; a permitted web connection alone is not evidence of trust.'},
    malware:{risk:'A downloaded program tries to run unwanted code and change files.',best:'updates',why:'Updates, restricted execution and anti-malware controls reduce this risk; no single control is a guarantee.'},
    dos:{risk:'A flood of requests exhausts the service’s capacity.',best:'filter',why:'Filtering/rate limiting and upstream capacity controls can reduce the flood; local filtering alone may not prevent an upstream link being saturated.'},
    eavesdrop:{risk:'An observer copies traffic on an untrusted connection.',best:'encrypt',why:'Appropriate encryption protects content in transit; it does not make the endpoints trustworthy or hide every item of metadata.'},
    access:{risk:'An outsider tries to reach a private administration service.',best:'firewall',why:'A firewall can reject disallowed traffic, while authentication and permissions protect the service itself.'}
  };
  function threat(key,defence){const item=threatData[key];if(!item)throw Error('Unknown scenario.');return {...item,matched:item.best===defence};}
  function protection({direction='out',web=true,allowedSite=true,encrypted=true}){
    const firewall=direction==='out'&&web,proxy=firewall&&allowedSite;
    return {firewall,proxy,delivered:proxy,visible:encrypted?'Encrypted content; some connection metadata remains visible':'Readable message: Exam revision at 4 pm',reason:!firewall?'The firewall rejects this request under the displayed rules.':!proxy?'The outbound request passes the firewall, but the proxy’s site policy rejects it.':'The request passes both displayed policies. That does not prove the site or endpoint is safe.'};
  }
  const api={connection,dns,switching,forward,availability,threat,protection,edges};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.NetworkModels=api;
})(typeof window!=='undefined'?window:globalThis);
