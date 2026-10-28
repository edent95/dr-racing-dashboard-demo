// Delivery checklist steps that must be done before Mark Bike Delivered
// (owner meeting 2026-10-13, decision 2026-10-16: the checklist gates
// delivery, old deals included). Plain ESM so server.mjs and the client read
// one list; firestore.rules `isDeliveryChecklistReady` repeats it, and
// tests/firestore/delivery-checklist.test.ts checks the two agree.
export const DELIVERY_STEPS_BEFORE_DELIVERY = [
  'full_loan_check',
  'collect_payment',
  'motor_order',
  'arrival_check',
  'k1',
  'insurance',
  'jpj_registration',
  'print_agreement',
  'customer_contact',
  'customer_sign',
  // Owner 2026-10-18: Operations double-checks the figures before delivery.
  'ops_check'
];

/** Step keys before delivery that are still open on a customer document. */
export function getOpenDeliveryStepsBeforeDelivery(deliveryChecklist) {
  const steps = (deliveryChecklist && typeof deliveryChecklist === 'object' && deliveryChecklist.steps) || {};
  return DELIVERY_STEPS_BEFORE_DELIVERY.filter((key) => !(steps[key] && steps[key].done_at));
}
