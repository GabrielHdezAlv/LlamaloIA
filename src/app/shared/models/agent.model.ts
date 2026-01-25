/**
 * Modelo de agente
 */
export interface Agent {
  name: string;
  type: "outbound" | "inbound";
  language: string;
  voiceId: string;
  firstInteraction: string;
  agentInstruction: string;
  phoneNumbers: {
    phoneId: number;               // Generado automáticamente
    countryCode: string;
    number: string;                // Guardado como string en BD
  };
  label: string;
}

/**
 * Request para crear/actualizar agente
 */
export interface SetAgentConfigDto {
  name: string;
  language: string;                // Solo código: "es", "en", etc.
  type: "outbound" | "inbound";
  voiceId: string;
  firstInteraction: string;
  agentInstruction: string;
  phoneNumbers: {
    countryCode: string;           // "+34"
    number: number;                 // integer
  };
  label: string;
}

/**
 * Response al crear agente
 */
export interface CreateAgentResponse {
  message: string;
  agent: Agent;
  index: number;
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
