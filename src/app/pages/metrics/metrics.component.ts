import {
  Component,
  effect,
  inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexStroke,
  ApexDataLabels,
  ApexGrid,
  ApexXAxis,
  ApexFill,
} from 'ng-apexcharts';
import { I18nService } from '../../core/services/i18n.service';
import { MetricsService } from '../../core/services/metrics.service';
import { CallMetricsService } from '../../core/services/call-metrics.service';
import { TwilioDetailedMetrics } from '../../shared/models/twilio-detailed-metrics.model';
import { DashboardMetrics } from '../../shared/models/dashboard-metrics.model';
import {
  CallMetricsDto,
  DailyPeakHour,
} from '../../shared/models/call-metrics.model';
import { UserStorage } from '../../storages/user/user-storage';
import type { PanelAnalyticsTier } from '../../shared/models/panel-analytics.model';
import {
  planDisplayLabelFromTranslations,
  userPlanGrantsFullMetrics,
} from '../../shared/utils/plan-display.util';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss',
})
export class MetricsComponent implements OnInit, OnDestroy {
  private i18nService = inject(I18nService);
  private metricsService = inject(MetricsService);
  private callMetricsService = inject(CallMetricsService);
  public userStorage = inject(UserStorage);
  private cdr = inject(ChangeDetectorRef);
  private document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  /** Nombre del plan actual (perfil), sin prefijo «Plan» en esta tarjeta. */
  get subscriptionPlanDisplayName(): string {
    return planDisplayLabelFromTranslations(
      this.userStorage.user()?.plan,
      this.t,
      {
        includePlanWord: false,
        trialActive: this.userStorage.user()?.planUsage?.trialActive === true,
      },
    );
  }

  /** Tier del panel según plan (API: dashboard o métricas detalladas). */
  get panelTier(): PanelAnalyticsTier {
    const pa =
      this.dashboardMetrics?.panel_analytics ??
      this.detailedMetrics?.panel_analytics;
    return pa?.tier ?? 'basic';
  }

  /** Solo Scale (exportación CSV en catálogo). */
  get canExportCsv(): boolean {
    const pa =
      this.dashboardMetrics?.panel_analytics ??
      this.detailedMetrics?.panel_analytics;
    return pa?.can_export_csv === true;
  }

  /**
   * Plan Starter (tier `basic` en panel_analytics): se muestran todas las tarjetas;
   * horas pico, países, evaluación de éxito y razón de finalización van atenuadas.
   * Si el perfil ya indica Growth/Scale/Premium, no se trata como Starter aunque la API tarde en actualizar `tier`.
   */
  get isStarterMetricsTier(): boolean {
    if (userPlanGrantsFullMetrics(this.userStorage.user()?.plan)) {
      return false;
    }
    const pa =
      this.dashboardMetrics?.panel_analytics ??
      this.detailedMetrics?.panel_analytics;
    return pa?.tier === 'basic';
  }

  exportMetricsCsv(): void {
    if (!this.canExportCsv || !this.isBrowser) return;
    const d = this.dashboardMetrics;
    const lines: string[] = ['metric,value'];
    if (d) {
      lines.push(`total_llamadas,${d.resumen.total_llamadas.actual}`);
      lines.push(
        `total_llamadas_exitosas,${d.resumen.total_llamadas_exitosas.actual}`,
      );
      lines.push(`minutos_ultimo_mes,${d.resumen.minutos_ultimo_mes.actual}`);
      lines.push(`tasa_exito,${d.resumen.tasa_exito}`);
    }
    const det = this.detailedMetrics;
    if (det) {
      lines.push(`totalMinutosUltimoMes,${det.totalMinutosUltimoMes}`);
      lines.push(`duracionMediaLlamadas,${det.duracionMediaLlamadas}`);
    }
    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = this.document.createElement('a');
    a.href = url;
    a.download = `metrics-llamalo-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Variables para controlar las animaciones de fade in
  showGraficoLlamadas: boolean = false;
  showTotalMinutos: boolean = false;
  showLatencia: boolean = false;
  showDuracionMedia: boolean = false;
  showTipoLlamadas: boolean = false;
  showAgentesCreados: boolean = false;
  showPaises: boolean = false;
  showEstadoAnimo: boolean = false;
  showEvaluacionExito: boolean = false;
  showRazonFinalizacion: boolean = false;
  showHorasPico: boolean = false; // Nueva animación para horas pico

  // Variable para controlar el tooltip de horas punta
  hoveredHourIndex: number | null = null;

  // Variable para controlar el día seleccionado en horas punta (0 = LUN, 1 = MAR, ..., 6 = DOM)
  selectedDayIndex: number = 5; // Por defecto SAB (Sábado)

  // Días de la semana para horas punta (dependen del idioma)
  get weekDays(): string[] {
    const t = this.t;
    return [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];
  }

  // Propiedades para métricas detalladas
  isLoadingDetailedMetrics: boolean = false;
  detailedMetricsError: string = '';
  detailedMetrics: TwilioDetailedMetrics | null = null;
  hasLoadedDetailedMetrics: boolean = false; // Flag para prevenir múltiples llamadas

  // Propiedades para métricas de horas pico
  callMetricsByHour: CallMetricsDto | null = null;
  selectedPeakDay: DailyPeakHour | null = null;
  peakHourStats: {
    averageCallsPerDay: number;
    busiestDay: DailyPeakHour | null;
    quietestDay: DailyPeakHour | null;
    mostCommonPeakHour: number;
  } | null = null; // Estadísticas adicionales de horas pico

  // Propiedades para métricas del dashboard
  isLoadingDashboardMetrics: boolean = false;
  dashboardMetricsError: string = '';
  dashboardMetrics: DashboardMetrics | null = null;
  hasLoadedDashboardMetrics: boolean = false; // Flag para prevenir múltiples llamadas

  // Propiedad para el estado del sistema
  isSystemOk: boolean = true;

  // Propiedades cacheadas para evitar cálculos repetidos
  private cachedWeeklyComparison: number = 0;
  private cachedCountries: any[] = [];
  // Inicializar con filas base al 0% para que siempre se vean barras y porcentajes
  private cachedSuccessEvaluation: any[] = [
    { name: 'Exitoso', percent: 0, color: 'bg-green-500' },
    { name: 'Parcial', percent: 0, color: 'bg-yellow-500' },
    { name: 'Fallido', percent: 0, color: 'bg-red-500' },
  ];
  private cachedCallCompletionReasons: any[] = [
    { name: 'Completada exitosamente', percent: 0, color: 'bg-blue-500' },
    { name: 'Cliente colgó', percent: 0, color: 'bg-orange-500' },
    { name: 'Error técnico', percent: 0, color: 'bg-red-500' },
    { name: 'Tiempo agotado', percent: 0, color: 'bg-gray-500' },
  ];
  private hasCachedData: boolean = false;

  // Getters para verificar el estado de las conexiones
  get isShopifyConnected(): boolean {
    const user = this.userStorage.user();
    return !!(
      user?.integrations?.shopify &&
      user.integrations.shopify.length > 0 &&
      user.integrations.shopify.some((shop) => shop.connected)
    );
  }

  get isMakeConnected(): boolean {
    // Make no está en el modelo actual, por ahora retornamos false
    // TODO: Agregar verificación de Make cuando esté disponible en el modelo
    return false;
  }

  get isTwilioConnected(): boolean {
    const user = this.userStorage.user();
    return !!(user?.twilio && user.twilio.length > 0);
  }

  // Estados del sistema
  get systemStatuses(): Array<{
    circleColor: string;
    message: string;
    textColor: string;
  }> {
    const langCode = this.i18nService.selectedLanguage().code;
    const statuses = [];

    // Sistema OK (siempre visible)
    statuses.push({
      circleColor: this.isSystemOk ? 'bg-green-500' : 'bg-red-500',
      message: this.isSystemOk
        ? langCode === 'en'
          ? 'System OK'
          : 'Sistema OK'
        : langCode === 'en'
          ? 'System Error'
          : 'Error del sistema',
      textColor: 'text-gray-800 dark:text-slate-200',
    });

    // Estado de latencia (siempre visible, cambia según valor)
    if (this.latencyMs > 0) {
      if (this.latencyMs > 2000) {
        statuses.push({
          circleColor: 'bg-orange-500',
          message:
            langCode === 'en'
              ? 'High latency in Spain'
              : 'Latencia alta en España',
          textColor: 'text-gray-800 dark:text-slate-200',
        });
      } else if (this.latencyMs > 1000) {
        statuses.push({
          circleColor: 'bg-yellow-500',
          message: langCode === 'en' ? 'Normal latency' : 'Latencia normal',
          textColor: 'text-gray-800 dark:text-slate-200',
        });
      } else {
        statuses.push({
          circleColor: 'bg-green-500',
          message: langCode === 'en' ? 'Optimal latency' : 'Latencia óptima',
          textColor: 'text-gray-800 dark:text-slate-200',
        });
      }
    } else {
      statuses.push({
        circleColor: 'bg-gray-400',
        message:
          langCode === 'en'
            ? 'Latency not available'
            : 'Latencia no disponible',
        textColor: 'text-gray-800 dark:text-slate-200',
      });
    }

    // Estado de Twilio (siempre visible, cambia según conexión)
    if (this.isTwilioConnected && !this.detailedMetricsError) {
      statuses.push({
        circleColor: 'bg-green-500',
        message: langCode === 'en' ? 'Twilio connected' : 'Twilio conectado',
        textColor: 'text-gray-800 dark:text-slate-200',
      });
    } else if (this.detailedMetricsError) {
      statuses.push({
        circleColor: 'bg-red-500',
        message:
          langCode === 'en'
            ? 'Twilio failures detected'
            : 'Fallos Twilio detectados',
        textColor: 'text-gray-800 dark:text-slate-200',
      });
    } else {
      statuses.push({
        circleColor: 'bg-red-500',
        message:
          langCode === 'en' ? 'Twilio not connected' : 'Twilio no conectado',
        textColor: 'text-gray-800 dark:text-slate-200',
      });
    }

    // Estado de uso del plan (siempre visible, cambia según porcentaje)
    // Si no hay límite configurado, usar un límite por defecto de 1000 minutos para mostrar el porcentaje
    const baseLimit = this.minutesLimit > 0 ? this.minutesLimit : 1000;
    const planLimit = baseLimit + (this.extraMinutes || 0);

    // El porcentaje no debe superar el 100% si se usan minutos extra
    const usagePercent = Math.min(
      (this.totalMinutesUsed / planLimit) * 100,
      100,
    );

    // Mostrar porcentaje con diferentes estados según el nivel
    if (usagePercent >= 90) {
      statuses.push({
        circleColor: 'bg-red-500',
        message:
          langCode === 'en'
            ? `Used ${Math.round(usagePercent)}% of the plan`
            : `Usado ${Math.round(usagePercent)}% del plan`,
        textColor: 'text-gray-800 dark:text-slate-200',
      });
    } else if (usagePercent >= 85) {
      statuses.push({
        circleColor: 'bg-yellow-500',
        message:
          langCode === 'en'
            ? `Used ${Math.round(usagePercent)}% of the plan`
            : `Usado ${Math.round(usagePercent)}% del plan`,
        textColor: 'text-gray-800 dark:text-slate-200',
      });
    } else if (usagePercent >= 70) {
      statuses.push({
        circleColor: 'bg-orange-500',
        message:
          langCode === 'en'
            ? `Used ${Math.round(usagePercent)}% of the plan`
            : `Usado ${Math.round(usagePercent)}% del plan`,
        textColor: 'text-gray-800 dark:text-slate-200',
      });
    } else if (usagePercent >= 50) {
      statuses.push({
        circleColor: 'bg-yellow-500',
        message:
          langCode === 'en'
            ? `Used ${Math.round(usagePercent)}% of the plan`
            : `Usado ${Math.round(usagePercent)}% del plan`,
        textColor: 'text-gray-800 dark:text-slate-200',
      });
    } else {
      statuses.push({
        circleColor: 'bg-green-500',
        message:
          langCode === 'en'
            ? `Used ${Math.round(usagePercent)}% of the plan`
            : `Usado ${Math.round(usagePercent)}% del plan`,
        textColor: 'text-gray-800 dark:text-slate-200',
      });
    }

    // Estado de Shopify (siempre visible)
    if (this.isShopifyConnected) {
      statuses.push({
        circleColor: 'bg-green-500',
        message: langCode === 'en' ? 'Shopify connected' : 'Shopify conectado',
        textColor: 'text-gray-800 dark:text-slate-200',
      });
    } else {
      statuses.push({
        circleColor: 'bg-gray-400',
        message:
          langCode === 'en' ? 'Shopify not connected' : 'Shopify no conectado',
        textColor: 'text-gray-800 dark:text-slate-200',
      });
    }

    return statuses;
  }

  // Getter para obtener el porcentaje de comparación semanal
  get weeklyComparisonPercentage(): number {
    return this.cachedWeeklyComparison;
  }

  // Getters para obtener las métricas del dashboard de forma segura
  get totalLlamadas(): number {
    return this.dashboardMetrics?.resumen?.total_llamadas?.actual || 0;
  }

  get totalLlamadasVariacion(): number {
    return (
      this.dashboardMetrics?.resumen?.total_llamadas?.variacionPorcentual || 0
    );
  }

  get totalLlamadasExitosas(): number {
    return this.dashboardMetrics?.resumen?.total_llamadas_exitosas?.actual || 0;
  }

  get totalLlamadasExitosasVariacion(): number {
    return (
      this.dashboardMetrics?.resumen?.total_llamadas_exitosas
        ?.variacionPorcentual || 0
    );
  }

  get minutosUltimoMes(): number {
    return this.dashboardMetrics?.resumen?.minutos_ultimo_mes?.actual || 0;
  }

  get minutosUltimoMesVariacion(): number {
    return (
      this.dashboardMetrics?.resumen?.minutos_ultimo_mes?.variacionPorcentual ||
      0
    );
  }

  get tiempoAhorrado(): number {
    return this.dashboardMetrics?.resumen?.tiempo_ahorrado?.actual || 0;
  }

  get tiempoAhorradoVariacion(): number {
    return (
      this.dashboardMetrics?.resumen?.tiempo_ahorrado?.variacionPorcentual || 0
    );
  }

  get tasaExito(): number {
    return this.dashboardMetrics?.resumen?.tasa_exito || 0;
  }

  // Método para determinar si una variación es positiva
  isVariationPositive(variation: number): boolean {
    return variation >= 0;
  }

  // Método para formatear variación porcentual
  formatVariation(variation: number): string {
    const sign = variation >= 0 ? '+' : '';
    return `${sign}${variation.toFixed(1)}%`;
  }

  // Método para obtener clases CSS para variaciones
  getVariationClasses(variation: number): string {
    const isPositive = this.isVariationPositive(variation);
    if (isPositive) {
      return 'text-green-600 bg-green-50';
    } else {
      return 'text-red-600 bg-red-50';
    }
  }

  // Método para formatear tiempo ahorrado en horas y minutos
  formatTimeSaved(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  }

  // Método para obtener horas del tiempo ahorrado
  getTimeSavedHours(minutes: number): number {
    return Math.floor(minutes / 60);
  }

  // Método para obtener minutos del tiempo ahorrado
  getTimeSavedMinutes(minutes: number): number {
    return Math.round(minutes % 60);
  }

  // Propiedades para el gráfico móvil compacto
  mobileChartData: any[] = [];
  totalCalls: number = 0;
  averageCalls: number = 0;

  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private languageChangeHandler = (event: Event) => {
    this.handleLanguageChange();
  };

  constructor() {
    this.i18nService.initializeLanguage();
    effect(() => {
      const u = this.userStorage.user();
      let rate = 0;
      if (u) {
        if (
          typeof u.extraPerMinuteEur === 'number' &&
          !Number.isNaN(u.extraPerMinuteEur)
        ) {
          rate = u.extraPerMinuteEur;
        } else {
          const nested = u.planUsage?.limits?.extraPerMinuteEur;
          if (typeof nested === 'number' && !Number.isNaN(nested)) {
            rate = nested;
          }
        }
      }
      this.costPerMinute = rate;
      this.cdr.markForCheck();
    });
  }

  /**
   * URL absoluta para banderas: en algunos móviles/WebViews las rutas tipo "assets/…"
   * respecto a la ruta actual fallan; resolver contra baseURI evita iconos en blanco.
   */
  countryFlagUrl(assetPath: string): string {
    if (!assetPath) {
      return '';
    }
    let path = assetPath.replace(/^\.\//, '');
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    if (!this.isBrowser) {
      return path;
    }
    try {
      return new URL(path, this.document.baseURI).href;
    } catch {
      return path;
    }
  }

  countryFlagBackgroundStyle(assetPath: string): { [key: string]: string } {
    const url = this.countryFlagUrl(assetPath);
    return url ? { 'background-image': `url("${url}")` } : {};
  }

  // Serie área para "Total de llamadas exitosas" (mismo diseño que en Home)
  callsAreaSeries: ApexAxisChartSeries = [{ name: 'Llamadas', data: [] }];

  // Generar fechas de los últimos 7 días (para categorías por defecto)
  getLast7Days(): string[] {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dayName = this.getDayAbbreviationForDate(date);
      const dayNumber = date.getDate();

      dates.push(`${dayName} ${dayNumber}`);
    }

    return dates;
  }

  // Generar fechas de los últimos 30 días (para futuro soporte de período extendido)
  getLast30Days(): string[] {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dayName = this.getDayAbbreviationForDate(date);
      const dayNumber = date.getDate();

      dates.push(`${dayName} ${dayNumber}`);
    }

    return dates;
  }

  // Configuración del chart: igual que en Home (Total de llamadas)
  callsAreaChart: ApexChart = {
    type: 'area',
    height: 280,
    width: '100%',
    toolbar: { show: false },
    offsetX: 5,
    offsetY: -8,
    animations: {
      enabled: true,
      speed: 300,
      animateGradually: { enabled: false },
      dynamicAnimation: { enabled: false },
    },
    redrawOnWindowResize: true,
    redrawOnParentResize: true,
    zoom: {
      enabled: false,
    },
  };

  // Obtener abreviación de día según idioma actual
  private getDayAbbreviationForDate(date: Date): string {
    const t = this.t;
    const dayNames = [t.sun, t.mon, t.tue, t.wed, t.thu, t.fri, t.sat];
    return dayNames[date.getDay()] ?? '';
  }

  // Eje X: mismo estilo que en Home
  callsAreaXAxis: ApexXAxis = {
    categories: this.getCurrentCategories(),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      show: true,
      style: {
        // Gris neutro para que se vea bien en fondo oscuro
        colors: '#9CA3AF',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      },
      offsetY: 2,
      rotate: 0,
      trim: false,
      hideOverlappingLabels: false,
    },
    crosshairs: {
      show: true,
      stroke: {
        color: 'rgba(255, 255, 255, 0.3)',
        width: 1,
        dashArray: 0,
      },
    },
    floating: false,
    position: 'bottom',
    tooltip: {
      enabled: false,
    },
  };

  // Obtener categorías según el período seleccionado
  getCurrentCategories(): string[] {
    // Por ahora, usamos siempre últimos 7 días (igual que Home)
    return this.getLast7Days();
  }

  // Datos para el gráfico: solo datos reales (dashboard o detallados)
  getCurrentData(): number[] {
    if (this.dashboardMetrics?.llamadas_exitosas_ultimos_7_dias) {
      return this.dashboardMetrics.llamadas_exitosas_ultimos_7_dias.map(
        (item) => item.total,
      );
    }
    if (this.detailedMetrics?.llamadasExitosasUltimos7Dias) {
      return this.detailedMetrics.llamadasExitosasUltimos7Dias.map(
        (item) => item.total,
      );
    }
    // Sin datos → array de ceros para mantener línea y días
    return new Array(7).fill(0);
  }

  // Eje Y: mismo estilo y dinámica que en Home
  callsAreaYAxis: any = {
    min: 0,
    max: 5,
    tickAmount: 5,
    labels: {
      style: {
        colors: '#9CA3AF',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      },
      formatter: (value: number) => value.toString(),
      offsetX: 0,
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    forceNiceScale: false,
  };

  // Trazo, grid y relleno: clonados de Home
  callsAreaStroke: ApexStroke = {
    curve: 'smooth',
    width: 3,
    colors: ['#000000'],
  };

  callsAreaDataLabels: ApexDataLabels = { enabled: false };

  callsAreaGrid: ApexGrid = {
    strokeDashArray: 3,
    borderColor: 'rgba(229, 231, 235, 0.3)',
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: false } },
    padding: {
      bottom: 14,
      left: 14,
      right: 8,
      top: 8,
    },
  };

  callsAreaFill: ApexFill = {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.3,
      opacityTo: 0,
      stops: [0, 100],
      colorStops: [
        { offset: 0, color: '#1B2559', opacity: 0.3 },
        { offset: 100, color: '#1B2559', opacity: 0 },
      ],
    },
  };

  callsAreaColors: string[] = ['#000000'];

  // Tooltip: mismo estilo que en Home
  callsAreaTooltip: any = {
    enabled: true,
    custom: function ({ series, seriesIndex, dataPointIndex }: any) {
      const value = series[seriesIndex][dataPointIndex];
      return `
        <div style="
          background: #18181A;
          color: white;
          padding: 10px 16px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 14px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
          border: none;
        ">
          ${value}
        </div>
      `;
    },
  };
  // Filtros
  periods = [this.t.last7Days];
  selectedPeriod = this.periods[0];

  agents = [this.t.all, this.t.agent1, this.t.agent2];
  selectedAgent = this.agents[0];

  // Totales
  totalMinutesUsed = 0;
  minutesLimit = 1000;
  extraMinutes = 0;
  timeSavedHours = 0;
  costPerMinute = 0; // coste medio por minuto en euros

  // Getters para UI
  get displayMinutesUsed(): number {
    return Math.round(
      Math.min(
        this.totalMinutesUsed,
        (this.minutesLimit ?? 100) + (this.extraMinutes ?? 0),
      ),
    );
  }

  get displayExtraMinutesUsed(): string {
    const val = Math.max(
      0,
      this.totalMinutesUsed -
        ((this.minutesLimit ?? 100) + (this.extraMinutes ?? 0)),
    );
    return (Math.round(val * 100) / 100).toFixed(2).replace('.', ',');
  }

  get costPerMinuteLabel(): string {
    // Formateamos con dos decimales y coma para estilo español: 0,00 €/min
    if (this.costPerMinute === 0) {
      return '0,00 €/min';
    }
    return `${this.costPerMinute.toFixed(2).replace('.', ',')} €/min`;
  }

  // Latencia
  latencyMs = 0;
  latencyMaxMs = 3000;
  /** Valor animado 0→1 para que la barra y la bola se muevan juntas (1s) */
  latencyPercentDisplay = 0;
  private latencyAnimationId: number | null = null;

  get latencyPercent(): number {
    const ratio = this.latencyMs / this.latencyMaxMs;
    return Math.max(0, Math.min(1, ratio));
  }

  get latencyLabel(): string {
    if (this.latencyMs <= 1000) return this.t.fast;
    if (this.latencyMs <= 2000) return this.t.normal;
    return this.t.slow;
  }

  get latencyBadgeClasses(): string {
    switch (this.latencyLabel) {
      case this.t.fast:
        return 'text-xs bg-green-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-status-fast';
      case this.t.normal:
        return 'text-xs bg-orange-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-status-normal';
      default:
        return 'text-xs bg-red-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-status-slow';
    }
  }

  get latencyColor(): string {
    switch (this.latencyLabel) {
      case this.t.fast:
        return '#16a34a';
      case this.t.normal:
        return '#ca8a04';
      default:
        return '#dc2626';
    }
  }

  get latencyGradient(): string {
    switch (this.latencyLabel) {
      case this.t.fast:
        return `linear-gradient(90deg, #16a34a 0%, #22c55e 100%)`;
      case this.t.normal:
        return `linear-gradient(90deg, #ca8a04 0%, #eab308 100%)`;
      default:
        return `linear-gradient(90deg, #dc2626 0%, #ef4444 100%)`;
    }
  }

  get latencyGradientStart(): string {
    switch (this.latencyLabel) {
      case this.t.fast:
        return '#4ade80'; // Verde más oscuro
      case this.t.normal:
        return '#fb923c'; // Naranja más claro
      default:
        return '#f87171'; // Rojo más claro
    }
  }

  get latencyGradientEnd(): string {
    switch (this.latencyLabel) {
      case this.t.fast:
        return '#14532d'; // Verde bosque muy oscuro
      case this.t.normal:
        return '#c2410c'; // Naranja más oscuro
      default:
        return '#991b1b'; // Rojo más oscuro
    }
  }

  // Coordenadas del marcador de latencia (usan valor animado para ir pegadas al arco)
  get latencyMarkerX(): number {
    const angle = Math.PI * (1 - this.latencyPercentDisplay);
    return 260 + 260 * Math.cos(angle);
  }

  get latencyMarkerY(): number {
    const angle = Math.PI * (1 - this.latencyPercentDisplay);
    return 320 - 260 * Math.sin(angle);
  }

  /** Anima latencyPercentDisplay de 0 al valor actual en 1s (easeOutCubic). En SSR solo asigna el valor. */
  private animateLatencyDisplay(): void {
    const target = this.latencyPercent;
    if (!this.isBrowser) {
      this.latencyPercentDisplay = target;
      this.cdr.markForCheck();
      return;
    }
    if (this.latencyAnimationId != null) {
      cancelAnimationFrame(this.latencyAnimationId);
    }
    const start = this.latencyPercentDisplay;
    const startTime = performance.now();
    const duration = 1000;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      this.latencyPercentDisplay = start + (target - start) * easeOutCubic(t);
      this.cdr.markForCheck();
      if (t < 1) this.latencyAnimationId = requestAnimationFrame(tick);
      else this.latencyAnimationId = null;
    };
    this.latencyAnimationId = requestAnimationFrame(tick);
  }

  // Método para simular cambios de latencia
  simulateLatency(newLatency: number): void {
    this.latencyMs = newLatency;
  }

  // Método para simular cambios de duración de llamadas
  simulateDuration(newDurationSeconds: number): void {
    this.averageCallDurationSeconds = newDurationSeconds;
  }

  // Duración media (texto mostrado)
  averageCallDurationSeconds = 0;
  maxCallDurationSeconds = 120; // 2 minutos máximo
  /** Valor animado 0→1 para que la barra y la bola se muevan juntas (1s) */
  durationPercentDisplay = 0;
  private durationAnimationId: number | null = null;

  get averageCallDurationLabel(): string {
    const minutes = this.averageCallDurationMinutes;
    const seconds = this.averageCallDurationSecondsOnly;

    if (minutes === 0) {
      return `${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
  }

  get averageCallDurationMinutes(): number {
    return Math.floor(this.averageCallDurationSeconds / 60);
  }

  get averageCallDurationSecondsOnly(): number {
    return Math.floor(this.averageCallDurationSeconds % 60);
  }

  get durationLabel(): string {
    const totalMinutes = this.averageCallDurationSeconds / 60;
    if (totalMinutes <= 4) return this.t.normal;
    return this.t.long;
  }

  get durationBadgeClasses(): string {
    switch (this.durationLabel) {
      case this.t.normal:
        return 'text-xs bg-green-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-duration-normal';
      case this.t.long:
        return 'text-xs bg-orange-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-duration-long';
      default:
        return 'text-xs bg-green-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-duration-normal';
    }
  }

  get durationPercent(): number {
    const ratio = this.averageCallDurationSeconds / this.maxCallDurationSeconds;
    return Math.max(0, Math.min(1, ratio));
  }

  get durationGradientStart(): string {
    switch (this.durationLabel) {
      case this.t.normal:
        return '#4ade80'; // Verde más claro (igual que latency fast)
      case this.t.long:
        return '#fb923c'; // Naranja más claro (igual que latency normal)
      default:
        return '#4ade80'; // Verde más claro
    }
  }

  get durationGradientEnd(): string {
    switch (this.durationLabel) {
      case this.t.normal:
        return '#14532d'; // Verde más oscuro (igual que latency fast)
      case this.t.long:
        return '#c2410c'; // Naranja más oscuro (igual que latency normal)
      default:
        return '#14532d'; // Verde más oscuro
    }
  }

  get durationGradient(): string {
    switch (this.durationLabel) {
      case this.t.normal:
        return `linear-gradient(90deg, #16a34a 0%, #22c55e 100%)`;
      case this.t.long:
        return `linear-gradient(90deg, #ca8a04 0%, #eab308 100%)`;
      default:
        return `linear-gradient(90deg, #16a34a 0%, #22c55e 100%)`;
    }
  }

  // Coordenadas del marcador de duración (usan valor animado para ir pegadas al arco)
  get durationMarkerX(): number {
    const angle = Math.PI * (1 - this.durationPercentDisplay);
    return 260 + 260 * Math.cos(angle);
  }

  get durationMarkerY(): number {
    const angle = Math.PI * (1 - this.durationPercentDisplay);
    return 320 - 260 * Math.sin(angle);
  }

  /** Anima durationPercentDisplay de 0 al valor actual en 1s (easeOutCubic). En SSR solo asigna el valor. */
  private animateDurationDisplay(): void {
    const target = this.durationPercent;
    if (!this.isBrowser) {
      this.durationPercentDisplay = target;
      this.cdr.markForCheck();
      return;
    }
    if (this.durationAnimationId != null) {
      cancelAnimationFrame(this.durationAnimationId);
    }
    const start = this.durationPercentDisplay;
    const startTime = performance.now();
    const duration = 1000;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      this.durationPercentDisplay = start + (target - start) * easeOutCubic(t);
      this.cdr.markForCheck();
      if (t < 1) this.durationAnimationId = requestAnimationFrame(tick);
      else this.durationAnimationId = null;
    };
    this.durationAnimationId = requestAnimationFrame(tick);
  }

  // Estado de ánimo — derivado de la tasa de éxito de las llamadas (0-100)
  get moodValue(): number {
    return Math.round(this.tasaExito);
  }

  get moodText(): string {
    if (this.moodValue >= 80) return 'Contento';
    if (this.moodValue >= 60) return 'Feliz';
    if (this.moodValue >= 40) return 'Serio';
    if (this.moodValue >= 20) return 'Triste';
    return 'Enfadado';
  }

  get moodLabel(): string {
    if (this.moodValue >= 70) return 'POSITIVO';
    if (this.moodValue >= 40) return 'NEUTRAL';
    return 'NEGATIVO';
  }

  get moodBadgeClasses(): string {
    switch (this.moodLabel) {
      case 'POSITIVO':
        return 'text-xs bg-green-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-mood-positive';
      case 'NEUTRAL':
        return 'text-xs bg-yellow-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-mood-neutral';
      case 'NEGATIVO':
        return 'text-xs bg-red-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-mood-negative';
      default:
        return 'text-xs bg-green-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-mood-positive';
    }
  }

  get moodPercent(): number {
    return Math.max(0, Math.min(1, this.moodValue / 100));
  }

  get moodGradientStart(): string {
    const mood = this.moodText;
    if (mood === 'Contento' || mood === 'Feliz') return '#22c55e'; // Verde
    if (mood === 'Serio') return '#eab308'; // Amarillo
    return '#ef4444'; // Rojo
  }

  get moodGradientEnd(): string {
    const mood = this.moodText;
    if (mood === 'Contento' || mood === 'Feliz') return '#16a34a'; // Verde más oscuro
    if (mood === 'Serio') return '#ca8a04'; // Amarillo más oscuro
    return '#dc2626'; // Rojo más oscuro
  }

  // Coordenadas del marcador de estado de ánimo al final del arco
  get moodMarkerX(): number {
    const angle = Math.PI * (1 - this.moodPercent); // de π (izq) a 0 (der)
    return 260 + 260 * Math.cos(angle);
  }

  get moodMarkerY(): number {
    const angle = Math.PI * (1 - this.moodPercent);
    return 320 - 260 * Math.sin(angle);
  }

  // Agentes creados (tabla resumen) — datos reales del backend
  get createdAgents() {
    const agentes = this.dashboardMetrics?.agentes || [];
    const totalMin = agentes.reduce(
      (acc, a) => acc + (a.minutos_totales || 0),
      0,
    );
    return agentes.map((a) => ({
      name: a.nombre,
      type: a.tipo === 'outbound' ? this.t.outbound : this.t.inbound,
      totalMin: Math.round(a.minutos_totales || 0),
      percent:
        totalMin > 0
          ? Math.round((a.minutos_totales / totalMin) * 1000) / 10
          : 0,
      status: a.estado === 'activo' ? this.t.activeStatus : this.t.draftStatus,
    }));
  }

  // Países (porcentaje y barra) - ordenados de mayor a menor
  // Datos para el gráfico de horas punta (24 horas) — derivados de callMetricsByHour real
  // Las barras empiezan desde las 4am (índice 0) hasta las 3am (índice 23)
  get popularTimesData(): Array<{
    label: string;
    busyness: number;
    isLive: boolean;
    hour: number;
  }> {
    const currentHour = new Date().getHours();

    // Acumular llamadas por hora usando datos reales si están disponibles
    const hourlyTotals = new Array(24).fill(0);
    const days = this.callMetricsByHour?.dailyPeakHours || [];
    for (const day of days) {
      if (day.hourlyCalls?.length === 24) {
        for (let h = 0; h < 24; h++) {
          hourlyTotals[h] += day.hourlyCalls[h];
        }
      }
    }
    const hasRealData = hourlyTotals.some((v) => v > 0);
    const maxCalls = hasRealData ? Math.max(...hourlyTotals) : 1;

    const hours = [];
    for (let i = 0; i < 24; i++) {
      const actualHour = (i + 4) % 24;
      let busyness: number;
      if (hasRealData) {
        busyness = Math.max(
          5,
          Math.round((hourlyTotals[actualHour] / maxCalls) * 100),
        );
      } else {
        // Fallback visual si aún no hay datos históricos suficientes
        const center = 15;
        const width = 8;
        let d = actualHour - center;
        if (d > 12) d -= 24;
        else if (d <= -12) d += 24;
        busyness = Math.max(
          5,
          Math.round(100 * Math.exp(-Math.pow(d / width, 2))),
        );
      }

      let label = '';
      if (i === 2) label = '6a';
      else if (i === 5) label = '9a';
      else if (i === 8) label = '12p';
      else if (i === 11) label = '3p';
      else if (i === 14) label = '6p';
      else if (i === 17) label = '9p';
      else if (i === 20) label = '12a';
      else if (i === 23) label = '3a';

      hours.push({
        label,
        busyness,
        isLive: actualHour === currentHour,
        hour: actualHour,
      });
    }
    return hours;
  }

  // Obtener el texto de ocupación según el nivel de busyness
  getBusynessLabel(busyness: number): string {
    const langCode = this.i18nService.selectedLanguage().code;
    if (busyness >= 80) {
      return langCode === 'en' ? 'Very busy' : 'Muy solicitado';
    }
    if (busyness >= 60) {
      return langCode === 'en' ? 'Busy' : 'Ocupado';
    }
    if (busyness >= 40) {
      return langCode === 'en' ? 'Moderate' : 'Moderado';
    }
    if (busyness >= 20) {
      return langCode === 'en' ? 'Slightly busy' : 'Poco ocupado';
    }
    return langCode === 'en' ? 'Very quiet' : 'Muy poco ocupado';
  }

  get countries() {
    const langCode = this.i18nService.selectedLanguage().code;
    const locale = langCode === 'en' ? 'en-US' : 'es-ES';

    let regionNames: Intl.DisplayNames | null = null;
    try {
      if (typeof Intl !== 'undefined' && (Intl as any).DisplayNames) {
        regionNames = new (Intl as any).DisplayNames([locale], {
          type: 'region',
        });
      }
    } catch {
      regionNames = null;
    }

    return this.cachedCountries.map((c: any) => {
      let name: string;

      if (c.isoCode && typeof c.isoCode === 'string') {
        // ZZ debe resolverse aquí: DisplayNames lo traduce como "Región desconocida"
        if (c.isoCode === 'ZZ') {
          name = langCode === 'en' ? 'Hidden number' : 'Número Oculto';
        } else if (c.isoCode.length === 2 && regionNames) {
          name = regionNames.of(c.isoCode) || c.isoCode;
        } else if (c.isoCode.startsWith('+')) {
          // Prefijo sin identificar
          name =
            langCode === 'en' ? `Country ${c.isoCode}` : `País ${c.isoCode}`;
        } else {
          name = c.isoCode;
        }
      } else {
        name = '';
      }

      return {
        ...c,
        name,
      };
    });
  }

  // Evaluación de éxito - ordenados de mayor a menor
  get successEvaluation() {
    return this.cachedSuccessEvaluation;
  }

  // Razón de finalización de la llamada - ordenados de mayor a menor
  get callCompletionReasons() {
    return this.cachedCallCompletionReasons;
  }

  // Tipo de llamadas - porcentajes dinámicos
  inboundPercentage = 0;
  outboundPercentage = 0;
  callTypeStrokeWidth = 30; // grosor de la barra
  callTypeGapDeg = 6; // hueco angular entre segmentos
  callTypeRadius = 90;

  get inboundStrokeWidth(): number {
    return this.callTypeStrokeWidth + 2; // inbound ligeramente más grueso
  }

  // Métodos para el gráfico circular de tipo de llamadas
  get circumference(): number {
    return 2 * Math.PI * this.callTypeRadius;
  }

  private degToLen(deg: number): number {
    return (this.circumference * deg) / 360;
  }

  get gapLen(): number {
    return this.degToLen(this.callTypeGapDeg);
  }

  private arcLength(percent: number): number {
    return Math.max((this.circumference * percent) / 100 - this.gapLen, 0);
  }

  get outboundArcLen(): number {
    return this.arcLength(this.outboundPercentage);
  }

  get inboundArcLen(): number {
    return this.arcLength(this.inboundPercentage);
  }

  // Marcadores de los huecos para simular que un lado pisa al otro
  get gapMarkerRadius(): number {
    return Math.max(this.callTypeStrokeWidth / 1.9 - 1);
  }

  private angleToPoint(angleDeg: number): { x: number; y: number } {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: 112 + this.callTypeRadius * Math.cos(rad),
      y: 112 + this.callTypeRadius * Math.sin(rad),
    };
  }

  get gapMarkerBetween() {
    // fin de outbound (antes de inbound)
    const outboundDeg = (this.outboundPercentage / 100) * 360;
    const angle = -90 + outboundDeg - this.callTypeGapDeg / 2;
    return this.angleToPoint(angle);
  }

  get outboundStrokeDasharray(): string {
    return `${this.outboundArcLen} ${this.circumference}`;
  }

  get inboundStrokeDasharray(): string {
    return `${this.inboundArcLen} ${this.circumference}`;
  }

  get outboundStrokeDashoffset(): number {
    // inicia en -90°, dejamos medio gap al inicio
    return this.gapLen / 2;
  }

  get inboundStrokeDashoffset(): number {
    // el arco inbound ya se rota en el SVG; solo dejamos medio gap
    return this.gapLen / 2;
  }

  // Método para simular cambios en los porcentajes de tipo de llamadas
  simulateCallTypeChange(newInboundPercent: number): void {
    this.inboundPercentage = newInboundPercent;
    this.outboundPercentage = 100 - newInboundPercent;
  }

  // Método para cambiar el período y actualizar el gráfico
  onPeriodChange(): void {
    // Solo actualizar si hay datos reales cargados
    const data = this.getCurrentData();
    this.callsAreaSeries = [{ name: 'Llamadas', data }];

    // Actualizar YAxis dinámicamente basado en los datos (si todos son 0, usar un máximo pequeño > 0)
    if (data.length > 0) {
      const maxValue = Math.max(...data);
      const safeMax = maxValue > 0 ? Math.ceil(maxValue * 1.1) : 5;
      this.callsAreaYAxis = {
        ...this.callsAreaYAxis,
        max: safeMax,
      };
    }

    // Actualizar datos del gráfico móvil
    this.updateMobileChartData();

    const isLast30Days = this.selectedPeriod === 'Últimos 30 días';
    const isMobile = this.isBrowser && window.innerWidth < 640;
    const isVeryWide = this.isBrowser && window.innerWidth >= 1920;
    const mobileWeekLikeHome = isMobile && !isLast30Days;

    this.callsAreaChart = {
      ...this.callsAreaChart,
      height: isMobile ? 280 : isVeryWide ? 320 : 220,
      // Móvil 7 días: mismo offset que Home para centrar el trazo; 30 días: sin desplazar
      offsetX: isMobile ? (mobileWeekLikeHome ? 5 : 0) : 5,
      offsetY: isMobile ? -4 : -8,
    };

    const chartPad = isMobile
      ? mobileWeekLikeHome
        ? { top: 2, left: 18, right: 8, bottom: 6 }
        : { top: 2, left: 8, right: 12, bottom: 6 }
      : isVeryWide
        ? { top: 10, right: 10, bottom: 40, left: 20 }
        : { top: 8, right: 8, bottom: 14, left: 14 };
    this.callsAreaGrid = {
      ...this.callsAreaGrid,
      padding: {
        ...this.callsAreaGrid.padding,
        ...chartPad,
      },
    };

    // En móvil con 7 días, mismo criterio que Home (sin rotar; ejes limpios)
    this.callsAreaXAxis = {
      ...this.callsAreaXAxis,
      categories: this.getCurrentCategories(),
      axisBorder: { show: mobileWeekLikeHome ? false : true },
      axisTicks: { show: mobileWeekLikeHome ? false : true },
      labels: {
        show: true,
        style: {
          colors: mobileWeekLikeHome ? '#000000' : '#6B7280',
          fontSize: mobileWeekLikeHome
            ? '11px'
            : isMobile
              ? '8px'
              : isLast30Days
                ? '9px'
                : '11px',
          fontWeight: mobileWeekLikeHome ? 600 : 500,
        },
        offsetY: mobileWeekLikeHome ? 0 : 2,
        rotate: mobileWeekLikeHome
          ? 0
          : isMobile
            ? -30
            : isLast30Days
              ? -45
              : 0,
        trim: false,
        hideOverlappingLabels: !isLast30Days,
      },
      crosshairs: mobileWeekLikeHome
        ? {
            show: true,
            stroke: {
              color: 'rgba(255, 255, 255, 0.3)',
              width: 1,
              dashArray: 0,
            },
          }
        : { show: false },
    };

    this.callsAreaYAxis = {
      ...this.callsAreaYAxis,
      labels: {
        ...this.callsAreaYAxis.labels,
        offsetX: mobileWeekLikeHome ? 0 : isMobile ? -8 : 0,
      },
    };
  }

  // Método para cargar métricas del dashboard
  loadDashboardMetrics(): void {
    // Prevenir múltiples llamadas
    if (this.hasLoadedDashboardMetrics || this.isLoadingDashboardMetrics) {
      return;
    }

    this.isLoadingDashboardMetrics = true;
    this.dashboardMetricsError = '';
    this.hasLoadedDashboardMetrics = true;
    this.metricsService.setLoading(true);

    this.metricsService.getDashboardMetrics().subscribe({
      next: (data: DashboardMetrics) => {
        this.dashboardMetrics = data;
        this.updateComponentWithDashboardData();
        this.isLoadingDashboardMetrics = false;
        this.metricsService.setLoading(false);
      },
      error: (error) => {
        if (this.isBrowser && error?.status !== 401) {
          console.error('Error loading dashboard metrics:', error);
        }
        this.dashboardMetricsError =
          'Error al cargar las métricas del dashboard';
        this.isLoadingDashboardMetrics = false;
        this.metricsService.setLoading(false);
        this.hasLoadedDashboardMetrics = false; // Permitir reintentar en caso de error

        // Limpiar datos del gráfico en caso de error pero manteniendo días y línea base
        this.callsAreaSeries = [
          { name: 'Llamadas', data: this.getCurrentData() },
        ];
        this.totalMinutesUsed = 0;
        this.timeSavedHours = 0;
        this.updateMobileChartData();
      },
    });
  }

  // Método para actualizar el componente con los datos del dashboard
  private updateComponentWithDashboardData(): void {
    if (!this.dashboardMetrics) return;

    // Actualizar datos del gráfico con llamadas exitosas
    const data = this.dashboardMetrics.llamadas_exitosas_ultimos_7_dias.map(
      (item) => item.total,
    );
    this.callsAreaSeries = [
      {
        name: 'Llamadas Exitosas',
        data: data,
      },
    ];

    // Actualizar YAxis dinámicamente basado en los datos
    if (data.length > 0) {
      const maxValue = Math.max(...data);
      this.callsAreaYAxis = {
        ...this.callsAreaYAxis,
        max: Math.ceil(maxValue * 1.1), // 10% más para espacio visual
      };
    }

    // Actualizar categorías del gráfico con nombres de días traducidos
    this.callsAreaXAxis = {
      ...this.callsAreaXAxis,
      categories: this.dashboardMetrics.llamadas_exitosas_ultimos_7_dias.map(
        (item) => {
          const date = new Date(item.fecha);
          const dayName = this.getDayAbbreviationForDate(date);
          return `${dayName} ${date.getDate()}`;
        },
      ),
    };

    // Consumo del mes: mismo valor que el dashboard (backend alinea `minutesByMonth` con llamadas_registradas)
    const twilioMinutes =
      this.dashboardMetrics.resumen.minutos_ultimo_mes.actual;
    this.totalMinutesUsed = twilioMinutes;

    // Calcular tiempo ahorrado (minutos * 2.5)
    const timeSavedMinutes =
      this.dashboardMetrics.resumen.tiempo_ahorrado.actual;
    this.timeSavedHours = Math.round((timeSavedMinutes / 60) * 10) / 10;

    // Actualizar datos móviles
    this.updateMobileChartData();
  }

  // Método para cargar métricas detalladas de Twilio
  loadDetailedMetrics(): void {
    // Prevenir múltiples llamadas
    if (this.hasLoadedDetailedMetrics || this.isLoadingDetailedMetrics) {
      return;
    }

    this.isLoadingDetailedMetrics = true;
    this.detailedMetricsError = '';
    this.hasLoadedDetailedMetrics = true;
    this.metricsService.setLoading(true);

    this.metricsService.getTwilioDetailedMetrics().subscribe({
      next: (data: TwilioDetailedMetrics) => {
        this.detailedMetrics = data;
        this.updateComponentWithDetailedData();
        this.isLoadingDetailedMetrics = false;
        this.metricsService.setLoading(false);
      },
      error: (error) => {
        // 403: plan Starter/gratis con panel básico; el dashboard ya aporta el resumen permitido
        if (error?.status === 403) {
          this.isLoadingDetailedMetrics = false;
          this.metricsService.setLoading(false);
          return;
        }
        if (this.isBrowser && error?.status !== 401) {
          console.error('Error loading detailed metrics:', error);
        }
        this.detailedMetricsError = 'Error al cargar las métricas detalladas';
        this.isLoadingDetailedMetrics = false;
        this.metricsService.setLoading(false);
        this.hasLoadedDetailedMetrics = false; // Permitir reintentar en caso de error

        // Mantener el gráfico de total de llamadas con los datos disponibles del dashboard (o ceros)
        const data = this.getCurrentData();
        this.callsAreaSeries = [{ name: 'Llamadas', data }];

        // Recalcular eje Y con datos seguros
        if (data.length > 0) {
          const maxValue = Math.max(...data);
          const safeMax = maxValue > 0 ? Math.ceil(maxValue * 1.1) : 5;
          this.callsAreaYAxis = {
            ...this.callsAreaYAxis,
            max: safeMax,
          };
        }

        // Resetear otras métricas que sí dependen de Twilio detallado
        this.totalMinutesUsed = 0;
        this.timeSavedHours = 0;
        this.latencyMs = 0;
        this.averageCallDurationSeconds = 0;
        this.inboundPercentage = 0;
        this.outboundPercentage = 0;
        this.cachedCountries = [];
        // Mantener tarjetas de evaluación y razones con filas base al 0%
        this.cachedSuccessEvaluation = [
          { name: 'Exitoso', percent: 0, color: 'bg-green-500' },
          { name: 'Parcial', percent: 0, color: 'bg-yellow-500' },
          { name: 'Fallido', percent: 0, color: 'bg-red-500' },
        ];
        this.cachedCallCompletionReasons = [
          {
            name: 'Completada exitosamente',
            percent: 0,
            color: 'bg-blue-500',
          },
          { name: 'Cliente colgó', percent: 0, color: 'bg-orange-500' },
          { name: 'Error técnico', percent: 0, color: 'bg-red-500' },
          { name: 'Tiempo agotado', percent: 0, color: 'bg-gray-500' },
        ];
        this.updateMobileChartData();
      },
    });
  }

  // Método para actualizar el componente con los datos detallados
  private updateComponentWithDetailedData(): void {
    if (!this.detailedMetrics) return;

    const hasDashboardCalls =
      !!this.dashboardMetrics?.llamadas_exitosas_ultimos_7_dias &&
      this.dashboardMetrics.llamadas_exitosas_ultimos_7_dias.length > 0;

    // Solo usamos los datos detallados para el gráfico principal
    // si NO tenemos datos del dashboard. Así evitamos que el
    // gráfico se "reinicie" dos veces al cargar la página.
    if (!hasDashboardCalls) {
      // Actualizar datos del gráfico de llamadas exitosas
      const data = this.detailedMetrics.llamadasExitosasUltimos7Dias.map(
        (item) => item.total,
      );
      this.callsAreaSeries = [
        {
          name: 'Llamadas',
          data: data,
        },
      ];

      // Actualizar YAxis dinámicamente basado en los datos
      if (data.length > 0) {
        const maxValue = Math.max(...data);
        this.callsAreaYAxis = {
          ...this.callsAreaYAxis,
          max: Math.ceil(maxValue * 1.1), // 10% más para espacio visual
        };
      }

      // Actualizar categorías del gráfico con nombres de días traducidos
      this.callsAreaXAxis = {
        ...this.callsAreaXAxis,
        categories: this.detailedMetrics.llamadasExitosasUltimos7Dias.map(
          (item) => {
            const date = new Date(item.fecha);
            const dayName = this.getDayAbbreviationForDate(date);
            return `${dayName} ${date.getDate()}`;
          },
        ),
      };
    }

    const twilioDetailedMinutes = this.detailedMetrics.totalMinutosUltimoMes;
    this.totalMinutesUsed =
      this.dashboardMetrics?.resumen?.minutos_ultimo_mes?.actual ??
      twilioDetailedMinutes;

    this.averageCallDurationSeconds = Math.round(
      this.detailedMetrics.duracionMediaLlamadas * 60,
    );

    // Calcular porcentajes de tipo de llamadas a partir de conteos absolutos del backend
    const totalCallTypes =
      this.detailedMetrics.tiposLlamadas.inbound +
      this.detailedMetrics.tiposLlamadas.outbound;
    if (totalCallTypes > 0) {
      this.inboundPercentage =
        Math.round(
          (this.detailedMetrics.tiposLlamadas.inbound / totalCallTypes) *
            100 *
            10,
        ) / 10;
      this.outboundPercentage =
        Math.round(
          (this.detailedMetrics.tiposLlamadas.outbound / totalCallTypes) *
            100 *
            10,
        ) / 10;
    }

    // Calcular y cachear todos los valores
    this.calculateCachedValues();

    // Procesar métricas de horas pico si están disponibles
    if (this.detailedMetrics.callMetricsByHour) {
      this.callMetricsByHour = this.detailedMetrics.callMetricsByHour;
      this.selectedPeakDay =
        this.callMetricsByHour.dailyPeakHours[this.selectedDayIndex] || null;
      this.peakHourStats = this.callMetricsService.calculateAdditionalMetrics(
        this.callMetricsByHour,
      );
    } else {
      console.error(
        '⚠️ callMetricsByHour no disponible en los datos del endpoint',
      );
    }

    // Actualizar datos móviles solo si el gráfico principal
    // está usando también los datos detallados
    if (!hasDashboardCalls) {
      this.updateMobileChartData();
    }
  }

  // Método para calcular y cachear todos los valores de métricas
  private calculateCachedValues(): void {
    if (!this.detailedMetrics) return;

    // Calcular comparación semanal
    if (this.detailedMetrics.resumenComparativoSemanal) {
      this.cachedWeeklyComparison =
        this.detailedMetrics.resumenComparativoSemanal.variacionPorcentual;
    }

    // Actualizar latencia con valor real del backend
    this.latencyMs = this.detailedMetrics.latenciaMedia || 0;

    // Animar barra y bola de latencia y duración cuando ya hay datos (por si las secciones se mostraron antes)
    if (this.showLatencia || this.showDuracionMedia) {
      setTimeout(() => {
        if (this.showLatencia) this.animateLatencyDisplay();
        if (this.showDuracionMedia) this.animateDurationDisplay();
      }, 0);
    }

    // Calcular países (guardamos ISO y bandera; el nombre se resuelve según idioma)
    this.cachedCountries = this.detailedMetrics.paisesOrigen
      .map((pais) => {
        let isoCode = '';
        let countryFlag = '';

        // Mapeo de prefijos a ISO y banderas
        const countryMapping: {
          [key: string]: { isoCode: string; flag: string };
        } = {
          '1': { isoCode: 'US', flag: 'assets/eeuu.webp' },
          '34': { isoCode: 'ES', flag: 'assets/spain.webp' },
          '33': { isoCode: 'FR', flag: 'assets/france.webp' },
          '44': { isoCode: 'GB', flag: 'assets/united-kingdom.webp' },
          '55': { isoCode: 'BR', flag: 'assets/brasil.webp' },
          '52': { isoCode: 'MX', flag: 'assets/mexico.webp' },
          '39': { isoCode: 'IT', flag: 'assets/italy.webp' },
          '49': { isoCode: 'DE', flag: 'assets/germany.webp' },
          '351': { isoCode: 'PT', flag: 'assets/portugal.webp' },
          '31': { isoCode: 'NL', flag: 'assets/netherlands.webp' },
          '41': { isoCode: 'CH', flag: 'assets/switzerland.webp' },
          '43': { isoCode: 'AT', flag: 'assets/austria.webp' },
          '32': { isoCode: 'BE', flag: 'assets/belgium.webp' },
          '46': { isoCode: 'SE', flag: 'assets/sweden.webp' },
          '47': { isoCode: 'NO', flag: 'assets/norway.webp' },
          '45': { isoCode: 'DK', flag: 'assets/denmark.webp' },
          '358': { isoCode: 'FI', flag: 'assets/finland.webp' },
          '48': { isoCode: 'PL', flag: 'assets/poland.webp' },
          '420': { isoCode: 'CZ', flag: 'assets/czech.webp' },
          '36': { isoCode: 'HU', flag: 'assets/hungary.webp' },
          '40': { isoCode: 'RO', flag: 'assets/romania.webp' },
          '30': { isoCode: 'GR', flag: 'assets/greece.webp' },
          '90': { isoCode: 'TR', flag: 'assets/turkey.webp' },
          '7': { isoCode: 'RU', flag: 'assets/russia.webp' },
          '81': { isoCode: 'JP', flag: 'assets/japan.webp' },
          '82': { isoCode: 'KR', flag: 'assets/korea.webp' },
          '86': { isoCode: 'CN', flag: 'assets/china.webp' },
          '91': { isoCode: 'IN', flag: 'assets/india.webp' },
          '61': { isoCode: 'AU', flag: 'assets/australia.webp' },
          '64': { isoCode: 'NZ', flag: 'assets/newzealand.webp' },
          '27': { isoCode: 'ZA', flag: 'assets/southafrica.webp' },
          '54': { isoCode: 'AR', flag: 'assets/argentina.webp' },
          '56': { isoCode: 'CL', flag: 'assets/chile.webp' },
          '57': { isoCode: 'CO', flag: 'assets/colombia.webp' },
          '58': { isoCode: 'VE', flag: 'assets/venezuela.webp' },
          '51': { isoCode: 'PE', flag: 'assets/peru.webp' },
          '598': { isoCode: 'UY', flag: 'assets/uruguay.webp' },
          '593': { isoCode: 'EC', flag: 'assets/ecuador.webp' },
          '507': { isoCode: 'PA', flag: 'assets/panama.webp' },
          '506': { isoCode: 'CR', flag: 'assets/costarica.webp' },
          '503': { isoCode: 'SV', flag: 'assets/elsalvador.webp' },
          '502': { isoCode: 'GT', flag: 'assets/guatemala.webp' },
          '501': { isoCode: 'BZ', flag: 'assets/belize.webp' },
          '53': { isoCode: 'CU', flag: 'assets/cuba.webp' },
          '1-809': {
            isoCode: 'DO',
            flag: 'assets/dominican.webp',
          },
          '1-787': { isoCode: 'PR', flag: 'assets/puertorico.webp' },
          '1-876': { isoCode: 'JM', flag: 'assets/jamaica.webp' },
          '1-868': { isoCode: 'TT', flag: 'assets/trinidad.webp' },
          'SIN IDENTIFICAR': {
            isoCode: 'ZZ',
            flag: 'assets/predeterminada.webp',
          },
        };

        const mappedCountry = countryMapping[pais.pais];

        if (mappedCountry) {
          isoCode = mappedCountry.isoCode;
          countryFlag = mappedCountry.flag;
        } else {
          // Prefijo no mapeado: guardamos el prefijo para mostrarlo luego
          isoCode = `+${pais.pais}`;
          countryFlag = 'assets/default.webp';
        }

        return {
          isoCode,
          img: countryFlag,
          percent: Math.round(pais.porcentaje * 10) / 10, // Redondear a 1 decimal
        };
      })
      .sort((a, b) => b.percent - a.percent);

    // Calcular evaluación de éxito
    const totalSuccess =
      this.detailedMetrics.evaluacionExito.exitosas +
      this.detailedMetrics.evaluacionExito.parciales +
      this.detailedMetrics.evaluacionExito.fallidas;

    if (totalSuccess > 0) {
      this.cachedSuccessEvaluation = [
        {
          name: 'Exitoso',
          percent:
            Math.round(
              (this.detailedMetrics.evaluacionExito.exitosas / totalSuccess) *
                100 *
                10,
            ) / 10,
          color: 'bg-green-500',
        },
        {
          name: 'Parcial',
          percent:
            Math.round(
              (this.detailedMetrics.evaluacionExito.parciales / totalSuccess) *
                100 *
                10,
            ) / 10,
          color: 'bg-yellow-500',
        },
        {
          name: 'Fallido',
          percent:
            Math.round(
              (this.detailedMetrics.evaluacionExito.fallidas / totalSuccess) *
                100 *
                10,
            ) / 10,
          color: 'bg-red-500',
        },
      ].sort((a, b) => b.percent - a.percent);
    } else {
      // Sin datos: mostrar las mismas filas con barras al 0%
      this.cachedSuccessEvaluation = [
        { name: 'Exitoso', percent: 0, color: 'bg-green-500' },
        { name: 'Parcial', percent: 0, color: 'bg-yellow-500' },
        { name: 'Fallido', percent: 0, color: 'bg-red-500' },
      ];
    }

    // Calcular razones de finalización (valores son conteos absolutos del backend)
    const rf = this.detailedMetrics.razonesFinalizacion;
    const totalReasons =
      rf.completada +
      rf.clienteColgo +
      (rf.sinRespuesta ?? 0) +
      (rf.silencio ?? 0) +
      rf.errorTecnico +
      rf.tiempoAgotado;

    if (totalReasons > 0) {
      this.cachedCallCompletionReasons = [
        {
          name: 'Completada exitosamente',
          percent: Math.round((rf.completada / totalReasons) * 100 * 10) / 10,
          color: 'bg-blue-500',
        },
        {
          name: 'Cliente colgó',
          percent: Math.round((rf.clienteColgo / totalReasons) * 100 * 10) / 10,
          color: 'bg-orange-500',
        },
        {
          name: 'Sin respuesta',
          percent:
            Math.round(((rf.sinRespuesta ?? 0) / totalReasons) * 100 * 10) / 10,
          color: 'bg-yellow-500',
        },
        {
          name: 'Silencio prolongado',
          percent:
            Math.round(((rf.silencio ?? 0) / totalReasons) * 100 * 10) / 10,
          color: 'bg-purple-500',
        },
        {
          name: 'Error técnico',
          percent: Math.round((rf.errorTecnico / totalReasons) * 100 * 10) / 10,
          color: 'bg-red-500',
        },
        {
          name: 'Tiempo agotado',
          percent:
            Math.round((rf.tiempoAgotado / totalReasons) * 100 * 10) / 10,
          color: 'bg-gray-500',
        },
      ].sort((a, b) => b.percent - a.percent);
    } else {
      // Sin datos: mostrar las mismas filas con barras al 0%
      this.cachedCallCompletionReasons = [
        { name: 'Completada exitosamente', percent: 0, color: 'bg-blue-500' },
        { name: 'Cliente colgó', percent: 0, color: 'bg-orange-500' },
        { name: 'Sin respuesta', percent: 0, color: 'bg-yellow-500' },
        { name: 'Silencio prolongado', percent: 0, color: 'bg-purple-500' },
        { name: 'Error técnico', percent: 0, color: 'bg-red-500' },
        { name: 'Tiempo agotado', percent: 0, color: 'bg-gray-500' },
      ];
    }

    this.hasCachedData = true;
  }

  // Método para crear animación escalonada en las barras de países
  getCountryBarDelay(index: number): number {
    return index * 200; // 200ms de delay entre cada barra
  }

  // Método para determinar el color del estado según el número de llamadas
  getStatusColor(value: number): string {
    if (value < 100) {
      return 'bg-red-500'; // Bajo - Rojo
    } else if (value < 200) {
      return 'bg-orange-500'; // Medio - Naranja
    } else {
      return 'bg-green-500'; // Alto - Verde
    }
  }

  // Método para actualizar los datos del gráfico móvil
  updateMobileChartData(): void {
    const data = this.getCurrentData();
    const categories = this.getCurrentCategories();

    // Si no hay datos, dejar todo en 0
    if (data.length === 0) {
      this.totalCalls = 0;
      this.averageCalls = 0;
      this.mobileChartData = [];
      return;
    }

    const maxValue = Math.max(...data);

    // Calcular totales y promedios
    this.totalCalls = data.reduce((sum, value) => sum + value, 0);
    this.averageCalls = Math.round(this.totalCalls / data.length);

    // Mostrar todos los días con scroll horizontal
    this.mobileChartData = data.map((value, index) => ({
      label: categories[index],
      value: value,
      percentage: Math.round((value / maxValue) * 100),
    }));
  }

  private getCurrentMonthKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  ngOnInit(): void {
    // Inicializar límite de minutos con el del usuario
    const user = this.userStorage.user();
    if (user && user.minutesLimit !== undefined) {
      this.minutesLimit = user.minutesLimit;
    }
    if (user && user.extraMinutes !== undefined) {
      this.extraMinutes = user.extraMinutes;
    }

    // Solo en navegador: el prerender SSR no tiene token y llenaría la consola de 401
    if (this.isBrowser) {
      this.loadDashboardMetrics();
      this.loadDetailedMetrics();
      this.metricsService.checkSystemHealth().subscribe((isOk) => {
        this.isSystemOk = isOk;
        this.cdr.markForCheck();
      });
    }

    // Inicializar datos del gráfico móvil
    this.updateMobileChartData();

    // Ajustar gráfico para móviles
    if (this.isBrowser) {
      this.updateChartForScreenSize();
      window.addEventListener('resize', () => this.updateChartForScreenSize());
      window.addEventListener('languageChanged', this.languageChangeHandler);
    }

    // Ejecutar animaciones escalonadas
    this.startFadeInAnimations();
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      if (this.latencyAnimationId != null) {
        cancelAnimationFrame(this.latencyAnimationId);
        this.latencyAnimationId = null;
      }
      if (this.durationAnimationId != null) {
        cancelAnimationFrame(this.durationAnimationId);
        this.durationAnimationId = null;
      }
    }
    // Limpiar event listeners y prevenir memory leaks
    if (
      this.isBrowser &&
      typeof window !== 'undefined' &&
      window.removeEventListener
    ) {
      window.removeEventListener('resize', this.updateChartForScreenSize);
      window.removeEventListener('languageChanged', this.languageChangeHandler);
    }
    // Resetear flags para permitir nuevas cargas si el componente se vuelve a crear
    this.hasLoadedDetailedMetrics = false;
    this.isLoadingDetailedMetrics = false;
    this.hasLoadedDashboardMetrics = false;
    this.isLoadingDashboardMetrics = false;
  }

  private updateChartForScreenSize(): void {
    const width = window.innerWidth;
    const isMobile = width < 640;
    const isVeryWide = width >= 1920;

    const isLast30DaysResize = this.selectedPeriod === 'Últimos 30 días';
    const mobileWeekLikeHomeResize = isMobile && !isLast30DaysResize;

    this.callsAreaChart = {
      ...this.callsAreaChart,
      height: isMobile ? 280 : isVeryWide ? 320 : 220,
      offsetX: isMobile ? (mobileWeekLikeHomeResize ? 5 : 0) : 5,
      offsetY: isMobile ? -4 : -8,
    };

    const chartPadResize = isMobile
      ? mobileWeekLikeHomeResize
        ? { top: 2, left: 18, right: 8, bottom: 6 }
        : { top: 2, left: 8, right: 12, bottom: 6 }
      : isVeryWide
        ? { top: 10, right: 10, bottom: 40, left: 20 }
        : { top: 8, right: 8, bottom: 14, left: 14 };
    this.callsAreaGrid = {
      ...this.callsAreaGrid,
      padding: {
        ...this.callsAreaGrid.padding,
        ...chartPadResize,
      },
    };

    this.callsAreaXAxis = {
      ...this.callsAreaXAxis,
      labels: {
        ...this.callsAreaXAxis.labels,
        style: {
          colors: mobileWeekLikeHomeResize ? '#000000' : '#6B7280',
          fontSize: mobileWeekLikeHomeResize
            ? '11px'
            : isMobile
              ? '9px'
              : '11px',
          fontWeight: mobileWeekLikeHomeResize ? 600 : 500,
        },
        offsetY: mobileWeekLikeHomeResize ? 0 : 2,
        rotate: mobileWeekLikeHomeResize ? 0 : isMobile ? -30 : 0,
      },
    };

    this.callsAreaYAxis = {
      ...this.callsAreaYAxis,
      labels: {
        ...this.callsAreaYAxis.labels,
        offsetX: mobileWeekLikeHomeResize ? 0 : isMobile ? -8 : 0,
      },
    };
  }

  // Actualizar textos dependientes del idioma (filtros, categorías, etc.)
  private handleLanguageChange(): void {
    // Actualizar etiquetas de filtros
    this.periods = [this.t.last7Days];
    this.selectedPeriod = this.periods[0];

    this.agents = [this.t.all, this.t.agent1, this.t.agent2];
    if (!this.agents.includes(this.selectedAgent)) {
      this.selectedAgent = this.agents[0];
    }

    // Actualizar categorías del gráfico principal usando los datos cargados
    if (
      this.dashboardMetrics?.llamadas_exitosas_ultimos_7_dias &&
      this.dashboardMetrics.llamadas_exitosas_ultimos_7_dias.length > 0
    ) {
      this.updateComponentWithDashboardData();
    } else if (
      this.detailedMetrics?.llamadasExitosasUltimos7Dias &&
      this.detailedMetrics.llamadasExitosasUltimos7Dias.length > 0
    ) {
      this.updateComponentWithDetailedData();
    } else {
      // Si no hay datos del backend, usar las funciones locales
      this.callsAreaXAxis = {
        ...this.callsAreaXAxis,
        categories: this.getCurrentCategories(),
      };
    }

    // Actualizar datos del gráfico móvil (labels con días traducidos)
    this.updateMobileChartData();
  }

  private startFadeInAnimations(): void {
    // Solo ejecutar en el navegador
    if (!this.isBrowser) {
      this.showAllSectionsImmediately();
      return;
    }

    // Orden de aparición = rejilla visible en lg (y la mayor parte de breakpoints):
    // fila a fila, izquierda → derecha (ver metrics.component.html).
    const stepMs = 200;
    const t = (i: number) => 100 + i * stepMs;

    let i = 0;
    setTimeout(() => {
      this.showGraficoLlamadas = true;
    }, t(i++));

    setTimeout(() => {
      this.showTotalMinutos = true;
    }, t(i++));

    setTimeout(() => {
      this.showLatencia = true;
      this.cdr.markForCheck();
      setTimeout(() => this.animateLatencyDisplay(), 0);
    }, t(i++));

    setTimeout(() => {
      this.showDuracionMedia = true;
      this.cdr.markForCheck();
      setTimeout(() => this.animateDurationDisplay(), 0);
    }, t(i++));

    setTimeout(() => {
      this.showTipoLlamadas = true;
    }, t(i++));

    // Fila siguiente: horas pico (cols 1–2) antes que países (col 3)
    setTimeout(() => {
      this.showHorasPico = true;
    }, t(i++));

    setTimeout(() => {
      this.showPaises = true;
    }, t(i++));

    setTimeout(() => {
      this.showEvaluacionExito = true;
    }, t(i++));

    setTimeout(() => {
      this.showRazonFinalizacion = true;
    }, t(i++));

    setTimeout(() => {
      this.showEstadoAnimo = true;
    }, t(i++));

    setTimeout(() => {
      this.showAgentesCreados = true;
    }, t(i++));
  }

  private showAllSectionsImmediately(): void {
    // Mostrar todas las secciones y animar barra+bola de latencia y duración
    this.showGraficoLlamadas = true;
    this.showTotalMinutos = true;
    this.showLatencia = true;
    this.showDuracionMedia = true;
    this.showTipoLlamadas = true;
    this.showPaises = true;
    this.showEstadoAnimo = true;
    this.showEvaluacionExito = true;
    this.showRazonFinalizacion = true;
    this.showHorasPico = true;
    this.showAgentesCreados = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.animateLatencyDisplay();
      this.animateDurationDisplay();
    }, 0);
  }

  // Métodos para controlar el tooltip de horas punta
  showTooltip(index: number): void {
    this.hoveredHourIndex = index;
  }

  hideTooltip(): void {
    this.hoveredHourIndex = null;
  }

  // Métodos para manejar las métricas de horas pico
  onDayChange(dayIndex: number): void {
    this.selectedDayIndex = dayIndex;
    if (this.callMetricsByHour) {
      this.selectedPeakDay =
        this.callMetricsByHour.dailyPeakHours[dayIndex] || null;
    }
  }

  formatPeakHour(hour: number): string {
    return this.callMetricsService.formatHour(hour);
  }

  getDayName(dateString: string): string {
    return this.callMetricsService.getDayName(dateString);
  }

  // Obtener datos de horas pico para el día seleccionado (si no hay datos, 24 barras a 0%)
  getPeakHoursData(): Array<{
    hour: number;
    label: string;
    calls: number;
    percentage: number;
  }> {
    if (!this.selectedPeakDay || !this.selectedPeakDay.hourlyCalls?.length) {
      return Array.from({ length: 24 }, (_, hour) => ({
        hour,
        label: this.formatPeakHour(hour),
        calls: 0,
        percentage: 0,
      }));
    }

    const maxCalls = Math.max(...this.selectedPeakDay.hourlyCalls);
    return this.selectedPeakDay.hourlyCalls.map((calls, hour) => ({
      hour,
      label: this.formatPeakHour(hour),
      calls,
      percentage: maxCalls > 0 ? (calls / maxCalls) * 100 : 0,
    }));
  }

  // Obtener el color según la intensidad de llamadas
  getPeakHourColor(percentage: number): string {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-orange-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-green-500';
    return 'bg-gray-300';
  }
}
