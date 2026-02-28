import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  // Solución SonarLint: marked as readonly
  private readonly dataService = inject(DataService);
  private readonly router = inject(Router);

  // --- SIGNALS CENTRALIZADOS (Del Service) ---
  // Estos se inicializan desde localStorage en el constructor del servicio
  user = this.dataService.user; 
  profile = this.dataService.profile;
  loading = this.dataService.loading;

  // --- SIGNALS DE UI (Locales) ---
  editing = signal(false);
  saving = signal(false);
  showLogoutModal = signal(false);
  showAvatarModal = signal(false);

  // Variables para inputs del formulario (como signals para reactividad)
  editName = signal('');
  editPhone = signal('');
  editAvatarUrl = signal('');
  tempAvatarUrl = signal('');

  ngOnInit() {
    // Si la señal del usuario está vacía (ej. primera carga), pedir al server
    if (!this.user()) {
      this.dataService.loadHomeData();
    }
  }

  // --- Lógica de Edición ---
  startEditing(): void {
    const currentUser = this.user();
    // Solución error 2349: .set() en signals, asignación directa en variables normales
    this.editName.set(currentUser?.name || '');
    this.editPhone.set(currentUser?.phone || '');
    this.editAvatarUrl.set(currentUser?.avatarUrl || '');
    this.editing.set(true);
  }

  cancelEditing(): void {
    this.editing.set(false);
  }

  saveProfile(): void {
    this.saving.set(true);
    const body = {
      name: this.editName(),
      phone: this.editPhone(),
      avatarUrl: this.editAvatarUrl(),
    };

    this.dataService.updateMyProfile(body).subscribe({
      next: () => {
        // Al actualizar en el servicio (tap), el effect() del servicio 
        // guarda en localStorage automáticamente.
        this.editing.set(false);
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Error al guardar perfil:', err);
        this.saving.set(false);
      }
    });
  }

  // ── Avatar modal ──
  openAvatarModal(): void {
    this.tempAvatarUrl.set(this.profile()?.avatarUrl || '');
    this.showAvatarModal.set(true);
  }

  cancelAvatarModal(): void {
    this.showAvatarModal.set(false);
    this.tempAvatarUrl.set('');
  }

  saveAvatar(): void {
    const url = this.tempAvatarUrl();
    const body = {
      name: this.profile()?.name || '',
      phone: this.profile()?.phone || '',
      avatarUrl: url,
    };

    this.dataService.updateMyProfile(body).subscribe({
      next: () => {
        this.showAvatarModal.set(false);
      },
      error: (err) => console.error('Error al guardar avatar:', err)
    });
  }

  // ── Logout ──
  confirmLogout(): void {
    this.showLogoutModal.set(true);
  }

  cancelLogout(): void {
    this.showLogoutModal.set(false);
  }

  doLogout(): void {
    this.dataService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
} 