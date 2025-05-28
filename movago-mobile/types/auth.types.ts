import type { User } from "./user.types"

export interface AuthContextData {
    isAuthenticated: boolean
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    register: (username: string, email: string, password: string) => Promise<void>
    refreshUserData: () => Promise<User | null>
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterCredentials {
    username: string
    email: string
    password: string
}

export interface AuthResponse {
    token: string
}

export interface UserResponse {
    user: User
}
