import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { LoggerProvider, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import type { Logger } from "@opentelemetry/api-logs";

declare global {
  var __posthogLogger: Logger | undefined;
}

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const exporter = new OTLPLogExporter({
      url: "https://us.i.posthog.com/otlp/v1/logs",
      headers: {
        Authorization: "Bearer phc_kGvxvcThsXVvR2iyGGxXiDnmyNhx2TpHMssg7K78dXUn",
      },
    });

    const loggerProvider = new LoggerProvider({
      resource: resourceFromAttributes({
        "service.name": "my-nextjs-app",
      }),
      processors: [new SimpleLogRecordProcessor({ exporter })],
    });

    // make the logger available globally
    globalThis.__posthogLogger = loggerProvider.getLogger("my-nextjs-app");
  }
}
