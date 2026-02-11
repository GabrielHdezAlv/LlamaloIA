import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-call-type-step',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './call-type-step.component.html',
  styleUrls: ['./call-type-step.component.scss'],
})
export class CallTypeStepComponent {
  @Input() selectedCallType: 'inbound' | 'outbound' | null = null;
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;

  @Output() callTypeChange = new EventEmitter<'inbound' | 'outbound' | null>();
  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();

  onSelectCallType(type: 'inbound' | 'outbound') {
    this.selectedCallType = this.selectedCallType === type ? null : type;
    this.callTypeChange.emit(this.selectedCallType);
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }
}

