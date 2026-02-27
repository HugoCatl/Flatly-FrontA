import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface AdminStats {
  totalUsuarios: number;
  totalEstudiantes: number;
  totalPropietarios: number;
  totalAdmins: number;
  totalPropiedades: number;
  propiedadesDisponibles: number;
  timestamp: string;
}

@Component({
  selector: 'app-home-admin',
  imports: [CommonModule],
  templateUrl: './home-admin.html',
  styleUrl: './home-admin.scss',
})
export class HomeAdmin implements OnInit {
  private dataService = inject(DataService);

  activeTab = signal<'stats' | 'users' | 'tags'>('stats');
  loading = signal(true);

  stats = signal<AdminStats | null>(null);
  users = signal<AdminUser[]>([]);
  tags = signal<string[]>([]);

  showDeleteModal = signal(false);
  userToDelete = signal<AdminUser | null>(null);
  showRoleModal = signal(false);
  userToEditRole = signal<AdminUser | null>(null);
  newRole = signal('');
  newTagName = signal('');

  tabs = [
    { key: 'stats', label: 'Estadísticas', icon: 'bar_chart' },
    { key: 'users', label: 'Usuarios',     icon: 'people'    },
    { key: 'tags',  label: 'Tags',         icon: 'label'     },
  ];

  roles = ['STUDENT', 'OWNER', 'ADMIN'];

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
    this.loadTags();
  }

  setTab(key: string): void {
    this.activeTab.set(key as 'stats' | 'users' | 'tags');
  }

  loadStats(): void {
    this.dataService.adminGetStats().subscribe({
      next: (data: any) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar stats:', err);
        this.loading.set(false);
      }
    });
  }

  loadUsers(): void {
    this.dataService.adminGetAllUsers().subscribe({
      next: (data: any) => this.users.set(data),
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  loadTags(): void {
    this.dataService.getAllTags().subscribe({
      next: (data: any) => this.tags.set(data.map((t: any) => t.name)),
      error: (err) => console.error('Error al cargar tags:', err)
    });
  }

  confirmDelete(user: AdminUser): void {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }

  doDelete(): void {
    const user = this.userToDelete();
    if (!user) return;
    this.dataService.adminDeleteUser(user.id).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.id !== user.id));
        this.showDeleteModal.set(false);
        this.userToDelete.set(null);
      },
      error: (err) => console.error('Error al eliminar usuario:', err)
    });
  }

  confirmRoleChange(user: AdminUser): void {
    this.userToEditRole.set(user);
    this.newRole.set(user.role);
    this.showRoleModal.set(true);
  }

  cancelRoleChange(): void {
    this.showRoleModal.set(false);
    this.userToEditRole.set(null);
  }

  doRoleChange(): void {
    const user = this.userToEditRole();
    if (!user) return;
    this.dataService.adminUpdateRole(user.id, this.newRole()).subscribe({
      next: () => {
        this.users.update(list =>
          list.map(u => u.id === user.id ? { ...u, role: this.newRole() } : u)
        );
        this.showRoleModal.set(false);
        this.userToEditRole.set(null);
      },
      error: (err) => console.error('Error al cambiar rol:', err)
    });
  }

  createTag(): void {
    const name = this.newTagName().trim();
    if (!name) return;
    this.dataService.adminCreateTag(name).subscribe({
      next: () => {
        this.tags.update(list => [...list, name]);
        this.newTagName.set('');
      },
      error: (err) => console.error('Error al crear tag:', err)
    });
  }
}