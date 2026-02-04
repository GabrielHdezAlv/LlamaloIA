import { TwilioAccount } from './twilio-config.model';
import { ACCOUNT_STATUS } from './account-status.enum';
import { USER_ROLE } from './user-role.enum';

/**
 * DTO para GET /users/profile (Response)
 * Respuesta del endpoint de perfil de usuario autenticado
 */
export interface UserProfileResponseDto {
  userId: string;
  name?: string;
  lastname?: string;
  profileImage?: string;
  enterprise?: { name: string; url: string };
  email?: string;
  country?: string; // ✅ NUEVO - Opcional
  marketingConsent?: boolean; // ✅ NUEVO - Opcional
  accountStatus?: number; // ⬅️ NUEVO: Incluido en respuestas (0 = Inactivo, 1 = Activo, 2 = Eliminado, 3 = No validado)
  rol?: USER_ROLE; // ⬅️ NUEVO: Incluido en respuestas (owner/client_user)
  scheduledDeletionDate?: string | null; // Fecha programada para eliminación (ISO string)
  createdAt?: string | null; // Fecha formateada en español (ej: "12 de octubre de 2025, 10:30:45")
  twilio?: TwilioAccount[]; // ⚠️ ACTUALIZADO: ahora es un array
  agent?: {
    name?: string;
    type?: 'outbound' | 'inbound';
    language?: string;
    voiceId?: string;
    firstInteraction?: string;
    agentInstruction?: string;
    phoneNumbers?: {
      phoneId?: number;
      countryCode?: string;
      number?: string;
    };
    label?: string;
  }; // Primer agente del array (compatibilidad con DTO antiguo)
  integrations?: {
    shopify?: Array<{
      connected?: boolean;
      shopDomain?: string;
    }>;
  };
  phoneNumbers?: Array<{
    phoneId: number;
    countryCode: string;
    number: string;
    state: 'Activo' | 'Inactivo';
    importedBy: string;
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
}
