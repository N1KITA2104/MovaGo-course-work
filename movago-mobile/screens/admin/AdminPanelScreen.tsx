"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { useTheme } from "../../contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AdminStackParamList } from "../../types/navigation.types"

type AdminPanelScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList, "AdminPanel">

interface MenuItem {
  id: string
  title: string
  icon: keyof typeof Ionicons.glyphMap
  screen: keyof AdminStackParamList
  description: string
  disabled: boolean
}

export default function AdminPanelScreen() {
  const { colors } = useTheme()
  const navigation = useNavigation<AdminPanelScreenNavigationProp>()

  const menuItems: MenuItem[] = [
    {
      id: "users",
      title: "Користувачі",
      icon: "people-outline",
      screen: "UsersManagement",
      description: "Управління користувачами, перегляд статистики, блокування",
      disabled: false,
    },
    {
      id: "lessons",
      title: "Управління уроками",
      icon: "book-outline",
      screen: "LessonsManagement",
      description: "Створення та редагування уроків, питань та відповідей",
      disabled: false,
    },
    {
      id: "stats",
      title: "Статистика системи",
      icon: "bar-chart-outline",
      screen: "SystemStats",
      description: "Перегляд загальної статистики використання системи",
      disabled: false,
    },
    {
      id: "settings",
      title: "Налаштування",
      icon: "settings-outline",
      screen: "AdminPanel",
      description: "Налаштування системи, параметри, конфігурація",
      disabled: true,
    },
  ]

  const handleMenuItemPress = (screen: keyof AdminStackParamList): void => {
    switch (screen) {
      case "UsersManagement":
        navigation.navigate("UsersManagement")
        break
      case "LessonsManagement":
        navigation.navigate("LessonsManagement")
        break
      case "SystemStats":
        navigation.navigate("SystemStats")
        break
      case "AdminPanel":
        navigation.navigate("AdminPanel")
        break
      case "UserDetails":
        break
      case "LessonForm":
        break
    }
  }

  return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={32} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Панель адміністратора</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
              <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    item.disabled && styles.disabledMenuItem,
                  ]}
                  onPress={() => handleMenuItemPress(item.screen)}
                  disabled={item.disabled}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name={item.icon} size={24} color={colors.primary} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.menuItemDescription, { color: colors.secondaryText }]}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={item.disabled ? colors.border : colors.primary} />
              </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Інформація</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Версія системи:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Останнє оновлення:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{new Date().toLocaleDateString()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Статус системи:</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
                <Text style={[styles.infoValue, { color: colors.text }]}>Активна</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
  },
  menuContainer: {
    padding: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  menuItemDescription: {
    fontSize: 12,
  },
  infoSection: {
    padding: 15,
    paddingTop: 0,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoCard: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
})
