"use client"

import { useState, useEffect, useRef, type RefObject } from "react"
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native"
import { useTheme } from "../../contexts/ThemeContext"
import { api } from "../../services/api"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import EmojiSelector from "../admin/EmojiSelector"
import QuestionFormComponent from "../admin/QuestionFormComponent"
import type { AxiosResponse } from "axios"
import type { Question, QuestionType } from "../../types/lesson.types"
import Slider from '@react-native-community/slider';

interface Lesson {
  _id?: string
  title: string
  description: string
  icon: string
  difficulty: string
  category: string
  order: number
  isPublished: boolean
  questions: Question[]
  questionsCount: number
  tags: string[]
}

export default function LessonFormScreen() {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const route = useRoute()
  const { lessonId } = route.params as { lessonId: string | null }
  const [isNewLesson] = useState(!lessonId)

  const [lesson, setLesson] = useState<Lesson>({
    title: "",
    description: "",
    icon: "📚",
    difficulty: "beginner",
    category: "vocabulary",
    order: 0,
    isPublished: false,
    questions: [],
    questionsCount: 5,
    tags: [],
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showEmojiSelector, setShowEmojiSelector] = useState(false)
  const [currentTag, setCurrentTag] = useState("")
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null)

  const scrollViewRef: RefObject<ScrollView> = useRef<ScrollView>(null)

  useEffect((): void => {
    if (lessonId) {
      fetchLesson().then()
    } else {
      setLoading(false)
    }
  }, [lessonId])

  const fetchLesson: () => Promise<void> = async (): Promise<void> => {
    try {
      const response: AxiosResponse<any, any> = await api.get(`/api/lessons/${lessonId}`)
      setLesson(response.data)
    } catch (error) {
      console.error("Error fetching lesson:", error)
      Alert.alert("Помилка", "Не вдалося завантажити дані уроку")
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const handleSave: (publish?: boolean) => Promise<void> = async (publish = false): Promise<void> => {
    const validationErrors: any[] = []

    if (!lesson.title.trim()) {
      validationErrors.push("Назва уроку обов'язкова")
    } else if (lesson.title.length > 100) {
      validationErrors.push("Назва уроку занадто довга (максимум 100 символів)")
    }

    if (!lesson.description.trim()) {
      validationErrors.push("Опис уроку обов'язковий")
    } else if (lesson.description.length > 500) {
      validationErrors.push("Опис уроку занадто довгий (максимум 500 символів)")
    }

    if (lesson.questions.length === 0) {
      validationErrors.push("Додайте хоча б одне питання")
    }

    for (let i = 0; i < lesson.questions.length; i++) {
      const q: Question = lesson.questions[i]

      if (!q.question.trim()) {
        validationErrors.push(`Питання ${i + 1}: Текст питання обов'язковий`)
        continue
      }

      if (q.type === "multiple-choice") {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          validationErrors.push(`Питання ${i + 1}: Додайте хоча б 2 варіанти відповіді`)
        } else if (!q.correctAnswer) {
          validationErrors.push(`Питання ${i + 1}: Виберіть правильну відповідь`)
        }
      }

      if (q.type === "translation" && !q.correctAnswer) {
        validationErrors.push(`Питання ${i + 1}: Додайте правильну відповідь`)
      }

      if (q.type === "matching" && Array.isArray(q.options)) {
        const pairs = q.options as { left: string; right: string }[]
        if (pairs.length < 2) {
          validationErrors.push(`Питання ${i + 1}: Додайте хоча б 2 пари для співставлення`)
        } else {
          for (let j = 0; j < pairs.length; j++) {
            if (!pairs[j].left.trim() || !pairs[j].right.trim()) {
              validationErrors.push(`Питання ${i + 1}: Заповніть обидві частини пари ${j + 1}`)
              break
            }
          }
        }
      }
    }

    if (validationErrors.length > 0) {
      Alert.alert("Помилка валідації", validationErrors.join("\n"))
      return
    }

    setSaving(true)

    try {
      const sanitizedLesson = {
        ...lesson,
        title: lesson.title.trim(),
        description: lesson.description.trim(),
        isPublished: publish || lesson.isPublished,
        questions: lesson.questions.map((q: Question) => ({
          ...q,
          question: q.question.trim(),
          hint: q.hint ? q.hint.trim() : "",
          correctAnswer: typeof q.correctAnswer === "string" ? q.correctAnswer.trim() : q.correctAnswer,
          options:
              Array.isArray(q.options) && typeof q.options[0] === "string"
                  ? (q.options as string[]).map((opt: string): string => opt.trim())
                  : q.options,
        })),
      }

      if (isNewLesson) {
        await api.post("/api/lessons", sanitizedLesson)
      } else {
        await api.put(`/api/lessons/${lessonId}`, sanitizedLesson)
      }

      Alert.alert(
          "Успіх",
          isNewLesson ? "Урок створено успішно" : `Урок ${publish ? "опубліковано" : "збережено"} успішно`,
          [
            {
              text: "OK",
              onPress: (): void => navigation.goBack(),
            },
          ],
      )
    } catch (error: any) {
      console.error("Error saving lesson:", error)

      let errorMessage = "Не вдалося зберегти урок"
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      Alert.alert("Помилка", errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleEmojiSelect: (emoji: string) => void = (emoji: string): void => {
    setLesson({ ...lesson, icon: emoji })
    setShowEmojiSelector(false)
  }

  const handleAddTag: () => void = (): void => {
    if (currentTag.trim() && !lesson.tags.includes(currentTag.trim())) {
      setLesson({
        ...lesson,
        tags: [...lesson.tags, currentTag.trim()],
      })
      setCurrentTag("")
    }
  }

  const handleRemoveTag: (tag: string) => void = (tag: string): void => {
    setLesson({
      ...lesson,
      tags: lesson.tags.filter((t: string): boolean => t !== tag),
    })
  }

  const handleAddQuestion: () => void = (): void => {
    const newQuestion: Question = {
      question: "",
      correctAnswer: "",
      options: [],
      type: "multiple-choice" as QuestionType,
      hint: "",
    }

    setLesson({
      ...lesson,
      questions: [...lesson.questions, newQuestion],
    })

    setEditingQuestionIndex(lesson.questions.length)

    setTimeout((): void => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  const handleUpdateQuestion = (index: number, updatedQuestion: Question): void => {
    const updatedQuestions: Question[] = [...lesson.questions]
    updatedQuestions[index] = updatedQuestion
    setLesson({
      ...lesson,
      questions: updatedQuestions,
    })
  }

  const handleRemoveQuestion: (index: number) => void = (index: number): void => {
    Alert.alert("Видалити питання", "Ви впевнені, що хочете видалити це питання?", [
      { text: "Скасувати", style: "cancel" },
      {
        text: "Видалити",
        style: "destructive",
        onPress: (): void => {
          const updatedQuestions: Question[] = [...lesson.questions]
          updatedQuestions.splice(index, 1)
          setLesson({
            ...lesson,
            questions: updatedQuestions,
          })
          setEditingQuestionIndex(null)
        },
      },
    ])
  }

  const getQuestionTypeLabel: (type: string) => string = (type: string): string => {
    switch (type) {
      case "multiple-choice":
        return "Вибір варіанту"
      case "translation":
        return "Переклад"
      case "matching":
        return "Співставлення"
      case "word-order":
        return "Порядок слів"
      case "sentence-completion":
        return "Доповнення речення"
      default:
        return type
    }
  }

  if (loading) {
    return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
            {isNewLesson ? "Підготовка форми..." : "Завантаження уроку..."}
          </Text>
        </View>
    )
  }

  return (
      <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
            ref={scrollViewRef}
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Основна інформація</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Назва уроку *</Text>
              <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
                  value={lesson.title}
                  onChangeText={(text) => setLesson({ ...lesson, title: text })}
                  placeholder="Введіть назву уроку"
                  placeholderTextColor={colors.secondaryText}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Опис *</Text>
              <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  value={lesson.description}
                  onChangeText={(text) => setLesson({ ...lesson, description: text })}
                  placeholder="Введіть опис уроку"
                  placeholderTextColor={colors.secondaryText}
                  multiline
                  numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Іконка</Text>
              <TouchableOpacity
                  style={[styles.iconSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setShowEmojiSelector(true)}
              >
                <Text style={styles.iconText}>{lesson.icon}</Text>
                <Text style={[styles.iconHint, { color: colors.secondaryText }]}>Натисніть, щоб змінити</Text>
              </TouchableOpacity>
            </View>

            {showEmojiSelector && (
                <EmojiSelector onSelect={handleEmojiSelect} onClose={() => setShowEmojiSelector(false)} />
            )}

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Складність</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                    style={[
                      styles.radioOption,
                      { borderColor: colors.border },
                      lesson.difficulty === "beginner" && { backgroundColor: colors.success },
                    ]}
                    onPress={() => setLesson({ ...lesson, difficulty: "beginner" })}
                >
                  <Text style={[styles.radioText, { color: lesson.difficulty === "beginner" ? "#fff" : colors.text }]}>
                    Початковий
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                      styles.radioOption,
                      { borderColor: colors.border },
                      lesson.difficulty === "intermediate" && { backgroundColor: colors.warning },
                    ]}
                    onPress={() => setLesson({ ...lesson, difficulty: "intermediate" })}
                >
                  <Text
                      style={[styles.radioText, { color: lesson.difficulty === "intermediate" ? "#fff" : colors.text }]}
                  >
                    Середній
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                      styles.radioOption,
                      { borderColor: colors.border },
                      lesson.difficulty === "advanced" && { backgroundColor: colors.error },
                    ]}
                    onPress={() => setLesson({ ...lesson, difficulty: "advanced" })}
                >
                  <Text style={[styles.radioText, { color: lesson.difficulty === "advanced" ? "#fff" : colors.text }]}>
                    Просунутий
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Категорія</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                    style={[
                      styles.radioOption,
                      { borderColor: colors.border },
                      lesson.category === "vocabulary" && { backgroundColor: "#4CAF50" },
                    ]}
                    onPress={() => setLesson({ ...lesson, category: "vocabulary" })}
                >
                  <Text style={[styles.radioText, { color: lesson.category === "vocabulary" ? "#fff" : colors.text }]}>
                    Словник
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                      styles.radioOption,
                      { borderColor: colors.border },
                      lesson.category === "grammar" && { backgroundColor: "#2196F3" },
                    ]}
                    onPress={() => setLesson({ ...lesson, category: "grammar" })}
                >
                  <Text style={[styles.radioText, { color: lesson.category === "grammar" ? "#fff" : colors.text }]}>
                    Граматика
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                      styles.radioOption,
                      { borderColor: colors.border },
                      lesson.category === "conversation" && { backgroundColor: "#9C27B0" },
                    ]}
                    onPress={() => setLesson({ ...lesson, category: "conversation" })}
                >
                  <Text style={[styles.radioText, { color: lesson.category === "conversation" ? "#fff" : colors.text }]}>
                    Розмова
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.radioGroup, { marginTop: 10 }]}>
                <TouchableOpacity
                    style={[
                      styles.radioOption,
                      { borderColor: colors.border },
                      lesson.category === "reading" && { backgroundColor: "#FF9800" },
                    ]}
                    onPress={() => setLesson({ ...lesson, category: "reading" })}
                >
                  <Text style={[styles.radioText, { color: lesson.category === "reading" ? "#fff" : colors.text }]}>
                    Читання
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                      styles.radioOption,
                      { borderColor: colors.border },
                      lesson.category === "listening" && { backgroundColor: "#F44336" },
                    ]}
                    onPress={() => setLesson({ ...lesson, category: "listening" })}
                >
                  <Text style={[styles.radioText, { color: lesson.category === "listening" ? "#fff" : colors.text }]}>
                    Аудіювання
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Порядок відображення</Text>
              <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
                  value={String(lesson.order)}
                  onChangeText={(text) => {
                    const order = Number.parseInt(text) || 0
                    setLesson({ ...lesson, order })
                  }}
                  placeholder="Введіть порядковий номер"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Кількість питань</Text>
              <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={1}
                  maximumValue={lesson.questions.length}
                  step={1}
                  value={lesson.questionsCount ?? 5}
                  onValueChange={(value) => setLesson({ ...lesson, questionsCount: value })}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.text}
                  thumbTintColor="#f4f3f4"
              />
              <Text style={[styles.counterValue, { color: colors.text }]}>
                {lesson.questionsCount ?? 5}
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Теги</Text>
              <View style={styles.tagsContainer}>
                {lesson.tags.map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: colors.primary }]}>
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                        <Ionicons name="close-circle" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                ))}
              </View>
              <View style={styles.tagInputContainer}>
                <TextInput
                    style={[
                      styles.tagInput,
                      { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    value={currentTag}
                    onChangeText={setCurrentTag}
                    placeholder="Додати тег"
                    placeholderTextColor={colors.secondaryText}
                    onSubmitEditing={handleAddTag}
                />
                <TouchableOpacity
                    style={[styles.addTagButton, { backgroundColor: colors.primary }]}
                    onPress={handleAddTag}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={[styles.label, { color: colors.text }]}>Опублікований</Text>
                <Switch
                    value={lesson.isPublished}
                    onValueChange={(value) => setLesson({ ...lesson, isPublished: value })}
                    trackColor={{ false: "#767577", true: colors.primary }}
                    thumbColor="#f4f3f4"
                />
              </View>
              <Text style={[styles.hint, { color: colors.secondaryText }]}>
                {lesson.isPublished ? "Урок буде видимий для користувачів" : "Урок буде збережено як чернетку"}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Питання</Text>

            {lesson.questions.length === 0 ? (
                <View style={[styles.emptyQuestions, { backgroundColor: `${colors.primary}10` }]}>
                  <Ionicons name="help-circle-outline" size={48} color={colors.primary} />
                  <Text style={[styles.emptyQuestionsText, { color: colors.text }]}>Додайте питання до уроку</Text>
                </View>
            ) : (
                lesson.questions.map((question, index) => (
                    <View
                        key={index}
                        style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <View style={styles.questionHeader}>
                        <Text style={[styles.questionNumber, { color: colors.primary }]}>Питання {index + 1}</Text>
                        <View style={styles.questionActions}>
                          <TouchableOpacity
                              style={[
                                styles.questionAction,
                                { backgroundColor: editingQuestionIndex === index ? colors.primary : `${colors.primary}20` },
                              ]}
                              onPress={() => setEditingQuestionIndex(editingQuestionIndex === index ? null : index)}
                          >
                            <Ionicons
                                name={editingQuestionIndex === index ? "close-outline" : "create-outline"}
                                size={20}
                                color={editingQuestionIndex === index ? "#fff" : colors.primary}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                              style={[styles.questionAction, { backgroundColor: `${colors.error}20` }]}
                              onPress={() => handleRemoveQuestion(index)}
                          >
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {editingQuestionIndex === index ? (
                          <QuestionFormComponent
                              question={question}
                              onUpdate={(updatedQuestion) => handleUpdateQuestion(index, updatedQuestion)}
                          />
                      ) : (
                          <View style={styles.questionPreview}>
                            <Text style={[styles.questionText, { color: colors.text }]} numberOfLines={2}>
                              {question.question || "Без тексту питання"}
                            </Text>
                            <View style={styles.questionMeta}>
                              <View style={[styles.questionType, { backgroundColor: colors.primary }]}>
                                <Text style={styles.questionTypeText}>{getQuestionTypeLabel(question.type)}</Text>
                              </View>
                              <Text style={[styles.questionOptionsCount, { color: colors.secondaryText }]}>
                                {Array.isArray(question.options) ? `${question.options.length} варіантів` : "Без варіантів"}
                              </Text>
                            </View>
                          </View>
                      )}
                    </View>
                ))
            )}

            <TouchableOpacity
                style={[styles.addQuestionButton, { backgroundColor: colors.primary }]}
                onPress={handleAddQuestion}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.addQuestionText}>Додати питання</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={() => handleSave(false)}
                disabled={saving}
            >
              {saving ? (
                  <ActivityIndicator color="#fff" />
              ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Зберегти</Text>
                  </>
              )}
            </TouchableOpacity>

            {!lesson.isPublished && (
                <TouchableOpacity
                    style={[styles.publishButton, { backgroundColor: colors.success }]}
                    onPress={() => handleSave(true)}
                    disabled={saving}
                >
                  <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Опублікувати</Text>
                </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 50,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  iconSelector: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 36,
    marginBottom: 5,
  },
  iconHint: {
    fontSize: 12,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radioOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  radioText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    marginRight: 5,
  },
  tagInputContainer: {
    flexDirection: "row",
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hint: {
    fontSize: 12,
    marginTop: 5,
  },
  emptyQuestions: {
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  emptyQuestionsText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  questionCard: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  questionActions: {
    flexDirection: "row",
  },
  questionAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  questionPreview: {
    padding: 15,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  questionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  questionType: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  questionTypeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  questionOptionsCount: {
    fontSize: 12,
  },
  addQuestionButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addQuestionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  actionButtons: {
    marginTop: 20,
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  publishButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  counterValue: {
    fontSize: 18,
    fontWeight: "bold",
  }
})
