import { Injectable, Inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isLightMode = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadTheme();

    if (this.isBrowser) {
      this.applyTheme();
    }
  }

  toggleTheme(): void {
    this.isLightMode = !this.isLightMode;
    this.applyTheme();
    this.saveTheme();
  }

  isLight(): boolean {
    return this.isLightMode;
  }

  private applyTheme(): void {
    if (!this.isBrowser) return;

    const body = document.body;

    if (this.isLightMode) {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }
  }

  private saveTheme(): void {
    if (!this.isBrowser) return;
    localStorage.setItem('theme', this.isLightMode ? 'light' : 'dark');
  }

  private loadTheme(): void {
    if (!this.isBrowser) return;

    const saved = localStorage.getItem('theme');
    this.isLightMode = saved === 'light';
  }
}