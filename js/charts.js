// CHARTS (SVG)
// ═══════════════════════════════════════
function svgBar(el,data,opts){
  if(!el||!data.length)return;
  var W=el.offsetWidth||el.parentElement&&el.parentElement.offsetWidth||400,H=200;
  if(W<50)W=400;
  var pad={top:10,right:10,bottom:36,left:36};
  var cW=W-pad.left-pad.right,cH=H-pad.top-pad.bottom;
  var maxV=Math.max.apply(null,data.map(function(d){return(d.val||0)+(d.val2||0);}));
  if(!maxV)maxV=1;
  var bW=Math.max(8,Math.floor(cW/data.length*0.6));
  var gap=Math.floor((cW-bW*data.length)/(data.length+1));
  var svg='<svg width="'+W+'" height="'+H+'" style="direction:ltr">';
  [0,0.25,0.5,0.75,1].forEach(function(g){
    var y=pad.top+cH*(1-g);
    svg+='<line x1="'+pad.left+'" y1="'+y+'" x2="'+(W-pad.right)+'" y2="'+y+'" stroke="#1e293b" stroke-width="1"/>';
    svg+='<text x="'+(pad.left-4)+'" y="'+(y+4)+'" text-anchor="end" fill="#64748b" font-size="9">'+Math.round(maxV*g)+'</text>';
  });
  data.forEach(function(d,i){
    var x=pad.left+gap+(bW+gap)*i;
    var h1=Math.max(2,Math.floor(cH*(d.val||0)/maxV));
    var h2=Math.max(0,Math.floor(cH*(d.val2||0)/maxV));
    var y1=pad.top+cH-h1-h2,y2=pad.top+cH-h2;
    if(h1>0)svg+='<rect x="'+x+'" y="'+y1+'" width="'+bW+'" height="'+h1+'" fill="'+(d.color||'#10b981')+'" rx="3"/>';
    if(h2>0)svg+='<rect x="'+x+'" y="'+y2+'" width="'+bW+'" height="'+h2+'" fill="'+(d.color2||'#f59e0b')+'" rx="3"/>';
    var lbl=d.label.length>6?d.label.slice(0,6)+'..':d.label;
    svg+='<text x="'+(x+bW/2)+'" y="'+(H-pad.bottom+14)+'" text-anchor="middle" fill="#64748b" font-size="9">'+lbl+'</text>';
  });
  if(opts&&opts.legend){var lx=pad.left;opts.legend.forEach(function(l){svg+='<rect x="'+lx+'" y="'+(H-8)+'" width="10" height="8" fill="'+l.color+'" rx="2"/>';svg+='<text x="'+(lx+13)+'" y="'+(H-1)+'" fill="#94a3b8" font-size="9">'+l.label+'</text>';lx+=80;});}
  svg+='</svg>';el.innerHTML=svg;
}

function svgLine(el,datasets,labels){
  if(!el||!labels.length)return;
  var W=el.offsetWidth||el.parentElement&&el.parentElement.offsetWidth||400,H=200;
  if(W<50)W=400;
  var pad={top:10,right:10,bottom:36,left:40};
  var cW=W-pad.left-pad.right,cH=H-pad.top-pad.bottom;
  var allVals=[];datasets.forEach(function(ds){ds.data.forEach(function(v){allVals.push(v);});});
  var maxV=Math.max.apply(null,allVals)||1;
  var step=cW/(labels.length-1||1);
  var svg='<svg width="'+W+'" height="'+H+'" style="direction:ltr">';
  [0,0.25,0.5,0.75,1].forEach(function(g){
    var y=pad.top+cH*(1-g);
    svg+='<line x1="'+pad.left+'" y1="'+y+'" x2="'+(W-pad.right)+'" y2="'+y+'" stroke="#1e293b" stroke-width="1"/>';
    svg+='<text x="'+(pad.left-4)+'" y="'+(y+4)+'" text-anchor="end" fill="#64748b" font-size="9">'+Math.round(maxV*g)+'</text>';
  });
  datasets.forEach(function(ds){
    var pts=ds.data.map(function(v,i){return (pad.left+step*i)+','+(pad.top+cH*(1-v/maxV));});
    svg+='<path d="M'+pad.left+','+(pad.top+cH)+' L'+pts.join(' L')+' L'+(pad.left+step*(labels.length-1))+','+(pad.top+cH)+' Z" fill="'+ds.color+'22"/>';
    svg+='<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+ds.color+'" stroke-width="2"/>';
    ds.data.forEach(function(v,i){var x=pad.left+step*i,y=pad.top+cH*(1-v/maxV);svg+='<circle cx="'+x+'" cy="'+y+'" r="3" fill="'+ds.color+'"/>';});
  });
  labels.forEach(function(lbl,i){svg+='<text x="'+(pad.left+step*i)+'" y="'+(H-pad.bottom+14)+'" text-anchor="middle" fill="#64748b" font-size="9">'+lbl+'</text>';});
  var lx=pad.left;datasets.forEach(function(ds){svg+='<line x1="'+lx+'" y1="'+(H-4)+'" x2="'+(lx+14)+'" y2="'+(H-4)+'" stroke="'+ds.color+'" stroke-width="2"/>';svg+='<text x="'+(lx+17)+'" y="'+(H-1)+'" fill="#94a3b8" font-size="9">'+ds.label+'</text>';lx+=90;});
  svg+='</svg>';el.innerHTML=svg;
}

function svgDonut(el,data){
  if(!el||!data.length)return;
  var W=Math.min(el.offsetWidth||200,200),H=200,cx=W/2,cy=85,r=65,ir=40;
  var total=data.reduce(function(s,d){return s+(d.val||0);},0)||1;
  var svg='<svg width="'+W+'" height="'+H+'" style="direction:ltr;display:block;margin:auto">';
  var startAngle=-Math.PI/2;
  data.forEach(function(d){
    var angle=(d.val/total)*Math.PI*2,endAngle=startAngle+angle;
    var x1=cx+r*Math.cos(startAngle),y1=cy+r*Math.sin(startAngle);
    var x2=cx+r*Math.cos(endAngle),y2=cy+r*Math.sin(endAngle);
    var ix1=cx+ir*Math.cos(startAngle),iy1=cy+ir*Math.sin(startAngle);
    var ix2=cx+ir*Math.cos(endAngle),iy2=cy+ir*Math.sin(endAngle);
    var large=angle>Math.PI?1:0;
    if(d.val>0)svg+='<path d="M'+ix1+','+iy1+' L'+x1+','+y1+' A'+r+','+r+' 0 '+large+',1 '+x2+','+y2+' L'+ix2+','+iy2+' A'+ir+','+ir+' 0 '+large+',0 '+ix1+','+iy1+' Z" fill="'+d.color+'"/>';
    startAngle=endAngle;
  });
  svg+='<text x="'+cx+'" y="'+(cy+5)+'" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="700">'+total+'</text>';
  svg+='<text x="'+cx+'" y="'+(cy+18)+'" text-anchor="middle" fill="#64748b" font-size="9">employees</text>';
  var ly=H-30;data.forEach(function(d,i){var lx=10+i*(W/data.length);svg+='<rect x="'+lx+'" y="'+ly+'" width="10" height="10" fill="'+d.color+'" rx="2"/>';svg+='<text x="'+(lx+13)+'" y="'+(ly+9)+'" fill="#94a3b8" font-size="9">'+d.label+'</text>';});
  svg+='</svg>';el.innerHTML=svg;
}

function drawDashCharts(es){
  // 1. OT per employee
  var empData=es.filter(function(e){return e.tw>0;}).slice(0,8).map(function(e){
    return{label:e.emp,val:parseFloat((e.tw-e.to).toFixed(1)),val2:parseFloat(e.to.toFixed(1)),color:'#10b98177',color2:'#f59e0b'};
  });
  svgBar(document.getElementById('ch-emp'),empData,{legend:[{label:'Work',color:'#10b98177'},{label:'OT',color:'#f59e0b'}]});
  // 2. Projects comparison
  var projData=D.projects.map(function(p){
    var be={};p.entries.forEach(function(e){if(!be[e.empName])be[e.empName]=[];be[e.empName].push(e);});
    var tw=Object.keys(be).reduce(function(s,emp){return s+calcOT(p.type,be[emp]).tw;},0);
    var to=Object.keys(be).reduce(function(s,emp){return s+calcOT(p.type,be[emp]).to;},0);
    return{label:p.name,val:parseFloat((tw-to).toFixed(1)),val2:parseFloat(to.toFixed(1)),color:'#3b82f677',color2:'#f59e0b'};
  });
  svgBar(document.getElementById('ch-proj'),projData,{legend:[{label:'Work',color:'#3b82f677'},{label:'OT',color:'#f59e0b'}]});
  // 3. Weekly
  var wkMap={};
  D.projects.forEach(function(p){p.entries.forEach(function(e){var k=getWeekKey(e.date);if(!wkMap[k])wkMap[k]=0;wkMap[k]+=e.h;});});
  var wkKeys=Object.keys(wkMap).sort().slice(-8);
  var wkData=wkKeys.map(function(k){return{label:getWeekLabel(k).split(' ')[0],val:wkMap[k],color:'#3b82f6'};});
  svgBar(document.getElementById('ch-week'),wkData,null);
  // 4. Donut
  var dtCounts={'24H':0,'12H':0,'4x12':0};
  D.projects.forEach(function(p){dtCounts[p.type]=(dtCounts[p.type]||0)+p.employees.length;});
  var donutData=[{label:'24H',val:dtCounts['24H'],color:'#10b981'},{label:'12H',val:dtCounts['12H'],color:'#3b82f6'},{label:'4x12',val:dtCounts['4x12'],color:'#8b5cf6'}].filter(function(d){return d.val>0;});
  svgDonut(document.getElementById('ch-type'),donutData);
}

// ═══════════════════════════════════════