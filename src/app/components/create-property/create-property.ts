import { Component, AfterViewInit, OnDestroy, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data';
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

  tags = signal<Tag[]>([]);
  selectedTag = signal<Tag[]>([]);
  selectedLocation = signal<{ lat: number; lng: number } | null>(null);
  imageUrls = signal<string[]>([]);
  currentImageUrl = signal('');
  loading = signal(false);

  constructor() {
    effect(() => {
      this.tags.set(this.dataService.availableTags());
    });
  }

  ngOnInit() {
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

  toggleTag(tag: Tag): void {
    const current = this.selectedTag();
    this.selectedTag.set(
      current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag]
    );
  }

  toggleFurnished(): void {
    this.form.get('isFurnished')!.setValue(!this.form.get('isFurnished')!.value);
  }

  toggleExpenses(): void {
    this.form.get('expensesIncluded')!.setValue(!this.form.get('expensesIncluded')!.value);
  }

  addImageUrl(): void {
    const url = this.currentImageUrl().trim();
    if (!url) return;
    this.imageUrls.update(list => [...list, url]);
    this.currentImageUrl.set('');
  }

  removeImageUrl(index: number): void {
    this.imageUrls.update(list => list.filter((_, i) => i !== index));
  }

  submit(): void {
    if (this.form.invalid) return;
    const loc = this.selectedLocation();
    const v = this.form.value;

    const body: any = {
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
      latitude:         loc ? Number.parseFloat(loc.lat.toFixed(6)) : null,
      longitude:        loc ? Number.parseFloat(loc.lng.toFixed(6)) : null,
      isAvailable:      true,
      tagIds:           this.selectedTag().map(t => t.id),
      imageUrls:        this.imageUrls()
    };

    this.loading.set(true);

    this.dataService.createProperty(body).subscribe({
      next: (property: any) => {
        this.dataService.createHousehold(v.title!, property.id).subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/home-owners']);
          },
          error: (err: any) => {
            this.loading.set(false);
            console.error('Error al crear household:', err);
            alert('Error al crear el hogar.');
          }
        });
      },
      error: (err: any) => {
        this.loading.set(false);
        console.error('Error al crear propiedad:', err);
        alert('Error al crear la propiedad.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home-owners']);
  }
}