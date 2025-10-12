import { Component, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface WarningModalData {
  title?: string;
  message: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
}

@Component({
  selector: 'app-warning-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './warning-modal.component.html',
  styleUrls: ['./warning-modal.component.scss'],
})
export class WarningModalComponent {
  dialogRef = inject(MatDialogRef<WarningModalComponent>);
  data = inject<WarningModalData>(MAT_DIALOG_DATA);
  private i18nService = inject(I18nService);

  get t() {
    return this.i18nService.getTranslations();
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}


