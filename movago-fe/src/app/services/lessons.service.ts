import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http"
import { Observable, throwError, of } from "rxjs"
import { environment } from "../../environments/environment"
import { Lesson } from "../models/lesson.model"
import { catchError, map, shareReplay, tap } from "rxjs/operators"
import { UserService } from "./user.service"

interface PaginatedResponse {
  lessons: Lesson[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable({
  providedIn: "root",
})
export class LessonsService {
  private apiUrl: string = `${environment.apiUrl}/lessons`
  private lessonCache = new Map<string, { data: Lesson; timestamp: number }>()
  private lessonsCache = new Map<string, { data: Lesson[]; timestamp: number }>()
  private paginatedCache = new Map<string, { data: PaginatedResponse; timestamp: number }>()
  private cacheDuration: number = 5 * 60 * 1000
  private batchCache = new Map<string, { data: Lesson[]; timestamp: number }>()

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}

  getLessons(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(this.apiUrl).pipe(
      map((lessons: Lesson[]): Lesson[] => {
        if (this.userService.isAdmin) {
          return lessons
        }
        return lessons.filter((lesson: Lesson): boolean => lesson.isPublished !== false)
      }),
      catchError(this.handleError),
    )
  }

  getPaginatedLessons(
    page: number = 1,
    limit: number = 10,
    difficulty: string = 'all',
    category: string = 'all'
  ): Observable<PaginatedResponse> {
    const cacheKey = `paginated_${page}_${limit}_${difficulty}_${category}`
    const cached = this.paginatedCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return of(cached.data)
    }

    let params: HttpParams = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('difficulty', difficulty)
      .set('category', category)

    return this.http.get<PaginatedResponse>(`${this.apiUrl}/web/paginated`, { params }).pipe(
      tap((response: PaginatedResponse): void => {
        this.paginatedCache.set(cacheKey, { data: response, timestamp: Date.now() })
      }),
      catchError(this.handleError),
      shareReplay(1)
    )
  }

  getLessonById(id: string): Observable<Lesson> {
    const cached = this.lessonCache.get(id)
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return of(cached.data)
    }

    return this.http.get<Lesson>(`${this.apiUrl}/${id}`).pipe(
      map((lesson: Lesson): Lesson => {
        if (lesson.isPublished === false && !this.userService.isAdmin) {
          throw new Error("Урок незнайдений або недоступний")
        }
        this.lessonCache.set(id, { data: lesson, timestamp: Date.now() })
        return lesson
      }),
      catchError(this.handleError),
      shareReplay(1)
    )
  }

  getLessonsByIds(ids: string[]): Observable<Lesson[]> {
    if (!ids || ids.length === 0) {
      return of([])
    }

    const sortedIds: string[] = [...ids].sort()
    const cacheKey: string = sortedIds.join(',')

    const cached = this.batchCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return of(cached.data)
    }

    return this.http.post<Lesson[]>(`${this.apiUrl}/web/batch`, { ids }).pipe(
      tap((lessons: Lesson[]): void => {
        this.batchCache.set(cacheKey, { data: lessons, timestamp: Date.now() })

        lessons.forEach((lesson: Lesson): void => {
          if (lesson._id) {
            this.lessonCache.set(lesson._id, { data: lesson, timestamp: Date.now() })
          }
        })
      }),
      catchError(this.handleError),
      shareReplay(1)
    )
  }

  createLesson(lesson: Partial<Lesson>): Observable<Lesson> {
    return this.http.post<Lesson>(this.apiUrl, lesson).pipe(
      tap((): void => this.clearCache()),
      catchError(this.handleError)
    )
  }

  updateLesson(id: string, lesson: Partial<Lesson>): Observable<Lesson> {
    return this.http.put<Lesson>(`${this.apiUrl}/${id}`, lesson).pipe(
      tap((): void => this.clearCache()),
      catchError(this.handleError)
    )
  }

  deleteLesson(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap((): void => this.clearCache()),
      catchError(this.handleError)
    )
  }

  completeLesson(id: string): Observable<Lesson> {
    return this.http.post<Lesson>(`${this.apiUrl}/${id}/complete`, {}).pipe(
      tap((): void => {
        this.lessonCache.delete(id)
        this.clearPaginatedCache()
      }),
      catchError(this.handleError)
    )
  }

  clearCache(): void {
    this.lessonCache.clear()
    this.lessonsCache.clear()
    this.paginatedCache.clear()
    this.batchCache.clear()
  }

  clearPaginatedCache(): void {
    this.paginatedCache.clear()
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error("LessonsService error", error)
    let errorMessage: string = "An unknown error occurred"
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`
    } else {
      errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`
    }
    return throwError((): any => errorMessage)
  }
}
