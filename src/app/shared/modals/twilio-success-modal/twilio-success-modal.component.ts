import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-twilio-success-modal',
  imports: [MatDialogModule],
  templateUrl: './twilio-success-modal.component.html',
  styleUrl: './twilio-success-modal.component.scss',
})
export class TwilioSuccessModalComponent {
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
