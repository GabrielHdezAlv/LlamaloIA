import { Component, inject } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-numbers',
  imports: [],
  templateUrl: './numbers.component.html',
  styleUrl: './numbers.component.scss'
})
export class NumbersComponent {
  private i18nService = inject(I18nService);

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  constructor() {
    this.i18nService.initializeLanguage();
  }
}
