import { Component, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface SuccessModalData {
  title?: string;
  message: string;
  details?: string;
  showActionButton?: boolean;
  actionButtonText?: string;
}

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.scss'],
})
export class SuccessModalComponent {
  dialogRef = inject(MatDialogRef<SuccessModalComponent>);
  data = inject<SuccessModalData>(MAT_DIALOG_DATA);
  private i18nService = inject(I18nService);

  get t() {
    return this.i18nService.getTranslations();
  }

  close(): void {
    this.dialogRef.close();
  }

  performAction(): void {
    this.dialogRef.close('action');
  }
}

