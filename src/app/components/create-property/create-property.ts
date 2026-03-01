import { Component, AfterViewInit, OnDestroy, inject, signal, effect,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data';
import { switchMap } from 'rxjs/operators';
import * as L from 'leaflet';
import { Tag } from '../../models/flatly';

@Component({
  selector: 'app-create-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-property.html',
  styleUrl: './create-property.scss',
})
export class CreateProperty implements AfterViewInit, OnDestroy, OnInit {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private router = inject(Router);

  private leafletMap!: L.Map;
  private marker: L.Marker | null = null;

  tags = signal<Tag[]>([]);
  selectedTagNames = signal<string[]>([]); 
  selectedLocation = signal<{ lat: number; lng: number } | null>(null);
  imagePreviews = signal<string[]>([]);
  loading = signal(false);

form = this.fb.group({
    title:            ['', Validators.required],
    description:      [''],
    priceMonth:       [null as number | null, [Validators.required, Validators.min(1)]],
    rooms:            [1, [Validators.required, Validators.min(1)]],
    city:             ['', Validators.required],
    zone:             ['', Validators.required],
    bathrooms:        [1, Validators.min(1)],
    squareMeters:     [null as number | null],
    isFurnished:      [false],
    expensesIncluded: [false],
  }); 

  constructor() {
    effect(() => {
      // Este efecto es para actualizaciones futuras
      this.tags.set(this.dataService.availableTags());
    });
  }

  ngOnInit() {
    // 3. Carga inicial forzada desde el servicio/localStorage
    this.tags.set(this.dataService.availableTags());
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.leafletMap) this.leafletMap.remove();
  }

  private initMap() {
    this.leafletMap = L.map('property-map', {
      center: [40.4168, -3.7038],
      zoom: 6,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 19,
    }).addTo(this.leafletMap);

    const pinIcon = L.divIcon({
      className: '',
      html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 9.63 14 24 14 24S28 23.63 28 14C28 6.27 21.73 0 14 0z" fill="#10b981"/>
        <circle cx="14" cy="14" r="6" fill="white"/>
      </svg>`,
      iconSize: [28, 38],
      iconAnchor: [14, 38],
    });

    this.leafletMap.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.selectedLocation.set({ lat, lng });
      if (this.marker) this.marker.remove();
      this.marker = L.marker([lat, lng], { icon: pinIcon }).addTo(this.leafletMap);
    });
  }

// En create-property.ts
toggleTag(tagName: string): void {
  const current = this.selectedTagNames();
  this.selectedTagNames.set(
    current.includes(tagName) 
      ? current.filter(t => t !== tagName) 
      : [...current, tagName]
  );
}

  toggleFurnished(): void {
    this.form.get('isFurnished')!.setValue(!this.form.get('isFurnished')!.value);
  }

  toggleExpenses(): void {
    this.form.get('expensesIncluded')!.setValue(!this.form.get('expensesIncluded')!.value);
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const previews: string[] = [];
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        previews.push(e.target?.result as string);
        if (previews.length === input.files!.length) {
          this.imagePreviews.set([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const loc = this.selectedLocation();
    const v = this.form.value;
    
    // NOTA: Ajustar el body para enviar los nombres de los tags en lugar de IDs,
    // o asegurar que el backend reciba strings.
    const body = {
      title:            v.title,
      description:      v.description || null,
      priceMonth:       v.priceMonth,
      city:             v.city,
      zone:             v.zone,
      rooms:            v.rooms,
      bathrooms:        v.bathrooms,
      squareMeters:     v.squareMeters || null,
      expensesIncluded: v.expensesIncluded,
      isFurnished:      v.isFurnished,
      address:          null,
      latitude:         loc ? parseFloat(loc.lat.toFixed(6)) : null,
      longitude:        loc ? parseFloat(loc.lng.toFixed(6)) : null,
      tagNames: this.dataService.etiquetasSeleccionadas()
    };

    this.loading.set(true);
    this.dataService.createProperty(body).pipe(
      switchMap((property: any) =>
        this.dataService.createHousehold(v.title!, property.id)
      )
    ).subscribe({
      next: () => this.router.navigate(['/home-owners']),
      error: (err) => {
        this.loading.set(false);
        console.error('Error al crear:', err);
        alert('Error al crear la propiedad.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home-owners']);
  }
}
