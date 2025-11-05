
import { supabase } from './supabase.js';
import { requireAuth, currentUserRow, setBadge } from './main.js';

function ymStr(d=new Date()) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }

async function render() {
  const { data: expenses = [] } = await supabase.from('expenses').select('*').order('created_at', { ascending:false });
  const show = document.getElementById('showArchived').checked;
  const tb = document.getElementById('tbExpenses');
  tb.innerHTML = '';
  expenses.filter(x=> show ? true : !x.archived).forEach(x => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td data-label="Date">${(x.created_at||'').slice(0,10)}</td>
      <td data-label="Client">${x.client||'—'}</td>
      <td data-label="Description">${x.description||'—'}</td>
      <td data-label="Montant">${(x.amount||0).toFixed(2)} €</td>
      <td data-label="Statut">${x.archived?'<span class="pill ok">Payée</span>':'<span class="pill warn">En attente</span>'}</td>
      <td data-label="Actions">
        <label><input type="checkbox" ${x.archived?'checked':''} data-id="${x.id}" data-act="toggle"> Archiver</label>
        <button class="btn" data-id="${x.id}" data-act="del">🗑️</button>
      </td>`;
    tb.appendChild(tr);
  });

  const month = ymStr();
  const mtotal = expenses.filter(e => !e.archived && (e.created_at||'').startsWith(month))
                  .reduce((s,e)=> s + (parseFloat(e.amount)||0), 0);
  document.getElementById('exTotal').textContent = mtotal.toFixed(2) + ' €';
  document.getElementById('exCount').textContent = expenses.length;
  document.getElementById('exArch').textContent = expenses.filter(e=>e.archived).length;
}

async function add() {
  const me = await currentUserRow();
  const it = {
    user_id: me.id,
    client: document.getElementById('exClient').value.trim(),
    description: document.getElementById('exDesc').value.trim(),
    amount: parseFloat(document.getElementById('exAmount').value || '0') || 0,
    archived: document.getElementById('exArchived').checked || false,
    created_at: document.getElementById('exDate').value ? document.getElementById('exDate').value+'T12:00:00Z' : null
  };
  if (!it.amount) return alert('Montant requis');
  const { error } = await supabase.from('expenses').insert(it);
  if (error) return alert(error.message);
  ['exClient','exDesc','exAmount','exDate'].forEach(id => document.getElementById(id).value='');
  document.getElementById('exArchived').checked = false;
  render();
}

async function onTableClick(e) {
  const tgt = e.target;
  if (tgt.dataset.act === 'del') {
    const id = tgt.dataset.id;
    if (!confirm('Supprimer ?')) return;
    await supabase.from('expenses').delete().eq('id', id);
    render();
  } else if (tgt.dataset.act === 'toggle') {
    const id = tgt.dataset.id;
    const val = tgt.checked;
    await supabase.from('expenses').update({ archived: val }).eq('id', id);
    render();
  }
}

(async () => {
  await requireAuth();
  const me = await currentUserRow();
  setBadge(me ? me.name : '—');
  document.getElementById('addExpense').onclick = add;
  document.getElementById('tbExpenses').addEventListener('click', onTableClick);
  document.getElementById('showArchived').addEventListener('change', render);
  render();
})();
