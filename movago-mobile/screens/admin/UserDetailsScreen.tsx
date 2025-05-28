"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Switch } from "react-native"
import { useTheme } from "../../contexts/ThemeContext"
import { api } from "../../services/api"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AuthContext } from "../../contexts/AuthContext"
import { useContext } from "react"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"
import type { AdminStackParamList } from "../../types/navigation.types"
import type { User, UserRole, UserStatus } from "../../types/user.types"
import type { UpdateUserRoleRequest, UpdateUserStatusRequest } from "../../types/api.types"
import { formatDateTime } from "../../utils/date.utils"

type UserDetailsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList, "UserDetails">
type UserDetailsScreenRouteProp = RouteProp<AdminStackParamList, "UserDetails">

export default function UserDetailsScreen() {
  const { colors } = useTheme()
  const navigation = useNavigation<UserDetailsScreenNavigationProp>()
  const route = useRoute<UserDetailsScreenRouteProp>()
  const { userId } = route.params
  const { user: currentUser } = useContext(AuthContext)

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>("user")
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>("pending")
  const [isActive, setIsActive] = useState<boolean>(false)

  useEffect(() => {
    fetchUserDetails().then()
  }, [userId])

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role)
      setSelectedStatus(user.status)
      setIsActive(user.status === "active")
    }
  }, [user])

  const fetchUserDetails = async (): Promise<void> => {
    try {
      const response = await api.get("/api/auth/users")
      const allUsers = response.data.users as User[]

      const foundUser = allUsers.find((u) => u._id === userId)

      if (foundUser) {
        setUser(foundUser)
      } else {
        Alert.alert("Помилка", "Користувача не знайдено")
        navigation.goBack()
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
      Alert.alert("Помилка", "Не вдалося завантажити дані користувача")
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (role: UserRole): void => {
    setSelectedRole(role)
  }

  const handleStatusToggle = (value: boolean): void => {
    setIsActive(value)
    setSelectedStatus(value ? "active" : "inactive")
  }

  const saveChanges = async (): Promise<void> => {
    if (!user) return

    setSaving(true)
    try {
      if (selectedRole !== user.role) {
        const roleData: UpdateUserRoleRequest = { role: selectedRole }
        await api.put(`/api/auth/users/${user._id}/role`, roleData)
      }

      if (selectedStatus !== user.status) {
        const statusData: UpdateUserStatusRequest = { status: selectedStatus }
        await api.put(`/api/auth/users/${user._id}/status`, statusData)
      }

      Alert.alert("Успіх", "Дані користувача оновлено успішно")
      await fetchUserDetails()
    } catch (error) {
      console.error("Error updating user:", error)
      Alert.alert("Помилка", "Не вдалося оновити дані користувача")
    } finally {
      setSaving(false)
    }
  }

  const confirmDeleteUser = (): void => {
    Alert.alert("Видалити користувача", "Ви впевнені, що хочете видалити цього користувача? Ця дія незворотна.", [
      { text: "Скасувати", style: "cancel" },
      { text: "Видалити", style: "destructive", onPress: deleteUser },
    ])
  }

  const deleteUser = async (): Promise<void> => {
    if (!user) return

    setSaving(true)
    try {
      await api.delete(`/api/auth/users/${user._id}`)
      Alert.alert("Успіх", "Користувача видалено успішно")
      navigation.goBack()
    } catch (error) {
      console.error("Error deleting user:", error)
      Alert.alert("Помилка", "Не вдалося видалити користувача")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Завантаження даних користувача...</Text>
        </View>
    )
  }

  if (!user) {
    return (
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>Користувача не знайдено</Text>
          <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Повернутися</Text>
          </TouchableOpacity>
        </View>
    )
  }

  const isCurrentUser = currentUser?._id === user._id

  return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.userInitials}>
            <Text style={styles.initialsText}>{user.username.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Роль користувача</Text>
          <View style={[styles.roleSelector, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
                style={[
                  styles.roleOption,
                  { borderRightWidth: 1, borderRightColor: colors.border },
                  selectedRole === "user" && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleRoleChange("user")}
            >
              <Text
                  style={[
                    styles.roleText,
                    { color: selectedRole === "user" ? "#ffffff" : colors.text },
                    selectedRole === "user" && styles.selectedRoleText,
                  ]}
              >
                Користувач
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                  styles.roleOption,
                  { borderRightWidth: 1, borderRightColor: colors.border },
                  selectedRole === "moderator" && { backgroundColor: colors.warning },
                ]}
                onPress={() => handleRoleChange("moderator")}
            >
              <Text
                  style={[
                    styles.roleText,
                    { color: selectedRole === "moderator" ? "#ffffff" : colors.text },
                    selectedRole === "moderator" && styles.selectedRoleText,
                  ]}
              >
                Модератор
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                  styles.roleOption,
                  selectedRole === "admin" && { backgroundColor: colors.error },
                  isCurrentUser && styles.disabledOption,
                ]}
                onPress={() => !isCurrentUser && handleRoleChange("admin")}
                disabled={isCurrentUser}
            >
              <Text
                  style={[
                    styles.roleText,
                    { color: selectedRole === "admin" ? "#ffffff" : colors.text },
                    selectedRole === "admin" && styles.selectedRoleText,
                    isCurrentUser && styles.disabledText,
                  ]}
              >
                Адміністратор
              </Text>
            </TouchableOpacity>
          </View>
          {isCurrentUser && (
              <Text style={[styles.warningText, { color: colors.error }]}>
                Ви не можете змінити власну роль адміністратора
              </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Статус облікового запису</Text>
          <View style={[styles.statusContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>Активний</Text>
              <Switch
                  value={isActive}
                  onValueChange={handleStatusToggle}
                  trackColor={{ false: "#767577", true: colors.primary }}
                  thumbColor="#f4f3f4"
                  disabled={isCurrentUser}
              />
            </View>
            <Text style={[styles.statusDescription, { color: colors.secondaryText }]}>
              {isActive
                  ? "Користувач може входити в систему і використовувати всі функції"
                  : "Користувач не може входити в систему"}
            </Text>
            {isCurrentUser && (
                <Text style={[styles.warningText, { color: colors.error }]}>
                  Ви не можете деактивувати власний обліковий запис
                </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Інформація про користувача</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>ID:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user._id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Створено:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{formatDateTime(user.createdAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Оновлено:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{formatDateTime(user.updatedAt)}</Text>
            </View>
            {user.description && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Опис:</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{user.description}</Text>
                </View>
            )}
          </View>
        </View>

        {user.progress && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Прогрес навчання</Text>
              <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.progressRow}>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressValue, { color: colors.primary }]}>{user.progress.level}</Text>
                    <Text style={[styles.progressLabel, { color: colors.secondaryText }]}>Рівень</Text>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressValue, { color: colors.primary }]}>{user.progress.xp}</Text>
                    <Text style={[styles.progressLabel, { color: colors.secondaryText }]}>XP</Text>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={[styles.progressValue, { color: colors.primary }]}>{user.progress.streakDays}</Text>
                    <Text style={[styles.progressLabel, { color: colors.secondaryText }]}>Днів поспіль</Text>
                  </View>
                </View>
                <View style={styles.progressRow}>
                  <Text style={[styles.progressLabel, { color: colors.secondaryText }]}>
                    Завершено уроків: {user.progress.completedLessons?.length || 0}
                  </Text>
                </View>
              </View>
            </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={saveChanges}
              disabled={saving}
          >
            {saving ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Зберегти зміни</Text>
                </>
            )}
          </TouchableOpacity>

          {!isCurrentUser && (
              <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: colors.error }]}
                  onPress={confirmDeleteUser}
                  disabled={saving}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Видалити користувача</Text>
              </TouchableOpacity>
          )}
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginVertical: 20,
    textAlign: "center",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    padding: 30,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userInitials: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  initialsText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  roleSelector: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  roleText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedRoleText: {
    color: "#ffffff", // Ensure white text for better contrast on colored backgrounds
    fontWeight: "bold",
  },
  disabledOption: {
    opacity: 0.5,
  },
  disabledText: {
    color: "#999",
  },
  statusContainer: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  statusDescription: {
    fontSize: 14,
  },
  warningText: {
    fontSize: 12,
    marginTop: 10,
    fontStyle: "italic",
  },
  infoCard: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
  },
  progressCard: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  progressItem: {
    alignItems: "center",
  },
  progressValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressLabel: {
    fontSize: 14,
  },
  actionButtons: {
    padding: 20,
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3, // Добавляем тень для Android
    shadowColor: "#000", // Добавляем тень для iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  deleteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
})
