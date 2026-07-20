interface TrainFaqInput {
  trainNumber: string;
  trainName: string;
  departureTime: string | null;
  sourceStation: string;
  destStation: string;
  duration: string | null;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Per-train FAQ set — real facts woven in, not templated filler. */
export function buildTrainFaqs(train: TrainFaqInput): FaqItem[] {
  const label = `${train.trainNumber} ${train.trainName}`;
  const isPremium = /rajdhani|duronto|shatabdi|vande bharat/i.test(train.trainName);

  return [
    {
      question: `When does Current Booking open for ${train.trainNumber}?`,
      answer: `Current booking for ${label} opens once the final chart is prepared — always 30 minutes before its scheduled departure${
        train.departureTime ? ` at ${train.departureTime}` : ""
      }. Use the calculator above, already filled in for this train, to see the exact time and a live countdown for your journey date.`,
    },
    {
      question: "How many hours before departure is chart prepared?",
      answer:
        "Under the current Railway Board rule, the first chart is prepared 10 hours before departure, or the previous night at 8:00 PM if the train departs between 5:00 AM and 2:00 PM. The calculator above applies this automatically based on the scheduled departure time.",
    },
    {
      question: "Can I book after chart preparation?",
      answer:
        "Yes — once the final chart is prepared, 30 minutes before departure, any berths freed up by cancellations go back on sale through current booking, either on IRCTC where enabled or at the station's current booking counter.",
    },
    {
      question: "What happens if seats remain vacant?",
      answer: `If seats on ${label} are still vacant after the final chart, they generally stay bookable through current booking right up to departure, subject to availability at the station you're boarding from.`,
    },
    {
      question: `Is ${train.trainNumber} usually heavily waitlisted?`,
      answer: isPremium
        ? `${label} is a premium, fully air-conditioned service, so it tends to see heavier waitlists, especially around festivals and long weekends — current-booking availability can be tight.`
        : `Demand on ${label} varies by season, with the heaviest waitlists typically around festivals, exam results, and long weekends.`,
    },
    {
      question: `Where does ${train.trainNumber} run between ${train.sourceStation} and ${train.destStation}?`,
      answer: `${label} runs from ${train.sourceStation} to ${train.destStation}${
        train.duration ? `, covering the route in about ${train.duration}` : ""
      }. See the full station-by-station schedule and route timeline on this page.`,
    },
  ];
}
