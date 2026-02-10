import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Clonamos la petición y le decimos que envíe las Cookies (credenciales)
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq);
};