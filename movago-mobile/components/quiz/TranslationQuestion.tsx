"use client"

import { View, Text, StyleSheet, TextInput } from "react-native"
import { useTheme } from "../../contexts/ThemeContext"
import type { TranslationQuestionProps } from "../../types/component.types"
import { sanitizeInput } from "../../utils/string.utils"
import { useEffect } from "react"

export default function TranslationQuestion({
                                                question,
                                                onAnswer,
                                                answer,
                                                isCorrect,
                                                hint = "Спробуйте ще раз",
                                                showHint = false,
                                                correctAnswer = "",
                                            }: TranslationQuestionProps) {
    const { colors } = useTheme()

    useEffect((): void => {
        if (isCorrect === null) {
            onAnswer("")
        }
    }, [question])

    const getInputStyle = () => {
        if (isCorrect === null) {
            return {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.card,
            }
        } else if (isCorrect) {
            return {
                borderColor: colors.success,
                color: colors.success,
                backgroundColor: `${colors.success}10`,
            }
        } else {
            return {
                borderColor: colors.error,
                color: colors.error,
                backgroundColor: `${colors.error}10`,
            }
        }
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.question, { color: colors.text }]}>{question}</Text>

            <TextInput
                style={[styles.input, getInputStyle()]}
                value={answer}
                onChangeText={(text: string): void => {
                    if (isCorrect === null) {
                        const sanitizedText: string = sanitizeInput(text)
                        onAnswer(sanitizedText)
                    }
                }}
                placeholder="Введіть переклад..."
                placeholderTextColor={colors.secondaryText}
                editable={isCorrect === null}
                autoCapitalize="none"
                autoCorrect={false}
            />

            {isCorrect === false && (
                <Text style={[styles.correctAnswer, { color: colors.success }]}>Правильна відповідь: {correctAnswer}</Text>
            )}

            {showHint && (
                <View style={[styles.hintContainer, { backgroundColor: `${colors.error}20` }]}>
                    <Text style={[styles.hintText, { color: colors.error }]}>{hint}</Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    question: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 10,
    },
    correctAnswer: {
        fontSize: 14,
        marginTop: 10,
        fontWeight: "500",
    },
    hintContainer: {
        padding: 15,
        borderRadius: 10,
        marginTop: 15,
    },
    hintText: {
        fontSize: 14,
        fontWeight: "500",
    },
})
