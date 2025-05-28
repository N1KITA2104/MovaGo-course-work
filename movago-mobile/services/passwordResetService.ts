import { api } from "./api"

export const passwordResetService = {
    /**
     * Request a password reset by sending an email with a verification code
     * @param email User's email address
     */
    requestReset: async (email: string): Promise<{ message: string }> => {
        const response = await api.post("/api/password-reset/request", { email })
        return response.data
    },

    /**
     * Verify the reset code sent to the user's email
     * @param email User's email address
     * @param code Verification code
     */
    verifyCode: async (email: string, code: string): Promise<{ resetToken: string; message: string }> => {
        try {
            const response = await api.post("/api/password-reset/verify", { email, code })
            return { ...response.data, success: true }
        } catch (error: any) {
            throw error
        }
    },

    /**
     * Reset the password after verification
     * @param email User's email address
     * @param resetToken Reset token received after verification
     * @param newPassword New password
     */
    resetPassword: async (
        email: string,
        resetToken: string,
        newPassword: string,
    ): Promise<{ success: boolean; message: string }> => {
        const response = await api.post("/api/password-reset/reset", { email, resetToken, newPassword })
        return response.data
    },
}
