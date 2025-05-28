"use client"

import { useState, useContext, useLayoutEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { api } from "../services/api"
import { useTheme } from "../contexts/ThemeContext"
import { AuthContext } from "../contexts/AuthContext"
import { checkAnswer } from "../utils/lesson.utils"
import { Ionicons } from "@expo/vector-icons"

import MultipleChoiceQuestion from "../components/quiz/MultipleChoiceQuestion"
import TranslationQuestion from "../components/quiz/TranslationQuestion"
import MatchingQuestion from "../components/quiz/MatchingQuestion"
import WordOrderQuestion from "../components/quiz/WordOrderQuestion"
import SentenceCompletionQuestion from "../components/quiz/SentenceCompletionQuestion"
import type { LessonQuizScreenRouteProp, LessonQuizScreenNavigationProp } from "../types/navigation.types"

export default function LessonQuizScreen() {
  const route = useRoute<LessonQuizScreenRouteProp>()
  const { lesson } = route.params
  const navigation = useNavigation<LessonQuizScreenNavigationProp>()
  const { colors } = useTheme()
  const { refreshUserData } = useContext(AuthContext)

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
          <TouchableOpacity
              style={{ marginLeft: 10 }}
              onPress={() => {
                Alert.alert("Вийти з уроку", "Ви впевнені, що хочете вийти? Ваш прогрес буде втрачено.", [
                  { text: "Скасувати", style: "cancel" },
                  { text: "Вийти", style: "destructive", onPress: () => navigation.goBack() },
                ])
              }}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
      ),
    })
  }, [navigation, colors.text])

  const currentQuestion = lesson.questions[currentQuestionIndex]
  const totalQuestions = lesson.questions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  const handleAnswer = (answer: any): void => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answer,
    })
  }

  const checkCurrentAnswer = (): void => {
    const userAnswer = answers[currentQuestionIndex]
    if (!userAnswer) {
      Alert.alert("Увага", "Будь ласка, дайте відповідь на запитання")
      return
    }

    const question = lesson.questions[currentQuestionIndex]
    const correct = checkAnswer(userAnswer, question)

    setIsCorrect(correct)
    if (correct) {
      setScore(score + 1)
      setShowHint(false)
    } else {
      setShowHint(true)
    }
  }

  const goToNextQuestion = (): void => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setIsCorrect(null)
      setShowHint(false)
      const nextAnswers = { ...answers }
      delete nextAnswers[currentQuestionIndex + 1]
      setAnswers(nextAnswers)
    } else {
      setShowResults(true)
    }
  }

  const submitLesson = async (): Promise<void> => {
    setIsSubmitting(true)
    try {
      const earnedXP = score * 10

      await api.post("/api/auth/complete-lesson", {
        lessonId: lesson._id,
        xp: earnedXP,
      })

      await refreshUserData()

      navigation.navigate("LessonResults", {
        score,
        totalQuestions,
        lessonTitle: lesson.title,
        earnedXP,
      })
    } catch (error) {
      console.error("Error submitting lesson:", error)
      Alert.alert("Помилка", "Не вдалося зберегти результати уроку")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    const hint = currentQuestion.hint || "Спробуйте ще раз. Уважно прочитайте питання."

    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
            <MultipleChoiceQuestion
                question={currentQuestion.question}
                options={currentQuestion.options as string[]}
                onAnswer={handleAnswer}
                selectedAnswer={answers[currentQuestionIndex]}
                isCorrect={isCorrect}
                hint={hint}
                showHint={showHint && isCorrect === false}
            />
        )
      case "translation":
        return (
            <TranslationQuestion
                question={currentQuestion.question}
                onAnswer={handleAnswer}
                answer={answers[currentQuestionIndex] || ""}
                isCorrect={isCorrect}
                hint={hint}
                showHint={showHint && isCorrect === false}
                correctAnswer={currentQuestion.correctAnswer as string}
            />
        )
      case "matching":
        return (
            <MatchingQuestion
                question={currentQuestion.question}
                options={currentQuestion.options as any}
                onAnswer={handleAnswer}
                selectedMatches={answers[currentQuestionIndex] || []}
                isCorrect={isCorrect}
                hint={hint}
                showHint={showHint && isCorrect === false}
            />
        )
      case "word-order":
        return (
            <WordOrderQuestion
                question={currentQuestion.question}
                options={currentQuestion.options as string[]}
                onAnswer={handleAnswer}
                selectedOrder={answers[currentQuestionIndex] || []}
                isCorrect={isCorrect}
                hint={hint}
                showHint={showHint && isCorrect === false}
            />
        )
      case "sentence-completion":
        return (
            <SentenceCompletionQuestion
                question={currentQuestion.question}
                options={currentQuestion.options as string[]}
                onAnswer={handleAnswer}
                selectedAnswer={answers[currentQuestionIndex]}
                isCorrect={isCorrect}
                hint={hint}
                showHint={showHint && isCorrect === false}
            />
        )
      default:
        return (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.text }]}>
                Непідтримуваний тип питання: {currentQuestion.type}
              </Text>
            </View>
        )
    }
  }

  if (showResults) {
    return (
        <View style={[styles.resultsContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.resultsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.resultsTitle, { color: colors.text }]}>Урок завершено!</Text>
            <Text style={[styles.resultsScore, { color: colors.primary }]}>
              {score} / {totalQuestions}
            </Text>
            <Text style={[styles.resultsText, { color: colors.text }]}>
              Ви відповіли правильно на {Math.round((score / totalQuestions) * 100)}% питань
            </Text>
            <Text style={[styles.resultsText, { color: colors.primary, fontWeight: "bold" }]}>
              Зароблено XP: {score * 10}
            </Text>

            <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={submitLesson}
                disabled={isSubmitting}
            >
              {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
              ) : (
                  <Text style={styles.submitButtonText}>Зберегти результати</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
    )
  }

  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.secondaryText }]}>
            {currentQuestionIndex + 1} / {totalQuestions}
          </Text>
        </View>

        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
          {renderQuestion()}
        </ScrollView>

        <View style={styles.footer}>
          {isCorrect === null ? (
              <TouchableOpacity
                  style={[styles.checkButton, { backgroundColor: colors.primary }]}
                  onPress={checkCurrentAnswer}
              >
                <Text style={styles.checkButtonText}>Перевірити</Text>
              </TouchableOpacity>
          ) : (
              <TouchableOpacity
                  style={[styles.checkButton, { backgroundColor: isCorrect ? colors.success : colors.error }]}
                  onPress={goToNextQuestion}
              >
                <Text style={styles.checkButtonText}>{isCorrect ? "Правильно! Далі" : "Далі"}</Text>
              </TouchableOpacity>
          )}
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    padding: 15,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: "right",
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  checkButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  resultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultsCard: {
    width: "100%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  resultsScore: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
})
