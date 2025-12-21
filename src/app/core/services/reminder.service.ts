import { Injectable, inject, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LocalStorageRepository } from '../../storages/local-storage.repository';

export interface ReminderData {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  learnMoreUrl: string;
  showNewTag: boolean;
}

export interface RemindersList {
  reminders: ReminderData[];
  activeId: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private storageRepo = inject(LocalStorageRepository);
  private isBrowser: boolean;
  private readonly STORE_NAME = 'ReminderStorage';
  private readonly KEY = 'remindersList';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Generar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Obtener lista de recordatorios
  async getRemindersList(): Promise<RemindersList> {
    if (!this.isBrowser) {
      return { reminders: [], activeId: null };
    }
    const stored = await this.storageRepo.getItem<RemindersList>(this.STORE_NAME, this.KEY);
    return stored || { reminders: [], activeId: null };
  }

  // Guardar lista de recordatorios
  async saveRemindersList(list: RemindersList): Promise<void> {
    if (!this.isBrowser) return;
    await this.storageRepo.setItem(this.STORE_NAME, this.KEY, list);
  }

  // Crear nuevo recordatorio
  async createReminder(): Promise<ReminderData> {
    const list = await this.getRemindersList();
    const newReminder: ReminderData = {
      id: this.generateId(),
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
      title: 'Help your team work faster with rules',
      description: 'Is your team doing a lot of manual tagging, assigning, and moving messaging form one place to another? Create rules to automatically tag, archive, and move message starting from one of our Templates in the new Rules Library.',
      learnMoreUrl: '',
      showNewTag: true
    };
    
    list.reminders.push(newReminder);
    if (!list.activeId) {
      list.activeId = newReminder.id;
    }
    
    await this.saveRemindersList(list);
    return newReminder;
  }

  // Actualizar recordatorio
  async updateReminder(reminder: ReminderData): Promise<void> {
    const list = await this.getRemindersList();
    const index = list.reminders.findIndex(r => r.id === reminder.id);
    if (index !== -1) {
      list.reminders[index] = reminder;
      await this.saveRemindersList(list);
    }
  }

  // Eliminar recordatorio
  async deleteReminder(id: string): Promise<void> {
    const list = await this.getRemindersList();
    list.reminders = list.reminders.filter(r => r.id !== id);
    
    // Si se elimina el activo, seleccionar el primero disponible o null
    if (list.activeId === id) {
      list.activeId = list.reminders.length > 0 ? list.reminders[0].id : null;
    }
    
    await this.saveRemindersList(list);
  }

  // Establecer recordatorio activo
  async setActiveReminder(id: string | null): Promise<void> {
    const list = await this.getRemindersList();
    list.activeId = id;
    await this.saveRemindersList(list);
  }

  // Obtener recordatorio activo
  async getActiveReminder(): Promise<ReminderData | null> {
    const list = await this.getRemindersList();
    if (!list.activeId) {
      return null;
    }
    return list.reminders.find(r => r.id === list.activeId) || null;
  }

  // Obtener recordatorio activo con valores por defecto
  async getActiveReminderWithDefaults(): Promise<ReminderData> {
    const active = await this.getActiveReminder();
    if (active) {
      return active;
    }
    
    // Valores por defecto
    return {
      id: '',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
      title: 'Help your team work faster with rules',
      description: 'Is your team doing a lot of manual tagging, assigning, and moving messaging form one place to another? Create rules to automatically tag, archive, and move message starting from one of our Templates in the new Rules Library.',
      learnMoreUrl: '',
      showNewTag: true
    };
  }
}

