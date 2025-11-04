
const NOTES=(()=>{
  function load(){ return JSON.parse(localStorage.getItem('noem_data_v1')||'{"notes":""}'); }
  function save(d){ localStorage.setItem('noem_data_v1', JSON.stringify(d)); }
  function render(){
    const d=load(); document.getElementById('notes').value = d.notes||'';
    const el = document.getElementById('calendar');
    if(el && window.FullCalendar){
      const CAL = new FullCalendar.Calendar(el, { initialView:'dayGridMonth', height:'auto', locale:'fr' });
      CAL.render();
    }
  }
  function saveNotes(){ const d=load(); d.notes = document.getElementById('notes').value; save(d); alert('Notes sauvegardées.'); }
  function clearNotes(){ if(confirm('Effacer les notes ?')){ document.getElementById('notes').value=''; saveNotes(); } }
  document.addEventListener('DOMContentLoaded', ()=>{ NOEM.initHome && NOEM.initHome(); render(); });
  return {save:saveNotes, clear:clearNotes};
})();
