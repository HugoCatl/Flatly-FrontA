import { Component, signal } from '@angular/core';

type OnboardingOption = 'tengo' | 'buscando' | 'gastos' | 'propietario' | null;

@Component({
  selector: 'app-onboarding',
  imports: [],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class Onboarding {
  selected = signal<OnboardingOption>(null);

  select(option: OnboardingOption): void {
    this.selected.set(option);
  }
}

