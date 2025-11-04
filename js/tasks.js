
const TASKS=(()=>{
  const $=s=>document.querySelector(s);
  function uuid(){ return 't'+crypto.randomUUID(); }
  async function render(){
    const tasks=await Store.allTasks();
    const clients=[...new Set(tasks.map(t=>t.client).filter(Boolean))].sort();
    const collabs=[...new Set(tasks.map(t=>t.collab).filter(Boolean))].sort();
    document.getElementById('fCl').innerHTML='<option value=\"\">Tous clients</option>'+clients.map(c=>`<option>${c}</option>`).join('');
    document.getElementById('fCo').innerHTML='<option value=\"\">Tous collaborateurs</option>'+collabs.map(c=>`<option>${c}</option>`).join('');
    const q=(document.getElementById('fQ').value||'').toLowerCase(), st=document.getElementById('fSt').value, cl=document.getElementById('fCl').value, co=document.getElementById('fCo').value, from=document.getElementById('fFrom').value?new Date(document.getElementById('fFrom').value):null, to=document.getElementById('fTo').value?new Date(document.getElementById('fTo').value):null;
    const list=tasks.filter(t=>{ if(st && t.status!==st) return false; if(cl && t.client!==cl) return false; if(co && t.collab!==co) return false; if(from){ const ds=t.start?new Date(t.start):null; if(!ds||ds<from) return false; } if(to){ const de=t.end?new Date(t.end):null; if(!de||de>to) return false; } const hay=`${t.title} ${t.client} ${t.collab} ${(t.tags||[]).join(' ')}`.toLowerCase(); if(q && !hay.includes(q)) return false; return true; });
    const tb=document.getElementById('tbTasks'); tb.innerHTML='';
    for(const t of list){ const pill=t.status==='Fait'?'ok':(t.status==='En cours'?'warn':'bad'); const tr=document.createElement('tr');
      tr.innerHTML=`<td data-label=\"Titre\">${t.title}</td><td data-label=Client>${t.client||'—'}</td><td data-label=Collab>${t.collab||'—'}</td><td data-label=Statut><span class=\"pill ${pill}\">${t.status}</span></td><td data-label=Début>${t.start||'—'}</td><td data-label=Fin>${t.end||'—'}</td><td data-label=Heures>${t.hours||0}</td><td data-label=Tags>${(t.tags||[]).map(x=>`<span class=chip>#${x}</span>`).join(' ')}</td><td data-label=Actions><button class=btn onclick=\"TASKS.edit('${t.id}')\">✏️</button> <button class=btn onclick=\"TASKS.del('${t.id}')\">🗑️</button></td>`; tb.appendChild(tr); }
  }
  async function add(){ const t={ id:uuid(), title:document.getElementById('tTitle').value.trim(), client:document.getElementById('tClient').value.trim(), collab:document.getElementById('tCollab').value.trim(), status:document.getElementById('tStatus').value, priority:document.getElementById('tPriority').value, start:document.getElementById('tStart').value||'', end:document.getElementById('tEnd').value||'', hours: parseFloat(document.getElementById('tHours').value||'0')||0, tags:(document.getElementById('tTags').value||'').split(',').map(x=>x.trim()).filter(Boolean) }; if(!t.title) return alert('Titre requis'); await Store.addTask(t); ['tTitle','tClient','tCollab','tStart','tEnd','tHours','tTags'].forEach(id=>document.getElementById(id).value=''); render(); }
  async function edit(id){ const tasks=await Store.allTasks(); const t=tasks.find(x=>x.id===id); if(!t) return; const title=prompt('Titre',t.title); if(title===null) return; t.title=title; t.client=prompt('Client',t.client||'')||''; t.collab=prompt('Collaborateur',t.collab||'')||''; t.status=prompt('Statut (À faire / En cours / Fait)',t.status||'À faire')||'À faire'; await Store.updTask(t); render(); }
  async function del(id){ if(!confirm('Supprimer ?')) return; await Store.delTask(id); render(); }
  function clear(){ ['fQ','fSt','fCl','fCo','fFrom','fTo'].forEach(id=> document.getElementById(id).value=''); render(); }
  document.addEventListener('DOMContentLoaded',()=>{ ['fQ','fSt','fCl','fCo','fFrom','fTo'].forEach(id=>{ const el=document.getElementById(id); if(el){ el.addEventListener('input',render); el.addEventListener('change',render);} }); render(); });
  return {add,edit,del,clear};
})();