import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const authReq = req.clone({
    withCredentials: true
  });

  if (req.url.includes('/api/auth/refresh')) {
    return next(authReq);
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 403 || error.status === 401) {
        console.log('🔄 Token expired, attempting refresh...');

        return authService.refreshToken().pipe(
          switchMap((refreshSuccess: boolean) => {
            if (refreshSuccess) {
              console.log('✅ Token refreshed, retrying request...');
              return next(req.clone({
                withCredentials: true
              }));
            } else {
              console.log('❌ Token refresh failed');
              return throwError(() => error);
            }
          }),
          catchError((refreshError) => {
            console.error('❌ Token refresh error:', refreshError);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};