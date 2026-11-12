const assert=require('node:assert/strict'),M=require('../revolve/material'),near=(a,b)=>assert(Math.abs(a-b)<1e-9,`${a} differs from ${b}`),cube={volume:1000,surface:600};
const solid=M.estimate(cube,{infill:100,extra:0});near(solid.mass,1.24);near(solid.length,1000/(Math.PI*.875**2)/1000);near(solid.solidMass,1.24);
const typical=M.estimate(cube);near(typical.shellVolume,480);near(typical.modelVolume,584);near(typical.filamentVolume,642.4);near(typical.mass,.796576);
near(M.estimate(cube,{shell:0,infill:20,extra:0}).mass,.248);near(M.estimate(cube,{shell:0,infill:0}).mass,0);near(M.estimate(cube,{shell:10,infill:0,extra:0}).mass,1.24);
const dense=M.estimate(cube,{density:2.48});near(dense.mass,typical.mass*2);near(dense.length,typical.length);const thick=M.estimate(cube,{diameter:2.85});near(thick.length/typical.length,(1.75/2.85)**2);near(thick.mass,typical.mass);
for(let i=0;i<=100;i++){const result=M.estimate(cube,{infill:i,extra:0});assert(result.modelVolume>=0&&result.modelVolume<=1000);if(i)assert(result.mass>=M.estimate(cube,{infill:i-1,extra:0}).mass);}
for(const metrics of [null,{volume:0,surface:1},{volume:Infinity,surface:10},{volume:1,surface:-1}])assert.throws(()=>M.estimate(metrics),/closed/);
for(const [key,value]of [['infill',101],['shell',-1],['density',NaN],['diameter',0],['extra',Infinity]])assert.throws(()=>M.estimate(cube,{[key]:value}),/valid print settings/);
console.log('PASS mm³/cm³/grams/metres conversions, solid baseline, shell/core infill estimate, thin-wall cap, extra allowance, density/diameter independence, monotonic infill and invalid-input handling');
