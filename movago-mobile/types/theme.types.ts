export type ThemeType = "light" | "dark" | "system"

export interface ThemeColors {
    primary: string
    background: string
    card: string
    text: string
    border: string
    notification: string
    secondaryText: string
    accent: string
    success: string
    error: string
    warning: string
    info: string
}

export interface ThemeContextType {
    theme: ThemeType
    isDark: boolean
    setTheme: (theme: ThemeType) => void
    toggleTheme: () => void
    colors: ThemeColors
}
