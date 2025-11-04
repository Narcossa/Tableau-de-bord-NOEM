
const TASKS=(()=>{
  const $=s=>document.querySelector(s);
  function load(){ return JSON.parse(localStorage.getItem('noem_data_v1')||'{"tasks":[]}'); }
  function save(d){ localStorage.setItem('noem_data_v1', JSON.stringify(d)); }

  function listFiltered(d){
    const q = $('#fQ').value.trim().toLowerCase();
    const st= $('#fSt').value;
    const cl= $('#fCl').value;
    const co= $('#fCo').value;
    const from = $('#fFrom').value? new Date($('#fFrom').value): null;
    const to = $('#fTo').value? new Date($('#fTo').value): null;
    return d.tasks.filter(t=>{
      if(st && t.status!==st) return false;
      if(cl && t.client!==cl) return false;
      if(co && t.collab!==co) return false;
      if(from){ const ds=t.start? new Date(t.start): null; if(!ds || ds<from) return false; }
      if(to){ const de=t.end? new Date(t.end): null; if(!de || de>to) return false; }
      if(q){
        const hay = `${t.title} ${t.client} ${t.collab} ${(t.tags||[]).join(' ')}`.toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    });
  }
  function renderFilters(d){
    const clients = [...new Set(d.tasks.map(t=>t.client).filter(Boolean))].sort();
    const collabs = [...new Set(d.tasks.map(t=>t.collab).filter(Boolean))].sort();
    $('#fCl').innerHTML = '<option value=\"\">Tous clients</option>'+clients.map(x=>`<option>${x}</option>`).join('');
    $('#fCo').innerHTML = '<option value=\"\">Tous collaborateurs</option>'+collabs.map(x=>`<option>${x}</option>`).join('');
  }
  function renderList(){
    const d = load();
    renderFilters(d);
    const tb = $('#tbTasks'); tb.innerHTML='';
    listFiltered(d).forEach(t=>{
      const pill = t.status==='Fait'?'ok':(t.status==='En cours'?'warn':'bad');
      const tags = (t.tags||[]).map(x=>`<span class="chip">#${x}</span>`).join(' ');
      const tr = document.createElement('tr');
      tr.innerHTML = `<td data-label="Titre">${t.title}</td>
        <td data-label="Client">${t.client||'—'}</td>
        <td data-label="Collab">${t.collab||'—'}</td>
        <td data-label="Statut"><span class="pill ${pill}">${t.status}</span></td>
        <td data-label="Début">${t.start||'—'}</td>
        <td data-label="Fin">${t.end||'—'}</td>
        <td data-label="Heures">${t.hours||0}</td>
        <td data-label="Tags">${tags}</td>
        <td data-label="Actions"><button class="btn" onclick="TASKS.edit('${t.id}')">✏️</button>
        <button class="btn" onclick="TASKS.del('${t.id}')">🗑️</button></td>`;
      tb.appendChild(tr);
    });
    renderBoard();
    renderCalendar();
  }

  function add(){
    const d = load();
    const t = {
      id:'t'+Date.now(),
      title: $('#tTitle').value.trim(),
      client: $('#tClient').value.trim(),
      collab: $('#tCollab').value.trim(),
      status: $('#tStatus').value,
      priority: $('#tPriority').value,
      start: $('#tStart').value||'',
      end: $('#tEnd').value||'',
      hours: parseFloat($('#tHours').value||'0')||0,
      tags: ($('#tTags').value||'').split(',').map(x=>x.trim()).filter(Boolean)
    };
    if(!t.title) return alert('Titre requis.');
    d.tasks.unshift(t); save(d);
    $('#tTitle').value=$('#tClient').value=$('#tCollab').value=$('#tStart').value=$('#tEnd').value=$('#tHours').value=$('#tTags').value='';
    renderList();
  }
  function edit(id){
    const d = load(); const t = d.tasks.find(x=>x.id===id); if(!t) return;
    const title = prompt('Titre', t.title); if(title===null) return;
    t.title = title;
    t.client = prompt('Client', t.client||'')||'';
    t.collab = prompt('Collaborateur', t.collab||'')||'';
    t.status = prompt('Statut (À faire / En cours / Fait)', t.status||'À faire')||'À faire';
    save(d); renderList();
  }
  function del(id){
    if(!confirm('Supprimer ?')) return;
    const d = load(); d.tasks = d.tasks.filter(x=>x.id!==id); save(d); renderList();
  }
  function clear(){ $('#fQ').value=''; $('#fSt').value=''; $('#fCl').value=''; $('#fCo').value=''; $('#fFrom').value=''; $('#fTo').value=''; renderList(); }

  // Kanban
  function renderBoard(){
    const d = load();
    const a = document.getElementById('col-afaire'), e = document.getElementById('col-encours'), f = document.getElementById('col-fait');
    if(!a || !e || !f) return;
    a.innerHTML=e.innerHTML=f.innerHTML='';
    listFiltered(d).forEach(t=>{
      const el = document.createElement('div');
      el.className='task'; el.draggable=true;
      el.ondragstart = ev=> ev.dataTransfer.setData('text/plain', t.id);
      el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
        <strong>${t.title}</strong><span class="chip">${t.priority||'Normal'}</span></div>
        <div class="chips"><span class="chip">${t.client||'—'}</span><span class="chip">${t.collab||'—'}</span>${(t.tags||[]).map(x=>`<span class='chip'>#${x}</span>`).join('')}</div>
        <div class="small">📅 ${t.start||'—'} → ${t.end||'—'} • ⏱ ${t.hours||0}h</div>
        <div class="row" style="margin-top:6px"><button class="btn" onclick="TASKS.edit('${t.id}')">✏️</button><button class="btn" onclick="TASKS.del('${t.id}')">🗑️</button></div>`;
      if(t.status==='À faire') a.appendChild(el);
      else if(t.status==='En cours') e.appendChild(el);
      else f.appendChild(el);
    });
    document.querySelectorAll('.col').forEach(col=>{
      col.ondragover = ev=>ev.preventDefault();
      col.ondrop = ev=>{
        ev.preventDefault();
        const id = ev.dataTransfer.getData('text/plain');
        const d = load(); const t = d.tasks.find(x=>x.id===id); if(!t) return;
        t.status = col.dataset.col; save(d); renderList();
      };
    });
  }

  // Calendar
  let CAL=null;
  function renderCalendar(){
    const el = document.getElementById('calendar'); if(!el || !window.FullCalendar) return;
    if(!CAL){ CAL = new FullCalendar.Calendar(el, { initialView:'dayGridMonth', height:'auto', locale:'fr' }); CAL.render(); }
    const d = load(); CAL.removeAllEvents();
    listFiltered(d).forEach(t=>{
      CAL.addEvent({id:t.id,title:`${t.title} • ${t.collab||''} (${t.client||''})`,
        start:t.start||null,end:t.end? new Date(new Date(t.end).getTime()+86400000).toISOString().slice(0,10):null,allDay:true,
        backgroundColor: t.status==='Fait'?'#22c55e':(t.status==='En cours'?'#f59e0b':'#4f8cff'), borderColor:'#262a34'});
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    NOEM.initHome && NOEM.initHome();
    ['fQ','fSt','fCl','fCo','fFrom','fTo'].forEach(id=>{
      const el=document.getElementById(id); if(el){ el.addEventListener('input', renderList); el.addEventListener('change', renderList); }
    });
    renderList();
  });

  return {add, edit, del, clear};
})();
