/**
 * DTO para POST /twilio/config (Request)
 * Todos los campos son requeridos
 */
export interface TwilioConfigRequest {
  countryCode: string;
  phoneNumber: number;
  twilioSid: string;
  twilioToken: string;
  firstInteraction: string; // Requerido (no opcional)
  firstInteractionUrl: string; // Requerido
  agentInstruction: string; // Requerido
}

/**
 * DTO para GET /twilio/info (Response)
 * Todos los campos son opcionales
 */
export interface TwilioConfig {
  countryCode?: string;
  phoneNumber?: number;
  twilioSid?: string;
  twilioToken?: string;
  firstInteraction?: string;
  firstInteractionUrl?: string;
  agentInstruction?: string;
  inboundMinutes?: {
    minutes: string;
    unit?: string;
    message?: string;
  };
}
