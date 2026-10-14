export function evaluateCheckInEligibility(attendee) {
  if (!attendee) return { code: 'not_found', eligible: false, label: 'Ticket not found' };
  if (attendee.canceled || attendee.paymentStatus === 'refunded') return { code: 'canceled', eligible: false, label: 'Admission canceled' };
  if (attendee.checkedInAt) return { code: 'duplicate', eligible: false, label: 'Already checked in' };
  if (attendee.agreementStatus !== 'accepted') return { code: 'agreement_required', eligible: false, label: 'Agreement incomplete' };
  if (!['paid', 'member-included', 'complimentary'].includes(attendee.paymentStatus)) return { code: 'payment_invalid', eligible: false, label: 'Admission not valid' };
  return { code: 'ready', eligible: true, label: 'Ready to check in' };
}

export function calculateEventRevenue(records, propertyShareRate = 0.2) {
  const transactions = new Map();
  for (const record of records) {
    if (!record.transactionId || transactions.has(record.transactionId)) continue;
    transactions.set(record.transactionId, {
      admissionType: record.transactionAdmissionType || record.admissionType,
      gross: Number(record.grossAmount || 0),
      discount: Number(record.discountAmount || 0),
      refund: Number(record.refundAmount || 0),
    });
  }

  const totals = { individual: 0, pair: 0, memberIncluded: 0, complimentary: 0, gross: 0, discounts: 0, refunds: 0, netCollected: 0, propertyShare: 0 };
  for (const record of records) {
    if (record.admissionType === 'member-included') totals.memberIncluded += 1;
    if (record.admissionType === 'complimentary') totals.complimentary += 1;
  }
  for (const transaction of transactions.values()) {
    if (transaction.admissionType === 'individual') totals.individual += 1;
    if (transaction.admissionType === 'pair') totals.pair += 1;
    totals.gross += transaction.gross;
    totals.discounts += transaction.discount;
    totals.refunds += transaction.refund;
  }
  totals.netCollected = Math.max(0, totals.gross - totals.discounts - totals.refunds);
  totals.propertyShare = Number((totals.netCollected * propertyShareRate).toFixed(2));
  return totals;
}
