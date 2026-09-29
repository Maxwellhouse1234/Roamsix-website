export const GUEST_PASS_DEFINITION = 'Guest places for eligible ROAMSIX member experiences, subject to capacity and event-specific rules.';

export const EXTRA_COST_EXPLANATION = 'If offered, the larger member gathering is reserved separately and has its own ticket price. It proceeds only after its cash costs are covered. The year-end Journey is purchased separately by every traveler and proceeds only after the required deposits and minimum participation are secured. Some partner-hosted or premium experiences may have their own price, which will be stated before booking.';

export const MEMBERSHIP_TIERS = {
  core: {
    name: 'Core',
    price: '$850',
    priceLabel: '$850 for the first year',
    forWhom: 'For the person who is tired of evaluating every health claim alone.',
    features: [
      '36 gatherings in 2027: 18 fireside conversations, 18 movement and nature mornings',
      'Every gathering included at no extra cost',
      'Recordings and resources where speaker permissions allow',
      '2 guest passes',
      'Member booking priority',
    ],
    note: 'Billed annually. Founding rate held for as long as your membership stays active. Standard rate in 2027 is $1,100.',
    cta: 'Join Core · $850/year',
  },
  field: {
    name: 'Field',
    price: '$2,200',
    priceLabel: '$2,200 for the first year',
    forWhom: 'For the person with specific questions who wants time with the experts.',
    includes: 'Everything in Core, plus:',
    features: [
      '4 small-group sessions with specialists, capped for real conversation',
      'Earlier booking on every limited-capacity gathering',
      '4 guest passes',
    ],
    note: 'Field begins with a short conversation so we can hold the access the tier promises.',
    cta: 'Apply for Field',
  },
  journey: {
    name: 'Journey',
    price: '$4,500',
    priceLabel: '$4,500 for the first year',
    forWhom: 'For the person who wants the experts working on their questions, not only answering them in a room.',
    includes: 'Everything in Field, plus:',
    features: [
      'First access to every gathering before it opens more widely',
      'Personal briefings on the subjects you are working through',
      'Two specialist introductions per year',
      'First opportunity to join the year-end Journey before it opens to other members. Purchased separately.',
      '6 guest passes',
    ],
    cta: 'Apply for Journey',
  },
};

export const MEMBERSHIP_GUEST_PASSES = { Core: 2, Field: 4, Journey: 6, Private: 'By arrangement' };
