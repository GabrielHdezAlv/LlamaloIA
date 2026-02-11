import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connect-business-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connect-business-step.component.html',
  styleUrls: ['./connect-business-step.component.scss'],
})
export class ConnectBusinessStepComponent {
  @Input() shopifyConnectedDomain: string | null = null;
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;

  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();
  @Output() connectShopifyClicked = new EventEmitter<void>();

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }
}

