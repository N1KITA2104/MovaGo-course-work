import type { RouteProp } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { Lesson } from "./lesson.types"

// Main Stack
export type RootStackParamList = {
    Login: undefined
    Register: undefined
    ForgotPassword: undefined
    VerifyResetCode: { email: string }
    ResetPassword: { email: string; resetToken: string }
    Home: undefined
    Lessons: undefined
    Profile: undefined
    LessonsList: undefined
    Lesson: { lessonId: string }
    LessonQuiz: { lesson: Lesson }
    LessonResults: {
        score: number
        totalQuestions: number
        lessonTitle: string
        earnedXP?: number
    }
    EditProfile: undefined
    Settings: undefined
    AdminPanelRoot: undefined
}

// Admin Stack
export type AdminStackParamList = {
    AdminPanel: undefined
    UsersManagement: undefined
    UserDetails: { userId: string }
    SystemStats: undefined
    LessonsManagement: undefined
    LessonForm: { lessonId: string | null }
}

// Profile Stack
export type ProfileStackParamList = {
    ProfileMain: undefined
    EditProfile: undefined
    Settings: undefined
    AdminPanelRoot: undefined
}

// Lessons Stack
export type LessonsStackParamList = {
    LessonsList: undefined
    Lesson: { lessonId: string }
    LessonQuiz: { lesson: Lesson }
    LessonResults: {
        score: number
        totalQuestions: number
        lessonTitle: string
        earnedXP?: number
    }
}

// Navigation Props
export type LessonScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Lesson">
export type LessonScreenRouteProp = RouteProp<RootStackParamList, "Lesson">

export type LessonQuizScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "LessonQuiz">
export type LessonQuizScreenRouteProp = RouteProp<RootStackParamList, "LessonQuiz">

export type LessonResultsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "LessonResults">
export type LessonResultsScreenRouteProp = RouteProp<RootStackParamList, "LessonResults">

export type UserDetailsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList, "UserDetails">
export type UserDetailsScreenRouteProp = RouteProp<AdminStackParamList, "UserDetails">

export type LessonFormScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList, "LessonForm">
export type LessonFormScreenRouteProp = RouteProp<AdminStackParamList, "LessonForm">

export type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "ForgotPassword">

export type VerifyResetCodeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "VerifyResetCode">
export type VerifyResetCodeScreenRouteProp = RouteProp<RootStackParamList, "VerifyResetCode">

export type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "ResetPassword">
export type ResetPasswordScreenRouteProp = RouteProp<RootStackParamList, "ResetPassword">
