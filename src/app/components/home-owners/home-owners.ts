import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DataService } from '../../services/data';
import { TopBarComponent } from '../shared/top-bar/top-bar';

@Component({
  selector: 'app-home-owners',
  imports: [CommonModule, RouterLink, RouterLinkActive, TopBarComponent],
  templateUrl: './home-owners.html',
  styleUrl: './home-owners.scss',
})
export class HomeOwners implements OnInit {
  protected dataService = inject(DataService);
  private router    = inject(Router);

  properties  = signal<any[]>([]);
  tenantsMap  = signal<Record<number, any[]>>({});
  loading     = this.dataService.loading;

  totalTenants = computed(() =>
    Object.values(this.tenantsMap()).reduce((acc, t) => acc + t.length, 0)
  );

  occupiedCount = computed(() =>
    this.properties().filter(p => !p.isAvailable).length
  );

  ngOnInit() {
    this.dataService.getMyProfile().subscribe();

    this.dataService.getMyProperties().subscribe({
      next: (props) => {
        this.properties.set(props);
        this.loading.set(false);
        props.forEach((p: any) => {
          const householdId = p.household?.id ?? p.householdId;
          if (householdId) {
            this.dataService.getHouseholdTenants(householdId).subscribe({
              next: (tenants: any) => {
                this.tenantsMap.update(map => ({ ...map, [householdId]: tenants }));
              },
              error: () => {}
            });
          }
        });
      },
      error: () => this.loading.set(false)
    });
  }

  getHouseholdId(p: any): number | null {
    return p.household?.id ?? p.householdId ?? null;
  }

  getTenants(p: any): any[] {
    const id = this.getHouseholdId(p);
    return id ? (this.tenantsMap()[id] ?? []) : [];
  }

  goToCreateProperty() {
    this.router.navigate(['/create-property']);
  }
}
