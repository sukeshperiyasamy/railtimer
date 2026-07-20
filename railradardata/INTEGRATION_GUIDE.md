# RailRadar API Integration & Daily Storage Guide

This guide documents how to integrate the **RailRadar API** into your web application and automatically store/sync all train schedule data daily in your database.

---

## 1. Daily Sync & Storage Strategy

Storing train data locally in your own database (JSON / SQLite / PostgreSQL / MongoDB) allows you to:
1. **Eliminate API Overuse**: Serve requests directly from your own database with **zero latency**.
2. **Build Your Own Dataset**: Accumulate up-to-date schedules for all 5,000+ Indian Railways trains over time.
3. **Stay Within Rate Limits**: The free tier provides 50 requests/day. By running a daily cron job that fetches 30-40 trains per day (or caching searched trains on-demand), your database becomes 100% complete over time without paying anything.

---

## 2. Automated Daily Sync (`daily_sync.js`)

We created [daily_sync.js](file:///c:/Users/sukes/Downloads/traindetails/daily_sync.js) in your workspace.

### How it Works:
1. **Lookup & Index**: Queries `/v1/lookup/trains` to get the list of active trains.
2. **Batch Sync**: Iterates over train numbers and fetches `/v1/trains/{number}` details.
3. **Timestamped Storage**: Saves train records in `stored_trains_db.json` with a `syncedAt` timestamp.

---

## 3. How to Run the Daily Sync Automatically

### Method A: Node.js `node-cron` (Inside Server)
Install `node-cron` to trigger the sync every night at midnight:

```javascript
const cron = require('node-cron');
const { runDailySync } = require('./daily_sync');

// Run daily at 12:00 AM midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled daily train sync...');
  await runDailySync(40); // Sync 40 trains per day
});
```

### Method B: Windows Task Scheduler (Windows OS)
1. Open **Task Scheduler** in Windows.
2. Click **Create Basic Task** ➔ Name: `DailyTrainSync`.
3. Trigger: **Daily** at 12:00 AM.
4. Action: **Start a Program**
   * Program: `node.exe`
   * Arguments: `c:\Users\sukes\Downloads\traindetails\daily_sync.js`
   * Start in: `c:\Users\sukes\Downloads\traindetails`

### Method C: GitHub Actions (Free Cloud Cron)
Create `.github/workflows/daily_sync.yml`:
```yaml
name: Daily Train Data Sync
on:
  schedule:
    - cron: '0 0 * * *' # Midnight UTC
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node daily_sync.js
        env:
          RAILRADAR_API_KEY: ${{ secrets.RAILRADAR_API_KEY }}
      - name: Commit updated database
        run: |
          git config user.name "GitHub Actions Bot"
          git config user.email "bot@github.com"
          git add stored_trains_db.json
          git commit -m "Auto-update daily train database [skip ci]" || exit 0
          git push
```

---

## 4. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/v1/trains/{number}` | Full schedule & stops for any train number |
| `GET` | `/v1/trains/{number}/live` | Real-time position, delay, & per-stop status |
| `GET` | `/v1/trains/between/{from}/{to}` | Trains running between two station codes |
| `GET` | `/v1/stations/{code}/trains` | Station live board |
| `GET` | `/v1/trains/{number}/route` | GeoJSON route geometry |
| `GET` | `/v1/lookup/trains` | Flat number ➔ name map for client search |
