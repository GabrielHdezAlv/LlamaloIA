import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../../core/services/i18n.service';
import { MakeModalComponent } from '../make-modal/make-modal.component';

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

interface CreatedAction {
  id: string;
  name: string;
  description: string;
  serverUrl: string;
  enabled: boolean;
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
  private dialog = inject(MatDialog);

  selectedActions: SelectedActions = {
    getOrderStatus: false,
    getProductInfo: false,
  };

  createdActions: CreatedAction[] = [];

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

  onCustomActionClick(): void {
    // Abrir el modal de Make sin cerrar el de Shopify
    const makeDialogRef = this.dialog.open(MakeModalComponent, {
      width: '1200px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Añadir Acciones especificas',
        message: 'Define la acción que la IA podrá ejecutar',
        formEnabled: false
      }
    });

    makeDialogRef.afterClosed().subscribe(result => {
      console.log('Make modal closed with result:', result);
      // El modal de Make ya no retorna resultado, solo se cierra
      // No hacer nada, solo permanecer en Shopify
    });
  }

  onContinue(): void {
    const result = {
      selectedActions: this.selectedActions,
      createdActions: this.createdActions,
      type: 'shopify'
    };
    console.log('Shopify modal closing with result:', result);
    this.dialogRef.close(result);
  }

}