"use client"
import { TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import type { ThemeToggleButtonProps } from "../types/component.types"

export default function ThemeToggleButton({}: ThemeToggleButtonProps) {
  const { theme, toggleTheme, colors, isDark } = useTheme()

  let iconName: keyof typeof Ionicons.glyphMap = "sunny-outline"

  if (theme === "system") {
    iconName = "contrast-outline"
  } else if (theme === "dark") {
    iconName = "moon-outline"
  } else {
    iconName = "sunny-outline"
  }

  return (
      <TouchableOpacity style={styles.button} onPress={toggleTheme} accessibilityLabel="Переключити тему">
        <Ionicons name={iconName} size={24} color={colors.text} />
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    marginRight: 10,
  },
})
