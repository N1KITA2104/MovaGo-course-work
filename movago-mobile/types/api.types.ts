import type { AxiosRequestConfig } from "axios"
import type { User } from "./user.types"
import type { Lesson, CategoryStat } from "./lesson.types"

export interface ApiResponse<T> {
    data: T
    status: number
    statusText: string
    headers: Record<string, string>
    config: AxiosRequestConfig
}

export interface ErrorResponse {
    message: string
    error?: string
    errors?: Array<{ field: string; message: string }>
}

export interface UsersResponse {
    users: User[]
}

export interface LessonsResponse {
    lessons: Lesson[]
}

export interface CategoryStatsResponse {
    categoryStats: CategoryStat[]
}

export interface RecommendedLessonsResponse {
    recommendedLessons: Lesson[]
}

export interface RecentLessonsResponse {
    recentLessons: Lesson[]
}

export interface CompleteLessonRequest {
    lessonId: string
    xp?: number
}

export interface CompleteLessonResponse {
    message: string
    user: User
}

export interface UpdateProfileRequest {
    username?: string
    email?: string
    description?: string
}

export interface UpdateUserRoleRequest {
    role: "user" | "admin" | "moderator"
}

export interface UpdateUserStatusRequest {
    status: "active" | "inactive" | "pending"
}
