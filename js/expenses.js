
const EXP=(()=>{
  function uuid(){ return 'e'+crypto.randomUUID(); }
  async function render(){
    const expenses=await Store.allExpenses();
    const showArchived=document.getElementById('showArchived')?.checked;
    const tb=document.getElementById('tbExpenses'); if(!tb) return; tb.innerHTML='';
    const list=expenses.filter(e=> showArchived? true : !e.archived);
    for(const x of list){
      const tr=document.createElement('tr');
      tr.innerHTML=`<td data-label="Date">${x.date||'—'}</td>
        <td data-label="Fournisseur">${x.supplier}</td>
        <td data-label="Client">${x.client||'—'}</td>
        <td data-label="Type">${x.type||'—'}</td>
        <td data-label="Montant">${(x.amount||0).toFixed(2)} €</td>
        <td data-label="Statut">${x.archived?'<span class="pill ok">Payée</span>':'<span class="pill warn">En attente</span>'}</td>
        <td data-label="Note">${x.note||'—'}</td>
        <td data-label="Actions"><label><input type="checkbox" ${x.archived?'checked':''} onchange="EXP.toggle('${x.id}',this.checked)"> Archiver</label> <button class="btn" onclick="EXP.del('${x.id}')">🗑️</button></td>`;
      tb.appendChild(tr);
    }
    const now=new Date(); const ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const total=expenses.filter(x=>!x.archived && x.date && x.date.startsWith(ym)).reduce((s,x)=>s+(parseFloat(x.amount)||0),0);
    const count=expenses.length; const arch=expenses.filter(x=>x.archived).length;
    const byClient={}; expenses.filter(x=>!x.archived).forEach(x=>{ if(x.client) byClient[x.client]=(byClient[x.client]||0)+(parseFloat(x.amount)||0); });
    let top='—', tv=0; Object.entries(byClient).forEach(([c,v])=>{ if(v>tv){ tv=v; top=`${c} (${v.toFixed(2)} €)`; } });
    document.getElementById('exTotal').textContent=total.toFixed(2)+' €';
    document.getElementById('exCount').textContent=count;
    document.getElementById('exTop').textContent=top;
    document.getElementById('exArchivedCount').textContent=arch;
  }
  async function add(){
    const it={
      id:uuid(),
      supplier:document.getElementById('exSupplier').value.trim(),
      client:document.getElementById('exClient').value.trim(),
      type:document.getElementById('exType').value.trim(),
      amount:parseFloat(document.getElementById('exAmount').value||'0')||0,
      date:document.getElementById('exDate').value||'',
      note:document.getElementById('exNote').value.trim(),
      archived: document.getElementById('exArchived')?.checked||false
    };
    if(!it.supplier || !it.amount){ alert('Fournisseur et montant requis'); return; }
    await Store.addExpense(it);
    ['exSupplier','exClient','exType','exAmount','exDate','exNote'].forEach(id=> document.getElementById(id).value='');
    const chk=document.getElementById('exArchived'); if(chk) chk.checked=false;
    render();
  }
  async function del(id){ if(!confirm('Supprimer ?')) return; await Store.delExpense(id); render(); }
  async function toggle(id,val){ const list=await Store.allExpenses(); const it=list.find(x=>x.id===id); if(!it) return; it.archived=!!val; await Store.updExpense(it); render(); }
  document.addEventListener('DOMContentLoaded',()=>{ const chk=document.getElementById('showArchived'); if(chk) chk.addEventListener('change',render); render(); });
  return {add,del,toggle};
})();