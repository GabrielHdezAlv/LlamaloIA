import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-twilio-success-modal',
  imports: [MatDialogModule],
  templateUrl: './twilio-success-modal.component.html',
  styleUrl: './twilio-success-modal.component.scss',
})
export class TwilioSuccessModalComponent {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<TwilioSuccessModalComponent>);
}
