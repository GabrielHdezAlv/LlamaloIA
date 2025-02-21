import { Component } from '@angular/core';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent {
  stats = [
    { title: 'Coste Promedio por Llamada', value: '6,35€' },
    { title: 'Número de Llamadas Realizadas', value: '23' },
    { title: 'Minutos Totales de Llamadas', value: '5m 8s' },
    { title: 'Suscripción Actual', value: 'Plan Básico' },
    { title: 'Tiempo Ahorrado', value: '20h' }
  ];
}
