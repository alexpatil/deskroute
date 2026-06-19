// lib/trial.ts
// Trial duration: 14 days.
export const TRIAL_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

/** The trial-end timestamp for a brand-new organization. */
export function trialEndDate(): Date {
  return new Date(Date.now() + TRIAL_DURATION_MS);
}

export interface TrialStatus {
  active: boolean;
  expired: boolean;
  daysLeft: number;
}

/**
 * Derive trial state from an end date. A null/undefined date is treated as
 * expired. `trialEndsAt` may be a Date (server) or an ISO string (from JSON).
 */
export function getTrialStatus(trialEndsAt: Date | string | null | undefined): TrialStatus {
  if (!trialEndsAt) return { active: false, expired: true, daysLeft: 0 };
  const end = trialEndsAt instanceof Date ? trialEndsAt : new Date(trialEndsAt);
  const diff = end.getTime() - Date.now();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return {
    active: daysLeft > 0,
    expired: daysLeft <= 0,
    daysLeft: Math.max(0, daysLeft),
  };
}
