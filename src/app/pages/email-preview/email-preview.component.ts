import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { buildVerificationEmailHtml } from './verification-email-html';

@Component({
  selector: 'app-email-preview',
  standalone: true,
  template: `
    <div
      style="min-height: 100vh; box-sizing: border-box; padding: 24px 16px; background: linear-gradient(165deg, #e8ecf8 0%, #f4f6fb 45%, #eef1f8 100%);"
    >
      <div [innerHTML]="safeHtml"></div>
    </div>
  `,
})
export class EmailPreviewComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);

  readonly safeHtml: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    buildVerificationEmailHtml('123456', {
      logoUrl: `${this.resolveOrigin()}/assets/logo_blanco.png`,
    }),
  );

  private resolveOrigin(): string {
    const origin = this.document.defaultView?.location?.origin;
    return origin && origin !== 'null' ? origin : 'https://app.llamalo.ai';
  }
}
