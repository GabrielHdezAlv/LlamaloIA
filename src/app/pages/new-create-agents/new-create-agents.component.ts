import { Component } from '@angular/core';

@Component({
  selector: 'app-new-create-agents',
  imports: [],
  templateUrl: './new-create-agents.component.html',
  styleUrl: './new-create-agents.component.scss'
})
export class NewCreateAgentsComponent {
  onSelect(type: 'inbound' | 'outbound') {
    console.log(`Seleccionado: ${type}`);
    // Aquí puedes navegar o emitir un evento
  }

  goBack() {
    console.log('Volviendo atrás...');
    window.history.back();
  }
}