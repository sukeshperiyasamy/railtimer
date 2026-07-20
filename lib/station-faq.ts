import type { FaqItem } from "@/lib/train-faq";

interface StationFaqInput {
  code: string;
  name: string;
  trainCount: number;
}

export function buildStationFaqs(station: StationFaqInput): FaqItem[] {
  return [
    {
      question: `Which trains pass through ${station.name} (${station.code})?`,
      answer:
        station.trainCount > 0
          ? `${station.trainCount} train${station.trainCount === 1 ? "" : "s"} in our database currently ${
              station.trainCount === 1 ? "stops" : "stop"
            } at ${station.name} — see the full list below, each linking to its schedule and current booking calculator.`
          : `We don't have trains through ${station.name} in our database yet — check back as we add more routes.`,
    },
    {
      question: `How do I check current booking for a train departing from ${station.name}?`,
      answer: `Open the specific train's page from the list below and use the Current Booking Calculator, pre-filled with that train's scheduled departure from ${station.name} — it shows the exact chart preparation and current booking opening time.`,
    },
    {
      question: `What is the station code for ${station.name}?`,
      answer: `${station.name}'s station code is ${station.code}, used across IRCTC, NTES, and reservation charts to identify the station.`,
    },
  ];
}
