-- Production Supabase PostgreSQL Schema v2.0 (Refined Architecture)

-- 1. STATIONS TABLE
CREATE TABLE IF NOT EXISTS stations (
    station_code VARCHAR(10) PRIMARY KEY,
    station_name TEXT NOT NULL,
    state TEXT,
    zone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TRAINS TABLE
CREATE TABLE IF NOT EXISTS trains (
    train_number VARCHAR(10) PRIMARY KEY,
    train_name TEXT NOT NULL,
    train_type VARCHAR(50) DEFAULT 'Express',
    from_station_code VARCHAR(10) REFERENCES stations(station_code),
    to_station_code VARCHAR(10) REFERENCES stations(station_code),
    run_days TEXT,
    total_distance_km NUMERIC(7,2),
    duration_minutes INTEGER,
    coach_position TEXT,
    last_synced TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRAIN STOPS TABLE (Normalized Schedule)
CREATE TABLE IF NOT EXISTS train_stops (
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

-- 4. ROUTES TABLE (GeoJSON Geometry with 30-90 Day Refresh TTL)
CREATE TABLE IF NOT EXISTS routes (
    train_number VARCHAR(10) PRIMARY KEY REFERENCES trains(train_number) ON DELETE CASCADE,
    geojson JSONB NOT NULL,
    last_synced TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LIVE CACHE TABLE (Short TTL: 2-5 minutes)
CREATE TABLE IF NOT EXISTS live_cache (
    train_number VARCHAR(10) PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 6. SEARCH HISTORY TABLE (Granular Audit & Recent Activity)
CREATE TABLE IF NOT EXISTS search_history (
    id BIGSERIAL PRIMARY KEY,
    train_number VARCHAR(10) NOT NULL,
    searched_at TIMESTAMPTZ DEFAULT NOW(),
    user_ip TEXT
);

-- 7. SYNC LOGS TABLE
CREATE TABLE IF NOT EXISTS sync_logs (
    id BIGSERIAL PRIMARY KEY,
    job_type VARCHAR(50) NOT NULL,
    trains_updated INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- INDEXES & SCORE CALCULATION FUNCTION
-- ========================================================

CREATE INDEX IF NOT EXISTS idx_trains_name ON trains USING gin (to_tsvector('english', train_name));
CREATE INDEX IF NOT EXISTS idx_stops_stn_seq ON train_stops(station_code, train_number, stop_sequence);
CREATE INDEX IF NOT EXISTS idx_search_hist_train ON search_history(train_number, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_cache_exp ON live_cache(expires_at);

-- Function to compute priority score for daily refresh:
-- Score = (total_searches * 0.5) + (days_since_last_sync * 0.3) + (recent_7_day_searches * 0.2)
CREATE OR REPLACE FUNCTION get_sync_priority_scores(max_limit INTEGER DEFAULT 40)
RETURNS TABLE (train_number VARCHAR(10), priority_score NUMERIC) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            t.train_number,
            COALESCE(COUNT(sh.id), 0) AS total_searches,
            COALESCE(COUNT(sh.id) FILTER (WHERE sh.searched_at >= NOW() - INTERVAL '7 days'), 0) AS recent_searches,
            EXTRACT(EPOCH FROM (NOW() - COALESCE(t.last_synced, '2000-01-01'::timestamptz))) / 86400.0 AS days_since_sync
        FROM trains t
        LEFT JOIN search_history sh ON t.train_number = sh.train_number
        GROUP BY t.train_number, t.last_synced
    )
    SELECT 
        s.train_number,
        ROUND(((s.total_searches * 0.5) + (s.days_since_sync * 0.3) + (s.recent_searches * 0.2))::numeric, 2) AS priority_score
    FROM stats s
    ORDER BY priority_score DESC
    LIMIT max_limit;
END;
$$ LANGUAGE plpgsql;
