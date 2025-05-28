import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"

/**
 * Configures notification channels for Android
 */
export const configureNotificationChannels: () => Promise<void> = async (): Promise<void> => {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#13AA52",
        })

        await Notifications.setNotificationChannelAsync("reminders", {
            name: "Reminders",
            description: "Daily reminders to continue your learning streak",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#13AA52",
        })

        await Notifications.setNotificationChannelAsync("achievements", {
            name: "Achievements",
            description: "Notifications about your achievements",
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#13AA52",
        })
    }
}

/**
 * Checks if the app is running on a physical device
 * @returns Boolean indicating if the app is running on a physical device
 */
export const isPhysicalDevice: () => Promise<boolean> = async (): Promise<boolean> => {
    return Device.isDevice
}

/**
 * Creates a notification trigger for a specific time
 * @param hour - Hour of the day (0-23)
 * @param minute - Minute of the hour (0-59)
 * @returns Notification trigger object
 */
export interface Channel {
    channelId: string,
    date: Date
}

export const createDailyTrigger: (hour: number, minute: number) => Channel = (hour: number, minute: number): Channel => {
    const now = new Date()
    const triggerDate = new Date(now)
    triggerDate.setHours(hour, minute, 0, 0)

    if (triggerDate <= now) {
        triggerDate.setDate(triggerDate.getDate() + 1)
    }

    return {
        channelId: "reminders",
        date: triggerDate,
    }
}
