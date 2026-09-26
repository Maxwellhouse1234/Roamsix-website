export const GUEST_PASS_DEFINITION = 'Guest places for eligible ROAMSIX member experiences, subject to capacity and event-specific rules.';

export const EXTRA_COST_EXPLANATION = 'If offered, the larger member gathering is reserved separately and has its own ticket price. It proceeds only after its cash costs are covered. The year-end Journey is purchased separately by every traveler and proceeds only after the required deposits and minimum participation are secured. Some partner-hosted or premium experiences may have their own price, which will be stated before booking.';

export const MEMBERSHIP_TIERS = {
  core: {
    name: 'Core',
    price: '$850',
    monthlyEquivalent: '$75',
    monthlyEquivalentLabel: 'planned monthly',
    annualBilling: '$850 billed annually · available now',
    forWhom: 'People who want a trusted way to keep up with what matters in health and choose experiences selectively.',
    summary: 'The essential ROAMSIX layer for clearer guidance, member access, and practical ways to act on what you learn.',
    features: [
      { title: 'Vetted guidance', copy: 'Member access to the developing calendar of doctors, practitioners, specialists, and educators.' },
      { title: 'Learning you can use', copy: 'Practical notes, selected clips, recaps, and the local discovery guide.' },
      { title: 'Experiences beyond the lecture', copy: 'Fireside conversations, movement, nature, and member mixers when offered.' },
      { title: 'Share the experience', copy: 'Four eligible guest passes.' },
    ],
  },
  field: {
    name: 'Field',
    price: '$2,200',
    monthlyEquivalent: '$185',
    monthlyEquivalentLabel: 'planned monthly',
    annualBilling: '$2,200 billed annually',
    forWhom: 'People who want deeper access to experts and smaller-format learning throughout the year.',
    summary: 'Core access plus four small-group expert sessions and earlier access to limited-capacity experiences.',
    features: [
      { title: 'Everything in Core', copy: 'All Core learning, calendar access, and member experiences.' },
      { title: 'Closer expert access', copy: 'Four smaller-group expert conversations or Q&A sessions each membership year.' },
      { title: 'Earlier booking', copy: 'Priority RSVP windows where capacity is limited.' },
      { title: 'More ways to participate', copy: 'Expanded partner offers when available and eight eligible guest passes.' },
    ],
  },
  journey: {
    name: 'Journey',
    price: '$4,500',
    monthlyEquivalent: '$395',
    monthlyEquivalentLabel: 'planned monthly',
    annualBilling: '$4,500 billed annually',
    forWhom: 'People who want the fullest ROAMSIX experience and first access to the most immersive opportunities.',
    summary: 'Field access plus first consideration for limited-capacity experiences, relevant expert introductions, and Journey planning.',
    features: [
      { title: 'Everything in Field', copy: 'All Core and Field learning, access, and booking benefits.' },
      { title: 'First access', copy: 'Priority consideration for the most limited-capacity ROAMSIX experiences.' },
      { title: 'Relevant introductions', copy: 'Priority for expert questions and trusted introductions when appropriate.' },
      { title: 'Journey planning', copy: 'First access and planning support for the separately priced year-end Journey, plus twelve eligible guest passes.' },
    ],
  },
};

export const MEMBERSHIP_GUEST_PASSES = { Core: 4, Field: 8, Journey: 12, Private: 'By arrangement' };
