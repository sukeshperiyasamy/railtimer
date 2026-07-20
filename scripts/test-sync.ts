import { prisma } from "../lib/prisma";
import { getRailDataProvider } from "../lib/rail-data-provider";

async function testFetchAndSync() {
  console.log("=== Testing Automated Data Collection & Database Sync ===");

  const trainNumber = "12951";
  const dateStr = new Date().toISOString().slice(0, 10);

  console.log(`1. Fetching live running status for Train #${trainNumber} on ${dateStr}...`);
  const provider = getRailDataProvider();
  const status = await provider.getTrainRunningStatus(trainNumber, dateStr);

  console.log("   ✓ Status fetched successfully:");
  console.log(`     Train: ${status.trainName} (${status.trainNumber})`);
  console.log(`     Current Station: ${status.currentStationCode}`);
  console.log(`     Delay: ${status.delayMinutes} minutes`);
  console.log(`     Stops Count: ${status.stops.length}`);

  console.log("\n2. Upserting into Supabase database via Prisma...");
  const trainRecord = await prisma.train.upsert({
    where: { trainNumber },
    update: {
      trainName: status.trainName,
      updatedAt: new Date(),
    },
    create: {
      trainNumber: status.trainNumber,
      trainName: status.trainName,
      slug: `${status.trainNumber}-mumbai-rajdhani`,
      sourceStation: status.stops[0]?.stationCode || "NDLS",
      destStation: status.stops[status.stops.length - 1]?.stationCode || "BCT",
      runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
  });

  console.log("   ✓ Database record created/updated successfully:");
  console.log(`     ID: ${trainRecord.id}`);
  console.log(`     Updated At: ${trainRecord.updatedAt.toISOString()}`);

  console.log("\n3. Querying total train count in Supabase...");
  const totalTrains = await prisma.train.count();
  const totalStops = await prisma.stop.count();
  console.log(`   ✓ Total Trains in DB: ${totalTrains}`);
  console.log(`   ✓ Total Stops in DB: ${totalStops}`);

  console.log("\n=== Test Passed: Data collection & persistence verified! ===");
}

testFetchAndSync()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Test failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
