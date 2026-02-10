import { Injectable } from '@angular/core';
import {
  CallMetricsDto,
  DailyPeakHour,
} from '../../shared/models/call-metrics.model';

@Injectable({
  providedIn: 'root',
})
export class CallMetricsService {
  /**
   * Calcula las métricas de hora pico a partir de datos de llamadas
   * Este método puede ser usado en el frontend para procesar datos
   * o como referencia para la implementación del backend
   */
  calculatePeakHourMetrics(
    callData: Array<{ timestamp: Date; duration?: number }>,
  ): CallMetricsDto {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // Filtrar llamadas de los últimos 7 días
    const filteredCalls = callData.filter(
      (call) => call.timestamp >= startDate && call.timestamp <= endDate,
    );

    // Inicializar estructura para 7 días
    const dailyPeakHours: DailyPeakHour[] = [];
    let totalCalls = 0;

    // Procesar cada día
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      // Obtener llamadas del día actual
      const dayCalls = filteredCalls.filter((call) => {
        const callDate = new Date(call.timestamp);
        return callDate.toDateString() === currentDate.toDateString();
      });

      // Inicializar array de 24 horas
      const hourlyCalls = new Array(24).fill(0);

      // Contar llamadas por hora
      dayCalls.forEach((call) => {
        const hour = new Date(call.timestamp).getHours();
        hourlyCalls[hour]++;
      });

      // Encontrar hora pico
      let peakHour = 0;
      let peakCallCount = hourlyCalls[0];

      for (let hour = 1; hour < 24; hour++) {
        if (hourlyCalls[hour] > peakCallCount) {
          peakHour = hour;
          peakCallCount = hourlyCalls[hour];
        }
      }

      const totalDayCalls = dayCalls.length;
      totalCalls += totalDayCalls;

      dailyPeakHours.push({
        date: currentDate.toISOString().split('T')[0], // "YYYY-MM-DD"
        peakHour,
        peakCallCount,
        totalDayCalls,
        hourlyCalls: [...hourlyCalls],
      });
    }

    return {
      startDate,
      endDate,
      dailyPeakHours,
      totalCalls,
    };
  }

  /**
   * Formatea la hora para mostrarla de manera amigable
   */
  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  /**
   * Obtiene el nombre del día de la semana
   */
  getDayName(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00'); // Forzar medianoche para evitar timezone issues
    const days = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    return days[date.getDay()];
  }

  /**
   * Calcula estadísticas adicionales de las métricas
   */
  calculateAdditionalMetrics(metrics: CallMetricsDto): {
    averageCallsPerDay: number;
    busiestDay: DailyPeakHour | null;
    quietestDay: DailyPeakHour | null;
    mostCommonPeakHour: number;
  } {
    const daysWithData = metrics.dailyPeakHours.filter(
      (day) => day.totalDayCalls > 0,
    );
    const averageCallsPerDay =
      daysWithData.length > 0 ? metrics.totalCalls / daysWithData.length : 0;

    const busiestDay =
      daysWithData.length > 0
        ? daysWithData.reduce((max, day) =>
            day.totalDayCalls > max.totalDayCalls ? day : max,
          )
        : null;

    const quietestDay =
      daysWithData.length > 0
        ? daysWithData.reduce((min, day) =>
            day.totalDayCalls < min.totalDayCalls ? day : min,
          )
        : null;

    // Encontrar la hora pico más común entre todos los días
    const hourFrequency = new Array(24).fill(0);
    metrics.dailyPeakHours.forEach((day) => {
      if (day.totalDayCalls > 0) {
        hourFrequency[day.peakHour]++;
      }
    });

    const mostCommonPeakHour = hourFrequency.indexOf(
      Math.max(...hourFrequency),
    );

    return {
      averageCallsPerDay,
      busiestDay,
      quietestDay,
      mostCommonPeakHour,
    };
  }
}
