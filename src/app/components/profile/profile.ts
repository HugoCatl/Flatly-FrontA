import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private dataService = inject(DataService);

  user = this.dataService.user;
  loading = this.dataService.loading;
  editing = signal(false);
  saving = signal(false);

  editName = signal('');
  editPhone = signal('');
  editAvatarUrl = signal('');

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
        this.editing.set(false);
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Error al guardar perfil:', err);
        this.saving.set(false);
      }
    });
  }
}