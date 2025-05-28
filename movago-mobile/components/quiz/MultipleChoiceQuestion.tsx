"use client"

import {useState, useEffect, useRef, MutableRefObject} from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useTheme } from "../../contexts/ThemeContext"
import type { MultipleChoiceQuestionProps } from "../../types/component.types"

export default function MultipleChoiceQuestion({
                                                 question,
                                                 options,
                                                 onAnswer,
                                                 selectedAnswer,
                                                 isCorrect,
                                                 hint = "Спробуйте ще раз",
                                                 showHint = false,
                                               }: MultipleChoiceQuestionProps) {
  const { colors } = useTheme()
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([])

  const isInitialized: MutableRefObject<boolean> = useRef(false)
  const prevOptions: MutableRefObject<string[]> = useRef<string[]>([])

  useEffect((): void => {
    if (JSON.stringify(options) !== JSON.stringify(prevOptions.current)) {
      prevOptions.current = [...options]
      const shuffled: string[] = [...options].sort((): number => Math.random() - 0.5)
      setShuffledOptions(shuffled)
      isInitialized.current = true
    }
  }, [options, question])

  const getOptionStyle = (option: string) => {
    if (isCorrect === null) {
      return {
        backgroundColor: selectedAnswer === option ? colors.primary : colors.card,
        borderColor: selectedAnswer === option ? colors.primary : colors.border,
      }
    } else if (isCorrect) {
      return {
        backgroundColor: selectedAnswer === option ? colors.success : colors.card,
        borderColor: selectedAnswer === option ? colors.success : colors.border,
      }
    } else {
      if (selectedAnswer === option) {
        return {
          backgroundColor: colors.error,
          borderColor: colors.error,
        }
      } else if (
          selectedAnswer !== null &&
          option === options.find((opt: string): boolean => opt === options[options.indexOf(selectedAnswer)])
      ) {
        return {
          backgroundColor: colors.success,
          borderColor: colors.success,
        }
      } else {
        return {
          backgroundColor: colors.card,
          borderColor: colors.border,
        }
      }
    }
  }

  const getOptionTextStyle = (option: string) => {
    if (isCorrect === null) {
      return {
        color: selectedAnswer === option ? "#fff" : colors.text,
        fontWeight: selectedAnswer === option ? ("bold" as const) : ("normal" as const),
      }
    } else if (isCorrect) {
      return {
        color: selectedAnswer === option ? "#fff" : colors.text,
        fontWeight: selectedAnswer === option ? ("bold" as const) : ("normal" as const),
      }
    } else {
      if (selectedAnswer === option) {
        return {
          color: "#fff",
          fontWeight: "bold" as const,
        }
      } else if (
          selectedAnswer !== null &&
          option === options.find((opt: string): boolean => opt === options[options.indexOf(selectedAnswer)])
      ) {
        return {
          color: "#fff",
          fontWeight: "bold" as const,
        }
      } else {
        return {
          color: colors.text,
          fontWeight: "normal" as const,
        }
      }
    }
  }

  return (
      <View style={styles.container}>
        <Text style={[styles.question, { color: colors.text }]}>{question}</Text>

        <View style={styles.optionsContainer}>
          {shuffledOptions.length > 0
              ? shuffledOptions.map((option, index) => (
                  <TouchableOpacity
                      key={index}
                      style={[styles.option, getOptionStyle(option)]}
                      onPress={() => isCorrect === null && onAnswer(option)}
                      disabled={isCorrect !== null}
                  >
                    <Text style={[styles.optionText, getOptionTextStyle(option)]}>{option}</Text>
                  </TouchableOpacity>
              ))
              : options.map((option, index) => (
                  <TouchableOpacity
                      key={index}
                      style={[styles.option, getOptionStyle(option)]}
                      onPress={() => isCorrect === null && onAnswer(option)}
                      disabled={isCorrect !== null}
                  >
                    <Text style={[styles.optionText, getOptionTextStyle(option)]}>{option}</Text>
                  </TouchableOpacity>
              ))}
        </View>

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
  optionsContainer: {
    marginTop: 10,
  },
  option: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
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
