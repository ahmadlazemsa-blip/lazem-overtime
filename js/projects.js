// PROJECTS
// ═══════════════════════════════════════
function addProj() {
  var name = document.getElementById('p-name').value.trim(); if(!name) return;
  D.projects.push({
    id: uid(), name:name,
    sup: document.getElementById('p-sup').value.trim(),
    type: document.getElementById('p-type').value,
    employees:[], entries:[]
  });
  document.getElementById('p-name').value='';
  document.getElementById('p-sup').value='';
  save(); drawProj(); syncSels(); updBadge();
}

function delProj(id) {
  if(!confirm('Delete this project? All attendance records will be lost!')) return;
  D.projects = D.projects.filter(function(p){ return p.id!==id; });
  save(); drawProj(); syncSels();
}

function openEditProj(id) {
  var p = D.projects.find(function(x){ return x.id===id; }); if(!p) return;
  document.getElementById('ep-name').value = p.name;
  document.getElementById('ep-sup').value = p.sup||'';
  document.getElementById('ep-type').value = p.type;
  document.getElementById('m-edit-proj').dataset.editId = id;
  document.getElementById('m-edit-proj').classList.add('on');
}

function saveEditProj() {
  var id = document.getElementById('m-edit-proj').dataset.editId;
  var p = D.projects.find(function(x){ return x.id===id; }); if(!p) return;
  var newName = document.getElementById('ep-name').value.trim();
  if(!newName) { alert('Project name is required'); return; }
  p.name = newName;
  p.sup  = document.getElementById('ep-sup').value.trim();
  p.type = document.getElementById('ep-type').value;
  save(); drawProj(); syncSels(); updBadge();
  closeM('m-edit-proj');
}

function drawProj() {
  var el = document.getElementById('p-list');
  if(!D.projects.length) {
    el.innerHTML='<div class="card" style="text-align:center;color:var(--tx3);padding:32px;font-size:14px">📭 No projects yet — add your first project above</div>';
  } else {
    el.innerHTML = D.projects.map(function(p) {
      var be={};
      p.entries.forEach(function(e){ if(!be[e.empName]) be[e.empName]=[]; be[e.empName].push(e); });
      var ot = Object.keys(be).reduce(function(s,emp){ return s+calcOT(p.type,be[emp]).to; },0);
      var tw = Object.keys(be).reduce(function(s,emp){ return s+calcOT(p.type,be[emp]).tw; },0);
      return '<div class="proj-card">'
        +'<div class="proj-header">'
          +'<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
            +'<span style="font-size:16px;font-weight:700">'+p.name+'</span>'
            +'<span class="bdg b">'+PT[p.type].lbl+'</span>'
            +(p.sup?'<span style="font-size:11px;color:var(--tx3)">👤 '+p.sup+'</span>':'')
            +(ot>0?'<span class="bdg a">⚡ OT: '+fmtH(ot)+'</span>':'')
            +'<span style="font-size:11px;color:var(--tx3)">📋 Total: '+fmtH(tw)+'</span>'
          +'</div>'
          +'<div class="proj-actions">'
            +'<button class="btn sl sm" onclick="openEmpM(\''+p.id+'\')">👥 Employees ('+p.employees.length+')</button>'
            +'<button class="btn vl sm" onclick="openEditProj(\''+p.id+'\')">✏️ Edit</button>'
            +'<button class="btn rd sm" onclick="delProj(\''+p.id+'\')">🗑️ Delete</button>'
          +'</div>'
        +'</div>'
        +'<div class="proj-body">'
          +(p.employees.length
            ? p.employees.map(function(em,i){
                return '<div class="chip">'
                  +'<span style="width:18px;height:18px;border-radius:50%;background:'+C[i%8]+'22;color:'+C[i%8]+';font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">'+em[0]+'</span>'
                  +em+'</div>';
              }).join('')
            : '<span style="font-size:12px;color:var(--tx3)">No employees added yet</span>')
        +'</div>'
        +'</div>';
    }).join('');
  }

  // GPS Locations
  var locEl = document.getElementById('p-locations');
  if(locEl) {
    locEl.innerHTML = !D.projects.length ? '<p style="color:var(--tx3);font-size:13px">Add projects first</p>' :
      D.projects.map(function(p) {
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--br);flex-wrap:wrap;gap:8px">'
          +'<div><div style="font-size:13px;font-weight:600">'+p.name+'</div>'
          +'<div style="font-size:11px;color:var(--tx3)">'+(p.lat?'📍 '+p.lat.toFixed(4)+', '+p.lng.toFixed(4)+' | Radius: '+(p.radius||200)+'m':'No location set')+'</div></div>'
          +'<div style="display:flex;gap:6px">'
          +'<button class="btn sl sm" onclick="setLocById(event)" data-id="'+p.id+'">📍 Set Location</button>'
          +(p.lat?'<button class="btn rd sm" onclick="clearLocById(event)" data-id="'+p.id+'">✕ Clear</button>':'')
          +'</div></div>';
      }).join('');
  }
}

function openEmpM(pid) {
  var p = D.projects.find(function(x){ return x.id===pid; });
  document.getElementById('m-emp-body').innerHTML =
    '<div style="font-size:12px;color:var(--tx3);margin-bottom:12px">Project: <strong style="color:var(--tx)">'+p.name+'</strong></div>'
    +'<div style="display:flex;gap:8px;margin-bottom:14px">'
    +'<input class="inp" id="new-emp" placeholder="Employee name..." onkeydown="if(event.key===\'Enter\')addEmp(\''+pid+'\')"/>'
    +'<button class="btn g sm" onclick="addEmp(\''+pid+'\')">+ Add</button></div>'
    +'<div style="display:flex;flex-wrap:wrap">'
    +p.employees.map(function(em,i){
      return '<div class="chip"><span style="width:22px;height:22px;border-radius:50%;background:'+C[i%8]+'22;color:'+C[i%8]+';font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center">'+em[0]+'</span>'
        +em+'<button class="chip-x" onclick="remEmp(\''+pid+'\',\''+em+'\')">✕</button></div>';
    }).join('')
    +(p.employees.length?'':'<span style="font-size:12px;color:var(--tx3)">No employees yet</span>')+'</div>';
  document.getElementById('m-emp').classList.add('on');
}

function addEmp(pid) {
  var inp = document.getElementById('new-emp'), name = inp.value.trim();
  var p = D.projects.find(function(x){ return x.id===pid; });
  if(!name || p.employees.indexOf(name)>=0) return;
  p.employees.push(name); save(); inp.value=''; openEmpM(pid); syncSels(); drawProj();
}

function remEmp(pid, name) {
  if(!confirm('Remove '+name+' from this project?')) return;
  var p = D.projects.find(function(x){ return x.id===pid; });
  p.employees = p.employees.filter(function(e){ return e!==name; });
  save(); openEmpM(pid); syncSels(); drawProj();
}

function setLocById(ev) {
  var pid = ev.target.dataset.id;
  if(!navigator.geolocation) { alert('GPS not available'); return; }
  var p = D.projects.find(function(x){ return x.id===pid; });
  var radius = prompt('Allowed radius in meters:', '200'); if(radius===null) return;
  navigator.geolocation.getCurrentPosition(function(pos) {
    p.lat=pos.coords.latitude; p.lng=pos.coords.longitude; p.radius=parseInt(radius)||200;
    save(); drawProj(); alert('Location set for '+p.name+'!');
  }, function(){ alert('Could not get location'); });
}

function clearLocById(ev) {
  var pid = ev.target.dataset.id;
  var p = D.projects.find(function(x){ return x.id===pid; });
  delete p.lat; delete p.lng; delete p.radius; save(); drawProj();
}

function closeM(id) { document.getElementById(id).classList.remove('on'); }

// ═══════════════════════════════════════