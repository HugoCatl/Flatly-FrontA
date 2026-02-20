import { Component, OnDestroy, AfterViewInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';

export interface Piso {
  id: number;
  titulo: string;
  direccion: string;
  precio: number;
  habitaciones: number;
  metros: number;
  etiquetas: string[];
  lat: number;
  lng: number;
  foto: string;
  disponible: boolean;
}

const PISOS_MOCK: Piso[] = [
  {
    id: 1,
    titulo: 'Ático con terraza en Gracia',
    direccion: 'Carrer de Verdi, 12, Barcelona',
    precio: 1250,
    habitaciones: 3,
    metros: 85,
    etiquetas: ['Terraza', 'Luminoso', 'Amueblado'],
    lat: 41.4037,
    lng: 2.1561,
    foto: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80',
    disponible: true,
  },
  {
    id: 2,
    titulo: 'Estudio moderno en el Eixample',
    direccion: 'Carrer de Provença, 200, Barcelona',
    precio: 850,
    habitaciones: 1,
    metros: 40,
    etiquetas: ['Céntrico', 'Gym', 'Pet-friendly'],
    lat: 41.3944,
    lng: 2.1651,
    foto: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
    disponible: true,
  },
  {
    id: 3,
    titulo: 'Piso familiar en Sant Martí',
    direccion: 'Av. Diagonal, 450, Barcelona',
    precio: 1600,
    habitaciones: 4,
    metros: 110,
    etiquetas: ['Parking', 'Luminoso', 'Amueblado'],
    lat: 41.3983,
    lng: 2.1935,
    foto: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80',
    disponible: true,
  },
  {
    id: 4,
    titulo: 'Loft industrial en Poblenou',
    direccion: 'Carrer de Pallars, 90, Barcelona',
    precio: 1100,
    habitaciones: 2,
    metros: 65,
    etiquetas: ['Loft', 'Diseño', 'Pet-friendly'],
    lat: 41.4008,
    lng: 2.2001,
    foto: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80',
    disponible: false,
  },
  {
    id: 5,
    titulo: 'Piso con vistas al mar en la Barceloneta',
    direccion: 'Passeig Marítim, 22, Barcelona',
    precio: 1900,
    habitaciones: 2,
    metros: 70,
    etiquetas: ['Vistas al mar', 'Terraza', 'Gym'],
    lat: 41.3795,
    lng: 2.1909,
    foto: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
    disponible: true,
  },
  {
    id: 6,
    titulo: 'Habitación en piso compartido Gràcia',
    direccion: 'Carrer de les Carolines, 8, Barcelona',
    precio: 520,
    habitaciones: 1,
    metros: 20,
    etiquetas: ['Compartido', 'Céntrico', 'WiFi'],
    lat: 41.4059,
    lng: 2.1545,
    foto: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80',
    disponible: true,
  },
];

const ALL_ETIQUETAS = [
  'Terraza', 'Luminoso', 'Amueblado', 'Céntrico', 'Gym', 'Pet-friendly',
  'Parking', 'Loft', 'Diseño', 'Vistas al mar', 'Compartido', 'WiFi',
];

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements AfterViewInit, OnDestroy {
  private leafletMap!: L.Map;
  private markers: L.Marker[] = [];

  // Filtros
  busqueda = signal('');
  precioMax = signal(2500);
  etiquetasSeleccionadas = signal<string[]>([]);
  pisoActivo = signal<Piso | null>(null);

  allEtiquetas = ALL_ETIQUETAS;

  pisosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase();
    const max = this.precioMax();
    const tags = this.etiquetasSeleccionadas();

    return PISOS_MOCK.filter((p) => {
      const matchQ =
        !q ||
        p.titulo.toLowerCase().includes(q) ||
        p.direccion.toLowerCase().includes(q);
      const matchPrecio = p.precio <= max;
      const matchTags =
        tags.length === 0 || tags.every((t) => p.etiquetas.includes(t));
      return matchQ && matchPrecio && matchTags;
    });
  });

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.leafletMap) {
      this.leafletMap.remove();
    }
  }

  private initMap() {
    this.leafletMap = L.map('leaflet-map', {
      center: [41.3951, 2.1734],
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 19,
    }).addTo(this.leafletMap);

    L.control.zoom({ position: 'bottomright' }).addTo(this.leafletMap);

    this.renderMarkers();
  }

  private renderMarkers() {
    // Limpia marcadores anteriores
    this.markers.forEach((m) => m.remove());
    this.markers = [];

    this.pisosFiltrados().forEach((piso) => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="map-pin ${!piso.disponible ? 'map-pin--unavailable' : ''}">
                 <span class="map-pin__price">€${piso.precio}</span>
               </div>`,
        iconSize: [72, 36],
        iconAnchor: [36, 18],
      });

      const marker = L.marker([piso.lat, piso.lng], { icon })
        .addTo(this.leafletMap)
        .on('click', () => this.pisoActivo.set(piso));

      this.markers.push(marker);
    });
  }

  applyFilters() {
    if (this.leafletMap) {
      this.renderMarkers();
    }
  }

  toggleEtiqueta(tag: string) {
    const current = this.etiquetasSeleccionadas();
    if (current.includes(tag)) {
      this.etiquetasSeleccionadas.set(current.filter((t) => t !== tag));
    } else {
      this.etiquetasSeleccionadas.set([...current, tag]);
    }
    this.applyFilters();
  }

  isEtiquetaActiva(tag: string): boolean {
    return this.etiquetasSeleccionadas().includes(tag);
  }

  onBusquedaChange() {
    this.applyFilters();
  }

  onPrecioChange() {
    this.applyFilters();
  }

  cerrarPreview() {
    this.pisoActivo.set(null);
  }

  get precioLabel(): string {
    return this.precioMax() >= 2500 ? 'Sin límite' : `€${this.precioMax()}`;
  }
}
