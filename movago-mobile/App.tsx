"use client"

import { useEffect, useRef, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Platform, View, Text } from "react-native"
import MainNavigator from "./navigation/MainNavigator"
import AuthProvider from "./contexts/AuthContext"
import { ThemeProvider, useTheme } from "./contexts/ThemeContext"
import * as Notifications from "expo-notifications"
import { registerForPushNotificationsAsync } from "./services/notificationService"
import type { NotificationResponse } from "expo-notifications"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

const AppContent = () => {
  const { isDark, colors } = useTheme()
  const notificationListener = useRef<any>()
  const responseListener = useRef<any>()
  const [error, setError] = useState<Error | null>(null)

  useEffect((): (() => void) => {
    try {
      registerForPushNotificationsAsync().then()

      notificationListener.current = Notifications.addNotificationReceivedListener((notification): void => {
        console.log("Notification received:", notification)
      })

      responseListener.current = Notifications.addNotificationResponseReceivedListener(
          (response: NotificationResponse): void => {
            console.log("Notification response:", response)
          },
      )
    } catch (err) {
      console.error("Error in notification setup:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    }

    return (): void => {
      Notifications.removeNotificationSubscription(notificationListener.current)
      Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  const fontFamily = Platform.OS === "ios" ? "System" : "sans-serif"
  const fontFamilyMedium = Platform.OS === "ios" ? "System-Medium" : "sans-serif-medium"
  const fontFamilyBold = Platform.OS === "ios" ? "System-Bold" : "sans-serif-bold"
  const fontFamilyHeavy = Platform.OS === "ios" ? "System-Heavy" : "sans-serif-heavy"

  // Display error if one occurs
  if (error) {
    return (
        <SafeAreaProvider>
          <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
                backgroundColor: colors.background,
              }}
          >
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              Помилка запуску додатку
            </Text>
            <Text style={{ color: colors.text, marginBottom: 20 }}>{error.message}</Text>
            <Text style={{ color: colors.secondaryText, fontSize: 12 }}>
              Будь ласка, повідомте про цю помилку розробникам
            </Text>
          </View>
        </SafeAreaProvider>
    )
  }

  return (
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer
              theme={{
                dark: isDark,
                colors: {
                  primary: colors.primary,
                  background: colors.background,
                  card: colors.card,
                  text: colors.text,
                  border: colors.border,
                  notification: colors.notification,
                },
                fonts: {
                  regular: {
                    fontFamily: fontFamily,
                    fontWeight: "normal",
                  },
                  medium: {
                    fontFamily: fontFamilyMedium,
                    fontWeight: "normal",
                  },
                  bold: {
                    fontFamily: fontFamilyBold,
                    fontWeight: "bold",
                  },
                  heavy: {
                    fontFamily: fontFamilyHeavy,
                    fontWeight: "bold",
                  },
                },
              }}
          >
            <StatusBar style={isDark ? "light" : "dark"} />
            <MainNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
  )
}

export default function App() {
  return (
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
  )
}
