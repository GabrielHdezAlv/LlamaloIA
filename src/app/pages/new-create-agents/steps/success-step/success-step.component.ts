import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success-step.component.html',
  styleUrls: ['./success-step.component.scss'],
})
export class SuccessStepComponent {
  @Output() goToAgentsClicked = new EventEmitter<void>();
}

