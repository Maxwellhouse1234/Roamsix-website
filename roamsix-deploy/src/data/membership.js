export const GUEST_PASS_DEFINITION = 'Guest places for eligible ROAMSIX member experiences, subject to capacity and event-specific rules.';

export const EXTRA_COST_EXPLANATION = 'If offered, the larger member gathering is reserved separately and has its own ticket price. It proceeds only after its cash costs are covered. The year-end Journey is purchased separately by every traveler and proceeds only after the required deposits and minimum participation are secured. Some partner-hosted or premium experiences may have their own price, which will be stated before booking.';

export const MEMBERSHIP_TIERS = {
  core: {
    name: 'Core',
    price: '$900',
    forWhom: 'For staying connected while choosing the experiences that matter most to you.',
    summary: 'A consistent way to follow the calendar, learn across connected areas of health, and return when the timing is right.',
    features: [
      'Access to the developing member calendar',
      'Mixers, fireside conversations, and movement or nature sessions when offered',
      'Practical notes, selected clips, recaps, and the local discovery guide',
      'Four eligible guest passes',
    ],
  },
  field: {
    name: 'Field',
    price: '$2,200',
    forWhom: 'For participating more often and having regular access to smaller-group conversations.',
    summary: 'Everything in Core, with earlier access where it matters and four smaller-group expert conversations across each membership year.',
    features: [
      'Everything included with Core',
      'Priority RSVP and earlier booking where a booking window applies',
      'Four smaller-group expert Q&A sessions or conversations across each membership year',
      'Expanded offers from contracted partners when available',
      'Eight eligible guest passes',
    ],
  },
  journey: {
    name: 'Journey',
    price: '$4,500',
    forWhom: 'For making ROAMSIX a regular part of your year and receiving the highest level of access.',
    summary: 'Everything in Field, with first access to limited-capacity opportunities and closer planning support.',
    features: [
      'Everything included with Field',
      'First access to limited-capacity experiences',
      'Priority for relevant expert questions and introductions when appropriate',
      'First access and planning concierge for the separately priced year-end Journey',
      'Twelve eligible guest passes',
    ],
  },
};

export const MEMBERSHIP_GUEST_PASSES = { Core: 4, Field: 8, Journey: 12, Private: 'By arrangement' };
