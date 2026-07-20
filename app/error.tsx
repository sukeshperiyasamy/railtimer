"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Vercel captures console.error output from server/client error
    // boundaries in its logs — this is our error signal until a dedicated
    // error-tracking service is wired up.
    console.error("[RailTimer] Unhandled error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </span>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mt-3 text-muted-foreground">
        This is on us, not you — an unexpected error stopped this page from loading. Try
        again, or head back home.
      </p>

      <div className="mt-6 flex gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Return home
        </Link>
      </div>

      {error.digest ? (
        <p className="mt-6 text-xs text-muted-foreground">Error reference: {error.digest}</p>
      ) : null}
    </div>
  );
}
