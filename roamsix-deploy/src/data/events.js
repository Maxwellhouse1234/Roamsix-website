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
      "A Father's Day weekend experience for people carrying real responsibility who want to stay strong, healthy, and present for the long run.",
      "Hosted on a private farmstead in Warner Springs, the evening brings together outdoor movement, guided recovery, pasture-to-table food, practical conversations around longevity and vitality, and time away from the pace most people live at every day.",
      "Built around good food, open land, honest conversation, and people who are quietly doing the work of living well.",
    ],
    highlights: [
      "Outdoor movement and activity",
      "Guided recovery session",
      "Natural elixir mocktail flight",
      "Pasture-to-table chef dinner",
      "Sunset hike overlooking the valley",
      "Fireside gathering under the stars",
    ],
    conversations: [
      "How high performers protect energy over decades",
      "Recovery beyond sleep and supplements",
      "Practical approaches to longevity and vitality",
      "Family, work, health, and sustaining performance for the long run",
      "New perspectives from people navigating similar challenges",
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
        description: "A private gathering for people who want to stay strong, healthy, and fully engaged in life for decades to come.",
        includes: [
          "Outdoor movement and activity",
          "Guided recovery session",
          "Natural elixir mocktail flight",
          "One glass of local organic sustainably farmed wine from an independent family farm",
          "Pasture-to-table chef dinner featuring local ingredients",
          "Sunset hike overlooking the valley",
          "Fireside gathering under the stars",
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
