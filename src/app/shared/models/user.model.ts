import { USER_ROLE } from './user-role.enum';

export interface User {
  userId: string;
  profileImage: string;
  name: string;
  lastname: string;
  rol: USER_ROLE; // ⬅️ NUEVO: Obligatorio (owner/client_user)
  enterprise?: {
    name: string;
    url: string;
  };
  email: string;
  createdAt: any; // Timestamp - ajustar según la librería utilizada (Firebase, etc.)
  integrations: {
    shopify: Array<{
      connected: boolean;
      shopDomain: string;
    }>;
  };
  twilio: Array<{
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  }>;
  phoneNumbers: Array<{
    phoneId: number;
    countryCode: string;
    number: string;
    state?: 'Activo' | 'Inactivo';
    importedBy?: string;
    twilioAccountId?: number; // ⚠️ NUEVO
  }>;
  agents: Array<{
    name: string;
    type: 'outbound' | 'inbound';
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
