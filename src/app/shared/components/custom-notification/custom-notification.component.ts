import {
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

export interface NotificationData {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  /** Milisegundos visibles antes de la animación de salida (el snackbar no usa `duration` de Material). */
  durationMs?: number;
}

@Component({
  selector: 'app-custom-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="notification-box"
      [ngClass]="data.type"
      [class.closing]="closing"
      (animationend)="onBoxAnimationEnd($event)">
      <div class="status-dot"></div>
      <span class="message-text">{{ data.message }}</span>
    </div>
  `,
  styles: [`
    .notification-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      max-width: min(560px, calc(100vw - 2rem));
      width: 100%;
      box-sizing: border-box;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      color: #1e293b;
      font-family: 'Inter', sans-serif;
      pointer-events: auto;
      animation: boxAppear 0.25s ease-out forwards;
    }

    .notification-box.closing {
      animation: boxExit 0.25s ease-in forwards;
    }

    @keyframes boxAppear {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes boxExit {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(-10px); opacity: 0; }
    }

    :host-context(html.dark) .notification-box {
      background: rgba(24, 24, 27, 0.9);
      border-color: rgba(255, 255, 255, 0.1);
      color: #f4f4f5;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .success .status-dot { background: #10b981; }
    .error .status-dot { background: #ef4444; }
    .info .status-dot { background: #3b82f6; }
    .warning .status-dot { background: #f59e0b; }

    .message-text {
      flex: 1;
      min-width: 0;
      font-weight: 300;
      font-size: 13px;
      line-height: 1.4;
      word-break: break-word;
    }

    /* Pantallas 4xl (≥2500px): un poco más grande que el base, sin pasarse */
    @media (min-width: 2500px) {
      .notification-box {
        gap: 11px;
        padding: 13px 20px;
        max-width: min(680px, calc(100vw - 3rem));
        border-radius: 12px;
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.07);
      }
      :host-context(html.dark) .notification-box {
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.38);
      }
      .status-dot {
        width: 8px;
        height: 8px;
      }
      .message-text {
        font-size: 16px;
        font-weight: 300;
        line-height: 1.42;
      }
    }
  `],
})
export class CustomNotificationComponent implements OnInit, OnDestroy {
  readonly data = inject<NotificationData>(MAT_SNACK_BAR_DATA);
  private readonly snackBarRef = inject(
    MatSnackBarRef<CustomNotificationComponent>,
  );

  closing = false;

  private dismissTimeout?: ReturnType<typeof setTimeout>;
  private exitFallback?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    const ms = this.data.durationMs ?? 3000;
    if (ms > 0) {
      this.dismissTimeout = setTimeout(() => this.beginExit(), ms);
    }
  }

  ngOnDestroy(): void {
    if (this.dismissTimeout) clearTimeout(this.dismissTimeout);
    if (this.exitFallback) clearTimeout(this.exitFallback);
  }

  onBoxAnimationEnd(event: AnimationEvent): void {
    const name = event.animationName || '';
    if (
      !this.closing ||
      !name.includes('boxExit') ||
      event.target !== event.currentTarget
    ) {
      return;
    }
    if (this.exitFallback) {
      clearTimeout(this.exitFallback);
      this.exitFallback = undefined;
    }
    this.snackBarRef.dismiss();
  }

  private beginExit(): void {
    if (this.closing) return;
    this.closing = true;
    this.exitFallback = setTimeout(() => {
      this.snackBarRef.dismiss();
    }, 350);
  }
}
