import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean> {
    return this.auth.getMe().pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}