import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserStorage } from '../../storages/user/user-storage';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  isOpen: boolean = false;
  windowWidth: number = 0;

  userStorage = inject(UserStorage);

  // Variable para manejar el idioma actual
  currentLanguage: string = 'es';

  ngOnInit() {
    this.onResize();
    
    // Recuperar idioma del localStorage si existe
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedLanguage = localStorage.getItem('interfaceLanguage');
      if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
        this.currentLanguage = savedLanguage;
      }
    }
  }

  openMenu() {
    this.isOpen = true;
  }

  closeMenu() {
    this.isOpen = false;
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'es' ? 'en' : 'es';
    
    // Guardar en localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('interfaceLanguage', this.currentLanguage);
    }
    
    // Disparar evento personalizado para notificar a otros componentes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: this.currentLanguage } 
      }));
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.windowWidth = window.innerWidth;
      this.isOpen = this.windowWidth >= 1280;
    }
  }

  // Método para abrir formulario de feedback
  openFeedback(): void {
    // Redirigir al formulario de Google Forms para feedback
    window.open('https://forms.gle/MGvvv22rvRMdNeXh9', '_blank');
  }
}
