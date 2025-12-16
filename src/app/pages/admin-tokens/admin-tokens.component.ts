import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-tokens',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-tokens.component.html',
  styleUrls: ['./admin-tokens.component.scss']
})
export class AdminTokensComponent implements OnInit {
  // Tokens de servicios
  tokens = [
    { 
      name: 'Twilio', 
      tokensRestantes: 170000, 
      status: 'Activo',
      color: 'red'
    },
    { 
      name: 'OpenAI', 
      tokensRestantes: 125000, 
      status: 'Activo',
      color: 'green'
    },
    { 
      name: 'ElevenLabs', 
      tokensRestantes: 89000, 
      status: 'Activo',
      color: 'purple'
    },
    { 
      name: 'Deepgram', 
      tokensRestantes: 210000, 
      status: 'Activo',
      color: 'blue'
    }
  ];

  ngOnInit() {
    // Aquí puedes cargar los tokens reales desde un servicio
  }

  // Método para formatear números con separadores de miles
  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-ES').format(num);
  }
}

