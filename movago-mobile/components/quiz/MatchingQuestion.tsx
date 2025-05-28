"use client"

import {useState, useEffect, useRef, MutableRefObject} from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useTheme } from "../../contexts/ThemeContext"
import type { MatchingQuestionProps } from "../../types/component.types"
import type { MatchingPair } from "../../types/lesson.types"

export default function MatchingQuestion({
                                           question,
                                           options,
                                           onAnswer,
                                           selectedMatches,
                                           isCorrect,
                                           hint = "Спробуйте ще раз",
                                           showHint = false,
                                         }: MatchingQuestionProps) {
  const { colors } = useTheme()
  const [leftSelected, setLeftSelected] = useState<string | null>(null)
  const [rightSelected, setRightSelected] = useState<string | null>(null)
  const [matches, setMatches] = useState<MatchingPair[]>([])
  const [leftOptions, setLeftOptions] = useState<string[]>([])
  const [rightOptions, setRightOptions] = useState<string[]>([])
  const [shuffledRightOptions, setShuffledRightOptions] = useState<string[]>([])

  const isInitialized: MutableRefObject<boolean> = useRef(false)
  const prevOptions: MutableRefObject<MatchingPair[]> = useRef<MatchingPair[]>([])
  const prevSelectedMatches: MutableRefObject<MatchingPair[]> = useRef<MatchingPair[]>([])

  useEffect((): void => {
    if (
        JSON.stringify(options) !== JSON.stringify(prevOptions.current) ||
        JSON.stringify(selectedMatches) !== JSON.stringify(prevSelectedMatches.current)
    ) {
      prevOptions.current = [...options]
      prevSelectedMatches.current = selectedMatches ? [...selectedMatches] : []

      if (selectedMatches && selectedMatches.length > 0) {
        setMatches(selectedMatches)

        const left: string[] = options
            .map((option: MatchingPair): string => option.left)
            .filter((item: string): boolean => !selectedMatches.some((match: MatchingPair): boolean => match.left === item))
        const right: string[] = options
            .map((option: MatchingPair): string => option.right)
            .filter((item: string): boolean => !selectedMatches.some((match: MatchingPair): boolean => match.right === item))

        setLeftOptions(left)
        setRightOptions(right)

        const shuffled: string[] = [...right].sort((): number => Math.random() - 0.5)
        setShuffledRightOptions(shuffled)
      } else {
        setMatches([])
        const left: string[] = options.map((option: MatchingPair): string => option.left)
        const right: string[] = options.map((option: MatchingPair): string => option.right)
        setLeftOptions(left)
        setRightOptions(right)

        const shuffled: string[] = [...right].sort((): number => Math.random() - 0.5)
        setShuffledRightOptions(shuffled)
      }

      isInitialized.current = true
    }
  }, [options, selectedMatches, question])

  useEffect((): void => {
    if (matches.length > 0 && isInitialized.current) {
      onAnswer(matches)
    }
  }, [matches, onAnswer])

  const handleLeftSelect: (item: string) => void = (item: string): void => {
    if (isCorrect !== null) return
    setLeftSelected(leftSelected === item ? null : item)

    if (rightSelected) {
      const newMatch = { left: item, right: rightSelected }

      setMatches((prev: MatchingPair[]): MatchingPair[] => [...prev, newMatch])
      setLeftSelected(null)
      setRightSelected(null)

      setLeftOptions((prev: string[]): string[] => prev.filter((option: string): boolean => option !== item))
      setRightOptions((prev: string[]): string[] => prev.filter((option: string): boolean => option !== rightSelected))
      setShuffledRightOptions((prev: string[]): string[] => prev.filter((option: string): boolean => option !== rightSelected))
    }
  }

  const handleRightSelect: (item: string) => void = (item: string): void => {
    if (isCorrect !== null) return
    setRightSelected(rightSelected === item ? null : item)

    if (leftSelected) {
      const newMatch = { left: leftSelected, right: item }

      setMatches((prev: MatchingPair[]): MatchingPair[] => [...prev, newMatch])
      setLeftSelected(null)
      setRightSelected(null)

      setLeftOptions((prev: string[]): string[] => prev.filter((option: string): boolean => option !== leftSelected))
      setRightOptions((prev: string[]): string[] => prev.filter((option: string): boolean => option !== item))
      setShuffledRightOptions((prev: string[]): string[] => prev.filter((option: string): boolean => option !== item))
    }
  }

  const removeMatch: (index: number) => void = (index: number): void => {
    if (isCorrect !== null) return
    const removedMatch: MatchingPair = matches[index]

    setMatches((prev: MatchingPair[]): MatchingPair[] => {
      const newMatches: MatchingPair[] = [...prev]
      newMatches.splice(index, 1)
      return newMatches
    })

    setLeftOptions((prev: string[]): string[] => [...prev, removedMatch.left])
    setRightOptions((prev: string[]): string[] => [...prev, removedMatch.right])

    setShuffledRightOptions((prev: string[]): string[] => {
      const updatedShuffled: string[] = [...prev]
      const originalIndex: number = options.findIndex((opt: MatchingPair): boolean => opt.right === removedMatch.right)
      const insertIndex: number = Math.min(updatedShuffled.length, originalIndex)
      updatedShuffled.splice(insertIndex, 0, removedMatch.right)
      return updatedShuffled
    })
  }

  const getMatchStyle = (index: number) => {
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

        <View style={styles.matchesContainer}>
          {matches.map((match: MatchingPair, index: number) => (
              <View key={index} style={[styles.matchItem, getMatchStyle(index)]}>
                <Text style={styles.matchText}>{match.left}</Text>
                <Text style={styles.matchSeparator}>→</Text>
                <Text style={styles.matchText}>{match.right}</Text>
                {isCorrect === null && (
                    <TouchableOpacity style={styles.removeButton} onPress={(): void => removeMatch(index)}>
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                )}
              </View>
          ))}
        </View>

        <View style={styles.optionsContainer}>
          <View style={styles.column}>
            {leftOptions.map((item: string, index: number) => (
                <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor: leftSelected === item ? colors.primary : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={(): void => handleLeftSelect(item)}
                    disabled={isCorrect !== null}
                >
                  <Text style={[styles.optionText, { color: leftSelected === item ? "#fff" : colors.text }]}>{item}</Text>
                </TouchableOpacity>
            ))}
          </View>

          <View style={styles.column}>
            {shuffledRightOptions.map((item: string, index: number) => (
                <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor: rightSelected === item ? colors.primary : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={(): void => handleRightSelect(item)}
                    disabled={isCorrect !== null}
                >
                  <Text style={[styles.optionText, { color: rightSelected === item ? "#fff" : colors.text }]}>{item}</Text>
                </TouchableOpacity>
            ))}
          </View>
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
  matchesContainer: {
    marginBottom: 20,
  },
  matchItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  matchText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  matchSeparator: {
    color: "#fff",
    fontSize: 16,
    marginHorizontal: 10,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    width: "48%",
  },
  optionItem: {
    padding: 12,
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
