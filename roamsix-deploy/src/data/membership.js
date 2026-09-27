export const GUEST_PASS_DEFINITION = 'Guest places for eligible ROAMSIX member experiences, subject to capacity and event-specific rules.';

export const EXTRA_COST_EXPLANATION = 'If offered, the larger member gathering is reserved separately and has its own ticket price. It proceeds only after its cash costs are covered. The year-end Journey is purchased separately by every traveler and proceeds only after the required deposits and minimum participation are secured. Some partner-hosted or premium experiences may have their own price, which will be stated before booking.';

export const MEMBERSHIP_TIERS = {
  core: {
    name: 'Core',
    price: '$850',
    monthlyEquivalent: '$75',
    monthlyEquivalentLabel: 'per month',
    monthlyBilling: '$75 billed monthly',
    annualBilling: '$850 billed annually',
    annualSavings: 'Save $50 with annual billing',
    forWhom: 'People who want clarity without chasing every health trend. You want credible guidance, a better sense of what matters for you, and practical ways to use what you learn.',
    summary: 'A trusted starting point for understanding your health more clearly and choosing the experiences that can move you forward.',
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
    monthlyEquivalentLabel: 'per month',
    monthlyBilling: '$185 billed monthly',
    annualBilling: '$2,200 billed annually',
    annualSavings: 'Save $20 with annual billing',
    forWhom: 'People who want to go deeper, ask better questions, and learn in smaller settings where expert perspective becomes more personal and useful.',
    summary: 'More direct access, more room for your questions, and perspectives that can change how you understand your health and potential.',
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
    monthlyEquivalentLabel: 'per month',
    monthlyBilling: '$395 billed monthly',
    annualBilling: '$4,500 billed annually',
    annualSavings: 'Save $240 with annual billing',
    forWhom: 'People who want the fullest ROAMSIX experience, with rare access, unforgettable settings, and immersive moments designed to shift perspective.',
    summary: 'The deepest level of access for experiences that renew possibility, create lasting clarity, and stay with you long after they end.',
    features: [
      { title: 'Everything in Field', copy: 'All Core and Field learning, access, and booking benefits.' },
      { title: 'First access', copy: 'Priority consideration for the most limited-capacity ROAMSIX experiences.' },
      { title: 'Relevant introductions', copy: 'Priority for expert questions and trusted introductions when appropriate.' },
      { title: 'Journey planning', copy: 'First access and planning support for the separately priced year-end Journey, plus twelve eligible guest passes.' },
    ],
  },
};

export const MEMBERSHIP_GUEST_PASSES = { Core: 4, Field: 8, Journey: 12, Private: 'By arrangement' };
