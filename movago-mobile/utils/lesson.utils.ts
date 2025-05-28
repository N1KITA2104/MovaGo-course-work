import type { LessonCategory, LessonDifficulty, Question, QuestionType } from "../types/lesson.types"
import type { ChartData } from "../types/lesson.types"

/**
 * Gets the label for a lesson difficulty level
 * @param difficulty - The difficulty level
 * @returns Localized difficulty label
 */
export const getDifficultyLabel = (difficulty: LessonDifficulty): string => {
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

export const getCategoryLabel: (category: LessonCategory | string) => string = (category: LessonCategory | string): string => {
    const categoryLabels: Record<string, string> = {
        vocabulary: "Словник",
        grammar: "Граматика",
        conversation: "Розмова",
        reading: "Читання",
        listening: "Аудіювання",
    }

    return categoryLabels[category as LessonCategory] || category
}

/**
 * Gets the color for a lesson difficulty level
 * @param difficulty - The difficulty level
 * @param colors - Theme colors object
 * @returns Color for the difficulty
 */
export const getDifficultyColor: (difficulty: LessonDifficulty, colors: any) => string = (difficulty: LessonDifficulty, colors: any): string => {
    switch (difficulty) {
        case "beginner":
            return colors.success
        case "intermediate":
            return colors.warning
        case "advanced":
            return colors.error
        default:
            return colors.secondaryText
    }
}

export const getCategoryColor: (category: LessonCategory | string) => string = (category: LessonCategory | string): string => {
    const categoryColors: Record<string, string> = {
        vocabulary: "#4CAF50",
        grammar: "#2196F3",
        conversation: "#9C27B0",
        reading: "#FF9800",
        listening: "#F44336",
    }

    return categoryColors[category as LessonCategory] || "#13AA52"
}

/**
 * Gets the label for a question type
 * @param type - The question type
 * @returns Localized question type label
 */
export const getQuestionTypeLabel = (type: QuestionType): string => {
    switch (type) {
        case "multiple-choice":
            return "Вибір варіанту"
        case "translation":
            return "Переклад"
        case "matching":
            return "Співставлення"
        case "word-order":
            return "Порядок слів"
        case "sentence-completion":
            return "Доповнення речення"
        case "image-match":
            return "Співставлення зображень"
        default:
            return type
    }
}

export const transformCategoryStatsToChartData: (categoryStats: any[]) => ChartData[] = (categoryStats: any[]): ChartData[] => {
    return categoryStats.map((stat) => ({
        label: getCategoryLabel(stat.category as LessonCategory),
        value: stat.completed,
        color: getCategoryColor(stat.category as LessonCategory),
    }))
}

/**
 * Checks if a user's answer is correct
 * @param userAnswer - The user's answer
 * @param question - The question object
 * @returns Boolean indicating if the answer is correct
 */
export const checkAnswer: (userAnswer: any, question: Question) => boolean = (userAnswer: any, question: Question): boolean => {
    if (!userAnswer) return false

    switch (question.type) {
        case "multiple-choice":
        case "sentence-completion":
            return userAnswer === question.correctAnswer

        case "translation":
            return (userAnswer as string).toLowerCase().trim() === (question.correctAnswer as string).toLowerCase().trim()

        case "matching":
            const sortedUserMatches: any[] = [...userAnswer].sort((a: any, b: any): any => a.left.localeCompare(b.left))
            const sortedCorrectMatches: any[] = [...(question.correctAnswer as any[])].sort((a: any, b: any): any =>
                a.left.localeCompare(b.left),
            )
            return JSON.stringify(sortedUserMatches) === JSON.stringify(sortedCorrectMatches)

        case "word-order":
            return JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)

        default:
            return false
    }
}
