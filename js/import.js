// IMPORT (Schedule + Attendance)
// ═══════════════════════════════════════
var IMP = {raw:null, parsed:null, buStatus:{}, month:null, year:null};

function drawImp(){
  var sel=document.getElementById('imp-proj');
  if(sel){
    var v=sel.value;
    sel.innerHTML="<option value=''>— Select project —</option>"+D.projects.map(function(p){return "<option value='"+p.id+"'>"+p.name+"</option>";}).join('');
    sel.value=v;
  }
}

function impLoad(inp){
  var file=inp.files[0]; if(!file) return;
  document.getElementById('imp-fname').textContent=file.name;
  document.getElementById('imp-fmeta').textContent=(file.size/1024).toFixed(1)+' KB';
  document.getElementById('imp-info').style.display='flex';
  document.getElementById('imp-preview').style.display='none';
  IMP.raw=null; IMP.parsed=null; IMP.buStatus={};
  document.getElementById('imp-drop').style.borderColor='var(--g)';
  document.getElementById('imp-drop').style.background='#065f4610';

  var reader=new FileReader();
  reader.onload=function(e){
    try{
      if(typeof XLSX==='undefined'){alert('مكتبة Excel لم تحمّل بعد، انتظر ثانية وحاول مرة أخرى.');return;}
      var wb=XLSX.read(e.target.result,{type:'binary'});
      var ws=wb.Sheets[wb.SheetNames[0]];
      IMP.raw=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
      document.getElementById('imp-btn').disabled=false;
    }catch(err){alert('خطأ في قراءة الملف: '+err.message);}
  };
  reader.readAsBinaryString(file);
}

function impProcess(){
  if(!IMP.raw){alert('يرجى رفع ملف أولاً');return;}
  var rows=IMP.raw;
  var impTypeVal=document.getElementById('imp-type').value;
  var shiftH=impTypeVal==='24H_8'?24:12;

  // Find header row - search for row containing day number 1
  var headerRow=-1, nameCol=-1, dayStartCol=-1;

  for(var r=0;r<Math.min(rows.length,20);r++){
    var row=rows[r];
    // Look for day 1 in this row
    for(var c2=0;c2<row.length;c2++){
      if(row[c2]===1||row[c2]==='1'){
        headerRow=r;
        dayStartCol=c2;
        break;
      }
    }
    if(headerRow>=0) break;
  }
  if(headerRow===-1){alert('Could not find schedule header row');return;}

  // Find name column - look in header row and nearby rows
  // Check for text column near col C (index 2) - try cols 1,2,3
  // Look for a row that has names (non-numeric text in col 2 or 3)
  nameCol=2; // default col C
  for(var r2=headerRow;r2<Math.min(rows.length,headerRow+5);r2++){
    var row2=rows[r2];
    for(var c3=1;c3<5;c3++){
      var v=String(row2[c3]||'').trim().toUpperCase();
      if(v==='NAME'||v.includes('EMPLOYEE')||v.includes('NAME')){
        nameCol=c3;
        break;
      }
    }
  }

  // Build day map: col index -> day number
  var dayMap={};
  for(var d31=0;d31<31;d31++){
    dayMap[dayStartCol+d31]=d31+1;
  }

  // Find data rows - skip rows without names
  // Extended search: look at more rows for employee data

  // Extract month/year from top rows
  IMP.month=null; IMP.year=null;
  for(var r2=0;r2<headerRow;r2++){
    var rowStr=rows[r2].join(' ').toUpperCase();
    var months=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    var monthsAr=['January','February','March','April','May','June','July','August','Satمبر','October','November','December'];
    months.forEach(function(m,i){if(rowStr.includes(m)){IMP.month=i;}});
    monthsAr.forEach(function(m,i){if(rowStr.includes(m)){IMP.month=i;}});
    var yrMatch=rowStr.match(/20\d\d/);
    if(yrMatch) IMP.year=parseInt(yrMatch[0]);
  }
  if(IMP.month===null) IMP.month=new Date().getMonth();
  if(IMP.year===null) IMP.year=new Date().getFullYear();

  // Parse employee rows
  var employees=[];
  var buFound=false;
  for(var r3=headerRow+1;r3<Math.min(rows.length,50);r3++){
    var row3=rows[r3];
    // Try name columns: nameCol, nameCol-1, nameCol+1
    var name='';
    for(var nc=[nameCol,2,1,3];nc.length;){
      var tryCol=nc.shift();
      var tryName=String(row3[tryCol]||'').trim();
      if(tryName&&tryName.length>1&&tryName!=='None'&&isNaN(tryName)&&!tryName.includes('Team')&&!tryName.includes('Contact')){
        name=tryName;break;
      }
    }
    if(!name) continue;

    var shifts=[];
    var buDays=[];
    Object.keys(dayMap).forEach(function(c5){
      var day=dayMap[c5];
      var val=String(row3[c5]||'').trim().toLowerCase();
      if(val==='24h'||val==='24'){
        shifts.push({day:day,type:'WORK',h:24});
      } else if(val==='12h'||val==='12'||val==='day'){
        shifts.push({day:day,type:'WORK',h:shiftH});
      } else if(val==='ot-d'||val==='otd'||val==='ot-n'||val==='otn'){
        // OT-D and OT-N are overtime shifts (count as regular work for OT calculation)
        shifts.push({day:day,type:'OT_SHIFT',h:shiftH});
      } else if(val==='bu'||val==='b/u'||val==='b\\u'){
        buDays.push(day);
        buFound=true;
      }
      // off and empty = 0 hours
    });

    if(shifts.length>0||buDays.length>0){
      employees.push({name:name,shifts:shifts,buDays:buDays,position:String(row3[0]||'').trim()});
    }
  }

  if(!employees.length){alert('ما قدرت أجد بيانات employeeين — تأكد من شكل الجدول');return;}

  IMP.parsed=employees;

  // Show BU section if needed
  var buSection=document.getElementById('imp-bu-section');
  if(buFound){
    buSection.style.display='block';
    var buList=document.getElementById('imp-bu-list');
    var buHtml='';
    employees.forEach(function(emp){
      if(!emp.buDays.length) return;
      emp.buDays.forEach(function(day){
        var key=emp.name+'_'+day;
        IMP.buStatus[key]='pending';
        buHtml+='<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--br)">'
          +'<div>'
          +'<div style="font-size:13px;font-weight:600">'+emp.name+'</div>'
          +'<div style="font-size:11px;color:var(--tx3)">day '+day+' — BU (Backup)</div>'
          +'</div>'
          +'<div style="display:flex;gap:8px">'
          +'<button class="btn g sm" id="bu-y-'+key+'" data-key="'+key+'" onclick="setBU(this.getAttribute(\'data-key\'),true)">✓ Showed Up</button>'
          +'<button class="btn sl sm" id="bu-n-'+key+'" data-key="'+key+'" onclick="setBU(this.getAttribute(\'data-key\'),false)">✗ Did Not Show</button>'
          +'</div>'
          +'</div>';
      });
    });
    buList.innerHTML=buHtml;
  } else {
    buSection.style.display='none';
  }

  // Show preview table
  impRenderTable(employees, shiftH);

  // Show summary
  var totalWork=0, totalBU=0;
  employees.forEach(function(e){totalWork+=e.shifts.length; totalBU+=e.buDays.length;});
  document.getElementById('imp-summary').innerHTML=
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">'
    +'<div style="text-align:center"><div style="font-size:10px;color:var(--tx3)">Employeeون</div><div style="font-size:22px;font-weight:700;color:var(--g)">'+employees.length+'</div></div>'
    +'<div style="text-align:center"><div style="font-size:10px;color:var(--tx3)">Total Shifts</div><div style="font-size:22px;font-weight:700;color:var(--b)">'+totalWork+'</div></div>'
    +'<div style="text-align:center"><div style="font-size:10px;color:var(--tx3)">BU Shifts</div><div style="font-size:22px;font-weight:700;color:var(--a)">'+totalBU+'</div></div>'
    +'<div style="text-align:center"><div style="font-size:10px;color:var(--tx3)">Month</div><div style="font-size:22px;font-weight:700;color:var(--tx)">'+['January','February','March','April','May','June','July','August','Satمبر','October','November','December'][IMP.month]+'</div></div>'
    +'</div>';

  document.getElementById('imp-preview').style.display='block';
}

function setBU(key,yes){
  IMP.buStatus[key]=yes?'yes':'no';
  var yBtn=document.getElementById('bu-y-'+key);
  var nBtn=document.getElementById('bu-n-'+key);
  if(yBtn){yBtn.style.background=yes?'var(--g)':'';yBtn.style.opacity=yes?'1':'0.4';}
  if(nBtn){nBtn.style.background=!yes?'#dc2626':'';nBtn.style.color=!yes?'#fff':'';nBtn.style.opacity=!yes?'1':'0.4';}
  // Re-render table
  var impTypeVal=document.getElementById('imp-type').value;
  var shiftH=impTypeVal==='24H_8'?24:12;
  impRenderTable(IMP.parsed,shiftH);
}

function updImpTypeDesc(){
  var t=document.getElementById('imp-type').value;
  var desc=document.getElementById('imp-type-desc');
  var msgs={
    '24H_8':'8 shifts × 24 hour = 192 hour/month — أي hour فوق 192 = Overtime',
    '12H_ROTA':'4 shifts × 12 hour = 48 hour ثم 4 days إجازة — No Overtime',
    '12H_6D':'6 days × 12 hour = 72 hour/week — أي شيء فوق 48 hour/week = Overtime'
  };
  desc.textContent=msgs[t]||'';
  desc.style.display=msgs[t]?'block':'none';
}

function impRenderTable(employees,shiftH){
  // Calculate OT per employee using week system (Sat-Fri)
  var rows2='';
  employees.forEach(function(emp){
    // Build entries including confirmed BU
    var allEntries=emp.shifts.slice();
    emp.buDays.forEach(function(day){
      var key=emp.name+'_'+day;
      if(IMP.buStatus[key]==='yes'){
        allEntries.push({day:day,type:'BU',h:shiftH});
      }
    });
    // Sort by day
    allEntries.sort(function(a,b){return a.day-b.day;});
    // Convert to date entries using IMP.month/year
    var entries=allEntries.map(function(s){
      var d=new Date(IMP.year,IMP.month,s.day);
      return {date:d.toISOString().slice(0,10),h:s.h,type:s.type};
    });
    // Calculate OT based on project type
    var totalH=entries.reduce(function(s,e){return s+e.h;},0);
    var totalOT=0;
    var impType=document.getElementById('imp-type').value;
    if(impType==='24H_8'){
      // 24H: monthly standard 192h (8 shifts x 24h), anything above = OT
      totalOT=Math.max(0,totalH-192);
    } else {
      // 12H types: weekly standard 48h/week (Sat-Fri), anything above = OT
      var wkMap2={};
      entries.forEach(function(e){var k=getWeekKey(e.date);if(!wkMap2[k])wkMap2[k]=0;wkMap2[k]+=e.h;});
      Object.keys(wkMap2).forEach(function(k){totalOT+=Math.max(0,wkMap2[k]-48);});
    }
    var buCount=emp.buDays.length;
    var buConfirmed=emp.buDays.filter(function(day){return IMP.buStatus[emp.name+'_'+day]==='yes';}).length;
    var buPending=emp.buDays.filter(function(day){return IMP.buStatus[emp.name+'_'+day]==='pending';}).length;

    rows2+='<tr class="'+(totalOT>0?'otr':'')+'">'
      +'<td><div style="font-size:13px;font-weight:600">'+emp.name+'</div>'
      +(emp.position?'<div style="font-size:10px;color:var(--tx3)">'+emp.position+'</div>':'')+'</td>'
      +'<td style="font-family:monospace;text-align:center">'+emp.shifts.length+'</td>'
      +'<td style="text-align:center">'
      +(buCount>0?'<span style="background:#78350f30;color:#fcd34d;border:1px solid #92400e;border-radius:6px;padding:2px 8px;font-size:11px">'+buCount+' BU'+(buConfirmed>0?' ('+buConfirmed+' نزل)':'')+(buPending>0?' ('+buPending+' معلق)':'')+'</span>':'—')
      +'</td>'
      +'<td style="font-family:monospace;text-align:center">'+fmtH(totalH)+'</td>'
      +'<td style="font-family:monospace;font-weight:700;text-align:center;color:'+(totalOT>0?'var(--a)':'var(--g)')+'">'+( totalOT>0?'⚡ '+fmtH(totalOT):'✓ 0h')+'</td>'
      +'</tr>';
  });

  document.getElementById('imp-table').innerHTML=
    '<table class="tbl"><thead><tr>'
    +'<th>Employee</th><th style="text-align:center">Shifts</th><th style="text-align:center">BU</th><th style="text-align:center">Total Hours</th><th style="text-align:center">Overtime</th>'
    +'</tr></thead><tbody>'+rows2+'</tbody></table>';
}

function impConfirm(){
  if(!IMP.parsed){return;}
  // Check pending BU
  var pending=Object.values(IMP.buStatus).filter(function(v){return v==='pending';}).length;
  if(pending>0){
    if(!confirm('في '+pending+' shift BU لم يتم تأكيدها — ستُحسب كـ "لم ينزل". هل تريد المتابعة؟')) return;
  }
  var pid=document.getElementById('imp-proj').value;
  if(!pid){alert('يرجى اختيار Project أولاً');return;}
  var p=D.projects.find(function(x){return x.id===pid;});
  var impTypeVal=document.getElementById('imp-type').value;
  var shiftH=impTypeVal==='24H_8'?24:12;
  var added=0;
  IMP.parsed.forEach(function(emp){
    // Add employee if not exists
    if(p.employees.indexOf(emp.name)<0) p.employees.push(emp.name);
    // Build entries
    var allEntries=emp.shifts.slice();
    emp.buDays.forEach(function(day){
      var key=emp.name+'_'+day;
      if(IMP.buStatus[key]==='yes') allEntries.push({day:day,type:'BU',h:shiftH});
    });
    allEntries.forEach(function(s){
      var d=new Date(IMP.year,IMP.month,s.day);
      var dateStr=d.toISOString().slice(0,10);
      // Check if entry already exists
      var exists=p.entries.some(function(e){return e.empName===emp.name&&e.date===dateStr;});
      if(!exists){
        p.entries.push({id:uid(),empName:emp.name,date:dateStr,inT:'07:00',outT:'07:00',nd:shiftH===24,h:s.h,note:s.type==='BU'?'BU':'',src:'dispatch'});
        added++;
      }
    });
  });
  save(); syncSels(); updBadge();
  document.getElementById('imp-status').innerHTML='<span style="color:var(--g)">✅ تم استيراد '+added+' shift بنجاح!</span>';
  document.getElementById('imp-confirm-btn').disabled=true;
  setTimeout(function(){go('att');},1500);
}

function impReset(){
  IMP={raw:null,parsed:null,buStatus:{},month:null,year:null};
  document.getElementById('imp-preview').style.display='none';
  document.getElementById('imp-info').style.display='none';
  document.getElementById('imp-drop').style.borderColor='var(--br)';
  document.getElementById('imp-drop').style.background='var(--bg3)';
  document.getElementById('imp-file').value='';
  document.getElementById('imp-status').textContent='';
  document.getElementById('imp-confirm-btn').disabled=false;
}



// ═══════════════════════════════════════
// ATTENDANCE IMPORT
// ═══════════════════════════════════════

var AI={raw:null,parsed:null};

function drawAttImp(){
  var sel=document.getElementById('ai-proj');
  if(sel){
    var v=sel.value;
    sel.innerHTML="<option value=''>— Select project —</option>"+D.projects.map(function(p){return "<option value='"+p.id+"'>"+p.name+"</option>";}).join('');
    sel.value=v;
  }
}

function aiLoad(inp){
  var file=inp.files[0];if(!file)return;
  AI.raw=null;AI.parsed=null;
  document.getElementById('ai-fname').textContent='Reading: '+file.name+'...';
  document.getElementById('ai-preview').style.display='none';
  var reader=new FileReader();
  if(file.name.toLowerCase().slice(-4)==='.csv'){
    reader.onload=function(ev){
      var lines=ev.target.result.split('\n');
      AI.raw=lines.map(function(l){
        var cols=[];var cur='';var inQ=false;
        for(var i=0;i<l.length;i++){
          if(l[i]==='"'){inQ=!inQ;}
          else if(l[i]===','&&!inQ){cols.push(cur.trim());cur='';}
          else{cur+=l[i];}
        }
        cols.push(cur.trim());
        return cols;
      });
      document.getElementById('ai-fname').textContent='Ready: '+file.name+' ('+AI.raw.length+' rows)';
    };
    reader.readAsText(file);
  } else {
    reader.onload=function(ev){
      function tryRead(){
        try{
          var wb=XLSX.read(ev.target.result,{type:'binary',cellDates:true,dateNF:'yyyy-mm-dd'});
          var ws=wb.Sheets[wb.SheetNames[0]];
          AI.raw=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false});
          document.getElementById('ai-fname').textContent='Ready: '+file.name+' ('+AI.raw.length+' rows)';
        }catch(err){
          document.getElementById('ai-fname').textContent='Error: '+err.message;
        }
      }
      if(typeof XLSX!=='undefined'){tryRead();}
      else{
        var s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        s.onload=tryRead;
        s.onerror=function(){document.getElementById('ai-fname').textContent='Could not load Excel reader. Please save as CSV and try again.';};
        document.body.appendChild(s);
      }
    };
    reader.readAsBinaryString(file);
  }
}

function aiParseTime(v){
  if(!v&&v!==0)return null;
  var s=String(v).trim();
  if(!s||s==='')return null;
  var parts=s.split(':');
  if(parts.length>=2){
    var h=parseFloat(parts[0]);
    var m=parseFloat(parts[1])||0;
    var sec=parseFloat(parts[2])||0;
    return h+m/60+sec/3600;
  }
  var n=parseFloat(s);
  if(!isNaN(n)&&n>0&&n<1)return n*24;
  return null;
}

function aiParseDate(v){
  if(!v)return '';
  var s=String(v).trim();
  if(s.match(/^\d{4}-\d{2}-\d{2}/))return s.slice(0,10);
  if(s.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)){
    var p=s.split('/');
    return p[2]+'-'+p[0].padStart(2,'0')+'-'+p[1].padStart(2,'0');
  }
  if(s.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)){
    var p2=s.split('/');
    return '20'+p2[2]+'-'+p2[0].padStart(2,'0')+'-'+p2[1].padStart(2,'0');
  }
  var n=parseFloat(s);
  if(!isNaN(n)&&n>40000){
    var d=new Date(Math.round((n-25569)*86400000));
    return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0');
  }
  return s.slice(0,10);
}

function aiProcess(){
  if(!AI.raw){alert('Please upload a file first');return;}
  var sep=document.getElementById('ai-sep').value||'-';
  var empMap={};

  for(var r=0;r<AI.raw.length;r++){
    var row=AI.raw[r];
    var namesCell=String(row[0]||'').trim();
    if(!namesCell||namesCell==='MEDICAL TEAM'||namesCell==='Employee'||namesCell==='Name')continue;

    var dateStr=aiParseDate(row[1]);
    if(!dateStr||dateStr.length<8)continue;

    var inH=aiParseTime(row[2]);
    var outH=aiParseTime(row[3]);
    if(inH===null||outH===null)continue;

    var hrs=outH-inH;
    if(hrs<0)hrs+=24;
    if(hrs<=0||hrs>24)continue;
    hrs=parseFloat(hrs.toFixed(2));

    var names=namesCell.split(sep).map(function(n){
      return n.replace(/\s*\([^)]*\)/g,'').replace(/\s+/g,' ').trim();
    }).filter(function(n){return n.length>1;});
    names=names.map(function(name){
      var lower=name.toLowerCase();
      var existing=Object.keys(empMap).find(function(k){return k.toLowerCase()===lower;});
      return existing||name;
    });
    names.forEach(function(name){
      if(!empMap[name])empMap[name]=[];
      var exists=empMap[name].some(function(x){return x.date===dateStr;});
      if(!exists)empMap[name].push({
        date:dateStr,
        h:hrs,
        inT:String(row[2]||'').slice(0,5),
        outT:String(row[3]||'').slice(0,5)
      });
    });
  }

  if(!Object.keys(empMap).length){
    alert('No employee data found.\nExpected columns: A=Names, B=Date, C=Check-in, D=Check-out');
    return;
  }

  var results=[];
  Object.keys(empMap).forEach(function(name){
    var entries=empMap[name].sort(function(a,b){return new Date(a.date)-new Date(b.date);});
    var totalH=parseFloat(entries.reduce(function(s,e){return s+e.h;},0).toFixed(2));

    // Weekly OT (Sat-Fri, 48h)
    var wkMap={};
    entries.forEach(function(e){
      var k=getWeekKey(e.date);
      if(!wkMap[k])wkMap[k]=0;
      wkMap[k]+=e.h;
    });
    var weeklyOT=0;
    Object.keys(wkMap).forEach(function(k){weeklyOT+=Math.max(0,wkMap[k]-48);});
    weeklyOT=parseFloat(weeklyOT.toFixed(2));

    // Monthly OT (192h)
    var monthlyOT=parseFloat(Math.max(0,totalH-192).toFixed(2));

    // Use the higher of the two
    var ot=Math.max(weeklyOT,monthlyOT);

    results.push({name:name,entries:entries,totalH:totalH,ot:ot,weeklyOT:weeklyOT,monthlyOT:monthlyOT,wkMap:wkMap,shifts:entries.length});
  });

  AI.parsed=results;

  // Summary
  var totH=results.reduce(function(s,r){return s+r.totalH;},0);
  var totOT=results.reduce(function(s,r){return s+r.ot;},0);
  document.getElementById('ai-summary').innerHTML=
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">'
    +'<div style="text-align:center"><div style="font-size:10px;color:var(--tx3)">Employees</div><div style="font-size:22px;font-weight:700;color:var(--g)">'+results.length+'</div></div>'
    +'<div style="text-align:center"><div style="font-size:10px;color:var(--tx3)">Total Shifts</div><div style="font-size:22px;font-weight:700;color:var(--b)">'+results.reduce(function(s,r){return s+r.shifts;},0)+'</div></div>'
    +'<div style="text-align:center"><div style="font-size:10px;color:var(--tx3)">Total Hours</div><div style="font-size:22px;font-weight:700;color:var(--tx)">'+fmtH(totH)+'</div></div>'
    +'<div style="text-align:center"><div style="font-size:10px;color:var(--tx3)">Total Overtime</div><div style="font-size:22px;font-weight:700;color:var(--a)">'+fmtH(totOT)+'</div></div>'
    +'</div>';

  // Employee cards
  var html='';
  results.forEach(function(r){
    var wkKeys=Object.keys(r.wkMap).sort();
    var wkRows=wkKeys.map(function(k){
      var wh=parseFloat(r.wkMap[k].toFixed(2));
      var wot=Math.max(0,wh-48);
      var s=new Date(k);var e2=new Date(s);e2.setDate(s.getDate()+6);
      var lbl=(s.getMonth()+1)+'/'+s.getDate()+' — '+(e2.getMonth()+1)+'/'+e2.getDate();
      return '<div style="display:flex;justify-content:space-between;padding:6px 14px;font-size:12px;border-bottom:1px solid var(--br);background:'+(wot>0?'#78350f12':'')+'">'
        +'<span style="color:var(--tx3)">Week '+lbl+'</span>'
        +'<span>'+fmtH(wh-wot)+' work'+(wot>0?' | <strong style="color:var(--a)">⚡ OT: '+fmtH(wot)+'</strong>':' | <strong style="color:var(--g)">✓ No OT</strong>')+'</span>'
        +'</div>';
    }).join('');

    html+='<div class="card" style="padding:0;overflow:hidden;margin-bottom:10px">'
      +'<div style="padding:12px 14px;background:var(--bg3);display:flex;align-items:center;justify-content:space-between">'
      +'<div style="display:flex;align-items:center;gap:8px"><div class="av">'+r.name[0]+'</div>'
      +'<div><div style="font-size:14px;font-weight:700">'+r.name+'</div>'
      +'<div style="font-size:11px;color:var(--tx3)">'+r.shifts+' shifts</div></div></div>'
      +(r.ot>0?'<span class="bdg a">⚡ OT: '+fmtH(r.ot)+'</span>':'<span class="bdg g">✓ No OT</span>')
      +'</div>'
      +'<div style="display:flex;flex-wrap:wrap;border-bottom:1px solid var(--br)">'
      +'<div style="flex:1;min-width:120px;text-align:center;padding:10px;border-left:1px solid var(--br)"><div style="font-size:10px;color:var(--tx3)">Work Hours</div><div style="font-size:16px;font-weight:700;font-family:monospace">'+fmtH(r.totalH-r.ot)+'</div></div>'
      +'<div style="flex:1;min-width:120px;text-align:center;padding:10px;border-left:1px solid var(--br);background:'+(r.ot>0?'#78350f15':'')+'"><div style="font-size:10px;color:var(--tx3)">Overtime</div><div style="font-size:16px;font-weight:700;font-family:monospace;color:'+(r.ot>0?'var(--a)':'var(--g)')+'">'+fmtH(r.ot)+'</div></div>'
      +'<div style="flex:1;min-width:120px;text-align:center;padding:10px;border-left:1px solid var(--br)"><div style="font-size:10px;color:var(--tx3)">Weekly OT</div><div style="font-size:16px;font-weight:700;font-family:monospace;color:'+(r.weeklyOT>0?'var(--a)':'var(--g)')+'">'+fmtH(r.weeklyOT)+'</div></div>'
      +'<div style="flex:1;min-width:120px;text-align:center;padding:10px;border-left:1px solid var(--br)"><div style="font-size:10px;color:var(--tx3)">Monthly OT</div><div style="font-size:16px;font-weight:700;font-family:monospace;color:'+(r.monthlyOT>0?'var(--a)':'var(--g)')+'">'+fmtH(r.monthlyOT)+'</div></div>'
      +'<div style="flex:1;min-width:120px;text-align:center;padding:10px"><div style="font-size:10px;color:var(--tx3)">Total Hours</div><div style="font-size:16px;font-weight:700;font-family:monospace">'+fmtH(r.totalH)+'</div></div>'
      +'</div>'
      +wkRows+'</div>';
  });
  document.getElementById('ai-results').innerHTML=html;
  document.getElementById('ai-preview').style.display='block';
}

function aiConfirm(){
  if(!AI.parsed)return;
  var pid=document.getElementById('ai-proj').value;
  if(!pid){alert('Please select a project first');return;}
  var p=D.projects.find(function(x){return x.id===pid;});
  var added=0;
  AI.parsed.forEach(function(r){
    if(p.employees.indexOf(r.name)<0)p.employees.push(r.name);
    r.entries.forEach(function(e){
      var exists=p.entries.some(function(x){return x.empName===r.name&&x.date===e.date;});
      if(!exists){p.entries.push({id:uid(),empName:r.name,date:e.date,inT:e.inT,outT:e.outT,nd:false,h:e.h,src:"fingerprint"});added++;}
    });
  });
  save();syncSels();updBadge();
  document.getElementById('ai-status').innerHTML='<span style="color:var(--g)">✅ Imported '+added+' records!</span>';
  document.getElementById('ai-confirm-btn').disabled=true;
  setTimeout(function(){go('att');},1500);
}

function aiReset(){
  AI={raw:null,parsed:null};
  document.getElementById('ai-preview').style.display='none';
  document.getElementById('ai-fname').textContent='';
  document.getElementById('ai-file').value='';
  document.getElementById('ai-status').textContent='';
  document.getElementById('ai-confirm-btn').disabled=false;
}


// ═══════════════════════════════════════
// STAFF ACCOUNTS & CHECK IN/OUT
// ═══════════════════════════════════════
function saveStaff(){try{localStorage.setItem('lz_staff',JSON.stringify(D.staff));}catch(e){}}

// ═══════════════════════════════════════