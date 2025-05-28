"use client"

import { useState, useEffect, useRef, MutableRefObject } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { useTheme } from "../../contexts/ThemeContext"
import type { WordOrderQuestionProps } from "../../types/component.types"

export default function WordOrderQuestion({
                                            question,
                                            options,
                                            onAnswer,
                                            selectedOrder,
                                            isCorrect,
                                            hint = "Спробуйте ще раз",
                                            showHint = false,
                                          }: WordOrderQuestionProps) {
  const { colors } = useTheme()
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [selectedWords, setSelectedWords] = useState<string[]>([])

  const isInitialized: MutableRefObject<boolean> = useRef(false)
  const prevOptions: MutableRefObject<string[]> = useRef<string[]>([])
  const prevSelectedOrder: MutableRefObject<string[]> = useRef<string[]>([])

  useEffect((): void => {
    if (
        JSON.stringify(options) !== JSON.stringify(prevOptions.current) ||
        JSON.stringify(selectedOrder) !== JSON.stringify(prevSelectedOrder.current)
    ) {
      prevOptions.current = [...options]
      prevSelectedOrder.current = selectedOrder ? [...selectedOrder] : []

      if (selectedOrder && selectedOrder.length > 0) {
        setSelectedWords(selectedOrder)

        const available: string[] = options.filter((word: string): boolean => !selectedOrder.includes(word))
        setAvailableWords(available)
      } else {
        setSelectedWords([])

        const shuffled: string[] = [...options].sort((): number => Math.random() - 0.5)
        setAvailableWords(shuffled)
      }

      isInitialized.current = true
    }
  }, [options, selectedOrder, question])

  useEffect((): void => {
    if (selectedWords.length > 0 && isInitialized.current) {
      onAnswer(selectedWords)
    }
  }, [selectedWords, onAnswer])

  const selectWord:(word: string) => void = (word: string): void => {
    if (isCorrect !== null) return

    setSelectedWords((prev: string[]): string[] => [...prev, word])
    setAvailableWords((prev: string[]): string[] => prev.filter((w: string): boolean => w !== word))
  }

  const removeWord: (index: number) => void = (index: number): void => {
    if (isCorrect !== null) return
    const word: string = selectedWords[index]

    setSelectedWords((prev: string[]): string[] => {
      const newSelected: string[] = [...prev]
      newSelected.splice(index, 1)
      return newSelected
    })

    setAvailableWords((prev: string[]): string[] => {
      const originalIndex: number = options.indexOf(word)
      const newAvailable: string[] = [...prev]

      let insertIndex: number = 0
      while (insertIndex < newAvailable.length && options.indexOf(newAvailable[insertIndex]) < originalIndex) {
        insertIndex++
      }

      newAvailable.splice(insertIndex, 0, word)
      return newAvailable
    })
  }

  const getSelectedWordStyle = (index: number) => {
    if (isCorrect === null) {
      return { backgroundColor: colors.primary }
    } else if (isCorrect) {
      return { backgroundColor: colors.success }
    } else {
      return { backgroundColor: colors.error }
    }
  }

  return (
      <View style={styles.container}>
        <Text style={[styles.question, { color: colors.text }]}>{question}</Text>

        <View style={[styles.sentenceContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sentenceContent}>
            {selectedWords.map((word: string, index: number) => (
                <TouchableOpacity
                    key={index}
                    style={[styles.selectedWord, getSelectedWordStyle(index)]}
                    onPress={(): void => removeWord(index)}
                    disabled={isCorrect !== null}
                >
                  <Text style={styles.selectedWordText}>{word}</Text>
                  {isCorrect === null && <Text style={styles.removeText}>×</Text>}
                </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.availableWordsContainer}>
          {availableWords.map((word: string, index: number) => (
              <TouchableOpacity
                  key={index}
                  style={[styles.availableWord, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={(): void => selectWord(word)}
                  disabled={isCorrect !== null}
              >
                <Text style={[styles.availableWordText, { color: colors.text }]}>{word}</Text>
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
  sentenceContainer: {
    minHeight: 60,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  sentenceContent: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  selectedWord: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedWordText: {
    color: "#fff",
    fontSize: 16,
  },
  removeText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 5,
    fontWeight: "bold",
  },
  availableWordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  availableWord: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  availableWordText: {
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
