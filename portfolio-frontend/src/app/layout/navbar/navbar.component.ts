import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private theme = inject(ThemeService);
  private router = inject(Router);

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.auth.clearUser();
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Logout error:', err);
      }
    });
  }

  get isLightMode(): boolean {
    return this.theme.isLight();
  }

  get currentUser() {
    return this.auth.getCurrentUser();
  }

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: Event): void {
    const clickedInside = (event.target as HTMLElement).closest('.navbar');
    if (!clickedInside) {
      this.isMenuOpen = false;
    }
  }
}