const databaseName='playground-exam-builder';
const storeName='workspaces';

function openDatabase(){
  if(!('indexedDB'in window))return Promise.reject(new Error('This browser does not support local saved workspaces.'));
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(databaseName,1);
    request.onupgradeneeded=()=>request.result.createObjectStore(storeName,{keyPath:'id'});
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error('Could not open local workspace storage.'));
    request.onblocked=()=>reject(new Error('Local workspace storage is blocked by another browser tab.'));
  });
}

async function transact(mode,operation){
  const database=await openDatabase();
  return new Promise((resolve,reject)=>{
    let result;
    const transaction=database.transaction(storeName,mode);
    const store=transaction.objectStore(storeName);
    try{result=operation(store);}catch(error){database.close();reject(error);return;}
    transaction.oncomplete=()=>{database.close();resolve(result?.result);};
    transaction.onerror=()=>{database.close();reject(transaction.error||new Error('Could not update local workspace storage.'));};
    transaction.onabort=()=>{database.close();reject(transaction.error||new Error('Local workspace storage update was cancelled.'));};
  });
}

export async function listWorkspaces(){
  const database=await openDatabase();
  return new Promise((resolve,reject)=>{
    const transaction=database.transaction(storeName,'readonly');
    const request=transaction.objectStore(storeName).getAll();
    let workspaces;
    request.onsuccess=()=>{workspaces=request.result.map(({id,name,updatedAt,sourceCount,questionCount})=>({id,name,updatedAt,sourceCount,questionCount})).sort((a,b)=>b.updatedAt-a.updatedAt);};
    transaction.onerror=()=>reject(transaction.error||new Error('Could not read saved workspaces.'));
    transaction.oncomplete=()=>{database.close();resolve(workspaces);};
    transaction.onabort=()=>{database.close();reject(transaction.error||new Error('Could not read saved workspaces.'));};
  });
}

export async function saveWorkspace(workspace){
  await transact('readwrite',store=>store.put(workspace));
}

export async function loadWorkspace(id){
  const database=await openDatabase();
  return new Promise((resolve,reject)=>{
    const transaction=database.transaction(storeName,'readonly');
    const request=transaction.objectStore(storeName).get(id);
    let workspace;
    request.onsuccess=()=>{workspace=request.result;};
    transaction.onerror=()=>reject(transaction.error||new Error('Could not read the saved workspace.'));
    transaction.oncomplete=()=>{database.close();if(workspace)resolve(workspace);else reject(new Error('That saved workspace could not be found.'));};
    transaction.onabort=()=>{database.close();reject(transaction.error||new Error('Could not read the saved workspace.'));};
  });
}

export async function deleteWorkspace(id){
  await transact('readwrite',store=>store.delete(id));
}
