// HIGH OUTPUT event data
export const events = [
  {
    id: "high-output-long-game",
    title: "HIGH OUTPUT: THE LONG GAME",
    subtitle: "Father's Day Weekend",
    date: "2026-06-20T15:00:00-07:00",
    location: "Warner Springs, San Diego County",
    locationDetail: "Private farmstead, Warner Springs CA",
    modalTitle: "THE LONG GAME EXPERIENCE",
    venueName: "Birdsong Backcountry Retreat",
    cityState: "Warner Springs, California",
    timeRange: "3:00 PM - 9:00 PM",
    description:
      "A pasture-to-table dinner on a private farmstead in Warner Springs. Saturday evening, June 20th. Limited to 20 guests.",
    body: [
      "A Father's Day weekend evening at Birdsong Ranch. Pasture-to-table dinner, open land, and the kind of conversation that happens when the setting finally feels right. Saturday June 20th. Limited to 20 guests.",
    ],
    menu: {
      label: "THE MENU",
      sublabel: "Pasture to Table, Family Style",
      items: [
        "Romaine Leaf with Marinated Heirloom Tomatoes, Armenian Cucumbers, Spring Shallots, Citrus Vinaigrette",
        "Organic Whole Bird braised with Fennel, Citrus, Spring Shallots, and Farm Carrots",
        "Coffee Crusted Picanha and Skirt Steak",
        "Handmade Andouille Chicken Sausage",
        "Grilled Bok Choy, Farm Carrots, and Green Garlic",
        "Roasted New Potatoes in Herbed Gremolata",
        "Cider Vinegar Braised Cabbage and Apples",
        "Beet Root Hummus",
        "Organic Local Wine and Mocktails",
      ],
    },
    highlights: [
      "Pasture-to-table chef dinner",
      "Local wine from an independent family farm",
      "Outdoor movement and recovery session",
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
          "Pasture-to-table chef dinner",
          "Local wine from an independent family farm",
          "Outdoor movement and recovery session",
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
