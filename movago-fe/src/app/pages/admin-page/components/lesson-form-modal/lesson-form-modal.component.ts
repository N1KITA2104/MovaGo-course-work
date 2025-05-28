import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormArray,
  FormBuilder,
  Validators,
} from "@angular/forms"
import { Lesson } from "../../../../models/lesson.model"

@Component({
  selector: "app-lesson-form-modal",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./lesson-form-modal.component.html",
  styleUrl: "./lesson-form-modal.component.scss",
})
export class LessonFormModalComponent {
  @Input() lessonForm!: FormGroup
  @Input() editingLesson: Lesson | null = null
  @Input() savingLesson = false

  @Output() closeModal = new EventEmitter<Event>()
  @Output() saveLesson = new EventEmitter<void>()

  activeFormTab: "basic" | "questions" | "settings" = "basic"
  activeQuestionIndex = 0

  constructor(private fb: FormBuilder) {}

  onCloseModal(event: Event): void {
    this.closeModal.emit(event)
  }

  onSaveLesson(): void {
    this.saveLesson.emit()
  }

  setActiveFormTab(tab: "basic" | "questions" | "settings"): void {
    this.activeFormTab = tab
  }

  setActiveQuestion(index: number): void {
    if (index >= 0 && index < this.questionBankArray.length) {
      this.activeQuestionIndex = index
    }
  }

  get questionBankArray(): FormArray {
    return this.lessonForm.get("questionBank") as FormArray
  }

  getOptionsArray(questionIndex: number): FormArray {
    return (this.questionBankArray.at(questionIndex) as FormGroup).get("options") as FormArray
  }

  getMatchingPairsArray(questionIndex: number): FormArray {
    return (this.questionBankArray.at(questionIndex) as FormGroup).get("matchingPairs") as FormArray
  }

  getWordOrderArray(questionIndex: number): FormArray {
    return (this.questionBankArray.at(questionIndex) as FormGroup).get("wordOrder") as FormArray
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
    this.activeQuestionIndex = this.questionBankArray.length - 1
    this.activeFormTab = "questions"
  }

  removeQuestion(index: number): void {
    if (this.questionBankArray.length > 1) {
      this.questionBankArray.removeAt(index)

      // Adjust active question index if needed
      if (this.activeQuestionIndex >= this.questionBankArray.length) {
        this.activeQuestionIndex = this.questionBankArray.length - 1
      }
    } else {
      alert("Урок повинен містити хоча б одне питання")
    }
  }

  onQuestionTypeChange(questionIndex: number): void {
    const questionGroup = this.questionBankArray.at(questionIndex) as FormGroup
    const questionType: any = questionGroup.get("type")?.value

    questionGroup.get("correctAnswer")?.setValue("")

    if (questionType === "multiple-choice" || questionType === "sentence-completion") {
      const optionsArray = questionGroup.get("options") as FormArray
      if (optionsArray.length === 0) {
        for (let i = 0; i < 4; i++) {
          optionsArray.push(this.fb.control("", Validators.required))
        }
      }
    } else if (questionType === "matching") {
      const matchingPairsArray = questionGroup.get("matchingPairs") as FormArray
      if (matchingPairsArray.length === 0) {
        this.addMatchingPair(questionIndex)
      }
    } else if (questionType === "word-order") {
      const wordOrderArray = questionGroup.get("wordOrder") as FormArray
      if (wordOrderArray.length === 0) {
        this.addWordOrderItem(questionIndex)
      }
    }
  }

  addOption(questionIndex: number): void {
    this.getOptionsArray(questionIndex).push(this.fb.control("", Validators.required))
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const optionsArray = this.getOptionsArray(questionIndex)
    if (optionsArray.length > 2) {
      optionsArray.removeAt(optionIndex)

      const questionGroup = this.questionBankArray.at(questionIndex) as FormGroup
      const correctAnswer: any = questionGroup.get("correctAnswer")?.value
      const options: any = optionsArray.value

      if (!options.includes(correctAnswer)) {
        questionGroup.get("correctAnswer")?.setValue(options[0] || "")
      }
    } else {
      alert("Питання повинно мати хоча б два варіанти відповіді")
    }
  }

  addMatchingPair(questionIndex: number): void {
    this.getMatchingPairsArray(questionIndex).push(
      this.fb.group({
        left: ["", Validators.required],
        right: ["", Validators.required],
      }),
    )
  }

  removeMatchingPair(questionIndex: number, pairIndex: number): void {
    const pairsArray = this.getMatchingPairsArray(questionIndex)
    if (pairsArray.length > 1) {
      pairsArray.removeAt(pairIndex)
    } else {
      alert("Питання повинно мати хоча б одну пару для співставлення")
    }
  }

  addWordOrderItem(questionIndex: number): void {
    this.getWordOrderArray(questionIndex).push(this.fb.control("", Validators.required))
  }

  removeWordOrderItem(questionIndex: number, wordIndex: number): void {
    const wordOrderArray = this.getWordOrderArray(questionIndex)
    if (wordOrderArray.length > 2) {
      wordOrderArray.removeAt(wordIndex)
    } else {
      alert("Питання повинно мати хоча б два слова для впорядкування")
    }
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case "multiple-choice":
        return "Вибір"
      case "translation":
        return "Переклад"
      case "matching":
        return "Співставлення"
      case "word-order":
        return "Порядок слів"
      case "sentence-completion":
        return "Доповнення"
      default:
        return type
    }
  }
}
