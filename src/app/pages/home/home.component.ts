import { Component, inject, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';
import { MetricsService } from '../../core/services/metrics.service';
import { DashboardMetrics } from '../../shared/models/dashboard-metrics.model';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexGrid,
  ApexFill,
} from 'ng-apexcharts';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private i18nService = inject(I18nService);
  private metricsService = inject(MetricsService);

  dashboardMetrics: DashboardMetrics | null = null;
  isLoadingMetrics: boolean = false;

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  // Obtener idioma actual
  get currentLanguage() {
    return this.i18nService.getCurrentLanguage();
  }

  // Variables para controlar las animaciones de fade in
  showResumen: boolean = false;
  showAgentesActivos: boolean = false;
  showLlamadasPorDia: boolean = false;

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  get summary() {
    // Si hay datos del backend, usarlos
    if (this.dashboardMetrics) {
      return {
        totalCalls: this.dashboardMetrics.resumen.total_llamadas,
        callsDeltaPct: 0, // El backend no proporciona este dato
        timeSavedHours: this.dashboardMetrics.resumen.tiempo_ahorrado,
        timeSavedDeltaPct: 0, // El backend no proporciona este dato
        minutesUsed: this.dashboardMetrics.resumen.minutos_utilizados,
        minutesDeltaPct: 0, // El backend no proporciona este dato
      };
    }
    // Si no hay datos, devolver valores en cero para evitar mostrar datos ficticios
    return {
      totalCalls: 0,
      callsDeltaPct: 0,
      timeSavedHours: 0,
      timeSavedDeltaPct: 0,
      minutesUsed: 0,
      minutesDeltaPct: 0,
    };
  }

  // Cargar métricas del backend (últimos 7 días)
  private loadMetrics(): void {
    // Solo cargar métricas si estamos en el navegador
    if (!this.isBrowser) {
      return;
    }

    this.isLoadingMetrics = true;

    this.metricsService.getDashboardMetrics().subscribe({
      next: (data: DashboardMetrics) => {
        console.log(
          '✅ Métricas recibidas del backend (últimos 7 días):',
          data
        );
        this.dashboardMetrics = data;
        this.isLoadingMetrics = false;

        // Actualizar datos de llamadas por día
        this.updateCallsByDay(data);

        // Actualizar agentes activos
        this.updateActiveAgents(data);
      },
      error: (error) => {
        this.isLoadingMetrics = false;

        if (this.isBrowser) {
          console.error('❌ Error al cargar métricas:', error);

          // Si el error es 401 (token inválido o expirado)
          if (error.status === 401) {
            console.error(
              '🔒 Token inválido o expirado. Verifica que estés autenticado.'
            );

            // Verificar si hay token en localStorage
            const token = localStorage.getItem('token');
            if (!token) {
              console.error(
                '❌ No hay token en localStorage. Redirigiendo al login...'
              );
              // Opcional: redirigir al login si no hay token
              // window.location.href = '/login';
            } else {
              console.warn(
                '⚠️ Token existe pero está expirado o es inválido. Considera refrescar el token.'
              );
            }
          }
        }
        // En caso de error, mantener los datos por defecto
      },
    });
  }

  // Actualizar datos de llamadas por día desde el backend
  private updateCallsByDay(data: DashboardMetrics): void {
    if (
      data.llamadas_ultimos_7_dias &&
      data.llamadas_ultimos_7_dias.length > 0
    ) {
      // Obtener los últimos 7 días
      const last7Days = data.llamadas_ultimos_7_dias.slice(-7);

      // Mapear a arrays de conteos
      this.callsByDayCounts = last7Days.map((item) => item.total);

      // Calcular porcentajes basados en el máximo
      const maxCalls = Math.max(...this.callsByDayCounts, 1);
      this.callsByDayPercentages = this.callsByDayCounts.map((count) =>
        Math.round((count / maxCalls) * 100)
      );

      // Actualizar datos de los gráficos sparkline
      this.updateSparklineCharts(data);
    }
  }

  // Actualizar gráficos sparkline con datos reales
  private updateSparklineCharts(data: DashboardMetrics): void {
    // Comentado para mantener los datos manuales que el usuario configura
    // if (data.llamadas_ultimos_7_dias && data.llamadas_ultimos_7_dias.length > 0) {
    //   const last7Days = data.llamadas_ultimos_7_dias.slice(-7);
    //   const callsData = last7Days.map((item) => item.total);
    //   
    //   // Si todos los datos son 0, usar datos de ejemplo para que se vea el gráfico
    //   const allZeros = callsData.every(val => val === 0);
    //   if (allZeros) {
    //     this.callsSparklineSeries = [{ name: 'Llamadas', data: [20, 35, 25, 45, 30, 40, 35] }];
    //     this.timeSavedSparklineSeries = [{ name: 'Tiempo', data: [15, 30, 20, 40, 25, 35, 30] }];
    //     this.minutesSparklineSeries = [{ name: 'Minutos', data: [10, 25, 15, 35, 20, 30, 25] }];
    //   } else {
    //     // Gráfico de llamadas exitosas
    //     this.callsSparklineSeries = [{ name: 'Llamadas', data: callsData }];
    //     
    //     // Para tiempo ahorrado y minutos usados, usar datos proporcionales
    //     // (el backend no proporciona estos datos específicos, así que usamos datos derivados)
    //     const maxValue = Math.max(...callsData, 1);
    //     const timeSavedData = callsData.map(val => Math.round((val / maxValue) * 100));
    //     const minutesData = callsData.map(val => Math.round((val / maxValue) * 80));
    //     
    //     this.timeSavedSparklineSeries = [{ name: 'Tiempo', data: timeSavedData }];
    //     this.minutesSparklineSeries = [{ name: 'Minutos', data: minutesData }];
    //   }
    // }
  }

  // Actualizar agentes activos desde el backend
  private updateActiveAgents(data: DashboardMetrics): void {
    // Los datos de agentes se actualizarán automáticamente a través del getter
    // que ahora usará dashboardMetrics.agentes
  }

  currentWeekdayIndex: number = this.computeWeekdayIndex();

  private computeWeekdayIndex(): number {
    const jsDay = new Date().getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
    return jsDay === 0 ? 6 : jsDay - 1; // Convertir a 0=Lun ... 6=Dom
  }

  isToday(index: number): boolean {
    return index === this.currentWeekdayIndex;
  }

  // Días de la semana usando traducciones (abreviaciones)
  get days(): string[] {
    return [
      this.t.mon,
      this.t.tue,
      this.t.wed,
      this.t.thu,
      this.t.fri,
      this.t.sat,
      this.t.sun,
    ];
  }

  // Altura máxima de las barras en píxeles
  maxBarHeight: number = 200;

  // Porcentajes de llamadas por día (0-100%) - inicializados vacíos para evitar mostrar datos ficticios
  callsByDayPercentages: number[] = [0, 0, 0, 0, 0, 0, 0];
  // Número de llamadas por día - inicializados en cero para evitar mostrar datos ficticios
  callsByDayCounts: number[] = [0, 0, 0, 0, 0, 0, 0];

  // Configuraciones de gráficos sparkline
  callsSparklineSeries: ApexAxisChartSeries = [{ name: 'Llamadas', data: [250, 0, 25, 120, 30, 40, 35] }];
  timeSavedSparklineSeries: ApexAxisChartSeries = [{ name: 'Tiempo', data: [15, 30, 20, 40, 25, 35, 30] }];
  minutesSparklineSeries: ApexAxisChartSeries = [{ name: 'Minutos', data: [0, 0, 0, 0, 0, 0, 0] }];

  // Configuración común para todos los sparklines
  sparklineChart: ApexChart = {
    type: 'line',
    height: 60,
    width: 85,
    toolbar: { show: false },
    sparkline: { enabled: true },
    animations: { enabled: false },
    zoom: { enabled: false },
    events: {
      dataPointSelection: () => { },
      markerClick: () => { },
    },
  };

  sparklineTooltip: any = {
    enabled: false,
    followCursor: false,
    intersect: false,
  };

  sparklineStroke: ApexStroke = {
    curve: 'smooth',
    width: 2,
    colors: ['#1E3A8A'],
    lineCap: 'round',
  };

  sparklineDataLabels: ApexDataLabels = {
    enabled: false,
  };

  sparklineMarkers: any = {
    size: 0,
    hover: {
      size: 0,
    },
  };

  sparklineFill: ApexFill = {
    type: 'solid',
    opacity: 0,
  };

  sparklineGrid: ApexGrid = {
    show: false,
  };

  sparklineXAxis: ApexXAxis = {
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  sparklineYAxis: ApexYAxis = {
    show: false,
    min: 0,
    max: 500,
  };

  sparklineColors: string[] = ['#1E3A8A'];

  // Calcular alturas basadas en porcentajes
  get callsByDayHeights(): number[] {
    return this.callsByDayPercentages.map((percentage) =>
      Math.round((percentage / 100) * this.maxBarHeight)
    );
  }

  // NUEVO: Helper para mostrar el número de llamadas por día solo si es distinto de 0
  showCallsByDayNumber(index: number): boolean {
    // Asegura que el índice sea válido
    if (
      Array.isArray(this.callsByDayCounts) &&
      index >= 0 &&
      index < this.callsByDayCounts.length
    ) {
      return this.callsByDayCounts[index] >= 5;
    }
    return false;
  }

  // Datos dinámicos para "Agentes activos" usando traducciones
  get activeAgents(): Array<{
    name: string;
    type: string;
    minutes: number;
    percent: number;
    status: string;
    active: boolean;
    outerColor: string;
    innerColor: string;
  }> {
    // Si hay datos del backend, usarlos
    if (this.dashboardMetrics && this.dashboardMetrics.agentes) {
      const totalMinutes = this.dashboardMetrics.agentes.reduce(
        (sum, agent) => sum + agent.minutos_totales,
        0
      );

      return this.dashboardMetrics.agentes.map((agent) => {
        const percent =
          totalMinutes > 0
            ? Math.round((agent.minutos_totales / totalMinutes) * 100 * 10) / 10
            : 0;

        const isActive = agent.estado === 'activo';

        return {
          name: agent.nombre,
          type: agent.tipo === 'inbound' ? this.t.inbound : this.t.outbound,
          minutes: agent.minutos_totales,
          percent: percent,
          status: isActive ? this.t.active : this.t.draft,
          active: isActive,
          outerColor: isActive ? '#1E3A8A80' : '#EDEDED',
          innerColor: isActive ? '#1E3A8A' : '#C5CAC4',
        };
      });
    }

    // Si no hay datos del backend, devolver array vacío para evitar mostrar datos ficticios
    return [];
  }

  ngOnInit(): void {
    // Los gráficos ya tienen datos por defecto, pero si no hay datos del backend,
    // se mantendrán los datos por defecto que ya están inicializados

    // Cargar métricas solo si estamos en el navegador (no en SSR)
    if (this.isBrowser) {
      this.loadMetrics();
    } else {
      // Si no estamos en el navegador, asegurar que los gráficos tengan datos por defecto
      // (ya están inicializados arriba, pero esto asegura que se muestren)
      this.callsSparklineSeries = [{ name: 'Llamadas', data: [20, 35, 25, 45, 30, 40, 35] }];
      this.timeSavedSparklineSeries = [{ name: 'Tiempo', data: [15, 30, 20, 40, 25, 35, 30] }];
      this.minutesSparklineSeries = [{ name: 'Minutos', data: [10, 25, 15, 35, 20, 30, 25] }];
    }

    // Ejecutar animaciones siempre
    this.startFadeInAnimations();
  }

  private startFadeInAnimations(): void {
    // Verificar si estamos en el navegador de manera más robusta
    const isInBrowser = typeof window !== 'undefined' && window.localStorage;

    if (!isInBrowser) {
      this.showAllSectionsImmediately();
      return;
    }

    // Resumen aparece primero (sin delay)
    setTimeout(() => {
      this.showResumen = true;
    }, 100);

    // Agentes Activos aparece después de 500ms
    setTimeout(() => {
      this.showAgentesActivos = true;
    }, 600);

    // Llamadas por día aparece después de 1000ms
    setTimeout(() => {
      this.showLlamadasPorDia = true;
    }, 1100);
  }

  private showAllSectionsImmediately(): void {
    // Mostrar todas las secciones inmediatamente sin animación
    this.showResumen = true;
    this.showAgentesActivos = true;
    this.showLlamadasPorDia = true;
  }
}
