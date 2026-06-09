# Lazem — Overtime Management System

نظام إدارة الأوفر تايم للموظفين

---

## 📁 Project Structure

```
lazem/
├── index.html          # Main HTML entry point
├── css/
│   └── style.css       # All styles & design tokens
├── js/
│   ├── config.js       # Data store, constants, USERS
│   ├── utils.js        # Helper functions (uid, fmtH, calcOT...)
│   ├── auth.js         # Login/logout + navigation
│   ├── projects.js     # Projects CRUD + employee management
│   ├── attendance.js   # Attendance recording
│   ├── dashboard.js    # Dashboard + Calendar
│   ├── employees.js    # Employees view + profiles
│   ├── reports.js      # Reports + alerts
│   ├── data.js         # Staff accounts + export/import
│   ├── charts.js       # SVG charts (bar, line, donut)
│   ├── import.js       # Schedule & attendance import (Excel)
│   └── app.js          # App initialization
└── assets/
    └── logo.jpg        # Lazem logo
```

---

## 🚀 Quick Start

### Option 1: VS Code Live Server (Recommended)
1. Install **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**

### Option 2: Local HTTP Server
```bash
# Python
python3 -m http.server 3000

# Node.js
npx serve .
```

Then open: `http://localhost:3000`

> ⚠️ **Do NOT open index.html directly** (file://) — JS modules won't load correctly.

---

## 🔐 Default Login

| Username | Password   | Role          |
|----------|------------|---------------|
| admin    | lazem2026  | Administrator |
| hani     | hani123    | Supervisor    |
| khalid   | khalid123  | Supervisor    |
| ahmed    | ahmed123   | Supervisor    |

---

## ✨ Features

- 📊 **Dashboard** — Live stats, charts, top OT employees
- 🏗️ **Projects** — Add/Edit/Delete with shift types (24H, 12H, 4x12)
- 📝 **Attendance** — Manual entry with overtime calculation
- 📅 **Schedule** — Monthly calendar view
- 👥 **Employees** — Profiles with OT stats
- 📈 **Reports** — Weekly/monthly reports, comparison charts
- ⚠️ **Alerts** — Smart auto alerts for overtime
- 📥 **Import Schedule** — Excel upload (.xlsx)
- ⏱️ **Attendance Import** — Fingerprint data from Excel/CSV
- 👤 **Staff Accounts** — Login management per project

---

## 💾 Data Storage

All data is saved in **localStorage** in the browser.

Use **Export** (💾) to save a JSON backup.  
Use **Import** (📂) to restore from backup.

---

## 🛠️ Tech Stack

- Vanilla HTML/CSS/JavaScript (no frameworks)
- localStorage for persistence
- XLSX.js for Excel import
- Pure SVG charts (no Chart.js dependency)

---

© 2026 Lazem Medical Services
