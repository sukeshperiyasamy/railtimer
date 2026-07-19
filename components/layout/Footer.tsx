import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/tools/chart-time-calculator", label: "Chart Time Calculator" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="mt-4 max-w-3xl leading-relaxed">
          RailTimer is an independent, unofficial information resource for Indian
          Railways passengers. Train running status, PNR status, and seat
          availability shown here are sourced from third-party data providers and
          may lag behind the official IRCTC systems — always confirm before
          travel. RailTimer is not affiliated with, endorsed by, or operated by
          Indian Railways, IRCTC, or the Government of India.
        </p>

        <p className="mt-4 text-xs">
          &copy; {new Date().getFullYear()} RailTimer. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
