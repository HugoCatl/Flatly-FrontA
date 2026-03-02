import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../services/data';
import { Propiedad } from '../../../models/flatly';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-map-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-details.html',
  styleUrls: ['./map-details.scss']
})
export class MapDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);

  piso = signal<Propiedad | null>(null);
  loading = signal(true);
  activeImage = signal(0);
  
  // Señal para almacenar el ID del hogar
  householdId = signal<number | null>(null); 
  
  // Estado de carga para el botón de acción
  actionLoading = signal(false);

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
      if (cached.id) this.fetchHouseholdId(cached.id); 
      return;
    }

    this.dataService.getPropertyById(id).subscribe({
      next: (data) => {
        this.piso.set(data);
        this.loading.set(false);
        if (data.id) this.fetchHouseholdId(data.id); 
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/map']);
      }
    });
  }

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

  // ✅ FUNCIÓN REESTRUCTURADA: Maneja el error 409
 enterHousehold(): void {
  const hId = this.householdId();
  const pId = this.piso()?.id; // Asumiendo que piso tiene id

  if (!hId || !pId) return;

  this.actionLoading.set(true);

  this.dataService.joinHousehold(hId).subscribe({
    next: () => {
      // ✅ VINCULACIÓN: Guardar contexto en localStorage vía servicio
      this.dataService.setContext(pId, hId);
      
      this.actionLoading.set(false);
      this.router.navigate(['/household', hId]);
    },
    // ... error handling
  });
}

  // Helper para recargar perfil y navegar
  private finalizarAccion(hId: number) {
    this.dataService.getMyProfile().subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.router.navigate(['/household', hId]);
      },
      error: (err) => {
        console.error('Error al recargar perfil', err);
        this.actionLoading.set(false);
        // Navegamos igualmente aunque falle la recarga del perfil
        this.router.navigate(['/household', hId]);
      }
    });
  }

  // Funciones de UI
  goBack(): void { this.router.navigate(['/map']); }
  prevImage(): void {
    const total = this.piso()?.images?.length ?? 0;
    if (total < 2) return;
    this.activeImage.update(i => (i - 1 + total) % total);
  }
  nextImage(): void {
    const total = this.piso()?.images?.length ?? 0;
    if (total < 2) return;
    this.activeImage.update(i => (i + 1) % total);
  }
  setImage(index: number): void { this.activeImage.set(index); }
}