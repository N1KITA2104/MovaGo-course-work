import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http"
import { inject } from "@angular/core"
import { AuthService } from "../services/auth.service"
import { catchError, type Observable, of, throwError } from "rxjs"
import { environment } from "../../environments/environment"

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService: AuthService = inject(AuthService)
  const token: string | null = authService.getToken()

  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req)
  }

  if (!token) {
    return next(req)
  }

  const headers: { [key: string]: string } = {
    Authorization: `Bearer ${token}`,
  }

  const modifiedReq: HttpRequest<unknown> = req.clone({ setHeaders: headers })

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse): Observable<never> => {
      if (error.status === 401 || error.status === 403) {
        if (!req.url.includes("/auth/login") && !req.url.includes("/auth/register")) {
          authService.logout()
        }
        return of() as unknown as Observable<never>
      }
      return throwError((): HttpErrorResponse => error)
    }),
  )
}
