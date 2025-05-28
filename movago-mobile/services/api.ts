import axios from "axios"
import Constants from "expo-constants"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios"

const API_URL = Constants.expoConfig?.extra?.apiUrl || "https://movago-production.up.railway.app/"

export const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
})

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig<any>): Promise<InternalAxiosRequestConfig<any>> => {
        const isAuthRequest: boolean =
            config.url?.includes("/api/auth/login") || config.url?.includes("/api/auth/register") || false

        if (!isAuthRequest) {
            const token: string | null = await AsyncStorage.getItem("@Movago:token")

            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }

        return config
    },
    (error: any): Promise<never> => {
        return Promise.reject(error)
    },
)

api.interceptors.response.use(
    (response: AxiosResponse<any, any>): AxiosResponse<any, any> => {
        return response
    },
    async (error: any): Promise<never> => {
        const isAuthRequest: boolean =
            error.config?.url?.includes("/api/auth/login") || error.config?.url?.includes("/api/auth/register") || false

        if (isAuthRequest) {
            return Promise.reject(error)
        }

        if (!error.response) {
            return Promise.reject(error)
        }

        const originalRequest: any = error.config

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                await AsyncStorage.removeItem("@Movago:token")
                api.defaults.headers.common["Authorization"] = ""
                return Promise.reject(error)
            } catch (e) {
                console.error("Error handling 401:", e)
                return Promise.reject(error)
            }
        }

        return Promise.reject(error)
    },
)
