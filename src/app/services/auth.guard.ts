import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DataService } from './data';
import { map, catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const data = inject(DataService);
  const router = inject(Router);

  return data.checkSession().pipe(
    timeout(5000),
    map(() => true),
    catchError((err) => {
      console.warn('[AuthGuard] Sesión no válida, redirigiendo a login:', err?.status || err);
      localStorage.removeItem('user_session');
      localStorage.removeItem('user_name');
      router.navigate(['/login']);
      return of(false);
    })
  );
};
