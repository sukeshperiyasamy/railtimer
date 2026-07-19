import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Illustrative schedules for well-known, real Indian Railways trains — close
 * to public timetables but not pulled from a live feed. Good enough to
 * populate pages during development; reconcile against NTES/live data before
 * treating as authoritative.
 */
const DAILY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface StopSeed {
  stationCode: string;
  stationName: string;
  arrivalTime: string | null;
  departureTime: string | null;
  dayNumber: number;
}

interface TrainSeed {
  trainNumber: string;
  trainName: string;
  slug: string;
  sourceStation: string;
  destStation: string;
  runsOn: string[];
  stops: StopSeed[];
}

const trains: TrainSeed[] = [
  {
    trainNumber: "12951",
    trainName: "Mumbai Rajdhani Express",
    slug: "12951-mumbai-rajdhani-express",
    sourceStation: "NDLS",
    destStation: "BCT",
    runsOn: DAILY,
    stops: [
      { stationCode: "NDLS", stationName: "New Delhi", arrivalTime: null, departureTime: "16:25", dayNumber: 1 },
      { stationCode: "KOTA", stationName: "Kota Junction", arrivalTime: "22:30", departureTime: "22:35", dayNumber: 1 },
      { stationCode: "RTM", stationName: "Ratlam Junction", arrivalTime: "02:38", departureTime: "02:40", dayNumber: 2 },
      { stationCode: "BRC", stationName: "Vadodara Junction", arrivalTime: "05:23", departureTime: "05:25", dayNumber: 2 },
      { stationCode: "ST", stationName: "Surat", arrivalTime: "06:58", departureTime: "07:00", dayNumber: 2 },
      { stationCode: "BCT", stationName: "Mumbai Central", arrivalTime: "08:35", departureTime: null, dayNumber: 2 },
    ],
  },
  {
    trainNumber: "12301",
    trainName: "Howrah Rajdhani Express",
    slug: "12301-howrah-rajdhani-express",
    sourceStation: "HWH",
    destStation: "NDLS",
    runsOn: DAILY,
    stops: [
      { stationCode: "HWH", stationName: "Howrah Junction", arrivalTime: null, departureTime: "16:50", dayNumber: 1 },
      { stationCode: "DHN", stationName: "Dhanbad Junction", arrivalTime: "19:22", departureTime: "19:24", dayNumber: 1 },
      { stationCode: "GAYA", stationName: "Gaya Junction", arrivalTime: "21:12", departureTime: "21:14", dayNumber: 1 },
      { stationCode: "PNBE", stationName: "Patna Junction", arrivalTime: "22:37", departureTime: "22:47", dayNumber: 1 },
      { stationCode: "DDU", stationName: "Pt. Deen Dayal Upadhyaya Jn", arrivalTime: "01:05", departureTime: "01:15", dayNumber: 2 },
      { stationCode: "CNB", stationName: "Kanpur Central", arrivalTime: "04:38", departureTime: "04:43", dayNumber: 2 },
      { stationCode: "NDLS", stationName: "New Delhi", arrivalTime: "10:00", departureTime: null, dayNumber: 2 },
    ],
  },
  {
    trainNumber: "12259",
    trainName: "Sealdah Duronto Express",
    slug: "12259-sealdah-duronto-express",
    sourceStation: "SDAH",
    destStation: "NDLS",
    runsOn: ["Mon", "Wed", "Thu", "Sat", "Sun"],
    stops: [
      { stationCode: "SDAH", stationName: "Sealdah", arrivalTime: null, departureTime: "16:45", dayNumber: 1 },
      { stationCode: "GAYA", stationName: "Gaya Junction", arrivalTime: "22:05", departureTime: "22:10", dayNumber: 1 },
      { stationCode: "CNB", stationName: "Kanpur Central", arrivalTime: "04:05", departureTime: "04:10", dayNumber: 2 },
      { stationCode: "NDLS", stationName: "New Delhi", arrivalTime: "10:15", departureTime: null, dayNumber: 2 },
    ],
  },
  {
    trainNumber: "12002",
    trainName: "Bhopal Shatabdi Express",
    slug: "12002-bhopal-shatabdi-express",
    sourceStation: "NDLS",
    destStation: "BPL",
    runsOn: DAILY,
    stops: [
      { stationCode: "NDLS", stationName: "New Delhi", arrivalTime: null, departureTime: "06:00", dayNumber: 1 },
      { stationCode: "AGC", stationName: "Agra Cantt", arrivalTime: "07:59", departureTime: "08:01", dayNumber: 1 },
      { stationCode: "GWL", stationName: "Gwalior Junction", arrivalTime: "09:12", departureTime: "09:14", dayNumber: 1 },
      { stationCode: "JHS", stationName: "Jhansi Junction", arrivalTime: "10:12", departureTime: "10:17", dayNumber: 1 },
      { stationCode: "BPL", stationName: "Bhopal Junction", arrivalTime: "12:55", departureTime: null, dayNumber: 1 },
    ],
  },
  {
    trainNumber: "12621",
    trainName: "Tamil Nadu Express",
    slug: "12621-tamil-nadu-express",
    sourceStation: "NDLS",
    destStation: "MAS",
    runsOn: DAILY,
    stops: [
      { stationCode: "NDLS", stationName: "New Delhi", arrivalTime: null, departureTime: "22:30", dayNumber: 1 },
      { stationCode: "AGC", stationName: "Agra Cantt", arrivalTime: "00:52", departureTime: "00:54", dayNumber: 2 },
      { stationCode: "BPL", stationName: "Bhopal Junction", arrivalTime: "07:50", departureTime: "07:55", dayNumber: 2 },
      { stationCode: "NGP", stationName: "Nagpur Junction", arrivalTime: "14:05", departureTime: "14:15", dayNumber: 2 },
      { stationCode: "BZA", stationName: "Vijayawada Junction", arrivalTime: "02:58", departureTime: "03:03", dayNumber: 3 },
      { stationCode: "MAS", stationName: "MGR Chennai Central", arrivalTime: "07:15", departureTime: null, dayNumber: 3 },
    ],
  },
  {
    trainNumber: "12626",
    trainName: "Kerala Express",
    slug: "12626-kerala-express",
    sourceStation: "NDLS",
    destStation: "TVC",
    runsOn: DAILY,
    stops: [
      { stationCode: "NDLS", stationName: "New Delhi", arrivalTime: null, departureTime: "20:40", dayNumber: 1 },
      { stationCode: "BPL", stationName: "Bhopal Junction", arrivalTime: "05:00", departureTime: "05:05", dayNumber: 2 },
      { stationCode: "NGP", stationName: "Nagpur Junction", arrivalTime: "11:15", departureTime: "11:25", dayNumber: 2 },
      { stationCode: "BZA", stationName: "Vijayawada Junction", arrivalTime: "23:35", departureTime: "23:45", dayNumber: 2 },
      { stationCode: "CBE", stationName: "Coimbatore Junction", arrivalTime: "14:20", departureTime: "14:30", dayNumber: 3 },
      { stationCode: "TVC", stationName: "Thiruvananthapuram Central", arrivalTime: "20:15", departureTime: null, dayNumber: 3 },
    ],
  },
  {
    trainNumber: "12309",
    trainName: "Rajendra Nagar Rajdhani Express",
    slug: "12309-rajendra-nagar-rajdhani-express",
    sourceStation: "RJPB",
    destStation: "NDLS",
    runsOn: ["Mon", "Wed", "Fri", "Sat"],
    stops: [
      { stationCode: "RJPB", stationName: "Rajendra Nagar Terminal", arrivalTime: null, departureTime: "17:05", dayNumber: 1 },
      { stationCode: "PNBE", stationName: "Patna Junction", arrivalTime: "17:35", departureTime: "17:40", dayNumber: 1 },
      { stationCode: "DDU", stationName: "Pt. Deen Dayal Upadhyaya Jn", arrivalTime: "21:05", departureTime: "21:15", dayNumber: 1 },
      { stationCode: "CNB", stationName: "Kanpur Central", arrivalTime: "00:38", departureTime: "00:43", dayNumber: 2 },
      { stationCode: "NDLS", stationName: "New Delhi", arrivalTime: "06:15", departureTime: null, dayNumber: 2 },
    ],
  },
  {
    trainNumber: "12423",
    trainName: "Dibrugarh Rajdhani Express",
    slug: "12423-dibrugarh-rajdhani-express",
    sourceStation: "NDLS",
    destStation: "DBRG",
    runsOn: ["Tue", "Thu", "Sat"],
    stops: [
      { stationCode: "NDLS", stationName: "New Delhi", arrivalTime: null, departureTime: "11:25", dayNumber: 1 },
      { stationCode: "CNB", stationName: "Kanpur Central", arrivalTime: "16:05", departureTime: "16:10", dayNumber: 1 },
      { stationCode: "PNBE", stationName: "Patna Junction", arrivalTime: "21:55", departureTime: "22:05", dayNumber: 1 },
      { stationCode: "NJP", stationName: "New Jalpaiguri", arrivalTime: "06:35", departureTime: "06:45", dayNumber: 2 },
      { stationCode: "GHY", stationName: "Guwahati", arrivalTime: "12:20", departureTime: "12:35", dayNumber: 2 },
      { stationCode: "DBRG", stationName: "Dibrugarh", arrivalTime: "20:00", departureTime: null, dayNumber: 2 },
    ],
  },
];

/** Denormalized departure/arrival/duration summary from the first and last stop. */
function summarize(stops: StopSeed[]): { departureTime: string; arrivalTime: string; duration: string } {
  const first = stops[0];
  const last = stops[stops.length - 1];
  const [depH, depM] = first.departureTime!.split(":").map(Number);
  const [arrH, arrM] = last.arrivalTime!.split(":").map(Number);

  const depMinutes = depH * 60 + depM;
  const arrMinutesAbs = (last.dayNumber - first.dayNumber) * 24 * 60 + arrH * 60 + arrM;
  const totalMinutes = arrMinutesAbs - depMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    departureTime: first.departureTime!,
    arrivalTime: last.arrivalTime!,
    duration: `${hours}h ${minutes}m`,
  };
}

async function main() {
  for (const train of trains) {
    const summary = summarize(train.stops);

    await prisma.train.upsert({
      where: { trainNumber: train.trainNumber },
      update: {
        trainName: train.trainName,
        slug: train.slug,
        sourceStation: train.sourceStation,
        destStation: train.destStation,
        runsOn: train.runsOn,
        ...summary,
        stops: {
          deleteMany: {},
          create: train.stops.map((stop, index) => ({
            ...stop,
            sequence: index + 1,
          })),
        },
      },
      create: {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        slug: train.slug,
        sourceStation: train.sourceStation,
        destStation: train.destStation,
        runsOn: train.runsOn,
        ...summary,
        stops: {
          create: train.stops.map((stop, index) => ({
            ...stop,
            sequence: index + 1,
          })),
        },
      },
    });
    console.log(`Seeded ${train.trainNumber} ${train.trainName}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
