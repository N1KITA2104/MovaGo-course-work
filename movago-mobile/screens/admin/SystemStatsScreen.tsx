"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Dimensions } from "react-native"
import { useTheme } from "../../contexts/ThemeContext"
import { api } from "../../services/api"
import { Ionicons } from "@expo/vector-icons"
import ProgressChart from "../../components/ProgressChart"
import { PieChart } from "react-native-chart-kit"
import type { SystemStats, UserStatusData, UserRoleData, LessonDifficultyData } from "../../types/stats.types"
import type {ChartData, Lesson} from "../../types/lesson.types"
import type { User } from "../../types/user.types"
import { formatNumber } from "../../utils/string.utils"

const { width } = Dimensions.get("window")

export default function SystemStatsScreen() {
  const { colors, isDark } = useTheme()
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    pendingUsers: 0,
    totalLessons: 0,
    completedLessonsCount: 0,
    averageXp: 0,
    averageLevel: 0,
    averageStreak: 0,
    usersByRole: {
      admin: 0,
      moderator: 0,
      user: 0,
    },
    lessonsByCategory: {
      vocabulary: 0,
      grammar: 0,
      conversation: 0,
      reading: 0,
      listening: 0,
    },
    lessonsByDifficulty: {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    },
    topCompletedLessons: [],
    recentActivity: [],
  })

  useEffect(() => {
    fetchSystemStats().then()
  }, [])

  const fetchSystemStats = async (): Promise<void> => {
    setLoading(true)
    try {
      const usersResponse = await api.get("/api/auth/users")
      const users = usersResponse.data.users || []

      const lessonsResponse = await api.get("/api/lessons")
      const lessons = lessonsResponse.data || []

      const totalUsers = users.length
      const activeUsers = users.filter((user: User) => user.status === "active").length
      const inactiveUsers = users.filter((user: User) => user.status === "inactive").length
      const pendingUsers = users.filter((user: User) => user.status === "pending").length

      const adminUsers = users.filter((user: User) => user.role === "admin").length
      const moderatorUsers = users.filter((user: User) => user.role === "moderator").length
      const regularUsers = users.filter((user: User) => user.role === "user").length

      const totalLessons = lessons.length

      const lessonsByCategory = {
        vocabulary: lessons.filter((lesson: Lesson) => lesson.category === "vocabulary").length,
        grammar: lessons.filter((lesson: Lesson) => lesson.category === "grammar").length,
        conversation: lessons.filter((lesson: Lesson) => lesson.category === "conversation").length,
        reading: lessons.filter((lesson: Lesson) => lesson.category === "reading").length,
        listening: lessons.filter((lesson: Lesson) => lesson.category === "listening").length,
      }

      const lessonsByDifficulty = {
        beginner: lessons.filter((lesson: Lesson) => lesson.difficulty === "beginner").length,
        intermediate: lessons.filter((lesson: Lesson) => lesson.difficulty === "intermediate").length,
        advanced: lessons.filter((lesson: Lesson) => lesson.difficulty === "advanced").length,
      }

      let totalXp = 0
      let totalLevel = 0
      let totalStreak = 0
      let completedLessonsCount = 0

      users.forEach((user: User) => {
        if (user.progress) {
          totalXp += user.progress.xp || 0
          totalLevel += user.progress.level || 0
          totalStreak += user.progress.streakDays || 0
          completedLessonsCount += user.progress.completedLessons?.length || 0
        }
      })

      const averageXp = totalUsers > 0 ? totalXp / totalUsers : 0
      const averageLevel = totalUsers > 0 ? totalLevel / totalUsers : 0
      const averageStreak = totalUsers > 0 ? totalStreak / totalUsers : 0

      const lessonCompletionMap: Record<string, number> = {}
      users.forEach((user: User) => {
        if (user.progress && user.progress.completedLessons) {
          user.progress.completedLessons.forEach((lessonId: string) => {
            if (!lessonCompletionMap[lessonId]) {
              lessonCompletionMap[lessonId] = 0
            }
            lessonCompletionMap[lessonId]++
          })
        }
      })

      const topCompletedLessons = lessons
          .map((lesson: Lesson) => ({
            id: lesson._id,
            title: lesson.title,
            completions: lessonCompletionMap[lesson._id] || 0,
          }))
          .sort((a: any, b: any): number => b.completions - a.completions)
          .slice(0, 5)

      setStats({
        totalUsers,
        activeUsers,
        inactiveUsers,
        pendingUsers,
        totalLessons,
        completedLessonsCount,
        averageXp,
        averageLevel,
        averageStreak,
        usersByRole: {
          admin: adminUsers,
          moderator: moderatorUsers,
          user: regularUsers,
        },
        lessonsByCategory,
        lessonsByDifficulty,
        topCompletedLessons,
        recentActivity: [],
      })
    } catch (error) {
      console.error("Error fetching system stats:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = useCallback((): void => {
    setRefreshing(true)
    fetchSystemStats().then()
  }, [])

  const userStatusData: UserStatusData = [
    {
      name: "Активні",
      population: stats.activeUsers,
      color: colors.success,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: "Неактивні",
      population: stats.inactiveUsers,
      color: colors.error,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: "Очікують",
      population: stats.pendingUsers,
      color: colors.warning,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ]

  const userRoleData: UserRoleData = [
    {
      name: "Адміністратори",
      population: stats.usersByRole.admin,
      color: colors.error,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: "Модератори",
      population: stats.usersByRole.moderator,
      color: colors.warning,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: "Користувачі",
      population: stats.usersByRole.user,
      color: colors.primary,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ]

  const lessonDifficultyData: LessonDifficultyData = [
    {
      name: "Початковий",
      population: stats.lessonsByDifficulty.beginner,
      color: colors.success,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: "Середній",
      population: stats.lessonsByDifficulty.intermediate,
      color: colors.warning,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: "Просунутий",
      population: stats.lessonsByDifficulty.advanced,
      color: colors.error,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ]

  const categoryChartData: ChartData[] = [
    {
      label: "Словник",
      value: stats.lessonsByCategory.vocabulary,
      color: "#4CAF50",
    },
    {
      label: "Граматика",
      value: stats.lessonsByCategory.grammar,
      color: "#2196F3",
    },
    {
      label: "Розмова",
      value: stats.lessonsByCategory.conversation,
      color: "#9C27B0",
    },
    {
      label: "Читання",
      value: stats.lessonsByCategory.reading,
      color: "#FF9800",
    },
    {
      label: "Аудіювання",
      value: stats.lessonsByCategory.listening,
      color: "#F44336",
    },
  ]

  const topLessonsChartData: ChartData[] = stats.topCompletedLessons.map((lesson, index) => ({
    label: lesson.title,
    value: lesson.completions,
    color: [colors.primary, colors.success, colors.warning, colors.info, colors.error][index % 5],
  }))

  const chartConfig = {
    backgroundGradientFrom: isDark ? "#1E1E1E" : "#ffffff",
    backgroundGradientTo: isDark ? "#1E1E1E" : "#ffffff",
    color: (opacity = 1) => `rgba(${isDark ? "255, 255, 255" : "0, 0, 0"}, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  }

  if (loading && !refreshing) {
    return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Завантаження статистики системи...</Text>
        </View>
    )
  }

  return (
      <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Статистика системи</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Загальна інформація про користувачів та уроки
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
              <Ionicons name="people" size={24} color="#fff" />
            </View>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{formatNumber(stats.totalUsers)}</Text>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Користувачів</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.success }]}>
              <Ionicons name="book" size={24} color="#fff" />
            </View>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{formatNumber(stats.totalLessons)}</Text>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Уроків</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.warning }]}>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
            </View>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{formatNumber(stats.completedLessonsCount)}</Text>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Завершень</Text>
          </View>
        </View>

        {/* User Statistics Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Статистика користувачів</Text>

          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Статус користувачів</Text>
            {stats.totalUsers > 0 ? (
                <PieChart
                    data={userStatusData}
                    width={width - 60}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            ) : (
                <Text style={[styles.noDataText, { color: colors.secondaryText }]}>Немає даних для відображення</Text>
            )}
          </View>

          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Ролі користувачів</Text>
            {stats.totalUsers > 0 ? (
                <PieChart
                    data={userRoleData}
                    width={width - 60}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            ) : (
                <Text style={[styles.noDataText, { color: colors.secondaryText }]}>Немає даних для відображення</Text>
            )}
          </View>

          <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{formatNumber(stats.averageXp, 2)}</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Середній XP</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{formatNumber(stats.averageLevel, 2)}</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Середній рівень</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{formatNumber(stats.averageStreak, 2)}</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Середня серія</Text>
            </View>
          </View>
        </View>

        {/* Lesson Statistics Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Статистика уроків</Text>

          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Уроки за складністю</Text>
            {stats.totalLessons > 0 ? (
                <PieChart
                    data={lessonDifficultyData}
                    width={width - 60}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            ) : (
                <Text style={[styles.noDataText, { color: colors.secondaryText }]}>Немає даних для відображення</Text>
            )}
          </View>

          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Уроки за категоріями</Text>
            {stats.totalLessons > 0 ? (
                <ProgressChart data={categoryChartData} />
            ) : (
                <Text style={[styles.noDataText, { color: colors.secondaryText }]}>Немає даних для відображення</Text>
            )}
          </View>

          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Найпопулярніші уроки</Text>
            {stats.topCompletedLessons.length > 0 ? (
                <ProgressChart data={topLessonsChartData} />
            ) : (
                <Text style={[styles.noDataText, { color: colors.secondaryText }]}>Немає даних для відображення</Text>
            )}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: `${colors.primary}20` }]}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} style={styles.infoIcon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Статистика оновлюється щоразу, коли ви відкриваєте цю сторінку або використовуєте жест "потягнути вниз для
            оновлення".
          </Text>
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
  header: {
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },
  summaryCard: {
    width: "30%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  chartCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  noDataText: {
    textAlign: "center",
    padding: 20,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
  },
  infoCard: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
})
