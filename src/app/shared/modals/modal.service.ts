import { Injectable } from '@angular/core';

export interface ErrorModalData {
  title?: string;
  message: string;
}

export interface DeleteAccountModalData {
  userName: string;
  message: string;
}

export interface PurchaseModalData {
  title?: string;
  message: string;
}

export interface SuccessModalData {
  title?: string;
  message: string;
  details?: string;
}

export interface WarningModalData {
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor() { }

  openError(data: ErrorModalData) {
    console.log('Error modal:', data);
    alert(`Error: ${data.message || 'Ha ocurrido un error'}`);
  }

  openSuccess(data: SuccessModalData) {
    console.log('Success modal:', data);
    alert(`¡Éxito! ${data.message || 'Operación completada'}`);
  }

  openWarning(data: WarningModalData) {
    console.log('Warning modal:', data);
    alert(`Advertencia: ${data.message || 'Ten cuidado'}`);
  }

  openDeleteAccount(data: DeleteAccountModalData) {
    console.log('Delete account modal:', data);
    return {
      afterClosed: () => ({
        subscribe: (callback: (result: any) => void) => {
          const result = confirm(data.message || '¿Estás seguro?');
          callback(result);
        }
      })
    };
  }

  openPurchase(data: PurchaseModalData) {
    console.log('Purchase modal:', data);
    alert(`Compra: ${data.message || 'Procesando compra'}`);
  }
}
