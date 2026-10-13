// Source aliases can describe an entire multiple system. Never merge components merely because aliases overlap.
function deduplicate(rows){
 const byId=new Map(),byName=new Map(),duplicates=[];
 const normalize=s=>s.normalize('NFKC').toLowerCase().replace(/[\s’']/g,'');
 for(const row of rows){
  const key=normalize(row.name),existing=byId.get(row.catalogueId)||byName.get(key);
  if(existing){duplicates.push({id:row.catalogueId,name:row.name,keptId:existing.catalogueId});existing.aliases=[...new Set([...existing.aliases,...row.aliases,...(existing.name===row.name?[]:[row.name])])];for(const field of ['temperature','luminosity','radius'])if(!existing[field]&&row[field])existing[field]=row[field];continue;}
  const copy={...row,aliases:[...row.aliases]};byId.set(row.catalogueId,copy);byName.set(key,copy);
 }
 return {objects:[...byId.values()],duplicates};
}
module.exports={deduplicate};
