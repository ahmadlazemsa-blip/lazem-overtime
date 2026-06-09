// EMPLOYEES
// ═══════════════════════════════════════
function quickAddEmp() {
  var pid = document.getElementById('emp-proj-sel').value;
  var name = document.getElementById('emp-name-inp').value.trim();
  if(!pid) { alert('Please select a project first'); return; }
  if(!name) { alert('Please enter employee name'); return; }
  var p = D.projects.find(function(x){ return x.id===pid; });
  if(!p) return;
  if(p.employees.indexOf(name) >= 0) { alert(name+' already exists in '+p.name); return; }
  p.employees.push(name);
  save(); syncSels();
  document.getElementById('emp-name-inp').value = '';
  onEmpProjSel(); // refresh member chips
  drawEmps();
}

function onEmpProjSel() {
  var pid = document.getElementById('emp-proj-sel').value;
  var el = document.getElementById('emp-proj-members');
  if(!pid || !el) { if(el) el.innerHTML=''; return; }
  var p = D.projects.find(function(x){ return x.id===pid; });
  if(!p || !p.employees.length) { el.innerHTML='<span style="font-size:12px;color:var(--tx3)">No employees in this project yet</span>'; return; }
  el.innerHTML = '<span style="font-size:11px;color:var(--tx3);margin-left:4px">Current members: </span>'
    + p.employees.map(function(em, i) {
        return '<div class="chip">'
          + '<span style="width:18px;height:18px;border-radius:50%;background:'+C[i%8]+'22;color:'+C[i%8]+';font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">'+em[0]+'</span>'
          + em
          + '<button class="chip-x" onclick="quickRemEmp(\'' + pid + '\',\'' + em + '\')" title="Remove">✕</button></div>';
      }).join('');
}

function quickRemEmp(pid, name) {
  if(!confirm('Remove '+name+' from this project?')) return;
  var p = D.projects.find(function(x){ return x.id===pid; });
  p.employees = p.employees.filter(function(e){ return e!==name; });
  save(); syncSels(); onEmpProjSel(); drawEmps();
}

function drawEmps() {
  // Sync the project select in employees page
  var empSel = document.getElementById('emp-proj-sel');
  if(empSel) {
    var v = empSel.value;
    empSel.innerHTML = '<option value="">— Select Project —</option>'
      + D.projects.map(function(p){ return '<option value="'+p.id+'">'+p.name+'</option>'; }).join('');
    empSel.value = v;
    onEmpProjSel();
  }

  var el = document.getElementById('emps-list');
  var all = [];
  D.projects.forEach(function(p){
    p.employees.forEach(function(emp,ei){
      var ents=p.entries.filter(function(e){ return e.empName===emp; });
      var res=calcOT(p.type,ents), ws=thisWeek(p.type,ents);
      all.push({emp:emp,proj:p.name,pid:p.id,type:p.type,tw:res.tw,to:res.to,ws:ws,col:C[ei%8]});
    });
  });
  if(!all.length) {
    el.innerHTML = !D.projects.length
      ? '<div class="card" style="text-align:center;color:var(--tx3);padding:32px"><div style="font-size:36px;margin-bottom:12px">🏗️</div><div style="font-size:15px;font-weight:600;margin-bottom:6px">No Projects Yet</div><div style="font-size:13px">Go to Projects page first and add a project</div></div>'
      : '<div class="card" style="text-align:center;color:var(--tx3);padding:32px"><div style="font-size:36px;margin-bottom:12px">👥</div><div style="font-size:15px;font-weight:600;margin-bottom:6px">No Employees Yet</div><div style="font-size:13px">Use the form above to add employees to your projects</div></div>';
    return;
  }
  el.innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">'
    +all.map(function(e){
      return '<div class="card" style="cursor:pointer;margin-bottom:0" onclick="openProf(\''+e.pid+'\',\''+e.emp+'\')">'
        +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">'
        +'<div style="width:42px;height:42px;border-radius:50%;background:'+e.col+'22;color:'+e.col+';font-size:17px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid '+e.col+'44;flex-shrink:0">'+e.emp[0]+'</div>'
        +'<div style="flex:1"><div style="font-size:14px;font-weight:700">'+e.emp+'</div><div style="font-size:11px;color:var(--tx3)">'+e.proj+' | '+PT[e.type].lbl+'</div></div>'
        +(e.to>0?'<span class="bdg a">⚡ '+fmtH(e.to)+'</span>':PT[e.type].ot?'<span class="bdg g">✓</span>':'<span class="bdg b">Rotation</span>')+'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px;text-align:center">'
        +'<div style="background:var(--bg3);border-radius:6px;padding:8px"><div style="font-size:9px;color:var(--tx3)">Work</div><div style="font-size:14px;font-weight:700;font-family:monospace">'+fmtH(e.tw-e.to)+'</div></div>'
        +'<div style="background:'+(e.to>0?'#78350f18':'var(--bg3)')+';border-radius:6px;padding:8px"><div style="font-size:9px;color:var(--tx3)">Overtime</div><div style="font-size:14px;font-weight:700;font-family:monospace;color:'+(e.to>0?'var(--a)':'var(--g)')+'">'+fmtH(e.to)+'</div></div>'
        +'<div style="background:var(--bg3);border-radius:6px;padding:8px"><div style="font-size:9px;color:var(--tx3)">Total</div><div style="font-size:14px;font-weight:700;font-family:monospace">'+fmtH(e.tw)+'</div></div></div>'
        +'<div style="font-size:11px;color:var(--tx3)">This week: '+fmtH(e.ws.worked)+' ('+e.ws.shifts+' shifts)'+(e.ws.ot>0?' ⚡ '+fmtH(e.ws.ot):'')+'</div>'
        +'<div class="pb" style="margin-top:6px"><div class="pf" style="width:'+(e.tw>0?Math.round((e.tw-e.to)/e.tw*100):0)+'%;background:var(--g)"></div></div>'
        +(e.to>0?'<div class="pb" style="margin-top:2px"><div class="pf" style="width:'+(e.tw>0?Math.round(e.to/e.tw*100):0)+'%;background:var(--a)"></div></div>':'')
        +'</div>';
    }).join('')+'</div>';
}

function openProf(pid, emp) {
  var p = D.projects.find(function(x){ return x.id===pid; });
  var ents = p.entries.filter(function(e){ return e.empName===emp; });
  var res=calcOT(p.type,ents), ws=thisWeek(p.type,ents);
  document.getElementById('m-prof-title').textContent = '👤 '+emp;
  document.getElementById('m-prof-body').innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">'
    +'<div style="background:var(--bg3);border-radius:9px;padding:12px;text-align:center"><div style="font-size:10px;color:var(--tx3)">Work Hours</div><div style="font-size:22px;font-weight:700;font-family:monospace">'+fmtH(res.tw-res.to)+'</div></div>'
    +'<div style="background:'+(res.to>0?'#78350f18':'var(--bg3)')+';border-radius:9px;padding:12px;text-align:center;border:1px solid '+(res.to>0?'#92400e':'var(--br)')+'">'
      +'<div style="font-size:10px;color:var(--tx3)">Overtime</div><div style="font-size:22px;font-weight:700;font-family:monospace;color:'+(res.to>0?'var(--a)':'var(--g)')+'">'+fmtH(res.to)+'</div></div>'
    +'<div style="background:var(--bg3);border-radius:9px;padding:12px;text-align:center"><div style="font-size:10px;color:var(--tx3)">Total</div><div style="font-size:22px;font-weight:700;font-family:monospace">'+fmtH(res.tw)+'</div></div></div>'
    +'<div style="background:var(--bg3);border-radius:9px;padding:10px 12px;margin-bottom:12px;font-size:12px;border:1px solid var(--br)">This week: <strong>'+fmtH(ws.worked)+'</strong> — '+ws.shifts+' shifts '+(ws.ot>0?'| <span style="color:var(--a)">⚡ '+fmtH(ws.ot)+'</span>':'')+'<div style="color:var(--tx3);margin-top:3px">'+p.name+' | '+PT[p.type].lbl+'</div></div>'
    +'<div style="font-size:11px;font-weight:600;color:var(--tx2);margin-bottom:6px">Shifts ('+ents.length+')</div>'
    +'<div style="max-height:230px;overflow-y:auto;border:1px solid var(--br);border-radius:8px">'
    +(!ents.length?'<div style="padding:16px;text-align:center;color:var(--tx3)">No shifts recorded</div>'
    :ents.slice().sort(function(a,b){ return new Date(b.date)-new Date(a.date); }).map(function(e){
      return '<div style="display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--br);font-size:12px">'
        +'<span style="color:var(--tx3);font-family:monospace">'+e.date+'</span>'
        +'<span style="color:var(--tx2)">'+e.inT+' → '+e.outT+(e.nd?' <span style="color:#a78bfa">+1d</span>':'')+'</span>'
        +'<span style="font-family:monospace;font-weight:600">'+fmtH(e.h)+'</span></div>';
    }).join(''))+'</div>';
  document.getElementById('m-prof').classList.add('on');
}

// ═══════════════════════════════════════