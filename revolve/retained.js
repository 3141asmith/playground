(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./geometry'),require('./symmetry'),require('./vendor/clipper-6.4.2'));else root.RetainedGeometry=factory(root.RevolveGeometry,root.SymmetryGeometry,root.ClipperLib);})(typeof globalThis!=='undefined'?globalThis:this,function(G,S,C){
 'use strict';const MAX_POINTS=4096,COORDINATE_LIMIT=4000,SCALE=100000;
 const clone=polygons=>polygons.map(p=>p.map(r=>G.clonePoints(r)));
 function validate(points,thickness,{outlines}){if(!Number.isFinite(thickness)||thickness<.1||thickness>1000)return 'Choose a thickness from 0.1 to 1000 mm.';if(!outlines||!outlines.length)return 'Add a closed outline.';for(const polygon of outlines)for(const ring of polygon){const error=G.validateOutline(ring,.01,MAX_POINTS,COORDINATE_LIMIT);if(error)return error;}return null;}
 function paths(tree){const result=[];function collect(node){for(const child of node.Childs()){result.push(child.Contour());collect(child);}}collect(tree);return result;}
 const cache=new Map();
 function footprint(outlines,tolerance=.01){const key=JSON.stringify([outlines,tolerance]);if(cache.has(key))return cache.get(key);const all=[];
  for(const polygon of outlines){const rings=polygon.map(r=>G.flattenProfile(r,true,tolerance,MAX_POINTS*2,COORDINATE_LIMIT).map(p=>({X:Math.round(p.x*SCALE),Y:Math.round(p.y*SCALE)}))),engine=new C.Clipper(),tree=new C.PolyTree();
   for(const path of rings)if(!C.Clipper.Orientation(path))path.reverse();engine.StrictlySimple=true;engine.AddPath(rings[0],C.PolyType.ptSubject,true);if(rings.length>1)engine.AddPaths(rings.slice(1),C.PolyType.ptClip,true);
   if(!engine.Execute(C.ClipType.ctDifference,tree,C.PolyFillType.pftNonZero,C.PolyFillType.pftNonZero))throw Error('The edited outlines could not be combined.');all.push(...paths(tree));
  }
  const engine=new C.Clipper(),tree=new C.PolyTree(),result=[];engine.StrictlySimple=true;engine.AddPaths(all,C.PolyType.ptSubject,true);engine.Execute(C.ClipType.ctUnion,tree,C.PolyFillType.pftNonZero,C.PolyFillType.pftNonZero);
  const ring=path=>C.Clipper.CleanPolygon(path,2).map(p=>({x:p.X/SCALE,y:p.Y/SCALE}));
  function collect(node){for(const child of node.Childs()){if(!child.IsHole()){const outer=ring(child.Contour()),holes=child.Childs().filter(n=>n.IsHole()).map(n=>ring(n.Contour())).filter(r=>r.length>=3);if(outer.length>=3){if(G.signedArea(outer)<0)outer.reverse();for(const hole of holes)if(G.signedArea(hole)>0)hole.reverse();result.push([outer,...holes]);}}collect(child);}}collect(tree);
  if(!result.length)throw Error('The outlines leave no solid area. Move or remove a cut-out.');cache.set(key,result);while(cache.size>2)cache.delete(cache.keys().next().value);return result;
 }
 function solid(points,thickness,options,tolerance=.01){const error=validate(points,thickness,options);if(error)throw Error(error);return S.solidFromFootprint(footprint(options.outlines,tolerance),thickness);}
 function mesh(points,thickness,options){return S.displayMesh(solid(points,thickness,options,.03),thickness);}
 function stl(points,thickness,options){return G.stlFromMesh(solid(points,thickness,options),'Playground editable outlines | millimetres | Z up | base Z=0');}
 return{clone,validate,footprint,mesh,stl,MAX_POINTS,COORDINATE_LIMIT};
});
