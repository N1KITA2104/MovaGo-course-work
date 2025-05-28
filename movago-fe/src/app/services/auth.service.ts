import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, Observable, switchMap, throwError } from "rxjs"
import { tap, catchError, map } from "rxjs/operators"
import { environment } from "../../environments/environment"
import { User } from "../models/user.model"

interface AuthResponse {
  token: string
}

interface ProfileResponse {
  user: User
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl: string = environment.apiUrl
  private tokenKey: string = "auth_token"

  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null)
  public user$: Observable<User | null> = this.userSubject.asObservable()

  private authStateSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.isLoggedIn())
  public authState$: Observable<boolean> = this.authStateSubject.asObservable()

  public isAdmin$: Observable<boolean> = this.user$.pipe(map((user: User | null): boolean => user?.role === "admin"))

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData)
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: AuthResponse): void => {
        this.setToken(response.token)
        this.authStateSubject.next(true)
      }),
      switchMap((): Observable<User> => this.getUserProfile()),
      catchError((error: any): Observable<never> => {
        console.error("Authorization error:", error)
        this.logout()
        return throwError((): any => error)
      }),
    )
  }

  getUserProfile(): Observable<User> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/auth/profile`).pipe(
      map((response: ProfileResponse): User => {
        this.userSubject.next(response.user)
        return response.user
      }),
      catchError((error: any): Observable<never> => {
        console.error("Error loading profile:", error)
        return throwError((): any => error)
      }),
    )
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey)
    this.userSubject.next(null)
    this.authStateSubject.next(false)
    sessionStorage.clear()
  }

  isLoggedIn(): boolean {
    const token: string | null = this.getToken()
    if (!token) {
      return false
    }

    try {
      const payload: string = token.split(".")[1]
      if (!payload) return false

      const decoded: any = JSON.parse(atob(payload))
      return !(decoded.exp && decoded.exp * 1000 < Date.now());


    } catch (e) {
      return false
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token)
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset/request`, { email })
  }

  verifyResetCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset/verify`, { email, code })
  }

  resetPassword(email: string, resetToken: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset/reset`, { email, resetToken, newPassword })
  }
}
