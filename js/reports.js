// REPORTS
// ═══════════════════════════════════════
function repTab(t) {
  document.getElementById('rep-tab-detail').style.display  = t==='detail'?'block':'none';
  document.getElementById('rep-tab-compare').style.display = t==='compare'?'block':'none';
  document.getElementById('rep-tab-source').style.display  = (t==='dispatch'||t==='finger')?'block':'none';
  document.getElementById('rt-detail').className   = t==='detail'?'btn g sm':'btn sl sm';
  document.getElementById('rt-compare').className  = t==='compare'?'btn g sm':'btn sl sm';
  document.getElementById('rt-dispatch').className = t==='dispatch'?'btn g sm':'btn sl sm';
  document.getElementById('rt-finger').className   = t==='finger'?'btn g sm':'btn sl sm';
  if(t==='detail') drawRep();
  if(t==='compare') drawCompare();
  if(t==='dispatch'||t==='finger') { D._repSrc=t; drawSourceRep(t); }
}

function drawRep() {
  var pid=document.getElementById('r-proj').value, mv=document.getElementById('r-mon').value;
  var projs=pid?D.projects.filter(function(p){ return p.id===pid; }):D.projects;
  var allRows=[];
  projs.forEach(function(p){
    var be={};
    p.entries.forEach(function(e){ if(!be[e.empName]) be[e.empName]=[]; be[e.empName].push(e); });
    (p.employees.length?p.employees:Object.keys(be)).forEach(function(emp){
      var ents=be[emp]||[], res=calcOT(p.type,ents);
      allRows.push({emp:emp,proj:p.name,type:p.type,tw:res.tw,to:res.to});
    });
  });
  var totOT=allRows.reduce(function(s,r){ return s+r.to; },0);
  var totW=allRows.reduce(function(s,r){ return s+r.tw; },0);
  document.getElementById('r-stats').innerHTML =
    '<div class="stat"><div class="stat-lbl">Employees</div><div class="stat-val">'+allRows.length+'</div></div>'
    +'<div class="stat a"><div class="stat-lbl">Total OT</div><div class="stat-val" style="color:var(--a)">'+fmtH(totOT)+'</div></div>'
    +'<div class="stat b"><div class="stat-lbl">Total Work</div><div class="stat-val" style="color:var(--b)">'+fmtH(totW)+'</div></div>';
  var html='';
  // Weekly section
  html+='<tr style="background:var(--bg3)"><td colspan="6" style="font-weight:700;font-size:13px;color:var(--g);padding:10px 12px">📅 Weekly Summary</td></tr>';
  projs.forEach(function(p){
    var wkMap={};
    p.entries.forEach(function(e){
      if(mv!==''&&new Date(e.date).getMonth()!==parseInt(mv)) return;
      var k=getWeekKey(e.date);
      if(!wkMap[k]) wkMap[k]={worked:0};
      wkMap[k].worked+=e.h;
    });
    var wkKeys=Object.keys(wkMap).sort();
    if(!wkKeys.length) return;
    html+='<tr style="background:#0f172a"><td colspan="6" style="padding:8px 12px;font-size:12px;font-weight:700;color:var(--tx2)">🏗️ '+p.name+' <span class="bdg b" style="font-size:10px">'+PT[p.type].lbl+'</span>'+(p.sup?'<span style="font-size:10px;color:var(--tx3);margin-right:8px"> | '+p.sup+'</span>':'')+'</td></tr>';
    var pTW=0,pOT=0;
    wkKeys.forEach(function(k){
      var w=wkMap[k], ot=PT[p.type].ot?Math.max(0,w.worked-48):0;
      pTW+=w.worked; pOT+=ot;
      html+='<tr class="'+(ot>0?'otr':'')+'"><td style="padding:8px 12px;font-size:12px;color:var(--tx3)">'+getWeekLabel(k)+'</td>'
        +'<td colspan="2" style="font-size:12px;color:var(--tx2)">'+p.name+'</td>'
        +'<td style="font-family:monospace">'+fmtH(w.worked-ot)+'</td>'
        +'<td style="font-family:monospace;font-weight:700;color:'+(ot>0?'var(--a)':PT[p.type].ot?'var(--g)':'var(--b)')+'">'+(!PT[p.type].ot?'—':ot>0?'⚡ '+fmtH(ot):'✓ 0h')+'</td>'
        +'<td style="font-family:monospace">'+fmtH(w.worked)+'</td></tr>';
    });
    html+='<tr style="background:#1e293b;border-top:2px solid var(--br)"><td colspan="3" style="padding:8px 12px;font-weight:700">Project Total</td>'
      +'<td style="font-family:monospace;font-weight:700">'+fmtH(pTW-pOT)+'</td>'
      +'<td style="font-family:monospace;font-weight:700;color:'+(pOT>0?'var(--a)':'var(--g)')+'">'+(!PT[p.type].ot?'—':pOT>0?'⚡ '+fmtH(pOT):'✓ 0h')+'</td>'
      +'<td style="font-family:monospace;font-weight:700">'+fmtH(pTW)+'</td></tr>';
  });
  // Employee details
  html+='<tr style="background:var(--bg3)"><td colspan="6" style="font-weight:700;font-size:13px;color:var(--tx2);padding:10px 12px;border-top:3px solid var(--br)">👥 Employee Details</td></tr>';
  var rows=[];
  projs.forEach(function(p){
    var be={};
    p.entries.forEach(function(e){ if(mv!==''&&new Date(e.date).getMonth()!==parseInt(mv)) return; if(!be[e.empName]) be[e.empName]=[]; be[e.empName].push(e); });
    (p.employees.length?p.employees:Object.keys(be)).forEach(function(emp){
      var ents=be[emp]||[], res=calcOT(p.type,ents);
      rows.push({emp:emp,proj:p.name,type:p.type,tw:res.tw,to:res.to});
    });
  });
  rows.forEach(function(r){
    html+='<tr class="'+(r.to>0?'otr':'')+'"><td><div style="display:flex;align-items:center;gap:6px"><div class="av">'+r.emp[0]+'</div><div>'+r.emp+'</div></div></td>'
      +'<td style="color:var(--tx2)">'+r.proj+'</td>'
      +'<td><span class="bdg sl">'+PT[r.type].lbl+'</span></td>'
      +'<td style="font-family:monospace">'+fmtH(r.tw-r.to)+'</td>'
      +'<td style="font-family:monospace;font-weight:700;color:'+(r.to>0?'var(--a)':r.type==='4x12'?'var(--b)':'var(--g)')+'">'+( r.type==='4x12'?'—':r.to>0?'⚡ '+fmtH(r.to):'✓ 0h')+'</td>'
      +'<td style="font-family:monospace;font-weight:600">'+fmtH(r.tw)+'</td></tr>';
  });
  document.getElementById('r-body').innerHTML = html;
}

function drawRep() {
  var pid=document.getElementById('r-proj').value, mv=document.getElementById('r-mon').value;
  var projs=pid?D.projects.filter(function(p){ return p.id===pid; }):D.projects;
  var allRows=[];
  projs.forEach(function(p){
    var be={};
    p.entries.forEach(function(e){ if(!be[e.empName]) be[e.empName]=[]; be[e.empName].push(e); });
    (p.employees.length?p.employees:Object.keys(be)).forEach(function(emp){
      var ents=be[emp]||[], res=calcOT(p.type,ents);
      allRows.push({emp:emp,proj:p.name,type:p.type,tw:res.tw,to:res.to,weeks:res.weeks||[]});
    });
  });
  var totOT=allRows.reduce(function(s,r){ return s+r.to; },0);
  var totW=allRows.reduce(function(s,r){ return s+r.tw; },0);
  document.getElementById('r-stats').innerHTML=
    '<div class="stat"><div class="stat-lbl">Employees</div><div class="stat-val">'+allRows.length+'</div></div>'
    +'<div class="stat a"><div class="stat-lbl">Total Overtime</div><div class="stat-val" style="color:var(--a)">'+fmtH(totOT)+'</div></div>'
    +'<div class="stat b"><div class="stat-lbl">Total Work</div><div class="stat-val" style="color:var(--b)">'+fmtH(totW)+'</div></div>';
  var html='';
  html+='<tr style="background:var(--bg3)"><td colspan="6" style="font-weight:700;font-size:13px;color:var(--g);padding:10px 12px">📅 Weekly</td></tr>';
  projs.forEach(function(p){
    var wkMap={};
    p.entries.forEach(function(e){
      if(mv!==''&&new Date(e.date).getMonth()!==parseInt(mv))return;
      var k=getWeekKey(e.date); if(!wkMap[k]) wkMap[k]={worked:0}; wkMap[k].worked+=e.h;
    });
    var wkKeys=Object.keys(wkMap).sort(); if(!wkKeys.length)return;
    html+='<tr style="background:#0f172a"><td colspan="6" style="padding:8px 12px;font-size:12px;font-weight:700;color:var(--tx2)">🏗️ '+p.name+' <span class="bdg b" style="font-size:10px">'+PT[p.type].lbl+'</span>'+(p.sup?' | <span style="font-size:10px;color:var(--tx3)">'+p.sup+'</span>':'')+'</td></tr>';
    var pTW=0,pOT=0;
    wkKeys.forEach(function(k){
      var w=wkMap[k],ot=PT[p.type].ot?Math.max(0,w.worked-48):0; pTW+=w.worked;pOT+=ot;
      html+='<tr class="'+(ot>0?'otr':'')+'"><td style="padding:8px 12px;font-size:12px;color:var(--tx3)">'+getWeekLabel(k)+'</td><td colspan="2" style="font-size:12px;color:var(--tx2)">'+p.name+'</td><td style="font-family:monospace">'+fmtH(w.worked-ot)+'</td><td style="font-family:monospace;font-weight:700;color:'+(ot>0?'var(--a)':PT[p.type].ot?'var(--g)':'var(--b)')+'">'+(!PT[p.type].ot?'—':ot>0?'⚡ '+fmtH(ot):'✓ 0h')+'</td><td style="font-family:monospace">'+fmtH(w.worked)+'</td></tr>';
    });
    html+='<tr style="background:#1e293b;border-top:2px solid var(--br)"><td colspan="3" style="padding:8px 12px;font-weight:700">Total</td><td style="font-family:monospace;font-weight:700">'+fmtH(pTW-pOT)+'</td><td style="font-family:monospace;font-weight:700;color:'+(pOT>0?'var(--a)':'var(--g)')+'">'+(!PT[p.type].ot?'—':pOT>0?'⚡ '+fmtH(pOT):'✓ 0h')+'</td><td style="font-family:monospace;font-weight:700">'+fmtH(pTW)+'</td></tr>';
  });
  html+='<tr style="background:var(--bg3)"><td colspan="6" style="font-weight:700;font-size:13px;color:var(--tx2);padding:10px 12px;border-top:3px solid var(--br)">👥 Employee Details</td></tr>';
  allRows.forEach(function(r){
    html+='<tr class="'+(r.to>0?'otr':'')+'"><td><div style="display:flex;align-items:center;gap:6px"><div class="av">'+r.emp[0]+'</div><div>'+r.emp+'</div></div></td><td style="color:var(--tx2)">'+r.proj+'</td><td><span class="bdg sl">'+PT[r.type].lbl+'</span></td><td style="font-family:monospace">'+fmtH(r.tw-r.to)+'</td><td style="font-family:monospace;font-weight:700;color:'+(r.to>0?'var(--a)':r.type==='4x12'?'var(--b)':'var(--g)')+'">'+( r.type==='4x12'?'—':r.to>0?'⚡ '+fmtH(r.to):'✓ 0h')+'</td><td style="font-family:monospace;font-weight:600">'+fmtH(r.tw)+'</td></tr>';
  });
  document.getElementById('r-body').innerHTML=html;
}

function drawCompare(){
  var pid=document.getElementById('cmp-proj').value;
  var projs=pid?D.projects.filter(function(p){return p.id===pid;}):D.projects;
  var mData={};
  projs.forEach(function(p){
    p.entries.forEach(function(e){
      var m=new Date(e.date).getMonth();
      if(!mData[m])mData[m]={tw:0,to:0};
      mData[m].tw+=e.h;
    });
  });
  var mKeys=Object.keys(mData).sort(function(a,b){return a-b;});
  if(!mKeys.length){
    document.getElementById('cmp-body').innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--tx3);padding:20px">No data</td></tr>';
    return;
  }
  mKeys.forEach(function(m){
    var mEnts=[];
    projs.forEach(function(p){mEnts=mEnts.concat(p.entries.filter(function(e){return new Date(e.date).getMonth()===parseInt(m);}));});
    var totH=mEnts.reduce(function(s,e){return s+e.h;},0);
    mData[m].to=Math.max(0,totH-192);
  });
  var totTW=mKeys.reduce(function(s,m){return s+mData[m].tw;},0);
  var totTO=mKeys.reduce(function(s,m){return s+mData[m].to;},0);
  document.getElementById('cmp-stats').innerHTML=
    '<div class="stat"><div class="stat-lbl">Months</div><div class="stat-val">'+mKeys.length+'</div></div>'
    +'<div class="stat b"><div class="stat-lbl">Total Work</div><div class="stat-val" style="color:var(--b)">'+fmtH(totTW)+'</div></div>'
    +'<div class="stat a"><div class="stat-lbl">Total OT</div><div class="stat-val" style="color:var(--a)">'+fmtH(totTO)+'</div></div>';
  var labels=mKeys.map(function(m){return MONTHS[m].slice(0,3);});
  var ds=[{label:'Work',data:mKeys.map(function(m){return mData[m].tw-mData[m].to;}),color:'#10b981'},{label:'OT',data:mKeys.map(function(m){return mData[m].to;}),color:'#f59e0b'}];
  svgLine(document.getElementById('cmp-chart'),ds,labels);
  var prev=null;
  document.getElementById('cmp-body').innerHTML=mKeys.map(function(m){
    var d=mData[m],eff=d.tw>0?Math.round((d.tw-d.to)/d.tw*100):100;
    var chg=prev!=null?((d.tw-prev)/Math.max(prev,1)*100).toFixed(1):'—';
    var html='<tr class="'+(d.to>0?'otr':'')+'"><td>'+MONTHS[m]+'</td><td style="font-family:monospace">'+fmtH(d.tw-d.to)+'</td>'
      +'<td style="font-family:monospace;color:'+(d.to>0?'var(--a)':'var(--g)')+'">'+( d.to>0?'⚡ '+fmtH(d.to):'0h')+'</td>'
      +'<td style="font-family:monospace;font-weight:700">'+fmtH(d.tw)+'</td>'
      +'<td style="font-size:12px;color:'+(chg!=='—'?parseFloat(chg)>0?'var(--r)':'var(--g)':'var(--tx3)')+'">'+( chg!=='—'?(parseFloat(chg)>0?'↑':' ↓')+Math.abs(chg)+'%':'—')+'</td>'
      +'<td><div style="display:flex;align-items:center;gap:6px"><div class="pb" style="flex:1;margin:0"><div class="pf" style="width:'+eff+'%;background:var(--g)"></div></div><span style="font-size:11px">'+eff+'%</span></div></td></tr>';
    prev=d.tw; return html;
  }).join('');
}

function drawSourceRep(mode){
  if(!mode) mode=D._repSrc||'dispatch';
  var pid=document.getElementById('src-proj').value, mv=document.getElementById('src-mon').value;
  var projs=pid?D.projects.filter(function(p){return p.id===pid;}):D.projects;
  var srcType=mode==='dispatch'?'dispatch':'finger';
  var el=document.getElementById('src-content');
  var rows=[];
  projs.forEach(function(p){
    var be={};
    p.entries.filter(function(e){return e.src===srcType&&(mv===''||new Date(e.date).getMonth()===parseInt(mv));})
      .forEach(function(e){if(!be[e.empName])be[e.empName]=[];be[e.empName].push(e);});
    Object.keys(be).forEach(function(emp){
      var ents=be[emp],res=calcOT(p.type,ents);
      rows.push({emp:emp,proj:p.name,type:p.type,tw:res.tw,to:res.to,count:ents.length});
    });
  });
  if(!rows.length){el.innerHTML='<div class="card" style="text-align:center;color:var(--tx3);padding:24px">No '+mode+' data</div>';return;}
  el.innerHTML='<div class="card"><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Employee</th><th>Project</th><th>Shifts</th><th>Work Hours</th><th>Overtime</th><th>Total</th></tr></thead><tbody>'
    +rows.map(function(r){
      return '<tr class="'+(r.to>0?'otr':'')+'"><td><div style="display:flex;align-items:center;gap:6px"><div class="av">'+r.emp[0]+'</div>'+r.emp+'</div></td><td>'+r.proj+'</td><td style="text-align:center;font-family:monospace">'+r.count+'</td><td style="font-family:monospace">'+fmtH(r.tw-r.to)+'</td><td style="font-family:monospace;font-weight:700;color:'+(r.to>0?'var(--a)':'var(--g)')+'">'+( r.to>0?'⚡ '+fmtH(r.to):'✓ 0h')+'</td><td style="font-family:monospace;font-weight:700">'+fmtH(r.tw)+'</td></tr>';
    }).join('')+'</tbody></table></div></div>';
}

function tagEntries(empName,projName,src){
  var p=D.projects.find(function(x){return x.name===projName||x.id===projName;});
  if(!p)return 0;
  var c=0;p.entries.forEach(function(e){if(e.empName===empName&&!e.src){e.src=src;c++;}});
  return c;
}

// ═══════════════════════════════════════

// ALERTS
// ═══════════════════════════════════════
function drawAlr() {
  var als = getAlerts();
  document.getElementById('alr-list').innerHTML = !als.length
    ? '<div class="card" style="text-align:center;padding:32px;color:var(--tx3)">✅ No alerts — everything is on track!</div>'
    : als.map(function(a){ return '<div class="al '+a.t+'">'+a.msg+'</div>'; }).join('');
}

// ═══════════════════════════════════════