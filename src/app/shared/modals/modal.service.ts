import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorModalComponent, ErrorModalData } from './error-modal/error-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private dialog = inject(MatDialog);

  openError(data: ErrorModalData) {
    return this.dialog.open(ErrorModalComponent, {
      width: '420px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data,
    });
  }
}
