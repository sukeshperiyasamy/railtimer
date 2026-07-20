import { SeverityNumber } from "@opentelemetry/api-logs";

export async function GET() {
  const logger = (globalThis as any).__posthogLogger;
  logger?.emit({
    severityNumber: SeverityNumber.INFO,
    severityText: "INFO",
    body: "API route called",
    attributes: { route: "/api" },
  });
  return Response.json({ ok: true });
}
