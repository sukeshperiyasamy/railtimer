export interface TimelineStop {
  stationCode: string;
  stationName: string;
  time?: string | null;
}

interface RouteTimelineProps {
  stops: TimelineStop[];
}

/** Horizontally-scrollable station-to-station timeline, e.g. MAS → SA → ED → CBE. */
export function RouteTimeline({ stops }: RouteTimelineProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <ol className="flex min-w-max items-start">
        {stops.map((stop, index) => {
          const isLast = index === stops.length - 1;
          const isEndpoint = index === 0 || isLast;
          return (
            <li key={`${stop.stationCode}-${index}`} className="flex items-start">
              <div className="flex w-16 flex-col items-center gap-1">
                <span
                  className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                    isEndpoint
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-foreground"
                  }`}
                >
                  {stop.stationCode}
                </span>
                <span
                  className="max-w-16 truncate text-center text-[11px] text-muted-foreground"
                  title={stop.stationName}
                >
                  {stop.stationName}
                </span>
                {stop.time ? (
                  <span className="text-[10px] text-muted-foreground">{stop.time}</span>
                ) : null}
              </div>
              {!isLast ? (
                <div className="mt-4.5 h-px w-8 shrink-0 bg-border sm:w-12" aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
