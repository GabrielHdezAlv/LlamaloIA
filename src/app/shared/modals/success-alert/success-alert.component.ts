import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-success-alert',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="success-alert-container">
      <div class="success-icon">
        <svg class="checkmark" viewBox="0 0 52 52">
          <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark-check" fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>
      <h2 class="success-title">{{ data.message }}</h2>
      <p class="success-subtitle">{{ data.subtitle || '' }}</p>
      <button mat-button class="success-button" (click)="close()">
        {{ data.buttonText || 'Continuar' }}
      </button>
    </div>
  `,
  styles: [`
    .success-alert-container {
      background: linear-gradient(135deg, #4caf50, #45a049);
      border-radius: 20px;
      padding: 40px 30px;
      text-align: center;
      color: white;
      box-shadow: 0 20px 60px rgba(76, 175, 80, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.2);
      max-width: 400px;
      width: 100%;
      animation: slideIn 0.5s ease-out;
    }

    .success-icon {
      margin-bottom: 20px;
      animation: bounceIn 0.6s ease-out 0.2s both;
    }

    .checkmark {
      width: 80px;
      height: 80px;
    }

    .checkmark-circle {
      stroke: white;
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      stroke-width: 3;
      stroke-miterlimit: 10;
      fill: none;
      animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }

    .checkmark-check {
      transform-origin: 50% 50%;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      stroke: white;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
    }

    .success-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 10px 0;
      animation: fadeInUp 0.5s ease-out 0.4s both;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .success-subtitle {
      font-size: 16px;
      margin: 0 0 25px 0;
      opacity: 0.9;
      animation: fadeInUp 0.5s ease-out 0.6s both;
    }

    .success-button {
      background: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      border: 2px solid rgba(255, 255, 255, 0.3) !important;
      border-radius: 25px !important;
      padding: 12px 30px !important;
      font-weight: 600 !important;
      font-size: 16px !important;
      transition: all 0.3s ease !important;
      animation: fadeInUp 0.5s ease-out 0.8s both;
    }

    .success-button:hover {
      background: rgba(255, 255, 255, 0.3) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2) !important;
    }

    /* Animaciones */
    @keyframes slideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes bounceIn {
      0% {
        transform: scale(0.3);
        opacity: 0;
      }
      50% {
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.9);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes stroke {
      100% {
        stroke-dashoffset: 0;
      }
    }

    @keyframes fadeInUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class SuccessAlertComponent {
  constructor(
    public dialogRef: MatDialogRef<SuccessAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      message: string; 
      subtitle?: string; 
      buttonText?: string;
    }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
