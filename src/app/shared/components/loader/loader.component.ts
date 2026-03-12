import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <ds-spinner variant="auto" [inputTextSpinner]="''"></ds-spinner>
  `,
})
export class LoaderComponent {}
