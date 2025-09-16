import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ErrorModalData {
  title?: string;
  message: string;
  details?: string;
}

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss'],
})
export class ErrorModalComponent {
  dialogRef = inject(MatDialogRef<ErrorModalComponent>);
  data = inject<ErrorModalData>(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }
}
