import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';

export type KnowledgeBaseType = 'pdf' | 'web' | 'text';

export interface KnowledgeBaseItem {
  id: string;
  type: KnowledgeBaseType;
}

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './knowledge-base.component.html',
  styleUrl: './knowledge-base.component.scss',
})
export class KnowledgeBaseComponent {
  private i18nService = inject(I18nService);

  searchTerm = '';

  items: KnowledgeBaseItem[] = [
    { id: '1', type: 'pdf' },
    { id: '2', type: 'web' },
    { id: '3', type: 'text' },
  ];

  get t() {
    return this.i18nService.getTranslations();
  }

  getAddLabel(type: KnowledgeBaseType): string {
    switch (type) {
      case 'pdf':
        return this.t.knowledgeBaseAddPdf;
      case 'web':
        return this.t.knowledgeBaseAddWeb;
      case 'text':
        return this.t.knowledgeBaseAddText;
      default:
        return this.t.knowledgeBaseAddPdf;
    }
  }

  getTypeLabel(type: KnowledgeBaseType): string {
    return this.getAddLabel(type);
  }
}
