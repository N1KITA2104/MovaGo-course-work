import { Component, OnInit, OnDestroy, Input } from "@angular/core"
import { CommonModule } from "@angular/common"
import { UserService } from "../../services/user.service"
import { ActivityDay, User } from "../../models/user.model"
import { Subject, takeUntil } from "rxjs"

@Component({
  selector: "app-activity-calendar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./activity-calendar.component.html",
  styleUrl: "./activity-calendar.component.scss",
})
export class ActivityCalendarComponent implements OnInit, OnDestroy {
  @Input() userId?: string

  weekdays: string[] = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]
  currentDate: Date = new Date()
  currentMonth: number = this.currentDate.getMonth()
  currentYear: number = this.currentDate.getFullYear()
  currentMonthName = ""
  daysInMonth: number[] = []
  emptyDaysAtStart: number[] = []
  emptyDaysAtEnd: number[] = []

  userProfile: User | null = null
  activityDates: Map<string, boolean> = new Map()

  private destroy$: Subject<void> = new Subject<void>()

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.userProfile$.pipe(takeUntil(this.destroy$)).subscribe((profile: User | null): void => {
      this.userProfile = profile
      this.processActivityData()
      this.generateCalendar()
    })

    this.generateCalendar()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  processActivityData(): void {
    this.activityDates.clear()

    if (this.userProfile && this.userProfile.progress && this.userProfile.progress.activityCalendar) {
      this.userProfile.progress.activityCalendar.forEach((activity: ActivityDay): void => {
        if (activity.completed) {
          const date = new Date(activity.date)
          const dateKey: string = this.formatDateKey(date)
          this.activityDates.set(dateKey, true)
        }
      })
    }
  }

  generateCalendar(): void {
    this.currentMonthName = this.getMonthName(this.currentMonth)

    const daysInMonth: number = new Date(this.currentYear, this.currentMonth + 1, 0).getDate()
    this.daysInMonth = Array.from({ length: daysInMonth }, (_: unknown, i: number): number => i + 1)

    const firstDayOfMonth: number = new Date(this.currentYear, this.currentMonth, 1).getDay()
    const emptyDaysCount: number = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
    this.emptyDaysAtStart = Array(emptyDaysCount).fill(0)

    const totalDays: number = this.emptyDaysAtStart.length + this.daysInMonth.length
    const remainder: number = totalDays % 7
    const emptyDaysAtEndCount: number = remainder === 0 ? 0 : 7 - remainder
    this.emptyDaysAtEnd = Array(emptyDaysAtEndCount).fill(0)
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11
      this.currentYear--
    } else {
      this.currentMonth--
    }
    this.generateCalendar()
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0
      this.currentYear++
    } else {
      this.currentMonth++
    }
    this.generateCalendar()
  }

  isToday(day: number): boolean {
    const today = new Date()
    return day === today.getDate() && this.currentMonth === today.getMonth() && this.currentYear === today.getFullYear()
  }

  hasActivity(day: number): boolean {
    const dateKey: string = this.formatDateKey(new Date(this.currentYear, this.currentMonth, day))
    return this.activityDates.has(dateKey)
  }

  private formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  }

  getMonthActivityCount(): number {
    let count = 0
    for (let day = 1; day <= this.daysInMonth.length; day++) {
      if (this.hasActivity(day)) {
        count++
      }
    }
    return count
  }

  getDayAriaLabel(day: number): string {
    const date = new Date(this.currentYear, this.currentMonth, day)
    const dateString = date.toLocaleDateString("uk-UA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    if (this.isToday(day)) {
      return `${dateString} - Сьогодні`
    } else if (this.hasActivity(day)) {
      return `${dateString} - Є активність`
    } else {
      return `${dateString} - Немає активності`
    }
  }

  private getMonthName(month: number): string {
    const monthNames: string[] = [
      "Січень",
      "Лютий",
      "Березень",
      "Квітень",
      "Травень",
      "Червень",
      "Липень",
      "Серпень",
      "Вересень",
      "Жовтень",
      "Листопад",
      "Грудень",
    ]
    return monthNames[month]
  }
}
