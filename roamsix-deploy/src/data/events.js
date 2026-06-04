// HIGH OUTPUT event data
export const events = [
  {
    id: "high-output-long-game",
    title: "HIGH OUTPUT: THE LONG GAME",
    subtitle: "A Father's Day Weekend Experience",
    date: "2026-06-20T15:00:00-07:00",
    location: "Warner Springs, San Diego County",
    locationDetail: "Private farmstead, Warner Springs CA",
    modalTitle: "THE LONG GAME EXPERIENCE",
    venueName: "Birdsong Backcountry Retreat",
    cityState: "Warner Springs, California",
    timeRange: "3:00 PM - 9:00 PM",
    description:
      "A Father's Day weekend experience for men, fathers, couples, and people carrying a lot of responsibility. Movement, recovery, pasture-to-table food, and real conversation on open land.",
    body: [
      "A Father's Day weekend gathering for people who care about their health, their relationships, and how they show up for the people who matter most.",
      "Hosted on a private farmstead in Warner Springs, the evening brings together outdoor movement, guided recovery, natural elixirs, pasture-to-table food, and a practical conversation around nutrition, longevity, and sustainable health.",
      "Good food. Open land. A slower evening. The kind of conversation that is easier to have when the setting finally feels right.",
    ],
    highlights: [
      "Outdoor movement and activity",
      "Guided recovery session",
      "Natural elixir mocktail flight",
      "One glass of wine from a local independent family farm",
      "Pasture-to-table chef dinner featuring locally sourced ingredients",
      "Sunset walk overlooking the valley",
      "Evening gathering under the open sky",
      "Curated gift bag",
    ],
    image: "/images/events/high-output-long-game.webp",
    status: "open",
    stripeEnabled: true,
    packages: [
      {
        id: "long-game",
        name: "THE LONG GAME EXPERIENCE",
        price: 22500,
        capacity: 20,
        description: "An evening built around sustainable nutrition, local food, movement, recovery, and thoughtful conversation.",
        includes: [
          "Outdoor movement and recovery",
          "Natural elixir mocktail flight",
          "Local wine from an independent family farm",
          "Pasture-to-table chef dinner",
          "Sunset walk overlooking the valley",
          "Evening gathering under the open sky",
          "Curated gift bag",
        ],
        stripePriceId: "price_1TZcsLLgUPmdquZorxSlweXQ",
        bundleOffer: null,
        bundlePrice: null,
        bundleStripePriceId: null,
      },
    ],
  },
];

export function getEventById(id) {
  return events.find((e) => e.id === id) || null;
}

export function getUpcomingEvents(count = 2) {
  const now = new Date();
  return events
    .filter((e) => new Date(e.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, count);
}
