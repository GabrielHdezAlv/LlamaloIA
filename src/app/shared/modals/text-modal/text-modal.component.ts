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

export interface TextModalData {
  title?: string;
  message?: string;
  initialName?: string;
  initialContent?: string;
  /** Si viene definido, el modal actúa como edición y se devuelve en el cierre. */
  sourceId?: string;
}

@Component({
  selector: 'app-text-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './text-modal.component.html',
  styleUrls: ['./text-modal.component.scss'],
})
export class TextModalComponent implements OnInit {
  dialogRef = inject(MatDialogRef<TextModalComponent, any>);
  data: TextModalData = inject(MAT_DIALOG_DATA);
  private i18nService = inject(I18nService);

  textContent = '';
  name = '';

  get t() {
    return this.i18nService.getTranslations();
  }

  get isEditMode(): boolean {
    return this.data.sourceId != null && this.data.sourceId !== '';
  }

  ngOnInit(): void {
    if (this.data.initialName != null) {
      this.name = this.data.initialName;
    }
    if (this.data.initialContent != null) {
      this.textContent = this.data.initialContent;
    }
  }

  isDarkMode(): boolean {
    // Verificar si el modo oscuro está activado
    return (
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close({
      content: this.textContent,
      name: this.name || this.t.manualTextDefault,
      sourceId: this.data.sourceId,
    });
  }
}
