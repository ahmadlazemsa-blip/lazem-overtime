// DASHBOARD
// ═══════════════════════════════════════
function drawDash() {
  document.getElementById('d-date').textContent = 'Today: '+new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  var es=[];
  D.projects.forEach(function(p) {
    var be={};p.entries.forEach(function(e){ if(!be[e.empName]) be[e.empName]=[]; be[e.empName].push(e); });
    (p.employees.length?p.employees:Object.keys(be)).forEach(function(emp){
      var ents=be[emp]||[], res=calcOT(p.type,ents);
      es.push({emp:emp,proj:p.name,type:p.type,tw:res.tw,to:res.to,hasOT:PT[p.type].ot});
    });
  });
  var totOT = es.filter(function(e){ return e.hasOT; }).reduce(function(s,e){ return s+e.to; },0);
  var totW  = es.reduce(function(s,e){ return s+e.tw; },0);
  var als = getAlerts();
  document.getElementById('d-s1').textContent = es.length;
  document.getElementById('d-s2').textContent = fmtH(totOT);
  document.getElementById('d-s3').textContent = fmtH(totW);
  document.getElementById('d-s4').textContent = als.length;

  // Top OT
  var top = es.filter(function(e){ return e.to>0; }).sort(function(a,b){ return b.to-a.to; }).slice(0,5);
  document.getElementById('d-top').innerHTML = !top.length
    ? '<p style="color:var(--tx3);font-size:13px;text-align:center;padding:16px">✅ No overtime recorded yet</p>'
    : top.map(function(e,i){
        return '<div class="emp-row"><span style="color:var(--tx3);width:20px;text-align:center;font-size:13px">'+(i+1)+'</span>'
          +'<div style="width:28px;height:28px;border-radius:50%;background:'+C[i%8]+'22;color:'+C[i%8]+';font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;border:1px solid '+C[i%8]+'44;flex-shrink:0">'+e.emp[0]+'</div>'
          +'<div style="flex:1"><div style="font-size:13px;font-weight:600">'+e.emp+'</div><div style="font-size:10px;color:var(--tx3)">'+e.proj+'</div></div>'
          +'<div style="font-size:14px;font-weight:700;color:var(--a);font-family:monospace">'+fmtH(e.to)+'</div></div>';
      }).join('');

  // Projects overview
  document.getElementById('d-proj').innerHTML = !D.projects.length
    ? '<p style="color:var(--tx3);font-size:13px;text-align:center;padding:16px">No projects</p>'
    : D.projects.map(function(p){
        var be={};p.entries.forEach(function(e){ if(!be[e.empName]) be[e.empName]=[]; be[e.empName].push(e); });
        var ot=Object.keys(be).reduce(function(s,emp){ return s+calcOT(p.type,be[emp]).to; },0);
        return '<div class="emp-row"><div style="flex:1"><div style="font-size:13px;font-weight:600">'+p.name+'</div>'
          +'<div style="font-size:10px;color:var(--tx3)">'+PT[p.type].lbl+' | '+p.employees.length+' employees</div></div>'
          +(ot>0?'<span class="bdg a">⚡ '+fmtH(ot)+'</span>':'<span class="bdg g">✓ No OT</span>')+'</div>';
      }).join('');

  // Alerts
  document.getElementById('d-alr').innerHTML = !als.length
    ? '<p style="color:var(--tx3);font-size:13px;text-align:center;padding:12px">✅ All clear — no alerts</p>'
    : als.slice(0,4).map(function(a){ return '<div class="al '+a.t+'">'+a.msg+'</div>'; }).join('')
      +(als.length>4?'<button class="btn sl sm" onclick="go(\'alr\')" style="margin-top:6px">View All ('+als.length+')</button>':'');

  setTimeout(function(){ drawDashCharts(es); }, 50);
}

// ═══════════════════════════════════════

// CALENDAR
// ═══════════════════════════════════════
function calMov(d) { D.calM+=d; if(D.calM>11){D.calM=0;D.calY++;} if(D.calM<0){D.calM=11;D.calY--;} drawCal(); }

function drawCal() {
  document.getElementById('cal-title').textContent = MONTHS[D.calM]+' '+D.calY;
  var pid = document.getElementById('cal-proj').value;
  var projs = pid ? D.projects.filter(function(p){ return p.id===pid; }) : D.projects;
  var ecm={}, ci=0; D.projects.forEach(function(p){ p.employees.forEach(function(em){ if(!ecm[em]) ecm[em]=C[ci++%8]; }); });
  var sbd={};
  projs.forEach(function(p){ p.entries.forEach(function(e){ if(!sbd[e.date]) sbd[e.date]=[]; sbd[e.date].push({emp:e.empName,color:ecm[e.empName]||'#64748b'}); }); });
  var first=new Date(D.calY,D.calM,1), fd=first.getDay(), off=fd===6?0:fd+1;
  var dim=new Date(D.calY,D.calM+1,0).getDate(), td=new Date();
  var h='';
  for(var i=0;i<off;i++) h+='<div class="cal-d emp"></div>';
  for(var d=1;d<=dim;d++) {
    var ds=D.calY+'-'+String(D.calM+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var it=td.getDate()===d&&td.getMonth()===D.calM&&td.getFullYear()===D.calY;
    var sh=sbd[ds]||[];
    h+='<div class="cal-d'+(it?' now':'')+'"><div class="cal-dn" style="'+(it?'color:var(--g);font-weight:700':'')+'">'+ d+'</div>'
      +sh.slice(0,3).map(function(s){ return '<div class="cal-sh" style="background:'+s.color+'22;color:'+s.color+';border:1px solid '+s.color+'33">'+s.emp.split(' ')[0]+'</div>'; }).join('')
      +(sh.length>3?'<div style="font-size:8px;color:var(--tx3)">+'+(sh.length-3)+'</div>':'')+'</div>';
  }
  document.getElementById('cal-grid').innerHTML = h;
  document.getElementById('cal-leg').innerHTML = Object.keys(ecm)
    .filter(function(em){ return projs.some(function(p){ return p.entries.some(function(e){ return e.empName===em; }); }); })
    .map(function(em){ return '<div style="display:flex;align-items:center;gap:5px;font-size:11px"><span style="width:9px;height:9px;border-radius:50%;background:'+ecm[em]+';display:inline-block"></span>'+em+'</div>'; }).join('');
}

// ═══════════════════════════════════════