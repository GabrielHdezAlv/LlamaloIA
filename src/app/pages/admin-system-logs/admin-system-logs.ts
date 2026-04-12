import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface SystemLog {
  id: string;
  type: string;
  message: string;
  reason: string;
  metadata: any;
  timestamp: string;
}

@Component({
  selector: 'app-admin-system-logs',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './admin-system-logs.html',
  styleUrls: ['./admin-system-logs.scss']
})
export class AdminSystemLogsComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  
  logs: SystemLog[] = [];
  loading = true;
  error = '';

  async ngOnInit() {
    await this.loadLogs();
  }

  async loadLogs() {
    this.loading = true;
    this.error = '';
    try {
      const response = await firstValueFrom(
        this.http.get<SystemLog[]>(`${this.apiUrl}/system-logs`)
      );
      this.logs = response;
    } catch (e: any) {
      console.error('Error loading system logs:', e);
      this.error = 'No se pudieron cargar los registros del sistema.';
    } finally {
      this.loading = false;
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'CALL_FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'MAILERSEND_ERROR':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  }

  refreshLogs() {
    this.loadLogs();
  }
}

