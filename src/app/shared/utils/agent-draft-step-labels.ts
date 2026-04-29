/**
 * Etiquetas localizadas para el paso guardado en el borrador de creación de agente.
 * Debe coincidir con los valores de `step` / `displayedStep` en new-create-agents.
 */
const STEP_LABELS_ES: Record<string, string> = {
  agentName: 'Nombre del agente',
  language: 'Tipo de llamada',
  voices: 'País y voz',
  campaign: 'Campaña',
  segmentation: 'Segmentación',
  scheduleCampaign: 'Programar campaña',
  connectBusiness: 'Conectar negocio',
  outboundPostShopify: 'Instrucciones saliente (borrador antiguo)',
  instructions: 'Instrucciones',
  knowledgeBase: 'Base de conocimientos',
  summary: 'Prueba de agente',
  connectPhone: 'Número de teléfono',
  success: 'Finalizado',
  advancedSettings: 'Ajustes avanzados',
  final: 'Final',
  template: 'Plantilla',
  greeting: 'Saludo',
  voice: 'Voz',
  advanced: 'Avanzado',
};

const STEP_LABELS_EN: Record<string, string> = {
  agentName: 'Agent name',
  language: 'Call type',
  voices: 'Country & voice',
  campaign: 'Campaign',
  segmentation: 'Segmentation',
  scheduleCampaign: 'Schedule campaign',
  connectBusiness: 'Connect business',
  outboundPostShopify: 'Outbound instructions (legacy draft)',
  instructions: 'Instructions',
  knowledgeBase: 'Knowledge base',
  summary: 'Test agent',
  connectPhone: 'Phone number',
  success: 'Completed',
  advancedSettings: 'Advanced settings',
  final: 'Final',
  template: 'Template',
  greeting: 'Greeting',
  voice: 'Voice',
  advanced: 'Advanced',
};

export function getAgentDraftStepLabel(
  step: string | undefined,
  langCode: string,
): string {
  if (!step) return '';
  const map = langCode === 'en' ? STEP_LABELS_EN : STEP_LABELS_ES;
  return (
    map[step] ?? (langCode === 'en' ? 'Unknown step' : 'Paso desconocido')
  );
}
