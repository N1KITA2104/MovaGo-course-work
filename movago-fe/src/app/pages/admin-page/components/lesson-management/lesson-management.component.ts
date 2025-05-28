import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Lesson } from "../../../../models/lesson.model"

@Component({
  selector: "app-lesson-management",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./lesson-management.component.html",
  styleUrl: "./lesson-management.component.scss",
})
export class LessonManagementComponent {
  @Input() lessons: Lesson[] = []
  @Input() loading = false

  @Output() lessonPublishedToggled = new EventEmitter<Lesson>()
  @Output() lessonEditRequested = new EventEmitter<Lesson>()
  @Output() lessonDeleteRequested = new EventEmitter<Lesson>()
  @Output() addLessonRequested = new EventEmitter<void>()

  lessonSearchQuery = ""
  difficultyFilter = "all"
  visibilityFilter = "all"
  filteredLessons: Lesson[] = []

  ngOnChanges(): void {
    this.applyLessonFilters()
  }

  filterLessons(): void {
    this.applyLessonFilters()
  }

  filterByDifficulty(difficulty: string): void {
    this.difficultyFilter = difficulty
    this.applyLessonFilters()
  }

  filterByVisibility(visibility: string): void {
    this.visibilityFilter = visibility
    this.applyLessonFilters()
  }

  applyLessonFilters(): void {
    let filtered: Lesson[] = [...this.lessons]

    if (this.lessonSearchQuery) {
      const query: string = this.lessonSearchQuery.toLowerCase()
      filtered = filtered.filter(
        (lesson: Lesson): boolean | undefined =>
          lesson.title.toLowerCase().includes(query) ||
          lesson.description.toLowerCase().includes(query) ||
          (lesson.tags && lesson.tags.some((tag: string): boolean => tag.toLowerCase().includes(query))),
      )
    }

    if (this.difficultyFilter !== "all") {
      filtered = filtered.filter((lesson: Lesson): boolean => lesson.difficulty === this.difficultyFilter)
    }

    if (this.visibilityFilter !== "all") {
      if (this.visibilityFilter === "published") {
        filtered = filtered.filter((lesson: Lesson): boolean | undefined => lesson.isPublished)
      } else if (this.visibilityFilter === "unpublished") {
        filtered = filtered.filter((lesson: Lesson): boolean => !lesson.isPublished)
      }
    }

    this.filteredLessons = filtered
  }

  resetLessonFilters(): void {
    this.lessonSearchQuery = ""
    this.difficultyFilter = "all"
    this.visibilityFilter = "all"
    this.applyLessonFilters()
  }

  toggleLessonPublished(lesson: Lesson): void {
    this.lessonPublishedToggled.emit(lesson)
  }

  editLesson(lesson: Lesson): void {
    this.lessonEditRequested.emit(lesson)
  }

  confirmDeleteLesson(lesson: Lesson): void {
    if (confirm(`Ви впевнені, що хочете видалити урок "${lesson.title}"?`)) {
      this.lessonDeleteRequested.emit(lesson)
    }
  }

  showLessonForm(): void {
    this.addLessonRequested.emit()
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
        return difficulty
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
}
