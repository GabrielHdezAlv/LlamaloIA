import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss'
})
export class MetricsComponent {
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

  // Países (porcentaje y barra)
  countries = [
    { name: 'Estados Unidos', img: 'assets/eeuu.png', percent: 65.5 },
    { name: 'Francia', img: 'assets/france.png', percent: 57.5 },
    { name: 'España', img: 'assets/spain.png', percent: 45.2 },
    { name: 'Reino Unido', img: 'assets/united-kingdom.png', percent: 33.2 },
    { name: 'Brasil', img: 'assets/brasil.png', percent: 25.8 },
  ];
}
