import type { FaqItem } from "@/lib/train-faq";

interface RouteFaqInput {
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  trainCount: number;
  fastestDuration: string | null;
  fastestTrainLabel: string | null;
}

/** Per-route FAQ set — real facts (train count, fastest train) woven in, not templated filler. */
export function buildRouteFaqs(route: RouteFaqInput): FaqItem[] {
  return [
    {
      question: `How many trains run from ${route.fromName} to ${route.toName}?`,
      answer: `There ${route.trainCount === 1 ? "is" : "are"} ${route.trainCount} train${
        route.trainCount === 1 ? "" : "s"
      } running directly from ${route.fromName} (${route.fromCode}) to ${route.toName} (${route.toCode}) in our database. See the full list above, each linking to its schedule and Current Booking Calculator.`,
    },
    {
      question: `What is the fastest train from ${route.fromName} to ${route.toName}?`,
      answer:
        route.fastestTrainLabel && route.fastestDuration
          ? `${route.fastestTrainLabel} is the fastest direct train on this route in our database, covering it in about ${route.fastestDuration}.`
          : `Check the train list above, sorted by departure time — duration is shown for each train so you can compare.`,
    },
    {
      question: `Is there a direct train from ${route.fromName} to ${route.toName}?`,
      answer:
        route.trainCount > 0
          ? `Yes — ${route.trainCount} train${route.trainCount === 1 ? " runs" : "s run"} directly between these two stations without needing to change trains.`
          : `We don't have a direct train on this exact route in our database yet — try searching for trains from ${route.fromName} or to ${route.toName} separately.`,
    },
    {
      question: "When does current booking open for trains on this route?",
      answer:
        "It depends on each train's own scheduled departure — current booking always opens 30 minutes before departure. Open any train below and use its Current Booking Calculator for the exact time and a live countdown.",
    },
  ];
}
