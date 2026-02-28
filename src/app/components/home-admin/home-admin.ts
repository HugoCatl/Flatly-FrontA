import { Component, inject, OnInit, signal,effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data';
import { TopBarComponent } from '../shared/top-bar/top-bar';
import { FormsModule } from '@angular/forms'; // Añadido para los inputs

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
  standalone: true, // Asegúrate de que sea standalone si usas imports
  imports: [CommonModule, TopBarComponent, FormsModule], // FormsModule es clave
  templateUrl: './home-admin.html',
  styleUrl: './home-admin.scss',
})
export class HomeAdmin implements OnInit {
  private dataService = inject(DataService);

  // Usamos signals locales para manejar la lista de la tabla de admin
  // para evitar conflictos con el signal del "usuario identificado" del servicio
  adminUsersList = signal<AdminUser[]>([]);
  tags = this.dataService.availableTags;
  loading = this.dataService.loading;

  stats = signal<AdminStats | null>(null);
  activeTab = signal<'stats' | 'users' | 'tags'>('stats');

  showDeleteModal = signal(false);
  userToDelete = signal<AdminUser | null>(null);
  showRoleModal = signal(false);
  userToEditRole = signal<AdminUser | null>(null);
  newRole = signal('');
  newTagName = signal('');

  constructor() {
    effect(() => {
      console.log('Tags actualizados en Admin:', this.tags());
    });
  }

  tabs = [
    { key: 'stats', label: 'Estadísticas', icon: 'bar_chart' },
    { key: 'users', label: 'Usuarios',     icon: 'people'    },
    { key: 'tags',  label: 'Tags',         icon: 'label'     },
  ];

  roles = ['STUDENT', 'OWNER', 'ADMIN'];

ngOnInit() {
    this.loading.set(true);
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
      next: (data: any) => this.adminUsersList.set(data), // Usamos la lista local
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  loadTags(): void {

    this.dataService.adminGetTags({}).subscribe({
      next: (data: any) => {
        const tagNames = Array.isArray(data) ? data.map((t: any) => t.name) : [];
        
        this.tags.set(tagNames);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar tags:', err);
        this.loading.set(false);
      }
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
        this.adminUsersList.update(list => list.filter(u => u.id !== user.id));
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
    if (!user || !user.id) return;
    
    this.dataService.adminUpdateRole(user.id, this.newRole()).subscribe({
      next: () => {
        this.adminUsersList.update(list =>
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