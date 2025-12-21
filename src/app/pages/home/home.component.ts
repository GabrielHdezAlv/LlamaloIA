import { Component, inject, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';
import { MetricsService } from '../../core/services/metrics.service';
import { DashboardMetrics, MetricsPeriod } from '../../shared/models/dashboard-metrics.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private i18nService = inject(I18nService);
  private metricsService = inject(MetricsService);
  
  selectedRange: '1D' | '7D' | '1M' | '6M' | '1A' = '1A';
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

  

  private rangeToSummary: Record<string, {
    totalCalls: number;
    callsDeltaPct: number;
    timeSavedHours: number;
    timeSavedDeltaPct: number;
    minutesUsed: number;
    minutesDeltaPct: number;
  }> = {
    '1D': { totalCalls: 42, callsDeltaPct: 4.8, timeSavedHours: 3, timeSavedDeltaPct: 2.1, minutesUsed: 58, minutesDeltaPct: 3.5 },
    '7D': { totalCalls: 310, callsDeltaPct: 8.2, timeSavedHours: 18, timeSavedDeltaPct: 5.4, minutesUsed: 420, minutesDeltaPct: 6.1 },
    '1M': { totalCalls: 1240, callsDeltaPct: 16.3, timeSavedHours: 72, timeSavedDeltaPct: 12.7, minutesUsed: 1860, minutesDeltaPct: 14.2 },
    '6M': { totalCalls: 6460, callsDeltaPct: 36.8, timeSavedHours: 512, timeSavedDeltaPct: 24.2, minutesUsed: 780, minutesDeltaPct: 41.5 },
    '1A': { totalCalls: 1024, callsDeltaPct: 28.4, timeSavedHours: 980, timeSavedDeltaPct: 19.6, minutesUsed: 1542, minutesDeltaPct: 33.1 },
  };

  get summary() {
    // Si hay datos del backend, usarlos; si no, usar datos por defecto
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
    return this.rangeToSummary[this.selectedRange] ?? this.rangeToSummary['1A'];
  }

  setRange(range: '1D' | '7D' | '1M' | '6M' | '1A') {
    this.selectedRange = range;
    // Cargar métricas cuando cambia el rango
    this.loadMetrics();
  }

  // Mapear el rango seleccionado al formato del backend
  private mapRangeToBackendPeriod(range: '1D' | '7D' | '1M' | '6M' | '1A'): MetricsPeriod {
    const mapping: Record<string, MetricsPeriod> = {
      '1D': 'day',
      '7D': 'week',
      '1M': 'month',
      '6M': '6months',
      '1A': 'year',
    };
    return mapping[range] || 'week';
  }

  // Cargar métricas del backend
  private loadMetrics(): void {
    this.isLoadingMetrics = true;
    const period = this.mapRangeToBackendPeriod(this.selectedRange);
    
    this.metricsService.getDashboardMetrics(period).subscribe({
      next: (data: DashboardMetrics) => {
        this.dashboardMetrics = data;
        this.isLoadingMetrics = false;
        
        // Actualizar datos de llamadas por día
        this.updateCallsByDay(data);
        
        // Actualizar agentes activos
        this.updateActiveAgents(data);
      },
      error: (error) => {
        console.error('Error al cargar métricas:', error);
        this.isLoadingMetrics = false;
        // En caso de error, mantener los datos por defecto
      }
    });
  }

  // Actualizar datos de llamadas por día desde el backend
  private updateCallsByDay(data: DashboardMetrics): void {
    if (data.llamadas_ultimos_7_dias && data.llamadas_ultimos_7_dias.length > 0) {
      // Obtener los últimos 7 días
      const last7Days = data.llamadas_ultimos_7_dias.slice(-7);
      
      // Mapear a arrays de conteos
      this.callsByDayCounts = last7Days.map(item => item.total);
      
      // Calcular porcentajes basados en el máximo
      const maxCalls = Math.max(...this.callsByDayCounts, 1);
      this.callsByDayPercentages = this.callsByDayCounts.map(count => 
        Math.round((count / maxCalls) * 100)
      );
    }
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
      this.t.sun
    ];
  }
  
  // Altura máxima de las barras en píxeles
  maxBarHeight: number = 200;
  
  // Porcentajes de llamadas por día (0-100%)
  callsByDayPercentages: number[] = [70, 100, 20, 60, 45, 30, 40];
  // Número de llamadas por día (datos ficticios pero coherentes con los porcentajes)
  callsByDayCounts: number[] = [210, 300, 60, 180, 135, 90, 120];
  
  // Calcular alturas basadas en porcentajes
  get callsByDayHeights(): number[] {
    return this.callsByDayPercentages.map(percentage => 
      Math.round((percentage / 100) * this.maxBarHeight)
    );
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
      
      return this.dashboardMetrics.agentes.map(agent => {
        const percent = totalMinutes > 0 
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
    
    // Datos por defecto si no hay datos del backend
    return [
      {
        name: 'Carla',
        type: this.t.inbound,
        minutes: 530,
        percent: 25.4,
        status: this.t.active,
        active: true,
        outerColor: '#1E3A8A80',
        innerColor: '#1E3A8A',
      },
      {
        name: 'Carlos',
        type: this.t.outbound,
        minutes: 250,
        percent: 8.9,
        status: this.t.draft,
        active: false,
        outerColor: '#EDEDED',
        innerColor: '#C5CAC4',
      },
    ];
  }

  ngOnInit(): void {
    // Cargar métricas al inicializar
    this.loadMetrics();
    
    // Ejecutar animaciones siempre
    console.log('HomeComponent ngOnInit - Iniciando animaciones');
    this.startFadeInAnimations();
  }

  private startFadeInAnimations(): void {
    console.log('startFadeInAnimations - isBrowser:', this.isBrowser);
    
    // Verificar si estamos en el navegador de manera más robusta
    const isInBrowser = typeof window !== 'undefined' && window.localStorage;
    console.log('Verificación robusta del navegador:', isInBrowser);
    
    if (!isInBrowser) {
      console.log('No es navegador, mostrando secciones inmediatamente');
      this.showAllSectionsImmediately();
      return;
    }

    console.log('Ejecutando animaciones con delays...');
    
    // Resumen aparece primero (sin delay)
    setTimeout(() => {
      console.log('Mostrando Resumen');
      this.showResumen = true;
    }, 100);

    // Agentes Activos aparece después de 500ms
    setTimeout(() => {
      console.log('Mostrando Agentes Activos');
      this.showAgentesActivos = true;
    }, 600);

    // Llamadas por día aparece después de 1000ms
    setTimeout(() => {
      console.log('Mostrando Llamadas por día');
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