"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTheme } from "../contexts/ThemeContext"
import { passwordResetService } from "../services/passwordResetService"
import type { VerifyResetCodeScreenNavigationProp, VerifyResetCodeScreenRouteProp } from "../types/navigation.types"

export default function VerifyResetCodeScreen() {
    const [code, setCode] = useState("")
    const [codeError, setCodeError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const navigation = useNavigation<VerifyResetCodeScreenNavigationProp>()
    const route = useRoute<VerifyResetCodeScreenRouteProp>()
    const { email } = route.params
    const { colors } = useTheme()

    const handleVerifyCode = async (): Promise<void> => {
        setCodeError("")

        if (!code) {
            setCodeError("Код підтвердження обов'язковий")
            return
        } else if (code.length !== 6) {
            setCodeError("Код має містити 6 цифр")
            return
        }

        setIsLoading(true)
        try {
            const response = await passwordResetService.verifyCode(email, code)
            // If we get here, the code was valid (otherwise an error would be thrown)
            navigation.navigate("ResetPassword", { email, resetToken: response.resetToken })
        } catch (error: any) {
            console.error("Verification error:", error)
            const errorMessage = error.response?.data?.message || "Невірний код підтвердження"
            setCodeError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async (): Promise<void> => {
        setIsLoading(true)
        try {
            await passwordResetService.requestReset(email)
            Alert.alert("Успішно", "Новий код відправлено на вашу електронну пошту")
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Не вдалося відправити новий код. Спробуйте пізніше."
            Alert.alert("Помилка", errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Перевірка коду</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                Введіть 6-значний код, який ми відправили на {email}
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
                    placeholder="6-значний код"
                    placeholderTextColor={colors.secondaryText}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                />
                {codeError ? <Text style={[styles.errorText, { color: colors.error }]}>{codeError}</Text> : null}
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleVerifyCode}
                disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Перевірити код</Text>}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
                <Text style={[styles.resendText, { color: colors.secondaryText }]}>Не отримали код? </Text>
                <TouchableOpacity onPress={handleResendCode} disabled={isLoading}>
                    <Text style={[styles.resendLink, { color: colors.primary }]}>Відправити знову</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("ForgotPassword")}>
                <Text style={[styles.backButtonText, { color: colors.secondaryText }]}>Змінити електронну пошту</Text>
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
        textAlign: "center",
        letterSpacing: 8,
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
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
    },
    resendContainer: {
        flexDirection: "row",
        marginTop: 20,
    },
    resendText: {
        fontSize: 16,
    },
    resendLink: {
        fontSize: 16,
        fontWeight: "bold",
    },
    backButton: {
        marginTop: 20,
        padding: 10,
    },
    backButtonText: {
        fontSize: 16,
    },
})
