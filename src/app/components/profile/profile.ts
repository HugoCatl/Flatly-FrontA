import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private dataService = inject(DataService);
  private router = inject(Router);

  user = this.dataService.user;
  loading = this.dataService.loading;
  editing = signal(false);
  saving = signal(false);
  showLogoutModal = signal(false);
  showAvatarModal = signal(false);
  profile = this.dataService.profile;

  editName = signal('');
  editPhone = signal('');
  editAvatarUrl = signal('');
  tempAvatarUrl = signal('');

  ngOnInit() {
    if (!this.user()) {
      this.dataService.loadHomeData();
    }
  }

  startEditing(): void {
    this.editName.set(this.user()?.name || '');
    this.editPhone.set(this.user()?.phone || '');
    this.editAvatarUrl.set(this.user()?.avatarUrl || '');
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
        this.dataService.user.update(u => u ? { ...u, ...body } : u);
        this.dataService.profile.update(u => u ? { ...u, ...body } : u);
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
      phone: (this.profile() as any)?.phone || '',
      avatarUrl: url,
    };

    this.dataService.updateMyProfile(body).subscribe({
      next: () => {
        this.dataService.user.update(u => u ? { ...u, avatarUrl: url } : u);
        this.dataService.profile.update(u => u ? { ...u, avatarUrl: url } : u);
        localStorage.setItem('user_avatar', url);
        this.showAvatarModal.set(false);
      },
      error: (err) => console.error('Error al guardar avatar:', err)
    });
  }

  confirmLogout(): void {
    this.showLogoutModal.set(true);
  }

  cancelLogout(): void {
    this.showLogoutModal.set(false);
  }

  doLogout(): void {
    this.dataService.logout().subscribe({
      next: () => {
        this.dataService.user.set(null);
        this.router.navigate(['/login']);
      },
      error: () => {
        this.dataService.user.set(null);
        this.router.navigate(['/login']);
      }
    });
  }
}