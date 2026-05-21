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
      "A Father's Day weekend experience built for men, fathers, couples, founders, and professionals who carry responsibility for the long run. Movement, recovery, farm-to-table dinner, and real conversation on open land.",
    body: [
      "A Father's Day weekend experience focused on staying strong, healthy, sharp, and capable for the long run. Built for men, fathers, couples, founders, and professionals who spend most of their lives carrying responsibility, solving problems, and staying in motion.",
      "The experience combines movement, recovery, practical conversation, and a farm-to-table dinner sourced from local farms and pasture-raised producers.",
      "Afternoon and evening includes guided fieldcraft and land orientation, breathwork and recovery practices, conversations around hormones, sleep, stress, recovery, and long-term performance, a chef-prepared pasture-to-table dinner, a lantern sunset hike overlooking the valley, and a fireside discussion around fatherhood, work, health, relationships, and sustaining high output without burning yourself out.",
      "No ballroom. No presentations. No packed conference schedule. Just good food, strong people, open land, and real conversation.",
    ],
    highlights: [
      "Guided fieldcraft and land orientation",
      "Breathwork and recovery practices",
      "Conversations around hormones, sleep, stress, recovery, and long-term performance",
      "Chef-prepared pasture-to-table dinner",
      "Lantern sunset hike overlooking the valley",
      "Fireside discussion: fatherhood, work, health, and sustaining high output",
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
        description:
          "Full afternoon access with fieldcraft, educational sessions, refreshments, and artisan vendor access.",
        includes: [
          "Fieldcraft and orientation challenge",
          "Refreshments",
          "Educational sessions",
          "Artisan and vendor access",
        ],
        stripePriceId: "",
        bundleOffer: "Father's Day offer: Bring your father, son, or a friend at no additional cost.",
        bundlePrice: null,
        bundleStripePriceId: null,
      },
      {
        id: "long-game",
        name: "THE LONG GAME EXPERIENCE",
        price: 22500,
        capacity: 20,
        description:
          "Full event access with guided recovery, chef dinner, sunset hike, fireside discussion, and curated gift bag.",
        includes: [
          "Full event access",
          "Guided recovery session",
          "Pasture-to-table chef dinner",
          "Fireside discussion",
          "Lantern sunset hike",
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
        price: 27500,
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
