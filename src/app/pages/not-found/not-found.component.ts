import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  currentYear = new Date().getFullYear();

  private i18nService = inject(I18nService);

  constructor() {
    this.i18nService.initializeLanguage();
  }

  get t() {
    return this.i18nService.getTranslations();
  }
}

