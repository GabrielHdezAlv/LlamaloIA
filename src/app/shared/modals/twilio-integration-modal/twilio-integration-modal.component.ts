import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-twilio-integration-modal',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './twilio-integration-modal.component.html',
  styleUrl: './twilio-integration-modal.component.scss',
})
export class TwilioIntegrationModalComponent {
  constructor(
    public dialogRef: MatDialogRef<TwilioIntegrationModalComponent>
  ) {}
}
