(() => {
  'use strict';
  const M=window.NetworkModels,controllers=[];
  const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const select=(id,label,options)=>`<div class="field"><label for="${id}">${label}</label><select id="${id}">${options.map(([value,text])=>`<option value="${value}">${text}</option>`).join('')}</select></div>`;
  function setup(host,controls,note){
    host.innerHTML=`<div class="lab-controls">${controls}</div><div class="network-viz"></div><div class="readouts"></div><p class="small model-note"></p>`;
    host.querySelector('.model-note').textContent=note;
    return {q:s=>host.querySelector(s),viz:host.querySelector('.network-viz'),cards:entries=>{
      host.querySelector('.readouts').replaceChildren(...entries.map(([label,value])=>{const d=el('div');d.append(el('span',label),el('strong',String(value)));return d;}));
    }};
  }
  function trace(host,states,draw){
    const transport=el('div',undefined,'transport'),play=el('button','Play','primary'),step=el('button','Step →'),reset=el('button','Restart'),slider=el('input'),caption=el('p','','live-caption');
    slider.type='range';slider.min=0;slider.step=1;slider.setAttribute('aria-label','Animation position');caption.setAttribute('role','status');
    transport.append(play,step,reset);host.append(transport,slider,caption);let index=0,timer=null;
    const pause=()=>{clearInterval(timer);timer=null;play.textContent='Play';};
    function render(){slider.max=states.length-1;slider.value=index;step.disabled=index>=states.length-1;caption.textContent=draw(states[index],index)||'';}
    function advance(){if(index<states.length-1)index++;render();if(index===states.length-1)pause();}
    play.onclick=()=>{if(timer!==null){pause();return;}if(index===states.length-1)index=0;render();play.textContent='Pause';timer=setInterval(advance,700);};
    step.onclick=()=>{pause();advance();};reset.onclick=()=>{pause();index=0;render();};slider.oninput=()=>{pause();index=Number(slider.value);render();};
    const controller={pause,replace(next){pause();index=0;states=next;render();}};controllers.push(controller);render();return controller;
  }
  function flow(parent,names,active=names.length-1){parent.className='network-viz flow-diagram';parent.replaceChildren(...names.map((name,i)=>el('div',name,'flow-node'+(i===active?' current':i<active?' completed':''))));}
  function status(host){const p=el('p','','live-caption');p.setAttribute('role','status');host.append(p);return p;}
  function svgNode(tag,attrs,text){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
  function packetMap(parent,state,failed,circuit){
    const points={S:[70,130],A:[240,60],B:[240,200],C:[410,130],D:[580,130]},svg=svgNode('svg',{viewBox:'0 0 650 270',role:'img','aria-label':`Packet path ${state.path.join(' to ')||'not started'}. ${failed?'Link A to C unavailable.':''}`});
    for(const [a,b]of M.edges){const down=failed&&a==='A'&&b==='C',used=state.path.some((node,i)=>node===a&&state.path[i+1]===b);svg.append(svgNode('line',{x1:points[a][0],y1:points[a][1],x2:points[b][0],y2:points[b][1],stroke:down?'#b64223':used?'#36715e':'#b9c2af','stroke-width':used?6:3,...(down?{'stroke-dasharray':'6 6'}:{})}));}
    for(const [name,[x,y]]of Object.entries(points)){svg.append(svgNode('circle',{cx:x,cy:y,r:24,fill:state.path.at(-1)===name?'#36715e':'#e4e9db',stroke:'#8ca282'}),svgNode('text',{x,y:y+5,'text-anchor':'middle',fill:state.path.at(-1)===name?'white':'#262823','font-size':15},name));}
    svg.append(svgNode('text',{x:325,y:258,'text-anchor':'middle','font-size':12,fill:'#6b7065'},circuit?'Established circuit: S → A → C → D':'Shared packet network: alternative routes through A or B'));
    parent.className='network-viz';parent.replaceChildren(svg);
  }
  const labs={
    networks(host){
      const view=setup(host,select('resource','Resource',[['local','Local printer'],['remote','Remote library service']])+select('wan','WAN connection',[['up','Available'],['down','Unavailable']])+select('protocol','Message rules',[['match','Compatible'],['mismatch','Incompatible']]),'Local conceptual model: no actual network request is made. The path omits many implementation details. Bandwidth and latency values are not inferred from the diagram.');
      const message=status(host);
      function render(){const result=M.connection({remote:view.q('#resource').value==='remote',online:view.q('#wan').value==='up',compatible:view.q('#protocol').value==='match'});flow(view.viz,result.path);view.cards([['Reachable',result.ok?'Yes':'No'],['Scope',view.q('#resource').value==='local'?'Within LAN':'Across WAN']]);message.textContent=result.reason;}
      host.querySelectorAll('select').forEach(input=>input.onchange=render);render();
    },
    stack(host){
      const view=setup(host,select('transport','Transport example',[['tcp','TCP: reliable ordered stream'],['udp','UDP: datagrams without built-in reliable delivery']]),'A four-layer TCP/IP teaching trace, not a packet capture. Protocol names and header sketches are supporting examples. The sketch omits handshakes, encryption, segmentation and changing link headers at intermediate routers.');
      const layers=['Application','Transport','Internet','Link'],responsibilities=['Create or interpret an application message.','Deliver between application endpoints; TCP adds reliable ordered stream behaviour.','Address and forward IP packets across networks.','Carry a frame over the current local link.'];
      const order=[0,1,2,3,3,2,1,0];
      const t=trace(host,order,(layer,i)=>{
        const tcp=view.q('#transport').value==='tcp',sender=i<4;
        const columns=el('div',undefined,'stack-columns');
        for(const [side,active]of [['Sender',sender],['Receiver',!sender]]){const column=el('div');column.append(el('h4',side));layers.forEach((name,j)=>column.append(el('div',name,'layer-card'+(active&&j===layer?' current':''))));columns.append(column);}
        const packet=el('div',undefined,'packet-envelope');
        const content=['Application data',...(layer>=1?[tcp?'TCP header':'UDP header']:[]),...(layer>=2?['IP header']:[]),...(layer>=3?['Link header/trailer']:[])].reverse();
        content.forEach(text=>packet.append(el('span',text)));view.viz.replaceChildren(columns,packet);
        view.cards([['Current layer',layers[layer]],['Direction',sender?'Encapsulate':'Decapsulate'],['Transport',tcp?'TCP':'UDP']]);
        return `${sender?'Sender':'Receiver'}: ${layers[layer]}. ${layer===1&&!tcp?'Deliver a datagram to an application endpoint; UDP alone does not supply retransmission or ordered delivery.':responsibilities[layer]} ${i===7?'The application receives the interpreted data.':''}`;
      });
      view.q('#transport').onchange=()=>t.replace(order);
    },
    dns(host){
      const view=setup(host,select('dns-cache','Resolver cache',[['cold','No cached answer'],['warm','Valid cached answer']])+select('dns-name','Hostname',[['found','library.example'],['missing','missing.example']]),'Fictional .example hierarchy and documentation address 192.0.2.40. All stages run locally. Real DNS may use cached referrals, multiple records and failures; this trace omits negative caching and DNSSEC.');
      let states;const build=()=>M.dns({cached:view.q('#dns-cache').value==='warm',exists:view.q('#dns-name').value==='found'});
      const labels=['Client','Recursive resolver','Root','Top-level domain','Authoritative'];
      const t=trace(host,build(),s=>{flow(view.viz,labels,s.node);view.cards([['Resolved address',s.answer||'Not available yet'],['Requested name',view.q('#dns-name').value==='found'?'library.example':'missing.example']]);return s.text;});
      host.querySelectorAll('select').forEach(input=>input.onchange=()=>{states=build();t.replace(states);});
    },
    switching(host){
      const view=setup(host,select('switch-mode','Switching method',[['packet','Packet switched'],['circuit','Circuit switched']])+select('failed-link','Link A–C',[['up','Available'],['down','Failed']])+select('packet-loss','Scripted loss',[['none','No loss'],['drop','Lose chunk 3']])+select('recovery','Transport recovery',[['reliable','Simplified reliable transport'],['none','No retransmission']]),'Scripted conceptual routes and arrival order, not a routing algorithm or timing benchmark. Four numbered one-character chunks form DATA. Retransmission illustrates a transport responsibility; IP alone does not promise recovery. For the circuit example, the established route is fixed through A.');
      const settings=()=>({circuit:view.q('#switch-mode').value==='circuit',failed:view.q('#failed-link').value==='down',loss:view.q('#packet-loss').value==='drop',reliable:view.q('#recovery').value==='reliable'});
      const t=trace(host,M.switching(settings()),s=>{
        const opts=settings();packetMap(view.viz,s,opts.failed,opts.circuit);
        const received=el('div',undefined,'received-chunks');s.received.forEach(id=>received.append(el('span',`${id+1}: ${'DATA'[id]}`,'chip')));view.viz.append(received);
        view.cards([['Chunks received',s.received.length+' / 4'],['Reconstructed message',s.message||'Incomplete']]);return s.text;
      });host.querySelectorAll('select').forEach(input=>input.onchange=()=>t.replace(M.switching(settings())));
    },
    hardware(host){
      const view=setup(host,select('local-device','Forwarding device',[['switch','Switch'],['hub','Hub']])+select('destination','Destination',[['B','Device B'],['C','Device C'],['D','Device D']])+select('learned','Switch entry',[['known','Destination MAC learned'],['unknown','Destination MAC unknown']]),'Device A sends a unicast frame into port A. One LAN, no VLANs or loops. This known/unknown forwarding-table model is supporting detail; the required hardware focus is each device’s purpose. A hub repeats signals, represented here as copied frame paths.');
      const message=status(host);function render(){const result=M.forward(view.q('#local-device').value,view.q('#destination').value,view.q('#learned').value==='known');flow(view.viz,['A: sending',view.q('#local-device').value==='hub'?'Hub repeats':'Switch examines destination',...['B','C','D'].map(n=>`${n}: ${result.ports.includes(n)?'receives signal/frame':'not forwarded here'}`)]);view.cards([['Output ports',result.ports.join(', ')],['Intended recipient',view.q('#destination').value]]);message.textContent=result.reason;view.q('#learned').disabled=view.q('#local-device').value==='hub';}host.querySelectorAll('select').forEach(input=>input.onchange=render);render();
    },
    models(host){
      const view=setup(host,select('service-model','Service model',[['server','Client–server'],['peer','Peer-to-peer']])+select('provider-state','Original provider',[['up','Available'],['down','Unavailable']])+select('peer-copy','Separate peer copy',[['no','No extra copy'],['yes','Peer C holds a replica']]),'One requested file. Server mode has one designated provider and no failover; peer mode has a copy on A and optionally C. These are example deployments, not universal availability guarantees. Replication is extra context.');
      const message=status(host);function render(){const server=view.q('#service-model').value==='server',result=M.availability({server,failed:view.q('#provider-state').value==='down',replica:view.q('#peer-copy').value==='yes'});flow(view.viz,result.path);view.cards([['File available',result.ok?'Yes':'No'],['Original provider',result.provider]]);view.q('#peer-copy').disabled=server;message.textContent=result.text;}host.querySelectorAll('select').forEach(input=>input.onchange=render);render();
    },
    threats(host){
      const view=setup(host,select('threat','Scenario',[['phishing','Phishing'],['malware','Malware'],['dos','Denial of service'],['eavesdrop','Eavesdropping'],['access','Unauthorised access']])+select('defence','First control to explain',[['training','Independent verification and user awareness'],['updates','Updates, execution restrictions and anti-malware'],['filter','Traffic filtering / rate limiting'],['encrypt','Encryption in transit'],['firewall','Firewall plus access controls']])+'<button id="check-defence" class="primary">Explain my choice</button>','Five simplified scenarios, with one particularly direct control per scenario. Real protection combines controls and depends on implementation. Rate limiting and upstream mitigation are supporting detail; no real traffic is generated.');
      const message=status(host);function prompt(){view.viz.replaceChildren(el('p',M.threat(view.q('#threat').value,'').risk,'scenario-prompt'));message.textContent='Choose a control and explain how it interrupts this scenario.';}view.q('#threat').onchange=prompt;view.q('#defence').onchange=()=>{message.textContent='Choice changed. Check the reasoning for this selection.';};view.q('#check-defence').onclick=()=>{const result=M.threat(view.q('#threat').value,view.q('#defence').value);message.textContent=(result.matched?'Direct match. ':'Consider a more direct control for this particular mechanism. ')+result.why;};prompt();
    },
    protection(host){
      const view=setup(host,select('traffic-direction','Request direction',[['out','Staff → public web service'],['in','Public internet → private admin service']])+select('web-rule','Outbound web rule',[['allow','Allow'],['deny','Deny']])+select('site-rule','Proxy site policy',[['allow','Approved site'],['deny','Blocked site']])+select('encryption','Content protection',[['yes','Encrypted'],['no','Plaintext']]),'Local policy model: deny unsolicited inbound admin requests; allow outbound web only when its rule is enabled; then apply the proxy site policy. The encrypted-content label is illustrative, not actual cryptography. Real firewall state tracking, encrypted proxy inspection, certificates and TLS are extra implementation context.');
      const observer=el('div',undefined,'observer-view');host.append(observer);const message=status(host);
      function render(){const result=M.protection({direction:view.q('#traffic-direction').value,web:view.q('#web-rule').value==='allow',allowedSite:view.q('#site-rule').value==='allow',encrypted:view.q('#encryption').value==='yes'});flow(view.viz,['Request',result.firewall?'Firewall: allowed':'Firewall: rejected',!result.firewall?'Proxy: not reached':result.proxy?'Proxy: allowed':'Proxy: rejected',result.delivered?'Service reached':'No delivery']);view.cards([['Firewall',result.firewall?'Allow':'Deny'],['Proxy',!result.firewall?'Not reached':result.proxy?'Allow':'Deny'],['Delivered',result.delivered?'Yes':'No']]);observer.replaceChildren(el('h4','What a link observer could read'),el('p',result.delivered?result.visible:'No request is delivered beyond the rejecting control in this model.'));message.textContent=result.reason;}host.querySelectorAll('select').forEach(input=>input.onchange=render);render();
    }
  };
  document.addEventListener('cs:pause',()=>controllers.forEach(controller=>controller.pause()));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)controllers.forEach(controller=>controller.pause());});
  window.CSLabs={mount(key,host){labs[key](host);}};
})();
