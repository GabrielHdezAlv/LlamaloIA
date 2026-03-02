import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ds-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  @Input() public inputTextSpinner = '';
}

