/**
 * Chart preparation timing for Indian Railways.
 *
 * Railway Board chart-preparation timing has changed 3x in 18 months
 * (4hr before departure -> 8hr before -> 10hr before / 8 PM previous night
 * for day trains, effective 2025-12). Check for updates before relying on
 * this in production — the rule lives in CHART_RULES below specifically so
 * a future change is a config edit, not a rewrite of calculateChartTimes().
 *
 * Departure/journey dates are treated as IST wall-clock time (the Date
 * object's local getHours()/getMinutes()) — callers should construct dates
 * from IST-local input, which is what the calculator UI does.
 */

interface ChartRuleConfig {
  effectiveFrom: string; // ISO date, informational
  /** Departures in [start, end) fall into the "day departure" bucket. */
  dayDepartureWindow: { start: string; end: string };
  /** Day-departure first chart is prepared at this clock time, the previous night. */
  dayDepartureFirstChartTime: string;
  /** All other departures: first chart is this many hours before departure. */
  otherDeparturesFirstChartHoursBefore: number;
  /** Final chart (and current-booking open) for every train. */
  finalChartMinutesBefore: number;
}

export const CHART_RULES: Record<string, ChartRuleConfig> = {
  "2025-12-rev1": {
    effectiveFrom: "2025-12-01",
    dayDepartureWindow: { start: "05:00", end: "14:00" },
    dayDepartureFirstChartTime: "20:00",
    otherDeparturesFirstChartHoursBefore: 10,
    finalChartMinutesBefore: 30,
  },
};

export const ACTIVE_RULE_VERSION = "2025-12-rev1";

export interface ChartTimeResult {
  firstChartTime: Date;
  finalChartTime: Date;
  /** Equal to finalChartTime — current booking opens once the final chart releases vacant berths. */
  currentBookingOpensAt: Date;
  rule: string;
  ruleVersion: string;
}

function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

function parseClockToMinutes(clock: string): number {
  const [h, m] = clock.split(":").map(Number);
  return h * 60 + m;
}

function atClockTime(referenceDate: Date, clock: string, dayOffset: number): Date {
  const [h, m] = clock.split(":").map(Number);
  const result = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate() + dayOffset,
    h,
    m,
    0,
    0,
  );
  return result;
}

function formatClock(d: Date): string {
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(from: Date, to: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY);
}

function describeDayRelation(departure: Date, target: Date): string {
  const diff = daysBetween(target, departure);
  if (diff === 0) return "the same day";
  if (diff === 1) return "the previous day";
  return `${diff} days earlier`;
}

export function calculateChartTimes(
  departureDateTime: Date,
  ruleVersion: string = ACTIVE_RULE_VERSION,
): ChartTimeResult {
  const rule = CHART_RULES[ruleVersion];
  if (!rule) {
    throw new Error(`Unknown chart rule version: ${ruleVersion}`);
  }

  const departureMinutes = minutesOfDay(departureDateTime);
  const windowStart = parseClockToMinutes(rule.dayDepartureWindow.start);
  const windowEnd = parseClockToMinutes(rule.dayDepartureWindow.end);
  const isDayDeparture = departureMinutes >= windowStart && departureMinutes < windowEnd;

  let firstChartTime: Date;
  let ruleText: string;

  if (isDayDeparture) {
    // Previous night, fixed clock time.
    firstChartTime = atClockTime(departureDateTime, rule.dayDepartureFirstChartTime, -1);
    ruleText = `Since this train departs at ${formatClock(departureDateTime)}, the first chart is prepared the previous night at ${formatClock(firstChartTime)}.`;
  } else {
    firstChartTime = new Date(
      departureDateTime.getTime() - rule.otherDeparturesFirstChartHoursBefore * 60 * 60 * 1000,
    );
    const dayRelation = describeDayRelation(departureDateTime, firstChartTime);
    ruleText = `Since this train departs at ${formatClock(departureDateTime)}, the first chart is prepared ${rule.otherDeparturesFirstChartHoursBefore} hours before departure, at ${formatClock(firstChartTime)} (${dayRelation}).`;
  }

  const finalChartTime = new Date(
    departureDateTime.getTime() - rule.finalChartMinutesBefore * 60 * 1000,
  );

  ruleText += ` Current booking opens once the final chart is prepared, ${rule.finalChartMinutesBefore} minutes before departure, at ${formatClock(finalChartTime)}.`;

  return {
    firstChartTime,
    finalChartTime,
    currentBookingOpensAt: finalChartTime,
    rule: ruleText,
    ruleVersion,
  };
}
