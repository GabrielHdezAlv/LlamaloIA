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

  // Idiomas
  languages = [
    { code: 'es', name: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
    { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  ];
  selectedLanguage = this.languages[0];
  showLanguageMenu = false;

  ngOnInit() {
    this.onResize();
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

  toggleLanguageMenu() {
    this.showLanguageMenu = !this.showLanguageMenu;
  }

  selectLanguage(lang: any) {
    this.selectedLanguage = lang;
    this.showLanguageMenu = false;
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
