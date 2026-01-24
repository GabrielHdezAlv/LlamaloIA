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
  enterprise?: string; // Nombre de la empresa (de enterprise.name) - Compatibilidad con DTO antiguo
  enterpriseWeb?: string; // URL de la empresa (de enterprise.url) - Compatibilidad con DTO antiguo
  email?: string;
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
