export interface ToolLink {
  href: string;
  title: string;
  subtitle: string;
  status: "live" | "coming-soon";
}

/** Single source of truth for the tools hub — used in nav, homepage, and every page's "Related tools" block. */
export const TOOLS: ToolLink[] = [
  {
    href: "/tools/current-booking-calculator",
    title: "Current Booking Calculator",
    subtitle: "Chart preparation time, countdown, and the rule used",
    status: "live",
  },
  {
    href: "/tools/chart-preparation-time",
    title: "Chart Preparation Calculator",
    subtitle: "Deep-dive on first vs. final chart timing",
    status: "coming-soon",
  },
  {
    href: "/tools/tatkal-countdown",
    title: "Tatkal Countdown",
    subtitle: "Exact opening time for Tatkal booking windows",
    status: "coming-soon",
  },
  {
    href: "/tools/reservation-opening-date",
    title: "Reservation Opening Date Calculator",
    subtitle: "When advance reservation opens for your journey date",
    status: "coming-soon",
  },
];
