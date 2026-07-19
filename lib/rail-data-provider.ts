import { cached, CACHE_TTL_SECONDS } from "./redis";
import {
  type Availability,
  availabilitySchema,
  type PnrStatus,
  pnrStatusSchema,
  type RunningStatus,
  runningStatusSchema,
} from "./schemas/rail-data";

/**
 * Single point of contact with external rail-data APIs. Nothing outside
 * this file should ever import an HTTP client for train data directly —
 * these APIs are unofficial and can change or break without notice, so all
 * call sites go through this interface and get validated, cached data back.
 */
export interface RailDataProvider {
  getPnrStatus(pnr: string): Promise<PnrStatus>;
  getTrainRunningStatus(
    trainNumber: string,
    date: string,
  ): Promise<RunningStatus>;
  getCurrentAvailability(
    trainNumber: string,
    date: string,
    travelClass: string,
  ): Promise<Availability>;
}

function seedFromString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Deterministic mock implementation. Used until a real provider (eRail,
 * IndianRailAPI, a RapidAPI listing, ...) is picked and RAIL_DATA_API_KEY /
 * RAIL_DATA_API_BASE_URL are configured — see getRailDataProvider() below.
 * Output is still parsed through the real Zod schemas so every downstream
 * consumer is already contract-tested against the real response shape.
 */
class MockRailDataProvider implements RailDataProvider {
  async getPnrStatus(pnr: string): Promise<PnrStatus> {
    const seed = seedFromString(pnr);
    return pnrStatusSchema.parse({
      pnrNumber: pnr,
      trainNumber: "12951",
      trainName: "Mumbai Rajdhani",
      dateOfJourney: new Date().toISOString().slice(0, 10),
      sourceStation: "NDLS",
      destinationStation: "BCT",
      boardingPoint: "NDLS",
      reservationUpto: "BCT",
      travelClass: "3A",
      chartPrepared: seed % 2 === 0,
      passengers: [
        {
          passengerSerialNumber: 1,
          bookingStatus: "CNF/B4/22",
          currentStatus: seed % 3 === 0 ? "CNF/B4/22" : "RAC/12",
          currentCoachId: "B4",
          currentBerthNo: 22,
        },
      ],
    });
  }

  async getTrainRunningStatus(
    trainNumber: string,
    date: string,
  ): Promise<RunningStatus> {
    const seed = seedFromString(trainNumber + date);
    return runningStatusSchema.parse({
      trainNumber,
      trainName: "Mumbai Rajdhani",
      date,
      status: "running",
      delayMinutes: seed % 45,
      currentStationCode: "KOTA",
      lastUpdatedAt: new Date().toISOString(),
      stops: [
        {
          stationCode: "NDLS",
          stationName: "New Delhi",
          scheduledArrival: null,
          actualArrival: null,
          scheduledDeparture: "16:35",
          actualDeparture: "16:35",
          distanceKm: 0,
          dayNumber: 1,
          hasDeparted: true,
        },
        {
          stationCode: "KOTA",
          stationName: "Kota Junction",
          scheduledArrival: "22:40",
          actualArrival: "23:05",
          scheduledDeparture: "22:45",
          actualDeparture: "23:10",
          distanceKm: 465,
          dayNumber: 1,
          hasDeparted: false,
        },
        {
          stationCode: "BCT",
          stationName: "Mumbai Central",
          scheduledArrival: "08:35",
          actualArrival: null,
          scheduledDeparture: null,
          actualDeparture: null,
          distanceKm: 1384,
          dayNumber: 2,
          hasDeparted: false,
        },
      ],
    });
  }

  async getCurrentAvailability(
    trainNumber: string,
    date: string,
    travelClass: string,
  ): Promise<Availability> {
    const seed = seedFromString(trainNumber + date + travelClass);
    const statuses = ["AVAILABLE-23", "AVAILABLE-4", "RAC-12", "WL-8", "WL-1"];
    return availabilitySchema.parse({
      trainNumber,
      date,
      travelClass,
      quota: "GN",
      availabilityStatus: statuses[seed % statuses.length],
      fare: 500 + (seed % 20) * 45,
    });
  }
}

/** Cache-first decorator — the only place that touches Redis for live data. */
class CachingRailDataProvider implements RailDataProvider {
  constructor(
    private readonly inner: RailDataProvider,
    private readonly ttlSeconds: number = CACHE_TTL_SECONDS,
  ) {}

  getPnrStatus(pnr: string): Promise<PnrStatus> {
    return cached(`pnr:${pnr}`, this.ttlSeconds, () =>
      this.inner.getPnrStatus(pnr),
    );
  }

  getTrainRunningStatus(
    trainNumber: string,
    date: string,
  ): Promise<RunningStatus> {
    return cached(`running-status:${trainNumber}:${date}`, this.ttlSeconds, () =>
      this.inner.getTrainRunningStatus(trainNumber, date),
    );
  }

  getCurrentAvailability(
    trainNumber: string,
    date: string,
    travelClass: string,
  ): Promise<Availability> {
    return cached(
      `availability:${trainNumber}:${date}:${travelClass}`,
      this.ttlSeconds,
      () => this.inner.getCurrentAvailability(trainNumber, date, travelClass),
    );
  }
}

let providerSingleton: RailDataProvider | undefined;

/**
 * Single entry point for the rest of the app — pages, components, and API
 * routes must call this instead of instantiating a provider directly.
 *
 * TODO: once a real provider is chosen and RAIL_DATA_API_KEY /
 * RAIL_DATA_API_BASE_URL are set, replace `new MockRailDataProvider()` with
 * an HTTP-backed implementation of RailDataProvider. Nothing outside this
 * file needs to change.
 */
export function getRailDataProvider(): RailDataProvider {
  if (!providerSingleton) {
    const base = new MockRailDataProvider();
    providerSingleton = new CachingRailDataProvider(base);
  }
  return providerSingleton;
}
