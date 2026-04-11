import type { PanelAnalytics } from './panel-analytics.model';

/**
 * DTO para GET /metrics/dashboard
 */
export interface DashboardMetrics {
  resumen: {
    total_llamadas: {
      actual: number;
      variacionPorcentual: number;
    };
    total_llamadas_exitosas: {
      actual: number;
      variacionPorcentual: number;
    };
    minutos_ultimo_mes: {
      actual: number;
      variacionPorcentual: number;
    };
    tiempo_ahorrado: {
      actual: number;
      variacionPorcentual: number;
    };
    tasa_exito: number;
  };
  agentes: Array<{
    nombre: string;
    tipo: 'inbound' | 'outbound';
    minutos_totales: number;
    estado: 'activo' | 'inactivo';
  }>;
  llamadas_exitosas_ultimos_7_dias: Array<{
    fecha: string; // Formato: "YYYY-MM-DD"
    total: number;
  }>;
  /** Nivel de panel según plan (Starter / Growth / Scale). */
  panel_analytics?: PanelAnalytics;
}

export type MetricsPeriod = 'day' | 'week' | 'month' | '6months' | 'year';
