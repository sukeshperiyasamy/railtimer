// supabase_db.js - Refined Production Data Service v2.0

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * 1. Hybrid "Trains Between Stations" Search
 * Local SQL first; calls API only if local database coverage is incomplete!
 */
async function getTrainsBetweenHybrid(fromCode, toCode, apiFallbackFn) {
  // Query Supabase relational stops first
  const { data: originStops } = await supabase
    .from('train_stops')
    .select('train_number, stop_sequence, departure_time, distance_from_source_km')
    .eq('station_code', fromCode);

  if (originStops && originStops.length > 0) {
    const trainNumbers = originStops.map(s => s.train_number);
    const { data: destStops } = await supabase
      .from('train_stops')
      .select('train_number, stop_sequence, arrival_time, distance_from_source_km')
      .in('train_number', trainNumbers)
      .eq('station_code', toCode);

    if (destStops && destStops.length > 0) {
      const matches = [];
      originStops.forEach(o => {
        const d = destStops.find(ds => ds.train_number === o.train_number && o.stop_sequence < ds.stop_sequence);
        if (d) {
          matches.push({
            train_number: o.train_number,
            departure_time: o.departure_time,
            arrival_time: d.arrival_time,
            distance_km: (d.distance_from_source_km - o.distance_from_source_km)
          });
        }
      });

      if (matches.length > 0) {
        console.log(`[Hybrid Search] Found ${matches.length} matches in local database (0 API Calls).`);
        return matches;
      }
    }
  }

  // Fallback to API if DB coverage is incomplete
  if (typeof apiFallbackFn === 'function') {
    console.log(`[Hybrid Search] DB coverage incomplete for ${fromCode} ➔ ${toCode}. Invoking API fallback...`);
    const apiResult = await apiFallbackFn(fromCode, toCode);
    return apiResult;
  }

  return [];
}

/**
 * 2. Weighted Priority Score Calculation for Daily Sync
 * Priority Score = (search_count * 0.5) + (days_since_last_sync * 0.3) + (recent_7_day_searches * 0.2)
 */
async function getPriorityTrainsForSync(limit = 40) {
  const { data, error } = await supabase.rpc('get_sync_priority_scores', { max_limit: limit });
  if (error || !data || data.length === 0) {
    console.log('[Priority Query] Fallback to recent search history...');
    const { data: recent } = await supabase
      .from('search_history')
      .select('train_number')
      .order('searched_at', { ascending: false })
      .limit(limit);

    return recent ? Array.from(new Set(recent.map(r => r.train_number))) : ['12951', '22436', '12002'];
  }
  return data.map(item => item.train_number);
}

/**
 * 3. Live Status Deduplication Cache with 2-Minute TTL (`live_cache` table)
 */
async function getCachedLiveStatus(trainNumber) {
  const { data } = await supabase
    .from('live_cache')
    .select('payload, expires_at')
    .eq('train_number', trainNumber)
    .gt('expires_at', new Date().toISOString())
    .single();

  return data ? data.payload : null;
}

async function setCachedLiveStatus(trainNumber, payload, ttlMinutes = 2) {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
  await supabase
    .from('live_cache')
    .upsert({
      train_number: trainNumber,
      payload: payload,
      updated_at: new Date().toISOString(),
      expires_at: expiresAt
    });
}

/**
 * 4. Record Granular Search Activity
 */
async function trackSearch(trainNumber, userIp = null) {
  await supabase
    .from('search_history')
    .insert({ train_number: trainNumber, user_ip: userIp });
}

/**
 * 5. Route Geometry 30-90 Day TTL Check
 */
async function isRouteGeometryStale(trainNumber, ttlDays = 60) {
  const { data } = await supabase
    .from('routes')
    .select('last_synced')
    .eq('train_number', trainNumber)
    .single();

  if (!data) return true; // Missing -> needs fetch
  const daysOld = (new Date() - new Date(data.last_synced)) / (1000 * 60 * 60 * 24);
  return daysOld >= ttlDays;
}

module.exports = {
  supabase,
  getTrainsBetweenHybrid,
  getPriorityTrainsForSync,
  getCachedLiveStatus,
  setCachedLiveStatus,
  trackSearch,
  isRouteGeometryStale
};
