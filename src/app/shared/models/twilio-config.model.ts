export interface TwilioConfig {
  countryCode: string;
  phoneNumber: number;
  twilioSid: string;
  twilioToken: string;
  firstInteraction?: string;
  agentInteraction?: string;
}
