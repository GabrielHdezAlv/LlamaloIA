import {
  Component,
  inject,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { KnowledgeEmptyStateIconComponent } from '../../shared/components/knowledge-empty-state-icon/knowledge-empty-state-icon.component';
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
  imports: [FormsModule, DatePipe, SpinnerComponent, KnowledgeEmptyStateIconComponent],
  templateUrl: './knowledge-base.component.html',
  styleUrl: './knowledge-base.component.scss',
})
export class KnowledgeBaseComponent implements AfterViewInit, OnInit, OnDestroy {
  private i18nService = inject(I18nService);
  private knowledgeBaseService = inject(KnowledgeBaseService);
  private modalService = inject(ModalService);
  private notificationService = inject(NotificationService);

  showContent = false;
  searchTerm = '';
  knowledgeSources: KnowledgeSource[] = [];
  isLoading = false;
  error: string | null = null;

  /** Recarga silenciosa mientras haya fuentes en processing/pending. */
  private processingPollTimer: ReturnType<typeof setInterval> | null = null;
  private readonly processingPollIntervalMs = 4000;

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
    if (isPlatformBrowser(this.platformId)) {
      this.syncProcessingStatusPoll();
    }
  }

  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadKnowledgeSources();
    }
  }

  ngOnDestroy(): void {
    this.clearProcessingStatusPoll();
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

  loadKnowledgeSources(options?: { silent?: boolean }): void {
    const silent = options?.silent === true;
    if (!silent) {
      this.isLoading = true;
    }
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
            hasDownloadableContent: this.normalizeHasDownloadableContent(source),
          }));

        this.isLoading = false;
        this.cdr.detectChanges();
        if (isPlatformBrowser(this.platformId)) {
          this.syncProcessingStatusPoll();
        }
      },
      error: (err) => {
        if (isPlatformBrowser(this.platformId) && err?.status !== 401) {
          console.error('Error loading knowledge sources:', err);
        }
        if (err?.status === 401) {
          this.isLoading = false;
          this.clearProcessingStatusPoll();
          this.cdr.detectChanges();
          return;
        }
        if (isPlatformBrowser(this.platformId)) {
          this.notificationService.error(this.t.knowledgeBaseNoDocuments);
        }
        this.isLoading = false;
        this.clearProcessingStatusPoll();
        this.cdr.detectChanges();
      },
    });
  }

  private hasProcessingKnowledgeSource(): boolean {
    return this.knowledgeSources.some((s) => this.isSourceProcessing(s));
  }

  private clearProcessingStatusPoll(): void {
    if (this.processingPollTimer != null) {
      clearInterval(this.processingPollTimer);
      this.processingPollTimer = null;
    }
  }

  /**
   * Si hay fuentes en processing, programa recargas silenciosas hasta que pasen a completed/failed.
   */
  private syncProcessingStatusPoll(): void {
    this.clearProcessingStatusPoll();
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!this.hasProcessingKnowledgeSource()) {
      return;
    }
    this.processingPollTimer = setInterval(() => {
      this.loadKnowledgeSources({ silent: true });
    }, this.processingPollIntervalMs);
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
        this.notificationService.error(this.t.pdfMaxError);
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
                this.notificationService.error(this.t.errorNoFileInfo);
              }
              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error uploading PDF:', err);
              this.notificationService.error(`${this.t.errorUploadingFile} ${file.name}`);
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
      }
    });
  }

  openWebModal(): void {
    const dialogRef = this.modalService.openWeb({
      title: this.t.addWebSourceTitle,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.url) {
        this.createWebSource(result.url, result.name || result.url);
      }
    });
  }

  openTextModal(): void {
    const dialogRef = this.modalService.openText({
      title: this.t.addTextTitle,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result?.content) {
        return;
      }
      if (result.sourceId) {
        this.patchKnowledgeSourceAfterEdit(result.sourceId, {
          name: result.name,
          content: result.content,
          type: 'text',
        });
      } else {
        this.createTextSource(result.content, result.name || this.t.manualTextDefault);
      }
    });
  }

  private isSourceCompleted(source: KnowledgeSource): boolean {
    const s = String(source.status ?? '').toLowerCase();
    return s === 'completed' || s === 'ready';
  }

  /** Mientras reindexa tras editar, el API devuelve processing. */
  isSourceProcessing(source: KnowledgeSource): boolean {
    const s = String(source.status ?? '').toLowerCase();
    return s === 'processing' || s === 'pending';
  }

  /** Completada o reindexando (tras guardar edición). */
  private isSourceCompletedOrProcessing(source: KnowledgeSource): boolean {
    return this.isSourceCompleted(source) || this.isSourceProcessing(source);
  }

  /**
   * El API debe enviar hasDownloadableContent; si falta (serialización), inferimos para texto completado con chunks.
   */
  /** Visibilidad del botón descargar (alineado con canEdit para texto). */
  showDownloadForSource(source: KnowledgeSource): boolean {
    return (
      this.normalizeHasDownloadableContent(source) &&
      this.isSourceCompletedOrProcessing(source) &&
      (source.type === 'pdf' || source.type === 'text')
    );
  }

  /**
   * Muestra el lápiz también en processing (deshabilitado) para que no “desaparezca” tras guardar.
   */
  showEditButtonForSource(source: KnowledgeSource): boolean {
    const st = String(source.status ?? '').toLowerCase();
    if (st === 'failed') {
      return false;
    }
    if (!this.isSourceCompletedOrProcessing(source)) {
      return false;
    }
    if (source.type === 'text') {
      return this.normalizeHasDownloadableContent(source);
    }
    if (source.type === 'web') {
      const url = source.originalUrl ?? (source as { url?: string }).url;
      return !!(url && String(url).trim());
    }
    return false;
  }

  private normalizeHasDownloadableContent(source: KnowledgeSource): boolean {
    if (typeof source.hasDownloadableContent === 'boolean') {
      return source.hasDownloadableContent;
    }
    if (source.type === 'text' && this.isSourceProcessing(source)) {
      // Tras PUT, el texto sigue en Firestore mientras reindexa; el flag puede faltar en la respuesta.
      return true;
    }
    if (source.type === 'text' && this.isSourceCompleted(source)) {
      const chunks = source.metadata?.chunkCount ?? 0;
      return chunks > 0;
    }
    return false;
  }

  canEditKnowledgeSource(source: KnowledgeSource): boolean {
    if (!this.isSourceCompleted(source)) {
      return false;
    }
    if (source.type === 'text') {
      return this.normalizeHasDownloadableContent(source);
    }
    if (source.type === 'web') {
      const url = source.originalUrl ?? (source as { url?: string }).url;
      return !!(url && String(url).trim());
    }
    return false;
  }

  editKnowledgeSource(source: KnowledgeSource): void {
    if (!this.canEditKnowledgeSource(source)) {
      return;
    }

    if (source.type === 'text') {
      this.knowledgeBaseService.downloadKnowledgeSource(source.id).subscribe({
        next: (blob) => {
          void blob.text().then((content) => {
            const dialogRef = this.modalService.openText({
              title: this.t.editKnowledgeSource,
              initialName: source.name,
              initialContent: content,
              sourceId: source.id,
            });
            dialogRef.afterClosed().subscribe((result: any) => {
              if (result?.content && result.sourceId) {
                this.patchKnowledgeSourceAfterEdit(result.sourceId, {
                  name: result.name,
                  content: result.content,
                  type: 'text',
                });
              }
            });
          });
        },
        error: (err) => {
          console.error('Error loading text for edit:', err);
          this.notificationService.error(this.t.errorDownloadingKnowledge);
        },
      });
      return;
    }

    if (source.type === 'web') {
      const dialogRef = this.modalService.openWeb({
        title: this.t.editKnowledgeSource,
        editSourceId: source.id,
        initialFullUrl: source.originalUrl,
        initialName: source.name,
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result?.sourceId && result.url) {
          if (result.url.length > 2048) {
            this.notificationService.error(this.t.urlMaxError);
            return;
          }
          this.patchKnowledgeSourceAfterEdit(result.sourceId, {
            name: result.name,
            url: result.url,
            type: 'web',
          });
        }
      });
    }
  }

  private patchKnowledgeSourceAfterEdit(
    id: string,
    body: Partial<CreateKnowledgeSourceRequest>,
  ): void {
    if (body.content != null && body.content.length > 50000) {
      this.notificationService.error(this.t.textMaxError);
      return;
    }
    if (body.url != null && body.url.length > 2048) {
      this.notificationService.error(this.t.urlMaxError);
      return;
    }
    this.isLoading = true;
    this.knowledgeBaseService.updateKnowledgeSource(id, body).subscribe({
      next: (response) => {
        const updated = response?.knowledgeSource;
        if (updated?.id) {
          this.knowledgeSources = this.knowledgeSources.map((s) =>
            s.id === id
              ? {
                  ...s,
                  ...updated,
                  createdAt: new Date(updated.createdAt),
                  updatedAt: new Date(updated.updatedAt),
                  hasDownloadableContent:
                    updated.hasDownloadableContent != null
                      ? !!updated.hasDownloadableContent
                      : !!s.hasDownloadableContent,
                }
              : s,
          );
        } else {
          this.loadKnowledgeSources();
        }
        this.isLoading = false;
        this.cdr.detectChanges();
        if (isPlatformBrowser(this.platformId)) {
          this.syncProcessingStatusPoll();
        }
      },
      error: (err) => {
        console.error('Error updating knowledge source:', err);
        this.notificationService.error(this.t.errorUpdatingKnowledge);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  createWebSource(url: string, name: string): void {
    if (url.length > 2048) {
      this.notificationService.error(this.t.urlMaxError);
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
            this.notificationService.error(this.t.errorServerResponse);
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error creating web source:', err);
          this.notificationService.error(this.t.errorCreatingWeb);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  createTextSource(content: string, name: string): void {
    if (content.length > 50000) {
      this.notificationService.error(this.t.textMaxError);
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

  downloadKnowledgeFile(source: KnowledgeSource): void {
    if (
      !this.normalizeHasDownloadableContent(source) ||
      !this.isSourceCompletedOrProcessing(source) ||
      (source.type !== 'pdf' && source.type !== 'text')
    ) {
      return;
    }
    this.knowledgeBaseService.downloadKnowledgeSource(source.id).subscribe({
      next: (blob) => {
        const ext = source.type === 'pdf' ? '.pdf' : '.txt';
        let base = (source.name || 'documento').replace(/[/\\?%*:|"<>]/g, '-').trim().slice(0, 180) || 'documento';
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
        if (isPlatformBrowser(this.platformId)) {
          this.syncProcessingStatusPoll();
        }
      },
      error: (err) => {
        console.error('Error deleting knowledge source:', err);
        this.notificationService.error(this.t.errorDeletingKnowledge);
      },
    });
  }

  get filteredKnowledgeSources(): KnowledgeSource[] {
    if (!this.knowledgeSources) {
      return [];
    }

    // Filtrar elementos undefined y válidos
    const validSources = this.knowledgeSources.filter(
      (source) => source && source.id && source.type,
    );

    if (!this.searchTerm) {
      return validSources;
    }

    const term = this.searchTerm.toLowerCase();
    return validSources.filter((source) => {
      const name = (source.name ?? '').toLowerCase();
      const tags = source.tags ?? [];
      return (
        name.includes(term) ||
        source.type.toLowerCase().includes(term) ||
        tags.some((tag) => tag.toLowerCase().includes(term))
      );
    });
  }

  get hasKnowledgeSources(): boolean {
    return this.filteredKnowledgeSources.length > 0;
  }

  // Método para obtener las clases CSS según el estado
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
