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
import { NotificationService } from '../../core/services/notification.service';
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
  private notificationService = inject(NotificationService);

  showContent = false;
  searchTerm = '';
  knowledgeSources: KnowledgeSource[] = [];
  isLoading = false;
  error: string | null = null;

  clearError(): void {
    this.error = null;
  }

  // Métodos para validación y UX
  getValidationLimits() {
    return {
      pdf: { maxSize: 10 * 1024 * 1024, maxSizeText: '10MB' },
      web: { maxLength: 2048, maxLengthText: '2,048 caracteres' },
      text: {
        maxLength: 50000,
        maxLengthText: '50,000 caracteres (~20 páginas)',
      },
    };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Método seguro para agregar fuentes de conocimiento
  private addKnowledgeSource(source: any): void {
    if (!source) {
      console.error('Attempted to add undefined source');
      return;
    }

    if (!source.id) {
      console.error('Source missing id:', source);
      return;
    }

    // Validar que la fuente tenga los campos requeridos
    const validSource: KnowledgeSource = {
      id: source.id,
      userId: source.userId || '',
      name: source.name || 'Sin nombre',
      type: source.type || 'unknown',
      status: source.status || 'processing',
      createdAt: source.createdAt ? new Date(source.createdAt) : new Date(),
      updatedAt: source.updatedAt ? new Date(source.updatedAt) : new Date(),
      metadata: source.metadata || { chunkCount: 0 },
      tags: Array.isArray(source.tags) ? source.tags : [],
      isPublic: source.isPublic === 'true' || source.isPublic === true,
      originalUrl: source.originalUrl,
      fileName: source.fileName,
    };

    if (!this.knowledgeSources) {
      this.knowledgeSources = [];
    }

    this.knowledgeSources.push(validSource);
  }

  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef,
  ) { }

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
        // El backend puede devolver el array directamente o dentro de un objeto
        const sources = Array.isArray(response)
          ? response
          : response?.knowledgeSources || [];

        // Filtrar elementos undefined y mapear datos
        this.knowledgeSources = sources
          .filter((source) => source && source.id) // Eliminar elementos undefined o sin id
          .map((source) => ({
            ...source,
            createdAt: new Date(source.createdAt),
            updatedAt: new Date(source.updatedAt),
            isPublic: source.isPublic === 'true' || source.isPublic === true,
          }));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading knowledge sources:', err);
        this.notificationService.error('No se encontraron documentos');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  refreshKnowledgeSources(): void {
    // Limpiar errores y recargar
    this.clearError();
    this.loadKnowledgeSources();
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
      // Validar tamaño del archivo PDF
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        this.notificationService.error('El PDF no puede exceder los 10MB');
        return;
      }
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
              const sourceToAdd = response?.knowledgeSource || response;
              if (sourceToAdd) {
                this.addKnowledgeSource(sourceToAdd);
              } else {
                this.notificationService.error('Error: No se recibió información del archivo subido');
              }
              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error uploading PDF:', err);
              this.notificationService.error(`Error al subir el archivo ${file.name}`);
              this.isLoading = false;
              this.cdr.detectChanges();
            }
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
    if (url.length > 2048) {
      this.notificationService.error('La URL no puede exceder los 2048 caracteres');
      return;
    }

    this.isLoading = true;
    this.knowledgeBaseService
      .createWebKnowledgeSource(url, name, [], true)
      .subscribe({
        next: (response: any) => {
          if (response?.id) {
            this.addKnowledgeSource(response);
          } else {
            this.notificationService.error('Error en la respuesta del servidor');
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error creating web source:', err);
          this.notificationService.error('Error al crear la fuente web');
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  createTextSource(content: string, name: string): void {
    if (content.length > 50000) {
      this.notificationService.error('El texto no puede exceder los 50,000 caracteres');
      return;
    }

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
        const sourceToAdd = response?.knowledgeSource || response;
        if (sourceToAdd?.id) {
          this.addKnowledgeSource(sourceToAdd);
        } else {
          this.notificationService.error('Error en la respuesta del servidor');
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating text source:', err);
        this.notificationService.error('Error al crear la fuente de texto');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
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
        this.notificationService.error('Error al eliminar la fuente de conocimiento');
      },
    });
  }

  get filteredKnowledgeSources(): KnowledgeSource[] {
    if (!this.knowledgeSources) {
      return [];
    }

    // Filtrar elementos undefined y válidos
    const validSources = this.knowledgeSources.filter(
      (source) => source && source.id && source.name && source.type,
    );

    if (!this.searchTerm) {
      return validSources;
    }

    const term = this.searchTerm.toLowerCase();
    return validSources.filter(
      (source) =>
        source.name.toLowerCase().includes(term) ||
        source.type.toLowerCase().includes(term) ||
        source.tags.some((tag) => tag.toLowerCase().includes(term)),
    );
  }

  get hasKnowledgeSources(): boolean {
    return this.filteredKnowledgeSources.length > 0;
  }

  // Método para obtener las clases CSS según el estado
  getStatusClasses(status: string): string {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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
