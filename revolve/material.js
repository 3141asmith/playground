(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PlaEstimate=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';const defaults={infill:20,shell:.8,density:1.24,diameter:1.75,extra:10};
 const ranges={infill:[0,100],shell:[0,10],density:[.5,3],diameter:[1,3.5],extra:[0,100]};
 function estimate(metrics,settings=defaults){if(!metrics||!Number.isFinite(metrics.volume)||metrics.volume<=0||!Number.isFinite(metrics.surface)||metrics.surface<0)throw Error('Create a closed, nonzero solid to estimate material.');const options={...defaults,...settings};for(const [key,[min,max]]of Object.entries(ranges)){const value=options[key];if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw Error('Enter valid print settings; '+key+' must be between '+min+' and '+max+'.');}
  const shellVolume=Math.min(metrics.volume,metrics.surface*options.shell),coreVolume=metrics.volume-shellVolume,modelVolume=shellVolume+coreVolume*options.infill/100,filamentVolume=modelVolume*(1+options.extra/100),solidMass=metrics.volume/1000*options.density,mass=filamentVolume/1000*options.density,length=filamentVolume/(Math.PI*(options.diameter/2)**2)/1000;
  return{shellVolume,coreVolume,modelVolume,filamentVolume,solidMass,mass,length};
 }
 return{estimate,defaults,ranges};
});
