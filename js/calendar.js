
import { supabase } from './supabase.js';
import { requireAuth, currentUserRow, setBadge } from './main.js';

function monthBounds(date=new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth()+1, 0);
  const iso = d => d.toISOString().slice(0,10);
  return { start: iso(start), end: iso(end) };
}

(async () => {
  await requireAuth();
  const me = await currentUserRow();
  setBadge(me ? me.name : '—');

  const userSel = document.getElementById('filterUser');
  const { data: users = [] } = await supabase.from('users').select('id,name,color');
  users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id; opt.textContent = u.name;
    userSel.appendChild(opt);
  });

  const calEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calEl, { initialView: 'dayGridMonth', height: 'auto', locale: 'fr' });
  calendar.render();

  async function loadEvents() {
    const bounds = monthBounds(calendar.getDate());
    let query = supabase.from('tasks').select('*')
      .gte('start_date', bounds.start)
      .lte('end_date', bounds.end);
    const uid = userSel.value;
    if (uid) query = query.eq('user_id', uid);
    const { data: tasks = [] } = await query;
    calendar.removeAllEvents();
    const colorByUser = Object.fromEntries(users.map(u => [u.id, u.color || '#4f8cff']));
    tasks.forEach(t => {
      calendar.addEvent({
        id: t.id,
        title: `${t.task || ''} • ${(users.find(u=>u.id===t.user_id)?.name || '—')}`,
        start: t.start_date,
        end: t.end_date ? new Date(new Date(t.end_date).getTime()+24*3600*1000).toISOString().slice(0,10) : undefined,
        allDay: true,
        backgroundColor: colorByUser[t.user_id] || '#4f8cff',
        borderColor: '#262a34'
      });
    });
  }

  userSel.addEventListener('change', loadEvents);
  calendar.on('datesSet', loadEvents);
  await loadEvents();
})();
