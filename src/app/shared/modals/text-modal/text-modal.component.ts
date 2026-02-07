import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../../core/services/i18n.service';

export interface TextModalData {
  title?: string;
  message?: string;
}

@Component({
  selector: 'app-text-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './text-modal.component.html',
  styleUrls: ['./text-modal.component.scss'],
})
export class TextModalComponent {
  dialogRef = inject(MatDialogRef<TextModalComponent, any>);
  data: TextModalData = inject(MAT_DIALOG_DATA);
  private i18nService = inject(I18nService);

  textContent = '';
  name = '';

  get t() {
    return this.i18nService.getTranslations();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close({
      content: this.textContent,
      name: this.name || 'Texto manual'
    });
  }
}
