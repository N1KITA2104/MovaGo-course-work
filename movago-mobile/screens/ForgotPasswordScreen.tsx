"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../contexts/ThemeContext"
import { passwordResetService } from "../services/passwordResetService"
import type { ForgotPasswordScreenNavigationProp } from "../types/navigation.types"

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isCodeSent, setIsCodeSent] = useState(false)

    const navigation = useNavigation<ForgotPasswordScreenNavigationProp>()
    const { colors } = useTheme()

    const validateEmail = (): boolean => {
        setEmailError("")

        if (!email) {
            setEmailError("Електронна пошта обов'язкова")
            return false
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setEmailError("Введіть дійсну електронну пошту")
            return false
        }

        return true
    }

    const handleRequestReset = async (): Promise<void> => {
        if (!validateEmail()) return

        setIsLoading(true)
        try {
            await passwordResetService.requestReset(email)
            setIsCodeSent(true)
            navigation.navigate("VerifyResetCode", { email })
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Не вдалося відправити код. Спробуйте пізніше."
            setEmailError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Відновлення паролю</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                Введіть вашу електронну пошту, і ми відправимо вам код для відновлення паролю
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
                    placeholder="Електронна пошта"
                    placeholderTextColor={colors.secondaryText}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                {emailError ? <Text style={[styles.errorText, { color: colors.error }]}>{emailError}</Text> : null}
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleRequestReset}
                disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Відправити код</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.backButtonText, { color: colors.secondaryText }]}>Повернутися до входу</Text>
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
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
    },
    backButton: {
        marginTop: 20,
        padding: 10,
    },
    backButtonText: {
        fontSize: 16,
    },
})
