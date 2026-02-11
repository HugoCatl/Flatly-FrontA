import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const session = localStorage.getItem('user_session');

  if (session) {
    // Enviamos la sesión como Bearer token (el backend acepta el JSON directamente)
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${session}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
