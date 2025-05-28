"use client"

import { useState, useEffect, useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native"
import { api } from "../services/api"
import { AuthContext } from "../contexts/AuthContext"
import LessonCard from "../components/LessonCard"
import { useTheme } from "../contexts/ThemeContext"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { LessonsStackParamList } from "../types/navigation.types"
import type { Lesson, LessonDifficulty } from "../types/lesson.types"

type LessonsScreenNavigationProp = NativeStackNavigationProp<LessonsStackParamList, "LessonsList">

export default function LessonsScreen() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [filter, setFilter] = useState<LessonDifficulty | "all">("all")
  const { user } = useContext(AuthContext)
  const { colors } = useTheme()
  const navigation = useNavigation<LessonsScreenNavigationProp>()

  useEffect((): void => {
    fetchLessons().then()
  }, [])

  const fetchLessons = async (): Promise<void> => {
    try {
      const response = await api.get("/api/lessons")
      setLessons(response.data)
    } catch (error) {
      console.error("Error fetching lessons:", error)
      Alert.alert("Помилка", "Не вдалося завантажити уроки")
    } finally {
      setLoading(false)
    }
  }

  const handleLessonPress = (lessonId: string): void => {
    navigation.navigate("Lesson", { lessonId })
  }

  const filteredLessons: Lesson[] =
      filter === "all" ? lessons : lessons.filter((lesson): boolean => lesson.difficulty === filter)

  const renderFilterButton = (filterValue: LessonDifficulty | "all", label: string) => (
      <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: filter === filterValue ? colors.primary : colors.card },
            filter === filterValue && styles.activeFilterButton,
          ]}
          onPress={(): void => setFilter(filterValue)}
      >
        <Text style={[styles.filterButtonText, { color: filter === filterValue ? "#fff" : colors.secondaryText }]}>
          {label}
        </Text>
      </TouchableOpacity>
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.filterContainerWrapper, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
          >
            {renderFilterButton("all", "Всі")}
            {renderFilterButton("beginner", "Початковий")}
            {renderFilterButton("intermediate", "Середній")}
            {renderFilterButton("advanced", "Просунутий")}
          </ScrollView>
        </View>

        <FlatList
            data={filteredLessons}
            keyExtractor={(item): string => item._id}
            renderItem={({ item }) => (
                <LessonCard
                    lesson={{
                      ...item,
                      completed: user?.progress?.completedLessons?.includes(item._id) || false,
                    }}
                    onPress={handleLessonPress}
                />
            )}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.secondaryText }]}>Немає доступних уроків</Text>
              </View>
            }
        />
      </SafeAreaView>
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
  filterContainerWrapper: {
    borderBottomWidth: 1,
    zIndex: 10,
    paddingTop: 40,
    paddingBottom: 15,
    marginTop: 10,
  },
  filterScrollContent: {
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    minWidth: 80,
    alignItems: "center",
  },
  activeFilterButton: {
    backgroundColor: "#13AA52",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContainer: {
    padding: 15,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
})
