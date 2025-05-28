/**
 * Checks if a JWT token is expired
 * @param token - The JWT token to check
 * @returns Boolean indicating if the token is expired
 */
export const isTokenExpired: (token: string) => boolean = (token: string): boolean => {
    try {
        const payload: any = JSON.parse(atob(token.split(".")[1]))
        return payload.exp * 1000 < Date.now()
    } catch (error) {
        return true
    }
}

/**
 * Validates an email address format
 * @param email - The email to validate
 * @returns Boolean indicating if the email is valid
 */
export const isValidEmail: (email: string) => boolean = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validates a password meets minimum requirements
 * @param password - The password to validate
 * @returns Boolean indicating if the password is valid
 */
export const isValidPassword: (password: string) => boolean = (password: string): boolean => {
    return password.length >= 6
}

/**
 * Validates a username meets minimum requirements
 * @param username - The username to validate
 * @returns Boolean indicating if the username is valid
 */
export const isValidUsername: (username: string) => boolean = (username: string): boolean => {
    return username.length >= 3
}
