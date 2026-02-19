import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexGrid,
  ApexFill
} from 'ng-apexcharts';
import { AgentsService } from '../../core/services/agents.service';
import { Agent } from '../../shared/models/agent.model';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit {
  private router = inject(Router);
  private agentsService = inject(AgentsService);
  selectedRange: '1D' | '7D' | '1M' | '6M' | '1A' = '1A';
  showResumen = false;
  showContent: boolean = false;
  private isBrowser: boolean = typeof window !== 'undefined';

  // Períodos para el gráfico de llamadas
  selectedPeriod: '7d' | '30d' | 'month' = '7d';

  // Selección de mes y año
  selectedMonth: number = new Date().getMonth(); // 0-11
  selectedYear: number = new Date().getFullYear();
  showMonthYearPicker: boolean = false;

  // Meses en español (completos)
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Meses abreviados para el selector
  monthsShort: string[] = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  // Años disponibles (últimos 5 años y próximos 2)
  get availableYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  }

  // Cache de datos para evitar regeneración en cada verificación
  private cachedData30d: number[] | null = null;
  private cachedDataMonth: Map<string, number[]> = new Map();
  private currentChartData: number[] = [];

  // Métricas administrativas
  metrics = {
    totalUsers: 1248,
    activeUsers: 892,
    totalRevenue: 45680,
    totalCalls: 15420,
    totalAgents: 342,
    totalMinutes: 89240,
    newUsersThisMonth: 156,
    systemUptime: 99.8
  };

  // Cambios porcentuales
  changes = {
    totalUsers: +12.4,
    activeUsers: +8.7,
    totalRevenue: +24.3,
    totalCalls: +18.5,
    totalAgents: +15.2,
    totalMinutes: +22.1,
    newUsersThisMonth: +32.5,
    systemUptime: +0.2
  };

  // Datos para gráficos
  callsPerDay = [
    { day: 'Lun', calls: 210 },
    { day: 'Mar', calls: 300 },
    { day: 'Mié', calls: 60 },
    { day: 'Jue', calls: 180 },
    { day: 'Vie', calls: 135 },
    { day: 'Sáb', calls: 90 },
    { day: 'Dom', calls: 120 }
  ];

  // Configuración del gráfico de área (igual que en métricas)
  callsAreaSeries: ApexAxisChartSeries = [
    { name: 'Llamadas', data: this.callsPerDay.map(day => day.calls) }
  ];

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

  get callsAreaXAxis(): ApexXAxis {
    return {
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
        rotate: this.selectedPeriod === '30d' ? -45 : 0,
        trim: false,
        hideOverlappingLabels: this.selectedPeriod === '30d',
      },
      crosshairs: {
        show: false,
      },
    };
  }

  // Obtener categorías según el período seleccionado
  getCurrentCategories(): string[] {
    if (this.selectedPeriod === '7d') {
      return this.getLast7Days();
    } else if (this.selectedPeriod === '30d') {
      return this.getLast30Days();
    } else {
      return this.getCurrentMonthDays();
    }
  }

  // Generar fechas de los últimos 7 días
  getLast7Days(): string[] {
    const dates: string[] = [];
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(days[date.getDay()]);
    }
    return dates;
  }

  // Generar fechas de los últimos 30 días
  getLast30Days(): string[] {
    const dates: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.getDate().toString());
    }
    return dates;
  }

  // Generar días del mes seleccionado
  getCurrentMonthDays(): string[] {
    const dates: string[] = [];
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(i.toString());
    }
    return dates;
  }

  // Obtener datos según el período seleccionado (usa datos cacheados)
  getCurrentData(): number[] {
    return this.currentChartData;
  }

  // Generar datos aleatorios para los últimos 30 días (solo una vez)
  private generateLast30DaysData(): number[] {
    if (this.cachedData30d) {
      return this.cachedData30d;
    }
    const data: number[] = [];
    // Usar una semilla para generar datos consistentes
    let seed = 12345;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 30; i++) {
      const baseValue = 150;
      const variation = random() * 200 - 100;
      data.push(Math.max(0, Math.round(baseValue + variation)));
    }
    this.cachedData30d = data;
    return data;
  }

  // Generar datos para el mes seleccionado (cacheado por mes/año)
  private generateCurrentMonthData(): number[] {
    const cacheKey = `${this.selectedYear}-${this.selectedMonth}`;
    if (this.cachedDataMonth.has(cacheKey)) {
      return this.cachedDataMonth.get(cacheKey)!;
    }
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    const data: number[] = [];
    // Usar una semilla basada en mes y año para generar datos consistentes
    let seed = (this.selectedYear * 100 + this.selectedMonth) * 1000;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < daysInMonth; i++) {
      const baseValue = 180;
      const variation = random() * 250 - 125;
      data.push(Math.max(0, Math.round(baseValue + variation)));
    }
    this.cachedDataMonth.set(cacheKey, data);
    return data;
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

  // Actualizar el eje Y según los datos actuales
  private updateYAxis() {
    const currentData = this.currentChartData;
    if (currentData.length > 0) {
      const maxValue = Math.max(...currentData);
      const roundedMax = Math.ceil(maxValue / 50) * 50 + 50;
      this.callsAreaYAxis = {
        ...this.callsAreaYAxis,
        max: roundedMax,
      };
    }
  }

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
          ${value} llamadas
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

  topUsers = [
    {
      name: 'Juan Pérez',
      empresa: 'TechCorp Solutions',
      calls: 530,
      minutes: 1240,
      status: 'Activo',
      profileImage: 'assets/predeterminada.webp',
      rank: 1
    },
    {
      name: 'María García',
      empresa: 'Innovate Digital',
      calls: 450,
      minutes: 980,
      status: 'Activo',
      profileImage: 'assets/predeterminada.webp',
      rank: 2
    },
    {
      name: 'Carlos López',
      empresa: 'Global Services',
      calls: 320,
      minutes: 750,
      status: 'Activo',
      profileImage: 'assets/predeterminada.webp',
      rank: 3
    },
    {
      name: 'Ana Martínez',
      empresa: 'Smart Business',
      calls: 280,
      minutes: 620,
      status: 'Activo',
      profileImage: 'assets/predeterminada.webp',
      rank: 4
    },
    {
      name: 'Pedro Sánchez',
      empresa: 'Future Tech',
      calls: 245,
      minutes: 580,
      status: 'Activo',
      profileImage: 'assets/predeterminada.webp',
      rank: 5
    }
  ];

  ngOnInit() {
    setTimeout(() => {
      this.showResumen = true;
    }, 100);
    this.updateChart();
    this.startFadeInAnimation();
  }

  private startFadeInAnimation(): void {
    if (!this.isBrowser) {
      this.showContent = true;
      return;
    }

    setTimeout(() => {
      this.showContent = true;
    }, 100);
  }

  // Cerrar el selector de mes/año
  closeMonthYearPicker() {
    this.showMonthYearPicker = false;
  }

  // Método para cambiar el período
  setPeriod(period: '7d' | '30d' | 'month') {
    if (period === 'month' && this.selectedPeriod === 'month') {
      // Si ya está en mes, toggle del selector
      this.showMonthYearPicker = !this.showMonthYearPicker;
    } else {
      this.selectedPeriod = period;
      if (period === 'month') {
        this.showMonthYearPicker = true;
      } else {
        this.showMonthYearPicker = false;
      }
      this.updateChart();
    }
  }

  // Seleccionar mes
  selectMonth(month: number) {
    this.selectedMonth = month;
    // No cerrar el selector, solo actualizar el gráfico
    this.updateChart();
  }

  // Seleccionar año
  selectYear(year: number) {
    this.selectedYear = year;
    this.updateChart();
  }

  // Obtener el nombre del mes seleccionado
  get selectedMonthName(): string {
    return this.months[this.selectedMonth];
  }

  // Obtener texto del período seleccionado
  get periodText(): string {
    if (this.selectedPeriod === '7d') {
      return 'Últimos 7 días';
    } else if (this.selectedPeriod === '30d') {
      return 'Últimos 30 días';
    } else {
      return `${this.selectedMonthName} ${this.selectedYear}`;
    }
  }

  // Actualizar el gráfico con los datos del período seleccionado
  updateChart() {
    this.loadAgents();
    // Generar o obtener datos según el período
    if (this.selectedPeriod === '7d') {
      this.currentChartData = this.callsPerDay.map(day => day.calls);
    } else if (this.selectedPeriod === '30d') {
      this.currentChartData = this.generateLast30DaysData();
    } else {
      this.currentChartData = this.generateCurrentMonthData();
    }

    // Actualizar la serie del gráfico
    this.callsAreaSeries = [{
      name: 'Llamadas',
      data: [...this.currentChartData] // Crear copia para evitar referencias
    }];

    // Actualizar estadísticas y eje Y
    this.updateStatistics();
    this.updateYAxis();
  }

  setRange(range: '1D' | '7D' | '1M' | '6M' | '1A') {
    this.selectedRange = range;
    // Aquí podrías actualizar los datos según el rango seleccionado
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-ES').format(num);
  }

  // Propiedades para estadísticas (calculadas una vez)
  totalCalls: number = 0;
  averageCalls: number = 0;
  maxCalls: number = 0;

  // Actualizar estadísticas según los datos actuales
  private updateStatistics() {
    const currentData = this.currentChartData;
    if (currentData.length > 0) {
      this.totalCalls = currentData.reduce((sum, calls) => sum + calls, 0);
      this.averageCalls = Math.round(this.totalCalls / currentData.length);
      this.maxCalls = Math.max(...currentData);
    }
  }

  // Exponer Math para usar en el template
  Math = Math;

  // Método para calcular el porcentaje de llamadas
  getCallPercentage(userCalls: number, maxCalls: number): number {
    return Math.round((userCalls / maxCalls) * 100);
  }

  editAgent(agentId: number): void {
    this.router.navigate(['/admin/agents/edit', agentId]);
  }

  // Lista de agentes para mostrar
  agentsList: Agent[] = [];
  isLoadingAgents = false;

  private loadAgents(): void {
    this.isLoadingAgents = true;
    this.agentsService.getAgentsList().subscribe({
      next: (response) => {
        this.agentsList = response.agents.slice(0, 5);
        this.isLoadingAgents = false;
      },
      error: (error) => {
        console.error('Error al cargar agentes:', error);
        this.isLoadingAgents = false;
      }
    });
  }
}

