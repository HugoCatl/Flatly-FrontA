import { Component, OnDestroy, AfterViewInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
// Importación corregida a la ruta de tu servicio real
import { DataService } from '../../services/data'; 
import { Propiedad, Tag } from '../../models/flatly';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements AfterViewInit, OnDestroy {
  private readonly dataService = inject(DataService);
  private leafletMap!: L.Map;
  private markers: L.Marker[] = [];

  busqueda = signal('');
  precioMax = signal(2500);
  etiquetasSeleccionadas = signal<string[]>([]);
  pisoActivo = signal<Propiedad | null>(null);
  tagsExpanded = signal(false);

  // Lista de etiquetas para el filtro (puedes sacarla de la DB luego)
  allEtiquetas = signal<string[]>(['Terraza', 'Luminoso', 'Amueblado', 'Céntrico', 'Gym']);

  pisosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase();
    const max = this.precioMax();
    const tagsFiltro = this.etiquetasSeleccionadas();
    
    // Obtenemos las propiedades del servicio (asegúrate que el service tenga el signal properties)
    // Si tu service usa otro nombre como 'hoseholdBills', cámbialo aquí
    const todosLosPisos: Propiedad[] = (this.dataService as any).properties?.() || []; 

    return todosLosPisos.filter((p: Propiedad) => {
      const matchQ = !q || p.title.toLowerCase().includes(q) || (p.address?.toLowerCase().includes(q) ?? false);
      const matchPrecio = p.priceMonth <= max;
      const matchTags = tagsFiltro.length === 0 || 
                        tagsFiltro.every(nombre => p.tags?.some((t: Tag) => t.name === nombre));
      
      return matchQ && matchPrecio && matchTags;
    });
  });

  constructor() {
    effect(() => {
      this.renderMarkers(this.pisosFiltrados());
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.leafletMap) this.leafletMap.remove();
  }

  private initMap() {
    this.leafletMap = L.map('leaflet-map', {
      center: [41.3951, 2.1734],
      zoom: 14,
      zoomControl: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© CARTO',
      maxZoom: 19,
    }).addTo(this.leafletMap);
    L.control.zoom({ position: 'bottomright' }).addTo(this.leafletMap);
  }

  private renderMarkers(pisos: Propiedad[]) {
    this.markers.forEach(m => m.remove());
    this.markers = [];

    pisos.forEach(piso => {
      if (!piso.latitude || !piso.longitude) return;

      const icon = L.divIcon({
        className: '',
        html: `<div class="map-pin ${!piso.isAvailable ? 'map-pin--unavailable' : ''}">
                 <span class="map-pin__price">€${Math.round(piso.priceMonth)}</span>
               </div>`,
        iconSize: [72, 36],
        iconAnchor: [36, 18],
      });

      const marker = L.marker([piso.latitude, piso.longitude], { icon })
        .addTo(this.leafletMap)
        .on('click', () => this.pisoActivo.set(piso));

      this.markers.push(marker);
    });
  }

  toggleEtiqueta(tag: string) {
    const current = this.etiquetasSeleccionadas();
    this.etiquetasSeleccionadas.set(
      current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag]
    );
  }

  clearFilters() {
    this.busqueda.set('');
    this.precioMax.set(2500);
    this.etiquetasSeleccionadas.set([]);
  }

  precioLabel = computed(() => this.precioMax() >= 2500 ? 'Sin límite' : `€${this.precioMax()}`);

  sliderFillStyle = computed(() => {
    const pct = ((this.precioMax() - 400) / (2500 - 400)) * 100;
    return { background: `linear-gradient(to right, var(--emerald-500) ${pct}%, var(--gray-200) ${pct}%)` };
  });
}