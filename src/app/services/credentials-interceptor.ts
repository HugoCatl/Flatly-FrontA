import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const session = localStorage.getItem('user_session');
  console.log('[Interceptor] URL:', req.url, '| Session:', session);

  if (session) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${session}`
      }
    });
    console.log('[Interceptor] Header enviado:', `Bearer ${session}`);
    return next(authReq);
  }

  console.warn('[Interceptor] NO hay sesión en localStorage');
  return next(req);
};
