"use client"

import { useState, useContext } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { AuthContext } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { isValidEmail, isValidPassword } from "../utils/auth.utils"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../types/navigation.types"

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation<LoginScreenNavigationProp>()
  const { login } = useContext(AuthContext)
  const { colors } = useTheme()

  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [generalError, setGeneralError] = useState("")

  const handleLogin = async (): Promise<void> => {
    setEmailError("")
    setPasswordError("")
    setGeneralError("")

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

    setIsLoading(true)
    try {
      await login(email, password)
    } catch (error: any) {
      setGeneralError(error.message || "Невірна електронна пошта або пароль")
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.logo, { color: colors.primary }]}>Movago</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Додаток для вивчення мови</Text>

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

          <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Забули пароль?</Text>
          </TouchableOpacity>
        </View>

        {generalError ? (
            <View style={[styles.errorContainer, { backgroundColor: `${colors.error}20` }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{generalError}</Text>
            </View>
        ) : null}

        <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Увійти</Text>}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={[styles.registerText, { color: colors.secondaryText }]}>Немає облікового запису? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>Зареєструватися</Text>
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: -5,
    marginBottom: 15,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
  },
  registerLink: {
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
