
const SHEET_URL='https://docs.google.com/spreadsheets/d/1uf2uOV_kNjq9k2FaWfyTvBPRy6FbieXuOiWLREbS140/edit?usp=sharing';
const NOEM=(()=>{
  const $=s=>document.querySelector(s);
  async function setBadge(){ const badge=$('#profileBadge'); const p=await Store.getMeta('profile');
    if(!p){ $('#profileModal')?.classList.add('show'); if(badge) badge.textContent='—'; }
    else { $('#profileModal')?.classList.remove('show'); if(badge) badge.textContent = (p==='Bastien'?'👷 Bastien GOSSELIN — Mode Gérant':'💻 Mathis GOSSELIN — NOEM INFO'); } }
  async function setProfile(p){ await Store.setMeta('profile',p); await setBadge(); }
  async function exportData(){ const tasks=await Store.allTasks(), expenses=await Store.allExpenses(), todos=await Store.allTodos(), notes=await Store.getNote(), sheet=await Store.getMeta('sheet'), profile=await Store.getMeta('profile');
    const blob=new Blob([JSON.stringify({tasks,expenses,todos,notes,sheet,profile},null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='noem-data-v3.json'; a.click(); }
  async function importData(ev){ const f=ev.target.files[0]; if(!f) return; const txt=await f.text(); const data=JSON.parse(txt);
    if(data.tasks) for(const t of data.tasks) await Store.addTask(t);
    if(data.expenses) for(const e of data.expenses) await Store.addExpense(e);
    if(data.todos) for(const td of data.todos) await Store.addTodo(td);
    if('notes' in data) await Store.setNote(data.notes||''); if('sheet' in data) await Store.setMeta('sheet',data.sheet||''); if('profile' in data) await Store.setMeta('profile',data.profile||'');
    alert('Import réussi.'); location.reload(); }
  async function resetAll(){ if(confirm('Tout réinitialiser ?')){ const req=indexedDB.deleteDatabase('noemDB'); req.onsuccess=()=>location.reload(); req.onerror=()=>alert('Erreur de réinitialisation'); } }
  async function refresh(){ location.reload(); }
  async function initHome(){ if('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js'); await setBadge();
    const openSheetBtn=document.getElementById('openSheet'); if(openSheetBtn) openSheetBtn.onclick=()=>window.open(SHEET_URL,'_blank');
    const tasks=await Store.allTasks(); const expenses=await Store.allExpenses();
    const open=tasks.filter(t=>t.status!=='Fait').length; const hours=tasks.reduce((s,t)=>s+(parseFloat(t.hours)||0),0); const late=tasks.filter(t=>t.status!=='Fait'&&t.end&&new Date(t.end)<new Date()).length;
    const now=new Date(); const ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`; const spend=expenses.filter(x=>!x.archived && x.date && x.date.startswith? x.date.startswith(ym): x.date.startswith(ym)).filter(Boolean); // fallback safe
    const spendSum=expenses.filter(x=>!x.archived && x.date && x.date.startsWith(ym)).reduce((s,x)=>s+(parseFloat(x.amount)||0),0);
    $('#kOpen').textContent=open; $('#kHours').textContent=hours.toFixed(1).replace('.',','); $('#kLate').textContent=late; $('#kSpend').textContent=spendSum.toFixed(2)+' €';
    const byCo={}; tasks.forEach(t=>{ const k=t.collab||'—'; byCo[k]=(byCo[k]||0)+(parseFloat(t.hours)||0); }); const coLabels=Object.keys(byCo); const coVals=coLabels.map(k=>byCo[k]);
    const c1=document.getElementById('chartHours'); if(c1 && window.Chart){ new Chart(c1,{type:'bar',data:{labels:coLabels,datasets:[{label:'Heures',data:coVals}]},options:{responsive:true,plugins:{legend:{display:false}}}}); }
    const days=[...Array(31).keys()].map(i=>String(i+1).padStart(2,'0')); const expByDay={}; expenses.filter(e=>!e.archived && e.date && e.date.startsWith(ym)).forEach(e=>{ const d=e.date.split('-')[2]; expByDay[d]=(expByDay[d]||0)+(parseFloat(e.amount)||0); }); const vals=days.map(d=>expByDay[d]||0);
    const c2=document.getElementById('chartExpenses'); if(c2 && window.Chart){ new Chart(c2,{type:'line',data:{labels:days,datasets:[{label:'Dépenses',data:vals}]},options:{responsive:true,plugins:{legend:{display:false}}}}); } }
  async function initSettings(){ await setBadge(); const who=document.getElementById('who'); if(who) who.textContent=(await Store.getMeta('profile'))||'—'; const imp=document.getElementById('importFile'); if(imp) imp.addEventListener('change', importData); const open=document.getElementById('openSheet'); if(open) open.onclick=()=>window.open(SHEET_URL,'_blank'); }
  return { setProfile, initHome, initSettings, export:exportData, import:importData, reset:resetAll, refresh };
})();
