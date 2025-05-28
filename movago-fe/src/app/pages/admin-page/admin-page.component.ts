import { Component, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from "@angular/forms"
import { UserService } from "../../services/user.service"
import { LessonsService } from "../../services/lessons.service"
import { User } from "../../models/user.model"
import { Lesson, Question } from "../../models/lesson.model"
import { Subject, takeUntil } from "rxjs"
import { HumanNumberPipe } from "../../pipes/human-number.pipe"
import { UserManagementComponent } from "./components/user-management/user-management.component"
import { LessonManagementComponent } from "./components/lesson-management/lesson-management.component"
import { LessonFormModalComponent } from "./components/lesson-form-modal/lesson-form-modal.component"
import { UserStatusModalComponent } from "./components/user-status-modal/user-status-modal.component"

@Component({
  selector: "app-admin-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HumanNumberPipe,
    UserManagementComponent,
    LessonManagementComponent,
    LessonFormModalComponent,
    UserStatusModalComponent,
  ],
  templateUrl: "./admin-page.component.html",
  styleUrl: "./admin-page.component.scss",
})
export class AdminPageComponent implements OnInit, OnDestroy {
  activeTab: "users" | "lessons" = "users"

  users: User[] = []
  loadingUsers = true

  showingStatusModal = false
  selectedUser: User | null = null
  selectedStatus: "active" | "inactive" | "pending" | null = null

  lessons: Lesson[] = []
  loadingLessons = true

  lessonForm: FormGroup
  editingLesson: Lesson | null = null
  showingLessonModal = false
  savingLesson = false

  private destroy$: Subject<void> = new Subject<void>()

  constructor(
    private userService: UserService,
    private lessonsService: LessonsService,
    private fb: FormBuilder,
  ) {
    this.lessonForm = this.createLessonForm()
  }

  ngOnInit(): void {
    this.loadUsers()
    this.loadLessons()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  setActiveTab(tab: "users" | "lessons"): void {
    this.activeTab = tab
  }

  loadUsers(): void {
    this.loadingUsers = true
    this.userService
      .getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users: User[]): void => {
          this.users = users.map((user: User) => {
            return { ...user, _originalStatus: user.status }
          })
          this.loadingUsers = false
        },
        error: (error: any): void => {
          console.error("Error loading users:", error)
          this.loadingUsers = false
        },
      })
  }

  updateUserRole(data: { user: User; role: string }): void {
    const { user, role } = data
    if (!user._id) return

    this.userService
      .updateUserRole(user._id, role as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser: User): void => {
          const index: number = this.users.findIndex((u: User): boolean => u._id === user._id)
          if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updatedUser, _originalStatus: updatedUser.status }
          }
        },
        error: (error: any): void => {
          console.error("Error updating user role:", error)
          const originalUser: User | undefined = this.users.find((u: User): boolean => u._id === user._id)
          if (originalUser) {
            user.role = originalUser.role
          }
        },
      })
  }

  updateUserStatus(data: { user: User; status: "active" | "inactive" | "pending" }): void {
    const { user, status } = data
    if (!user._id) return

    this.userService
      .updateUserStatus(user._id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser: User): void => {
          const index: number = this.users.findIndex((u: User): boolean => u._id === user._id)
          if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updatedUser, _originalStatus: updatedUser.status }
          }
        },
        error: (error: any): void => {
          console.error("Error updating user status:", error)
          user.status = (user._originalStatus || user.status) as "active" | "inactive" | "pending"
        },
      })
  }

  openStatusModal(user: User): void {
    this.selectedUser = user
    this.selectedStatus = user.status as "active" | "inactive" | "pending"
    this.showingStatusModal = true
  }

  closeStatusModal(event: Event): void {
    event.preventDefault()
    this.showingStatusModal = false
    this.selectedUser = null
    this.selectedStatus = null
  }

  selectStatus(status: "active" | "inactive" | "pending"): void {
    this.selectedStatus = status
  }

  saveUserStatus(): void {
    if (!this.selectedUser || !this.selectedUser._id || !this.selectedStatus) return

    this.userService
      .updateUserStatus(this.selectedUser._id, this.selectedStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser: User): void => {
          const index: number = this.users.findIndex((u: User): boolean => u._id === this.selectedUser?._id)
          if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updatedUser, _originalStatus: updatedUser.status }
          }
          this.closeStatusModal(new Event("click"))
        },
        error: (error: any): void => {
          console.error("Error updating user status:", error)
        },
      })
  }

  deleteUser(user: User): void {
    if (!user._id) return

    this.userService
      .deleteUser(user._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (): void => {
          this.users = this.users.filter((u: User): boolean => u._id !== user._id)
        },
        error: (error: any): void => {
          console.error("Error deleting user:", error)
        },
      })
  }

  loadLessons(): void {
    this.loadingLessons = true
    this.lessonsService
      .getLessons()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lessons: Lesson[]): void => {
          this.lessons = lessons
          this.loadingLessons = false
        },
        error: (error: any): void => {
          console.error("Error loading lessons:", error)
          this.loadingLessons = false
        },
      })
  }

  toggleLessonPublished(lesson: Lesson): void {
    if (!lesson._id) return

    const originalPublishedStatus: boolean | undefined = lesson.isPublished

    lesson.isPublished = !lesson.isPublished

    this.lessonsService
      .updateLesson(lesson._id, { isPublished: lesson.isPublished })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated: Lesson): void => {
          const index: number = this.lessons.findIndex((l: Lesson): boolean => l._id === lesson._id)
          if (index !== -1) {
            this.lessons[index] = { ...this.lessons[index], ...updated }
          }
        },
        error: (error: any): void => {
          console.error("Error updating lesson published status:", error)
          lesson.isPublished = originalPublishedStatus
        },
      })
  }

  deleteLesson(lesson: Lesson): void {
    if (!lesson._id) return

    this.lessonsService
      .deleteLesson(lesson._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (): void => {
          console.log("Lesson deleted successfully")
          this.lessons = this.lessons.filter((l: Lesson): boolean => l._id !== lesson._id)
        },
        error: (error: any): void => {
          console.error("Error deleting lesson:", error)
        },
      })
  }

  createLessonForm(): FormGroup {
    return this.fb.group({
      title: ["", [Validators.required]],
      description: ["", [Validators.required]],
      icon: ["", [Validators.required]],
      difficulty: ["beginner", [Validators.required]],
      category: ["vocabulary", [Validators.required]],
      order: [0, [Validators.min(0)]],
      isPublished: [true],
      tags: [""],
      questionsCount: [5, [Validators.required, Validators.min(1)]],
      questionBank: this.fb.array([]),
    })
  }

  // Add a getter for the questionBank form array
  get questionBankArray(): FormArray {
    return this.lessonForm.get("questionBank") as FormArray
  }

  showLessonForm(): void {
    this.editingLesson = null
    this.lessonForm = this.createLessonForm()
    this.addQuestion()
    this.showingLessonModal = true
  }

  addQuestion(): void {
    const questionGroup = this.fb.group({
      type: ["multiple-choice", Validators.required],
      question: ["", Validators.required],
      correctAnswer: ["", Validators.required],
      hint: [""],
      options: this.fb.array([
        this.fb.control("", Validators.required),
        this.fb.control("", Validators.required),
        this.fb.control("", Validators.required),
        this.fb.control("", Validators.required),
      ]),
      matchingPairs: this.fb.array([]),
      wordOrder: this.fb.array([]),
    })

    this.questionBankArray.push(questionGroup)
  }

  editLesson(lesson: Lesson): void {
    this.editingLesson = lesson
    this.lessonForm = this.createLessonForm()

    this.lessonForm.patchValue({
      title: lesson.title,
      description: lesson.description,
      icon: lesson.icon,
      difficulty: lesson.difficulty,
      category: lesson.category || "vocabulary",
      order: lesson.order || 0,
      isPublished: lesson.isPublished !== false,
      tags: lesson.tags ? lesson.tags.join(", ") : "",
      questionsCount: lesson.questionsCount || 5,
    })

    while (this.questionBankArray.length) {
      this.questionBankArray.removeAt(0)
    }

    // Use questionBank if available, otherwise use questions
    const questions = lesson.questionBank && lesson.questionBank.length > 0 ? lesson.questionBank : lesson.questions

    if (questions && questions.length) {
      questions.forEach((question: Question): void => {
        this.addQuestionFromData(question)
      })
    } else {
      this.addQuestion()
    }

    this.showingLessonModal = true
  }

  closeLessonModal(event: Event): void {
    event.preventDefault()
    this.showingLessonModal = false
    this.editingLesson = null
  }

  addQuestionFromData(question: Question): void {
    const questionGroup = this.fb.group({
      type: [question.type, Validators.required],
      question: [question.question, Validators.required],
      correctAnswer: [question.correctAnswer, Validators.required],
      hint: [question.hint || ""],
      options: this.fb.array([]),
      matchingPairs: this.fb.array([]),
      wordOrder: this.fb.array([]),
    })

    if (question.type === "multiple-choice" || question.type === "sentence-completion") {
      const optionsArray = questionGroup.get("options") as FormArray

      while (optionsArray.length) {
        optionsArray.removeAt(0)
      }

      if (Array.isArray(question.options)) {
        question.options.forEach((option): void => {
          optionsArray.push(this.fb.control(option, Validators.required))
        })
      }
    }

    if (question.type === "matching" && Array.isArray(question.options)) {
      const matchingPairsArray = questionGroup.get("matchingPairs") as FormArray

      question.options.forEach((pair: any): void => {
        if (pair.left && pair.right) {
          matchingPairsArray.push(
            this.fb.group({
              left: [pair.left, Validators.required],
              right: [pair.right, Validators.required],
            }),
          )
        }
      })
    }

    if (question.type === "word-order" && Array.isArray(question.correctAnswer)) {
      const wordOrderArray = questionGroup.get("wordOrder") as FormArray

      question.correctAnswer.forEach((item: any): void => {
        const word: any = typeof item === "string" ? item : item.word
        wordOrderArray.push(this.fb.control(word, Validators.required))
      })
    }

    this.questionBankArray.push(questionGroup)
  }

  saveLesson(): void {
    if (this.lessonForm.invalid) {
      this.markFormGroupTouched(this.lessonForm)
      return
    }

    this.savingLesson = true

    const formValue: any = this.lessonForm.value
    const lessonData: Partial<Lesson> = {
      title: formValue.title,
      description: formValue.description,
      icon: formValue.icon,
      difficulty: formValue.difficulty,
      category: formValue.category,
      order: formValue.order,
      isPublished: formValue.isPublished,
      tags: formValue.tags ? formValue.tags.split(",").map((tag: string): string => tag.trim()) : [],
      questionsCount: formValue.questionsCount,
      questionBank: this.prepareQuestionsData(formValue.questionBank),
      // For backward compatibility, also set the questions field to the same as questionBank
      questions: this.prepareQuestionsData(formValue.questionBank),
    }

    if (this.editingLesson && this.editingLesson._id) {
      this.lessonsService
        .updateLesson(this.editingLesson._id, lessonData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedLesson: Lesson): void => {
            this.savingLesson = false
            this.showingLessonModal = false

            const index: number = this.lessons.findIndex((l: Lesson): boolean => l._id === this.editingLesson?._id)
            if (index !== -1) {
              this.lessons[index] = updatedLesson
            }

            this.editingLesson = null
          },
          error: (error: any): void => {
            console.error("Error updating lesson:", error)
            this.savingLesson = false
          },
        })
    } else {
      this.lessonsService
        .createLesson(lessonData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newLesson: Lesson): void => {
            this.savingLesson = false
            this.showingLessonModal = false

            this.lessons.push(newLesson)
          },
          error: (error: any): void => {
            console.error("Error creating lesson:", error)
            this.savingLesson = false
          },
        })
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control: AbstractControl<any, any>): void => {
      control.markAsTouched()

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      } else if (control instanceof FormArray) {
        for (let i = 0; i < control.length; i++) {
          const arrayControl: AbstractControl<any, any> = control.at(i)
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl)
          } else {
            arrayControl.markAsTouched()
          }
        }
      }
    })
  }

  prepareQuestionsData(questionsFormData: any[]): Question[] {
    return questionsFormData.map((formQuestion: any, index: number): any => {
      const question: any = {
        id: index + 1,
        type: formQuestion.type,
        question: formQuestion.question,
        hint: formQuestion.hint || undefined,
      }

      if (formQuestion.type === "multiple-choice" || formQuestion.type === "sentence-completion") {
        question.options = formQuestion.options.filter((opt: string): boolean => opt.trim() !== "")
        question.correctAnswer = formQuestion.correctAnswer
      } else if (formQuestion.type === "translation") {
        question.correctAnswer = formQuestion.correctAnswer
      } else if (formQuestion.type === "matching") {
        const pairs: any = formQuestion.matchingPairs.map((pair: any) => ({
          left: pair.left,
          right: pair.right,
        }))
        question.options = pairs
        question.correctAnswer = pairs
      } else if (formQuestion.type === "word-order") {
        const words: any = formQuestion.wordOrder.filter((word: string): boolean => word.trim() !== "")
        question.options = words
        question.correctAnswer = words
      }

      return question
    })
  }
}
