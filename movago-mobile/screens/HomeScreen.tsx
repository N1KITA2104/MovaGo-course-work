"use client"

import { useContext, useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AuthContext } from "../contexts/AuthContext"
import { api } from "../services/api"
import LessonCard from "../components/LessonCard"
import ProgressChart from "../components/ProgressChart"
import AchievementCard from "../components/AchievementCard"
import { useTheme } from "../contexts/ThemeContext"
import { checkAndUpdateStreakStatus } from "../services/notificationService"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../types/navigation.types"
import type { Lesson, ChartData } from "../types/lesson.types"
import type { AxiosResponse } from "axios"
import type { RecommendedLessonsResponse, RecentLessonsResponse, CategoryStatsResponse } from "../types/api.types"
import { transformCategoryStatsToChartData, getCategoryColor, getCategoryLabel } from "../utils/lesson.utils"

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">

export default function HomeScreen() {
  const { user, refreshUserData } = useContext(AuthContext)
  const { colors } = useTheme()
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([])
  const [recommendedLessons, setRecommendedLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [categoryStats, setCategoryStats] = useState<ChartData[]>([])

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      // Update user data
      const updatedUser = await refreshUserData()

      if (updatedUser && updatedUser.progress && updatedUser.progress.activityCalendar) {
        const lastActivityEntry = updatedUser.progress.activityCalendar
            .filter((entry) => entry.completed)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

        const lastActivityDate = lastActivityEntry ? new Date(lastActivityEntry.date) : null
        await checkAndUpdateStreakStatus(updatedUser.progress.streakDays, lastActivityDate)
      }

      const recommendedResponse: AxiosResponse<RecommendedLessonsResponse> = await api.get(
          "/api/stats/recommended-lessons",
      )
      setRecommendedLessons(recommendedResponse.data.recommendedLessons || [])

      const recentResponse: AxiosResponse<RecentLessonsResponse> = await api.get("/api/stats/recent-lessons")
      setRecentLessons(recentResponse.data.recentLessons || [])

      const statsResponse: AxiosResponse<CategoryStatsResponse> = await api.get("/api/stats/category-stats")
      const backendStats = statsResponse.data.categoryStats || []

      const chartData = transformCategoryStatsToChartData(backendStats)
      setCategoryStats(chartData)
    } catch (error) {
      console.error("Error fetching data:", error)

      try {
        const response = await api.get("/api/lessons")
        const allLessons = response.data as Lesson[]

        const recent = allLessons.slice(0, 3)
        setRecentLessons(recent)

        const recommended = allLessons.filter((lesson) => lesson.difficulty === "intermediate").slice(0, 3)
        setRecommendedLessons(recommended)

        // Create fallback category stats
        const categories: Record<string, number> = {}
        allLessons.forEach((lesson) => {
          if (!categories[lesson.category]) {
            categories[lesson.category] = 0
          }
          categories[lesson.category]++
        })

        // Use the utility functions we fixed earlier to get labels and colors
        const stats = Object.keys(categories).map((category) => ({
          label: getCategoryLabel(category),
          value: categories[category],
          color: getCategoryColor(category),
        }))
        setCategoryStats(stats)
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [refreshUserData])

  useEffect(() => {
    fetchData().then()
  }, [fetchData])

  useEffect(() => {
    const checkLastStreak = async (): Promise<void> => {
      if (user && user.progress && user.progress.streakDays === 0) {
        try {
          const lastStreakStr = await AsyncStorage.getItem("@Movago:lastStreakValue")
          if (lastStreakStr) {
            const lastStreak = Number.parseInt(lastStreakStr, 10)
            if (lastStreak > 0) {
              Alert.alert(
                  "Серію перервано!",
                  `Ви не займалися вчора і втратили серію у ${lastStreak} днів. Почніть нову серію сьогодні!`,
                  [{ text: "Зрозуміло", style: "default" }],
              )
            }
          }
          await AsyncStorage.setItem("@Movago:lastStreakValue", String(user.progress.streakDays))
        } catch (error) {
          console.error("Error checking streak:", error)
        }
      }
    }

    checkLastStreak().then()

    if (user && user.progress) {
      AsyncStorage.setItem("@Movago:lastStreakValue", String(user.progress.streakDays)).then()
    }
  }, [user?.progress, user?.progress?.streakDays])

  const onRefresh = useCallback((): void => {
    setRefreshing(true)
    fetchData().then()
  }, [fetchData])

  const handleLessonPress = (lessonId: string): void => {
    navigation.navigate("Lessons", {
      screen: "Lesson",
      params: { lessonId },
    } as never)
  }

  const getStreakMessage = (): string => {
    const streakDays = user?.progress?.streakDays || 0

    if (streakDays === 0) {
      return "Почніть свою серію занять сьогодні!"
    } else if (streakDays === 1) {
      return "🔥 1 день поспіль - гарний початок!"
    } else if (streakDays < 7) {
      return `🔥 ${streakDays} днів поспіль - так тримати!`
    } else if (streakDays < 30) {
      return `🔥 ${streakDays} днів поспіль - вражаюча серія!`
    } else {
      return `🔥 ${streakDays} днів поспіль - ви неймовірні!`
    }
  }

  const achievements = [
    {
      title: "Перші кроки",
      description: "Завершіть свій перший урок",
      icon: "🎯",
      isCompleted: (user?.progress?.completedLessons?.length || 0) > 0,
    },
    {
      title: "На шляху до знань",
      description: "Завершіть 5 уроків",
      icon: "📚",
      progress: Math.min((user?.progress?.completedLessons?.length || 0) * 20, 100),
      isCompleted: (user?.progress?.completedLessons?.length || 0) >= 5,
    },
    {
      title: "Постійність - запорука успіху",
      description: "Навчайтесь 7 днів поспіль",
      icon: "🔥",
      progress: Math.min((user?.progress?.streakDays || 0) * 14.3, 100),
      isCompleted: (user?.progress?.streakDays || 0) >= 7,
    },
  ]

  return (
      <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Вітаємо, {user?.username || "Користувач"}!</Text>
            <Text style={styles.streakText}>{getStreakMessage()}</Text>
          </View>

          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{user?.progress?.level || 1}</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Рівень</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{user?.progress?.xp || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>XP</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {user?.progress?.completedLessons?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Уроків</Text>
            </View>
          </View>
        </View>

        {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
        ) : (
            <>
              {/* Achievements section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Ваші досягнення</Text>
                </View>

                {achievements.map((achievement, index) => (
                    <AchievementCard
                        key={index}
                        title={achievement.title}
                        description={achievement.description}
                        icon={achievement.icon}
                        progress={achievement.progress}
                        isCompleted={achievement.isCompleted}
                    />
                ))}
              </View>

              {/* Category progress chart */}
              {categoryStats.length > 0 && (
                  <View style={styles.section}>
                    <ProgressChart data={categoryStats} title="Ваш прогрес за категоріями" />
                  </View>
              )}

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Продовжити навчання</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Lessons")}>
                    <Text style={[styles.seeAllText, { color: colors.primary }]}>Всі уроки</Text>
                  </TouchableOpacity>
                </View>

                {recentLessons.length > 0 ? (
                    recentLessons.map((lesson) => (
                        <LessonCard
                            key={lesson._id}
                            lesson={{
                              ...lesson,
                              completed: user?.progress?.completedLessons?.includes(lesson._id) || false,
                            }}
                            onPress={handleLessonPress}
                        />
                    ))
                ) : (
                    <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                      Немає доступних уроків для продовження
                    </Text>
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Рекомендовані для вас</Text>
                </View>

                {recommendedLessons.length > 0 ? (
                    recommendedLessons.map((lesson) => (
                        <LessonCard
                            key={lesson._id}
                            lesson={{
                              ...lesson,
                              completed: user?.progress?.completedLessons?.includes(lesson._id) || false,
                            }}
                            onPress={handleLessonPress}
                        />
                    ))
                ) : (
                    <Text style={[styles.emptyText, { color: colors.secondaryText }]}>Немає рекомендованих уроків</Text>
                )}
              </View>
            </>
        )}
      </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  streakText: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  statsCard: {
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
  },
  loadingContainer: {
    padding: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  seeAllText: {
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    fontSize: 16,
  },
})
