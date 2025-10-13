import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BetaService } from '../../core/services/beta.service';
import { UserStorage } from '../../storages/user/user-storage';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';

@Component({
  selector: 'app-beta-thanks',
  imports: [],
  templateUrl: './beta-thanks.component.html',
  styleUrl: './beta-thanks.component.scss',
})
export class BetaThanksComponent implements OnInit {
  private router = inject(Router);
  private betaService = inject(BetaService);
  private userStorage = inject(UserStorage);
  private twilioStorage = inject(TwilioStorage);

  // Variable para manejar el idioma actual
  currentLanguage: string = 'es';

  constructor() {    
    if (!this.betaService.shouldShowBetaPage) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedLanguage = localStorage.getItem('interfaceLanguage');
      if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
        this.currentLanguage = savedLanguage;
      }
    }

    // Listener para detectar cambios de idioma
    if (typeof window !== 'undefined') {
      window.addEventListener('languageChanged', (e: any) => {
        this.currentLanguage = e.detail.language;
      });
    }
  }

  // Método para cerrar sesión
  logout(): void {
    // Limpiar datos del usuario
    this.userStorage.clearUser();
    this.twilioStorage.clearConfig();
    
    // Limpiar token del localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
    }
    
    // Ocultar página de beta
    this.betaService.hideBetaPage();
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  // Método para agendar llamada
  scheduleCall(): void {
    window.open('https://calendar.app.google/uDJALjMxgaK8HQrs5', '_blank');
  }

  // Método para feedback
  provideFeedback(): void {
    window.open('https://forms.gle/MGvvv22rvRMdNeXh9', '_blank');
  }

  // Método para unirse a la comunidad
  joinCommunity(): void {
    window.open('https://www.linkedin.com/company/llamalo-ai/', '_blank');
  }
}
