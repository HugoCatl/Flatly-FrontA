import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DataService } from './data';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const data = inject(DataService);
  const router = inject(Router);

  return data.checkSession().pipe(
    map(() => true),
    catchError(() => {
      localStorage.removeItem('user_session');
      localStorage.removeItem('user_name');
      router.navigate(['/login']);
      return of(false);
    })
  );
};
