import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  effect,
  NgZone,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { I18nService } from '../../core/services/i18n.service';
import { MetricsService } from '../../core/services/metrics.service';
import { AgentsService } from '../../core/services/agents.service';
import { UserService } from '../../core/services/user.service';
import { UserStorage } from '../../storages/user/user-storage';
import { planDisplayLabelFromTranslations } from '../../shared/utils/plan-display.util';
import { requiresSubscriptionPaywall } from '../../shared/utils/plan-usage.util';
import { ModalService } from '../../shared/modals/modal.service';
import { POST_ONBOARDING_DASHBOARD_CELEBRATION_KEY } from '../../core/constants/first-agent-tour.constants';
import {
  PLAN_TIER_STORAGE_KEY,
  type PaidUpgradePlanId,
} from '../../shared/modals/upgrade-plan-modal/pricing-plan-features';
import { FirstAgentTourService } from '../../core/services/first-agent-tour.service';
import { NotificationService } from '../../core/services/notification.service';
import { DashboardMetrics } from '../../shared/models/dashboard-metrics.model';
import { Agent } from '../../shared/models/agent.model';
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
  imports: [CommonModule, NgApexchartsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private i18nService = inject(I18nService);
  private metricsService = inject(MetricsService);
  private agentsService = inject(AgentsService);
  private userService = inject(UserService);
  private userStorage = inject(UserStorage);
  private modalService = inject(ModalService);
  private firstAgentTour = inject(FirstAgentTourService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  // Obtener usuario actual
  user = this.userStorage.user;

  dashboardMetrics: DashboardMetrics | null = null;
  isLoadingMetrics: boolean = false;
  userAgents: Agent[] = [];

  /** Valores animados (conteo 0 → objetivo) para las tarjetas KPI */
  displayTotalCalls = 0;
  displaySuccessfulCalls = 0;
  displayMinutesMonth = 0;
  displayTimeSaved = 0;
  displaySuccessRate = 0;

  private kpiAnimFrameId: number | null = null;

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  /** Nombre del plan bajo «Minutos» (Growth, Scale, etc.), no el texto fijo Plan Starter. */
  get minutesPlanDisplayName(): string {
    return planDisplayLabelFromTranslations(
      this.userStorage.user()?.plan,
      this.t,
      {
        trialActive: this.userStorage.user()?.planUsage?.trialActive === true,
      },
    );
  }

  // Obtener idioma actual
  get currentLanguage() {
    return this.i18nService.getCurrentLanguage();
  }

  // Variables para controlar las animaciones de fade in
  showResumen: boolean = false;
  showAgentesActivos: boolean = false;
  showLlamadasPorDia: boolean = false;
  currentChartHeight: number = 280;

  // Guardar el último breakpoint para evitar re-renders innecesarios durante el resize
  private lastBreakpoint: string = '';
  private isBrowser: boolean;
  private resizeListener = () => this.updateChartOptions();
  private routerEventsSub?: Subscription;
  /** Un solo resize tras varios eventos seguidos (evita 2–3 repintados del gráfico). */
  private chartReflowDebouncer: ReturnType<typeof setTimeout> | null = null;

  get summary() {
    // Si hay datos del backend, usarlos
    if (this.dashboardMetrics) {
      return {
        totalCalls: this.dashboardMetrics.resumen.total_llamadas.actual,
        callsDeltaPct:
          this.dashboardMetrics.resumen.total_llamadas.variacionPorcentual,
        timeSavedHours: this.dashboardMetrics.resumen.tiempo_ahorrado.actual,
        timeSavedDeltaPct:
          this.dashboardMetrics.resumen.tiempo_ahorrado.variacionPorcentual,
        minutesUsed: this.dashboardMetrics.resumen.minutos_ultimo_mes.actual,
        minutesDeltaPct:
          this.dashboardMetrics.resumen.minutos_ultimo_mes.variacionPorcentual,
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

  /**
   * Barra «minutos restantes»: ancho = cupo restante (no consumido).
   * Si superas el límite, 0 % de relleno.
   */
  get minutesRemainingBarPercent(): number {
    const totalLimit = this.user()?.minutesLimit ?? 100;
    const used = this.displayMinutesMonth;
    
    if (totalLimit <= 0) {
      return 0;
    }
    
    const remaining = totalLimit - used;
    if (remaining <= 0) {
      return 0;
    }
    return Math.min(100, (remaining / totalLimit) * 100);
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
        this.dashboardMetrics = data;
        this.isLoadingMetrics = false;
        this.animateKpiCounters();

        // Actualizar datos de llamadas por día
        this.updateCallsByDay(data);

        // Actualizar datos del gráfico principal y forzar recálculo de opciones
        this.updateMainChart(data);
        this.updateChartOptions();
        // Tras pintar datos, forzar reflow (el fade-in y ApexCharts compiten por el layout)
        this.scheduleChartReflow();
      },
      error: (error) => {
        this.isLoadingMetrics = false;

        if (this.isBrowser) {
          console.error('❌ Error al cargar métricas:', error);

          // Si el error es 401 (token inválido o expirado)
          if (error.status === 401) {
            console.error(
              '🔒 Token inválido o expirado. Verifica que estés autenticado.',
            );

            // Verificar si hay token en localStorage
            const token = localStorage.getItem('token');
            if (!token) {
              console.error(
                '❌ No hay token en localStorage. Redirigiendo al login...',
              );
              // Opcional: redirigir al login si no hay token
              // window.location.href = '/login';
            } else {
              console.warn(
                '⚠️ Token existe pero está expirado o es inválido. Considera refrescar el token.',
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
    const counts = this.buildSevenDayCallTotals(data);
    this.callsByDayCounts = counts;
    const maxCalls = Math.max(...counts, 1);
    this.callsByDayPercentages = counts.map((count) =>
      Math.round((count / maxCalls) * 100),
    );
    this.updateSparklineCharts(data);
  }

  // Actualizar gráficos sparkline con datos reales
  private updateSparklineCharts(data: DashboardMetrics): void {
    const callsData = this.buildSevenDayCallTotals(data);
    this.callsSparklineSeries = [{ name: 'Llamadas', data: callsData }];
    this.timeSavedSparklineSeries = [{ name: 'Tiempo', data: callsData }];
    this.minutesSparklineSeries = [{ name: 'Minutos', data: callsData }];
  }

  /** Fecha local YYYY-MM-DD (alineada con el backend). */
  private formatLocalYmd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * Siempre 7 puntos, unidos por fecha con las categorías del eje X.
   * Evita series más cortas que las categorías (ApexCharts puede quedar en blanco).
   */
  private buildSevenDayCallTotals(data: DashboardMetrics | null): number[] {
    const rows = data?.llamadas_exitosas_ultimos_7_dias ?? [];
    const map = new Map(rows.map((r) => [r.fecha, r.total]));
    const out: number[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = this.formatLocalYmd(d);
      out.push(map.get(key) ?? 0);
    }
    return out;
  }

  // Actualizar gráfico principal con datos reales (siempre 7 valores)
  private updateMainChart(data: DashboardMetrics): void {
    const totals = this.buildSevenDayCallTotals(data);
    this.callsAreaSeries = [{ name: 'Llamadas', data: totals }];
    this.callsAreaYAxis = {
      ...this.callsAreaYAxis,
      min: 0,
      max: this.getMaxDataValue(),
      tickAmount: 5,
    };
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
  get maxBarHeight(): number {
    // Detectar si estamos en pantalla 3xl usando window.innerWidth
    if (typeof window !== 'undefined' && window.innerWidth >= 1920) {
      return 280; // Más alto en 3xl
    }
    return 200; // Altura normal
  }

  // Método para obtener el estilo de las barras según el tamaño de pantalla
  getBarStyle(): { width: string; maxWidth: string } {
    if (typeof window !== 'undefined' && window.innerWidth >= 1920) {
      return { width: '56px', maxWidth: '64px' }; // Más ancho en 3xl
    }
    return { width: '36px', maxWidth: '42px' }; // Ancho normal
  }

  // Porcentajes de llamadas por día (0-100%) - inicializados vacíos para evitar mostrar datos ficticios
  callsByDayPercentages: number[] = [0, 0, 0, 0, 0, 0, 0];
  // Número de llamadas por día - inicializados en cero para evitar mostrar datos ficticios
  callsByDayCounts: number[] = [0, 0, 0, 0, 0, 0, 0];

  // Configuraciones de gráficos sparkline (inicialmente en cero hasta que llegue el backend)
  callsSparklineSeries: ApexAxisChartSeries = [
    { name: 'Llamadas', data: [0, 0, 0, 0, 0, 0, 0] },
  ];
  timeSavedSparklineSeries: ApexAxisChartSeries = [
    { name: 'Tiempo', data: [0, 0, 0, 0, 0, 0, 0] },
  ];
  minutesSparklineSeries: ApexAxisChartSeries = [
    { name: 'Minutos', data: [0, 0, 0, 0, 0, 0, 0] },
  ];

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

  // Serie mini área para "Total de llamadas exitosas"
  callsAreaSeries: ApexAxisChartSeries = [
    { name: 'Llamadas', data: this.getCurrentData() },
  ];

  // Generar fechas de los últimos 7 días
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

  // Generar fechas de los últimos 30 días
  getLast30Days(): string[] {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dayName = this.getDayAbbreviationForDate(date);
      const dayNumber = date.getDate();

      // Mostrar todos los días
      dates.push(`${dayName} ${dayNumber}`);
    }

    return dates;
  }

  // Obtener abreviación de día según idioma actual
  private getDayAbbreviationForDate(date: Date): string {
    const t = this.t;
    const dayNames = [t.sun, t.mon, t.tue, t.wed, t.thu, t.fri, t.sat];
    return dayNames[date.getDay()] ?? '';
  }

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

  callsAreaStroke: ApexStroke = {
    curve: 'smooth',
    width: 3,
    // Negro por defecto (modo claro); en modo oscuro se sobreescribe vía CSS a blanco
    colors: ['#000000'],
  };

  callsAreaDataLabels: ApexDataLabels = { enabled: false };

  callsAreaGrid: ApexGrid = {
    strokeDashArray: 3,
    borderColor: 'rgba(229, 231, 235, 0.3)',
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: false } },
    padding: {
      bottom: 20,
      left: 20,
      right: 10,
      top: 10,
    },
  };

  // Obtener categorías según el período seleccionado (reactivo al idioma)
  getCurrentCategories(): string[] {
    return this.getLast7Days();
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Actualizar categorías del gráfico solo cuando cambie el idioma (evita parpadeo)
    effect(() => {
      this.i18nService.selectedLanguage();
      this.callsAreaXAxis = {
        ...this.callsAreaXAxis,
        categories: this.getCurrentCategories(),
      };
    });
  }

  // Obtener datos según el período seleccionado
  getCurrentData(): number[] {
    return this.buildSevenDayCallTotals(this.dashboardMetrics);
  }

  // Calcular el mínimo del eje Y: si el mínimo de datos es >= 100, usar la centena inferior, si no, usar 0
  getMinDataValue(): number {
    const data = this.getCurrentData();
    const minData = Math.min(...data);

    if (minData >= 100) {
      // Redondear hacia abajo a la centena más cercana
      return Math.floor(minData / 100) * 100;
    } else {
      // Si es menor a 100, empezar desde 0
      return 0;
    }
  }

  // Calcular el máximo del eje Y de forma dinámica para que sea más realista
  getMaxDataValue(): number {
    const data = this.getCurrentData();
    const maxData = Math.max(...data);

    // Añadir un 20% de margen sobre el valor máximo para mejor visualización
    const maxValue = Math.ceil(maxData * 1.2);

    // Redondear hacia arriba a la siguiente decena más cercana para números más limpios
    const rounded = Math.ceil(maxValue / 10) * 10;
    // min=0 y max=0 rompe el área en Apex; obligamos a un rango visible
    return Math.max(rounded, 10);
  }

  callsAreaXAxis: ApexXAxis = {
    categories: this.getCurrentCategories(),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      show: true,
      style: {
        // Negro por defecto (modo claro); en modo oscuro se sobreescribe vía CSS
        colors: '#000000',
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

  callsAreaYAxis: any = {
    min: 0,
    max: this.getMaxDataValue(),
    tickAmount: 5,
    labels: {
      style: {
        // Negro por defecto (modo claro); en modo oscuro se sobreescribe vía CSS
        colors: '#000000',
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

  // Degradado del área: negro por defecto (modo claro). En modo oscuro se invierte por CSS.
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

  // Color base de la serie (negro en modo claro); en modo oscuro se fuerza a blanco por CSS
  callsAreaColors: string[] = ['#000000'];

  // Configuración del tooltip personalizado
  callsAreaTooltip: any = {
    enabled: true,
    custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
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

  // Calcular alturas basadas en porcentajes
  get callsByDayHeights(): number[] {
    return this.callsByDayPercentages.map((percentage) =>
      Math.round((percentage / 100) * this.maxBarHeight),
    );
  }

  // Método para obtener la altura del gráfico según el tamaño de pantalla
  getChartHeight(): number {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width >= 2500) return 440;
      if (width >= 1920) return 350;
    }
    return 280;
  }

  // Método para actualizar las opciones del gráfico según el tamaño de ventana
  updateChartOptions(): void {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;

    // Determinar el breakpoint actual
    let currentBreakpoint = 'normal';
    let fontSize = '11px';
    let fontWeight = 600;
    let bottomPadding = 0;
    let chartHeight = 280;

    if (width >= 2500) {
      currentBreakpoint = '4xl';
      fontSize = '16px';
      fontWeight = 700;
      bottomPadding = 5;
      chartHeight = 440;
    } else if (width >= 1920) {
      currentBreakpoint = '3xl';
      fontSize = '14px';
      fontWeight = 700;
      bottomPadding = 10;
      chartHeight = 350;
    }

    // SI EL BREAKPOINT NO HA CAMBIADO, NO HACEMOS NADA (evita parpadeos y bugs)
    if (this.lastBreakpoint === currentBreakpoint) return;
    this.lastBreakpoint = currentBreakpoint;
    this.currentChartHeight = chartHeight;

    // Actualizar configuración del gráfico
    if (this.callsAreaChart) {
      this.callsAreaChart = {
        ...this.callsAreaChart,
        height: chartHeight
      };
    }

    // Forzar a ApexCharts a recalcular su tamaño disparando un resize global
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('resize'));
      }
    }, 100);

    // Actualizar XAxis (fuentes)
    if (this.callsAreaXAxis) {
      this.callsAreaXAxis = {
        ...this.callsAreaXAxis,
        labels: {
          ...this.callsAreaXAxis.labels,
          style: {
            ...this.callsAreaXAxis.labels?.style,
            fontSize: fontSize,
            fontWeight: fontWeight
          }
        }
      };
    }

    // Actualizar Grid (padding para que no se corten las letras)
    if (this.callsAreaGrid) {
      this.callsAreaGrid = {
        ...this.callsAreaGrid,
        padding: {
          ...this.callsAreaGrid.padding,
          bottom: bottomPadding
        }
      };
    }

    // Actualizar YAxis (fuentes)
    if (this.callsAreaYAxis) {
      this.callsAreaYAxis = {
        ...this.callsAreaYAxis,
        labels: {
          ...this.callsAreaYAxis.labels,
          style: {
            ...this.callsAreaYAxis.labels?.style,
            fontSize: fontSize,
            fontWeight: fontWeight
          }
        }
      };
    }
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
    phone: string | null;
    minutes: number;
    percent: number;
    status: string;
    active: boolean;
    outerColor: string;
    innerColor: string;
  }> {
    // Si hay agentes del usuario, usarlos
    if (this.userAgents && this.userAgents.length > 0) {
      const totalMinutes = this.userAgents.reduce(
        (sum, agent) => sum + (agent.totalMinutes || 0),
        0,
      );

      return this.userAgents.map((agent) => {
        const minutes = agent.totalMinutes || 0;
        const percent =
          totalMinutes > 0
            ? Math.round((minutes / totalMinutes) * 100 * 10) / 10
            : 0;

        const isActive = agent.state === 'Activo';
        const phone = agent.phoneNumbers
          ? `${agent.phoneNumbers.countryCode} ${agent.phoneNumbers.number}`
          : null;

        return {
          name: agent.name,
          type: agent.type === 'inbound' ? this.t.inbound : this.t.outbound,
          phone,
          minutes: minutes,
          percent: percent,
          status: isActive ? this.t.active : this.t.draft,
          active: isActive,
          outerColor: isActive ? '#1E3A8A80' : '#EDEDED',
          innerColor: isActive ? '#1E3A8A' : '#C5CAC4',
        };
      });
    }

    // Si no hay agentes, devolver array vacío
    return [];
  }

  ngOnInit(): void {
    // Los gráficos ya tienen datos por defecto, pero si no hay datos del backend,
    // se mantendrán los datos por defecto que ya están inicializados

    // Cargar métricas solo si estamos en el navegador (no en SSR)
    if (this.isBrowser) {
      this.handleStripeReturnQuery();
      this.tryPostOnboardingDashboardCelebration();
      this.loadMetrics();
      this.loadUserAgents();
      // Actualizar opciones del gráfico según el tamaño de pantalla (altura, fuentes, etc)
      this.updateChartOptions();
      // Escuchar cambios de tamaño de ventana
      window.addEventListener('resize', this.resizeListener);

      // Al volver desde otras secciones (ej. knowledge-base), forzar recarga/reflow del gráfico.
      this.routerEventsSub = this.router.events.subscribe((event) => {
        if (
          event instanceof NavigationEnd &&
          event.urlAfterRedirects.startsWith('/dashboard/home')
        ) {
          this.loadMetrics();
        }
      });
    }

    // Ejecutar animaciones siempre
    this.startFadeInAnimations();
  }

  /**
   * Tras completar company-setup: mismo modal de celebración que en cuenta (Stripe success).
   */
  private tryPostOnboardingDashboardCelebration(): void {
    if (!this.isBrowser) {
      return;
    }
    let shouldOpen = false;
    try {
      shouldOpen =
        sessionStorage.getItem(POST_ONBOARDING_DASHBOARD_CELEBRATION_KEY) === '1';
      if (shouldOpen) {
        sessionStorage.removeItem(POST_ONBOARDING_DASHBOARD_CELEBRATION_KEY);
      }
    } catch {
      return;
    }
    if (!shouldOpen) {
      return;
    }
    const plan = this.resolvePaidPlanForCelebrationModal();
    try {
      localStorage.removeItem(PLAN_TIER_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (!plan) {
      return;
    }
    setTimeout(() => {
      this.modalService.openPlanUpgradeCelebration({ plan });
    }, 200);
  }

  private resolvePaidPlanForCelebrationModal(): PaidUpgradePlanId | null {
    if (this.isBrowser) {
      try {
        const stored = localStorage
          .getItem(PLAN_TIER_STORAGE_KEY)
          ?.trim()
          .toLowerCase();
        if (
          stored === 'starter' ||
          stored === 'growth' ||
          stored === 'scale'
        ) {
          return stored;
        }
      } catch {
        /* ignore */
      }
    }
    const raw = this.user()?.plan?.trim().toLowerCase() ?? '';
    if (raw === 'starter' || raw === 'growth' || raw === 'scale') {
      return raw;
    }
    return null;
  }

  /** Vuelta desde Stripe (cancel) o enlaces antiguos a /billing: aviso y/o modal de precios. */
  private handleStripeReturnQuery(): void {
    void firstValueFrom(this.route.queryParams.pipe(take(1))).then(
      (params) => {
        const stripe = params['stripe'];
        const pricing = params['pricing'];
        const hasStripeCancel = stripe === 'cancel';
        const hasPricing = pricing === '1' || pricing === 'true';

        if (!hasStripeCancel && !hasPricing) {
          return;
        }

        if (hasStripeCancel) {
          this.notificationService.info(this.t.stripeCheckoutCancelled);
        }
        if (hasPricing) {
          setTimeout(() => {
            if (requiresSubscriptionPaywall(this.userStorage.user())) {
              this.modalService.openUpgradePlanPaywall();
            } else {
              this.modalService.openUpgradePlan();
            }
          }, 0);
        }
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { stripe: null, pricing: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      },
    );
  }

  ngOnDestroy(): void {
    this.cancelKpiAnimation();
    this.routerEventsSub?.unsubscribe();
    if (this.chartReflowDebouncer != null) {
      clearTimeout(this.chartReflowDebouncer);
      this.chartReflowDebouncer = null;
    }
    if (this.isBrowser) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  /**
   * Fuerza un único recálculo de tamaño en ApexCharts. Varias llamadas seguidas
   * (datos listos + panel visible con fade-in) se fusionan en un solo resize.
   */
  private scheduleChartReflow(): void {
    if (!this.isBrowser) return;

    this.callsAreaSeries = [...this.callsAreaSeries];
    this.callsAreaChart = { ...this.callsAreaChart };

    if (this.chartReflowDebouncer != null) {
      clearTimeout(this.chartReflowDebouncer);
    }
    this.chartReflowDebouncer = setTimeout(() => {
      this.chartReflowDebouncer = null;
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    }, 120);
  }

  private cancelKpiAnimation(): void {
    if (this.kpiAnimFrameId != null && this.isBrowser) {
      cancelAnimationFrame(this.kpiAnimFrameId);
      this.kpiAnimFrameId = null;
    }
  }

  /** Conteo suave ease-out al cargar métricas (solo navegador) */
  private animateKpiCounters(): void {
    if (!this.isBrowser || !this.dashboardMetrics) {
      return;
    }

    const r = this.dashboardMetrics.resumen;
    const targets = {
      totalCalls: r.total_llamadas.actual,
      successful: r.total_llamadas_exitosas.actual,
      minutes: Math.round(r.minutos_ultimo_mes.actual),
      timeSaved: Math.round(r.tiempo_ahorrado.actual),
      successRate: Math.round(r.tasa_exito),
    };

    this.cancelKpiAnimation();

    this.ngZone.run(() => {
      this.displayTotalCalls = 0;
      this.displaySuccessfulCalls = 0;
      this.displayMinutesMonth = 0;
      this.displayTimeSaved = 0;
      this.displaySuccessRate = 0;
    });

    const durationMs = 1100;
    const t0 = performance.now();

    const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x));

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      const ease = easeOutExpo(t);

      this.ngZone.run(() => {
        this.displayTotalCalls = Math.round(targets.totalCalls * ease);
        this.displaySuccessfulCalls = Math.round(targets.successful * ease);
        this.displayMinutesMonth = Math.round(targets.minutes * ease);
        this.displayTimeSaved = Math.round(targets.timeSaved * ease);
        this.displaySuccessRate = Math.round(targets.successRate * ease);
      });

      if (t < 1) {
        this.kpiAnimFrameId = requestAnimationFrame(step);
      } else {
        this.ngZone.run(() => {
          this.displayTotalCalls = targets.totalCalls;
          this.displaySuccessfulCalls = targets.successful;
          this.displayMinutesMonth = targets.minutes;
          this.displayTimeSaved = targets.timeSaved;
          this.displaySuccessRate = targets.successRate;
        });
        this.kpiAnimFrameId = null;
      }
    };

    this.kpiAnimFrameId = requestAnimationFrame(step);
  }

  // Cargar agentes del usuario
  private loadUserAgents(): void {
    this.agentsService.getAgentsList().subscribe({
      next: (response) => {
        this.userAgents = response.agents || [];
      },
      error: (error) => {
        console.error('❌ Error al obtener agentes en dashboard:', error);
        this.userAgents = [];
      },
    });
  }

  // Propiedades para controlar la animación de cada panel
  showWelcomePanel: boolean = false;
  showTotalCallsPanel: boolean = false;
  showMinutesPanel: boolean = false;
  showChartPanel: boolean = false;
  showAdPanel: boolean = false;
  showEmptyPanel: boolean = false;
  showCallsByDayPanel: boolean = false;

  private startFadeInAnimations(): void {
    // Verificar si estamos en el navegador de manera más robusta
    const isInBrowser = typeof window !== 'undefined' && window.localStorage;

    if (!isInBrowser) {
      this.showAllSectionsImmediately();
      return;
    }

    // Primera fila: de izquierda a derecha
    // Panel Bienvenido (izquierda)
    setTimeout(() => {
      this.showWelcomePanel = true;
    }, 100);

    // Panel Total de llamadas (derecha, primera columna)
    setTimeout(() => {
      this.showTotalCallsPanel = true;
    }, 200);

    // Panel Minutos (derecha, segunda columna)
    setTimeout(() => {
      this.showMinutesPanel = true;
    }, 300);

    // Segunda fila: de izquierda a derecha
    // Panel Gráfico (izquierda)
    setTimeout(() => {
      this.showChartPanel = true;
      this.scheduleChartReflow();
    }, 400);

    // Panel Anuncio (derecha, superior)
    setTimeout(() => {
      this.showAdPanel = true;
    }, 500);

    // Panel Vacío (derecha, inferior)
    setTimeout(() => {
      this.showEmptyPanel = true;
    }, 600);

    // Tercera fila: Panel Llamadas por día
    setTimeout(() => {
      this.showCallsByDayPanel = true;
    }, 700);

    // Tras el fade del panel Bienvenido (100 ms) y el resto de la secuencia (hasta 700 ms): margen antes del tour.
    setTimeout(() => {
      this.firstAgentTour.notifyHomeWelcomeSequenceComplete();
    }, 900);
  }

  private showAllSectionsImmediately(): void {
    // Mostrar todas las secciones inmediatamente sin animación
    this.showWelcomePanel = true;
    this.showTotalCallsPanel = true;
    this.showMinutesPanel = true;
    this.showChartPanel = true;
    this.showAdPanel = true;
    this.showEmptyPanel = true;
    this.showCallsByDayPanel = true;
    this.showResumen = true;
    this.showAgentesActivos = true;
    this.showLlamadasPorDia = true;
  }

  // Método para navegar a crear agente
  navigateToCreateAgent(): void {
    this.router.navigateByUrl('/dashboard/agents/create');
  }

  // Método genérico para navegar
  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  // Abrir modal de upgrade plan desde el dashboard home
  openUpgradePlanModal(): void {
    this.modalService.openUpgradePlan();
  }
}
