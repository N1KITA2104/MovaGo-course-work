"use client"

import { useEffect, useState, useLayoutEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { api } from "../services/api"
import { useTheme } from "../contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { getCategoryLabel, getDifficultyLabel, getDifficultyColor } from "../utils/lesson.utils"
import type { LessonScreenRouteProp, LessonScreenNavigationProp } from "../types/navigation.types"
import type { Lesson } from "../types/lesson.types"

export default function LessonScreen() {
  const route = useRoute<LessonScreenRouteProp>()
  const { lessonId } = route.params
  const navigation = useNavigation<LessonScreenNavigationProp>()
  const { colors } = useTheme()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
          <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
      ),
    })
  }, [navigation, colors.text])

  useEffect((): void => {
    fetchLesson().then()
  }, [lessonId])

  const fetchLesson = async (): Promise<void> => {
    try {
      const response = await api.get(`/api/lessons/${lessonId}`)
      setLesson(response.data)
    } catch (error) {
      console.error("Error fetching lesson:", error)
    } finally {
      setLoading(false)
    }
  }

  const startLesson = (): void => {
    if (lesson) {
      navigation.navigate("LessonQuiz", { lesson })
    }
  }

  if (loading) {
    return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Завантаження уроку...</Text>
        </View>
    )
  }

  if (!lesson) {
    return (
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>Не вдалося завантажити урок</Text>
          <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.primary }]}
              onPress={(): void => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Повернутися до списку уроків</Text>
          </TouchableOpacity>
        </View>
    )
  }

  return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{lesson.icon}</Text>
          </View>
          <Text style={styles.title}>{lesson.title}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.tagsContainer}>
            <View style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(lesson.difficulty, colors) }]}>
              <Text style={styles.tagText}>{getDifficultyLabel(lesson.difficulty)}</Text>
            </View>

            <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
              <Text style={styles.tagText}>{getCategoryLabel(lesson.category)}</Text>
            </View>
          </View>

          <Text style={[styles.description, { color: colors.text }]}>{lesson.description}</Text>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoItem}>
              <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {lesson.questionsCount} питань у цьому уроці
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={24} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                Приблизний час: {lesson.questionsCount * 1.5} хвилин
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="trophy-outline" size={24} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>Отримайте {lesson.questionsCount * 10} XP за завершення</Text>
            </View>
          </View>

          <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} style={{ marginRight: 10 }} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>Повернутися до списку уроків</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.primary }]} onPress={startLesson}>
            <Text style={styles.startButtonText}>Почати урок</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginVertical: 20,
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    padding: 30,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  content: {
    padding: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  difficultyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: "#fff",
    fontWeight: "500",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  infoCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    borderWidth: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
  },
  startButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
})
