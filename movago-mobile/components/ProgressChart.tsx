"use client"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import type { ProgressChartProps } from "../types/component.types"

const { width } = Dimensions.get("window")
const BAR_HEIGHT = 20
const CHART_WIDTH: number = width - 60

export default function ProgressChart({ data, title }: ProgressChartProps) {
  const { colors, isDark } = useTheme()

  const maxValue: number = Math.max(...data.map((item): number => item.value), 1)

  return (
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}

        {data.map((item, index: number) => {
          const barWidth: number = (item.value / maxValue) * CHART_WIDTH
          const textColor: string = isDark ? colors.text : colors.secondaryText

          return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.labelContainer}>
                  <Text style={[styles.barLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.barValue, { color: textColor }]}>{item.value}</Text>
                </View>
                <View style={[styles.barBackground, { backgroundColor: isDark ? "#333" : "#f0f0f0" }]}>
                  <View
                      style={[
                        styles.bar,
                        {
                          width: barWidth || 5,
                          backgroundColor: item.color,
                        },
                      ]}
                  />
                </View>
              </View>
          )
        })}
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  barContainer: {
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 14,
  },
  barBackground: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    overflow: "hidden",
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
  },
  barValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
})
