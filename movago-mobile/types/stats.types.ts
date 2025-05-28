/**
 * Interface for system statistics
 */
export interface SystemStats {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    pendingUsers: number
    totalLessons: number
    completedLessonsCount: number
    averageXp: number
    averageLevel: number
    averageStreak: number
    usersByRole: UsersByRole
    lessonsByCategory: LessonsByCategory
    lessonsByDifficulty: LessonsByDifficulty
    topCompletedLessons: TopCompletedLesson[]
    recentActivity: RecentActivity[]
}

/**
 * Interface for user role statistics
 */
export interface UsersByRole {
    admin: number
    moderator: number
    user: number
}

/**
 * Interface for lesson category statistics
 */
export interface LessonsByCategory {
    vocabulary: number
    grammar: number
    conversation: number
    reading: number
    listening: number
}

/**
 * Interface for lesson difficulty statistics
 */
export interface LessonsByDifficulty {
    beginner: number
    intermediate: number
    advanced: number
}

/**
 * Interface for top completed lessons
 */
export interface TopCompletedLesson {
    id: string
    title: string
    completions: number
}

/**
 * Interface for recent activity
 */
export interface RecentActivity {
    userId: string
    username: string
    action: string
    timestamp: string
}

/**
 * Interface for pie chart data item
 */
export interface PieChartDataItem {
    name: string
    population: number
    color: string
    legendFontColor: string
    legendFontSize: number
}

/**
 * Interface for user status data
 */
export interface UserStatusData extends Array<PieChartDataItem> {}

/**
 * Interface for user role data
 */
export interface UserRoleData extends Array<PieChartDataItem> {}

/**
 * Interface for lesson difficulty data
 */
export interface LessonDifficultyData extends Array<PieChartDataItem> {}
