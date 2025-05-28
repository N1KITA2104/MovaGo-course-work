"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, Platform, Linking } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import * as Notifications from "expo-notifications"
import {
  registerForPushNotificationsAsync,
  getNotificationSettings,
  saveNotificationSettings,
  scheduleStreakReminderNotification,
  cancelScheduledNotifications,
} from "../services/notificationService"

export default function SettingsScreen() {
  const { colors, theme, setTheme, isDark } = useTheme()
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false)
  const [dailyRemindersEnabled, setDailyRemindersEnabled] = useState<boolean>(false)
  const [achievementNotificationsEnabled, setAchievementNotificationsEnabled] = useState<boolean>(false)
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null)

  useEffect((): void => {
    const loadSettings = async (): Promise<void> => {
      const enabled: boolean = await getNotificationSettings()
      setNotificationsEnabled(enabled)

      if (Platform.OS !== "web") {
        const { status } = await Notifications.getPermissionsAsync()
        setPermissionStatus(status)
      }
    }

    loadSettings()
  }, [])

  const handleThemeChange = (value: boolean): void => {
    setTheme(value ? "dark" : "light")
  }

  const handleNotificationsToggle = async (value: boolean): Promise<void> => {
    if (value && (!permissionStatus || permissionStatus !== "granted")) {
      const token: string | null | undefined = await registerForPushNotificationsAsync()

      if (!token) {
        Alert.alert("Сповіщення вимкнено", "Щоб отримувати сповіщення, надайте дозвіл у налаштуваннях пристрою.", [
          { text: "Скасувати", style: "cancel" },
          {
            text: "Відкрити налаштування",
            onPress: (): Promise<void> => Linking.openSettings(),
          },
        ])
        return
      }

      setPermissionStatus("granted")
    }

    setNotificationsEnabled(value)
    await saveNotificationSettings(value)

    if (value) {
      await scheduleStreakReminderNotification()
    } else {
      await cancelScheduledNotifications()
      setDailyRemindersEnabled(false)
      setAchievementNotificationsEnabled(false)
    }
  }

  const handleDailyRemindersToggle = async (value: boolean): Promise<void> => {
    setDailyRemindersEnabled(value)

    if (value) {
      await scheduleStreakReminderNotification()
    } else {
      await cancelScheduledNotifications()
    }
  }

  const handleAchievementNotificationsToggle = (value: boolean): void => {
    setAchievementNotificationsEnabled(value)
  }

  return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Налаштування інтерфейсу</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={colors.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {theme === "system" ? "Системна тема" : isDark ? "Темна тема" : "Світла тема"}
              </Text>
            </View>
            <Switch
                value={isDark}
                onValueChange={handleThemeChange}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.themeSelector}>
            <TouchableOpacity
                style={[styles.themeOption, theme === "light" && [styles.selectedTheme, { borderColor: colors.primary }]]}
                onPress={(): void => setTheme("light")}
            >
              <View style={styles.themePreview}>
                <View style={styles.lightThemePreview}>
                  <Text style={styles.themePreviewText}>Aa</Text>
                </View>
              </View>
              <Text style={[styles.themeLabel, { color: colors.text }]}>Світла</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.themeOption, theme === "dark" && [styles.selectedTheme, { borderColor: colors.primary }]]}
                onPress={(): void => setTheme("dark")}
            >
              <View style={styles.themePreview}>
                <View style={styles.darkThemePreview}>
                  <Text style={styles.darkThemePreviewText}>Aa</Text>
                </View>
              </View>
              <Text style={[styles.themeLabel, { color: colors.text }]}>Темна</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.themeOption, theme === "system" && [styles.selectedTheme, { borderColor: colors.primary }]]}
                onPress={(): void => setTheme("system")}
            >
              <View style={styles.themePreview}>
                <View style={styles.systemThemePreview}>
                  <View style={styles.systemThemeLeft}>
                    <Text style={styles.themePreviewText}>A</Text>
                  </View>
                  <View style={styles.systemThemeRight}>
                    <Text style={styles.darkThemePreviewText}>a</Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.themeLabel, { color: colors.text }]}>Системна</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Сповіщення</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Дозволити сповіщення</Text>
            </View>
            <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor="#f4f3f4"
            />
          </View>

          {notificationsEnabled && (
              <>
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="time-outline" size={24} color={colors.text} style={styles.settingIcon} />
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Щоденні нагадування</Text>
                  </View>
                  <Switch
                      value={dailyRemindersEnabled}
                      onValueChange={handleDailyRemindersToggle}
                      trackColor={{ false: "#767577", true: colors.primary }}
                      thumbColor="#f4f3f4"
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="trophy-outline" size={24} color={colors.text} style={styles.settingIcon} />
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Сповіщення про досягнення</Text>
                  </View>
                  <Switch
                      value={achievementNotificationsEnabled}
                      onValueChange={handleAchievementNotificationsToggle}
                      trackColor={{ false: "#767577", true: colors.primary }}
                      thumbColor="#f4f3f4"
                  />
                </View>
              </>
          )}

          {!notificationsEnabled && permissionStatus !== "granted" && (
              <View style={[styles.notificationInfo, { backgroundColor: `${colors.primary}20` }]}>
                <Text style={[styles.notificationInfoText, { color: colors.text }]}>
                  Увімкніть сповіщення, щоб отримувати нагадування про навчання та не втрачати серію занять.
                </Text>
              </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Про додаток</Text>

          <TouchableOpacity style={styles.aboutItem}>
            <Ionicons name="information-circle-outline" size={24} color={colors.text} style={styles.settingIcon} />
            <Text style={[styles.aboutLabel, { color: colors.text }]}>Версія 1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutItem} onPress={() => Linking.openURL("https://example.com/terms")}>
            <Ionicons name="document-text-outline" size={24} color={colors.text} style={styles.settingIcon} />
            <Text style={[styles.aboutLabel, { color: colors.text }]}>Умови використання</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutItem} onPress={() => Linking.openURL("https://example.com/privacy")}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.text} style={styles.settingIcon} />
            <Text style={[styles.aboutLabel, { color: colors.text }]}>Політика конфіденційності</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
  },
  themeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  themeOption: {
    alignItems: "center",
    width: "30%",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 10,
    padding: 10,
  },
  selectedTheme: {
    borderWidth: 2,
  },
  themePreview: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  lightThemePreview: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  darkThemePreview: {
    backgroundColor: "#121212",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },
  systemThemePreview: {
    flexDirection: "row",
    width: "100%",
    height: "100%",
  },
  systemThemeLeft: {
    backgroundColor: "#FFFFFF",
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  systemThemeRight: {
    backgroundColor: "#121212",
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },
  themePreviewText: {
    fontSize: 24,
    color: "#000000",
    fontWeight: "bold",
  },
  darkThemePreviewText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  themeLabel: {
    fontSize: 14,
  },
  aboutItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  aboutLabel: {
    fontSize: 16,
  },
  notificationInfo: {
    padding: 15,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 15,
  },
  notificationInfoText: {
    fontSize: 14,
    lineHeight: 20,
  },
})
