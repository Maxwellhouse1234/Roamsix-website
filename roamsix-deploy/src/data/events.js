// HIGH OUTPUT event data
export const events = [
  {
    id: "high-output-long-game",
    title: "HIGH OUTPUT: THE LONG GAME",
    subtitle: "A Father's Day Weekend Experience",
    date: "2026-06-20T15:00:00-07:00",
    location: "Warner Springs, San Diego County",
    locationDetail: "Private farmstead, Warner Springs CA",
    description:
      "A Father's Day weekend experience for men, fathers, couples, and people carrying a lot of responsibility. Movement, recovery, pasture-to-table food, and real conversation on open land.",
    body: [
      "A Father's Day weekend experience for men, fathers, couples, and people carrying a lot of responsibility.",
      "Hosted on a private farmstead in Warner Springs, the evening brings together movement, recovery, pasture-to-table food, fireside conversation, and time away from the pace most people live at every day.",
      "Built for people trying to stay strong, healthy, capable, and present for the long run.",
      "Built around good food, movement, open land, and honest conversation.",
    ],
    highlights: [
      "Guided outdoor challenge",
      "Breathwork and recovery session",
      "Pasture-to-table chef dinner",
      "Lantern sunset hike",
      "Fireside conversation",
      "Artisan vendors and curated goods",
    ],
    image: "/images/events/high-output-long-game.webp",
    status: "open",
    stripeEnabled: true,
    packages: [
      {
        id: "field-pass",
        name: "FIELD PASS",
        price: 9500,
        capacity: 20,
        description: "Afternoon access. Good people, open land, and something worth doing.",
        includes: [
          "Guided outdoor challenge",
          "Refreshments",
          "Educational sessions",
          "Artisan and vendor access",
        ],
        stripePriceId: "",
        bundleOffer: "Father's Day Offer: Bring your father, son, or a guest at no additional cost.",
        bundlePrice: null,
        bundleStripePriceId: null,
      },
      {
        id: "long-game",
        name: "THE LONG GAME EXPERIENCE",
        price: 22500,
        capacity: 10,
        description: "The full evening. From movement to dinner to fireside conversation under the stars.",
        includes: [
          "Recovery session",
          "Pasture-to-table chef dinner",
          "Lantern sunset hike",
          "Fireside conversation",
          "Curated gift bag",
        ],
        stripePriceId: "",
        bundleOffer: "Couples Bundle: $398 for two",
        bundlePrice: 39800,
        bundleStripePriceId: "",
      },
      {
        id: "private-circle",
        name: "PRIVATE CIRCLE",
        price: 32500,
        capacity: 10,
        description:
          "Limited. Everything in The Long Game Experience plus early arrival, workshops, private session, and priority access to future events.",
        includes: [
          "Early arrival access",
          "Superfood mocktail workshop",
          "Full event access",
          "Guided recovery session",
          "Pasture-to-table chef dinner",
          "Fireside discussion",
          "Lantern sunset hike",
          "Private small-group discussion session",
          "Chef recipe booklet",
          "Expanded gift bag",
          "Priority access to future ROAMSIX experiences",
        ],
        stripePriceId: "",
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
