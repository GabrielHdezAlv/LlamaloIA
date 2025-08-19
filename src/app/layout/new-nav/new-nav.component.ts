// src/app/components/sidebar/sidebar.component.ts
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navv',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './new-nav.component.html',
  styleUrls: ['./new-nav.component.scss'],
})
export class SidebarComponent {
  isOpen: boolean = false;
  windowWidth: number = 0;

  // Idiomas (por si lo necesitas después)
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
      // En pantallas grandes, el sidebar está siempre abierto
      this.isOpen = this.windowWidth >= 1280;
    }
  }
}