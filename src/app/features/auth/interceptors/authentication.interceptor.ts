import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { RefreshTokenResponse } from '../interfaces/auth.interface';
import { AuthenticationService } from '../services/authentication.service';

export const authenticationInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  // Rutas que no necesitan autenticación
  const excludedUrls = ['/login', '/register', '/refresh'];

  // Verifica si la URL de la solicitud está en las rutas excluidas
  const shouldExclude = excludedUrls.some((url) => req.url.includes(url));

  if (shouldExclude) {
    return next(req);
  }

  //Obtener el token de autenticación del servicio
  const token = authService.getToken();

  // Si no hay token, continúa sin modificar la solicitud
  if (!token) {
    return next(req);
  }

  // Clonar la solicitud y agregar el token de autorización en los encabezados
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 (Unauthorized)
      if (error.status === 401) {
        return handle401Error(clonedRequest, next, authService, router);
      }

      return throwError(() => error);
    }),
  );
};

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthenticationService,
  router: Router,
) {
  // Intentar renovar el token (las cookies se envían automáticamente)
  return authService.refreshToken().pipe(
    switchMap((response: RefreshTokenResponse) => {
      // Si el refresh es exitoso, guardar solo el nuevo access token
      authService.setToken(response.data.accessToken);
      // El refresh token se renueva automáticamente en las cookies

      // Reintentar la petición original con el nuevo token
      const newRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${response.data.accessToken}`,
        },
      });

      return next(newRequest);
    }),
    catchError((refreshError) => {
      // Si el refresh falla, logout y redirigir
      authService.logout();
      router.navigate(['/auth/login']);
      return throwError(() => refreshError);
    }),
  );
}
