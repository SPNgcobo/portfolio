import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private isLightMode = false;

  constructor() {
    this.loadTheme();
  }

  toggleTheme() {
    this.isLightMode = !this.isLightMode;
    this.applyTheme();
  }

  isLight(): boolean {
    return this.isLightMode;
  }

  private applyTheme() {
    const body = document.body;

    if (this.isLightMode) {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }

    localStorage.setItem('theme', this.isLightMode ? 'light' : 'dark');
  }

  private loadTheme() {
    const saved = localStorage.getItem('theme');

    this.isLightMode = saved === 'light';

    this.applyTheme();
  }
}