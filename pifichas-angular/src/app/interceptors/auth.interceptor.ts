import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Sacamos el token que guardamos en el login
  const token = localStorage.getItem('token');

  // Si existe, clonamos la petición y le ponemos el "Authorization"
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};