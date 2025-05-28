export interface MatchingPair {
  left: string
  right: string
}

export interface ImageMatchItem {
  image: string
  word: string
}

export interface WordOrderItem {
  word: string
  order: number
}

export interface Question {
  id: number
  type: "multiple-choice" | "translation" | "matching" | "word-order" | "sentence-completion" | "image-match"
  question: string
  correctAnswer: string | string[] | MatchingPair[] | WordOrderItem[]
  options?: string[] | MatchingPair[] | ImageMatchItem[]
  hint?: string
  media?: string
}

export interface Lesson {
  _id?: string
  id: number
  title: string
  description: string
  icon: string
  difficulty: "beginner" | "intermediate" | "advanced"
  category?: "vocabulary" | "grammar" | "conversation" | "reading" | "listening"
  order?: number
  questions: Question[]
  questionBank?: Question[]
  questionsCount?: number
  completed: boolean
  completedCount: number
  isPublished?: boolean
  tags?: string[]
}
