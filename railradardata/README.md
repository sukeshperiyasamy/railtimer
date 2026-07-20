# 🚆 RailDetails - Indian Railways Schedule & Live Tracking Web Application

A clean, modern web application for searching Indian Railways train schedules, timetables, and live status using **RailRadar API** and **Supabase PostgreSQL**.

---

## 🌟 Key Features

* **Instant Schedule Search**: Lookup any Indian Railways train number or name to view complete route timetables.
* **RailRadar REST API Integration**: Real-time integration supporting train details, live running status, station boards, and route geometry.
* **Supabase PostgreSQL Cache**: Demand-driven JSONB database storage to cache train schedules, log sync jobs, and track search popularity.
* **Automated Daily Sync**: Built-in script (`daily_sync.js`) to refresh popular train schedules daily automatically.
* **Offline Fallback**: Pre-built fallback schedule dataset (`trains_data.json`) for seamless demo operation offline.

---

## 📁 Project Structure

```
traindetails/
├── index.html            # Main web UI interface
├── styles.css            # Glassmorphism dark mode styles
├── app.js                # Frontend API client & timetable renderer
├── server.js             # Node.js / Express proxy server
├── live_api_service.js   # RailRadar API client module
├── supabase_db.js        # Supabase PostgreSQL database manager
├── daily_sync.js         # Automated demand-driven daily sync script
├── schema.sql            # Supabase PostgreSQL DDL migration
├── trains_data.json      # Embedded sample timetables
├── package.json          # Node.js project dependencies & scripts
├── .env.example          # Environment variables template
└── README.md             # Project documentation
```

---

## 🚀 Quick Start & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your keys:
```env
RAILRADAR_API_KEY=rr_live_your_actual_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
PORT=3000
```

### 3. Set Up Supabase Database (Optional but Recommended)
Paste [schema.sql](file:///c:/Users/sukes/Downloads/traindetails/schema.sql) into your Supabase SQL Editor and click **Run**.

### 4. Run Development Server
```bash
npm start
```
Open **`http://localhost:3000`** in your browser!

---

## ⏰ Running Daily Train Sync

To refresh top user-searched trains daily:
```bash
npm run sync
```
You can also automate this via **Windows Task Scheduler** or **GitHub Actions**.

---

## 📄 License
MIT License.
