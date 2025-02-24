import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [MatIconModule, CommonModule, RouterModule],
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isOpen: boolean = false;

  constructor(private eRef: ElementRef, private router: Router) { }

  ngOnInit() {
    this.onResize(); // Aseguramos el estado correcto en la carga
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  // Detecta clics fuera del sidebar
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.isOpen && window.innerWidth < 640 && !this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  // Escucha cambios en el tamaño de la ventana
  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.isOpen = window.innerWidth >= 640;
    }
  }


  navigateToProfile() {
    this.router.navigate(['/dashboard/profile']);
  }
}
