export type LessonDifficulty = "beginner" | "intermediate" | "advanced"
export type LessonCategory = "vocabulary" | "grammar" | "conversation" | "reading" | "listening"
export type QuestionType =
    | "multiple-choice"
    | "translation"
    | "matching"
    | "word-order"
    | "sentence-completion"
    | "image-match"

export interface MatchingPair {
    left: string
    right: string
}

export interface Question {
    _id?: string
    id?: number
    question: string
    correctAnswer: string | string[] | MatchingPair[]
    options: string[] | MatchingPair[]
    hint?: string
    type: QuestionType
    media?: string
}

export interface Lesson {
    _id: string
    title: string
    description: string
    icon: string
    difficulty: LessonDifficulty
    category: LessonCategory
    order: number
    isPublished: boolean
    questions: Question[]
    questionsCount: number
    tags: string[]
    completed?: boolean
    completedCount?: number
    createdAt?: string
    updatedAt?: string
}

export interface CategoryStat {
    category: LessonCategory
    total: number
    completed: number
    progress: number
}

export interface ChartData {
    label: string
    value: number
    color: string
}
