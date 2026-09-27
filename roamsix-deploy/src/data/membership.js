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
    forWhom: 'You want one trusted place to make sense of health information, stay current, and take part throughout the year without needing closer or more personalized access.',
    summary: 'Replace scattered searching with a trusted rhythm of learning and experiences that helps you make more confident choices.',
    signatureBenefit: '36 planned ROAMSIX experiences · Eligible recordings and resources · 4 guest passes',
    features: [
      { title: '36 planned ROAMSIX experiences in 2027', copy: 'Member access to 18 mixers and fireside conversations, plus 18 movement or nature mornings, subject to capacity and the published calendar.' },
      { title: 'Keep learning when you cannot attend', copy: 'Recordings of eligible fireside conversations when speaker and media rights permit, plus practical notes, selected clips, and action cards.' },
      { title: 'A trusted local guide', copy: 'Curated farms, studios, makers, practitioners, and places worth knowing, with partner benefits added only after they are confirmed.' },
      { title: 'Bring someone with you', copy: 'Four eligible guest passes each membership year.' },
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
    forWhom: 'You want everything in Core, plus four smaller-group expert sessions, earlier booking, and more opportunities to bring your own questions into the room.',
    summary: 'Move from listening to participating, with direct opportunities to ask questions and more reliable access to limited-capacity experiences.',
    signatureBenefit: 'Everything in Core · 4 smaller expert sessions · Priority booking · 8 guest passes',
    features: [
      { title: 'Everything included with Core', copy: 'The planned ROAMSIX calendar, eligible recordings and resources, and the local discovery guide.' },
      { title: 'Four smaller expert sessions', copy: 'A quarterly smaller-group expert conversation or Q&A session each membership year, with more room for member questions.' },
      { title: 'Earlier access to limited rooms', copy: 'Priority RSVP windows before Core booking opens where capacity is limited.' },
      { title: 'More opportunities to share it', copy: 'Eight eligible guest passes each membership year, plus expanded partner offers when contracted.' },
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
    forWhom: 'You want ROAMSIX to help curate a more personal path, with first access to the smallest experiences, priority questions and introductions, and support planning the year-end Journey.',
    summary: 'Experience ROAMSIX at its most personal, with the earliest access, more tailored guidance, and a clearer path through the year.',
    signatureBenefit: 'Everything in Field · First access · Personalized briefings · 12 guest passes',
    features: [
      { title: 'Everything included with Field', copy: 'All Core experiences and resources, four smaller expert sessions, and priority booking.' },
      { title: 'First access to the smallest experiences', copy: 'The earliest booking opportunity for the most limited-capacity ROAMSIX experiences.' },
      { title: 'A more personally curated path', copy: 'Requested briefings on priority themes, plus priority handling of expert questions and relevant introductions when appropriate.' },
      { title: 'First opportunity to plan the Journey', copy: 'Early reservation access and planning support for the separately priced year-end Journey, plus twelve eligible guest passes each membership year.' },
    ],
  },
};

export const MEMBERSHIP_GUEST_PASSES = { Core: 4, Field: 8, Journey: 12, Private: 'By arrangement' };
