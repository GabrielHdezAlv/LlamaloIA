/** Alineado con GET /metrics/dashboard y métricas detalladas (API Nest). */
export type PanelAnalyticsTier = 'basic' | 'advanced' | 'full_export';

export interface PanelAnalytics {
  tier: PanelAnalyticsTier;
  can_export_csv: boolean;
}
