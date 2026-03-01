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

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Primero buscar en el caché del servicio (ya cargado desde el mapa)
    const cached = this.dataService.properties().find(p => p.id === id);
    if (cached) {
      this.piso.set(cached);
      this.loading.set(false);
      return;
    }

    // Si no está en caché, pedir al API
    this.dataService.getPropertyById(id).subscribe({
      next: (data) => {
        this.piso.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/map']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/map']);
  }

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

  setImage(index: number): void {
    this.activeImage.set(index);
  }
}
