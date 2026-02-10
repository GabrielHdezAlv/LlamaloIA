import { TestBed } from '@angular/core/testing';
import { CallMetricsService } from './call-metrics.service';
import {
  CallMetricsDto,
  DailyPeakHour,
} from '../../shared/models/call-metrics.model';

describe('CallMetricsService', () => {
  let service: CallMetricsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CallMetricsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculatePeakHourMetrics', () => {
    it('should calculate peak hour metrics correctly', () => {
      // Crear datos de prueba para los últimos 7 días
      const now = new Date();
      const testData = [
        // Día 1: Llamadas主要集中在 10am
        new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 días atrás
        new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // 6 días atrás a las 10am
        new Date(
          now.getTime() -
            6 * 24 * 60 * 60 * 1000 +
            10 * 60 * 60 * 1000 +
            30 * 60 * 1000,
        ), // 10:30am
        new Date(
          now.getTime() -
            6 * 24 * 60 * 60 * 1000 +
            10 * 60 * 60 * 1000 +
            45 * 60 * 1000,
        ), // 10:45am

        // Día 2: Llamadas主要集中在 3pm
        new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // 5 días atrás a las 3pm
        new Date(
          now.getTime() -
            5 * 24 * 60 * 60 * 1000 +
            15 * 60 * 60 * 1000 +
            15 * 60 * 1000,
        ), // 3:15pm
        new Date(
          now.getTime() -
            5 * 24 * 60 * 60 * 1000 +
            15 * 60 * 60 * 1000 +
            30 * 60 * 1000,
        ), // 3:30pm
      ].map((timestamp) => ({ timestamp }));

      const result = service.calculatePeakHourMetrics(testData);

      expect(result).toBeDefined();
      expect(result.dailyPeakHours.length).toBe(7);
      expect(result.totalCalls).toBe(testData.length);

      // Verificar que las fechas sean correctas
      const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      expect(result.startDate.getTime()).toBeCloseTo(startDate.getTime(), -4); // ±10 segundos
      expect(result.endDate.getTime()).toBeCloseTo(now.getTime(), -4);

      // Verificar que haya datos para cada día
      result.dailyPeakHours.forEach((day, index) => {
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(day.hourlyCalls.length).toBe(24);
        expect(day.peakHour).toBeGreaterThanOrEqual(0);
        expect(day.peakHour).toBeLessThan(24);
        expect(day.peakCallCount).toBeGreaterThanOrEqual(0);
        expect(day.totalDayCalls).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle empty data correctly', () => {
      const result = service.calculatePeakHourMetrics([]);

      expect(result.dailyPeakHours.length).toBe(7);
      expect(result.totalCalls).toBe(0);

      result.dailyPeakHours.forEach((day) => {
        expect(day.totalDayCalls).toBe(0);
        expect(day.peakCallCount).toBe(0);
        expect(day.hourlyCalls.every((calls) => calls === 0)).toBe(true);
      });
    });

    it('should handle data outside the 7-day range correctly', () => {
      const now = new Date();
      const oldData = [
        new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 días atrás (fuera de rango)
        new Date(now.getTime() + 24 * 60 * 60 * 1000), // mañana (fuera de rango)
      ].map((timestamp) => ({ timestamp }));

      const result = service.calculatePeakHourMetrics(oldData);

      expect(result.totalCalls).toBe(0); // No debería contar llamadas fuera de rango
      result.dailyPeakHours.forEach((day) => {
        expect(day.totalDayCalls).toBe(0);
      });
    });
  });

  describe('formatHour', () => {
    it('should format hours correctly', () => {
      expect(service.formatHour(0)).toBe('00:00');
      expect(service.formatHour(9)).toBe('09:00');
      expect(service.formatHour(15)).toBe('15:00');
      expect(service.formatHour(23)).toBe('23:00');
    });
  });

  describe('getDayName', () => {
    it('should return correct day names in Spanish', () => {
      expect(service.getDayName('2026-02-01')).toBe('Domingo'); // 1 de febrero de 2026 fue domingo
      expect(service.getDayName('2026-02-02')).toBe('Lunes');
      expect(service.getDayName('2026-02-03')).toBe('Martes');
      expect(service.getDayName('2026-02-04')).toBe('Miércoles');
      expect(service.getDayName('2026-02-05')).toBe('Jueves');
      expect(service.getDayName('2026-02-06')).toBe('Viernes');
      expect(service.getDayName('2026-02-07')).toBe('Sábado');
    });
  });

  describe('calculateAdditionalMetrics', () => {
    it('should calculate additional metrics correctly', () => {
      const mockMetrics: CallMetricsDto = {
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-08'),
        dailyPeakHours: [
          {
            date: '2026-02-02',
            peakHour: 10,
            peakCallCount: 15,
            totalDayCalls: 50,
            hourlyCalls: new Array(24)
              .fill(0)
              .map((_, i) => (i === 10 ? 15 : 2)), // Datos predecibles
          },
          {
            date: '2026-02-03',
            peakHour: 15,
            peakCallCount: 20,
            totalDayCalls: 80,
            hourlyCalls: new Array(24)
              .fill(0)
              .map((_, i) => (i === 15 ? 20 : 3)), // Datos predecibles
          },
          {
            date: '2026-02-04',
            peakHour: 15,
            peakCallCount: 18,
            totalDayCalls: 60,
            hourlyCalls: new Array(24)
              .fill(0)
              .map((_, i) => (i === 15 ? 18 : 1)), // Hora 15 otra vez
          },
        ],
        totalCalls: 190, // 50 + 80 + 60
      };

      const result = service.calculateAdditionalMetrics(mockMetrics);

      expect(result.averageCallsPerDay).toBeCloseTo(63.33, 1); // 190 / 3 días con datos
      expect(result.busiestDay?.totalDayCalls).toBe(80);
      expect(result.quietestDay?.totalDayCalls).toBe(50);
      expect(result.mostCommonPeakHour).toBe(15); // La hora 15 aparece más veces
    });

    it('should handle empty daily peak hours', () => {
      const mockMetrics: CallMetricsDto = {
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-08'),
        dailyPeakHours: [],
        totalCalls: 0,
      };

      const result = service.calculateAdditionalMetrics(mockMetrics);

      expect(result.averageCallsPerDay).toBe(0);
      expect(result.busiestDay).toBeNull();
      expect(result.quietestDay).toBeNull();
      expect(result.mostCommonPeakHour).toBe(0);
    });
  });
});
