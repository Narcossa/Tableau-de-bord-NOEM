
const NOTES=(()=>{
  async function render(){ document.getElementById('notes').value = await Store.getNote() || ''; renderTodos(); }
  async function save(){ await Store.setNote(document.getElementById('notes').value); alert('Notes sauvegardées.'); }
  async function clear(){ if(confirm('Effacer les notes ?')){ await Store.setNote(''); document.getElementById('notes').value=''; } }
  document.addEventListener('DOMContentLoaded',()=>{ render(); });
  return {save, clear};
})();

const TODO=(()=>{
  function uuid(){ return 'd'+crypto.randomUUID(); }
  function listEl(){ return document.getElementById('todoList'); }
  async function render(){ const todos=await Store.allTodos(); listEl().innerHTML=''; for(const td of todos){ const row=document.createElement('div'); row.className='row'; row.innerHTML=`<label style="flex:1"><input type="checkbox" ${td.done?'checked':''} onchange="TODO.toggle('${td.id}',this.checked)"> ${td.done?'<s>'+td.text+'</s>':td.text}</label><button class="btn" onclick="TODO.del('${td.id}')">🗑️</button>`; listEl().appendChild(row);} }
  async function add(){ const txt=document.getElementById('tdText').value.trim(); if(!txt) return; await Store.addTodo({id:uuid(), text:txt, done:false}); document.getElementById('tdText').value=''; render(); }
  async function toggle(id,val){ const todos=await Store.allTodos(); const td=todos.find(x=>x.id===id); if(!td) return; td.done=!!val; await Store.updTodo(td); render(); }
  async function del(id){ await Store.delTodo(id); render(); }
  document.addEventListener('DOMContentLoaded',()=>{ render(); });
  return {add,toggle,del};
})();