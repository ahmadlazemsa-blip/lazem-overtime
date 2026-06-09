// UTILS
// ═══════════════════════════════════════
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,5); }

function fmtH(h) {
  var r = Math.floor(h), m = Math.round((h-r)*60);
  return m ? r+'H '+m+'m' : r+'H';
}

function save() { try { localStorage.setItem('lz_ot', JSON.stringify(D.projects)); } catch(e){} }
function load() { try { var x = localStorage.getItem('lz_ot'); if(x) D.projects = JSON.parse(x); } catch(e){} }

function saveStaff() { try { localStorage.setItem('lz_staff', JSON.stringify(D.staff)); } catch(e){} }
function loadStaff() { try { var x = localStorage.getItem('lz_staff'); if(x) D.staff = JSON.parse(x); } catch(e){} }

function tDiff(a, b, nd) {
  var ah = +a.split(':')[0], am = +a.split(':')[1]||0;
  var bh = +b.split(':')[0], bm = +b.split(':')[1]||0;
  var d = bh*60+bm - (ah*60+am);
  if(nd) d += 1440; else if(d < 0) d += 1440;
  return parseFloat((d/60).toFixed(2));
}

function getWeekKey(dateStr) {
  var d = new Date(dateStr), day = d.getDay();
  var diff = day === 6 ? 0 : day+1;
  var sat = new Date(d); sat.setDate(d.getDate()-diff);
  return sat.toISOString().slice(0,10);
}

function byWeek(entries) {
  if(!entries.length) return [];
  var s = entries.slice().sort(function(a,b){ return new Date(a.date)-new Date(b.date); });
  var map = {}, keys = [];
  for(var i=0; i<s.length; i++) {
    var k = getWeekKey(s[i].date);
    if(!map[k]) { map[k]=[]; keys.push(k); }
    map[k].push(s[i]);
  }
  return keys.map(function(k){ return map[k]; });
}

function getWeekLabel(satKey) {
  var s = new Date(satKey), e = new Date(s); e.setDate(s.getDate()+6);
  return s.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' — '+e.toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

function calcOT(type, entries) {
  if(type === '4x12') return { tw: entries.reduce(function(s,e){ return s+e.h; },0), to:0, weeks:[] };
  var tw = entries.reduce(function(s,e){ return s+e.h; },0);
  var mMap = {};
  entries.forEach(function(e) {
    var m = new Date(e.date).getFullYear()+'-'+new Date(e.date).getMonth();
    if(!mMap[m]) mMap[m]=[];
    mMap[m].push(e);
  });
  var totalOT = 0, allWeeks = [];
  Object.keys(mMap).forEach(function(mk) {
    var mEnts = mMap[mk];
    var mH = mEnts.reduce(function(s,e){ return s+e.h; },0);
    totalOT += Math.max(0, mH-192);
    byWeek(mEnts).forEach(function(w) {
      var wd = w.reduce(function(s,e){ return s+e.h; },0);
      allWeeks.push({ entries:w.map(function(e){ return Object.assign({},e,{oh:0}); }), worked:wd, ot:0 });
    });
  });
  if(totalOT > 0 && allWeeks.length) allWeeks[allWeeks.length-1].ot = totalOT;
  return { tw:tw, to:totalOT, weeks:allWeeks };
}

function thisWeek(type, entries) {
  var now = new Date(), d = now.getDay();
  var s = new Date(now); s.setDate(now.getDate()-(d===6?0:d+1)); s.setHours(0,0,0,0);
  var e = new Date(s); e.setDate(s.getDate()+7);
  var tw = entries.filter(function(x){ var dd=new Date(x.date); return dd>=s&&dd<e; });
  var wd = tw.reduce(function(s,x){ return s+x.h; },0);
  return { worked:wd, shifts:tw.length, ot:Math.max(0,wd-48) };
}

function getAlerts() {
  var al = [];
  D.projects.forEach(function(p) {
    if(!PT[p.type].ot) return;
    var be = {}; p.entries.forEach(function(e){ if(!be[e.empName]) be[e.empName]=[]; be[e.empName].push(e); });
    Object.keys(be).forEach(function(emp) {
      var ws = thisWeek(p.type, be[emp]);
      if(ws.ot > 0) al.push({t:'am', msg:'⚡ '+emp+' — '+p.name+': Overtime '+fmtH(ws.ot)+' this week'});
      else if(ws.worked >= 40) al.push({t:'gr', msg:'📊 '+emp+' — '+p.name+': '+fmtH(ws.worked)+' this week'});
    });
    p.employees.forEach(function(emp){ if(!be[emp]) al.push({t:'re', msg:'❌ '+emp+' — '+p.name+': No shifts this week'}); });
  });
  return al;
}

// ═══════════════════════════════════════