import {
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { I18nService } from '../../../core/services/i18n.service';
import { WebhookActionsService } from '../../../core/services/webhook-actions.service';
import type { WebhookAction } from '../../../core/services/webhook-actions.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface MakeModalData {
  /** Obligatorio para crear/listar acciones en la API. */
  agentId?: number;
  title?: string;
  message?: string;
  formEnabled?: boolean;
  config?: { actionData?: ActionData };
}

interface ActionData {
  name: string;
  description: string;
  serverUrl: string;
}

@Component({
  selector: 'app-make-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './make-modal.component.html',
  styleUrls: ['./make-modal.component.scss'],
})
export class MakeModalComponent implements OnInit, OnDestroy {
  dialogRef = inject(MatDialogRef<MakeModalComponent>);
  data: MakeModalData = inject(MAT_DIALOG_DATA);
  private i18nService = inject(I18nService);
  private webhookActionsService = inject(WebhookActionsService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  actionData: ActionData = {
    name: '',
    description: '',
    serverUrl: '',
  };

  savedActions: WebhookAction[] = [];
  isLoadingActions = false;
  isSaving = false;
  saveError: string | null = null;

  get t() {
    return this.i18nService.getTranslations();
  }

  get agentId(): number | undefined {
    return this.data?.agentId;
  }

  ngOnInit(): void {
    if (this.data?.config?.actionData) {
      this.actionData = { ...this.data.config.actionData };
    }
    this.loadActions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadActions(): void {
    if (this.agentId == null) return;
    this.isLoadingActions = true;
    this.webhookActionsService
      .list(this.agentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.savedActions = res.items;
          this.isLoadingActions = false;
        },
        error: (err: { error?: { message?: string } }) => {
          this.isLoadingActions = false;
          this.saveError =
            err?.error?.message ||
            'No se pudieron cargar las acciones. Comprueba tu plan.';
        },
      });
  }

  isFormValid(): boolean {
    const n = this.actionData.name.trim();
    const d = this.actionData.description.trim();
    const u = this.actionData.serverUrl.trim();
    return n.length >= 2 && d.length >= 8 && u.length >= 12;
  }

  onSaveAction(): void {
    if (this.agentId == null) {
      this.saveError = 'Falta el identificador del agente.';
      return;
    }
    if (!this.isFormValid()) {
      return;
    }
    this.isSaving = true;
    this.saveError = null;
    this.webhookActionsService
      .create(this.agentId, {
        name: this.actionData.name.trim(),
        description: this.actionData.description.trim(),
        webhookUrl: this.actionData.serverUrl.trim(),
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.notificationService.success('Acción guardada');
          this.actionData = { name: '', description: '', serverUrl: '' };
          this.loadActions();
        },
        error: (err: { error?: { message?: string } }) => {
          this.isSaving = false;
          this.saveError =
            err?.error?.message ||
            'No se pudo guardar. Revisa la URL (HTTPS) y los límites de tu plan.';
        },
      });
  }

  removeAction(id: string, event: Event): void {
    event.preventDefault();
    if (this.agentId == null) return;
    this.webhookActionsService
      .delete(this.agentId, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Acción eliminada');
          this.loadActions();
        },
        error: (err: { error?: { message?: string } }) => {
          this.notificationService.error(
            err?.error?.message || 'No se pudo eliminar la acción.',
          );
        },
      });
  }
}
