import {
  Component,
  inject,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';
import { KnowledgeBaseService } from '../../core/services/knowledge-base.service';
import {
  KnowledgeSource,
  CreateKnowledgeSourceRequest,
} from '../../shared/models/knowledge-source.model';
import { ModalService } from '../../shared/modals/modal.service';

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
export class KnowledgeBaseComponent implements AfterViewInit, OnInit {
  private i18nService = inject(I18nService);
  private knowledgeBaseService = inject(KnowledgeBaseService);
  private modalService = inject(ModalService);

  showContent = false;
  searchTerm = '';
  knowledgeSources: KnowledgeSource[] = [];
  isLoading = false;
  error: string | null = null;

  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadKnowledgeSources();
  }

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

  loadKnowledgeSources(): void {
    this.isLoading = true;
    this.error = null;

    this.knowledgeBaseService.getKnowledgeSources().subscribe({
      next: (response) => {
        this.knowledgeSources = response.knowledgeSources;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading knowledge sources:', err);
        this.error = 'Error al cargar las fuentes de conocimiento';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectKnowledgeSource(type: 'pdf' | 'web' | 'text'): void {
    switch (type) {
      case 'pdf':
        this.openFileSelector();
        break;
      case 'web':
        this.openWebModal();
        break;
      case 'text':
        this.openTextModal();
        break;
    }
  }

  openFileSelector(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  handleFileSelection(event: any): void {
    const files = event.target.files as FileList;
    if (files.length > 0) {
      this.uploadPdfFiles(Array.from(files));
    }
  }

  uploadPdfFiles(files: File[]): void {
    files.forEach((file) => {
      if (file.type === 'application/pdf') {
        this.isLoading = true;

        this.knowledgeBaseService
          .uploadPdfKnowledgeSource(
            file,
            file.name.replace('.pdf', ''),
            [],
            false,
          )
          .subscribe({
            next: (response) => {
              this.knowledgeSources.push(response.knowledgeSource);
              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error uploading PDF:', err);
              this.error = `Error al subir el archivo ${file.name}`;
              this.isLoading = false;
              this.cdr.detectChanges();
            },
          });
      }
    });
  }

  openWebModal(): void {
    const dialogRef = this.modalService.openWeb({
      title: 'Añadir fuente web',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.url) {
        this.createWebSource(result.url, result.name || result.url);
      }
    });
  }

  openTextModal(): void {
    const dialogRef = this.modalService.openText({
      title: 'Añadir texto manual',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.content) {
        this.createTextSource(result.content, result.name || 'Texto manual');
      }
    });
  }

  createWebSource(url: string, name: string): void {
    const request: CreateKnowledgeSourceRequest = {
      name,
      type: 'web',
      url,
      tags: [],
      isPublic: false,
    };

    this.isLoading = true;
    this.knowledgeBaseService.createKnowledgeSource(request).subscribe({
      next: (response) => {
        this.knowledgeSources.push(response.knowledgeSource);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating web source:', err);
        this.error = 'Error al crear la fuente web';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  createTextSource(content: string, name: string): void {
    const request: CreateKnowledgeSourceRequest = {
      name,
      type: 'text',
      content,
      tags: [],
      isPublic: false,
    };

    this.isLoading = true;
    this.knowledgeBaseService.createKnowledgeSource(request).subscribe({
      next: (response) => {
        this.knowledgeSources.push(response.knowledgeSource);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating text source:', err);
        this.error = 'Error al crear la fuente de texto';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteKnowledgeSource(id: string): void {
    this.knowledgeBaseService.deleteKnowledgeSource(id).subscribe({
      next: () => {
        this.knowledgeSources = this.knowledgeSources.filter(
          (source) => source.id !== id,
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting knowledge source:', err);
        this.error = 'Error al eliminar la fuente de conocimiento';
      },
    });
  }

  get filteredKnowledgeSources(): KnowledgeSource[] {
    if (!this.knowledgeSources) {
      return [];
    }

    if (!this.searchTerm) {
      return this.knowledgeSources;
    }

    const term = this.searchTerm.toLowerCase();
    return this.knowledgeSources.filter(
      (source) =>
        source.name.toLowerCase().includes(term) ||
        source.type.toLowerCase().includes(term) ||
        source.tags.some((tag) => tag.toLowerCase().includes(term)),
    );
  }

  get hasKnowledgeSources(): boolean {
    return this.filteredKnowledgeSources.length > 0;
  }

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
