import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../../core/services/i18n.service';

export interface WebModalData {
  title?: string;
  message?: string;
}

@Component({
  selector: 'app-web-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './web-modal.component.html',
  styleUrls: ['./web-modal.component.scss'],
})
export class WebModalComponent {
  dialogRef = inject(MatDialogRef<WebModalComponent, any>);
  data: WebModalData = inject(MAT_DIALOG_DATA);
  private i18nService = inject(I18nService);

  isExpanded = true;
  url = '';
  urlProtocol = 'https://';
  links: string[] = []; // Lista de links encontrados
  searchQuery = ''; // Query de búsqueda
  filteredLinks: string[] = []; // Links filtrados
  selectedLinks: Set<string> = new Set(); // Links seleccionados

  get t() {
    return this.i18nService.getTranslations();
  }

  get displayedLinks(): string[] {
    return this.filteredLinks.length > 0 ? this.filteredLinks : this.links;
  }

  get allSelected(): boolean {
    return (
      this.displayedLinks.length > 0 &&
      this.displayedLinks.every((link) => this.selectedLinks.has(link))
    );
  }

  get someSelected(): boolean {
    return (
      this.displayedLinks.some((link) => this.selectedLinks.has(link)) &&
      !this.allSelected
    );
  }

  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredLinks = [];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredLinks = this.links.filter((link) =>
      link.toLowerCase().includes(query),
    );
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      // Deseleccionar todos los links visibles
      this.displayedLinks.forEach((link) => this.selectedLinks.delete(link));
    } else {
      // Seleccionar todos los links visibles
      this.displayedLinks.forEach((link) => this.selectedLinks.add(link));
    }
  }

  toggleSelectLink(link: string): void {
    if (this.selectedLinks.has(link)) {
      this.selectedLinks.delete(link);
    } else {
      this.selectedLinks.add(link);
    }
  }

  isLinkSelected(link: string): boolean {
    return this.selectedLinks.has(link);
  }

  get selectedCount(): number {
    return this.selectedLinks.size;
  }

  onDelete(): void {
    // Eliminar los links seleccionados
    this.links = this.links.filter((link) => !this.selectedLinks.has(link));
    this.selectedLinks.clear();
    // También limpiar filteredLinks si es necesario
    if (this.filteredLinks.length > 0) {
      this.filteredLinks = this.filteredLinks.filter(
        (link) => !this.selectedLinks.has(link),
      );
    }
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  generateMockLinks(): void {
    if (!this.url.trim()) {
      this.links = [];
      this.selectedLinks.clear();
      return;
    }

    const baseUrl = `${this.urlProtocol}${this.url.trim()}`;
    this.links = [];
    this.selectedLinks.clear(); // Limpiar selección al generar nuevos links

    for (let i = 1; i <= 40; i++) {
      const link = `${baseUrl}/page-${i}`;
      this.links.push(link);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onFetchLinks(): void {
    this.generateMockLinks();
  }
}
