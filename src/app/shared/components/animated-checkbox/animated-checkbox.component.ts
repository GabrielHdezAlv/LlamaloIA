import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-checkbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="checkbox-wrapper" (click)="toggle()">
      <div class="checkbox" [class.checked]="checked">
        <div class="checkmark" *ngIf="checked">
          ✓
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkbox-wrapper {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      height: 20px;
      vertical-align: middle;
    }

    .checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid #d1d5db;
      border-radius: 4px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }

    .checkbox:hover {
      border-color: #9ca3af;
      transform: scale(1.02);
    }

    .checkbox.checked {
      background: #000000;
      border-color: #000000;
      transform: scale(1.05);
      animation: bounce 0.3s ease;
    }

    .checkmark {
      color: white;
      font-size: 12px;
      font-weight: bold;
      transform: scale(0);
      animation: checkmark-appear 0.2s ease forwards;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    @keyframes bounce {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1.05); }
    }

    @keyframes checkmark-appear {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }

    .checkbox::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.3);
      transform: translate(-50%, -50%);
      transition: all 0.3s ease;
    }

    .checkbox-wrapper:active .checkbox::before {
      width: 40px;
      height: 40px;
    }
  `]
})
export class AnimatedCheckboxComponent {
  @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}