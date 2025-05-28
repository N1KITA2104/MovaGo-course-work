"use client"
import { View, Text, StyleSheet } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import type { AchievementCardProps } from "../types/component.types"

export default function AchievementCard({
                                          title,
                                          description,
                                          icon,
                                          progress = 0,
                                          isCompleted = false,
                                        }: AchievementCardProps) {
  const { colors } = useTheme()

  return (
      <View
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderLeftColor: isCompleted ? colors.success : colors.primary,
            },
          ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: isCompleted ? colors.success : colors.primary }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.secondaryText }]}>{description}</Text>

          {!isCompleted && progress > 0 && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.secondaryText }]}>
                  {Number.isInteger(progress) ? progress : progress.toFixed(2)}%
                </Text>
              </View>
          )}
        </View>

        {isCompleted && (
            <View style={[styles.completedBadge, { backgroundColor: colors.success }]}>
              <Text style={styles.completedText}>✓</Text>
            </View>
        )}
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  icon: {
    fontSize: 24,
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  completedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  completedText: {
    color: "#fff",
    fontWeight: "bold",
  },
})
