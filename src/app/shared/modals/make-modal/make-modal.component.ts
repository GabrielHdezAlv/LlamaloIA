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

export interface MakeModalData {
  title?: string;
  message?: string;
  formEnabled?: boolean;
  config?: any;
}

interface ActionData {
  name: string;
  description: string;
  serverUrl: string;
}

@Component({
  selector: 'app-make-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './make-modal.component.html',
  styleUrls: ['./make-modal.component.scss'],
})
export class MakeModalComponent implements OnInit {
  dialogRef = inject(MatDialogRef<MakeModalComponent, any>);
  data: MakeModalData = inject(MAT_DIALOG_DATA);
  private i18nService = inject(I18nService);

  actionData: ActionData = {
    name: '',
    description: '',
    serverUrl: '',
  };

  get t() {
    return this.i18nService.getTranslations();
  }

  ngOnInit() {
    // Si hay configuración existente, cargar los datos de la acción
    if (this.data?.config?.actionData) {
      this.actionData = { ...this.data.config.actionData };
    }
  }

  isFormValid(): boolean {
    return !!(this.actionData.name.trim() && this.actionData.serverUrl.trim());
  }

  onContinue(): void {
    if (this.isFormValid()) {
      // Solo cerrar el modal sin retornar resultado
      this.dialogRef.close();
    } else {
      console.info('Form is not valid, cannot continue');
    }
  }
}
