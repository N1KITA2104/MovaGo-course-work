import { Component, OnInit, OnDestroy } from "@angular/core"
import { ActivatedRoute, Params, RouterLink } from "@angular/router"
import { CommonModule, DatePipe } from "@angular/common"
import { UserService } from "../../services/user.service"
import { LessonsService } from "../../services/lessons.service"
import { User } from "../../models/user.model"
import { Lesson } from "../../models/lesson.model"
import { Subject, takeUntil, finalize } from "rxjs"
import { environment } from "../../../environments/environment"
import {HumanNumberPipe} from '../../pipes/human-number.pipe';

@Component({
  selector: "app-user-profile",
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, HumanNumberPipe],
  templateUrl: "./user-profile.component.html",
  styleUrl: "./user-profile.component.scss",
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userProfile: User | null = null
  completedLessons: Lesson[] = []
  loading: boolean = true
  loadingLessons: boolean = false
  error: boolean = false
  private destroy$: Subject<void> = new Subject<void>()

  constructor(
    private route: ActivatedRoute,
    public userService: UserService,
    private lessonsService: LessonsService,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params: Params): void => {
      const userId: any = params["id"]
      if (userId) {
        this.loadUserProfile(userId)
      } else {
        this.error = true
        this.loading = false
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadUserProfile(userId: string): void {
    this.loading = true
    this.error = false

    this.userService
      .getUserById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: User): void => {
          this.userProfile = user
          if (user.progress && user.progress.completedLessons && user.progress.completedLessons.length > 0) {
            this.loadCompletedLessons(user.progress.completedLessons)
          } else {
            this.completedLessons = []
            this.loading = false
          }
        },
        error: (error: any): void => {
          console.error("Error fetching user profile:", error)
          this.error = true
          this.loading = false
        },
      })
  }

  loadCompletedLessons(lessonIds: string[]): void {
    if (lessonIds.length === 0) {
      this.loading = false
      return
    }

    this.loadingLessons = true

    this.lessonsService
      .getLessonsByIds(lessonIds)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false
          this.loadingLessons = false
        }),
      )
      .subscribe({
        next: (lessons: Lesson[]): void => {
          this.completedLessons = lessons.map((lesson: Lesson): Lesson => {
            if (this.userProfile && this.userProfile.progress.lessonCompletionCounts) {
              lesson.completedCount = this.userProfile.progress.lessonCompletionCounts[lesson._id as string] || 0
            }
            lesson.completed = true
            return lesson
          })
        },
        error: (error: any): void => {
          console.error("Error loading completed lessons:", error)
          this.loading = false
        },
      })
  }

  getProfilePhotoUrl(photoPath: string): string {
    if (!photoPath) return ""

    if (photoPath.startsWith("http")) {
      return photoPath
    }

    return `${environment.apiUrl}${photoPath}`
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case "active":
        return "Активний"
      case "inactive":
        return "Неактивний"
      case "pending":
        return "Очікує підтвердження"
      default:
        return "Невідомий"
    }
  }

  getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
      case "beginner":
        return "Початковий"
      case "intermediate":
        return "Середній"
      case "advanced":
        return "Просунутий"
      default:
        return "Невідомий"
    }
  }

  getActiveDaysCount(): number {
    if (!this.userProfile?.progress?.activityCalendar) {
      return 0
    }
    return this.userProfile.progress.activityCalendar.filter((day) => day.completed).length
  }

  getActiveMonthCount(): number {
    if (!this.userProfile?.progress?.activityCalendar) {
      return 0
    }

    const activeMonths = new Set()
    this.userProfile.progress.activityCalendar.forEach((day) => {
      if (day.completed) {
        const date = new Date(day.date)
        const monthYear = `${date.getMonth()}-${date.getFullYear()}`
        activeMonths.add(monthYear)
      }
    })

    return activeMonths.size
  }

  getRecentActivityPercentage(): number {
    if (!this.userProfile?.progress?.activityCalendar) {
      return 0
    }

    const now = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    let daysInPeriod = 0
    let activeDays = 0

    for (let d = new Date(oneMonthAgo); d <= now; d.setDate(d.getDate() + 1)) {
      daysInPeriod++

      const dateString = this.formatDateKey(d)
      const isActive = this.userProfile.progress.activityCalendar.some(
        (day) => this.formatDateKey(new Date(day.date)) === dateString && day.completed,
      )

      if (isActive) {
        activeDays++
      }
    }

    return daysInPeriod > 0 ? Math.round((activeDays / daysInPeriod) * 100) : 0
  }

  getLastActiveDate(): Date | null {
    if (!this.userProfile?.progress?.activityCalendar || this.userProfile.progress.activityCalendar.length === 0) {
      return null
    }

    const activeDays = this.userProfile.progress.activityCalendar
      .filter((day) => day.completed)
      .map((day) => new Date(day.date))

    if (activeDays.length === 0) {
      return null
    }

    return new Date(Math.max(...activeDays.map((date) => date.getTime())))
  }

  private formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  }
}
