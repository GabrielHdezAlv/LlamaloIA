import { Component, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-twilio-success-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './twilio-success-modal.component.html',
  styleUrls: ['./twilio-success-modal.component.scss'],
})
export class TwilioSuccessModalComponent {
  dialogRef = inject(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private i18nService = inject(I18nService);

  get t() {
    return this.i18nService.getTranslations();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
