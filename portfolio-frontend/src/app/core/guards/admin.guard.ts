import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

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