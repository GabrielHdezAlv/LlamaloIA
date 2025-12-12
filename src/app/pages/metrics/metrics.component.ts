import { Component, inject, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss',
})
export class MetricsComponent implements OnInit {
  private i18nService = inject(I18nService);

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  // Variables para controlar las animaciones de fade in
  showGraficoLlamadas: boolean = false;
  showTotalMinutos: boolean = false;
  showLatencia: boolean = false;
  showDuracionMedia: boolean = false;
  showTipoLlamadas: boolean = false;
  showAgentesCreados: boolean = false;
  showPaises: boolean = false;

  // Propiedades para el gráfico móvil compacto
  mobileChartData: any[] = [];
  totalCalls: number = 0;
  averageCalls: number = 0;

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.i18nService.initializeLanguage();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

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

      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const dayName = dayNames[date.getDay()];
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

      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const dayName = dayNames[date.getDay()];
      const dayNumber = date.getDate();

      // Mostrar todos los días
      dates.push(`${dayName} ${dayNumber}`);
    }

    return dates;
  }

  // Generar datos aleatorios para los últimos 30 días
  getLast30DaysData(): number[] {
    const data: number[] = [];
    const baseValue = 200;

    for (let i = 0; i < 30; i++) {
      // Simular tendencia más realista con picos y valles
      const trend = Math.sin(i * 0.15) * 60; // Onda suave
      const weeklyPattern = Math.sin(i * 0.9) * 40; // Patrón semanal
      const random = (Math.random() - 0.5) * 80; // Variación aleatoria
      const value = Math.max(
        50,
        Math.min(400, baseValue + trend + weeklyPattern + random)
      );
      data.push(Math.round(value));
    }

    return data;
  }

  callsAreaChart: ApexChart = {
    type: 'area',
    height: 320,
    width: '100%',
    toolbar: { show: false },
    offsetX: 0,
    offsetY: -10,
    animations: {
      enabled: true,
      speed: 300,
      animateGradually: { enabled: false },
      dynamicAnimation: { enabled: false },
    },
    redrawOnWindowResize: true,
    redrawOnParentResize: true,
  };

  callsAreaStroke: ApexStroke = {
    curve: 'smooth',
    width: 3,
    colors: ['#1E3A8A'],
  };
  callsAreaDataLabels: ApexDataLabels = { enabled: false };
  callsAreaGrid: ApexGrid = {
    strokeDashArray: 3,
    borderColor: '#E5E7EB',
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: {
      bottom: 20,
    },
  };
  callsAreaXAxis: ApexXAxis = {
    categories: this.getCurrentCategories(),
    axisBorder: { show: true },
    axisTicks: { show: true },
    labels: {
      show: true,
      style: {
        colors: '#6B7280',
        fontSize: '11px',
        fontWeight: 500,
      },
      offsetY: 5,
      rotate: 0,
      trim: false,
      hideOverlappingLabels: false,
    },
    crosshairs: {
      show: false,
    },
  };

  // Obtener categorías según el período seleccionado
  getCurrentCategories(): string[] {
    if (this.selectedPeriod === 'Últimos 30 días') {
      return this.getLast30Days();
    }
    return this.getLast7Days();
  }

  // Obtener datos según el período seleccionado
  getCurrentData(): number[] {
    if (this.selectedPeriod === 'Últimos 30 días') {
      return this.getLast30DaysData();
    }
    return [120, 280, 180, 350, 160, 320, 250];
  }
  callsAreaYAxis: any = {
    min: 0,
    max: 400,
    tickAmount: 4,
    labels: {
      style: { colors: '#6B7280', fontSize: '12px' },
      formatter: (value: number) => value.toString(),
    },
  };
  callsAreaFill: ApexFill = {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.1,
      stops: [0, 100],
      colorStops: [
        { offset: 0, color: '#1E3A8A', opacity: 0.4 },
        { offset: 100, color: '#1E3A8A', opacity: 0.1 },
      ],
    },
  };
  callsAreaColors: string[] = ['#1E3A8A'];

  // Configuración del tooltip personalizado
  callsAreaTooltip: any = {
    enabled: true,
    custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
      const value = series[seriesIndex][dataPointIndex];
      return `
        <div style="
          background: #1F2937;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          position: relative;
        ">
          ${value}
          <div style="
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 4px solid #1F2937;
          "></div>
        </div>
      `;
    },
  };
  // Filtros
  periods = [
    this.t.last7Days,
    this.t.last30Days,
    this.t.thisMonth,
    this.t.lastYear,
  ];
  selectedPeriod = this.periods[0];

  agents = [this.t.all, this.t.agent1, this.t.agent2];
  selectedAgent = this.agents[0];

  // Totales
  totalMinutesUsed = 714;
  minutesLimit = 1000;
  extraMinutes = 0;
  timeSavedHours = 49;
  costPerMinute = 0.12; // coste medio por minuto en euros

  get costPerMinuteLabel(): string {
    // Formateamos con dos decimales y coma para estilo español: 0,12 €/min
    return `${this.costPerMinute.toFixed(2).replace('.', ',')} €/min`;
  }

  // Latencia
  latencyMs = 1999;
  latencyMaxMs = 3000;

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

  // Coordenadas del marcador de latencia al final del arco
  get latencyMarkerX(): number {
    const angle = Math.PI * (1 - this.latencyPercent); // de π (izq) a 0 (der)
    return 260 + 260 * Math.cos(angle);
  }

  get latencyMarkerY(): number {
    const angle = Math.PI * (1 - this.latencyPercent);
    return 320 - 260 * Math.sin(angle);
  }

  // Método para simular cambios de latencia
  simulateLatency(newLatency: number): void {
    this.latencyMs = newLatency;
  }

  // Método para simular cambios de duración de llamadas
  simulateDuration(newDurationSeconds: number): void {
    this.averageCallDurationSeconds = newDurationSeconds;
  }

  // Simulación de latencia en tiempo real
  startLatencySimulation(): void {
    setInterval(() => {
      // Simular variaciones realistas de latencia
      const baseLatency = 1200;
      const variation = Math.random() * 800 - 400; // ±400ms de variación
      const newLatency = Math.max(200, Math.min(3000, baseLatency + variation));

      this.latencyMs = Math.round(newLatency);
    }, 2000); // Actualizar cada 2 segundos
  }

  // Duración media (texto mostrado)
  averageCallDurationSeconds = 184; // 4 minutos y 10 segundos en segundos
  maxCallDurationSeconds = 300; // 5 minutos máximo

  get averageCallDurationLabel(): string {
    const minutes = Math.floor(this.averageCallDurationSeconds / 60);
    const seconds = this.averageCallDurationSeconds % 60;

    if (minutes === 0) {
      return `${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
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
        return '#22c55e'; // Verde
      case this.t.long:
        return '#f59e0b'; // Naranja
      default:
        return '#22c55e'; // Verde
    }
  }

  get durationGradientEnd(): string {
    switch (this.durationLabel) {
      case this.t.normal:
        return '#16a34a'; // Verde más oscuro
      case this.t.long:
        return '#d97706'; // Naranja más oscuro
      default:
        return '#16a34a'; // Verde más oscuro
    }
  }

  // Coordenadas del marcador de duración al final del arco (semicírculo grande)
  get durationMarkerX(): number {
    const angle = Math.PI * (1 - this.durationPercent); // de π (izq) a 0 (der)
    return 260 + 260 * Math.cos(angle);
  }

  get durationMarkerY(): number {
    const angle = Math.PI * (1 - this.durationPercent);
    return 320 - 260 * Math.sin(angle);
  }


  // Agentes creados (tabla resumen)
  get createdAgents() {
    return [
      {
        name: 'Carla',
        type: this.t.inbound,
        totalMin: 530,
        percent: 25.4,
        status: this.t.activeStatus,
      },
      {
        name: 'Carla',
        type: this.t.outbound,
        totalMin: 250,
        percent: 8.9,
        status: this.t.draftStatus,
      },
    ];
  }

  // Países (porcentaje y barra) - ordenados de mayor a menor
  get countries() {
    return [
      { name: this.t.unitedStates, img: 'assets/eeuu.png', percent: 65.5 },
      { name: this.t.france, img: 'assets/france.png', percent: 57.5 },
      { name: this.t.spain, img: 'assets/spain.png', percent: 45.2 },
      {
        name: this.t.unitedKingdom,
        img: 'assets/united-kingdom.png',
        percent: 33.2,
      },
      { name: this.t.brazil, img: 'assets/brasil.png', percent: 25.8 },
    ].sort((a, b) => b.percent - a.percent);
  }

  // Tipo de llamadas - porcentajes dinámicos
  inboundPercentage = 57.2;
  outboundPercentage = 42.8;
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
    return Math.max(this.callTypeStrokeWidth / 1.9 - 1 );
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
    this.callsAreaSeries = [{ name: 'Llamadas', data: this.getCurrentData() }];

    // Actualizar datos del gráfico móvil
    this.updateMobileChartData();

    const isLast30Days = this.selectedPeriod === 'Últimos 30 días';
    const isMobile = this.isBrowser && window.innerWidth < 640;

    // Actualizar altura del gráfico
    this.callsAreaChart = {
      ...this.callsAreaChart,
      height: isMobile ? 280 : 320,
    };

    this.callsAreaXAxis = {
      ...this.callsAreaXAxis,
      categories: this.getCurrentCategories(),
      axisBorder: { show: true },
      axisTicks: { show: true },
      labels: {
        show: true,
        style: {
          colors: '#6B7280',
          fontSize: isMobile ? '8px' : isLast30Days ? '9px' : '11px',
          fontWeight: 500,
        },
        offsetY: 5,
        rotate: isMobile ? -30 : isLast30Days ? -45 : 0,
        trim: false,
        hideOverlappingLabels: !isLast30Days,
      },
      crosshairs: {
        show: false,
      },
    };
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

  ngOnInit(): void {
    // Inicializar datos del gráfico móvil
    this.updateMobileChartData();

    // Ajustar gráfico para móviles
    if (this.isBrowser) {
      this.updateChartForScreenSize();
      window.addEventListener('resize', () => this.updateChartForScreenSize());
    }

    // Ejecutar animaciones siempre
    this.startFadeInAnimations();
    this.preventScrollOnChart();
  }

  private updateChartForScreenSize(): void {
    const isMobile = window.innerWidth < 640;

    this.callsAreaChart = {
      ...this.callsAreaChart,
      height: isMobile ? 280 : 320,
    };

    this.callsAreaXAxis = {
      ...this.callsAreaXAxis,
      labels: {
        ...this.callsAreaXAxis.labels,
        style: {
          colors: '#6B7280',
          fontSize: isMobile ? '9px' : '11px',
          fontWeight: 500,
        },
        rotate: isMobile ? -30 : 0,
      },
    };
  }

  // Prevenir scroll de página cuando se hace zoom en el gráfico
  preventScrollOnChart() {
    if (!this.isBrowser) return;

    setTimeout(() => {
      const chartContainer = document.querySelector('.chart-container');
      if (chartContainer) {
        chartContainer.addEventListener(
          'wheel',
          (e) => {
            e.preventDefault();
            e.stopPropagation();
          },
          { passive: false }
        );
      }
    }, 100);
  }

  private startFadeInAnimations(): void {
    // Solo ejecutar en el navegador
    if (!this.isBrowser) {
      this.showAllSectionsImmediately();
      return;
    }

    // Gráfico de llamadas aparece primero (100ms)
    setTimeout(() => {
      this.showGraficoLlamadas = true;
    }, 100);

    // Total Minutos aparece después (300ms)
    setTimeout(() => {
      this.showTotalMinutos = true;
    }, 300);

    // Latencia aparece después (500ms)
    setTimeout(() => {
      this.showLatencia = true;
    }, 500);

    // Duración media aparece después (700ms)
    setTimeout(() => {
      this.showDuracionMedia = true;
    }, 700);

    // Tipo de llamadas aparece después (900ms)
    setTimeout(() => {
      this.showTipoLlamadas = true;
    }, 900);

    // Agentes Creados aparece después (1100ms)
    setTimeout(() => {
      this.showAgentesCreados = true;
    }, 1100);

    // Países aparece después (1300ms)
    setTimeout(() => {
      this.showPaises = true;
    }, 1300);
  }

  private showAllSectionsImmediately(): void {
    // Mostrar todas las secciones inmediatamente sin animación
    this.showGraficoLlamadas = true;
    this.showTotalMinutos = true;
    this.showLatencia = true;
    this.showDuracionMedia = true;
    this.showTipoLlamadas = true;
    this.showAgentesCreados = true;
    this.showPaises = true;
  }
}
