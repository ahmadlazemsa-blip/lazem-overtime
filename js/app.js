// ═══════════════════════════════════════
// APP INIT
// ═══════════════════════════════════════

// INIT
// ═══════════════════════════════════════
(function(){
  // Set logo images
  var logo64 = '';
  try {
    var orig = new XMLHttpRequest();
    orig.open('GET','/mnt/user-data/uploads/overtime-app_33.html',false);
    orig.send();
  } catch(e) {}
  
  load(); loadStaff(); syncSels(); drawDash(); drawCal(); updBadge();
  document.getElementById("sb").style.display="none";
  document.getElementById("main").style.display="none";
  
  // Modal close on backdrop click
  document.querySelectorAll('.modal').forEach(function(m){
    m.addEventListener('click',function(e){ if(e.target===m) m.classList.remove('on'); });
  });

  // Set today as default date
  document.getElementById('a-date').value = new Date().toISOString().slice(0,10);
})();