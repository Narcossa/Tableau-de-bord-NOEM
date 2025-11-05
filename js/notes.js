
import { supabase } from './supabase.js';
import { requireAuth, currentUserRow, setBadge } from './main.js';

async function load() {
  await requireAuth();
  const me = await currentUserRow();
  setBadge(me ? me.name : '—');
  const { data = [] } = await supabase.from('notes').select('*').order('created_at',{ascending:false}).limit(1);
  document.getElementById('note').value = (data[0]?.content) || '';
  renderTodos();
}

async function saveNote() {
  const me = await currentUserRow();
  const content = document.getElementById('note').value;
  await supabase.from('notes').insert({ user_id: me.id, content });
  alert('Note enregistrée');
}

async function renderTodos() {
  const { data: todos = [] } = await supabase.from('todos').select('*').order('created_at',{ascending:true});
  const wrap = document.getElementById('todoList');
  wrap.innerHTML = '';
  todos.forEach(td => {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<label><input type="checkbox" ${td.done?'checked':''} data-id="${td.id}" data-act="toggle"> ${td.label}</label>
      <button class="btn" data-id="${td.id}" data-act="del">🗑️</button>`;
    wrap.appendChild(row);
  });
}

async function addTodo() {
  const me = await currentUserRow();
  const v = document.getElementById('todoText').value.trim();
  if (!v) return;
  await supabase.from('todos').insert({ user_id: me.id, label: v, done: false });
  document.getElementById('todoText').value = '';
  renderTodos();
}

async function onTodoClick(e) {
  const t = e.target;
  if (t.dataset.act === 'del') {
    await supabase.from('todos').delete().eq('id', t.dataset.id);
    renderTodos();
  } else if (t.dataset.act === 'toggle') {
    await supabase.from('todos').update({ done: t.checked }).eq('id', t.dataset.id);
    renderTodos();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  document.getElementById('saveNote').onclick = saveNote;
  document.getElementById('addTodo').onclick = addTodo;
  document.getElementById('todoList').addEventListener('click', onTodoClick);
});
