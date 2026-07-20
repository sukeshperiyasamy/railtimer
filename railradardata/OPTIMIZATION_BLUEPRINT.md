# 🚆 Production-Grade RailRadar API Optimization Blueprint v2.0 (10/10 Architecture)

This blueprint outlines a production-ready architecture designed to achieve **>90% API call reduction**, stay within **RailRadar Free Tier limits** (50 requests/day), and scale to millions of user requests using **Supabase PostgreSQL**.

---

## 1. Endpoint Priority & TTL Cache Matrix

| Endpoint | Priority | Refresh Strategy & Cache TTL | Justification |
| :--- | :--- | :--- | :--- |
| `GET /v1/lookup/stations` | ⭐⭐⭐⭐⭐ | **Permanent** (Refresh yearly) | Static master lookup table (`code` ➔ `name`, state, zone). |
| `GET /v1/lookup/trains` | ⭐⭐⭐⭐⭐ | **Permanent** (Refresh monthly) | Flat mapping (`number` ➔ `name`) for instant client-side autocomplete. |
| `GET /v1/trains/{number}` | ⭐⭐⭐⭐⭐ | **Monthly / On-Demand** (30-day TTL) | Complete timetable, stops, halt times, run days, & distances (**Source of Truth**). |
| `GET /v1/trains/{number}/live` | ⭐⭐⭐⭐ | **2-Minute TTL** | Real-time position & delay. Deduplicates simultaneous user checks. |
| `GET /v1/trains/{number}/route` | ⭐⭐⭐ | **30–90 Day TTL** | Route GeoJSON polyline geometry (refreshed periodically for line diversions). |
| `GET /v1/trains/between/{from}/{to}`| ⭐ | **Hybrid SQL + API Fallback** | Use local SQL join on `train_stops` first; invoke API only if DB coverage is incomplete. |
| `GET /v1/stations/{code}/trains` | ⭐ | **Hybrid SQL + API Fallback** | Query local `train_stops` first; fallback to API for newly discovered trains. |

---

## 2. Refined Core Architecture Improvements

### 1️⃣ Route Geometry Refresh (30–90 Day TTL)
* **Correction**: Route geometry is **not** permanent. Indian Railways changes tracks, adds new stations, and executes gauge conversions or temporary line diversions.
* **Refined Rule**: Cache route GeoJSON in the `routes` table with a **30–90 day TTL** (or refresh whenever the train's master schedule is updated).

### 2️⃣ Hybrid "Trains Between Stations" Search Flow
* **Correction**: Local SQL search for "Trains Between Stations" is only 100% accurate if the database already contains schedules for those trains.
* **Refined Rule**:
  ```
  User searches Source ➔ Destination
                 │
  Query local Supabase DB (`train_stops`)
                 │
         ┌───────┴───────┐
         ▼               ▼
    Matches Found?    Coverage Incomplete?
         │               │
     [0 API Calls]   Call API `GET /v1/trains/between`
     Return Matches  Upsert returned schedules into DB
                     Next search uses 0 API Calls!
  ```

### 3️⃣ Demand-Driven Weighted Priority Refresh Algorithm
Instead of refreshing a fixed list of trains, calculate a **Weighted Priority Score** for every train in the database:

$$\text{Priority Score} = (\text{total\_searches} \times 0.5) + (\text{days\_since\_sync} \times 0.3) + (\text{recent\_7day\_searches} \times 0.2)$$

Nightly cron jobs execute `get_sync_priority_scores()` in Supabase to refresh only the highest-scoring trains.

---

## 3. Normalized Production Database Schema

Implemented in [schema.sql](file:///c:/Users/sukes/Downloads/traindetails/schema.sql):

```sql
-- Core Trains Table
CREATE TABLE trains (
    train_number VARCHAR(10) PRIMARY KEY,
    train_name TEXT NOT NULL,
    from_station_code VARCHAR(10) REFERENCES stations(station_code),
    to_station_code VARCHAR(10) REFERENCES stations(station_code),
    run_days TEXT,
    total_distance_km NUMERIC(7,2),
    duration_minutes INTEGER,
    coach_position TEXT,
    last_synced TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timetable Stops Table (Normalized)
CREATE TABLE train_stops (
    id BIGSERIAL PRIMARY KEY,
    train_number VARCHAR(10) REFERENCES trains(train_number) ON DELETE CASCADE,
    station_code VARCHAR(10) REFERENCES stations(station_code),
    stop_sequence INTEGER NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    halt_minutes INTEGER DEFAULT 0,
    distance_from_source_km NUMERIC(7,2),
    day_number INTEGER DEFAULT 1,
    platform_number VARCHAR(10),
    speed_next_kmh NUMERIC(5,2),
    UNIQUE(train_number, stop_sequence)
);

-- Short-TTL Live Status Deduplication Cache
CREATE TABLE live_cache (
    train_number VARCHAR(10) PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);
```

---

## 4. Resource & API Call Estimation

* **Database Storage**: ~104,000 rows across `trains` and `train_stops` = **~35 MB** (Well within Supabase's **500 MB Free Tier** limit!).
* **API Footprint**:
  * Daily Score-Based Cron: ~35 calls/day.
  * Live Status Calls: ~10 calls/day (deduplicated by 2-min cache).
  * On-Demand Lazy Load Missing Trains: ~3 calls/day.
  * **Total API Usage**: **~48 requests/day** (Completely inside RailRadar's **50 requests/day Free Tier** limit!).
