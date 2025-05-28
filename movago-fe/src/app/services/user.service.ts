import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { AuthService } from "./auth.service"
import { Observable, catchError, throwError, BehaviorSubject, tap, of, shareReplay, map, finalize } from "rxjs"
import { User, LessonCompletionCounts } from "../models/user.model"
import { environment } from "../../environments/environment"

export interface UserProgressUpdate {
  completedLessons?: string[]
  lessonCompletionCounts?: LessonCompletionCounts
  xp?: number
  level?: number
  streakDays?: number
  activityCalendar?: { date: Date; completed: boolean }[]
  lessonId?: string
  completed?: boolean
}

interface ProfileResponse {
  user: User
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl: string = `${environment.apiUrl}/auth`
  private userProfileSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null)
  public userProfile$: Observable<User | null> = this.userProfileSubject.asObservable()
  private profileRequest: Observable<User | null> | null = null
  private isAuthInitialized: boolean = false

  public isAdmin$: Observable<boolean> = this.userProfile$.pipe(
    map((user: User | null): boolean => user?.role === "admin"),
  )

  get isAdmin(): boolean {
    const user: User | null = this.userProfileSubject.getValue()
    return user?.role === "admin"
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    if (!this.isAuthInitialized) {
      this.isAuthInitialized = true

      this.authService.authState$.subscribe((isAuthenticated: boolean): void => {
        if (!isAuthenticated) {
          this.clearUserProfile()
        } else if (this.authService.isLoggedIn()) {
          this.loadUserProfile()
        }
      })
    }
  }

  private loadUserProfile(): void {
    this.getUserProfile().subscribe({
      error: (error: any): void => console.error("Error loading user profile:", error),
    })
  }

  clearUserProfile(): void {
    this.userProfileSubject.next(null)
    this.profileRequest = null
  }

  getUserProfile(): Observable<User | null> {
    if (!this.authService.isLoggedIn()) {
      this.clearUserProfile()
      return of(null)
    }

    const cacheTime: number = Number(sessionStorage.getItem("profileTimestamp") || 0)
    if (Date.now() - cacheTime < 300000) {
      return this.userProfile$
    }

    if (this.profileRequest) {
      return this.profileRequest
    }

    this.profileRequest = this.http.get<ProfileResponse>(`${this.apiUrl}/profile`).pipe(
      map((response: ProfileResponse): User => {
        this.userProfileSubject.next(response.user)
        sessionStorage.setItem("profileTimestamp", Date.now().toString())
        return response.user
      }),
      catchError((error: HttpErrorResponse): Observable<null> => {
        this.profileRequest = null
        console.error("Error fetching user profile:", error)

        if (error.status === 401 || error.status === 403) {
          this.authService.logout()
        }

        this.userProfileSubject.next(null)
        return of(null)
      }),
      shareReplay(1),
      finalize((): void => {
        this.profileRequest = null
      }),
    )

    return this.profileRequest
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/users/${userId}`).pipe(
      map((response: ProfileResponse): User => response.user),
      catchError(this.handleError)
    )
  }

  refreshUserProfile(): void {
    if (!this.authService.isLoggedIn()) {
      this.clearUserProfile()
      return
    }

    const cacheTime: number = Number(sessionStorage.getItem("profileTimestamp") || 0)
    if (Date.now() - cacheTime < 300000 && this.userProfileSubject.getValue()) {
      return
    }

    if (this.profileRequest) {
      return
    }

    this.profileRequest = this.http.get<ProfileResponse>(`${this.apiUrl}/profile`).pipe(
      map((response: ProfileResponse): User => response.user),
      catchError((error: HttpErrorResponse): Observable<null> => {
        if (error.status === 401 || error.status === 403) {
          this.authService.logout()
        }

        console.error("Error refreshing user profile:", error)
        return of(null)
      }),
      shareReplay(1),
      finalize((): void => {
        this.profileRequest = null
      }),
    )

    this.profileRequest.subscribe((user: User | null): void => {
      if (user) {
        this.userProfileSubject.next(user)
        sessionStorage.setItem("profileTimestamp", Date.now().toString())
      }
      this.profileRequest = null
    })
  }

  updateUserProgress(progress: { lessonId: string; xp: number; completed: boolean }): Observable<any> {
    return this.http.post(`${this.apiUrl}/complete-lesson`, progress).pipe(
      tap((response: any): void => {
        if (response?.user) {
          this.userProfileSubject.next(response.user)
          sessionStorage.setItem("profileTimestamp", Date.now().toString())
        }
      }),
      catchError(this.handleError),
    )
  }

  updateUserProfile(profileData: Partial<User>): Observable<User> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}/profile`, profileData).pipe(
      map((response: ProfileResponse): User => {
        const updatedUser: User = response.user
        this.userProfileSubject.next(updatedUser)
        sessionStorage.setItem("profileTimestamp", Date.now().toString())
        return updatedUser
      }),
      catchError(this.handleError),
    )
  }

  uploadProfilePhoto(file: File): Observable<User> {
    const formData = new FormData()
    formData.append("profilePhoto", file)

    return this.http.post<ProfileResponse>(`${this.apiUrl}/profile/photo`, formData).pipe(
      map((response: ProfileResponse): User => {
        const updatedUser: User = response.user
        this.userProfileSubject.next(updatedUser)
        sessionStorage.setItem("profileTimestamp", Date.now().toString())
        return updatedUser
      }),
      catchError(this.handleError),
    )
  }

  completeLesson(lessonId: string): Observable<any> {
    return this.updateUserProgress({
      lessonId: lessonId,
      xp: 10,
      completed: true,
    })
  }

  deleteProfilePhoto(): Observable<User> {
    return this.http.delete<ProfileResponse>(`${this.apiUrl}/profile/photo`).pipe(
      map((response: ProfileResponse): User => {
        const updatedUser: User = response.user
        this.userProfileSubject.next(updatedUser)
        sessionStorage.setItem("profileTimestamp", Date.now().toString())
        return updatedUser
      }),
      catchError(this.handleError),
    )
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<{ users: User[] }>(`${this.apiUrl}/users`).pipe(
      map((response: { users: User[] }): User[] => response.users),
      catchError(this.handleError),
    )
  }

  updateUserRole(userId: string, newRole: "user" | "admin" | "moderator"): Observable<User> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}/users/${userId}/role`, { role: newRole }).pipe(
      map((response: ProfileResponse): User => response.user),
      catchError(this.handleError),
    )
  }

  updateUserStatus(userId: string, newStatus: "active" | "inactive" | "pending"): Observable<User> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}/users/${userId}/status`, { status: newStatus }).pipe(
      map((response: ProfileResponse): User => response.user),
      catchError(this.handleError),
    )
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`).pipe(catchError(this.handleError))
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error("UserService error", error)
    return throwError((): HttpErrorResponse => error)
  }
}
