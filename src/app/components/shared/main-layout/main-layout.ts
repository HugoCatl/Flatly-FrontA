import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. IMPORTANTE: Importar RouterOutlet
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  // 2. IMPORTANTE: Añadirlo aquí
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayoutComponent { 
  showLogoutModal = false;

  constructor(private router: Router) {}

  confirmLogout(): void {
    this.showLogoutModal = true;
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  logout(): void {
    this.showLogoutModal = false;
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}