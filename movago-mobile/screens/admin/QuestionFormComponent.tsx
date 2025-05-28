"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useTheme } from "../../contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import type { QuestionFormComponentProps } from "../../types/component.types"
import type { MatchingPair, Question, QuestionType } from "../../types/lesson.types"
import { getQuestionTypeLabel } from "../../utils/lesson.utils"
import { sanitizeInput } from "../../utils/string.utils"

export default function QuestionFormComponent({ question, onUpdate }: QuestionFormComponentProps) {
  const { colors } = useTheme()
  const [questionType, setQuestionType] = useState<QuestionType>(question.type || "multiple-choice")
  const [questionText, setQuestionText] = useState<string>(question.question || "")
  const [hint, setHint] = useState<string>(question.hint || "")
  const [options, setOptions] = useState<string[]>(
      Array.isArray(question.options) && typeof question.options[0] === "string" ? (question.options as string[]) : [],
  )
  const [correctAnswer, setCorrectAnswer] = useState<string | string[]>(
      typeof question.correctAnswer === "string" || Array.isArray(question.correctAnswer)
          ? (question.correctAnswer as string | string[])
          : "",
  )
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>(
      Array.isArray(question.options) && typeof question.options[0] === "object"
          ? (question.options as MatchingPair[])
          : [{ left: "", right: "" }],
  )

  useEffect(() => {
    const updatedQuestion: Question = {
      ...question,
      question: sanitizeInput(questionText),
      type: questionType,
      hint: sanitizeInput(hint),
    }

    if (questionType === "matching") {
      updatedQuestion.options = matchingPairs
      updatedQuestion.correctAnswer = matchingPairs
    } else if (questionType === "multiple-choice") {
      updatedQuestion.options = options
      updatedQuestion.correctAnswer = correctAnswer as string
    } else if (questionType === "word-order") {
      updatedQuestion.options = []
      updatedQuestion.correctAnswer = correctAnswer as string
    } else {
      updatedQuestion.options = options
      updatedQuestion.correctAnswer = correctAnswer
    }

    onUpdate(updatedQuestion)
  }, [questionText, questionType, hint, options, correctAnswer, matchingPairs])

  const handleAddOption = (): void => {
    setOptions([...options, ""])
  }

  const handleUpdateOption = (index: number, value: string): void => {
    const newOptions = [...options]
    newOptions[index] = sanitizeInput(value)
    setOptions(newOptions)
  }

  const handleRemoveOption = (index: number): void => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)

    if (correctAnswer === options[index]) {
      setCorrectAnswer("")
    }
  }

  const handleAddMatchingPair = (): void => {
    setMatchingPairs([...matchingPairs, { left: "", right: "" }])
  }

  const handleUpdateMatchingPair = (index: number, field: "left" | "right", value: string): void => {
    const newPairs = [...matchingPairs]
    newPairs[index][field] = sanitizeInput(value)
    setMatchingPairs(newPairs)
  }

  const handleRemoveMatchingPair = (index: number): void => {
    if (matchingPairs.length <= 1) {
      Alert.alert("Помилка", "Потрібна хоча б одна пара для співставлення")
      return
    }
    const newPairs = [...matchingPairs]
    newPairs.splice(index, 1)
    setMatchingPairs(newPairs)
  }

  const renderQuestionTypeSelector = () => (
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Тип питання</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questionTypeScroll}>
          <TouchableOpacity
              style={[styles.typeOption, questionType === "multiple-choice" && { backgroundColor: colors.primary }]}
              onPress={() => setQuestionType("multiple-choice")}
          >
            <Text style={[styles.typeOptionText, { color: questionType === "multiple-choice" ? "#fff" : colors.text }]}>
              {getQuestionTypeLabel("multiple-choice")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.typeOption, questionType === "translation" && { backgroundColor: colors.primary }]}
              onPress={() => setQuestionType("translation")}
          >
            <Text style={[styles.typeOptionText, { color: questionType === "translation" ? "#fff" : colors.text }]}>
              {getQuestionTypeLabel("translation")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.typeOption, questionType === "matching" && { backgroundColor: colors.primary }]}
              onPress={() => setQuestionType("matching")}
          >
            <Text style={[styles.typeOptionText, { color: questionType === "matching" ? "#fff" : colors.text }]}>
              {getQuestionTypeLabel("matching")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.typeOption, questionType === "word-order" && { backgroundColor: colors.primary }]}
              onPress={() => setQuestionType("word-order")}
          >
            <Text style={[styles.typeOptionText, { color: questionType === "word-order" ? "#fff" : colors.text }]}>
              {getQuestionTypeLabel("word-order")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.typeOption, questionType === "sentence-completion" && { backgroundColor: colors.primary }]}
              onPress={() => setQuestionType("sentence-completion")}
          >
            <Text
                style={[styles.typeOptionText, { color: questionType === "sentence-completion" ? "#fff" : colors.text }]}
            >
              {getQuestionTypeLabel("sentence-completion")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
  )

  const renderQuestionText = () => (
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Текст питання *</Text>
        <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
            ]}
            value={questionText}
            onChangeText={setQuestionText}
            placeholder="Введіть текст питання"
            placeholderTextColor={colors.secondaryText}
            multiline
            numberOfLines={3}
        />
      </View>
  )

  const renderHint = () => (
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Підказка (необов'язково)</Text>
        <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
            value={hint}
            onChangeText={setHint}
            placeholder="Введіть підказку для користувача"
            placeholderTextColor={colors.secondaryText}
        />
      </View>
  )

  const renderMultipleChoiceOptions = () => (
      <View style={styles.formGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.text }]}>Варіанти відповідей *</Text>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddOption}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Додати варіант</Text>
          </TouchableOpacity>
        </View>

        {options.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>Додайте варіанти відповідей</Text>
        ) : (
            options.map((option, index) => (
                <View key={index} style={styles.optionRow}>
                  <TouchableOpacity
                      style={[
                        styles.radioButton,
                        { borderColor: colors.border },
                        correctAnswer === option && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setCorrectAnswer(option)}
                  >
                    {correctAnswer === option && <View style={styles.radioButtonInner} />}
                  </TouchableOpacity>
                  <TextInput
                      style={[
                        styles.optionInput,
                        { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
                      ]}
                      value={option}
                      onChangeText={(text) => handleUpdateOption(index, text)}
                      placeholder={`Варіант ${index + 1}`}
                      placeholderTextColor={colors.secondaryText}
                  />
                  <TouchableOpacity
                      style={[styles.removeButton, { backgroundColor: `${colors.error}20` }]}
                      onPress={() => handleRemoveOption(index)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
            ))
        )}

        <Text style={[styles.helperText, { color: colors.secondaryText }]}>
          Виберіть правильну відповідь, натиснувши на кружечок зліва
        </Text>
      </View>
  )

  const renderTranslationInput = () => (
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Правильна відповідь *</Text>
        <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
            value={typeof correctAnswer === "string" ? correctAnswer : ""}
            onChangeText={(text) => setCorrectAnswer(text)}
            placeholder="Введіть правильну відповідь"
            placeholderTextColor={colors.secondaryText}
        />
      </View>
  )

  const renderWordOrderInput = () => (
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Правильний порядок слів *</Text>
        <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
            value={typeof correctAnswer === "string" ? correctAnswer : ""}
            onChangeText={(text) => setCorrectAnswer(text)}
            placeholder="Введіть слова в правильному порядку, розділені пробілами"
            placeholderTextColor={colors.secondaryText}
        />
        <Text style={[styles.helperText, { color: colors.secondaryText }]}>Наприклад: "Я йду до школи"</Text>
      </View>
  )

  const renderSentenceCompletionInput = () => (
      <View>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Правильна відповідь *</Text>
          <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
              value={typeof correctAnswer === "string" ? correctAnswer : ""}
              onChangeText={(text) => setCorrectAnswer(text)}
              placeholder="Введіть правильну відповідь"
              placeholderTextColor={colors.secondaryText}
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>Варіанти відповідей (необов'язково)</Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddOption}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addButtonText}>Додати варіант</Text>
            </TouchableOpacity>
          </View>

          {options.map((option, index) => (
              <View key={index} style={styles.optionRow}>
                <TextInput
                    style={[
                      styles.optionInput,
                      { color: colors.text, backgroundColor: colors.card, borderColor: colors.border, flex: 1 },
                    ]}
                    value={option}
                    onChangeText={(text) => handleUpdateOption(index, text)}
                    placeholder={`Варіант ${index + 1}`}
                    placeholderTextColor={colors.secondaryText}
                />
                <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: `${colors.error}20` }]}
                    onPress={() => handleRemoveOption(index)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
          ))}
        </View>
      </View>
  )

  const renderMatchingPairs = () => (
      <View style={styles.formGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.text }]}>Пари для співставлення *</Text>
          <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={handleAddMatchingPair}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Додати пару</Text>
          </TouchableOpacity>
        </View>

        {matchingPairs.map((pair, index) => (
            <View key={index} style={styles.matchingPairContainer}>
              <View style={styles.matchingPair}>
                <TextInput
                    style={[
                      styles.matchingInput,
                      { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    value={pair.left}
                    onChangeText={(text) => handleUpdateMatchingPair(index, "left", text)}
                    placeholder="Ліва частина"
                    placeholderTextColor={colors.secondaryText}
                />
                <Ionicons name="arrow-forward" size={20} color={colors.secondaryText} style={styles.matchingArrow} />
                <TextInput
                    style={[
                      styles.matchingInput,
                      { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    value={pair.right}
                    onChangeText={(text) => handleUpdateMatchingPair(index, "right", text)}
                    placeholder="Права частина"
                    placeholderTextColor={colors.secondaryText}
                />
              </View>
              <TouchableOpacity
                  style={[styles.removeButton, { backgroundColor: `${colors.error}20` }]}
                  onPress={() => handleRemoveMatchingPair(index)}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
        ))}
      </View>
  )

  return (
      <View style={styles.container}>
        {renderQuestionTypeSelector()}
        {renderQuestionText()}
        {renderHint()}

        {questionType === "multiple-choice" && renderMultipleChoiceOptions()}
        {questionType === "translation" && renderTranslationInput()}
        {questionType === "matching" && renderMatchingPairs()}
        {questionType === "word-order" && renderWordOrderInput()}
        {questionType === "sentence-completion" && renderSentenceCompletionInput()}
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  questionTypeScroll: {
    flexDirection: "row",
    marginBottom: 5,
  },
  typeOption: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 5,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    padding: 15,
    fontStyle: "italic",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  helperText: {
    fontSize: 12,
    marginTop: 5,
  },
  matchingPairContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  matchingPair: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  matchingInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  matchingArrow: {
    marginHorizontal: 10,
  },
})
