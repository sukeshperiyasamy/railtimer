import { z } from "zod";

/**
 * Zod schemas for every shape that crosses the boundary from an external
 * rail-data API into the application. Nothing from `rail-data-provider.ts`
 * should ever return data that hasn't been parsed through one of these.
 */

export const pnrPassengerSchema = z.object({
  passengerSerialNumber: z.number().int().positive(),
  bookingStatus: z.string(),
  currentStatus: z.string(),
  currentCoachId: z.string().nullable(),
  currentBerthNo: z.number().int().nullable(),
});

export const pnrStatusSchema = z.object({
  pnrNumber: z.string().length(10),
  trainNumber: z.string(),
  trainName: z.string(),
  dateOfJourney: z.string(),
  sourceStation: z.string(),
  destinationStation: z.string(),
  boardingPoint: z.string(),
  reservationUpto: z.string(),
  travelClass: z.string(),
  chartPrepared: z.boolean(),
  passengers: z.array(pnrPassengerSchema).min(1),
});

export type PnrStatus = z.infer<typeof pnrStatusSchema>;

export const runningStatusEnum = z.enum([
  "not-started",
  "running",
  "delayed",
  "cancelled",
  "completed",
]);

export const runningStatusStopSchema = z.object({
  stationCode: z.string(),
  stationName: z.string(),
  scheduledArrival: z.string().nullable(),
  actualArrival: z.string().nullable(),
  scheduledDeparture: z.string().nullable(),
  actualDeparture: z.string().nullable(),
  distanceKm: z.number().nonnegative(),
  dayNumber: z.number().int().positive(),
  hasDeparted: z.boolean(),
});

export const runningStatusSchema = z.object({
  trainNumber: z.string(),
  trainName: z.string(),
  date: z.string(),
  status: runningStatusEnum,
  delayMinutes: z.number().int(),
  currentStationCode: z.string().nullable(),
  lastUpdatedAt: z.string(),
  stops: z.array(runningStatusStopSchema).min(1),
});

export type RunningStatus = z.infer<typeof runningStatusSchema>;

export const availabilitySchema = z.object({
  trainNumber: z.string(),
  date: z.string(),
  travelClass: z.string(),
  quota: z.string(),
  availabilityStatus: z.string(),
  fare: z.number().nonnegative().nullable(),
});

export type Availability = z.infer<typeof availabilitySchema>;
