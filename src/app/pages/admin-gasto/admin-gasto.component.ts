import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-gasto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-gasto.component.html',
  styleUrls: ['./admin-gasto.component.scss']
})
export class AdminGastoComponent implements OnInit {
  // Gasto de servicios
  gastos = [
    { 
      name: 'Twilio', 
      gasto: 1250.50, 
      status: 'Activo',
      color: 'red'
    },
    { 
      name: 'OpenAI', 
      gasto: 890.75, 
      status: 'Activo',
      color: 'green'
    },
    { 
      name: 'ElevenLabs', 
      gasto: 650.25, 
      status: 'Activo',
      color: 'purple'
    },
    { 
      name: 'Deepgram', 
      gasto: 1100.00, 
      status: 'Activo',
      color: 'blue'
    }
  ];

  ngOnInit() {
    // Aquí puedes cargar los gastos reales desde un servicio
  }

  // Método para formatear moneda
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}

