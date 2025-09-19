import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss'
})
export class MetricsComponent {
  private i18nService = inject(I18nService);

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  // Filtros
  periods = [this.t.last7Days, this.t.last30Days, this.t.thisMonth, this.t.lastYear];
  selectedPeriod = this.periods[0];

  agents = [this.t.all, this.t.agent1, this.t.agent2];
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

  get latencyLabel(): string {
    if (this.latencyMs <= 1000) return this.t.fast;
    if (this.latencyMs <= 2000) return this.t.normal;
    return this.t.slow;
  }

  get latencyBadgeClasses(): string {
    switch (this.latencyLabel) {
      case this.t.fast:
        return 'text-xs bg-green-200 text-black px-2 py-1.5 rounded-lg font-medium';
      case this.t.normal:
        return 'text-xs bg-orange-200 text-black px-2 py-1.5 rounded-lg font-medium';
      default:
        return 'text-xs bg-red-200 text-black px-2 py-1.5 rounded-lg font-medium';
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
    const percent = this.latencyPercent;
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
        return 'text-xs bg-green-200 text-black px-2 py-1.5 rounded-lg font-medium';
      case this.t.long:
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

  // Agentes creados (tabla resumen)
  get createdAgents() {
    return [
      { name: 'Carla', type: this.t.inbound, totalMin: 530, percent: 25.4, status: this.t.activeStatus },
      { name: 'Carla', type: this.t.outbound, totalMin: 250, percent: 8.9, status: this.t.draftStatus },
    ];
  }

  // Países (porcentaje y barra) - ordenados de mayor a menor
  get countries() {
    return [
      { name: this.t.unitedStates, img: 'assets/eeuu.png', percent: 65.5 },
      { name: this.t.france, img: 'assets/france.png', percent: 57.5 },
      { name: this.t.spain, img: 'assets/spain.png', percent: 45.2 },
      { name: this.t.unitedKingdom, img: 'assets/united-kingdom.png', percent: 33.2 },
      { name: this.t.brazil, img: 'assets/brasil.png', percent: 25.8 },
    ].sort((a, b) => b.percent - a.percent);
  }

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

  // Método para crear animación escalonada en las barras de países
  getCountryBarDelay(index: number): number {
    return index * 200; // 200ms de delay entre cada barra
  }

  constructor() {
    this.i18nService.initializeLanguage();
  }
}
