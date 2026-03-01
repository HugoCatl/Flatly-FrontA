import { Component, OnDestroy, AfterViewInit, signal, computed, inject, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { DataService } from '../../services/data'; 
import { Propiedad } from '../../models/flatly';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements AfterViewInit, OnDestroy, OnInit {
  private readonly dataService = inject(DataService);
  private leafletMap!: L.Map;
  private markers: L.Marker[] = [];
  private isMapInitialized = false;

  // Signals del componente (solo UI)
  pisoActivo = signal<Propiedad | null>(null);
  tagsExpanded = signal(false);
  
  // Acceso directo a los filtros centralizados en el servicio
  busqueda = this.dataService.busqueda;
  precioMax = this.dataService.precioMax;
  etiquetasSeleccionadas = this.dataService.etiquetasSeleccionadas;
  tags = this.dataService.availableTags;
  
  // Lista de etiquetas para el filtro

  constructor() {
    // 2. Ajustamos el effect para mayor seguridad
   effect(() => {
  const pisos = this.dataService.propertiesFiltered();
  console.log('Pisos filtrados:', pisos); // <--- AÑADE ESTO
  if (this.isMapInitialized) {
    this.renderMarkers(pisos);
  }
});
  }

  ngOnInit(): void {
  // Carga inicial de datos al montar el componente
  this.dataService.loadMapData();
}

ngAfterViewInit() {
  this.initMap();
  this.isMapInitialized = true;
  
  // Escuchar movimiento del mapa para actualizar datos si fuera necesario
  this.leafletMap.on('moveend', () => {
    // Si necesitas recargar al mover, llamarías a loadMapData aquí o a una versión con filtros
    // this.dataService.loadMapData(); 
  });
}

  ngOnDestroy() {
    if (this.leafletMap) this.leafletMap.remove();
  }

  private initMap() {
    this.leafletMap = L.map('leaflet-map', {
      center: [40.2, -3.5],
      zoom: 6,
      maxZoom: 19,

      zoomControl: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© CARTO',
      maxZoom: 19,
    }).addTo(this.leafletMap);
    L.control.zoom({ position: 'bottomright' }).addTo(this.leafletMap);
  }

  private renderMarkers(pisos: Propiedad[]) {
    // Limpiar marcadores antiguos
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

  async flyToSearch() {
    const q = this.busqueda().trim();
    if (!q) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', España')}&format=json&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        this.leafletMap.flyTo([lat, lon], 11, { animate: true, duration: 1.2 });
      }
    } catch (e) {
      console.error('Error geocodificando:', e);
    }
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

  // Computed de UI para labels y estilos
  precioLabel = computed(() => this.precioMax() >= 2500 ? 'Sin límite' : `€${this.precioMax()}`);

  sliderFillStyle = computed(() => {
    const pct = ((this.precioMax() - 400) / (2500 - 400)) * 100;
    return { background: `linear-gradient(to right, var(--emerald-500) ${pct}%, var(--gray-200) ${pct}%)` };
  });
}