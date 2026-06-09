// ATTENDANCE
// ═══════════════════════════════════════
function onAProj() {
  var pid = document.getElementById('a-proj').value;
  var es = document.getElementById('a-emp');
  es.innerHTML = '<option value="">— Select —</option>';
  if(pid) {
    var p = D.projects.find(function(x){ return x.id===pid; });
    if(p) p.employees.forEach(function(em){ es.innerHTML+='<option value="'+em+'">'+em+'</option>'; });
  }
  drawAtt();
}

function onAEmp() { drawAtt(); }

function togND() {
  D.nd = !D.nd;
  var b = document.getElementById('nd-btn');
  b.textContent = D.nd ? '🌙 Next Day Out ✓' : '🌙 Next Day Out';
  b.style.background = D.nd ? '#4c1d95' : '';
  b.style.color = D.nd ? '#fff' : '';
  onATime();
}

function onATime() {
  var a=document.getElementById('a-in').value, b=document.getElementById('a-out').value;
  if(!a||!b) return;
  var h = tDiff(a,b,D.nd);
  document.getElementById('a-dur').textContent='Duration: '+fmtH(h);
  // Snap hint
  var emp = document.getElementById('a-emp').value;
  var pid = document.getElementById('a-proj').value;
  if(emp&&pid) {
    var p = D.projects.find(function(x){ return x.id===pid; });
    if(p) document.getElementById('a-snap').textContent='Expected: '+PT[p.type].sh+'H';
  }
}

function addEntry() {
  var pid=document.getElementById('a-proj').value, emp=document.getElementById('a-emp').value;
  var date=document.getElementById('a-date').value;
  var a=document.getElementById('a-in').value, b=document.getElementById('a-out').value;
  if(!pid||!emp||!date) { alert('Please select Project, Employee and Date'); return; }
  var p = D.projects.find(function(x){ return x.id===pid; });
  p.entries.push({ id:uid(), empName:emp, date:date, inT:a, outT:b, nd:D.nd, h:tDiff(a,b,D.nd), src:'manual' });
  save(); drawAtt(); onAEmp(); updBadge();
}

function delEntry(pid, eid) {
  var p = D.projects.find(function(x){ return x.id===pid; });
  p.entries = p.entries.filter(function(e){ return e.id!==eid; });
  save(); drawAtt(); updBadge();
}

function drawAtt() {
  var el = document.getElementById('a-recs');
  if(!D.projects.length) { el.innerHTML='<div class="card" style="text-align:center;color:var(--tx3);padding:28px">No projects</div>'; return; }
  el.innerHTML = D.projects.map(function(p) {
    var be={}; p.entries.forEach(function(e){ if(!be[e.empName]) be[e.empName]=[]; be[e.empName].push(e); });
    var emps = p.employees.length ? p.employees : Object.keys(be);
    if(!emps.length) return '';
    var rows = emps.map(function(emp,ei) {
      var ents=be[emp]||[], res=calcOT(p.type,ents), reg=res.tw-res.to, col=C[ei%8];
      var wkRows = p.type!=='4x12'
        ? res.weeks.map(function(w,wi) {
            return '<div style="border-bottom:1px solid var(--br)">'
              +'<div style="display:flex;justify-content:space-between;padding:5px 12px;background:'+(w.ot>0?'#78350f12':'var(--bg2)')+';font-size:11px'+(w.ot>0?';border-right:3px solid var(--a)':'')+'">'
              +'<span style="color:var(--tx2);font-weight:600">Week '+(wi+1)+' — '+w.entries.length+' shift</span>'
              +'<span style="color:var(--tx3)">Worked: <strong style="color:var(--tx)">'+fmtH(w.worked)+'</strong> | '+(w.ot>0?'<strong style="color:var(--a)">⚡ '+fmtH(w.ot)+'</strong>':'<strong style="color:var(--g)">✓ Within Standard</strong>')+'</span></div>'
              +w.entries.map(function(e) {
                return '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 12px;font-size:12px;border-bottom:1px solid var(--br)">'
                  +'<div style="display:flex;gap:10px"><span style="color:var(--tx3);font-family:monospace">'+e.date+'</span>'
                  +'<span style="color:var(--tx2)">'+e.inT+' → '+e.outT+(e.nd?'<span style="color:#a78bfa;font-size:10px"> +1d</span>':'')+'</span></div>'
                  +'<div style="display:flex;align-items:center;gap:8px">'
                  +'<span style="font-family:monospace;font-weight:600">'+fmtH(e.h)+'</span>'
                  +'<button onclick="delEntry(\''+p.id+'\',\''+e.id+'\')" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:14px" title="Delete">✕</button>'
                  +'</div></div>';
              }).join('')+'</div>';
          }).join('')
        : ents.map(function(e) {
            return '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 12px;font-size:12px;border-bottom:1px solid var(--br)">'
              +'<div style="display:flex;gap:10px"><span style="color:var(--tx3);font-family:monospace">'+e.date+'</span><span style="color:var(--tx2)">'+e.inT+' → '+e.outT+'</span></div>'
              +'<div style="display:flex;align-items:center;gap:8px"><span style="font-family:monospace">'+fmtH(e.h)+'</span>'
              +'<button onclick="delEntry(\''+p.id+'\',\''+e.id+'\')" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:14px">✕</button>'
              +'</div></div>';
          }).join('');

      return '<div style="margin-bottom:12px;border:1px solid var(--br);border-radius:9px;overflow:hidden">'
        +'<div style="background:var(--bg3);padding:10px 12px;border-bottom:1px solid var(--br)">'
        +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
        +'<span style="width:28px;height:28px;border-radius:50%;background:'+col+'22;color:'+col+';font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;border:1px solid '+col+'44">'+emp[0]+'</span>'
        +'<span style="font-weight:600">'+emp+'</span>'
        +(p.type==='4x12'?'<span class="bdg b">Rotation</span>':res.to>0?'<span class="bdg a">⚡ OT: '+fmtH(res.to)+'</span>':'<span class="bdg g">✓ Within Standard</span>')+'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;border:1px solid var(--br);border-radius:7px;overflow:hidden">'
        +'<div style="text-align:center;padding:8px;border-left:1px solid var(--br)"><div style="font-size:10px;color:var(--tx3)">Work Hours</div><div style="font-size:17px;font-weight:700;font-family:monospace">'+fmtH(reg)+'</div><div style="font-size:10px;color:var(--tx3)">'+ents.length+' shift</div></div>'
        +'<div style="text-align:center;padding:8px;border-left:1px solid var(--br);background:'+(res.to>0?'#78350f15':'')+'">'
          +'<div style="font-size:10px;color:var(--tx3)">Overtime</div>'
          +'<div style="font-size:17px;font-weight:700;font-family:monospace;color:'+(p.type==='4x12'?'var(--b)':res.to>0?'var(--a)':'var(--g)')+'">'+( p.type==='4x12'?'—':res.to>0?'⚡'+fmtH(res.to):'0H')+'</div>'
        +'</div>'
        +'<div style="text-align:center;padding:8px"><div style="font-size:10px;color:var(--tx3)">Total</div><div style="font-size:17px;font-weight:700;font-family:monospace">'+fmtH(res.tw)+'</div></div>'
        +'</div></div>'+wkRows+'</div>';
    }).join('');
    return '<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:8px">'+p.name+' <span class="bdg b">'+PT[p.type].lbl+'</span>'+(p.sup?'<span style="font-size:11px;color:var(--tx3)">👤 '+p.sup+'</span>':'')+'</div>'+rows+'</div>';
  }).join('');
}

// ═══════════════════════════════════════