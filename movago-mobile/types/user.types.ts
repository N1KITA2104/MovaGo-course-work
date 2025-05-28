export interface ActivityCalendarEntry {
    date: Date
    completed: boolean
}

export interface UserProgress {
    completedLessons: string[]
    lessonCompletionCounts: Record<string, number>
    xp: number
    level: number
    streakDays: number
    activityCalendar: ActivityCalendarEntry[]
}

export interface User {
    _id: string
    username: string
    email: string
    password?: string
    description?: string
    profilePhoto?: string
    status: "active" | "inactive" | "pending"
    role: "user" | "admin" | "moderator"
    progress?: UserProgress
    createdAt: string
    updatedAt: string
}

export type UserRole = "user" | "admin" | "moderator"
export type UserStatus = "active" | "inactive" | "pending"
