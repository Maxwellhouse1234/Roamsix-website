export const PREVIEW_TICKET_ID = 'pv_8K4nR2xQ7mL9cT5w';

export const PREVIEW_ATTENDEES = [
  { id: 'attendee-1', ticketId: PREVIEW_TICKET_ID, attendee: 'General admission', admissionType: 'individual', transactionAdmissionType: 'individual', transactionId: 'txn-individual-1', grossAmount: 50, discountAmount: 0, refundAmount: 0, paymentStatus: 'paid', agreementStatus: 'accepted', photoConsent: 'declined', checkedInAt: null },
  { id: 'attendee-2', ticketId: 'pv_4Jm8Qp2Lw7Nc3VxR', attendee: 'Discounted admission', admissionType: 'individual', transactionAdmissionType: 'individual', transactionId: 'txn-individual-2', grossAmount: 50, discountAmount: 25, refundAmount: 0, paymentStatus: 'paid', agreementStatus: 'accepted', photoConsent: 'permitted', checkedInAt: null },
  { id: 'attendee-3', ticketId: 'pv_6Tf2Wy9Ka4Zp8NqM', attendee: 'Pending agreement', admissionType: 'individual', transactionAdmissionType: 'individual', transactionId: 'txn-individual-3', grossAmount: 50, discountAmount: 0, refundAmount: 0, paymentStatus: 'paid', agreementStatus: 'pending', photoConsent: 'not-answered', checkedInAt: null },
  { id: 'attendee-4', ticketId: 'pv_9Bd5Hs3Xe8Lm2RkQ', attendee: 'Member attendee', admissionType: 'member-included', transactionId: 'txn-member-1', grossAmount: 0, discountAmount: 0, refundAmount: 0, paymentStatus: 'member-included', agreementStatus: 'accepted', photoConsent: 'declined', checkedInAt: null },
  { id: 'attendee-5', ticketId: 'pv_3Rq8Pc6Nt1Vx7KmL', attendee: 'Complimentary attendee', admissionType: 'complimentary', transactionId: 'txn-comp-1', grossAmount: 0, discountAmount: 0, refundAmount: 0, paymentStatus: 'complimentary', agreementStatus: 'accepted', photoConsent: 'permitted', checkedInAt: null },
  { id: 'attendee-6', ticketId: 'pv_2Zn7Fa5Wu9Kc4JmH', attendee: 'Refunded admission', admissionType: 'individual', transactionAdmissionType: 'individual', transactionId: 'txn-refund-1', grossAmount: 50, discountAmount: 0, refundAmount: 50, paymentStatus: 'refunded', agreementStatus: 'accepted', photoConsent: 'permitted', canceled: true, checkedInAt: null },
];

export const AGREEMENT_LAYERS = [
  ['General membership', 'Membership terms and any applicable general agreements, with version history.'],
  ['Event-specific', 'A fresh participation agreement for the October 24 venue, activities and known risks.'],
  ['Venue and vendor', 'Additional acknowledgments only when a venue, activity or vendor requires them.'],
  ['Optional permissions', 'Photography and marketing choices stored separately and never required for attendance.'],
];
