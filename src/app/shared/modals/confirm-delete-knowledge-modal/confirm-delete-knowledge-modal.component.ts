import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

export interface ConfirmDeleteKnowledgeModalData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'app-confirm-delete-knowledge-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './confirm-delete-knowledge-modal.component.html',
  styleUrls: ['./confirm-delete-knowledge-modal.component.scss'],
})
export class ConfirmDeleteKnowledgeModalComponent {
  dialogRef = inject(MatDialogRef<ConfirmDeleteKnowledgeModalComponent>);
  data = inject<ConfirmDeleteKnowledgeModalData>(MAT_DIALOG_DATA);

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
