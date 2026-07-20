import Link from "next/link";
import { TrainFront } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { GlobalSearch } from "./GlobalSearch";

const NAV_LINKS = [
  { href: "/tools/current-booking-calculator", label: "Current Booking Calculator" },
  { href: "/tools/running-status", label: "Running Status" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <TrainFront className="h-4.5 w-4.5" />
            </span>
            <span className="text-lg tracking-tight">RailTimer</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <MobileNav links={NAV_LINKS} />
        </div>

        <div className="pb-3 md:mx-auto md:max-w-sm md:pb-3">
          <GlobalSearch />
        </div>
      </div>
    </header>
  );
}
