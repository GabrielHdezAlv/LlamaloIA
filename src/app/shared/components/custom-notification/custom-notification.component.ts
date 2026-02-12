import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

export interface NotificationData {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

@Component({
    selector: 'app-custom-notification',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="notification-box" [ngClass]="data.type">
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
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: 10px; /* Menos redondeado, más estándar */
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      color: #1e293b;
      font-family: 'Inter', sans-serif;
      pointer-events: auto;
      animation: boxAppear 0.25s ease-out forwards;
    }

    @keyframes boxAppear {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
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
      font-weight: 300; /* Letra más fina */
      font-size: 13px;
      line-height: 1.4;
    }
  `]
})
export class CustomNotificationComponent {
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: NotificationData) { }
}
