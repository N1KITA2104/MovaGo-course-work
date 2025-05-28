import { Component, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ActivatedRoute, Params, Router, RouterLink } from "@angular/router"
import { NgFor, NgIf } from "@angular/common"
import { Lesson, MatchingPair, Question } from "../../models/lesson.model"
import { LessonsService } from "../../services/lessons.service"
import { UserService } from "../../services/user.service"

interface MatchingPairWithId extends MatchingPair {
  id: number
  selected?: boolean
  matched?: boolean
}

interface WordOrderItem {
  word: string
  order: number
  selected?: boolean
}

@Component({
  selector: "app-lesson-detail",
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, RouterLink],
  templateUrl: "./lesson-detail.component.html",
  styleUrl: "./lesson-detail.component.scss",
})
export class LessonDetailComponent implements OnInit {
  lesson: Lesson | undefined
  currentQuestionIndex = 0
  currentQuestion: Question | undefined
  selectedAnswer = ""
  userInput = ""
  showFeedback = false
  isCorrect = false
  lessonCompleted = false
  correctAnswers = 0
  earnedXP = 0
  progressPercentage = 0

  lessonStarted = false
  selectedLeftItem: string | null = null
  lastMatchedPair: { left: string; right: string } | null = null
  animatingQuestion = false

  matchingPairs: MatchingPairWithId[] = []
  selectedMatchingPairs: Map<string, string> = new Map()

  wordOrderItems: WordOrderItem[] = []
  selectedWordOrderItems: string[] = []

  selectedSentence = ""

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lessonsService: LessonsService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params): void => {
      const lessonId: string = params["id"]
      this.lessonsService.getLessonById(lessonId).subscribe({
        next: (lesson: Lesson): void => {
          this.lesson = lesson
          this.prepareLesson()
        },
        error: (error: any): void => {
          console.error("Error loading lesson:", error)
          this.router.navigate(["/lessons"])
        },
      })
    })
  }

  prepareLesson(): void {
    this.currentQuestionIndex = 0
    this.correctAnswers = 0
    this.lessonCompleted = false
    this.lessonStarted = false
  }

  startLesson(): void {
    this.lessonStarted = true

    // If the lesson has a question bank, randomly select questions
    if (this.lesson && this.lesson.questionBank && this.lesson.questionBank.length > 0) {
      // The backend should have already selected random questions for us
      // But we'll handle it here as well just in case
      const count = Math.min(this.lesson.questionsCount || 5, this.lesson.questionBank.length)
      this.lesson.questions = this.getRandomQuestions(this.lesson.questionBank, count)
    }

    this.loadQuestion()
  }

  // Add a helper method to get random questions
  getRandomQuestions(questionBank: Question[], count: number): Question[] {
    // Create a copy of the question bank and shuffle it
    const shuffled = [...questionBank].sort(() => 0.5 - Math.random())
    // Return the first 'count' questions
    return shuffled.slice(0, count)
  }

  loadQuestion(): void {
    if (!this.lesson || this.currentQuestionIndex >= this.lesson.questions.length) {
      if (this.lesson) {
        this.completeLesson()
      } else {
        console.error("Lesson is undefined, can't complete lesson")
      }
      return
    }

    this.animatingQuestion = true
    setTimeout((): void => {
      this.animatingQuestion = false
    }, 300)

    this.currentQuestion = this.lesson.questions[this.currentQuestionIndex]
    this.selectedAnswer = ""
    this.userInput = ""
    this.showFeedback = false
    this.progressPercentage = (this.currentQuestionIndex / this.lesson.questions.length) * 100
    this.selectedMatchingPairs = new Map()
    this.selectedLeftItem = null
    this.lastMatchedPair = null
    this.selectedSentence = ""
    this.selectedWordOrderItems = []

    if (this.currentQuestion.type === "matching") {
      this.setupMatchingQuestion()
    } else if (this.currentQuestion.type === "word-order") {
      this.setupWordOrderQuestion()
    }
  }

  getMultipleChoiceOptions(): string[] {
    if (!this.currentQuestion || !this.currentQuestion.options) return []

    if (this.currentQuestion.type === "multiple-choice" || this.currentQuestion.type === "sentence-completion") {
      return this.currentQuestion.options as string[]
    }

    return []
  }

  getCorrectAnswerForMultipleChoice(): string {
    if (!this.currentQuestion) return ""

    if (this.currentQuestion.type === "multiple-choice" || this.currentQuestion.type === "sentence-completion") {
      return this.currentQuestion.correctAnswer as string
    }

    return ""
  }

  selectAnswer(answer: string): void {
    if (this.showFeedback) return
    this.selectedAnswer = answer
    this.checkAnswer()
  }

  selectSentence(sentence: string): void {
    if (this.showFeedback) return
    this.selectedSentence = sentence
    this.checkSentenceCompletion()
  }

  checkAnswer(): void {
    if (!this.currentQuestion) return

    if (this.currentQuestion.type === "multiple-choice") {
      const correctAnswer = this.currentQuestion.correctAnswer as string
      this.isCorrect = this.selectedAnswer === correctAnswer
    } else if (this.currentQuestion.type === "translation") {
      const correctAnswer = this.currentQuestion.correctAnswer as string
      this.isCorrect = this.userInput.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    }

    this.showFeedback = true
    if (this.isCorrect) {
      this.correctAnswers++
    }
  }

  checkTranslation(): void {
    if (!this.currentQuestion || !this.userInput) return

    const correctAnswer = this.currentQuestion.correctAnswer as string

    const normalizedInput = this.userInput.toLowerCase().trim()
    const normalizedCorrect = correctAnswer.toLowerCase().trim()

    this.isCorrect = normalizedInput === normalizedCorrect

    this.showFeedback = true
    if (this.isCorrect) {
      this.correctAnswers++
    }
  }

  checkSentenceCompletion(): void {
    if (!this.currentQuestion || !this.selectedSentence) return

    const correctAnswer = this.currentQuestion.correctAnswer as string
    this.isCorrect = this.selectedSentence === correctAnswer

    this.showFeedback = true
    if (this.isCorrect) {
      this.correctAnswers++
    }
  }

  nextQuestion(): void {
    this.currentQuestionIndex++
    this.loadQuestion()
  }

  completeLesson(): void {
    this.lessonCompleted = true
    this.earnedXP = this.correctAnswers * 10

    if (this.lesson && this.lesson._id) {
      const progressData = {
        lessonId: this.lesson._id,
        xp: this.earnedXP,
        completed: true,
      }

      this.userService.updateUserProgress(progressData).subscribe({
        next: (): void => {
          console.log("Lesson completed successfully:")
          this.userService.refreshUserProfile()
        },
        error: (error: any): void => console.error("Error completing lesson:", error),
      })
    }
  }

  restartLesson(): void {
    this.prepareLesson()
    this.startLesson()
  }

  getDifficultyLabel(difficulty: "beginner" | "intermediate" | "advanced"): string {
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

  setupMatchingQuestion(): void {
    if (!this.currentQuestion || !this.currentQuestion.options) return

    this.matchingPairs = []
    this.selectedMatchingPairs.clear()

    if (Array.isArray(this.currentQuestion.options)) {
      const options = [...this.currentQuestion.options] as MatchingPair[]

      // Create arrays of left and right items
      const leftItems = options.map((pair) => pair.left)
      const rightItems = options.map((pair) => pair.right)

      // Shuffle both arrays independently
      const shuffledLeftItems = this.shuffleArray([...leftItems])
      const shuffledRightItems = this.shuffleArray([...rightItems])

      // Create new pairs with shuffled items
      this.matchingPairs = shuffledLeftItems.map((left, index) => {
        return {
          id: index,
          left: left,
          right: shuffledRightItems[index],
          selected: false,
          matched: false,
        }
      })
    }
  }

  selectMatchingPair(pair: MatchingPairWithId, side: "left" | "right"): void {
    if (this.showFeedback) return

    if (side === "left") {
      this.selectedLeftItem = pair.left
    } else if (side === "right" && this.selectedLeftItem) {
      const matchedPair = { left: this.selectedLeftItem, right: pair.right }
      this.selectedMatchingPairs.set(matchedPair.left, matchedPair.right)

      this.lastMatchedPair = matchedPair
      setTimeout((): void => {
        this.lastMatchedPair = null
      }, 1500)

      // Mark items as matched
      this.matchingPairs.forEach((p: MatchingPairWithId): void => {
        if (p.left === matchedPair.left || p.right === matchedPair.right) {
          p.matched = true
        }
      })

      this.selectedLeftItem = null

      // Check if all pairs are matched
      if (this.selectedMatchingPairs.size === this.matchingPairs.length) {
        setTimeout((): void => {
          this.checkMatchingPairs()
        }, 1000)
      }
    }
  }

  isMatchingItemSelected(pair: MatchingPairWithId, side: "left" | "right"): boolean {
    if (side === "left") {
      return this.selectedLeftItem === pair.left
    } else {
      return false
    }
  }

  isMatchingItemMatched(pair: MatchingPairWithId, side: "left" | "right"): boolean {
    if (side === "left") {
      return this.selectedMatchingPairs.has(pair.left)
    } else {
      return Array.from(this.selectedMatchingPairs.values()).includes(pair.right)
    }
  }

  checkMatchingPairs(): void {
    if (!this.currentQuestion || !this.currentQuestion.correctAnswer) return

    let allCorrect = true

    if (Array.isArray(this.currentQuestion.correctAnswer)) {
      // Create a map of correct pairs for easy lookup
      const correctPairs = new Map(
        (this.currentQuestion.correctAnswer as MatchingPair[]).map((pair: MatchingPair): [string, string] => [
          pair.left,
          pair.right,
        ]),
      )

      // Check if each selected pair matches the correct pairs
      for (const [left, right] of this.selectedMatchingPairs.entries()) {
        if (correctPairs.get(left) !== right) {
          allCorrect = false
          break
        }
      }

      // Make sure all pairs were matched
      if (this.selectedMatchingPairs.size !== correctPairs.size) {
        allCorrect = false
      }
    }

    this.isCorrect = allCorrect
    this.showFeedback = true

    if (this.isCorrect) {
      this.correctAnswers++
    }
  }

  setupWordOrderQuestion(): void {
    if (!this.currentQuestion || !this.currentQuestion.correctAnswer) return

    this.wordOrderItems = []
    this.selectedWordOrderItems = []

    if (Array.isArray(this.currentQuestion.options)) {
      const words = [...this.currentQuestion.options] as string[]
      this.wordOrderItems = this.shuffleArray(
        words.map((word: string, index: number) => ({
          word,
          order: index,
          selected: false,
        })),
      )
    }
  }

  selectWordOrderItem(word: string): void {
    if (this.showFeedback) return

    const index: number = this.selectedWordOrderItems.indexOf(word)
    if (index > -1) {
      this.selectedWordOrderItems.splice(index, 1)
      this.wordOrderItems.forEach((item: WordOrderItem): void => {
        if (item.word === word) {
          item.selected = false
        }
      })
    } else {
      this.selectedWordOrderItems.push(word)
      this.wordOrderItems.forEach((item: WordOrderItem): void => {
        if (item.word === word) {
          item.selected = true
        }
      })

      if (this.selectedWordOrderItems.length === this.wordOrderItems.length) {
        this.checkWordOrder()
      }
    }
  }

  checkWordOrder(): void {
    if (!this.currentQuestion || !this.currentQuestion.correctAnswer) return

    const correctOrder = this.currentQuestion.correctAnswer as string[]

    let allCorrect = true
    if (this.selectedWordOrderItems.length !== correctOrder.length) {
      allCorrect = false
    } else {
      for (let i = 0; i < correctOrder.length; i++) {
        if (this.selectedWordOrderItems[i] !== correctOrder[i]) {
          allCorrect = false
          break
        }
      }
    }

    this.isCorrect = allCorrect
    this.showFeedback = true

    if (this.isCorrect) {
      this.correctAnswers++
    }
  }

  resetWordOrder(): void {
    if (this.showFeedback) return

    this.selectedWordOrderItems = []
    this.wordOrderItems.forEach((item: WordOrderItem): void => {
      item.selected = false
    })
  }

  shuffleArray<T>(array: T[]): T[] {
    const newArray: T[] = [...array]
    for (let i: number = newArray.length - 1; i > 0; i--) {
      const j: number = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  getCorrectAnswerText(): string {
    if (!this.currentQuestion) return ""

    if (typeof this.currentQuestion.correctAnswer === "string") {
      return this.currentQuestion.correctAnswer
    } else if (Array.isArray(this.currentQuestion.correctAnswer)) {
      if (this.currentQuestion.type === "word-order") {
        return (this.currentQuestion.correctAnswer as string[]).join(" ")
      }
    }
    return ""
  }

  isMatchedPairCorrect(pair: MatchingPairWithId, side: "left" | "right"): boolean {
    if (!this.showFeedback || !this.currentQuestion || !this.currentQuestion.correctAnswer) {
      return false
    }

    if (Array.isArray(this.currentQuestion.correctAnswer)) {
      const correctPairs = new Map(
        (this.currentQuestion.correctAnswer as MatchingPair[]).map((pair: MatchingPair): [string, string] => [
          pair.left,
          pair.right,
        ]),
      )

      if (side === "left" && this.selectedMatchingPairs.has(pair.left)) {
        return correctPairs.get(pair.left) === this.selectedMatchingPairs.get(pair.left)
      } else if (side === "right") {
        for (const [left, right] of this.selectedMatchingPairs.entries()) {
          if (right === pair.right) {
            return correctPairs.get(left) === right
          }
        }
      }
    }

    return false
  }
}
