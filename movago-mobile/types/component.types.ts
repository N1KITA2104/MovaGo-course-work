import type { ReactNode } from "react"
import type { Lesson, MatchingPair, Question } from "./lesson.types"

export interface AchievementCardProps {
    title: string
    description: string
    icon: string
    progress?: number
    isCompleted?: boolean
}

export interface ActivityCalendarProps {
    activityDates: Date[]
}

export interface LessonCardProps {
    lesson: Lesson
    onPress: (lessonId: string) => void
}

export interface ProgressChartProps {
    data: {
        label: string
        value: number
        color: string
    }[]
    title?: string
}

export interface MultipleChoiceQuestionProps {
    question: string
    options: string[]
    onAnswer: (answer: string) => void
    selectedAnswer: string | null
    isCorrect: boolean | null
    hint?: string
    showHint?: boolean
}

export interface TranslationQuestionProps {
    question: string
    onAnswer: (answer: string) => void
    answer: string
    isCorrect: boolean | null
    hint?: string
    showHint?: boolean
    correctAnswer?: string
}

export interface MatchingQuestionProps {
    question: string
    options: MatchingPair[]
    onAnswer: (matches: MatchingPair[]) => void
    selectedMatches: MatchingPair[]
    isCorrect: boolean | null
    hint?: string
    showHint?: boolean
}

export interface WordOrderQuestionProps {
    question: string
    options: string[]
    onAnswer: (order: string[]) => void
    selectedOrder: string[]
    isCorrect: boolean | null
    hint?: string
    showHint?: boolean
}

export interface SentenceCompletionQuestionProps {
    question: string
    options: string[]
    onAnswer: (answer: string) => void
    selectedAnswer: string | null
    isCorrect: boolean | null
    hint?: string
    showHint?: boolean
}

export interface QuestionFormComponentProps {
    question: Question
    onUpdate: (question: Question) => void
}

export interface EmojiSelectorProps {
    onSelect: (emoji: string) => void
    onClose: () => void
}

export type ThemeToggleButtonProps = {}

export interface ProviderProps {
    children: ReactNode
}
