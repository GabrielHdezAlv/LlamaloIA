/**
 * Parámetros de configuración de voz
 */
export interface VoiceParameters {
  stability: number; // 0-1.0
  similarity: number; // 0-1.0
  style: number; // 0-1.0
  boost: boolean; // true/false
  speed: number; // 0.25-4.0
}

/** Fila enriquecida para segmentación por contacto (CSV / API). */
export interface OutboundQueueLead {
  phone: string;
  eventAt?: string;
  externalEventId?: string;
  contactTicket?: number;
  customerState?: string;
  cartTotal?: number;
  cartItemCount?: number;
  productHandle?: string;
}

/**
 * Modelo de agente
 */
export interface Agent {
  agentId?: number; // ID único del agente (viene del backend en respuestas)
  name: string;
  type: 'outbound' | 'inbound';
  language: string;
  twilioAccountId?: number | null;
  voiceId: string;
  firstInteraction: string;
  agentInstruction: string;
  phoneNumbers?: {
    phoneId: number; // Generado automáticamente
    countryCode: string;
    number: string; // Guardado como string en BD
  };
  label: string;
  state: 'Activo' | 'Inactivo';
  parameters: VoiceParameters;
  totalMinutes: number; // Solo lectura - viene del backend
  shopifyDomain?: string | null; // Opcional - tienda Shopify asociada (ej: "mi-tienda.myshopify.com")

  /** Solo agentes salientes (respuesta API / persistencia). */
  outboundCampaignKind?: string;
  outboundCampaignScripts?: {
    abandonedCart?: string;
    satisfactionSurvey?: string;
    postPurchase?: string;
    paymentReminder?: string;
    customCsv?: string;
    customMake?: string;
  };
  outboundImportCsvPhones?: string[];
  outboundQueueLeads?: OutboundQueueLead[];
  /** Clave para encolar leads desde Make (cabecera X-Outbound-Key). */
  outboundIngressSecret?: string;
  outboundSegmentationNotes?: string;
  outboundScheduleCampaignNotes?: string;
}

/**
 * Request para crear/actualizar agente
 */
export interface SetAgentConfigDto {
  name: string;
  language: string; // Solo código: "es", "en", etc.
  type: 'outbound' | 'inbound';
  twilioAccountId: number;
  voiceId: string;
  firstInteraction?: string;
  agentInstruction?: string;
  phoneNumbers: {
    countryCode: string; // "+34"
    number: number; // integer
  };
  label: string;
  parameters: VoiceParameters;
  state: 'Activo' | 'Inactivo';
  shopifyDomain?: string | null; // Opcional - para vincular ("mi-tienda.myshopify.com"), desvincular ("", null) o mantener (no enviar en update)
  knowledgeSourceIds?: string[]; // Nuevo campo opcional - IDs de fuentes de conocimiento
  
  // Campos de outbound
  outboundCampaignKind?: string;
  outboundCampaignScripts?: {
    abandonedCart?: string;
    satisfactionSurvey?: string;
    postPurchase?: string;
    paymentReminder?: string;
    customCsv?: string;
    customMake?: string;
  };
  outboundImportCsvPhones?: string[];
  outboundQueueLeads?: OutboundQueueLead[];
  outboundSegmentationNotes?: string;
  outboundScheduleCampaignNotes?: string;
}

/**
 * Response al crear agente
 */
export interface CreateAgentResponse {
  message: string;
  agent: Agent;
  agentId: number;
}

/**
 * Response al actualizar agente
 */
export interface UpdateAgentResponse {
  message: string;
  agent: Agent;
}

/**
 * Response al listar agentes
 */
export interface ListAgentsResponse {
  agents: Agent[];
}

/**
 * Response al eliminar agente
 */
export interface DeleteAgentResponse {
  message: string;
}
