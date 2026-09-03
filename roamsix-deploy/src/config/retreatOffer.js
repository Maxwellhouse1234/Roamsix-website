/** @typedef {'discovery'|'preview_open'|'applications_open'|'direct_sale_open'|'sold_out'|'closed'|'completed'} OfferStatus */

/**
 * The single source of truth for the first ROAMSIX retreat.
 * Keep discovery as the default until every commercial field is approved.
 */
export const retreatOffer = {
  slug: 'microbiome-in-practice',
  /** @type {OfferStatus} */
  offerStatus: 'discovery',
  name: 'The Microbiome in Practice',
  eyebrow: 'Upcoming immersive retreat',
  audience:
    'People working across health, wellness, fitness, food, and human performance who want to understand the microbiome as a connected system, not an isolated topic.',
  problem:
    'Gut health is discussed everywhere, but usually one fragment at a time. Food, movement, stress, sleep, recovery, and the living systems that produce our food are rarely experienced as parts of the same story.',
  outcome:
    'Follow the microbiome from soil to food to human performance, then leave with a more connected understanding of what supports it and how that knowledge may inform your own work.',
  expert: undefined,
  startDate: undefined,
  endDate: undefined,
  location: 'Southern California',
  capacity: undefined,
  priceCents: undefined,
  depositCents: undefined,
  decisionDate: undefined,
  included: [],
  excluded: [],
  refundTermsUrl: '/terms',
};
