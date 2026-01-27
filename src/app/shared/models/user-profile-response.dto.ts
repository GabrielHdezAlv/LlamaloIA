import { TwilioConfig } from './twilio-config.model';

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
  country?: string;          // ✅ NUEVO - Opcional
  marketingConsent?: boolean; // ✅ NUEVO - Opcional
  accountStatus?: number;    // ⬅️ NUEVO: Incluido en respuestas (0 = Inactivo, 1 = Activo, 2 = Eliminado)
  createdAt?: string | null; // Fecha formateada en español (ej: "12 de octubre de 2025, 10:30:45")
  twilio?: TwilioConfig;
  agent?: {
    name?: string;
    type?: "outbound" | "inbound";
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
    shopify?: {
      connected?: boolean;
      shopDomain?: string;
    };
  };
  phoneNumbers?: Array<{
    phoneId: number;
    countryCode: string;
    number: string;
    state: "Activo" | "Inactivo";
    importedBy: string;
  }>;
  agents?: Array<{
    name: string;
    type: "outbound" | "inbound";
    language: string;
    voiceId: string;
    firstInteraction: string;
    agentInstruction: string;
    phoneNumbers: {
      phoneId: number;
      countryCode: string;
      number: string;
    };
    label: string;
  }>;
}
