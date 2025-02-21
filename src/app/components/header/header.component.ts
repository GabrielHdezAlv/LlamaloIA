import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [MatIconModule],
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  notificationsCount = 3; // Número de notificaciones
  user = {
    name: 'Carlos',
    avatar: 'assets/user.png'
  };

  logout() {
    console.log('Cerrando sesión...');
    // Aquí iría la lógica para cerrar sesión en Firebase
  }
}
