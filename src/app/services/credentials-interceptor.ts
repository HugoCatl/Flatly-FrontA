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
  
  // Obtener el token del localStorage si existe
  const token = localStorage.getItem('auth_token');
  
  let authReq = req.clone({
    withCredentials: true
  });
  
  // Si hay token, añadirlo al header Authorization
  if (token) {
    authReq = authReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((err) => {
      // Si el backend devuelve 401, redirigir a login
      if (err.status === 401) {
        console.warn('[Interceptor] 401 recibido, redirigiendo a login');
        localStorage.removeItem('user_session');
        localStorage.removeItem('user_name');
        localStorage.removeItem('auth_token');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
