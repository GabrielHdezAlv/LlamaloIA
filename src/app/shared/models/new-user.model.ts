import { ACCOUNT_STATUS } from './account-status.enum';
import { USER_ROLE } from './user-role.enum';

export class User {
  userId?: string;
  name?: string; // Opcional porque puede venir undefined del perfil
  lastname?: string; // Opcional porque puede venir undefined del perfil
  profileImage?: string;
  enterprise?: { name: string; url: string };
  country?: string; // ✅ NUEVO - Opcional
  marketingConsent?: boolean; // ✅ NUEVO - Opcional
  accountStatus?: number; // ⬅️ NUEVO: Opcional (0 = Inactivo, 1 = Activo, 2 = Eliminado, 3 = No validado)
  rol?: USER_ROLE; // ⬅️ NUEVO: Opcional (owner/client_user)
  hasCompletedSetup?: boolean;
  plan?: string; // ⬅️ NUEVO: Plan de suscripción
  minutesLimit?: number; // ⬅️ NUEVO: Límite de minutos asignados al usuario
  extraMinutes?: number; // ⬅️ NUEVO: Minutos extra asignados al usuario
  minutesByMonth?: Record<string, number>; // ⬅️ NUEVO: Historial de minutos por mes (YYYY-MM)
  redeemedRewards?: string[]; // Recompensas canjeadas
  /** Fin del periodo de prueba (7 días), ISO string */
  trialEndsAt?: string | null;
  /** Cliente Stripe (facturación); si existe, cambios de plan vía Customer Portal */
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  /** Estado Stripe: trialing, active, past_due, etc. */
  stripeSubscriptionStatus?: string | null;
  /** false = debe elegir plan o prueba en el flujo de registro */
  planSelectionCompleted?: boolean;
  /** Zona IANA para períodos de métricas en el panel (semana/mes) */
  metricsCalendarTimezone?: string;
  /** Uso vs límites efectivos (API) */
  planUsage?: {
    trialEndsAt: string | null;
    trialActive: boolean;
    effectivePlanSlug: string;
    limits: {
      agents: number;
      indexedUrls: number;
      documentsMax: number;
      storageTotalMb: number;
      maxDocSizeMb: number;
      betaAccess: boolean;
    };
    agentsCount: number;
    webSourcesCount: number;
    docSourcesCount: number;
    storageUsedBytes: number;
  };
  scheduledDeletionDate?: string | null; // Fecha programada para eliminación (ISO string)
  email?: string; // Opcional porque puede venir undefined del perfil
  password?: string; // Opcional porque no viene del perfil del usuario
  token?: string;
  voiceId?: string;
  language?: any;
  // Nuevos campos opcionales
  integrations?: {
    shopify?: Array<{
      connected?: boolean;
      shopDomain?: string;
    }>;
  };
  twilio?: Array<{
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  }>;
  phoneNumbers?: Array<{
    phoneId: number;
    countryCode: string;
    number: string;
    state?: 'Activo' | 'Inactivo';
    importedBy?: string;
    twilioAccountId?: number; // ⚠️ NUEVO
  }>;
  agents?: Array<{
    name: string;
    type: 'outbound' | 'inbound';
    language: string;
    voiceId: string;
    firstInteraction: string;
    agentInstruction: string;
    phoneNumbers?: {
      phoneId: number;
      countryCode: string;
      number: string;
    };
    label: string;
  }>;
  agent?: any; // Compatibilidad: primer agente del array

  constructor(
    name: string | undefined,
    lastname: string | undefined,
    email: string | undefined,
    password: string | undefined,
    userId: string,
    profileImage?: string,
    enterprise?: { name: string; url: string },
    country?: string,
    token?: string,
    voiceId?: string,
    language?: any,
  ) {
    this.userId = userId;
    this.name = name;
    this.lastname = lastname;
    this.email = email;
    this.password = password;
    this.profileImage = profileImage;
    this.enterprise = enterprise;
    this.country = country;
    this.token = token;
    this.voiceId = voiceId;
    this.language = language;
  }
}
