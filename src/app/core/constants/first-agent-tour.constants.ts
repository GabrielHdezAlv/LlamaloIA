/** Evita repetir el tour en la misma sesión de navegador hasta cerrar sesión. */
export const FIRST_AGENT_TOUR_SESSION_KEY = 'llamalo_first_agent_tour_shown_session';

/** Tras las animaciones del home (panel Bienvenido y resto de fades). */
export const FIRST_AGENT_TOUR_HOME_READY_KEY = 'llamalo_first_agent_tour_home_ready';

/** Se marca al abrir el modal «Bienvenido a tu plan»; exige aceptación antes del tour. */
export const PLAN_CELEBRATION_REQUIRED_KEY = 'llamalo_plan_celebration_required';

/** Usuario pulsó «Volver al dashboard» en el modal de celebración del plan. */
export const PLAN_CELEBRATION_ACCEPTED_KEY = 'llamalo_plan_celebration_accepted';

export function firstAgentTourSkippedKey(userId: string): string {
  return `llamalo_first_agent_tour_skipped_${userId}`;
}
