import { Component, inject } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  templateUrl: './knowledge-base.component.html',
  styleUrl: './knowledge-base.component.scss',
})
export class KnowledgeBaseComponent {
  private i18nService = inject(I18nService);

  get t() {
    return this.i18nService.getTranslations();
  }
}
