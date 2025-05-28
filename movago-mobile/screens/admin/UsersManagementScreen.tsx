"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from "react-native"
import { useTheme } from "../../contexts/ThemeContext"
import { api } from "../../services/api"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AdminStackParamList } from "../../types/navigation.types"
import type { User, UserRole, UserStatus } from "../../types/user.types"
import type { AxiosResponse } from "axios"
import type { UsersResponse } from "../../types/api.types"
import { sanitizeInput } from "../../utils/string.utils"

type UsersManagementScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList, "UsersManagement">

export default function UsersManagementScreen() {
  const { colors } = useTheme()
  const navigation = useNavigation<UsersManagementScreenNavigationProp>()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const sanitizeSearchQuery = (query: string): string => {
    return sanitizeInput(query.replace(/[<>]/g, ""))
  }

  const fetchUsers = useCallback(async (): Promise<void> => {
    try {
      const response: AxiosResponse<UsersResponse> = await api.get("/api/auth/users")
      setUsers(response.data.users)
    } catch (error: any) {
      console.error("Error fetching users:", error)

      let errorMessage = "Не вдалося завантажити список користувачів"
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      Alert.alert("Помилка", errorMessage)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect((): void => {
    fetchUsers().then()
  }, [fetchUsers])

  const onRefresh = (): void => {
    setRefreshing(true)
    fetchUsers().then()
  }

  const handleUserPress = (user: User): void => {
    navigation.navigate("UserDetails", { userId: user._id })
  }

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case "admin":
        return "Адміністратор"
      case "moderator":
        return "Модератор"
      case "user":
        return "Користувач"
      default:
        return role
    }
  }

  const getStatusLabel = (status: UserStatus): string => {
    switch (status) {
      case "active":
        return "Активний"
      case "inactive":
        return "Неактивний"
      case "pending":
        return "Очікує підтвердження"
      default:
        return status
    }
  }

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case "admin":
        return colors.error
      case "moderator":
        return colors.warning
      case "user":
        return colors.primary
      default:
        return colors.secondaryText
    }
  }

  const getStatusColor = (status: UserStatus): string => {
    switch (status) {
      case "active":
        return colors.success
      case "inactive":
        return colors.error
      case "pending":
        return colors.warning
      default:
        return colors.secondaryText
    }
  }

  const filteredUsers: User[] = users.filter(
      (user: User): boolean =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const renderUserItem = ({ item }: { item: User }) => (
      <TouchableOpacity
          style={[styles.userItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={(): void => handleUserPress(item)}
      >
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
          <Text style={[styles.email, { color: colors.secondaryText }]}>{item.email}</Text>
          <View style={styles.tagsContainer}>
            <View style={[styles.roleTag, { backgroundColor: getRoleColor(item.role) }]}>
              <Text style={styles.tagText}>{getRoleLabel(item.role)}</Text>
            </View>
            <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.tagText}>{getStatusLabel(item.status)}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
      </TouchableOpacity>
  )

  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.secondaryText} style={styles.searchIcon} />
          <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Пошук користувачів..."
              placeholderTextColor={colors.secondaryText}
              value={searchQuery}
              onChangeText={(text: string): void => setSearchQuery(sanitizeSearchQuery(text))}
          />
          {searchQuery.length > 0 && (
              <TouchableOpacity onPress={(): void => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
          )}
        </View>

        {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Завантаження користувачів...</Text>
            </View>
        ) : (
            <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={(item: User): string => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={64} color={colors.secondaryText} />
                    <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                      {searchQuery.length > 0 ? "Користувачів за вашим запитом не знайдено" : "Список користувачів порожній"}
                    </Text>
                  </View>
                }
            />
        )}
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    margin: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
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
  listContainer: {
    padding: 15,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
  },
  roleTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
})
