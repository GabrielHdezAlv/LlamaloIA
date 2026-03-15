import { CallMetricsDto } from './call-metrics.model';

/**
 * DTO para GET /metrics/twilio-detailed
 */
export interface TwilioDetailedMetrics {
  llamadasExitosasUltimos7Dias: Array<{
    fecha: string; // Formato: "YYYY-MM-DD"
    total: number;
    comparacionSemanaAnterior?: {
      total: number;
      variacionPorcentual: number; // +25% vs semana anterior
    };
  }>;
  resumenComparativoSemanal?: {
    totalSemanaActual: number; // Total últimos 7 días
    totalSemanaAnterior: number; // Total 7 días anteriores
    variacionPorcentual: number; // +29.2% vs semana anterior
  };
  totalMinutosUltimoMes: number;
  duracionMediaLlamadas: number; // en minutos
  tiposLlamadas: {
    inbound: number;
    outbound: number;
  };
  paisesOrigen: Array<{
    pais: string; // Código de país (ej: "34", "52")
    cantidad: number;
    porcentaje: number;
  }>;
  evaluacionExito: {
    exitosas: number;
    parciales: number;
    fallidas: number;
  };
  razonesFinalizacion: {
    completada: number;
    clienteColgo: number;
    sinRespuesta: number;
    silencio: number;
    errorTecnico: number;
    tiempoAgotado: number;
  };
  latenciaMedia: number; // latencia media en milisegundos
  callMetricsByHour?: CallMetricsDto; // Nueva propiedad para métricas por hora
}
