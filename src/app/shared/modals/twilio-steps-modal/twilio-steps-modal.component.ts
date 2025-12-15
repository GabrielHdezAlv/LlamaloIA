import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../../core/services/i18n.service';

export interface TwilioStepsModalData {
  // No necesita datos por ahora
}

@Component({
  selector: 'app-twilio-steps-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './twilio-steps-modal.component.html',
  styleUrls: ['./twilio-steps-modal.component.scss'],
})
export class TwilioStepsModalComponent {
  dialogRef = inject(MatDialogRef<TwilioStepsModalComponent>);
  data = inject<TwilioStepsModalData>(MAT_DIALOG_DATA);
  private i18nService = inject(I18nService);

  get t() {
    return this.i18nService.getTranslations();
  }

  close(): void {
    this.dialogRef.close();
  }
}
