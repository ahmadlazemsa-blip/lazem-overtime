// STAFF ACCOUNTS
// ═══════════════════════════════════════
function drawUsers() {
  var sel=document.getElementById('u-proj');
  if(sel){var v=sel.value;sel.innerHTML="<option value=''>— Select —</option>"+D.projects.map(function(p){return "<option value='"+p.id+"'>"+p.name+"</option>";}).join('');sel.value=v;}
  var el=document.getElementById('u-list');if(!el)return;
  if(!D.staff.length){el.innerHTML='<div class="card" style="text-align:center;color:var(--tx3);padding:20px">No staff accounts yet</div>';return;}
  el.innerHTML=D.staff.map(function(s,i){
    var proj=D.projects.find(function(p){return p.id===s.projId;});
    return '<div class="card" style="margin-bottom:8px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">'
      +'<div><div style="font-size:14px;font-weight:600">'+s.name+'</div>'
      +'<div style="font-size:11px;color:var(--tx3)">@'+s.username+' | '+(proj?proj.name:'No project')+'</div></div>'
      +'<div style="display:flex;gap:6px;align-items:center">'
      +'<span style="font-size:11px;background:var(--bg3);border:1px solid var(--br);border-radius:6px;padding:3px 8px;color:var(--tx3)">'+s.password+'</span>'
      +'<button class="btn rd sm" onclick="delStaff('+i+')">🗑️</button></div></div>';
  }).join('');
}

function addStaff(){
  var name=document.getElementById('u-name').value.trim(),user=document.getElementById('u-user').value.trim().toLowerCase();
  var pass=document.getElementById('u-pass').value.trim(),proj=document.getElementById('u-proj').value;
  if(!name||!user||!pass){alert('Please fill all fields');return;}
  if(D.staff.some(function(s){return s.username===user;})){alert('Username already exists');return;}
  D.staff.push({name:name,username:user,password:pass,projId:proj});
  saveStaff();
  document.getElementById('u-name').value='';document.getElementById('u-user').value='';document.getElementById('u-pass').value='';
  drawUsers();
}
function delStaff(i){if(!confirm('Delete this account?'))return;D.staff.splice(i,1);saveStaff();drawUsers();}

// ═══════════════════════════════════════

// EXPORT / IMPORT
// ═══════════════════════════════════════
function clearAllData(){
  if(!confirm('⚠️ This will delete ALL projects and data!\nAre you sure?')) return;
  if(!confirm('This cannot be undone. Continue?')) return;
  D.projects=[];
  D.staff=[];
  save();saveStaff();
  syncSels();drawDash();updBadge();
  go('proj');
  alert('✅ All data cleared!');
}

function exportData(){
  var blob=new Blob([JSON.stringify(D,null,2)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='lazem-data-'+new Date().toISOString().slice(0,10)+'.json';a.click();
}
function importData(inp){
  var file=inp.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(ev){
    try{
      var imported=JSON.parse(ev.target.result);
      if(!imported.projects){alert('Invalid file');return;}
      D=imported;save();syncSels();drawDash();updBadge();
      alert('✅ Imported '+imported.projects.length+' projects');
    }catch(err){alert('Error: '+err.message);}
  };
  reader.readAsText(file);inp.value='';
}

// ═══════════════════════════════════════