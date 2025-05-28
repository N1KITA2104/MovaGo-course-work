"use client"

import { useState, useContext } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AuthContext } from "../contexts/AuthContext"
import { api } from "../services/api"
import { useTheme } from "../contexts/ThemeContext"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { ProfileStackParamList } from "../types/navigation.types"
import type { UpdateProfileRequest } from "../types/api.types"
import { sanitizeInput } from "../utils/string.utils"

type EditProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, "EditProfile">

export default function EditProfileScreen() {
  const { user, refreshUserData } = useContext(AuthContext)
  const { colors } = useTheme()
  const navigation = useNavigation<EditProfileScreenNavigationProp>()

  const [username, setUsername] = useState<string>(user?.username || "")
  const [description, setDescription] = useState<string>(user?.description || "")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleUpdateProfile = async (): Promise<void> => {
    if (!username) {
      Alert.alert("Помилка", "Ім'я користувача обов'язкове")
      return
    }

    setIsLoading(true)
    try {
      const updateData: UpdateProfileRequest = {
        username: sanitizeInput(username),
        description: sanitizeInput(description),
      }

      await api.put("/api/auth/profile", updateData)

      await refreshUserData()
      Alert.alert("Успіх", "Профіль оновлено успішно")
      navigation.goBack()
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Помилка", "Не вдалося оновити профіль")
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.avatarContainer}>
          <Image source={require("../assets/default-avatar.png")} style={styles.profilePhoto} resizeMode="cover" />
          <Text style={[styles.photoInfo, { color: colors.secondaryText }]}>Фото профілю за замовчуванням</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Ім'я користувача</Text>
          <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              value={username}
              onChangeText={setUsername}
              placeholder="Введіть ім'я користувача"
              placeholderTextColor={colors.secondaryText}
          />

          <Text style={[styles.label, { color: colors.text }]}>Опис</Text>
          <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Розкажіть про себе"
              placeholderTextColor={colors.secondaryText}
              multiline
              numberOfLines={4}
          />

          <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleUpdateProfile}
              disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Зберегти зміни</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#fff",
  },
  photoInfo: {
    fontSize: 14,
    marginBottom: 10,
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
})
