import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/site";

export interface BreadcrumbItem {
  label: string;
  /** Omit on the last (current-page) item. */
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/** Visible breadcrumb trail + matching BreadcrumbList JSON-LD. */
export function Breadcrumb({ items }: BreadcrumbProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={item.label} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link href={item.href} className="underline-offset-4 hover:text-foreground hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "text-foreground" : undefined}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            </span>
          );
        })}
      </nav>
    </>
  );
}
