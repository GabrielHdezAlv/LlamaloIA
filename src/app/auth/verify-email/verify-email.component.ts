import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { ModalService } from '../../shared/modals/modal.service';

/**
 * Ruta legada / enlaces en correos: abre el modal de verificación y no muestra pantalla completa.
 */
@Component({
  selector: 'app-verify-email',
  standalone: true,
  template: '',
  styles: [
    `
      :host {
        display: block;
        min-height: 0;
      }
    `,
  ],
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private modalService = inject(ModalService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      const email = (params['email'] as string) || '';
      const token = (params['token'] as string) || '';

      if (!email.trim() && !token.trim()) {
        void this.router.navigate(['/login'], { replaceUrl: true });
        return;
      }

      setTimeout(() => {
        const ref = this.modalService.openEmailVerification({
          email: email.trim() || undefined,
          initialToken: token.trim() || undefined,
        });
        ref.afterClosed().subscribe((result: { sessionCompleted?: boolean }) => {
          if (result?.sessionCompleted) {
            return;
          }
          void this.router.navigate(['/login'], { replaceUrl: true });
        });
      }, 0);
    });
  }
}
