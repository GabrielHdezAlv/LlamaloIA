import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexStroke, ApexDataLabels, ApexGrid, ApexXAxis, ApexFill } from 'ng-apexcharts';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss'
})
export class MetricsComponent implements OnInit {
  // Variables para controlar las animaciones de fade in
  showGraficoLlamadas: boolean = false;
  showTotalMinutos: boolean = false;
  showLatencia: boolean = false;
  showDuracionMedia: boolean = false;
  showTipoLlamadas: boolean = false;
  showAgentesCreados: boolean = false;
  showPaises: boolean = false;

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
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
    const baseValue = 500;
    
    for (let i = 0; i < 30; i++) {
      // Simular tendencia más realista con picos y valles
      const trend = Math.sin(i * 0.15) * 150; // Onda suave
      const weeklyPattern = Math.sin(i * 0.9) * 100; // Patrón semanal
      const random = (Math.random() - 0.5) * 200; // Variación aleatoria
      const value = Math.max(200, Math.min(1000, baseValue + trend + weeklyPattern + random));
      data.push(Math.round(value));
    }
    
    return data;
  }

  callsAreaChart: ApexChart = {
    type: 'area',
    height: 260,
    width: '100%',
    toolbar: { show: false },
    offsetX: 0,
    offsetY: 0,
  };

  callsAreaStroke: ApexStroke = { 
    curve: 'smooth', 
    width: 3,
    colors: ['#1E3A8A']
  };
  callsAreaDataLabels: ApexDataLabels = { enabled: false };
  callsAreaGrid: ApexGrid = { 
    strokeDashArray: 3, 
    borderColor: '#E5E7EB',
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } }
  };
  callsAreaXAxis: ApexXAxis = { 
    categories: this.getCurrentCategories(),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { 
      style: { colors: '#6B7280', fontSize: '12px' },
      offsetY: 5,
      rotate: 0,
      maxHeight: 60,
      trim: false,
    },
    offsetX: 0,
    offsetY: 0,
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
    return [500, 780, 620, 920, 600, 880, 720];
  }
  callsAreaYAxis: any = {
    min: 200,
    max: 1000,
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
        { offset: 100, color: '#1E3A8A', opacity: 0.1 }
      ]
    },
  };
  callsAreaColors: string[] = ['#1E3A8A'];

  // Configuración del tooltip personalizado
  callsAreaTooltip: any = {
    enabled: true,
    custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
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
    }
  };
  // Filtros
  periods = ['Últimos 7 días', 'Últimos 30 días', 'Este mes', 'Año pasado'];
  selectedPeriod = this.periods[0];

  agents = ['Todos', 'Agente 1', 'Agente 2'];
  selectedAgent = this.agents[0];

  // Totales
  totalMinutesUsed = 714;
  minutesLimit = 1000;
  extraMinutes = 0;
  timeSavedHours = 49;

  // Latencia
  latencyMs = 1999;
  latencyMaxMs = 3000;

  get latencyPercent(): number {
    const ratio = this.latencyMs / this.latencyMaxMs;
    return Math.max(0, Math.min(1, ratio));
  }

  get latencyLabel(): 'RÁPIDO' | 'NORMAL' | 'LENTO' {
    if (this.latencyMs <= 1000) return 'RÁPIDO';
    if (this.latencyMs <= 2000) return 'NORMAL';
    return 'LENTO';
  }

  get latencyBadgeClasses(): string {
    switch (this.latencyLabel) {
      case 'RÁPIDO':
        return 'text-xs bg-green-200 text-black px-2 py-1.5 rounded-lg font-medium';
      case 'NORMAL':
        return 'text-xs bg-orange-200 text-black px-2 py-1.5 rounded-lg font-medium';
      default:
        return 'text-xs bg-red-200 text-black px-2 py-1.5 rounded-lg font-medium';
    }
  }

  get latencyColor(): string {
    switch (this.latencyLabel) {
      case 'RÁPIDO':
        return '#16a34a';
      case 'NORMAL':
        return '#ca8a04';
      default:
        return '#dc2626';
    }
  }

  get latencyGradient(): string {
    const percent = this.latencyPercent;
    switch (this.latencyLabel) {
      case 'RÁPIDO':
        return `linear-gradient(90deg, #16a34a 0%, #22c55e 100%)`;
      case 'NORMAL':
        return `linear-gradient(90deg, #ca8a04 0%, #eab308 100%)`;
      default:
        return `linear-gradient(90deg, #dc2626 0%, #ef4444 100%)`;
    }
  }

  get latencyGradientStart(): string {
    switch (this.latencyLabel) {
      case 'RÁPIDO':
        return '#4ade80'; // Verde más oscuro
      case 'NORMAL':
        return '#fb923c'; // Naranja más claro
      default:
        return '#f87171'; // Rojo más claro
    }
  }

  get latencyGradientEnd(): string {
    switch (this.latencyLabel) {
      case 'RÁPIDO':
        return '#14532d'; // Verde bosque muy oscuro
      case 'NORMAL':
        return '#c2410c'; // Naranja más oscuro
      default:
        return '#991b1b'; // Rojo más oscuro
    }
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

  get durationLabel(): 'NORMAL' | 'LARGA' {
    const totalMinutes = this.averageCallDurationSeconds / 60;
    if (totalMinutes <= 4) return 'NORMAL';
    return 'LARGA';
  }

  get durationBadgeClasses(): string {
    switch (this.durationLabel) {
      case 'NORMAL':
        return 'text-xs bg-green-200 text-black px-2 py-1.5 rounded-lg font-medium';
      case 'LARGA':
        return 'text-xs bg-orange-200 text-black px-2 py-1.5 rounded-lg font-medium';
      default:
        return 'text-xs bg-green-200 text-black px-2 py-1.5 rounded-lg font-medium';
    }
  }

  get durationPercent(): number {
    const ratio = this.averageCallDurationSeconds / this.maxCallDurationSeconds;
    return Math.max(0, Math.min(1, ratio));
  }

  get durationGradientStart(): string {
    switch (this.durationLabel) {
      case 'NORMAL':
        return '#22c55e'; // Verde
      case 'LARGA':
        return '#f59e0b'; // Naranja
      default:
        return '#22c55e'; // Verde
    }
  }

  get durationGradientEnd(): string {
    switch (this.durationLabel) {
      case 'NORMAL':
        return '#16a34a'; // Verde más oscuro
      case 'LARGA':
        return '#d97706'; // Naranja más oscuro
      default:
        return '#16a34a'; // Verde más oscuro
    }
  }

  // Agentes creados (tabla resumen)
  createdAgents = [
    { name: 'Carla', type: 'Inbound', totalMin: 530, percent: 25.4, status: 'Activo' as const },
    { name: 'Carla', type: 'Outbound', totalMin: 250, percent: 8.9, status: 'Borrador' as const },
  ];

  // Países (porcentaje y barra) - ordenados de mayor a menor
  countries = [
    { name: 'Estados Unidos', img: 'assets/eeuu.png', percent: 65.5 },
    { name: 'Francia', img: 'assets/france.png', percent: 57.5 },
    { name: 'España', img: 'assets/spain.png', percent: 45.2 },
    { name: 'Reino Unido', img: 'assets/united-kingdom.png', percent: 33.2 },
    { name: 'Brasil', img: 'assets/brasil.png', percent: 25.8 },
  ].sort((a, b) => b.percent - a.percent);

  // Tipo de llamadas - porcentajes dinámicos
  inboundPercentage = 57.2;
  outboundPercentage = 42.8;

  // Métodos para el gráfico circular de tipo de llamadas
  get circumference(): number {
    return 2 * Math.PI * 90; // radio 90
  }

  get inboundStrokeDasharray(): string {
    return `${this.circumference}`;
  }

  get inboundStrokeDashoffset(): number {
    return this.circumference - (this.circumference * this.inboundPercentage / 100);
  }

  get outboundStrokeDasharray(): string {
    return `${this.circumference}`;
  }

  get outboundStrokeDashoffset(): number {
    return this.circumference - (this.circumference * this.outboundPercentage / 100);
  }

  // Método para simular cambios en los porcentajes de tipo de llamadas
  simulateCallTypeChange(newInboundPercent: number): void {
    this.inboundPercentage = newInboundPercent;
    this.outboundPercentage = 100 - newInboundPercent;
  }

  // Método para cambiar el período y actualizar el gráfico
  onPeriodChange(): void {
    this.callsAreaSeries = [
      { name: 'Llamadas', data: this.getCurrentData() }
    ];
    this.callsAreaXAxis = {
      ...this.callsAreaXAxis,
      categories: this.getCurrentCategories(),
      labels: { 
        style: { colors: '#6B7280', fontSize: this.selectedPeriod === 'Últimos 30 días' ? '10px' : '12px' },
        offsetY: 5,
        rotate: this.selectedPeriod === 'Últimos 30 días' ? -45 : 0,
        maxHeight: 60,
        trim: false,
      }
    };
  }

  // Método para crear animación escalonada en las barras de países
  getCountryBarDelay(index: number): number {
    return index * 200; // 200ms de delay entre cada barra
  }

  ngOnInit(): void {
    // Ejecutar animaciones siempre
    this.startFadeInAnimations();
    this.preventScrollOnChart();
  }

  // Prevenir scroll de página cuando se hace zoom en el gráfico
  preventScrollOnChart() {
    if (!this.isBrowser) return;
    
    setTimeout(() => {
      const chartContainer = document.querySelector('.chart-container');
      if (chartContainer) {
        chartContainer.addEventListener('wheel', (e) => {
          e.preventDefault();
          e.stopPropagation();
        }, { passive: false });
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
