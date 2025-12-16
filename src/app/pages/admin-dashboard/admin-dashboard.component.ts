import { Component, ViewChild, AfterViewInit, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID, computed, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AdminNavComponent } from '../../layout/admin-nav/admin-nav.component';
import { TopbarComponent } from '../../layout/topbar/topbar.component';
import { UserStorage } from '../../storages/user/user-storage';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, TopbarComponent, AdminNavComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(AdminNavComponent) navComponent!: AdminNavComponent;
  private _isNavCollapsed: boolean = true;

  showMobileSidebar = false;

  // Inyectar UserStorage
  public userStorage = inject(UserStorage);

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Lógica que depende de window / documento (solo en navegador)
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('openMobileSidebar', () => {
        this.openMobileSidebar();
      });
    }
  }

  ngAfterViewInit() {
    // Inicializar el estado y forzar la detección de cambios del sidebar
    this._isNavCollapsed = this.navComponent?.isCollapsed ?? true;
    this.cdr.detectChanges();
  }

  get isNavCollapsed(): boolean {
    if (this.navComponent) {
      this._isNavCollapsed = this.navComponent.isCollapsed;
    }
    return this._isNavCollapsed;
  }

  openMobileSidebar() {
    this.showMobileSidebar = true;
  }

  closeMobileSidebar() {
    this.showMobileSidebar = false;
  }

  // Método para obtener el nombre del usuario
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
}

