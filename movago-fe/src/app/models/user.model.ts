export interface LessonCompletionCounts {
  [lessonId: string]: number
}

export interface ActivityDay {
  date: Date
  completed: boolean
}

export interface UserProgress {
  completedLessons: string[]
  lessonCompletionCounts: LessonCompletionCounts
  xp: number
  level: number
  streakDays: number
  activityCalendar: ActivityDay[]
}

export interface User {
  _id?: string
  username: string
  email: string
  password?: string
  createdAt?: Date
  description?: string
  profilePhoto?: string
  status: "active" | "inactive" | "pending"
  role: string
  progress: UserProgress
  _originalStatus?: string
}

