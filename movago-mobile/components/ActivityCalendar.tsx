"use client"

import { View, Text, StyleSheet } from "react-native"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { useTheme } from "../contexts/ThemeContext"
import type { ActivityCalendarProps } from "../types/component.types"

export default function ActivityCalendar({ activityDates }: ActivityCalendarProps) {
  const { colors } = useTheme()
  const today = new Date()
  const startDate: Date = startOfMonth(today)
  const endDate: Date = endOfMonth(today)

  const daysInMonth = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const hasActivity: (date: Date) => boolean = (date: Date): boolean => {
    return activityDates.some((activityDate: Date): boolean => isSameDay(new Date(activityDate), date))
  }

  return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Календар активності</Text>
        <View style={styles.calendarHeader}>
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((day: string, index: number) => (
              <Text key={index} style={[styles.dayHeader, { color: colors.secondaryText }]}>
                {day}
              </Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {daysInMonth.map((date: Date, index: number) => {
            const isActive: boolean = hasActivity(date)
            return (
                <View
                    key={index}
                    style={[
                      styles.dayCell,
                      isActive && [styles.activeDay, { backgroundColor: colors.primary }],
                      isSameDay(date, today) && [styles.today, { borderColor: colors.primary }],
                    ]}
                >
                  <Text
                      style={[
                        styles.dayText,
                        { color: colors.text },
                        isActive && styles.activeDayText,
                        isSameDay(date, today) && styles.todayText,
                      ]}
                  >
                    {format(date, "d")}
                  </Text>
                </View>
            )
          })}
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dayHeader: {
    width: 30,
    textAlign: "center",
    fontWeight: "bold",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  dayCell: {
    width: "14.28%",
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  dayText: {
    color: "#333",
  },
  activeDay: {
    borderRadius: 17.5,
  },
  activeDayText: {
    color: "#fff",
  },
  today: {
    borderWidth: 1,
    borderRadius: 17.5,
  },
  todayText: {
    fontWeight: "bold",
  },
})
