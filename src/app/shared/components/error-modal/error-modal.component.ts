import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ErrorModalData {
  title: string;
  message: string;
  details?: string;
  type: 'error' | 'warning' | 'info';
  showDetails?: boolean;
}

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss']
})
export class ErrorModalComponent {
  @Input() title: string = 'Error';
  @Input() message: string = '';
  @Input() details: string = '';
  @Input() type: 'error' | 'warning' | 'info' = 'error';
  @Input() showDetails: boolean = false;
  @Output() close = new EventEmitter<void>();

  private dialogRef = inject(MatDialogRef<ErrorModalComponent>, { optional: true });

  constructor() {
    // Si se usa como modal de Angular Material
    const dialogData = inject(MAT_DIALOG_DATA, { optional: true });
    
    if (dialogData) {
      this.title = dialogData.title || this.title;
      this.message = dialogData.message || this.message;
      this.details = dialogData.details || this.details;
      this.type = dialogData.type || this.type;
      this.showDetails = dialogData.showDetails || this.showDetails;
    }
  }

  onClose() {
    this.close.emit();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  getIcon(): string {
    switch (this.type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'error';
    }
  }

  getTitleClass(): string {
    switch (this.type) {
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-red-600';
    }
  }

  getBorderClass(): string {
    switch (this.type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-red-200 bg-red-50';
    }
  }
}
