import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. IMPORTANTE: Importar RouterOutlet
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { DataService } from '../../../services/data';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  // 2. IMPORTANTE: Añadirlo aquí
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayoutComponent {
  readonly theme = inject(ThemeService);
  private router = inject(Router);
  private dataService = inject(DataService);

  showLogoutModal = signal(false);

  confirmLogout(): void {
    this.showLogoutModal.set(true);
  }

  cancelLogout(): void {
    this.showLogoutModal.set(false);
  }

  logout(): void {
    this.showLogoutModal.set(false);
    this.dataService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      error: () => {
        // Aunque falle el endpoint, limpiamos la sesión local
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }
}