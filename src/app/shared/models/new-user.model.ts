export class User {
  userId?: string;
  name: string;
  lastname: string;
  profileImage?: string;
  enterprise?: string | { name: string; url: string };
  enterpriseWeb?: string;
  country?: string;
  email: string;
  password: string;
  token?: string;
  voiceId?: string;
  language?: any;
  // Nuevos campos opcionales
  integrations?: {
    shopify?: {
      connected: boolean;
      shopDomain: string;
    };
  };
  twilio?: {
    twilioSid: string;
    twilioToken: string;
  };
  phoneNumbers?: Array<{
    phoneId: number;
    countryCode: string;
    number: string;
  }>;
  agents?: Array<{
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
  agent?: any; // Compatibilidad: primer agente del array

  constructor(
    name: string,
    lastname: string,
    email: string,
    password: string,
    userId: string,
    profileImage?: string,
    enterprise?: string | { name: string; url: string },
    enterpriseWeb?: string,
    country?: string,
    token?: string,
    voiceId?: string,
    language?: any
  ) {
    this.userId = userId;
    this.name = name;
    this.lastname = lastname;
    this.email = email;
    this.password = password;
    this.profileImage = profileImage;
    this.enterprise = enterprise;
    this.enterpriseWeb = enterpriseWeb;
    this.country = country;
    this.token = token;
    this.voiceId = voiceId;
    this.language = language;
  }
}
