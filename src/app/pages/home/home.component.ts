import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  selectedRange: '1D' | '7D' | '1M' | '6M' | '1A' = '1A';

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

  // Datos dinámicos para "Llamadas por día" (alturas en px para coincidir con las clases Tailwind actuales)
  days: string[] = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  // h-36=144, h-48=192, h-28=112, h-56=224, h-40=160, h-28=112, h-36=144
  callsByDayHeights: number[] = [144, 192, 112, 224, 160, 112, 144];

  // Datos dinámicos para "Agentes activos"
  activeAgents: Array<{
    name: string;
    type: 'Inbound' | 'Outbound';
    minutes: number;
    percent: number;
    status: 'Activo' | 'Borrador';
    active: boolean; // para animación de latido
    outerColor: string; // color del círculo exterior
    innerColor: string; // color del círculo interior
  }> = [
    {
      name: 'Carla',
      type: 'Inbound',
      minutes: 530,
      percent: 25.4,
      status: 'Activo',
      active: true,
      outerColor: '#1E3A8A80', // azul con 50% de opacidad
      innerColor: '#1E3A8A',
    },
    {
      name: 'Carlos',
      type: 'Outbound',
      minutes: 250,
      percent: 8.9,
      status: 'Borrador',
      active: false,
      outerColor: '#EDEDED',
      innerColor: '#C5CAC4',
    },
  ];
}