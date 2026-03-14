/**
 * DTO para POST /twilio/config (Request)
 * twilioAccountId es opcional: si no se envía, se crea una nueva cuenta
 */
export interface TwilioConfigRequest {
  twilioAccountId?: number; // ⚠️ NUEVO: opcional
  twilioSid: string;
  twilioToken: string;
}

/**
 * DTO para una cuenta de Twilio individual
 */
export interface TwilioAccount {
  twilioAccountId: number;
  twilioSid: string;
  twilioToken: string;
  inboundMinutes: {
    minutes: string;
    unit: string;
    message?: string;
  };
}

/**
 * DTO para GET /twilio/info (Response)
 * Ahora retorna un array de cuentas
 */
export interface TwilioConfig {
  accounts: TwilioAccount[];
}

/**
 * Tipo extendido para el storage local que incluye campos adicionales
 * que no vienen del servidor pero se necesitan localmente
 * Compatible con la estructura antigua (objeto único) y nueva (array)
 */
export interface TwilioConfigLocal {
  twilioAccountId?: number; // ⚠️ NUEVO
  twilioSid: string;
  twilioToken: string;
  inboundMinutes?: {
    minutes: string;
    unit: string;
    message?: string;
  };
  countryCode?: string;
  phoneNumber?: number;
  firstInteraction?: string;
  firstInteractionUrl?: string;
  agentInstruction?: string;
}
