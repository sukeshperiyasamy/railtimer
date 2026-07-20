"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchTrains, type TrainSearchResult } from "@/lib/actions/train-search";

/** Sitewide train search with keyboard navigation (ArrowUp/Down, Enter, Escape). */
export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TrainSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [, startSearch] = useTransition();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      startSearch(async () => {
        const found = await searchTrains(value);
        setResults(found);
        setIsOpen(found.length > 0);
      });
    }, 200);
  }

  function goTo(train: TrainSearchResult) {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/train/${train.slug}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const chosen = activeIndex >= 0 ? results[activeIndex] : results[0];
      if (chosen) goTo(chosen);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="global-search-listbox"
          aria-autocomplete="list"
          aria-label="Search trains by number or name"
          placeholder="Search train number or name…"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="h-9 w-full rounded-md border border-border bg-background py-2 pr-3 pl-8 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        />
      </div>

      {isOpen ? (
        <ul
          id="global-search-listbox"
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md"
        >
          {results.map((train, index) => (
            <li key={train.trainNumber} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => goTo(train)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm ${
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
    </div>
  );
}
