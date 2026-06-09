// DATA STORE
// ═══════════════════════════════════════
var D = {
  projects: [],
  staff: [],
  nd: false,
  calM: new Date().getMonth(),
  calY: new Date().getFullYear()
};

var C = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#84cc16'];

var PT = {
  '24H':  { lbl:'24H Shift',    sh:24, ws:48, ot:true },
  '12H':  { lbl:'12H Shift',    sh:12, ws:48, ot:true },
  '4x12': { lbl:'4x12 Rotation',sh:12, ws:48, ot:false }
};

var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ═══════════════════════════════════════

// AUTH
// ═══════════════════════════════════════
var USERS = {
  'admin':  { pass:'lazem2026',  role:'admin', name:'Admin' },
  'hani':   { pass:'hani123',    role:'sup',   name:'هاني العنزي',  proj:'رماح' },
  'khalid': { pass:'khalid123',  role:'sup',   name:'خالد الشمري',  proj:'هلال' },
  'ahmed':  { pass:'ahmed123',   role:'sup',   name:'أحمد الغامدي', proj:'اي كا د' }
};
var AUTH = null;

// ═══════════════════════════════════════