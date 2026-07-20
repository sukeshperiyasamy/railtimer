import Link from "next/link";
import { Clock } from "lucide-react";

interface ComingSoonNoticeProps {
  toolName: string;
}

export function ComingSoonNotice({ toolName }: ComingSoonNoticeProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-md border border-dashed border-border bg-muted/40 p-4">
      <Clock className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="flex-1 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{toolName} is coming soon.</span>{" "}
        In the meantime, the Current Booking Calculator already covers chart preparation
        timing for any train.
      </p>
      <Link
        href="/tools/current-booking-calculator"
        className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Try it now
      </Link>
    </div>
  );
}
