import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data';
import { TopBarComponent } from '../shared/top-bar/top-bar';
import { FormsModule } from '@angular/forms';
import { AdminUser } from '../../models/flatly';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, TopBarComponent, FormsModule],
  templateUrl: './home-admin.html',
  styleUrl: './home-admin.scss',
})
export class HomeAdmin implements OnInit {
  private dataService = inject(DataService);

  tags          = this.dataService.availableTags;
  loading       = this.dataService.loading;
  proces        = this.dataService.proces;
  stats         = this.dataService.stats;
  adminUsersList = this.dataService.adminUsersList;

  userToDelete    = signal<AdminUser | null>(null);
  userToEditRole  = signal<AdminUser | null>(null);
  activeTab       = signal<'stats' | 'users' | 'tags'>('stats');
  showDeleteModal = signal(false);
  showRoleModal   = signal(false);
  newRole         = signal('');
  newTagName      = signal('');

  // ── Filtros y ordenación ──
  searchQuery = signal('');
  filterRole  = signal('');           // '' = todos
  sortDir     = signal<'asc' | 'desc'>('asc');

  usersFiltered = computed(() => {
    const q    = this.searchQuery().toLowerCase().trim();
    const role = this.filterRole();
    const dir  = this.sortDir();

    let list = this.adminUsersList();

    if (q) {
      list = list.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }

    if (role) {
      list = list.filter(u => u.role === role);
    }

    return [...list].sort((a, b) => {
      const nameA = (a.name || a.email).toLowerCase();
      const nameB = (b.name || b.email).toLowerCase();
      return dir === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  });

  tabs = [
    { key: 'stats', label: 'Estadísticas', icon: 'bar_chart' },
    { key: 'users', label: 'Usuarios',     icon: 'people'    },
    { key: 'tags',  label: 'Tags',         icon: 'label'     },
  ];

  roles = ['STUDENT', 'OWNER', 'ADMIN'];

  constructor() {
    effect(() => { console.log('Tags actualizados:', this.tags()); });
  }

  ngOnInit() {
    this.loading.set(true);
    this.loadDates();
  }

  loadDates() {
    this.dataService.loadStats();
    this.dataService.loadUsers();
    this.dataService.loadTagsPublic();
  }

  setTab(key: string): void {
    this.activeTab.set(key as 'stats' | 'users' | 'tags');
  }

  toggleSort(): void {
    this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
  }

  setRoleFilter(role: string): void {
    this.filterRole.set(this.filterRole() === role ? '' : role);
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

  createTag() {
    const name = this.newTagName().trim();
    if (!name) return;
    this.dataService.adminCreateTag({ name } as any).subscribe({
      next: () => { this.newTagName.set(''); },
      error: (err) => console.error('Error al crear tag:', err)
    });
  }
}
