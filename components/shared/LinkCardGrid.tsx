import Link from "next/link";

export interface LinkCardItem {
  href: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

interface LinkCardGridProps {
  /** Omit to render just the card grid, e.g. when a heading already exists above it. */
  heading?: string;
  items: LinkCardItem[];
  columns?: 1 | 2;
  className?: string;
}

/** Reusable "related X" block — used for related trains, stations, tools, and articles. */
export function LinkCardGrid({ heading, items, columns = 2, className }: LinkCardGridProps) {
  if (items.length === 0) return null;

  return (
    <section className={className ?? "mt-10"}>
      {heading ? <h2 className="text-2xl font-semibold text-foreground">{heading}</h2> : null}
      <div className={`grid gap-3 ${heading ? "mt-3" : ""} ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-foreground">{item.title}</p>
              {item.badge ? (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  {item.badge}
                </span>
              ) : null}
            </div>
            {item.subtitle ? (
              <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
