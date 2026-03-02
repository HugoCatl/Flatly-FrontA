import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../services/data';
import { Propiedad } from '../../../models/flatly';

@Component({
  selector: 'app-map-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-details.html',
  styleUrls: ['./map-details.scss']
})
export class MapDetails implements OnInit {
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private dataService = inject(DataService);

  piso        = signal<Propiedad | null>(null);
  loading     = signal(true);
  activeImage = signal(0);
  
  // ✅ Señal para almacenar el ID del hogar
  householdId = signal<number | null>(null); 

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/map']);
      return;
    }
    const id = Number(idParam);

    const cached = this.dataService.properties().find(p => p.id === id);
    if (cached) {
      this.piso.set(cached);
      this.loading.set(false);
      // ✅ Solución TS: Garantizamos que cached.id no sea undefined
      if (cached.id) this.fetchHouseholdId(cached.id); 
      return;
    }

    this.dataService.getPropertyById(id).subscribe({
      next: (data) => {
        this.piso.set(data);
        this.loading.set(false);
        // ✅ Solución TS: Garantizamos que data.id no sea undefined
        if (data.id) this.fetchHouseholdId(data.id); 
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/map']);
      }
    });
  }

  // ✅ Función para buscar el ID del hogar en el backend
  private fetchHouseholdId(propertyId: number): void {
    this.dataService.getHouseholdByPropertyId(propertyId).subscribe({
        next: (response: any) => {
            if (response && response.id) {
                this.householdId.set(response.id);
            }
        },
        error: (err: any) => console.error('Error al obtener household', err)
    });
  }

  // ✅ Función para navegar al hogar
  enterHousehold(): void {
    const hId = this.householdId();
    if (hId) {
      this.router.navigate(['/household', hId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/map']);
  }

  prevImage(): void {
    // ✅ CORRECCIÓN SONARLINT: Uso de optional chaining y ?? para asegurar número
    const total = this.piso()?.images?.length ?? 0;
    if (total < 2) return;
    this.activeImage.update(i => (i - 1 + total) % total);
  }

  nextImage(): void {
    // ✅ CORRECCIÓN SONARLINT: Uso de optional chaining y ?? para asegurar número
    const total = this.piso()?.images?.length ?? 0;
    if (total < 2) return;
    this.activeImage.update(i => (i + 1) % total);
  }

  setImage(index: number): void {
    this.activeImage.set(index);
  }

  onJoinClick(householdId: number) {
  this.dataService.joinHousehold(householdId).subscribe({
    next: (response) => {
      console.log('Unido al hogar con éxito', response);
      // 🔥 IMPORTANTE: Recargar el perfil del usuario para actualizar su estado
      this.dataService.getMyProfile().subscribe();
    },
    error: (err) => console.error('Error al unirse', err)
  });
}
  
joinPiso(pisoId: number) {
  this.dataService.joinHousehold(pisoId).subscribe({
    next: () => {
      console.log('Te has unido al hogar exitosamente');
      // 🔥 RECARGA EL PERFIL PARA QUE EL BACKEND RECONOZCA AL USUARIO
      this.dataService.getMyProfile().subscribe();
    },
    error: (err) => console.error('Error al unirse:', err)
  });
}
}