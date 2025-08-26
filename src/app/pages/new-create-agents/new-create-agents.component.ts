import { Component } from '@angular/core';

@Component({
  selector: 'app-new-create-agents',
  standalone: true,
  imports: [], // No necesitas importar nada para @if
  templateUrl: './new-create-agents.component.html',
  styleUrl: './new-create-agents.component.scss'
})
export class NewCreateAgentsComponent {
  step: 'callType' | 'language' = 'callType';

  onSelect(type: 'inbound' | 'outbound') {
    console.log(`Seleccionado: ${type}`);
    this.step = 'language';
  }

  goBack() {
    this.step = 'callType';
  }
}