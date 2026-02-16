import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo añadir withCredentials a peticiones hacia nuestro backend
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const router = inject(Router);

  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((err) => {
      // Si el backend devuelve 401, redirigir a login
      if (err.status === 401) {
        console.warn('[Interceptor] 401 recibido, redirigiendo a login');
        localStorage.removeItem('user_session');
        localStorage.removeItem('user_name');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
