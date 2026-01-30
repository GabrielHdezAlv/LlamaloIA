import { Component, inject, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
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
export class KnowledgeBaseComponent implements AfterViewInit {
  private i18nService = inject(I18nService);

  showContent = false;

  searchTerm = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.startFadeInAnimation();
  }

  private startFadeInAnimation(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.showContent = true;
      this.cdr.detectChanges();
      return;
    }
    setTimeout(() => {
      this.showContent = true;
      this.cdr.detectChanges();
    }, 180);
  }

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
