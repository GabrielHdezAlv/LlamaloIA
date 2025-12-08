import { Component, inject, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private i18nService = inject(I18nService);
  
  selectedRange: '1D' | '7D' | '1M' | '6M' | '1A' = '1A';

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
    return this.rangeToSummary[this.selectedRange] ?? this.rangeToSummary['1A'];
  }

  setRange(range: '1D' | '7D' | '1M' | '6M' | '1A') {
    this.selectedRange = range;
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
  callsByDayPercentages: number[] = [40, 100, 30, 60, 45, 30, 40];
  
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