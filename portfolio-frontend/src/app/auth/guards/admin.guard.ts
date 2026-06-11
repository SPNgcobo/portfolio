import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean> {
    return this.auth.getMe().pipe(
      map(user => {
        if (user.role === 'ROLE_ADMIN') {
          return true;
        }
        this.router.navigate(['/']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}