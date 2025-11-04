
const KEY='noem_data_v1'; // {tasks:[], expenses:[], notes:"", sheet:"", profile:""}

const NOEM=(()=>{
  let data = {tasks:[], expenses:[], notes:"", sheet:"", profile:""};

  const $=s=>document.querySelector(s);
  function load(){
    try{ data = JSON.parse(localStorage.getItem(KEY) || '{"tasks":[],"expenses":[],"notes":"","sheet":"","profile":""}'); }catch{}
  }
  function save(){ localStorage.setItem(KEY, JSON.stringify(data)); }

  function setBadge(){
    const b = $('#profileBadge'); if(b) b.textContent = data.profile? (data.profile==='Bastien'?'👷 Bastien GOSSELIN — Mode Gérant':'💻 Mathis GOSSELIN — NOEM INFO') : '—';
  }

  // PWA
  function registerSW(){
    if('serviceWorker' in navigator){ navigator.serviceWorker.register('./service-worker.js'); }
  }

  // Splash
  function hideSplash(){ const s=$('#splash'); if(s) setTimeout(()=> s.style.display='none', 1200); }

  function setProfile(p){ load(); data.profile=p; save(); alert('Profil enregistré : '+p); setBadge(); }
  function saveSheet(){ load(); data.sheet = $('#sheetLink').value.trim(); save(); alert('Lien enregistré.'); }
  function openSheet(){ load(); if(!data.sheet) return alert('Aucun lien enregistré.'); window.open(data.sheet,'_blank'); }
  function exportData(){ load(); const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='noem-data.json'; a.click(); }
  function importData(e){
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>{ try{ const o=JSON.parse(r.result); localStorage.setItem(KEY, JSON.stringify(o)); alert('Import réussi.'); location.reload(); }catch{ alert('Fichier invalide'); } };
    r.readAsText(f);
  }
  function resetAll(){ if(confirm('Tout réinitialiser ?')){ localStorage.removeItem(KEY); location.reload(); } }

  function initHome(){
    load(); setBadge(); registerSW(); hideSplash();
    const open = data.tasks.filter(t=>t.status!=='Fait').length;
    const hours = data.tasks.reduce((s,t)=> s + (parseFloat(t.hours)||0), 0);
    const late = data.tasks.filter(t=> t.status!=='Fait' && t.end && new Date(t.end) < new Date()).length;
    const now = new Date(); const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const spend = (data.expenses||[]).filter(x=> x.date && x.date.startsWith(ym)).reduce((s,x)=> s+(parseFloat(x.amount)||0),0);
    $('#kOpen').textContent=open; $('#kHours').textContent=hours.toFixed(1).replace('.',','); $('#kLate').textContent=late; $('#kSpend').textContent=spend.toFixed(2)+' €';
    const btn = document.getElementById('openSheet'); if(btn) btn.onclick = openSheet;
    if(!data.profile){ const p = prompt('Qui êtes-vous ? (Bastien/Mathis)') || 'Mathis'; setProfile(p); }
  }

  function initSettings(){
    load(); setBadge(); registerSW(); hideSplash();
    const who = document.getElementById('who'); if(who) who.textContent = data.profile||'—';
    const link = document.getElementById('sheetLink'); if(link) link.value = data.sheet||'';
    const imp = document.getElementById('importFile'); if(imp) imp.addEventListener('change', importData);
    if(!data.profile){ const p = prompt('Qui êtes-vous ? (Bastien/Mathis)') || 'Mathis'; setProfile(p); }
  }

  return { initHome, initSettings, setProfile, saveSheet, openSheet, export:exportData, import:importData, reset:resetAll };
})();

window.NOEM = NOEM;
