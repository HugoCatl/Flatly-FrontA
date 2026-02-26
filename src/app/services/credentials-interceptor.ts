import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Verificamos si la URL de la petición es para nuestra API
  if (req.url.includes(environment.apiUrl)) {
    const authReq = req.clone({
      withCredentials: true // <--- Esto permite enviar las Cookies
    });

    return next(authReq).pipe(
      catchError((err) => {
        if (err.status === 401) {
          console.error('Sesión expirada o inválida');
          // Aquí podrías añadir un Router para redirigir al login
        }
        return throwError(() => err);
      })
    );
  }

  return next(req);
};