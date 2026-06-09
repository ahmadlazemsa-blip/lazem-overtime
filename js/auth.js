// NAVIGATION
// ═══════════════════════════════════════
var PAGES = {
  dash:'drawDash', proj:'drawProj', att:'drawAtt', cal:'drawCal',
  emps:'drawEmps', rep:'drawRep',  alr:'drawAlr', imp:'drawImp',
  'att-imp':'drawAttImp', users:'drawUsers'
};

function go(id) {
  document.querySelectorAll('.pg').forEach(function(p){ p.classList.remove('on'); });
  document.querySelectorAll('.nav').forEach(function(n){ n.classList.remove('on'); });
  var pg = document.getElementById('pg-'+id);
  if(pg) pg.classList.add('on');
  var nb = document.getElementById('n-'+id);
  if(nb) nb.classList.add('on');
  if(PAGES[id] && window[PAGES[id]]) window[PAGES[id]]();
}

function updBadge() {
  var n = getAlerts().length, b = document.getElementById('abadge');
  b.textContent = n; b.style.display = n ? 'inline' : 'none';
}

function syncSels() {
  // Project selects
  ['a-proj','r-proj','cmp-proj','src-proj','cal-proj','imp-proj','ai-proj','u-proj'].forEach(function(id) {
    var sel = document.getElementById(id); if(!sel) return;
    var v = sel.value;
    var opts = '<option value="">— '+( id==='cal-proj' ? 'All Projects' : id==='u-proj' ? 'Select' : 'All Projects') +' —</option>';
    sel.innerHTML = opts + D.projects.map(function(p){ return '<option value="'+p.id+'">'+p.name+'</option>'; }).join('');
    sel.value = v;
  });
}

// ═══════════════════════════════════════

// AUTH FUNCTIONS
// ═══════════════════════════════════════
function doLogin() {
  var u = document.getElementById('l-user').value.trim().toLowerCase();
  var p = document.getElementById('l-pass').value;
  var err = document.getElementById('l-err');
  err.style.display = 'none';
  if(!u||!p) { err.style.display='block'; err.textContent='Please enter username and password'; return; }
  // Check USERS first, then staff
  var usr = USERS[u];
  if(!usr) {
    // Check staff accounts
    var staff = D.staff.find(function(s){ return s.username===u&&s.password===p; });
    if(staff) { AUTH={name:staff.name,role:'staff',username:u,proj:staff.projId?D.projects.find(function(p){return p.id===staff.projId;})&&D.projects.find(function(p){return p.id===staff.projId;}).name:''}; }
    else { err.style.display='block'; err.textContent='Incorrect username or password'; return; }
  } else {
    if(usr.pass!==p) { err.style.display='block'; err.textContent='Incorrect username or password'; return; }
    AUTH = Object.assign({},usr,{username:u});
  }
  document.getElementById('login-page').style.display='none';
  document.getElementById('l-pass').value='';
  showApp();
  if(AUTH.role==='sup') setupSup();
}

function doLogout() {
  if(D._allProjects) D.projects = D._allProjects;
  D._allProjects = null;
  AUTH = null;
  ['n-imp','n-att-imp','n-rep','n-users'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.style.display='';
  });
  document.getElementById('login-page').style.display='flex';
  document.getElementById('sb').style.display='none';
  document.getElementById('main').style.display='none';
  document.getElementById('l-user').value='';
}

function showApp() {
  document.getElementById('sb').style.cssText='display:flex!important;position:fixed;right:0;top:0;width:220px;height:100vh;background:#0f172a;border-left:1px solid #334155;flex-direction:column;z-index:10;overflow-y:auto';
  document.getElementById('main').style.cssText='display:block!important;margin-right:220px;padding:24px;max-width:1100px';
  document.getElementById('sb-uname').textContent = AUTH.name;
  document.getElementById('sb-urole').textContent = AUTH.role==='admin'?'Administrator':AUTH.role==='sup'?'Supervisor':'Staff';
  syncSels(); drawDash(); drawCal(); updBadge();
}

function setupSup() {
  var supProj = AUTH.proj;
  if(supProj) {
    D._allProjects = D._allProjects || D.projects;
    D.projects = D._allProjects.filter(function(p){ return p.name===supProj||p.name.toLowerCase()===supProj.toLowerCase(); });
  }
  ['n-imp','n-att-imp','n-rep','n-users'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.style.display='none';
  });
  syncSels(); go('att');
}

// ═══════════════════════════════════════