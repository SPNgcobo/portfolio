import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  isMenuOpen = false;

  constructor(public theme: ThemeService) { }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTheme() {
    this.theme.toggleTheme();
  }

  get isLightMode(): boolean {
    return this.theme.isLight();
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: Event) {
    const clickedInside = (event.target as HTMLElement).closest('.navbar');
    if (!clickedInside) {
      this.isMenuOpen = false;
    }
  }
}