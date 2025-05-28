/**
 * Sanitizes input to prevent XSS attacks
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput: (input: string) => string = (input: string): string => {
    return input
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string
 */
export const truncateString: (str: string, maxLength: number) => string = (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str
    return str.slice(0, maxLength) + "..."
}

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns Capitalized string
 */
export const capitalizeFirstLetter: (str: string) => string = (str: string): string => {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Converts a string to kebab-case
 * @param str - The string to convert
 * @returns Kebab-cased string
 */
export const toKebabCase: (str: string) => string = (str: string): string => {
    return str
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/\s+/g, "-")
        .toLowerCase()
}

/**
 * Converts a string to camelCase
 * @param str - The string to convert
 * @returns CamelCased string
 */
export const toCamelCase: (str: string) => string = (str: string): string => {
    return str
        .replace(/^\w|[A-Z]|\b\w/g, (word: string, index: any): string => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase()
        })
        .replace(/\s+/g, "")
}

/**
 * Formats a number to a readable string with K, M, B suffixes for large numbers
 * @param num - The number to format
 * @param digits - Number of decimal digits to show (default: 1)
 * @returns Formatted number string
 */
export const formatNumber: (num: number, digits?: number) => string = (num: number, digits = 1): string => {
    if (num === null || num === undefined || isNaN(num)) return "0"

    if (num < 1000) {
        return Number.isInteger(num) ? num.toString() : num.toFixed(digits)
    }

    const units: string[] = ["", "K", "M", "B", "T"]
    const unit: number = Math.floor(Math.log10(num) / 3)
    const value: number = num / Math.pow(1000, unit)
    const formattedValue: string = Number.isInteger(value) ? value.toString() : value.toFixed(digits)

    return formattedValue + units[unit]
}
