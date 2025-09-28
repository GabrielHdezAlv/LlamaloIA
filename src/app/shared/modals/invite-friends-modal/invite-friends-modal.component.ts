import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TeamMember {
  name: string;
  email: string;
  role: string;
}

interface ContactSuggestion {
  name: string;
  email: string;
}

@Component({
  selector: 'app-invite-friends-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invite-friends-modal.component.html',
  styleUrls: ['./invite-friends-modal.component.scss']
})
export class InviteFriendsModalComponent {
  @Output() closeModal = new EventEmitter<void>();

  // Variables para el formulario de invitación
  emailInput: string = 'Sal';
  selectedEmails: string[] = ['Savannah Nguyen', 'Ronald Richards', 'Devon Lane', 'Esther Howard', 'Wade Warren'];
  selectedRole: string = 'Can Edit';
  showSuggestions: boolean = false;
  hoveredSuggestionIndex: number = -1;

  // Lista de miembros actuales del equipo
  teamMembers: TeamMember[] = [
    { name: 'Ronald Richards', email: 'ronald@example.com', role: 'Owner' },
    { name: 'Cameron Williamson', email: 'cameron@example.com', role: 'Can Edit' },
    { name: 'Arlene McCoy', email: 'arlene@example.com', role: 'Can Edit' },
    { name: 'Jerome Bell', email: 'jerome@example.com', role: 'Can Edit' },
    { name: 'Dianne Russell', email: 'dianne@example.com', role: 'Can Edit' }
  ];

  // Sugerencias de contactos
  contactSuggestions: ContactSuggestion[] = [
    { name: 'Sebastian Graham', email: 'sebastian.graham@example.com' },
    { name: 'Sara Cruz', email: 'sara.cruz@example.com' }
  ];

  // Roles disponibles
  roles = ['Can Edit', 'Can View', 'Can Comment'];

  onEmailInputChange() {
    this.showSuggestions = this.emailInput.length > 0;
  }

  onEmailKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addEmail();
    }
  }

  addEmail() {
    const email = this.emailInput.trim();
    if (email && !this.selectedEmails.includes(email)) {
      this.selectedEmails.push(email);
      this.emailInput = '';
      this.showSuggestions = false;
    }
  }

  removeEmail(email: string) {
    this.selectedEmails = this.selectedEmails.filter(e => e !== email);
  }

  selectSuggestion(suggestion: ContactSuggestion) {
    const email = suggestion.email;
    if (!this.selectedEmails.includes(email)) {
      this.selectedEmails.push(email);
      this.emailInput = '';
      this.showSuggestions = false;
    }
  }

  updateMemberRole(member: TeamMember, newRole: string) {
    member.role = newRole;
  }

  sendInvite() {
    // Aquí implementarías la lógica para enviar invitaciones
    console.log('Enviando invitaciones:', {
      emails: this.selectedEmails,
      role: this.selectedRole
    });
    
    // Limpiar el formulario después de enviar
    this.selectedEmails = [];
    this.emailInput = '';
    this.selectedRole = 'Can Edit';
  }

  close() {
    this.closeModal.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
