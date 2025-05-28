"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native"
import { useTheme } from "../../contexts/ThemeContext"
import type { EmojiSelectorProps } from "../../types/component.types"

const EMOJIS = [
  "📚",
  "📝",
  "✏️",
  "📖",
  "🔍",
  "🎓",
  "🧠",
  "💡",
  "🔤",
  "🔢",
  "🌍",
  "🧮",
  "📊",
  "📈",
  "🔬",
  "🔭",
  "🧪",
  "🧫",
  "🧬",
  "🔐",
  "👋",
  "🤝",
  "👍",
  "👏",
  "🙌",
  "🎯",
  "🏆",
  "🥇",
  "🎮",
  "🎨",
  "🎭",
  "🎬",
  "🎵",
  "🎹",
  "🎸",
  "🎺",
  "🎻",
  "🥁",
  "🎤",
  "🎧",
  "⚽",
  "🏀",
  "🏈",
  "⚾",
  "🎾",
  "🏐",
  "🏉",
  "🎱",
  "🏓",
  "🏸",
  "🚶",
  "🏃",
  "🏊",
  "🚴",
  "🧘",
  "🏋️",
  "🤸",
  "⛹️",
  "🤾",
  "🤽",
  "🍎",
  "🍐",
  "🍊",
  "🍋",
  "🍌",
  "🍉",
  "🍇",
  "🍓",
  "🍈",
  "🍒",
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🐔",
  "🐧",
  "🐦",
  "🐤",
  "🦆",
  "🌞",
  "🌝",
  "🌛",
  "🌜",
  "🌚",
  "⭐",
  "🌟",
  "✨",
  "⚡",
  "🔥",
]

export default function EmojiSelector({ onSelect, onClose }: EmojiSelectorProps) {
  const { colors } = useTheme()

  return (
      <Modal animationType="slide" transparent={true} visible={true} onRequestClose={onClose}>
        <View style={[styles.modalContainer, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Виберіть іконку</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>Закрити</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.emojiGrid} contentContainerStyle={styles.emojiGridContent}>
              {EMOJIS.map((emoji, index) => (
                  <TouchableOpacity
                      key={index}
                      style={[styles.emojiItem, { backgroundColor: colors.background }]}
                      onPress={() => onSelect(emoji)}
                  >
                    <Text style={styles.emoji}>{emoji}</Text>
                  </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 16,
    fontWeight: "500",
  },
  emojiGrid: {
    maxHeight: 400,
  },
  emojiGridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emojiItem: {
    width: "23%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: "1%",
    borderRadius: 10,
  },
  emoji: {
    fontSize: 30,
  },
})
