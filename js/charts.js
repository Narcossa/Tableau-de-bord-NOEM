
import { supabase } from './supabase.js';
import { requireAuth, currentUserRow, setBadge, SHEET_URL } from './main.js';

(async () => {
  await requireAuth();
  const userRow = await currentUserRow();
  setBadge(userRow ? `${userRow.name}` : '—');

  const { data: tasks = [] } = await supabase.from('tasks').select('*');
  const { data: expenses = [] } = await supabase.from('expenses').select('*');

  const kOpen = tasks.filter(t => t.status !== 'Fait').length;
  const kHours = tasks.reduce((s,t)=> s + (parseFloat(t.hours)||0), 0);
  const kLate = tasks.filter(t => t.status !== 'Fait' && t.end_date && new Date(t.end_date) < new Date()).length;
  const now = new Date(); const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const kSpend = expenses.filter(e => !e.archived && (e.created_at||'').startsWith(ym))
                         .reduce((s,e)=> s + (parseFloat(e.amount)||0), 0);

  document.getElementById('kOpen').textContent = kOpen;
  document.getElementById('kHours').textContent = kHours.toFixed(1).replace('.',',');
  document.getElementById('kLate').textContent = kLate;
  document.getElementById('kSpend').textContent = kSpend.toFixed(2) + ' €';

  const { data: users = [] } = await supabase.from('users').select('id,name,color');
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));
  const hoursBy = {};
  tasks.forEach(t => {
    const u = userMap[t.user_id];
    const name = u ? u.name : '—';
    hoursBy[name] = (hoursBy[name]||0) + (parseFloat(t.hours)||0);
  });
  const labels1 = Object.keys(hoursBy);
  const data1 = labels1.map(k => hoursBy[k]);
  new Chart(document.getElementById('chartHours'), {
    type: 'bar',
    data: { labels: labels1, datasets: [{ label: 'Heures', data: data1 }] },
    options: { responsive: true, plugins: { legend: { display:false } } }
  });

  const days = Array.from({length:31}, (_,i)=> String(i+1).padStart(2,'0'));
  const byDay = {};
  expenses.filter(e => !e.archived && (e.created_at||'').startsWith(ym)).forEach(e => {
    const day = e.created_at.slice(8,10);
    byDay[day] = (byDay[day]||0) + (parseFloat(e.amount)||0);
  });
  const data2 = days.map(d => byDay[d] || 0);
  new Chart(document.getElementById('chartExpenses'), {
    type: 'line',
    data: { labels: days, datasets: [{ label: 'Dépenses', data: data2 }] },
    options: { responsive: true, plugins: { legend: { display:false } } }
  });

  const btn = document.getElementById('openSheet');
  if (btn) btn.onclick = () => window.open(SHEET_URL,'_blank');
})();
