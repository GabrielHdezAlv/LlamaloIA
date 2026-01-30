export interface User {
  userId: string;
  profileImage: string;
  name: string;
  lastname: string;
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
  twilio: {
    twilioSid: string;
    twilioToken: string;
  };
  phoneNumbers: Array<{
    phoneId: number;
    countryCode: string;
    number: string;
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
