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

  await backfillStations();
  await seedBlogPosts();
}

interface BlogPostSeed {
  slug: string;
  title: string;
  content: string;
}

const blogPosts: BlogPostSeed[] = [
  {
    slug: "current-booking-explained",
    title: "Current Booking Explained",
    content: `Current booking is the window during which Indian Railways sells whatever berths are still unbooked on a train, right up until departure. It sits at the very end of the reservation timeline — after regular booking, after Tatkal, and after the waitlist has been finalized.

Every train gets a final chart prepared exactly 30 minutes before its scheduled departure. That chart locks in who's confirmed, and any seat that isn't claimed at that point — because someone cancelled, a waitlisted ticket never confirmed, or a berth was simply never booked — becomes available again. That's current booking: a fresh sale of leftover inventory, open to anyone, not just people who already held a ticket for that train.

You can book a current-booking seat in two ways: at the station's current booking counter, or, for trains where IRCTC has enabled it, directly online shortly after the final chart. Either way, you get an actual confirmed or RAC ticket for a specific seat or berth — not a general or unreserved ticket — so you board like any other reserved passenger.

The tricky part is timing. Because the final chart is always tied to departure time, not a fixed clock time, current booking opens at a different moment for every train. A train departing at 6:00 AM opens current booking at 5:30 AM; one departing at 11:00 PM opens it at 10:30 PM. Refreshing IRCTC at a guess wastes time and risks missing the window entirely, especially on popular routes where released seats can disappear within minutes.

That's exactly the gap our Current Booking Calculator is built to close — enter a train number and journey date, and it works out the exact opening time from the current Railway Board rule, with a live countdown so you know precisely when to check back.`,
  },
  {
    slug: "chart-preparation-time-guide",
    title: "Chart Preparation Time: The Complete Guide",
    content: `Chart preparation is the point where Indian Railways turns a list of bookings into an actual seating plan. Until the chart is drawn, your reservation is provisional — confirmed passengers don't have a fixed berth yet, and waitlisted passengers don't know if they're getting on at all. Once the chart is prepared, that uncertainty ends.

Indian Railways actually prepares two charts for every train. The first chart is the one that matters most if you're waitlisted: if your ticket hasn't been confirmed by the time it's drawn, it's automatically cancelled and refunded. Under the rule Railway Board introduced in December 2025, the first chart is prepared at a fixed time the previous night — 8:00 PM — for any train departing between 5:00 AM and 2:00 PM, and exactly 10 hours before departure for every other train.

The second chart, the final chart, is always prepared 30 minutes before departure, regardless of train type. It exists to catch late cancellations that happened after the first chart, and it's the moment that triggers current booking — any berth that's still unclaimed goes back on sale.

This timing hasn't stayed still. In the space of about eighteen months, the rule has changed three times: from 4 hours before departure, to 8 hours, to the current 10-hour / 8 PM structure. Each revision was a response to the same complaint — that waitlisted passengers weren't getting enough notice to arrange alternate travel before their ticket was cancelled outright.

Because the rule keeps moving, treating any fixed number as permanent is a mistake. Our Current Booking Calculator tracks the active Railway Board circular and versions it internally, so every result tells you exactly which rule produced it — useful today, and still trustworthy the next time the rule changes.`,
  },
  {
    slug: "tatkal-booking-rules",
    title: "Tatkal Booking Rules You Need to Know",
    content: `Tatkal is Indian Railways' answer to last-minute travel: a separate, smaller quota of seats held back from the regular reservation pool and released exactly one day before departure, at a fixed clock time, to anyone willing to book fast and pay a premium.

The Tatkal window opens once, in two waves. Booking for AC classes — 2A, 3A, CC, EC, 3E — opens at 10:00 AM, one day before the journey date, not counting the journey date itself. An hour later, at 11:00 AM, the same window opens for non-AC classes, mainly Sleeper and Second Sitting. Both windows are on the same calendar day: for travel on the 20th of a month, both AC and Sleeper Tatkal open on the 19th.

Because a fixed number of seats goes on sale to everyone simultaneously, Tatkal windows are genuinely competitive — popular routes can sell out within minutes. A few rules make the process stricter than regular booking: Tatkal fares carry a premium on top of the base fare, and since 15 July 2025, Aadhaar-based OTP authentication is compulsory for any Tatkal booking made online.

The refund rules are also less forgiving. A confirmed Tatkal ticket is not eligible for a refund if you cancel it — unlike a regular confirmed ticket, which gets a partial refund. The exception is a waitlisted Tatkal ticket: if it never confirms, it's cancelled automatically and refunded in full, the same as any other unconfirmed waitlisted booking.

Tatkal is often confused with current booking, but they're unrelated mechanisms. Tatkal is a scheduled, one-time release exactly one day out; current booking is triggered by the final chart, 30 minutes before departure, and depends entirely on how many seats are actually left unclaimed on the day.`,
  },
  {
    slug: "reservation-chart-guide",
    title: "The Reservation Chart Guide",
    content: `A reservation chart is the document — now fully digital — that Indian Railways uses to convert bookings into an actual seating and berth allocation for a specific train on a specific date. Nothing about your ticket is final until the chart is drawn: confirmed passengers don't have a fixed seat number yet, and waitlisted passengers don't know their fate.

Every train gets two charts. The first chart is prepared either the previous night at 8:00 PM, for trains departing between 5:00 AM and 2:00 PM, or exactly 10 hours before departure for every other train — this is the current rule as of December 2025, and it's changed more than once in recent years. This first chart is the one that decides waitlisted tickets: anyone still on the waitlist when it's drawn has their e-ticket automatically cancelled and refunded.

The second, final chart is always prepared 30 minutes before departure, no matter the train. It exists to absorb any cancellations that happened between the first chart and departure, and it's what actually opens current booking — releasing whatever berths are still unclaimed back onto the market.

A few practical implications follow from this. If you're travelling on a waitlisted ticket, watch the first-chart time, not departure — that's your real deadline. If you're hoping to get a seat through current booking, watch the final-chart time instead, since that's when anything becomes available. And if you're checking status through IRCTC or at the station, "chart prepared: yes" generally refers to the first chart, while seat availability after that point reflects activity up to the final chart.

Because both chart times depend on the train's scheduled departure — and the underlying rule itself is periodically revised by Railway Board — working them out by hand is easy to get wrong. Our Current Booking Calculator applies the exact current rule for any train and date, so you don't have to do the arithmetic yourself.`,
  },
  {
    slug: "current-booking-vs-tatkal",
    title: "Current Booking vs. Tatkal: What's the Difference?",
    content: `Current booking and Tatkal are the two ways to get a confirmed seat on a train you didn't originally book — but they work on completely different mechanics, and mixing them up is one of the most common mistakes new travellers make.

Tatkal opens once, on a fixed schedule: exactly one day before the date of journey, at 10:00 AM for AC classes and 11:00 AM for non-AC classes. It's a genuinely separate quota, held back from the regular booking pool in advance, and it goes on sale to everyone at the same moment — which is exactly why popular routes sell out within minutes. Tatkal tickets also carry a fare premium, and a confirmed Tatkal ticket can't be refunded if you cancel it.

Current booking is different in almost every respect. It isn't a separate quota — it's whatever's left over from the regular booking and waitlist process after the final chart is prepared, 30 minutes before departure. There's no premium fare, and the opening time isn't fixed on the calendar — it moves with the train's own departure time, so a 6 AM train opens current booking at 5:30 AM, while an 11 PM train opens it at 10:30 PM.

There's also a timing relationship between them worth knowing: Tatkal opens a full day before travel, while current booking opens only half an hour before. If you miss the Tatkal window, current booking is effectively your last realistic shot at a confirmed seat — but it depends entirely on berths actually being available, which regular Tatkal demand can't guarantee.

In practice: try Tatkal first if you're booking a day ahead and want certainty about the exact time you need to be online. If that's gone, or you're closer to departure, current booking is worth checking — just make sure you know the exact final-chart time for your specific train, which is what our Current Booking Calculator works out instantly.`,
  },
  {
    slug: "waiting-list-guide",
    title: "The Waiting List Guide",
    content: `A waitlisted ticket means Indian Railways has taken your booking and your money, but hasn't allocated you a seat yet — you're in a queue behind every confirmed and RAC passenger, hoping enough people cancel before the chart is drawn.

Your position on the waitlist (shown as a number, like WL 12) moves down as confirmed or RAC passengers cancel ahead of you. It's recalculated continuously right up until the first chart is prepared — under the current rule, that's either the previous night at 8:00 PM for trains departing between 5:00 AM and 2:00 PM, or 10 hours before departure otherwise. Whatever your waitlist number is at that exact moment decides your fate: if you've been confirmed, you get a seat; if you're still waitlisted, your e-ticket is automatically cancelled and fully refunded.

Not all waitlists behave the same way. Counter-booked (non-internet) waitlisted tickets and RAC (Reservation Against Cancellation) tickets are treated slightly differently from waitlisted e-tickets, and can sometimes still move up between the first and final chart if further cancellations happen — but for an online waitlisted e-ticket, the first chart is generally the hard cutoff.

A few things genuinely help your odds: booking as early as possible in the 60-day advance reservation window, since earlier bookings sit higher in the waitlist queue; choosing off-peak dates and avoiding festival-heavy travel windows where waitlists run long; and, if your ticket doesn't confirm, checking current booking right after the final chart — 30 minutes before departure — since a fresh cancellation can open up a seat even after your waitlisted ticket has already been refunded.

If you want to stop guessing when your ticket's fate will be decided, our Current Booking Calculator shows the exact first-chart time for your train and date, so you know precisely when to expect a final answer.`,
  },
];

async function seedBlogPosts() {
  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { title: post.title, content: post.content },
      create: post,
    });
  }
  console.log(`Seeded ${blogPosts.length} blog posts`);
}

/** Well-known real state for each seeded station code — confidently known, not guessed. */
const STATION_STATE: Record<string, string> = {
  NDLS: "Delhi",
  BCT: "Maharashtra",
  KOTA: "Rajasthan",
  RTM: "Madhya Pradesh",
  BRC: "Gujarat",
  ST: "Gujarat",
  HWH: "West Bengal",
  DHN: "Jharkhand",
  GAYA: "Bihar",
  PNBE: "Bihar",
  DDU: "Uttar Pradesh",
  CNB: "Uttar Pradesh",
  SDAH: "West Bengal",
  AGC: "Uttar Pradesh",
  GWL: "Madhya Pradesh",
  JHS: "Uttar Pradesh",
  BPL: "Madhya Pradesh",
  NGP: "Maharashtra",
  BZA: "Andhra Pradesh",
  MAS: "Tamil Nadu",
  CBE: "Tamil Nadu",
  TVC: "Kerala",
  RJPB: "Bihar",
  NJP: "West Bengal",
  GHY: "Assam",
  DBRG: "Assam",
};

/**
 * Derives the Station registry from the Stop rows already seeded above and
 * links Stop.stationId. No lat/lng — we don't have reliable coordinates for
 * these, and guessing would risk showing wrong map data on station pages.
 */
async function backfillStations() {
  const uniqueStations = new Map<string, string>();
  for (const train of trains) {
    for (const stop of train.stops) {
      if (!uniqueStations.has(stop.stationCode)) {
        uniqueStations.set(stop.stationCode, stop.stationName);
      }
    }
  }

  for (const [code, name] of uniqueStations) {
    const station = await prisma.station.upsert({
      where: { code },
      update: { name, state: STATION_STATE[code] ?? null },
      create: { code, name, state: STATION_STATE[code] ?? null },
    });

    await prisma.stop.updateMany({
      where: { stationCode: code },
      data: { stationId: station.id },
    });
  }
  console.log(`Backfilled ${uniqueStations.size} stations`);
}

import fs from "node:fs";
import path from "node:path";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractStationCode(str: string): { name: string; code: string } {
  const match = str.match(/(.*?)\s*\(([^)]+)\)$/);
  if (match) {
    return { name: match[1].trim(), code: match[2].trim().toUpperCase() };
  }
  return { name: str.trim(), code: str.trim().toUpperCase() };
}

async function importRailRadarData() {
  const railRadarDir = path.join(process.cwd(), "data", "railradar");
  const dataPath = path.join(railRadarDir, "trains_data.json");
  const indexPath = path.join(railRadarDir, "trains_index.json");

  if (fs.existsSync(dataPath)) {
    console.log("Processing railradardata/trains_data.json...");
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const trainsData = JSON.parse(rawData);

    for (const trainNo of Object.keys(trainsData)) {
      const item = trainsData[trainNo];
      const runsOn = item.runsOn
        ? item.runsOn.split(",").map((s: string) => s.trim())
        : DAILY;
      const slug = `${item.number}-${slugify(item.name)}`;

      const stops = (item.schedule || []).map((st: any, idx: number) => ({
        stationCode: st.code,
        stationName: st.station,
        arrivalTime: st.arr === "Source" ? null : st.arr,
        departureTime: st.dep === "Destination" ? null : st.dep,
        dayNumber: st.day || 1,
        sequence: idx + 1,
      }));

      const firstStop = stops[0];
      const lastStop = stops[stops.length - 1];

      await prisma.train.upsert({
        where: { trainNumber: item.number },
        update: {
          trainName: item.name,
          slug,
          sourceStation: firstStop?.stationCode || "SRC",
          destStation: lastStop?.stationCode || "DEST",
          runsOn,
          departureTime: firstStop?.departureTime || null,
          arrivalTime: lastStop?.arrivalTime || null,
          duration: item.totalDistance || null,
          stops: {
            deleteMany: {},
            create: stops.map((stop: any) => ({
              stationCode: stop.stationCode,
              stationName: stop.stationName,
              arrivalTime: stop.arrivalTime,
              departureTime: stop.departureTime,
              dayNumber: stop.dayNumber,
              sequence: stop.sequence,
            })),
          },
        },
        create: {
          trainNumber: item.number,
          trainName: item.name,
          slug,
          sourceStation: firstStop?.stationCode || "SRC",
          destStation: lastStop?.stationCode || "DEST",
          runsOn,
          departureTime: firstStop?.departureTime || null,
          arrivalTime: lastStop?.arrivalTime || null,
          duration: item.totalDistance || null,
          stops: {
            create: stops.map((stop: any) => ({
              stationCode: stop.stationCode,
              stationName: stop.stationName,
              arrivalTime: stop.arrivalTime,
              departureTime: stop.departureTime,
              dayNumber: stop.dayNumber,
              sequence: stop.sequence,
            })),
          },
        },
      });
      console.log(`Imported detailed schedule for ${item.number} ${item.name}`);
    }
  }

  if (fs.existsSync(indexPath)) {
    console.log("Processing railradardata/trains_index.json...");
    const rawIndex = fs.readFileSync(indexPath, "utf-8");
    const trainsIndex = JSON.parse(rawIndex);
    const trainNumbers = Object.keys(trainsIndex);

    let batchCount = 0;
    for (const trainNo of trainNumbers) {
      const item = trainsIndex[trainNo];
      const fromStation = extractStationCode(item.from || "");
      const toStation = extractStationCode(item.to || "");
      const slug = `${item.number}-${slugify(item.name)}`;

      await prisma.train.upsert({
        where: { trainNumber: item.number },
        update: {},
        create: {
          trainNumber: item.number,
          trainName: item.name,
          slug,
          sourceStation: fromStation.code,
          destStation: toStation.code,
          departureTime: item.departure || null,
          arrivalTime: item.arrival || null,
          duration: item.duration || null,
          runsOn: DAILY,
        },
      });

      batchCount++;
      if (batchCount % 100 === 0) {
        console.log(`Indexed ${batchCount}/${trainNumbers.length} trains...`);
      }
    }
    console.log(`Total indexed: ${batchCount} trains.`);
  }
}

main()
  .then(async () => {
    await importRailRadarData();
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

