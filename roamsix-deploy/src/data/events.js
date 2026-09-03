// HIGH OUTPUT event data
export const events = [
  {
    id: "olive-grove-dinner",
    title: "AN EVENING IN THE OLIVE GROVES",
    subtitle: "ROAMSIX at Father’s Farmhouse",
    date: "2026-09-19T17:00:00-07:00",
    location: "Winchester, California",
    locationDetail: "Father’s Farmhouse · 31362 Keller Rd, Winchester, CA 92596",
    modalTitle: "AN EVENING IN THE OLIVE GROVES",
    venueName: "Father’s Farmhouse",
    cityState: "Winchester, California",
    timeRange: "Evening · Final arrival time to be confirmed",
    description: "A farm-to-table dinner among the olive groves at Father’s Farmhouse in Winchester.",
    body: [
      "Join us at Father’s Farmhouse in Winchester for a farm-to-table evening hosted among the olive groves. The experience begins with Robert, the farmer behind Father’s Farmhouse, leading guests through the garden and sharing what is growing there.",
      "From the garden, we move to the table. Chef Kaci returns to create the dinner, bringing the same care and generous family-style format she brought to the ROAMSIX table in June.",
    ],
    menu: null,
    highlights: [
      "Farm-to-table dinner in the olive groves",
      "Guided garden tour with Robert",
      "Family-style meal prepared by Chef Kaci",
      "An intentionally small ROAMSIX gathering",
    ],
    image: "/images/events/long-table-dinner-roamsix.jpg",
    status: "open",
    stripeEnabled: true,
    requiresAge21: true,
    promoLabel: "Founder-Guests and Founder-Friends",
    promoHeadline: "Private individual-seat pricing",
    promoText: "Founder-Guests receive 15% off an individual seat or may bring someone for $275. Their friends receive 10% off an individual seat with a unique referral code; the $295 public pair price is already lower than 10% off two individual seats.",
    capacityLabel: "Limited seating in the olive groves",
    packages: [
      {
        id: "olive-grove-dinner",
        name: "OLIVE GROVE DINNER",
        price: 17500,
        capacity: null,
        description: "A garden tour followed by a farm-to-table dinner hosted among the olive groves at Father’s Farmhouse.",
        includes: [
          "Garden tour with Robert",
          "Farm-to-table dinner prepared by Chef Kaci",
          "The full ROAMSIX evening at Father’s Farmhouse",
        ],
        bundleOffer: "Two tickets for $295",
        bundlePrice: 29500,
      },
    ],
  },
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
    requiresAge21: true,
    promoLabel: "Father's Day Weekend",
    promoHeadline: "Two tickets for $398",
    promoText: "Save $52 when you register two guests together.",
    capacityLabel: "Limited to 20 guests",
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
        bundleOffer: "Two tickets for $398",
        bundlePrice: 39800,
        bundleStripePriceId: "price_1TZcsNLgUPmdquZok2C0VstS",
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
