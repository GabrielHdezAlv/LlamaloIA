/**
 * DTO para actualización de perfil
 * Campos opcionales para actualizar el perfil
 */
import { ACCOUNT_STATUS } from './account-status.enum';
import { USER_ROLE } from './user-role.enum';

export interface UpdateProfileDto {
  name?: string;
  lastname?: string;
  profileImage?: string;
  enterprise?: { name: string; url: string };
  country?: string; // ✅ NUEVO - Opcional
  marketingConsent?: boolean; // ✅ NUEVO - Opcional
  accountStatus?: number; // ⬅️ NUEVO: Opcional (0 = Inactivo, 1 = Activo, 2 = Eliminado, 3 = No validado)
  rol?: USER_ROLE; // ⬅️ NUEVO: Opcional (owner/client_user)
  hasCompletedSetup?: boolean;
  /** Tour primer agente omitido; se persiste en Firestore. */
  firstAgentTourSkipped?: boolean;
  /** IDs seleccionados en onboarding: «Qué quieres conseguir con Llamalo» */
  onboardingGoals?: string[];
  /** IDs seleccionados en onboarding: «Cómo nos conociste» */
  onboardingDiscoveryChannels?: string[];
  /** Último paso del onboarding que el usuario ha visitado */
  lastOnboardingStep?: number;
  /** IANA: semanas/meses de negocio en métricas del panel (p. ej. Europe/Madrid) */
  metricsCalendarTimezone?: string;
}
