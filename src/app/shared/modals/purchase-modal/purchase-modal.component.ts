import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface PurchaseModalData {
  title?: string;
  productName: string;
  price: number;
  currency?: string;
  description?: string;
  features?: string[];
  billingPeriod?: string; // 'monthly', 'yearly', 'one-time'
}

@Component({
  selector: 'app-purchase-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './purchase-modal.component.html',
  styleUrls: ['./purchase-modal.component.scss'],
})
export class PurchaseModalComponent {
  dialogRef = inject(MatDialogRef<PurchaseModalComponent>);
  data = inject<PurchaseModalData>(MAT_DIALOG_DATA);

  get formattedPrice(): string {
    const currency = this.data.currency || '€';
    return `${currency}${this.data.price.toFixed(2)}`;
  }

  get billingText(): string {
    switch (this.data.billingPeriod) {
      case 'monthly': return '/mes';
      case 'yearly': return '/año';
      case 'one-time': return 'pago único';
      default: return '';
    }
  }

  confirmPurchase(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

