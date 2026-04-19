/**
 * Email interno permitido para probar flujos (subscribe-required, company-setup)
 * aunque la cuenta no cumpla la condición normal.
 */
export const QA_TEAM_BYPASS_EMAIL = 'development.team@llamalo.ai';

export function isQaTeamBypassEmail(
  email: string | null | undefined,
): boolean {
  return (email?.trim().toLowerCase() ?? '') === QA_TEAM_BYPASS_EMAIL;
}
