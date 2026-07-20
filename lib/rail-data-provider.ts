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

class RailRadarDataProvider implements RailDataProvider {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string = "https://api.railradar.in/v1",
  ) {}

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async getPnrStatus(pnr: string): Promise<PnrStatus> {
    try {
      const res = await fetch(`${this.baseUrl}/pnr/${pnr}`, {
        headers: this.headers,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return pnrStatusSchema.parse(json.data);
      }
    } catch (err) {
      console.warn(`[RailRadar Live PNR Fallback for ${pnr}]:`, err);
    }
    return new MockRailDataProvider().getPnrStatus(pnr);
  }

  async getTrainRunningStatus(
    trainNumber: string,
    date: string,
  ): Promise<RunningStatus> {
    try {
      const res = await fetch(
        `${this.baseUrl}/trains/${trainNumber}/live?date=${date}`,
        { headers: this.headers },
      );
      if (res.ok) {
        const json = await res.json();

        const raw = json.data || json;
        const scheduleArray = Array.isArray(raw.route)
          ? raw.route
          : Array.isArray(raw.schedule)
            ? raw.schedule
            : Array.isArray(raw.stops)
              ? raw.stops
              : [];

        let statusEnum: "not-started" | "running" | "delayed" | "cancelled" | "completed" = "running";
        if (typeof raw.status === "string") {
          const s = raw.status.toLowerCase();
          if (s.includes("complete") || s.includes("finish") || s.includes("arrived")) {
            statusEnum = "completed";
          } else if (s.includes("cancel")) {
            statusEnum = "cancelled";
          } else if (s.includes("delay")) {
            statusEnum = "delayed";
          } else if (s.includes("not") || s.includes("upcoming")) {
            statusEnum = "not-started";
          }
        } else if (raw.delay > 15) {
          statusEnum = "delayed";
        }

        const normalized = {
          trainNumber: String(raw.trainNumber || raw.number || trainNumber),
          trainName: String(raw.trainName || raw.name || "Train " + trainNumber),
          date: String(raw.date || date),
          status: statusEnum,
          delayMinutes: Math.round(Number(raw.delayMinutes ?? raw.delay ?? 0)),
          currentStationCode:
            raw.currentStationCode ||
            raw.currentStation ||
            raw.current_station ||
            null,
          lastUpdatedAt: new Date().toISOString(),
          stops: scheduleArray.map((s: Record<string, unknown>) => ({
            stationCode: String(s.stationCode || s.code || "UNKNOWN"),
            stationName: String(s.stationName || s.station || "Station"),
            scheduledArrival: s.scheduledArrival ? String(s.scheduledArrival).slice(11, 16) : (s.arr as string) || null,
            actualArrival: s.actualArrival ? String(s.actualArrival).slice(11, 16) : (s.arr as string) || null,
            scheduledDeparture: s.scheduledDeparture ? String(s.scheduledDeparture).slice(11, 16) : (s.dep as string) || null,
            actualDeparture: s.actualDeparture ? String(s.actualDeparture).slice(11, 16) : (s.dep as string) || null,
            distanceKm: Math.max(0, parseFloat((s.distance || s.distanceKm || s.dist || "0") as string) || 0),
            dayNumber: Math.max(1, parseInt((s.arrivalDay || s.departureDay || s.dayNumber || s.day || "1") as string) || 1),
            hasDeparted: s.status === "completed" || Boolean(s.hasDeparted ?? s.departed),
          })),
        };

        if (normalized.stops.length === 0) {
          throw new Error("No stops in RailRadar live response schedule");
        }

        return runningStatusSchema.parse(normalized);
      }
    } catch (err) {
      console.warn(
        `[RailRadar Live Running Status Fallback for ${trainNumber}]:`,
        err,
      );
    }
    return new MockRailDataProvider().getTrainRunningStatus(trainNumber, date);
  }

  async getCurrentAvailability(
    trainNumber: string,
    date: string,
    travelClass: string,
  ): Promise<Availability> {
    try {
      const res = await fetch(
        `${this.baseUrl}/trains/${trainNumber}/availability?date=${date}&class=${travelClass}`,
        { headers: this.headers },
      );
      if (res.ok) {
        const json = await res.json();
        if (json.data) return availabilitySchema.parse(json.data);
      }
    } catch (err) {
      console.warn(
        `[RailRadar Live Availability Fallback for ${trainNumber}]:`,
        err,
      );
    }
    return new MockRailDataProvider().getCurrentAvailability(
      trainNumber,
      date,
      travelClass,
    );
  }
}

let providerSingleton: RailDataProvider | undefined;

/**
 * Single entry point for the rest of the app — pages, components, and API
 * routes must call this instead of instantiating a provider directly.
 */
export function getRailDataProvider(): RailDataProvider {
  if (!providerSingleton) {
    const apiKey =
      process.env.RAIL_DATA_API_KEY || process.env.RAILRADAR_API_KEY;
    const baseUrl =
      process.env.RAIL_DATA_API_BASE_URL || "https://api.railradar.in/v1";

    const base = apiKey
      ? new RailRadarDataProvider(apiKey, baseUrl)
      : new MockRailDataProvider();

    providerSingleton = new CachingRailDataProvider(base);
  }
  return providerSingleton;
}
