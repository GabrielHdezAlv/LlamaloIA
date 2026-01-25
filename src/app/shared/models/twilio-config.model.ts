/**
 * DTO para POST /twilio/config (Request)
 * Todos los campos son requeridos
 */
export interface TwilioConfigRequest {
  twilioSid: string;
  twilioToken: string;
}

/**
 * DTO para GET /twilio/info (Response)
 */
export interface TwilioConfig {
  twilioSid: string;        // ✅ Siempre presente (si está configurado)
  twilioToken: string;      // ✅ Siempre presente (si está configurado)
  inboundMinutes: {         // ✅ Siempre presente
    minutes: string;
    unit: string;
    message?: string;
  };
}

/**
 * Tipo extendido para el storage local que incluye campos adicionales
 * que no vienen del servidor pero se necesitan localmente
 */
export interface TwilioConfigLocal extends Omit<TwilioConfig, 'inboundMinutes'> {
  inboundMinutes?: TwilioConfig['inboundMinutes']; // Opcional para storage local
  countryCode?: string;
  phoneNumber?: number;
  firstInteraction?: string;
  firstInteractionUrl?: string;
  agentInstruction?: string;
}
