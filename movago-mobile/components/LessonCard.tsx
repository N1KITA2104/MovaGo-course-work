"use client"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import type { LessonCardProps } from "../types/component.types"
import { getCategoryLabel, getDifficultyLabel, getDifficultyColor } from "../utils/lesson.utils"

export default function LessonCard({ lesson, onPress }: LessonCardProps) {
  const { colors } = useTheme()

  return (
      <TouchableOpacity
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              borderLeftColor: lesson.completed ? colors.success : colors.primary,
              shadowColor: colors.text,
            },
          ]}
          onPress={(): void => onPress(lesson._id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
          <Text style={styles.icon}>{lesson.icon}</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{lesson.title}</Text>
          <Text style={[styles.description, { color: colors.secondaryText }]} numberOfLines={2}>
            {lesson.description}
          </Text>

          <View style={styles.tags}>
            <View style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(lesson.difficulty, colors) }]}>
              <Text style={styles.tagText}>{getDifficultyLabel(lesson.difficulty)}</Text>
            </View>

            <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
              <Text style={styles.tagText}>{getCategoryLabel(lesson.category)}</Text>
            </View>
          </View>
        </View>

        {lesson.completed && (
            <View style={[styles.completedBadge, { backgroundColor: colors.success }]}>
              <Text style={styles.completedText}>✓</Text>
            </View>
        )}
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
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
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
  },
  tags: {
    flexDirection: "row",
  },
  difficultyTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
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
