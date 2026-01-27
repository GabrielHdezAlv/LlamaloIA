import { inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserStorage } from '../../storages/user/user-storage';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const userStorage = inject(UserStorage);
  const twilioStorage = inject(TwilioStorage);
  const platformId = inject(PLATFORM_ID) as object;

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo manejar errores 401 (token inválido o expirado)
      // Excluir rutas de autenticación (login, register) para evitar bucles
      const isAuthRoute = req.url.includes('/auth/login') || 
                         req.url.includes('/auth/register');
      
      if (error.status === 401 && !isAuthRoute && isPlatformBrowser(platformId)) {
        // Limpiar datos del usuario
        userStorage.clearUser();
        
        // Limpiar configuración de Twilio
        twilioStorage.clearConfig();
        
        // Limpiar token del localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('token');
        }

        // Obtener mensaje de error del backend o usar mensaje por defecto
        let errorMessage = 'Token inválido o expirado. Por favor, inicia sesión nuevamente.';
        
        if (error.error?.message) {
          // Verificar si el mensaje contiene información sobre token inválido/expirado
          const errorMsg = String(error.error.message).toLowerCase();
          if (errorMsg.includes('token') && (errorMsg.includes('inválido') || errorMsg.includes('expirado') || errorMsg.includes('invalid') || errorMsg.includes('expired'))) {
            errorMessage = error.error.message;
          }
        }

        // Mostrar toast con el mensaje de error
        snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: 'snackbar-error',
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        // Redirigir al login
        router.navigate(['/login']);
      }

      // Re-lanzar el error para que los componentes puedan manejarlo si es necesario
      return throwError(() => error);
    })
  );
};
