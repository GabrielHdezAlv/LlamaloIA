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
  latencyMs = 1493;
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
        return 'text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full';
      case 'NORMAL':
        return 'text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full';
      default:
        return 'text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full';
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

  // Duración media (texto mostrado)
  averageCallDurationLabel = '3m y 4s';

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
