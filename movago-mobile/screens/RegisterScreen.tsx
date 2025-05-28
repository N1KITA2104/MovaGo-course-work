"use client"

import { useState, useContext } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AuthContext } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { isValidEmail, isValidPassword, isValidUsername } from "../utils/auth.utils"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../types/navigation.types"

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Register">

export default function RegisterScreen() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation<RegisterScreenNavigationProp>()
  const { register } = useContext(AuthContext)
  const { colors } = useTheme()

  const [usernameError, setUsernameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [generalError, setGeneralError] = useState("")

  const handleRegister = async (): Promise<void> => {
    setUsernameError("")
    setEmailError("")
    setPasswordError("")
    setConfirmPasswordError("")
    setGeneralError("")

    if (!username) {
      setUsernameError("Ім'я користувача обов'язкове")
      return
    } else if (!isValidUsername(username)) {
      setUsernameError("Ім'я користувача має містити не менше 3 символів")
      return
    }

    if (!email) {
      setEmailError("Електронна пошта обов'язкова")
      return
    } else if (!isValidEmail(email)) {
      setEmailError("Введіть коректну електронну пошту")
      return
    }

    if (!password) {
      setPasswordError("Пароль обов'язковий")
      return
    } else if (!isValidPassword(password)) {
      setPasswordError("Пароль має містити не менше 6 символів")
      return
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Підтвердження пароля обов'язкове")
      return
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Паролі не співпадають")
      return
    }

    setIsLoading(true)
    try {
      await register(username, email, password)
    } catch (error: any) {
      setGeneralError(error.message || "Не вдалося створити обліковий запис. Спробуйте ще раз.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.logo, { color: colors.primary }]}>Movago</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Створити обліковий запис</Text>

        <View style={styles.inputContainer}>
          <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Ім'я користувача"
              placeholderTextColor={colors.secondaryText}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
          />
          {usernameError ? <Text style={[styles.errorText, { color: colors.error }]}>{usernameError}</Text> : null}
          <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Електронна пошта"
              placeholderTextColor={colors.secondaryText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
          />
          {emailError ? <Text style={[styles.errorText, { color: colors.error }]}>{emailError}</Text> : null}
          <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Пароль"
              placeholderTextColor={colors.secondaryText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
          />
          {passwordError ? <Text style={[styles.errorText, { color: colors.error }]}>{passwordError}</Text> : null}
          <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Підтвердіть пароль"
              placeholderTextColor={colors.secondaryText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
          />
          {confirmPasswordError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{confirmPasswordError}</Text>
          ) : null}
        </View>

        {generalError ? (
            <View style={[styles.errorContainer, { backgroundColor: `${colors.error}20` }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{generalError}</Text>
            </View>
        ) : null}

        <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={isLoading}
        >
          {isLoading ? (
              <ActivityIndicator color="#fff" />
          ) : (
              <Text style={styles.registerButtonText}>Зареєструватися</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: colors.secondaryText }]}>Вже маєте обліковий запис? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Увійти</Text>
          </TouchableOpacity>
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  registerButton: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
  },
  errorContainer: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
})
