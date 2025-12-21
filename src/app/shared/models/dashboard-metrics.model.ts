/**
 * DTO para GET /metrics/dashboard
 */
export interface DashboardMetrics {
  resumen: {
    total_llamadas: number;
    tiempo_ahorrado: number;
    minutos_utilizados: number;
  };
  agentes: Array<{
    nombre: string;
    tipo: 'inbound' | 'outbound';
    minutos_totales: number;
    estado: 'activo' | 'inactivo';
  }>;
  llamadas_ultimos_7_dias: Array<{
    fecha: string; // Formato: "YYYY-MM-DD"
    total: number;
  }>;
}

export type MetricsPeriod = 'day' | 'week' | 'month' | '6months' | 'year';

