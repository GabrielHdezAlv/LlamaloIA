import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderService, ReminderData } from '../../core/services/reminder.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-recordatorio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-recordatorio.component.html',
  styleUrls: ['./admin-recordatorio.component.scss']
})
export class AdminRecordatorioComponent implements OnInit {
  private reminderService = inject(ReminderService);
  private notificationService = inject(NotificationService);

  // Lista de recordatorios
  reminders: ReminderData[] = [];
  activeReminderId: string | null = null;

  // Datos del recordatorio actual
  reminderData: ReminderData = {
    id: '',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
    title: 'Help your team work faster with rules',
    description: 'Is your team doing a lot of manual tagging, assigning, and moving messaging form one place to another? Create rules to automatically tag, archive, and move message starting from one of our Templates in the new Rules Library.',
    learnMoreUrl: '',
    showNewTag: true
  };

  // Vista previa de imagen subida
  imagePreview: string | ArrayBuffer | null = null;
  isSaving = false;
  showDeleteConfirm = false;
  reminderToDelete: string | null = null;

  async ngOnInit(): Promise<void> {
    // Cargar lista de recordatorios
    await this.loadReminders();

    // Si no hay recordatorios, crear uno por defecto
    if (this.reminders.length === 0) {
      await this.createNewReminder();
    }
  }

  async loadReminders(): Promise<void> {
    const list = await this.reminderService.getRemindersList();
    this.reminders = list.reminders;
    this.activeReminderId = list.activeId;

    if (this.activeReminderId) {
      const active = this.reminders.find(r => r.id === this.activeReminderId);
      if (active) {
        this.reminderData = { ...active };
      }
    } else if (this.reminders.length > 0) {
      // Si no hay activo pero hay recordatorios, seleccionar el primero
      this.selectReminder(this.reminders[0].id);
    }
  }

  async selectReminder(id: string): Promise<void> {
    const reminder = this.reminders.find(r => r.id === id);
    if (reminder) {
      this.reminderData = { ...reminder };
      this.activeReminderId = id;
      await this.reminderService.setActiveReminder(id);
    }
  }

  async createNewReminder(): Promise<void> {
    const newReminder = await this.reminderService.createReminder();
    await this.loadReminders();
    this.selectReminder(newReminder.id);
  }

  async deleteReminder(id: string): Promise<void> {
    await this.reminderService.deleteReminder(id);
    await this.loadReminders();

    // Si quedan recordatorios, seleccionar el primero
    if (this.reminders.length > 0) {
      await this.selectReminder(this.reminders[0].id);
    } else {
      // Si no quedan, crear uno nuevo por defecto
      await this.createNewReminder();
    }

    this.showDeleteConfirm = false;
    this.reminderToDelete = null;
  }

  confirmDelete(id: string): void {
    this.reminderToDelete = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.reminderToDelete = null;
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreview = reader.result;
        this.reminderData.imageUrl = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  async saveReminder(): Promise<void> {
    if (!this.reminderData.id) {
      // Si no tiene ID, crear uno nuevo
      await this.createNewReminder();
      return;
    }

    this.isSaving = true;

    try {
      await this.reminderService.updateReminder(this.reminderData);
      await this.loadReminders(); // Recargar para actualizar la lista
      this.notificationService.success('Recordatorio guardado correctamente');
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      this.isSaving = false;
    }
  }


  async resetForm(): Promise<void> {
    if (this.reminderData.id) {
      // Si tiene ID, recargar desde el servicio
      await this.loadReminders();
      if (this.activeReminderId) {
        await this.selectReminder(this.activeReminderId);
      }
    } else {
      // Si no tiene ID, crear uno nuevo
      await this.createNewReminder();
    }
    this.imagePreview = null;
  }
}

