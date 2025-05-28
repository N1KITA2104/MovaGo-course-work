"use client"

import { createContext, useState, useEffect, useContext } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useColorScheme } from "react-native"
import type { ReactNode } from "react"
import type { ThemeContextType, ThemeType } from "../types/theme.types"

export const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
  colors: {
    primary: "#13AA52",
    background: "#FFFFFF",
    card: "#FFFFFF",
    text: "#000000",
    border: "#EEEEEE",
    notification: "#FF3B30",
    secondaryText: "#666666",
    accent: "#13AA52",
    success: "#4CAF50",
    error: "#FF5252",
    warning: "#FFC107",
    info: "#2196F3",
  },
})

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme()
  const [theme, setThemeState] = useState<ThemeType>("system")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("@Movago:theme")
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType)
        }
        setIsLoaded(true)
      } catch (error) {
        console.error("Failed to load theme", error)
        setIsLoaded(true)
      }
    }

    loadTheme().then()
  }, [])

  const setTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem("@Movago:theme", newTheme)
      setThemeState(newTheme)
    } catch (error) {
      console.error("Failed to save theme", error)
    }
  }

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(isDark ? "light" : "dark").then()
    } else if (theme === "light") {
      setTheme("dark").then()
    } else {
      setTheme("system").then()
    }
  }

  const isDark = theme === "system" ? systemColorScheme === "dark" : theme === "dark"

  const lightColors = {
    primary: "#13AA52",
    background: "#FFFFFF",
    card: "#FFFFFF",
    text: "#000000",
    border: "#EEEEEE",
    notification: "#FF3B30",
    secondaryText: "#666666",
    accent: "#13AA52",
    success: "#4CAF50",
    error: "#FF5252",
    warning: "#FFC107",
    info: "#2196F3",
  }

  const darkColors = {
    primary: "#13AA52",
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    border: "#333333",
    notification: "#FF453A",
    secondaryText: "#AAAAAA",
    accent: "#13AA52",
    success: "#4CAF50",
    error: "#FF5252",
    warning: "#FFC107",
    info: "#2196F3",
  }

  const colors = isDark ? darkColors : lightColors

  if (!isLoaded) {
    return null
  }

  return (
      <ThemeContext.Provider
          value={{
            theme,
            isDark,
            setTheme,
            toggleTheme,
            colors,
          }}
      >
        {children}
      </ThemeContext.Provider>
  )
}

export const useTheme: () => ThemeContextType = (): ThemeContextType => useContext(ThemeContext)
