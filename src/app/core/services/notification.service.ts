import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomNotificationComponent, NotificationData } from '../../shared/components/custom-notification/custom-notification.component';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private snackBar = inject(MatSnackBar);

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration: number = 3000) {
        this.snackBar.openFromComponent(CustomNotificationComponent, {
            /* La animación de salida la controla el componente (boxExit + dismiss). */
            duration: undefined,
            data: { message, type, durationMs: duration },
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['simple-pill-snackbar']
        });
    }

    success(message: string) {
        this.show(message, 'success');
    }

    error(message: string) {
        this.show(message, 'error');
    }

    info(message: string) {
        this.show(message, 'info');
    }

    warning(message: string) {
        this.show(message, 'warning');
    }
}
