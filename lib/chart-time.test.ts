import { describe, expect, it } from "vitest";
import { calculateChartTimes } from "./chart-time";

function d(day: number, hour: number, minute: number) {
  return new Date(2026, 0, day, hour, minute, 0, 0);
}

describe("calculateChartTimes", () => {
  it("treats exactly 5:00 AM as a day departure (previous night 8 PM chart)", () => {
    const result = calculateChartTimes(d(15, 5, 0));
    expect(result.firstChartTime).toEqual(d(14, 20, 0));
  });

  it("treats exactly 2:00 PM as NOT a day departure (10-hours-before rule)", () => {
    const result = calculateChartTimes(d(15, 14, 0));
    expect(result.firstChartTime).toEqual(d(15, 4, 0));
  });

  it("treats midnight departure as the 10-hours-before rule", () => {
    const result = calculateChartTimes(d(15, 0, 0));
    expect(result.firstChartTime).toEqual(d(14, 14, 0));
  });

  it("treats 1:00 AM departure as the 10-hours-before rule", () => {
    const result = calculateChartTimes(d(15, 1, 0));
    expect(result.firstChartTime).toEqual(d(14, 15, 0));
  });

  it("treats 11:59 PM departure as the 10-hours-before rule, same day", () => {
    const result = calculateChartTimes(d(15, 23, 59));
    expect(result.firstChartTime).toEqual(d(15, 13, 59));
  });

  it("matches the brief's worked example: 9:15 AM departure -> previous night 8 PM", () => {
    const result = calculateChartTimes(d(15, 9, 15));
    expect(result.firstChartTime).toEqual(d(14, 20, 0));
    expect(result.rule).toContain("the previous night at 8:00");
  });

  it("always sets the final chart 30 minutes before departure", () => {
    const departure = d(15, 9, 15);
    const result = calculateChartTimes(departure);
    expect(result.finalChartTime).toEqual(d(15, 8, 45));
  });

  it("sets currentBookingOpensAt equal to the final chart time", () => {
    const result = calculateChartTimes(d(15, 9, 15));
    expect(result.currentBookingOpensAt).toEqual(result.finalChartTime);
  });

  it("throws on an unknown rule version", () => {
    expect(() => calculateChartTimes(d(15, 9, 15), "not-a-real-version")).toThrow();
  });
});
