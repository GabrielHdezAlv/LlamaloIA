import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../../core/services/i18n.service';

export interface ShopifyModalData {
  title?: string;
  message?: string;
  formEnabled?: boolean;
  config?: any;
}

interface SelectedActions {
  getOrderStatus: boolean;
  getProductInfo: boolean;
}

@Component({
  selector: 'app-shopify-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './shopify-modal.component.html',
})
export class ShopifyModalComponent implements OnInit {
  dialogRef = inject(MatDialogRef<ShopifyModalComponent, any>);
  data: ShopifyModalData = inject(MAT_DIALOG_DATA);
  private i18nService = inject(I18nService);

  selectedActions: SelectedActions = {
    getOrderStatus: false,
    getProductInfo: false,
  };

  get t() {
    return this.i18nService.getTranslations();
  }

  ngOnInit() {
    console.log('Shopify modal data: ', this.data);

    // Si hay configuración existente, cargar las acciones seleccionadas
    if (this.data?.config?.selectedActions) {
      this.selectedActions = { ...this.data.config.selectedActions };
    }
  }

  onActionToggle(actionType: keyof SelectedActions, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedActions[actionType] = target.checked;
    console.log(`${actionType} toggled:`, this.selectedActions[actionType]);
  }

}