/**
 * DTO para métricas de llamadas por hora
 */
export interface CallMetricsDto {
  startDate: Date; // Inicio del período (7 días atrás)
  endDate: Date; // Fin del período (actual)
  dailyPeakHours: DailyPeakHour[]; // Array con 7 días (uno por cada día)
  totalCalls: number; // Total de llamadas en el período
}

/**
 * DTO para hora pico diaria
 */
export interface DailyPeakHour {
  date: string; // "2026-02-03"
  peakHour: number; // 10 (hora con más llamadas, 0-23)
  peakCallCount: number; // 12 (llamadas en la hora pico)
  totalDayCalls: number; // 45 (total del día)
  hourlyCalls: number[]; // Array[24] con llamadas por hora
}
