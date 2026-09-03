const STATES = {
  discovery: {
    label: 'Get retreat updates',
    href: '/first-retreat#interest',
    message: 'Dates, location, pricing, and the complete faculty will be shared when booking opens. Join the update list to receive the details first.',
  },
  preview_open: {
    label: 'Register for the preview',
    href: '/first-retreat#interest',
    message: 'Registration for the preview session is open.',
  },
  applications_open: {
    label: 'Apply for the founding cohort',
    href: '/first-retreat/apply',
    message: 'Applications for the founding cohort are open.',
  },
  direct_sale_open: {
    label: 'Reserve your place',
    href: '/first-retreat/apply',
    message: 'The complete offer is available and reservations are open.',
  },
  sold_out: {
    label: 'Join the waitlist',
    href: '/first-retreat#interest',
    message: 'Current capacity has been reached. Join the waitlist for verified availability updates.',
  },
  closed: { label: null, href: null, message: 'Registration is closed.' },
  completed: { label: null, href: null, message: 'This experience is complete.' },
};

export function resolveOfferState(status) {
  return STATES[status] || STATES.discovery;
}

export function hasApprovedCommercialOffer(offer) {
  return Boolean(
    offer.expert &&
      offer.startDate &&
      offer.capacity &&
      offer.priceCents &&
      offer.depositCents &&
      offer.included.length &&
      offer.excluded.length,
  );
}
