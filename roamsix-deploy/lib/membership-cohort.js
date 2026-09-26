const DEFAULT_COHORT_ID = "founding";
const DEFAULT_COHORT_LABEL = "Founding Cohort";
const DEFAULT_COHORT_CAPACITY = 25;

function clean(value, max = 100) {
  return String(value || "").trim().slice(0, max);
}

export function activeMembershipCohort() {
  const id = clean(process.env.ACTIVE_MEMBERSHIP_COHORT_ID || DEFAULT_COHORT_ID);
  const label = clean(process.env.ACTIVE_MEMBERSHIP_COHORT_LABEL || (id === DEFAULT_COHORT_ID ? DEFAULT_COHORT_LABEL : id));
  const configuredCapacity = Number(process.env.MEMBERSHIP_COHORT_CAPACITY || DEFAULT_COHORT_CAPACITY);
  const capacity = Number.isInteger(configuredCapacity) && configuredCapacity > 0 ? configuredCapacity : DEFAULT_COHORT_CAPACITY;
  return { id, label, capacity };
}

export function cohortFromMetadata(metadata = {}) {
  const id = clean(metadata.membershipCohortId || metadata.cohortId);
  const label = clean(metadata.membershipCohortLabel || metadata.cohortLabel);
  if (id) return { id, label: label || id };
  if (metadata.enrollmentPhase === "founding" || metadata.purchaseType === "foundingMembership") {
    return { id: DEFAULT_COHORT_ID, label: DEFAULT_COHORT_LABEL };
  }
  return { id: "", label: "" };
}

export function cohortMatches(metadata, cohortId) {
  return cohortFromMetadata(metadata).id === clean(cohortId);
}
