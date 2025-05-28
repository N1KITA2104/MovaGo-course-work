import { Component, OnInit, OnDestroy, HostListener } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink, ActivatedRoute, Params } from "@angular/router"
import { Lesson } from "../../models/lesson.model"
import { LessonsService } from "../../services/lessons.service"
import { UserService } from "../../services/user.service"
import { User } from "../../models/user.model"
import { Subject, takeUntil, finalize } from "rxjs"

@Component({
  selector: "app-lessons",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./lessons.component.html",
  styleUrl: "./lessons.component.scss",
})
export class LessonsComponent implements OnInit, OnDestroy {
  lessons: Lesson[] = []
  filteredLessons: Lesson[] = []
  loading = true
  loadingMore = false
  error: any
  selectedDifficulty = "all"
  selectedCategory = "all"
  userProfile: User | null = null
  isAdmin = false
  private destroy$: Subject<void> = new Subject<void>()

  currentPage = 1
  totalPages = 1
  pageSize = 10
  hasMoreLessons = true

  constructor(
    private lessonsService: LessonsService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params): void => {
      if (params["difficulty"]) {
        this.selectedDifficulty = params["difficulty"]
      }
      if (params["category"]) {
        this.selectedCategory = params["category"]
      }

      this.currentPage = 1
      this.lessons = []
      this.filteredLessons = []
    })

    this.userService.userProfile$.pipe(takeUntil(this.destroy$)).subscribe((profile: User | null): void => {
      this.userProfile = profile
      this.isAdmin = profile?.role === "admin"
      this.loadLessons()
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadLessons(): void {
    this.loading = true

    this.lessonsService
      .getPaginatedLessons(this.currentPage, this.pageSize, this.selectedDifficulty, this.selectedCategory)
      .subscribe({
        next: (response): void => {
          const newLessons = response.lessons.map((lesson: Lesson): Lesson => {
            if (this.userProfile && this.userProfile.progress && this.userProfile.progress.completedLessons) {
              if (lesson._id != null) {
                lesson.completed = this.userProfile.progress.completedLessons.includes(lesson._id)
              }

              if (this.userProfile.progress.lessonCompletionCounts && lesson._id) {
                lesson.completedCount = this.userProfile.progress.lessonCompletionCounts[lesson._id] || 0
              }
            }
            return lesson
          })

          if (this.currentPage === 1) {
            this.lessons = newLessons
          } else {
            this.lessons = [...this.lessons, ...newLessons]
          }

          this.filteredLessons = this.lessons
          this.totalPages = response.pagination.pages
          this.hasMoreLessons = this.currentPage < this.totalPages

          this.loading = false
        },
        error: (error: any): void => {
          this.error = error
          this.loading = false
        },
      })
  }

  loadMoreLessons(): void {
    if (this.loadingMore || !this.hasMoreLessons) return

    this.loadingMore = true
    this.currentPage++

    this.lessonsService
      .getPaginatedLessons(this.currentPage, this.pageSize, this.selectedDifficulty, this.selectedCategory)
      .pipe(finalize(() => (this.loadingMore = false)))
      .subscribe({
        next: (response): void => {
          const newLessons = response.lessons.map((lesson: Lesson): Lesson => {
            if (this.userProfile && this.userProfile.progress && this.userProfile.progress.completedLessons) {
              if (lesson._id != null) {
                lesson.completed = this.userProfile.progress.completedLessons.includes(lesson._id)
              }

              if (this.userProfile.progress.lessonCompletionCounts && lesson._id) {
                lesson.completedCount = this.userProfile.progress.lessonCompletionCounts[lesson._id] || 0
              }
            }
            return lesson
          })

          this.lessons = [...this.lessons, ...newLessons]
          this.filteredLessons = this.lessons
          this.hasMoreLessons = this.currentPage < response.pagination.pages
        },
        error: (error: any): void => {
          this.error = error
        },
      })
  }

  filterByDifficulty(difficulty: string): void {
    this.selectedDifficulty = difficulty
    this.currentPage = 1
    this.lessons = []
    this.filteredLessons = []
    this.loadLessons()
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category
    this.currentPage = 1
    this.lessons = []
    this.filteredLessons = []
    this.loadLessons()
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
        return ""
    }
  }

  getCategoryLabel(category?: string): string {
    if (!category) return ""

    switch (category) {
      case "vocabulary":
        return "Словниковий запас"
      case "grammar":
        return "Граматика"
      case "conversation":
        return "Розмовна мова"
      case "reading":
        return "Читання"
      case "listening":
        return "Аудіювання"
      default:
        return category
    }
  }

  @HostListener("window:scroll", ["$event"])
  onScroll(): void {
    if (this.loading || this.loadingMore || !this.hasMoreLessons) return

    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0

    if (scrollTop + windowHeight > documentHeight * 0.8) {
      this.loadMoreLessons()
    }
  }
}
