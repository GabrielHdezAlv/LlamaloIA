import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  OnInit,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { I18nService } from '../../../../core/services/i18n.service';
import { KnowledgeBaseService } from '../../../../core/services/knowledge-base.service';
import {
  KnowledgeSource,
  CreateKnowledgeSourceRequest,
} from '../../../../shared/models/knowledge-source.model';
import { ModalService } from '../../../../shared/modals/modal.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { NotificationService } from '../../../../core/services/notification.service';

// Extended interface to include selection
interface ExtendedKnowledgeSource extends KnowledgeSource {
  selected?: boolean;
}

export type KnowledgeBaseType = 'pdf' | 'web' | 'text';

export interface KnowledgeBaseItem {
  id: string;
  type: KnowledgeBaseType;
}

@Component({
  selector: 'app-knowledge-base-step',
  standalone: true,
  imports: [FormsModule, CommonModule, DatePipe, SpinnerComponent],
  templateUrl: './knowledge-base-step.component.html',
  styleUrls: ['./knowledge-base-step.component.scss'],
})
export class KnowledgeBaseStepComponent implements OnInit, AfterViewInit {
  private i18nService = inject(I18nService);
  private knowledgeBaseService = inject(KnowledgeBaseService);
  private modalService = inject(ModalService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  @Input() currentStepNumber: number = 0;
  @Input() totalSteps: number = 0;

  @Output() sourceSelected = new EventEmitter<string>();
  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<string[]>(); // Emitir array de IDs seleccionados

  showContent = false;
  searchTerm = '';
  knowledgeSources: ExtendedKnowledgeSource[] = [];
  isLoading = false;
  error: string | null = null;

  items: KnowledgeBaseItem[] = [
    { id: '1', type: 'pdf' },
    { id: '2', type: 'web' },
    { id: '3', type: 'text' },
  ];

  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  // Selection properties
  get allSelected(): boolean {
    return (
      this.knowledgeSources.length > 0 &&
      this.knowledgeSources.every((source) => source.selected)
    );
  }

  get someSelected(): boolean {
    return (
      this.knowledgeSources.some((source) => source.selected) &&
      !this.allSelected
    );
  }

  get selectedSources(): ExtendedKnowledgeSource[] {
    return this.knowledgeSources.filter((source) => source.selected);
  }

  clearError(): void {
    this.error = null;
  }

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

  private addKnowledgeSource(source: any): void {
    if (!source) {
      return;
    }

    if (!source.id) {
      return;
    }

    const validSource: KnowledgeSource = {
      id: source.id,
      userId: source.userId || '',
      name: source.name || this.t.noName,
      type: source.type || 'unknown',
      status: source.status || 'processing',
      createdAt: source.createdAt ? new Date(source.createdAt) : new Date(),
      updatedAt: source.updatedAt ? new Date(source.updatedAt) : new Date(),
      metadata: source.metadata || { chunkCount: 0 },
      tags: Array.isArray(source.tags) ? source.tags : [],
      isPublic: source.isPublic === 'true' || source.isPublic === true,
      originalUrl: source.originalUrl,
      fileName: source.fileName,
      hasDownloadableContent: !!source.hasDownloadableContent,
    };

    if (!this.knowledgeSources) {
      this.knowledgeSources = [];
    }

    this.knowledgeSources.push(validSource);
  }

  loadKnowledgeSources(): void {
    this.isLoading = true;
    this.error = null;

    this.knowledgeBaseService.getKnowledgeSources().subscribe({
      next: (response) => {
        const sources = Array.isArray(response)
          ? response
          : response?.knowledgeSources || [];

        // Initialize selected property for each source
        this.knowledgeSources = sources.map((source) => ({
          ...source,
          selected: false,
          hasDownloadableContent: !!source.hasDownloadableContent,
        }));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        if (isPlatformBrowser(this.platformId) && error?.status !== 401) {
          console.error('Error loading knowledge sources:', error);
        }
        if (error?.status === 401) {
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }
        this.error = this.t.knowledgeBaseLoadError;
        this.isLoading = false;
        this.knowledgeSources = [];
        this.cdr.detectChanges();
      },
    });
  }

  refreshKnowledgeSources(): void {
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
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        this.error = this.t.pdfMaxError;
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
                console.error('No valid source found in response:', response);
                this.error =
                  'Error: No se recibió información del archivo subido';
              }

              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error uploading PDF:', err);
              if (err.error?.message) {
                this.error = err.error.message;
              } else if (err.status === 413) {
                this.error = 'El archivo es demasiado grande (máximo 10MB)';
              } else {
                this.error = `Error al subir el archivo ${file.name}`;
              }
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
    if (url.length > 2048) {
      this.error = 'La URL no puede exceder los 2048 caracteres';
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
            console.error('Invalid response structure:', response);
            this.error = 'Error en la respuesta del servidor';
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error creating web source:', err);
          if (err.error?.message) {
            this.error = err.error.message;
          } else if (err.status === 413) {
            this.error = 'La URL es demasiado larga (máximo 2048 caracteres)';
          } else if (err.status === 400) {
            this.error = 'URL inválida o no accesible';
          } else {
            this.error = 'Error al crear la fuente web';
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  createTextSource(content: string, name: string): void {
    if (content.length > 50000) {
      this.error =
        'El texto no puede exceder los 50,000 caracteres (~20 páginas)';
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
          console.error('Invalid response structure:', response);
          this.error = 'Error en la respuesta del servidor';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating text source:', err);
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.status === 413) {
          this.error = 'El texto es demasiado largo (máximo 50,000 caracteres)';
        } else {
          this.error = 'Error al crear la fuente de texto';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  downloadKnowledgeFile(source: ExtendedKnowledgeSource): void {
    if (
      !source.hasDownloadableContent ||
      source.status !== 'completed' ||
      (source.type !== 'pdf' && source.type !== 'text')
    ) {
      return;
    }
    this.knowledgeBaseService.downloadKnowledgeSource(source.id).subscribe({
      next: (blob) => {
        const ext = source.type === 'pdf' ? '.pdf' : '.txt';
        let base =
          (source.name || 'documento')
            .replace(/[/\\?%*:|"<>]/g, '-')
            .trim()
            .slice(0, 180) || 'documento';
        if (!base.toLowerCase().endsWith(ext)) {
          base += ext;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = base;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading knowledge file:', err);
        this.notificationService.error(this.t.errorDownloadingKnowledge);
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

  get filteredKnowledgeSources(): ExtendedKnowledgeSource[] {
    if (!this.knowledgeSources) {
      return [];
    }

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

  getStatusClasses(status: string): string {
    switch (status) {
      case 'processing':
        return 'bg-amber-500/20 text-amber-800 dark:bg-amber-500/25 dark:text-amber-200';
      case 'completed':
        return 'bg-slate-200/80 text-slate-700 dark:bg-slate-600/40 dark:text-slate-200';
      case 'failed':
        return 'bg-red-500/20 text-red-800 dark:bg-red-500/25 dark:text-red-200';
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
        return 'Añadir PDF';
      case 'web':
        return 'Añadir Web';
      case 'text':
        return 'Añadir Texto';
      default:
        return 'Añadir PDF';
    }
  }

  getTypeLabel(type: KnowledgeBaseType): string {
    return this.getAddLabel(type);
  }

  // Wrapper methods for parent component events
  onSourceSelected(source: string) {
    this.sourceSelected.emit(source);
  }

  goBack() {
    this.backClicked.emit();
  }

  onSkip() {
    const selectedIds = this.selectedSources.map((source) => source.id);
    this.continueClicked.emit(selectedIds);
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }

  // Lifecycle hooks
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadKnowledgeSources();
    }
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

  // Selection methods
  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.knowledgeSources.forEach((source) => {
      source.selected = checked;
    });
  }

  updateSelectionState(): void {
    // This method is called when individual checkboxes change
    // The state is automatically updated through the getters
    this.cdr.detectChanges();
  }

  getSelectedCount(): number {
    return this.selectedSources.length;
  }
}
