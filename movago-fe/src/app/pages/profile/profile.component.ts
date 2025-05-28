import { Component, OnInit, OnDestroy } from "@angular/core"
import { RouterLink } from "@angular/router"
import { NgIf, NgFor, DatePipe, AsyncPipe } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { UserService } from "../../services/user.service"
import { LessonsService } from "../../services/lessons.service"
import { User } from "../../models/user.model"
import { Lesson } from "../../models/lesson.model"
import { ActivityCalendarComponent } from "../../components/activity-calendar/activity-calendar.component"
import { ProfileEditModalComponent } from "../../components/profile-edit-modal/profile-edit-modal.component"
import { Subject, takeUntil, finalize } from "rxjs"
import { AuthService } from "../../services/auth.service"
import { environment } from "../../../environments/environment"
import {HumanNumberPipe} from '../../pipes/human-number.pipe';

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    RouterLink,
    FormsModule,
    DatePipe,
    ActivityCalendarComponent,
    AsyncPipe,
    ProfileEditModalComponent,
    HumanNumberPipe,
  ],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.scss",
})
export class ProfileComponent implements OnInit, OnDestroy {
  userProfile: User | null = null
  completedLessons: Lesson[] = []
  loading = true
  loadingLessons = false
  showEditProfileModal = false
  private destroy$: Subject<void> = new Subject<void>()
  private photoTimestamp: number = new Date().getTime()

  constructor(
    public userService: UserService,
    public authService: AuthService,
    private lessonsService: LessonsService,
  ) {}

  ngOnInit(): void {
    this.loadUserProfile()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadUserProfile(): void {
    this.loading = true
    this.userService.userProfile$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (profile: User | null): void => {
        this.userProfile = profile
        if (profile) {
          if (profile.progress && profile.progress.completedLessons && profile.progress.completedLessons.length > 0) {
            this.loadCompletedLessons(profile.progress.completedLessons)
          } else {
            this.completedLessons = []
            this.loading = false
          }
        } else {
          this.userService.refreshUserProfile()
        }
      },
      error: (error: any): void => {
        console.error("Error fetching user profile:", error)
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
        },
      })
  }

  openEditProfileModal(): void {
    this.showEditProfileModal = true
  }

  closeEditProfileModal(): void {
    this.showEditProfileModal = false
  }

  onProfileUpdated(user: User): void {
    this.userProfile = user
    this.userService.refreshUserProfile()
    this.photoTimestamp = new Date().getTime()
  }

  getProfilePhotoUrl(photoPath: string): string {
    if (!photoPath) return ""

    if (photoPath.startsWith("http")) {
      return photoPath
    }

    return `${environment.apiUrl}${photoPath}?t=${this.photoTimestamp}`
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
