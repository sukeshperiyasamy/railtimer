import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        RailTimer
      </h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Layout shell scaffold (header, footer, ad slot, design tokens). The
        homepage search, featured trains, and explainer content ship in the
        next build step.
      </p>

      <p className="mt-4 max-w-xl text-sm text-muted-foreground">
        Available now:{" "}
        <Link
          href="/tools/chart-time-calculator"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Chart Preparation Time Calculator
        </Link>{" "}
        — find out exactly when your train&apos;s chart is prepared and current
        booking opens.
      </p>

      <div className="mt-8">
        <AdSlot slot="placeholder-banner" format="banner" />
      </div>
    </div>
  );
}
