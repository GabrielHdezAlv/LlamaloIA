/**
 * Parámetros de voz en la respuesta de configuración del agente de soporte
 */
export interface SupportAgentConfigParameters {
  stability: number;
  similarity: number;
  style: number;
  speed: number;
  boost: boolean;
}

/**
 * Teléfono en la respuesta de configuración del agente de soporte
 */
export interface SupportAgentConfigPhoneNumbers {
  countryCode: string;
  number: number;
}

/**
 * DTO de la respuesta GET /support-agent/config
 */
export interface SupportAgentConfigDto {
  agentInstruction: string;
  enabled: boolean;
  firstInteraction: string;
  label: string;
  language: string;
  model: string;
  name: string;
  parameters: SupportAgentConfigParameters;
  phoneNumbers: SupportAgentConfigPhoneNumbers;
  state: string;
  type: string;
  updatedAt: string;
  voiceId: string;
}

/**
 * DTO para PUT /support-agent/config (actualizar Configuración Xenon).
 * Coincide con SetAgentConfigDto del backend (incl. contactEmail, model opcionales).
 */
export interface SetSupportAgentConfigDto {
  name: string;
  language: string;
  type: 'outbound' | 'inbound';
  voiceId: string;
  firstInteraction: string;
  agentInstruction: string;
  phoneNumbers: SupportAgentConfigPhoneNumbers;
  label: string;
  state: 'Activo' | 'Inactivo';
  parameters: SupportAgentConfigParameters;
  twilioAccountId?: number;
  shopifyDomain?: string;
  knowledgeSourceIds?: string[];
  contactEmail?: string;
  model?: string;
}

/**
 * Respuesta de PUT /support-agent/config.
 * Extiende la config con enabled y updatedAt.
 */
export interface SupportAgentConfigResponseDto extends SetSupportAgentConfigDto {
  enabled: boolean;
  updatedAt: string;
}
