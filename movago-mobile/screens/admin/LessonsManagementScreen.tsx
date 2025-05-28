"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from "react-native"
import { useTheme } from "../../contexts/ThemeContext"
import { api } from "../../services/api"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AdminStackParamList } from "../../types/navigation.types"
import type { Lesson, LessonDifficulty, LessonCategory } from "../../types/lesson.types"
import { getCategoryLabel, getDifficultyLabel } from "../../utils/lesson.utils"
import { sanitizeInput } from "../../utils/string.utils"
import { formatDateTime } from "../../utils/date.utils"

type LessonsManagementScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList, "LessonsManagement">

export default function LessonsManagementScreen() {
  const { colors } = useTheme()
  const navigation = useNavigation<LessonsManagementScreenNavigationProp>()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterCategory, setFilterCategory] = useState<LessonCategory | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<LessonDifficulty | null>(null)
  const [filterPublished, setFilterPublished] = useState<boolean | null>(null)

  useEffect(() => {
    fetchLessons()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, filterCategory, filterDifficulty, filterPublished, lessons])

  const fetchLessons = async (): Promise<void> => {
    try {
      const response = await api.get("/api/lessons")
      setLessons(response.data)
      setFilteredLessons(response.data)
    } catch (error) {
      console.error("Error fetching lessons:", error)
      Alert.alert("Помилка", "Не вдалося завантажити уроки")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = (): void => {
    setRefreshing(true)
    fetchLessons()
  }

  const applyFilters = (): void => {
    let filtered = [...lessons]

    if (searchQuery) {
      const query = sanitizeInput(searchQuery.toLowerCase())
      filtered = filtered.filter(
          (lesson) => lesson.title.toLowerCase().includes(query) || lesson.description.toLowerCase().includes(query),
      )
    }

    if (filterCategory) {
      filtered = filtered.filter((lesson) => lesson.category === filterCategory)
    }

    if (filterDifficulty) {
      filtered = filtered.filter((lesson) => lesson.difficulty === filterDifficulty)
    }

    if (filterPublished !== null) {
      filtered = filtered.filter((lesson) => lesson.isPublished === filterPublished)
    }

    filtered.sort((a, b) => a.order - b.order)

    setFilteredLessons(filtered)
  }

  const handleCreateLesson = (): void => {
    navigation.navigate("LessonForm", { lessonId: null })
  }

  const handleEditLesson = (lessonId: string): void => {
    navigation.navigate("LessonForm", { lessonId })
  }

  const handleDeleteLesson = (lessonId: string, lessonTitle: string): void => {
    Alert.alert("Видалити урок", `Ви впевнені, що хочете видалити урок "${lessonTitle}"?`, [
      { text: "Скасувати", style: "cancel" },
      {
        text: "Видалити",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/lessons/${lessonId}`)
            setLessons(lessons.filter((lesson) => lesson._id !== lessonId))
            Alert.alert("Успіх", "Урок видалено успішно")
          } catch (error) {
            console.error("Error deleting lesson:", error)
            Alert.alert("Помилка", "Не вдалося видалити урок")
          }
        },
      },
    ])
  }

  const handleTogglePublish = async (lessonId: string, isCurrentlyPublished: boolean): Promise<void> => {
    try {
      await api.put(`/api/lessons/${lessonId}`, {
        isPublished: !isCurrentlyPublished,
      })

      setLessons(
          lessons.map((lesson) => (lesson._id === lessonId ? { ...lesson, isPublished: !isCurrentlyPublished } : lesson)),
      )
    } catch (error) {
      console.error("Error toggling publish status:", error)
      Alert.alert("Помилка", "Не вдалося змінити статус публікації")
    }
  }

  const renderFilterButtons = () => (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
              style={[styles.filterButton, filterCategory === null && { backgroundColor: colors.primary }]}
              onPress={() => setFilterCategory(null)}
          >
            <Text style={[styles.filterButtonText, { color: filterCategory === null ? "#fff" : colors.text }]}>
              Всі категорії
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.filterButton, filterCategory === "vocabulary" && { backgroundColor: "#4CAF50" }]}
              onPress={() => setFilterCategory(filterCategory === "vocabulary" ? null : "vocabulary")}
          >
            <Text style={[styles.filterButtonText, { color: filterCategory === "vocabulary" ? "#fff" : colors.text }]}>
              Словник
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.filterButton, filterCategory === "grammar" && { backgroundColor: "#2196F3" }]}
              onPress={() => setFilterCategory(filterCategory === "grammar" ? null : "grammar")}
          >
            <Text style={[styles.filterButtonText, { color: filterCategory === "grammar" ? "#fff" : colors.text }]}>
              Граматика
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.filterButton, filterCategory === "conversation" && { backgroundColor: "#9C27B0" }]}
              onPress={() => setFilterCategory(filterCategory === "conversation" ? null : "conversation")}
          >
            <Text style={[styles.filterButtonText, { color: filterCategory === "conversation" ? "#fff" : colors.text }]}>
              Розмова
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.filterButton, filterCategory === "reading" && { backgroundColor: "#FF9800" }]}
              onPress={() => setFilterCategory(filterCategory === "reading" ? null : "reading")}
          >
            <Text style={[styles.filterButtonText, { color: filterCategory === "reading" ? "#fff" : colors.text }]}>
              Читання
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.filterButton, filterCategory === "listening" && { backgroundColor: "#F44336" }]}
              onPress={() => setFilterCategory(filterCategory === "listening" ? null : "listening")}
          >
            <Text style={[styles.filterButtonText, { color: filterCategory === "listening" ? "#fff" : colors.text }]}>
              Аудіювання
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
  )

  const renderItem = ({ item }: { item: Lesson }) => (
      <View style={[styles.lessonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.lessonHeader}>
          <View style={styles.lessonTitleContainer}>
            <Text style={styles.lessonIcon}>{item.icon}</Text>
            <View style={{ flexShrink: 1 }}>
              <Text style={[styles.lessonTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.lessonDescription, { color: colors.secondaryText }]} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </View>
          <Text style={[styles.lessonOrder, { color: colors.secondaryText }]}>#{item.order}</Text>
        </View>

        <View style={styles.lessonMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="help-circle-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.metaText, { color: colors.secondaryText }]}>{item.questions.length || 0} банк</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="list-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.metaText, { color: colors.secondaryText }]}>{item.questionsCount || 0} питань</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.metaText, { color: colors.secondaryText }]}>
              {item.updatedAt ? formatDateTime(item.updatedAt) : "Немає даних"}
            </Text>
          </View>
        </View>

        <View style={styles.lessonActions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => handleEditLesson(item._id)}>
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: item.isPublished ? colors.warning : colors.success }]} onPress={() => handleTogglePublish(item._id, item.isPublished)}>
            <Ionicons name={item.isPublished ? "eye-off-outline" : "eye-outline"} size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.error }]} onPress={() => handleDeleteLesson(item._id, item.title)}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
  )

  if (loading) {
    return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Завантаження уроків...</Text>
        </View>
    )
  }

  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TextInput
              style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Пошук уроків..."
              placeholderTextColor={colors.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
          />
          <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateLesson}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Створити</Text>
          </TouchableOpacity>
        </View>

        {renderFilterButtons()}

        <View style={styles.filterRow}>
          <TouchableOpacity
              style={[styles.difficultyFilter, filterDifficulty === null && { backgroundColor: colors.primary }]}
              onPress={() => setFilterDifficulty(null)}
          >
            <Text style={[styles.filterText, { color: filterDifficulty === null ? "#fff" : colors.text }]}>
              Всі рівні
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.difficultyFilter, filterDifficulty === "beginner" && { backgroundColor: colors.success }]}
              onPress={() => setFilterDifficulty(filterDifficulty === "beginner" ? null : "beginner")}
          >
            <Text style={[styles.filterText, { color: filterDifficulty === "beginner" ? "#fff" : colors.text }]}>
              Початковий
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.difficultyFilter, filterDifficulty === "intermediate" && { backgroundColor: colors.warning }]}
              onPress={() => setFilterDifficulty(filterDifficulty === "intermediate" ? null : "intermediate")}
          >
            <Text style={[styles.filterText, { color: filterDifficulty === "intermediate" ? "#fff" : colors.text }]}>
              Середній
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.difficultyFilter, filterDifficulty === "advanced" && { backgroundColor: colors.error }]}
              onPress={() => setFilterDifficulty(filterDifficulty === "advanced" ? null : "advanced")}
          >
            <Text style={[styles.filterText, { color: filterDifficulty === "advanced" ? "#fff" : colors.text }]}>
              Просунутий
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.publishedFilterRow}>
          <TouchableOpacity
              style={[styles.publishedFilter, filterPublished === null && { backgroundColor: colors.primary }]}
              onPress={() => setFilterPublished(null)}
          >
            <Text style={[styles.filterText, { color: filterPublished === null ? "#fff" : colors.text }]}>Всі</Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.publishedFilter, filterPublished === true && { backgroundColor: colors.success }]}
              onPress={() => setFilterPublished(filterPublished === true ? null : true)}
          >
            <Text style={[styles.filterText, { color: filterPublished === true ? "#fff" : colors.text }]}>
              Опубліковані
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.publishedFilter, filterPublished === false && { backgroundColor: colors.secondaryText }]}
              onPress={() => setFilterPublished(filterPublished === false ? null : false)}
          >
            <Text style={[styles.filterText, { color: filterPublished === false ? "#fff" : colors.text }]}>Чернетки</Text>
          </TouchableOpacity>
        </View>

        {filteredLessons.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Уроків не знайдено</Text>
              <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                {searchQuery || filterCategory || filterDifficulty !== null || filterPublished !== null
                    ? "Спробуйте змінити параметри фільтрації"
                    : "Створіть свій перший урок"}
              </Text>
              {!searchQuery && !filterCategory && filterDifficulty === null && filterPublished === null && (
                  <TouchableOpacity
                      style={[styles.createEmptyButton, { backgroundColor: colors.primary }]}
                      onPress={handleCreateLesson}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.createEmptyButtonText}>Створити урок</Text>
                  </TouchableOpacity>
              )}
            </View>
        ) : (
            <FlatList
                data={filteredLessons}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshing={refreshing}
                onRefresh={handleRefresh}
            />
        )}
      </View>
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
  header: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    marginRight: 10,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 5,
  },
  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginBottom: 10,
    justifyContent: "space-between",
  },
  difficultyFilter: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "500",
  },
  publishedFilterRow: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginBottom: 15,
    justifyContent: "space-between",
  },
  publishedFilter: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  listContainer: {
    padding: 15,
    paddingTop: 5,
  },
  lessonCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  lessonTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  lessonIcon: {
    fontSize: 30,
    marginRight: 10,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  lessonOrder: {
    fontSize: 16,
    fontWeight: "bold",
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  lessonMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    flexShrink: 1,
    flexBasis: '30%',
  },
  metaText: {
    marginLeft: 5,
    fontSize: 12,
  },
  lessonDescription: {
    fontSize: 14,
    marginTop: 5,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  createEmptyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  createEmptyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  lessonActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
})

function renderCategoryBadge(category: LessonCategory) {
  const categoryColors = {
    vocabulary: "#4CAF50",
    grammar: "#2196F3",
    conversation: "#9C27B0",
    reading: "#FF9800",
    listening: "#F44336",
  }

  return (
      <View style={[styles.badge, { backgroundColor: categoryColors[category] }]}>
        <Text style={styles.badgeText}>{getCategoryLabel(category)}</Text>
      </View>
  )
}

function renderDifficultyBadge(difficulty: LessonDifficulty) {
  const colors = {
    beginner: "#4CAF50",
    intermediate: "#FFC107",
    advanced: "#F44336",
  }

  return (
      <View style={[styles.badge, { backgroundColor: colors[difficulty] }]}>
        <Text style={styles.badgeText}>{getDifficultyLabel(difficulty)}</Text>
      </View>
  )
}
