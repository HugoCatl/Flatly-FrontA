import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
//import { DataService } from './data.ts';



export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.apiUrl)) {
    const authReq = req.clone({
      withCredentials: true // Esto envía la cookie USER_SESSION
    });
    return next(authReq).pipe(
      catchError((err) => {
        // Si es 401, el servidor dice que la cookie no es válida o no llegó
        if (err.status === 401) {
          console.error('Sesión inválida en el servidor');
        }
        return throwError(() => err);
      })
    );
  }
  return next(req);
};