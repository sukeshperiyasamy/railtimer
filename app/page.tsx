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

      <div className="mt-8">
        <AdSlot slot="placeholder-banner" format="banner" />
      </div>
    </div>
  );
}
