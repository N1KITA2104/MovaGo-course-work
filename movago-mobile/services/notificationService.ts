import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { isPhysicalDevice, configureNotificationChannels, createDailyTrigger } from "../utils/notification.utils"
import {PermissionStatus} from "expo-image-picker";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export async function registerForPushNotificationsAsync(): Promise<string | null | undefined> {
  let token

  if (await isPhysicalDevice()) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus: PermissionStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      return null
    }

    token = (await Notifications.getExpoPushTokenAsync()).data
  } else {
    console.log("Must use physical device for Push Notifications")
  }

  await configureNotificationChannels()

  return token
}

export async function scheduleStreakReminderNotification(): Promise<void> {
  await cancelScheduledNotifications()

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Не забудьте про навчання!",
      body: "Продовжіть свою серію занять сьогодні!",
      sound: true,
    },
    trigger: createDailyTrigger(20, 0), // 8:00 PM
  })
}

export async function sendStreakLostNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Ой! Ви втратили свою серію",
      body: "Ви не займалися вчора. Почніть нову серію сьогодні!",
      sound: true,
    },
    trigger: null,
  })
}

export async function cancelScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

export async function saveNotificationSettings(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem("@Movago:notificationsEnabled", JSON.stringify(enabled))
}

export async function getNotificationSettings(): Promise<boolean> {
  const settings: string | null = await AsyncStorage.getItem("@Movago:notificationsEnabled")
  return settings ? JSON.parse(settings) : false
}

export async function checkAndUpdateStreakStatus(currentStreak: number, lastActivityDate: Date | null): Promise<void> {
  const lastCheckedStr: string | null = await AsyncStorage.getItem("@Movago:lastStreakCheck")
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (lastCheckedStr) {
    const lastChecked = new Date(JSON.parse(lastCheckedStr))
    lastChecked.setHours(0, 0, 0, 0)

    if (lastChecked.getTime() === today.getTime()) {
      return
    }
  }

  await AsyncStorage.setItem("@Movago:lastStreakCheck", JSON.stringify(today))

  if (!lastActivityDate) return

  const lastActivity = new Date(lastActivityDate)
  lastActivity.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  if (lastActivity.getTime() < yesterday.getTime() && currentStreak > 0) {
    const notificationsEnabled: boolean = await getNotificationSettings()
    if (notificationsEnabled) {
      await sendStreakLostNotification()
    }
  }
}
