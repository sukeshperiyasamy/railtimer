import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-4 h-9 w-3/4" />
      <Skeleton className="mt-3 h-5 w-full max-w-lg" />

      <Skeleton className="mt-8 h-64 w-full rounded-md" />

      <div className="mt-10 space-y-3">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    </div>
  );
}
