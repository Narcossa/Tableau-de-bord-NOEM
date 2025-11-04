
const EXP=(()=>{
  const $=s=>document.querySelector(s);
  function load(){ return JSON.parse(localStorage.getItem('noem_data_v1')||'{"expenses":[]}'); }
  function save(d){ localStorage.setItem('noem_data_v1', JSON.stringify(d)); }
  function add(){
    const d = load();
    const it = {
      id:'e'+Date.now(),
      supplier: $('#exSupplier').value.trim(),
      client: $('#exClient').value.trim(),
      type: $('#exType').value.trim(),
      amount: parseFloat($('#exAmount').value||'0')||0,
      date: $('#exDate').value||'',
      note: $('#exNote').value.trim()
    };
    if(!it.supplier || !it.amount) return alert('Fournisseur et montant requis.');
    d.expenses = d.expenses || []; d.expenses.unshift(it); save(d);
    $('#exSupplier').value=$('#exClient').value=$('#exType').value=$('#exAmount').value=$('#exDate').value=$('#exNote').value='';
    render();
  }
  function del(id){
    if(!confirm('Supprimer cette dépense ?')) return;
    const d=load(); d.expenses = (d.expenses||[]).filter(x=>x.id!==id); save(d); render();
  }
  function render(){
    const d=load(); d.expenses = d.expenses||[];
    const tb = $('#tbExpenses'); tb.innerHTML='';
    d.expenses.forEach(x=>{
      const tr=document.createElement('tr');
      tr.innerHTML = `<td data-label="Date">${x.date||'—'}</td>
        <td data-label="Fournisseur">${x.supplier}</td>
        <td data-label="Client">${x.client||'—'}</td>
        <td data-label="Type">${x.type||'—'}</td>
        <td data-label="Montant">${(x.amount||0).toFixed(2)} €</td>
        <td data-label="Note">${x.note||'—'}</td>
        <td data-label="Actions"><button class="btn" onclick="EXP.del('${x.id}')">🗑️</button></td>`;
      tb.appendChild(tr);
    });
    // KPIs
    const now = new Date(); const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const total = d.expenses.filter(x=>x.date && x.date.startsWith(ym)).reduce((s,x)=> s+(parseFloat(x.amount)||0),0);
    const count = d.expenses.length;
    const byClient = {}; d.expenses.forEach(x=>{ if(x.client) byClient[x.client]=(byClient[x.client]||0)+(parseFloat(x.amount)||0); });
    let top='—', tv=0; Object.entries(byClient).forEach(([c,v])=>{ if(v>tv){ tv=v; top=`${c} (${v.toFixed(2)} €)`; } });
    $('#exTotal').textContent = total.toFixed(2)+' €'; $('#exCount').textContent=count; $('#exTop').textContent=top||'—';
  }
  document.addEventListener('DOMContentLoaded', ()=>{ NOEM.initHome && NOEM.initHome(); render(); });
  return {add,del};
})();
