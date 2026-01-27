export class User {
  userId?: string;
  name?: string; // Opcional porque puede venir undefined del perfil
  lastname?: string; // Opcional porque puede venir undefined del perfil
  profileImage?: string;
  enterprise?: { name: string; url: string };
  country?: string;          // ✅ NUEVO - Opcional
  marketingConsent?: boolean; // ✅ NUEVO - Opcional
  accountStatus?: number;    // ⬅️ NUEVO: Opcional (0 = Inactivo, 1 = Activo, 2 = Eliminado)
  scheduledDeletionDate?: string | null; // Fecha programada para eliminación (ISO string)
  email?: string; // Opcional porque puede venir undefined del perfil
  password?: string; // Opcional porque no viene del perfil del usuario
  token?: string;
  voiceId?: string;
  language?: any;
  // Nuevos campos opcionales
  integrations?: {
    shopify?: {
      connected?: boolean;
      shopDomain?: string;
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
    name: string | undefined,
    lastname: string | undefined,
    email: string | undefined,
    password: string | undefined,
    userId: string,
    profileImage?: string,
    enterprise?: { name: string; url: string },
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
    this.country = country;
    this.token = token;
    this.voiceId = voiceId;
    this.language = language;
  }
}
