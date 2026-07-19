"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Bell, CheckCircle2, Search, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateChartTimes, type ChartTimeResult } from "@/lib/chart-time";
import { searchTrains, type TrainSearchResult } from "@/lib/actions/train-search";

function formatDateTime(d: Date): string {
  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatCountdown(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const totalMinutes = Math.floor(Math.abs(diffMs) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return isPast ? `${label} ago` : `in ${label}`;
}

/** "Live" countdown is only shown for times within ~2 days either side of now. */
function withinCountdownWindow(target: Date, now: Date): boolean {
  return Math.abs(target.getTime() - now.getTime()) <= 48 * 60 * 60 * 1000;
}

function todayISO(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export interface ChartTimeCalculatorInitialTrain {
  trainNumber: string;
  trainName: string;
  departureTime: string | null;
}

interface ChartTimeCalculatorProps {
  /** Pre-fills the train field, e.g. when embedded on a specific train's page. */
  initialTrain?: ChartTimeCalculatorInitialTrain;
  /** Calculates immediately for today's date once mounted, if initialTrain has a known departure time. */
  autoCalculate?: boolean;
}

export function ChartTimeCalculator({ initialTrain, autoCalculate = false }: ChartTimeCalculatorProps = {}) {
  const [query, setQuery] = useState(
    initialTrain ? `${initialTrain.trainNumber} - ${initialTrain.trainName}` : "",
  );
  const [suggestions, setSuggestions] = useState<TrainSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<TrainSearchResult | null>(null);
  const [timeSource, setTimeSource] = useState<"schedule" | "manual">(
    initialTrain?.departureTime ? "schedule" : "manual",
  );
  const [isSearching, startSearch] = useTransition();

  const [journeyDate, setJourneyDate] = useState(todayISO());
  const [departureTime, setDepartureTime] = useState(initialTrain?.departureTime ?? "");
  const [result, setResult] = useState<ChartTimeResult | null>(null);
  const [notifyRequested, setNotifyRequested] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [hasEditedQuery, setHasEditedQuery] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Avoids a server/client render mismatch from Date.now(); ticks once mounted.
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Auto-calculate once, for a pre-filled train, on mount only.
  useEffect(() => {
    if (!autoCalculate || !initialTrain?.departureTime) return;
    const [hours, minutes] = initialTrain.departureTime.split(":").map(Number);
    const [year, month, day] = todayISO().split("-").map(Number);
    const departure = new Date(year, month - 1, day, hours, minutes, 0, 0);
    setResult(calculateChartTimes(departure));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelectedTrain(null);
    setTimeSource("manual");
    setResult(null);
    setHasEditedQuery(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      startSearch(async () => {
        const results = await searchTrains(value);
        setSuggestions(results);
        setShowSuggestions(true);
      });
    }, 250);
  }

  function selectTrain(train: TrainSearchResult) {
    setSelectedTrain(train);
    setQuery(`${train.trainNumber} - ${train.trainName}`);
    setShowSuggestions(false);
    if (train.departureTime) {
      setDepartureTime(train.departureTime);
      setTimeSource("schedule");
    } else {
      setTimeSource("manual");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!departureTime || !journeyDate) return;

    const [hours, minutes] = departureTime.split(":").map(Number);
    const [year, month, day] = journeyDate.split("-").map(Number);
    const departure = new Date(year, month - 1, day, hours, minutes, 0, 0);

    setResult(calculateChartTimes(departure));
    setNotifyRequested(false);
    setShareCopied(false);
  }

  async function handleShare() {
    if (!result) return;

    const trainLabel = selectedTrain
      ? `${selectedTrain.trainNumber} ${selectedTrain.trainName}`
      : query || "This train";
    const text = `${trainLabel}: first chart ${formatDateTime(result.firstChartTime)}, current booking opens ${formatDateTime(result.currentBookingOpensAt)}. Check yours on RailTimer.`;
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/tools/chart-time-calculator`
        : undefined;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Chart & current booking time", text, url });
      } catch {
        // Share sheet dismissed — no-op.
      }
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url ? `${text} ${url}` : text);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }

  return (
    <Card className="border-border">
      <CardContent className="space-y-6 pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Label htmlFor="train-query">Train number or name</Label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="train-query"
                placeholder="e.g. 12951 or Rajdhani Express"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="pl-9"
                autoComplete="off"
              />
            </div>

            {showSuggestions && suggestions.length > 0 ? (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
                {suggestions.map((train) => (
                  <li key={train.trainNumber}>
                    <button
                      type="button"
                      onClick={() => selectTrain(train)}
                      className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <span className="font-medium text-foreground">
                        {train.trainNumber} · {train.trainName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {train.sourceStation} → {train.destStation}
                        {train.departureTime ? ` · departs ${train.departureTime}` : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {isSearching ? (
              <p className="mt-1 text-xs text-muted-foreground">Searching…</p>
            ) : null}

            {hasEditedQuery && query.trim().length >= 2 && !isSearching && suggestions.length === 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Train not found in our database yet — enter its scheduled departure time
                below and we&apos;ll still calculate the chart timing for you.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="journey-date">Journey date</Label>
              <Input
                id="journey-date"
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="departure-time">
                Departure time{timeSource === "schedule" && " (editable)"}
              </Label>
              <Input
                id="departure-time"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto">
            Calculate chart time
          </Button>
        </form>

        {result ? (
          <div className="space-y-4 border-t border-border pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-muted/40 p-4">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  First chart prepared
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatDateTime(result.firstChartTime)}
                </p>
                {now && withinCountdownWindow(result.firstChartTime, now) ? (
                  <p className="mt-1 text-sm text-status-delayed">
                    {formatCountdown(result.firstChartTime, now)}
                  </p>
                ) : null}
              </div>

              <div className="rounded-md border border-border bg-muted/40 p-4">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Final chart / current booking opens
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatDateTime(result.currentBookingOpensAt)}
                </p>
                {now && withinCountdownWindow(result.currentBookingOpensAt, now) ? (
                  <p className="mt-1 text-sm text-status-ontime">
                    {formatCountdown(result.currentBookingOpensAt, now)}
                  </p>
                ) : null}
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">{result.rule}</p>

            <div className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-border p-4">
              <Bell className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="flex-1 text-sm text-muted-foreground">
                Want a reminder when current booking opens? Notifications aren&apos;t live
                yet, but you can flag your interest.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={notifyRequested}
                onClick={() => setNotifyRequested(true)}
              >
                {notifyRequested ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Noted
                  </span>
                ) : (
                  "Notify me"
                )}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleShare}>
                {shareCopied ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Copied
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Share2 className="h-4 w-4" /> Share
                  </span>
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
