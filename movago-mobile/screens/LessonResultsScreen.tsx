"use client"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTheme } from "../contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"
import type { LessonsStackParamList } from "../types/navigation.types"

type LessonResultsScreenNavigationProp = NativeStackNavigationProp<LessonsStackParamList, "LessonResults">
type LessonResultsScreenRouteProp = RouteProp<LessonsStackParamList, "LessonResults">

export default function LessonResultsScreen() {
  const route = useRoute<LessonResultsScreenRouteProp>()
  const { score, totalQuestions, lessonTitle, earnedXP = score * 10 } = route.params

  const navigation = useNavigation<LessonResultsScreenNavigationProp>()
  const { colors } = useTheme()

  const percentage: number = Math.round((score / totalQuestions) * 100)

  const getResultMessage = (): string => {
    if (percentage >= 90) {
      return "Відмінно! Ви чудово впоралися з уроком!"
    } else if (percentage >= 70) {
      return "Добре! Ви успішно пройшли урок."
    } else if (percentage >= 50) {
      return "Непогано! Але є над чим попрацювати."
    } else {
      return "Спробуйте ще раз. Практика веде до досконалості!"
    }
  }

  const getResultIcon = (): keyof typeof Ionicons.glyphMap => {
    if (percentage >= 90) {
      return "trophy"
    } else if (percentage >= 70) {
      return "thumbs-up"
    } else if (percentage >= 50) {
      return "happy"
    } else {
      return "refresh"
    }
  }

  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name={getResultIcon()} size={80} color={colors.primary} />

          <Text style={[styles.title, { color: colors.text }]}>Урок завершено!</Text>
          <Text style={[styles.lessonTitle, { color: colors.primary }]}>{lessonTitle}</Text>

          <View style={styles.resultContainer}>
            <Text style={[styles.score, { color: colors.text }]}>
              {score} / {totalQuestions}
            </Text>
            <Text style={[styles.percentage, { color: colors.primary }]}>{percentage}%</Text>
          </View>

          <Text style={[styles.message, { color: colors.text }]}>{getResultMessage()}</Text>

          <View style={[styles.xpContainer, { backgroundColor: colors.background }]}>
            <Ionicons name="star" size={24} color={colors.warning} />
            <Text style={[styles.xpText, { color: colors.text }]}>+{earnedXP} XP</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate("LessonsList")}
            >
              <Text style={styles.buttonText}>Повернутися до уроків</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.secondaryButton, { borderColor: colors.primary }]}
                onPress={() => navigation.navigate("LessonsList")}
            >
              <Text style={[styles.buttonText, { color: colors.primary }]}>На головну</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 5,
  },
  lessonTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  resultContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  score: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 5,
  },
  percentage: {
    fontSize: 24,
    fontWeight: "bold",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  xpContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
  },
  xpText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 5,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})
