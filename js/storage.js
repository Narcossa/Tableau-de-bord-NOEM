
const DB_NAME='noemDB'; const DB_VER=1; // tasks, expenses, todos, meta, notes
function idbOpen(){ return new Promise((resolve,reject)=>{ const req=indexedDB.open(DB_NAME,DB_VER);
  req.onupgradeneeded=e=>{ const db=e.target.result;
    if(!db.objectStoreNames.contains('tasks')) db.createObjectStore('tasks',{keyPath:'id'});
    if(!db.objectStoreNames.contains('expenses')) db.createObjectStore('expenses',{keyPath:'id'});
    if(!db.objectStoreNames.contains('todos')) db.createObjectStore('todos',{keyPath:'id'});
    if(!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
    if(!db.objectStoreNames.contains('notes')) db.createObjectStore('notes');
  };
  req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error); }); }
async function dbPut(store,value,key){ const db=await idbOpen(); return new Promise((res,rej)=>{ const tx=db.transaction(store,'readwrite').objectStore(store).put(value,key); tx.onsuccess=()=>res(true); tx.onerror=()=>rej(tx.error); }); }
async function dbGetAll(store){ const db=await idbOpen(); return new Promise((res,rej)=>{ const tx=db.transaction(store).objectStore(store).getAll(); tx.onsuccess=()=>res(tx.result||[]); tx.onerror=()=>rej(tx.error); }); }
async function dbDelete(store,key){ const db=await idbOpen(); return new Promise((res,rej)=>{ const tx=db.transaction(store,'readwrite').objectStore(store).delete(key); tx.onsuccess=()=>res(true); tx.onerror=()=>rej(tx.error); }); }
async function dbGet(store,key){ const db=await idbOpen(); return new Promise((res,rej)=>{ const tx=db.transaction(store).objectStore(store).get(key); tx.onsuccess=()=>res(tx.result); tx.onerror=()=>rej(tx.error); }); }
async function migrateFromLocalStorage(){ const RAW=localStorage.getItem('noem_data_v1'); if(!RAW) return; try{ const data=JSON.parse(RAW);
  for(const t of (data.tasks||[])) await dbPut('tasks',t); for(const e of (data.expenses||[])) await dbPut('expenses',e);
  for(const td of (data.todos||[])) await dbPut('todos',td); await dbPut('notes',data.notes||'','default'); await dbPut('meta',data.sheet||'','sheet'); await dbPut('meta',data.profile||'','profile');
  localStorage.removeItem('noem_data_v1'); }catch(e){ console.warn('Migration error',e); } }
const Store={ async allTasks(){return await dbGetAll('tasks')}, async addTask(t){await dbPut('tasks',t)}, async updTask(t){await dbPut('tasks',t)}, async delTask(id){await dbDelete('tasks',id)},
  async allExpenses(){return await dbGetAll('expenses')}, async addExpense(e){await dbPut('expenses',e)}, async updExpense(e){await dbPut('expenses',e)}, async delExpense(id){await dbDelete('expenses',id)},
  async allTodos(){return await dbGetAll('todos')}, async addTodo(td){await dbPut('todos',td)}, async updTodo(td){await dbPut('todos',td)}, async delTodo(id){await dbDelete('todos',id)},
  async getNote(){return await dbGet('notes','default')||''}, async setNote(txt){await dbPut('notes',txt,'default')},
  async getMeta(k){return await dbGet('meta',k)||''}, async setMeta(k,v){await dbPut('meta',v,k)} };
migrateFromLocalStorage();
