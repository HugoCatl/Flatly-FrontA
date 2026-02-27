import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data';

type OnboardingOption = 'tengo' | 'buscando' | 'gastos' | 'propietario' | null;
type AltaPisoOption = 'si' | 'no' | null;

@Component({
  selector: 'app-onboarding',
  imports: [],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class Onboarding {
  private router = inject(Router);
  private dataService = inject(DataService);

  // ── Paso actual ──
  step = signal<1 | 2>(1);

  // ── Paso 1 ──
  selected = signal<OnboardingOption>(null);

  // ── Paso 2 (propietario) ──
  altaPiso = signal<AltaPisoOption>(null);

  // ── Subtítulo dinámico ──
  subtitle = computed(() =>
    this.step() === 1 ? '¿Cómo usarás la app?' : 'Cuéntanos un poco más'
  );

  // ── Métodos paso 1 ──
  select(option: OnboardingOption): void {
    this.selected.set(option);
  }

  continue(): void {
    const option = this.selected();
    if (!option) return;

    if (option === 'propietario') {
      this.step.set(2);
      return;
    }

    const routes: Record<NonNullable<OnboardingOption>, string> = {
      gastos:      '/expenses',
      buscando:    '/map',
      tengo:       '/home',
      propietario: '/home',
    };
    this.router.navigate([routes[option]]);
  }

  // ── Métodos paso 2 ──
  selectAltaPiso(option: AltaPisoOption): void {
    this.altaPiso.set(option);
  }

  continuePaso2(): void {
    const option = this.altaPiso();
    if (!option) return;

    this.dataService.becomeOwner().subscribe({
      next: () => {
        if (option === 'si') {
          this.router.navigate(['/create-property']);
        } else {
          this.router.navigate(['/home-owners']);
        }
      },
      error: () => this.router.navigate(['/home-owners']),
    });
  }

  goBack(): void {
    this.step.set(1);
    this.altaPiso.set(null);
  }
}
