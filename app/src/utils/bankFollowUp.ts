const MAX_BANK_FOLLOW_UP_DELAY_MS = 24 * 60 * 60 * 1000;

export const getAdminBankFollowUpDueIso = (submittedAt: string | number | Date = new Date()) => {
  const parsedSubmittedAt = new Date(submittedAt);
  const submitted = Number.isNaN(parsedSubmittedAt.getTime()) ? new Date() : parsedSubmittedAt;
  const nextDayAtEleven = new Date(submitted);
  nextDayAtEleven.setDate(nextDayAtEleven.getDate() + 1);
  nextDayAtEleven.setHours(11, 0, 0, 0);

  const latestAllowed = new Date(submitted.getTime() + MAX_BANK_FOLLOW_UP_DELAY_MS);
  return new Date(Math.min(nextDayAtEleven.getTime(), latestAllowed.getTime())).toISOString();
};
