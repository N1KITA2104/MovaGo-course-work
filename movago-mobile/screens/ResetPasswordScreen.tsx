"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTheme } from "../contexts/ThemeContext"
import { passwordResetService } from "../services/passwordResetService"
import type { ResetPasswordScreenNavigationProp, ResetPasswordScreenRouteProp } from "../types/navigation.types"

export default function ResetPasswordScreen() {
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const navigation = useNavigation<ResetPasswordScreenNavigationProp>()
    const route = useRoute<ResetPasswordScreenRouteProp>()
    const { email, resetToken} = route.params
    const { colors } = useTheme()

    const validatePassword = (): boolean => {
        setPasswordError("")

        if (!newPassword) {
            setPasswordError("Пароль обов'язковий")
            return false
        }

        if (newPassword.length < 8) {
            setPasswordError("Пароль має містити щонайменше 8 символів")
            return false
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Паролі не співпадають")
            return false
        }

        return true
    }

    const handleResetPassword = async (): Promise<void> => {
        if (!validatePassword()) return

        setIsLoading(true)
        try {
            await passwordResetService.resetPassword(email, resetToken, newPassword)
            Alert.alert("Успішно", "Ваш пароль було успішно змінено. Тепер ви можете увійти з новим паролем.", [
                {
                    text: "OK",
                    onPress: () => navigation.navigate("Login"),
                },
            ])
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Не вдалося змінити пароль. Спробуйте пізніше."
            setPasswordError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Створіть новий пароль</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                Ваш новий пароль має містити щонайменше 8 символів
            </Text>

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
                    placeholder="Новий пароль"
                    placeholderTextColor={colors.secondaryText}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                />

                <TextInput
                    style={[
                        styles.input,
                        {
                            color: colors.text,
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                        },
                    ]}
                    placeholder="Підтвердіть новий пароль"
                    placeholderTextColor={colors.secondaryText}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                {passwordError ? <Text style={[styles.errorText, { color: colors.error }]}>{passwordError}</Text> : null}
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleResetPassword}
                disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Змінити пароль</Text>}
            </TouchableOpacity>
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
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 30,
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
    button: {
        width: "100%",
        height: 50,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    errorText: {
        fontSize: 14,
        marginTop: -5,
        marginBottom: 15,
    },
})
