/**
 * Formats a date string to a localized date format
 * @param dateString - The date string to format
 * @param options - Intl.DateTimeFormatOptions to customize the format
 * @returns Formatted date string
 */
export const formatDate = (
    dateString: string,
    options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    },
): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("uk-UA", options)
}

/**
 * Formats a date string to a localized date and time format
 * @param dateString - The date string to format
 * @returns Formatted date and time string
 */
export const formatDateTime: (dateString: string) => string = (dateString: string): string => {
    if (!dateString) return "Немає даних"
    const date = new Date(dateString)
    return date.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

/**
 * Checks if a date is today
 * @param date - The date to check
 * @returns Boolean indicating if the date is today
 */
export const isToday: (date: Date) => boolean = (date: Date): boolean => {
    const today = new Date()
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    )
}

/**
 * Checks if a date is yesterday
 * @param date - The date to check
 * @returns Boolean indicating if the date is yesterday
 */
export const isYesterday: (date: Date) => boolean = (date: Date): boolean => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
    )
}

/**
 * Gets the start of the day for a given date
 * @param date - The date to get the start of day for
 * @returns Date object set to the start of the day
 */
export const getStartOfDay: (date: Date) => Date = (date: Date): Date => {
    const newDate = new Date(date)
    newDate.setHours(0, 0, 0, 0)
    return newDate
}
