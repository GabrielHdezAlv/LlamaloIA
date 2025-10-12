import { Component, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
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
  private i18nService = inject(I18nService);

  get t() {
    return this.i18nService.getTranslations();
  }

  get formattedPrice(): string {
    const currency = this.data.currency || '€';
    return `${currency}${this.data.price.toFixed(2)}`;
  }

  get billingText(): string {
    switch (this.data.billingPeriod) {
      case 'monthly': return this.t.monthly;
      case 'yearly': return this.t.yearly;
      case 'one-time': return this.t.oneTimePayment;
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

