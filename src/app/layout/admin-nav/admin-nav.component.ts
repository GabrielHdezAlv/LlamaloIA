import { Component, HostListener, computed, inject, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserStorage } from '../../storages/user/user-storage';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.scss'],
})
export class AdminNavComponent implements OnDestroy, OnInit {
  isCollapsed: boolean = true;
  windowWidth: number = 0;
  isHovering: boolean = false;
  private hoverTimer: any;

  // Inyectar UserStorage y Router
  public userStorage = inject(UserStorage);
  private router = inject(Router);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Propiedad computada para obtener el nombre completo del usuario
  userName = computed(() => {
    const user = this.userStorage.user();
    if (user) {
      return `${user.name} ${user.lastname}`;
    }
    return 'Admin';
  });

  // Método para obtener la imagen del perfil del usuario
  getUserProfileImage = () => {
    const user = this.userStorage.user();
    return user?.profileImage || 'assets/predeterminada.webp';
  };

  ngOnInit() {
    this.onResize();
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Expandir al pasar el ratón por encima
  expandOnHover() {
    if (this.isCollapsed) {
      this.isHovering = true;
      if (this.hoverTimer) {
        clearTimeout(this.hoverTimer);
      }
    }
  }

  // Colapsar cuando el ratón sale
  collapseOnLeave() {
    if (this.isCollapsed) {
      this.hoverTimer = setTimeout(() => {
        this.isHovering = false;
      }, 200);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.isBrowser && typeof window !== 'undefined') {
      this.windowWidth = window.innerWidth;
    }
  }

  ngOnDestroy() {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
    }
  }
}

