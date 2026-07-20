"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { searchTrains, type TrainSearchResult } from "@/lib/actions/train-search";
import type { RunningStatus } from "@/lib/schemas/rail-data";

function todayISO(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const STATUS_LABEL: Record<RunningStatus["status"], string> = {
  "not-started": "Not started yet",
  running: "Running",
  delayed: "Delayed",
  cancelled: "Cancelled",
  completed: "Completed",
};

function statusColorClass(status: RunningStatus, delayMinutes: number): string {
  if (status.status === "cancelled") return "bg-status-cancelled/15 text-status-cancelled";
  if (status.status === "delayed" || delayMinutes > 15) {
    return "bg-status-delayed/15 text-status-delayed";
  }
  return "bg-status-ontime/15 text-status-ontime";
}

export function RunningStatusChecker() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TrainSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();

  const [date, setDate] = useState(todayISO());
  const [result, setResult] = useState<RunningStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelectedTrainNumber(null);
    setResult(null);
    setError(null);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      startSearch(async () => {
        const found = await searchTrains(value);
        setSuggestions(found);
        setShowSuggestions(true);
      });
    }, 250);
  }

  function selectTrain(train: TrainSearchResult) {
    setSelectedTrainNumber(train.trainNumber);
    setQuery(`${train.trainNumber} - ${train.trainName}`);
    setShowSuggestions(false);
    setActiveIndex(-1);
  }

  function handleQueryKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectTrain(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trainNumber = selectedTrainNumber ?? query.trim().match(/^\d{3,5}/)?.[0];
    if (!trainNumber) {
      setError("Select a train from the suggestions, or enter its train number.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/api/train-status/${trainNumber}?date=${encodeURIComponent(date)}`,
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(
          json.error ?? "Couldn't fetch live status for this train right now — try again shortly.",
        );
        return;
      }
      setResult(json.data as RunningStatus);
    } catch {
      setError("Couldn't reach the live status service — check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border">
      <CardContent className="space-y-6 pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Label htmlFor="running-status-query">Train number or name</Label>
            <div className="relative mt-1.5">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="running-status-query"
                role="combobox"
                aria-expanded={showSuggestions && suggestions.length > 0}
                aria-controls="running-status-suggestions"
                aria-autocomplete="list"
                placeholder="e.g. 12002 or Shatabdi Express"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onKeyDown={handleQueryKeyDown}
                className="pl-9"
                autoComplete="off"
              />
            </div>

            {showSuggestions && suggestions.length > 0 ? (
              <ul
                id="running-status-suggestions"
                role="listbox"
                className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md"
              >
                {suggestions.map((train, index) => (
                  <li key={train.trainNumber} role="option" aria-selected={index === activeIndex}>
                    <button
                      type="button"
                      onClick={() => selectTrain(train)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted ${
                        index === activeIndex ? "bg-muted" : ""
                      }`}
                    >
                      <span className="font-medium text-foreground">
                        {train.trainNumber} · {train.trainName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {train.sourceStation} → {train.destStation}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {isSearching ? (
              <p className="mt-1 text-xs text-muted-foreground">Searching…</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="running-status-date">Journey date</Label>
            <Input
              id="running-status-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
            {isLoading ? "Checking…" : "Check running status"}
          </Button>
        </form>

        {error ? (
          <p className="rounded-md border border-status-cancelled/30 bg-status-cancelled/10 p-3 text-sm text-status-cancelled">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${statusColorClass(result, result.delayMinutes)}`}
              >
                {STATUS_LABEL[result.status]}
              </span>
              <span className="text-sm text-muted-foreground">
                {result.delayMinutes > 0
                  ? `Running ${result.delayMinutes} minute${result.delayMinutes === 1 ? "" : "s"} late`
                  : "On time"}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              {result.trainNumber} {result.trainName} · Last updated{" "}
              {new Date(result.lastUpdatedAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
              {result.currentStationCode ? ` · Currently near ${result.currentStationCode}` : ""}
            </p>

            <div className="overflow-hidden rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>Sch. arrival</TableHead>
                    <TableHead>Actual arrival</TableHead>
                    <TableHead>Sch. departure</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.stops.map((stop) => (
                    <TableRow key={`${stop.stationCode}-${stop.dayNumber}`}>
                      <TableCell>
                        <span className="font-medium text-foreground">{stop.stationName}</span>{" "}
                        <span className="text-muted-foreground">({stop.stationCode})</span>
                      </TableCell>
                      <TableCell>{stop.scheduledArrival ?? "—"}</TableCell>
                      <TableCell>{stop.actualArrival ?? "—"}</TableCell>
                      <TableCell>{stop.scheduledDeparture ?? "—"}</TableCell>
                      <TableCell>
                        {stop.hasDeparted ? (
                          <span className="inline-flex items-center gap-1 text-status-ontime">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Departed
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
