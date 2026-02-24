import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _dark = signal(false);

  readonly isDark = computed(() => this._dark());

  init() {
    // Recupera preferencia guardada, o usa la del sistema
    const saved = localStorage.getItem('theme');
    if (saved) {
      this._dark.set(saved === 'dark');
    } else {
      this._dark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    this.apply();
  }

  toggle() {
    this._dark.set(!this._dark());
    localStorage.setItem('theme', this._dark() ? 'dark' : 'light');
    this.apply();
  }

  private apply() {
    document.documentElement.classList.toggle('dark', this._dark());
  }
}