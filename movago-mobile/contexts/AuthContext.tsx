"use client"

import {createContext, useState, useEffect, useContext, useCallback, Context} from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { api } from "../services/api"
import axios, {AxiosResponse} from "axios"
import type { ReactNode } from "react"
import type { AuthContextData } from "../types/auth.types"
import type { User } from "../types/user.types"
import { isTokenExpired } from "../utils/auth.utils"

export const AuthContext: Context<AuthContextData> = createContext<AuthContextData>({} as AuthContextData)

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect((): void => {
    async function loadStorageData(): Promise<void> {
      try {
        const storedToken: string | null = await AsyncStorage.getItem("@Movago:token")

        if (storedToken) {
          if (isTokenExpired(storedToken)) {
            await AsyncStorage.removeItem("@Movago:token")
            setLoading(false)
            return
          }

          api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`
          try {
            const response: AxiosResponse<any, any> = await api.get("/api/auth/profile")
            setUser(response.data.user)
            setIsAuthenticated(true)
          } catch (error) {
            await AsyncStorage.removeItem("@Movago:token")
            api.defaults.headers.common["Authorization"] = ""
          }
        }
      } catch (error) {
        console.error("Error loading storage data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStorageData().then()
  }, [])

  async function login(email: string, password: string): Promise<void> {
    try {
      const response: AxiosResponse<any, any> = await api.post("/api/auth/login", { email, password })
      const { token } = response.data

      await AsyncStorage.setItem("@Movago:token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      const userResponse: AxiosResponse<any, any> = await api.get("/api/auth/profile")
      setUser(userResponse.data.user)
      setIsAuthenticated(true)
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Помилка входу")
      } else if (error.request) {
        throw new Error("Помилка мережі. Перевірте підключення до Інтернету")
      } else {
        throw error
      }
    }
  }

  const logout: () => Promise<void> = useCallback(async (): Promise<void> => {
    try {
      setIsAuthenticated(false)
      setUser(null)
      api.defaults.headers.common["Authorization"] = ""
      await AsyncStorage.removeItem("@Movago:token")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }, [])

  async function register(username: string, email: string, password: string): Promise<void> {
    try {
      await api.post("/api/auth/register", { username, email, password })
      await login(email, password)
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Помилка реєстрації")
      } else if (error.request) {
        throw new Error("Помилка мережі. Перевірте підключення до Інтернету")
      } else {
        throw error
      }
    }
  }

  const refreshUserData: () => Promise<User | null> = useCallback(async (): Promise<User | null> => {
    if (!isAuthenticated) return null

    try {
      const response: AxiosResponse<any, any> = await api.get("/api/auth/profile")
      setUser(response.data.user)
      return response.data.user
    } catch (error) {
      console.error("Error refreshing user data:", error)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await logout()
      }
      throw error
    }
  }, [isAuthenticated, logout])

  return (
      <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, register, refreshUserData }}>
        {children}
      </AuthContext.Provider>
  )
}

export const useAuth: () => AuthContextData = (): AuthContextData => useContext(AuthContext)

export default AuthProvider
