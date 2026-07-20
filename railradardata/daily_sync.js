// daily_sync.js - Weighted Score Priority Sync Script v2.0

const RailRadarClient = require('./live_api_service');
const { getPriorityTrainsForSync, supabase } = require('./supabase_db');

const client = new RailRadarClient();

/**
 * Weighted Refresh Strategy:
 * score = (search_count * 0.5) + (days_since_last_sync * 0.3) + (recent_7_day_searches * 0.2)
 * Refreshes top N scoring trains every night.
 */
async function runScoreBasedDailySync(limit = 35) {
  console.log('--- Starting Weighted Priority Daily Sync ---');
  let updatedCount = 0;
  const startTime = Date.now();

  try {
    const priorityTrains = await getPriorityTrainsForSync(limit);
    console.log(`Ranked ${priorityTrains.length} highest-scoring trains for daily refresh...`);

    for (const trainNo of priorityTrains) {
      console.log(`Refreshing Train #${trainNo}...`);
      try {
        const res = await client.getTrainDetails(trainNo);
        if (res && res.success && res.data) {
          // Upsert train master
          await supabase.from('trains').upsert({
            train_number: res.data.number,
            train_name: res.data.name,
            from_station_code: res.data.from_code,
            to_station_code: res.data.to_code,
            run_days: res.data.runsOn || 'Daily',
            total_distance_km: parseFloat(res.data.totalDistance) || 0,
            last_synced: new Date().toISOString()
          });

          // Upsert normalized stops
          if (Array.isArray(res.data.schedule)) {
            const stops = res.data.schedule.map((s, idx) => ({
              train_number: res.data.number,
              station_code: s.code,
              stop_sequence: idx + 1,
              arrival_time: s.arr !== 'Source' ? s.arr : null,
              departure_time: s.dep !== 'Destination' ? s.dep : null,
              halt_minutes: parseInt(s.halt) || 0,
              distance_from_source_km: parseFloat(s.dist) || (idx * 30),
              day_number: s.day || 1
            }));

            await supabase.from('train_stops').upsert(stops, { onConflict: 'train_number,stop_sequence' });
          }

          updatedCount++;
        }
      } catch (err) {
        console.warn(`Failed to refresh Train #${trainNo}: ${err.message}`);
      }
      // Rate-limit throttle (1.5 seconds delay between calls)
      await new Promise(r => setTimeout(r, 1500));
    }

    const duration = Date.now() - startTime;
    await supabase.from('sync_logs').insert({
      job_type: 'daily_priority_refresh',
      trains_updated: updatedCount,
      status: 'SUCCESS',
      message: `Refreshed ${updatedCount} priority trains cleanly.`,
      execution_time_ms: duration
    });

    console.log(`--- Sync Completed! Updated ${updatedCount} trains in ${Math.round(duration/1000)}s ---`);
  } catch (err) {
    console.error('Fatal sync error:', err.message);
  }
}

if (require.main === module) {
  runScoreBasedDailySync(5);
}

module.exports = { runScoreBasedDailySync };
