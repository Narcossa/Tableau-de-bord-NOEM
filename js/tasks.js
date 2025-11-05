
import { supabase } from './supabase.js';
import { requireAuth, currentUserRow, setBadge } from './main.js';

async function render() {
  const { data: tasks = [] } = await supabase.from('tasks').select('*').order('created_at', { ascending:false });
  const tb = document.getElementById('tbTasks');
  tb.innerHTML = '';
  tasks.forEach(t => {
    const pill = t.status === 'Fait' ? 'ok' : (t.status === 'En cours' ? 'warn' : 'bad');
    const tr = document.createElement('tr');
    tr.innerHTML = `<td data-label="Titre">${t.task||'—'}</td>
      <td data-label="Client">${t.client||'—'}</td>
      <td data-label="Chantier">${t.chantier||'—'}</td>
      <td data-label="Statut"><span class="pill ${pill}">${t.status}</span></td>
      <td data-label="Début">${t.start_date||'—'}</td>
      <td data-label="Fin">${t.end_date||'—'}</td>
      <td data-label="Heures">${t.hours||0}</td>
      <td data-label="Actions">
        <button class="btn" data-act="edit" data-id="${t.id}">✏️</button>
        <button class="btn" data-act="del" data-id="${t.id}">🗑️</button>
      </td>`;
    tb.appendChild(tr);
  });
}

async function add() {
  const me = await currentUserRow();
  const t = {
    user_id: me.id,
    client: document.getElementById('tClient').value.trim(),
    task: document.getElementById('tTitle').value.trim(),
    status: document.getElementById('tStatus').value,
    hours: parseFloat(document.getElementById('tHours').value || '0') || 0,
    start_date: document.getElementById('tStart').value || null,
    end_date: document.getElementById('tEnd').value || null,
    chantier: document.getElementById('tChantier').value.trim() || null
  };
  if (!t.task) return alert('Titre requis');
  const { error } = await supabase.from('tasks').insert(t);
  if (error) return alert(error.message);
  ['tClient','tTitle','tHours','tStart','tEnd','tChantier'].forEach(id => document.getElementById(id).value='');
  render();
}

async function onTableClick(e) {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  if (btn.dataset.act === 'del') {
    if (!confirm('Supprimer ?')) return;
    await supabase.from('tasks').delete().eq('id', id);
    render();
  } else if (btn.dataset.act === 'edit') {
    const { data } = await supabase.from('tasks').select('*').eq('id', id).single();
    const newTitle = prompt('Titre', data.task || '');
    if (newTitle === null) return;
    const newStatus = prompt('Statut (A faire / En cours / Fait)', data.status || 'A faire');
    await supabase.from('tasks').update({ task: newTitle, status: newStatus }).eq('id', id);
    render();
  }
}

(async () => {
  await requireAuth();
  const me = await currentUserRow();
  setBadge(me ? me.name : '—');
  document.getElementById('addTask').onclick = add;
  document.getElementById('tbTasks').addEventListener('click', onTableClick);
  render();
})();
