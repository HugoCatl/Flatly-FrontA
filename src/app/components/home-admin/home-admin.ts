import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data';
import { TopBarComponent } from '../shared/top-bar/top-bar';
import { FormsModule } from '@angular/forms';

// Interfaces necesarias para el tipado fuerte
interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}


@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule, TopBarComponent, FormsModule],
  templateUrl: './home-admin.html',
  styleUrl: './home-admin.scss',
})
export class HomeAdmin implements OnInit {
  private dataService = inject(DataService);

  // --- ESTRUCTURA CENTRALIZADA ---
  
  // Tags centralizados en el servicio
  tags = this.dataService.availableTags;
  loading = this.dataService.loading;
  proces = this.dataService.proces;
  stats = this.dataService.stats;
  adminUsersList = this.dataService.adminUsersList; 

  // Signals locales para la UI de gestión de usuarios

  userToDelete = signal<AdminUser | null>(null);
  userToEditRole = signal<AdminUser | null>(null);
  
  activeTab = signal<'stats' | 'users' | 'tags'>('stats');
  
  // Signals para los modales
  showDeleteModal = signal(false);
  showRoleModal = signal(false); 
  newRole = signal('');
  
  // Signal para el input de nuevos tags
  newTagName = signal('');

  tabs = [
    { key: 'stats', label: 'Estadísticas', icon: 'bar_chart' },
    { key: 'users', label: 'Usuarios',     icon: 'people'    },
    { key: 'tags',  label: 'Tags',         icon: 'label'     },
  ];

  roles = ['STUDENT', 'OWNER', 'ADMIN'];

  constructor() {
    // Debug opcional para ver cambios en tiempo real
    effect(() => {
      console.log('Tags actualizados:', this.tags());
    });
  }

  ngOnInit() {
    this.loading.set(true);
    this.loadDates();

  }
  loadDates(){
    this.dataService.loadStats();
    this.dataService.loadUsers();
    this.dataService.loadTagsPublic();
  }

  setTab(key: string): void {
    this.activeTab.set(key as 'stats' | 'users' | 'tags');
  }


  // --- MÉTODOS DE GESTIÓN (CRUD) ---

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

  // ✅ Centralización: Usamos el método resiliente del servicio
  createTag(): void {
    const name = this.newTagName().trim();
    if (!name) return;
    
    this.dataService.adminCreateTag(name).subscribe({
      next: () => {
        this.newTagName.set(''); // Limpiar input
      }
    });
  }
}