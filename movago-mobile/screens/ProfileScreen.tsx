"use client"

import { useContext, useState, useCallback, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AuthContext } from "../contexts/AuthContext"
import ActivityCalendar from "../components/ActivityCalendar"
import ProgressChart from "../components/ProgressChart"
import AchievementCard from "../components/AchievementCard"
import { useTheme } from "../contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { api } from "../services/api"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { ProfileStackParamList } from "../types/navigation.types"
import type { ChartData } from "../types/lesson.types"
import type { AxiosResponse } from "axios"
import type { CategoryStatsResponse } from "../types/api.types"
import { transformCategoryStatsToChartData } from "../utils/lesson.utils"
import type { ActivityCalendarEntry } from "../types/user.types"

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, "ProfileMain">

export default function ProfileScreen() {
  const { user, logout, refreshUserData } = useContext(AuthContext)
  const { colors } = useTheme()
  const navigation = useNavigation<ProfileScreenNavigationProp>()
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [categoryStats, setCategoryStats] = useState<ChartData[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const activityDates: Date[] = user?.progress?.activityCalendar
      ? user.progress.activityCalendar
          .filter((entry: ActivityCalendarEntry): boolean => entry.completed)
          .map((entry: ActivityCalendarEntry): Date => new Date(entry.date))
      : []

  const fetchCategoryStats = useCallback(async (): Promise<void> => {
    try {
      const statsResponse: AxiosResponse<CategoryStatsResponse> = await api.get("/api/stats/category-stats")
      const backendStats = statsResponse.data.categoryStats || []
      const chartData = transformCategoryStatsToChartData(backendStats)
      setCategoryStats(chartData)
    } catch (error) {
      console.error("Error fetching category stats:", error)
      setCategoryStats([
        { label: "Словник", value: 0, color: "#4CAF50" },
        { label: "Граматика", value: 0, color: "#2196F3" },
        { label: "Розмова", value: 0, color: "#9C27B0" },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect((): void => {
    fetchCategoryStats().then()
  }, [fetchCategoryStats])

  const getStreakMessage = (): string => {
    const streakDays = user?.progress?.streakDays || 0

    if (streakDays === 0) {
      return "Почніть свою серію занять сьогодні!"
    } else if (streakDays === 1) {
      return "1 день поспіль - гарний початок!"
    } else if (streakDays < 7) {
      return `${streakDays} днів поспіль - так тримати!`
    } else if (streakDays < 30) {
      return `${streakDays} днів поспіль - вражаюча серія!`
    } else {
      return `${streakDays} днів поспіль - ви неймовірні!`
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

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true)
    try {
      await refreshUserData()
      await fetchCategoryStats()
    } catch (error) {
      console.error("Error refreshing profile:", error)
    } finally {
      setRefreshing(false)
    }
  }, [refreshUserData, fetchCategoryStats])

  return (
      <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Image source={require("../assets/default-avatar.png")} style={styles.profilePhoto} resizeMode="cover" />

          <Text style={[styles.username, { color: colors.text }]}>{user?.username || "Користувач"}</Text>
          <Text style={[styles.email, { color: colors.secondaryText }]}>{user?.email || ""}</Text>

          <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={(): void => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editButtonText}>Редагувати профіль</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.statsContainer, { borderBottomColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{user?.progress?.level || 1}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Рівень</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{user?.progress?.xp || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>XP</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{user?.progress?.streakDays || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Днів поспіль</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Прогрес навчання</Text>
          <Text style={[styles.progressText, { color: colors.text }]}>
            Завершено уроків: {user?.progress?.completedLessons?.length || 0}
          </Text>
          <Text style={[styles.streakMessage, { color: colors.text }]}>
            <Ionicons name="flame" size={16} color={colors.primary} /> {getStreakMessage()}
          </Text>

          {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Завантаження статистики...</Text>
              </View>
          ) : (
              <ProgressChart data={categoryStats} title="Вивчені категорії" />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Досягнення</Text>

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

        <ActivityCalendar activityDates={activityDates} />

        <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: colors.card }]}
            onPress={(): void => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} style={{ marginRight: 10 }} />
          <Text style={[styles.settingsButtonText, { color: colors.text }]}>Налаштування</Text>
        </TouchableOpacity>

        {user?.role === "admin" && (
            <TouchableOpacity
                style={[styles.adminButton, { backgroundColor: colors.card }]}
                onPress={(): void => navigation.navigate("AdminPanelRoot")}
            >
              <Ionicons name="shield-outline" size={24} color={colors.error} style={{ marginRight: 10 }} />
              <Text style={[styles.adminButtonText, { color: colors.error }]}>Адмін панель</Text>
            </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={(): Promise<void> => logout()}>
          <Text style={styles.logoutButtonText}>Вийти</Text>
        </TouchableOpacity>
      </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    marginBottom: 15,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 10,
  },
  streakMessage: {
    fontSize: 16,
    marginBottom: 15,
    fontWeight: "500",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  settingsButton: {
    margin: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#13AA52",
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    margin: 20,
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#FF5252",
    borderRadius: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  adminButton: {
    margin: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF5252",
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
})
