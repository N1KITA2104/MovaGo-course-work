"use client"

import { useContext, useEffect } from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { AuthContext } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import ThemeToggleButton from "../components/ThemeToggleButton"
import { useNavigation } from "@react-navigation/native"
import type {
    RootStackParamList,
    AdminStackParamList,
    ProfileStackParamList,
    LessonsStackParamList,
} from "../types/navigation.types"

// Screens
import HomeScreen from "../screens/HomeScreen"
import LessonsScreen from "../screens/LessonsScreen"
import ProfileScreen from "../screens/ProfileScreen"
import EditProfileScreen from "../screens/EditProfileScreen"
import SettingsScreen from "../screens/SettingsScreen"
import LoginScreen from "../screens/LoginScreen"
import RegisterScreen from "../screens/RegisterScreen"
import LessonScreen from "../screens/LessonScreen"
import LessonQuizScreen from "../screens/LessonQuizScreen"
import LessonResultsScreen from "../screens/LessonResultsScreen"

import AdminPanelScreen from "../screens/admin/AdminPanelScreen"
import UsersManagementScreen from "../screens/admin/UsersManagementScreen"
import UserDetailsScreen from "../screens/admin/UserDetailsScreen"

import SystemStatsScreen from "../screens/admin/SystemStatsScreen"
import LessonsManagementScreen from "../screens/admin/LessonsManagementScreen"
import LessonFormScreen from "../screens/admin/LessonFormScreen"
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import VerifyResetCodeScreen from "../screens/VerifyResetCodeScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator<RootStackParamList>()
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>()
const LessonsStack = createNativeStackNavigator<LessonsStackParamList>()
const AdminStack = createNativeStackNavigator<AdminStackParamList>()

function AdminStackScreen() {
    const { colors } = useTheme()

    return (
        <AdminStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.card,
                },
                headerTintColor: colors.text,
            }}
        >
            <AdminStack.Screen name="AdminPanel" component={AdminPanelScreen} options={{ title: "Адмін панель" }} />
            <AdminStack.Screen name="UsersManagement" component={UsersManagementScreen} options={{ title: "Користувачі" }} />
            <AdminStack.Screen name="UserDetails" component={UserDetailsScreen} options={{ title: "Деталі користувача" }} />
            <AdminStack.Screen name="SystemStats" component={SystemStatsScreen} options={{ title: "Статистика системи" }} />
            <AdminStack.Screen
                name="LessonsManagement"
                component={LessonsManagementScreen}
                options={{ title: "Управління уроками" }}
            />
            <AdminStack.Screen
                name="LessonForm"
                component={LessonFormScreen}
                options={({ route }) => ({
                    title: route.params?.lessonId ? "Редагувати урок" : "Новий урок",
                })}
            />
        </AdminStack.Navigator>
    )
}

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="VerifyResetCode" component={VerifyResetCodeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

function ProfileStackScreen() {
    const { colors } = useTheme()

    return (
        <ProfileStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.card,
                },
                headerTintColor: colors.text,
            }}
        >
            <ProfileStack.Screen
                name="ProfileMain"
                component={ProfileScreen}
                options={{
                    title: "Профіль",
                }}
            />
            <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Редагувати профіль" }} />
            <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: "Налаштування" }} />
            <ProfileStack.Screen name="AdminPanelRoot" component={AdminStackScreen} options={{ headerShown: false }} />
        </ProfileStack.Navigator>
    )
}

function LessonsStackScreen() {
    const { colors } = useTheme()

    return (
        <LessonsStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.card,
                },
                headerTintColor: colors.text,
                headerBackTitle: undefined,
            }}
        >
            <LessonsStack.Screen name="LessonsList" component={LessonsScreen} options={{ headerShown: false }} />
            <LessonsStack.Screen name="Lesson" component={LessonScreen} options={{ title: "Урок" }} />
            <LessonsStack.Screen
                name="LessonQuiz"
                component={LessonQuizScreen}
                options={{
                    title: "Проходження уроку",
                    headerBackTitle: "Вийти",
                }}
            />
            <LessonsStack.Screen
                name="LessonResults"
                component={LessonResultsScreen}
                options={{
                    title: "Результати",
                    headerShown: false,
                }}
            />
        </LessonsStack.Navigator>
    )
}

function MainTabs() {
    const { colors } = useTheme()

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = "help"

                    switch (route.name) {
                        case "Home":
                            iconName = focused ? "home" : "home-outline"
                            break
                        case "Lessons":
                            iconName = focused ? "book" : "book-outline"
                            break
                        case "Profile":
                            iconName = focused ? "person" : "person-outline"
                            break
                    }

                    return <Ionicons name={iconName} size={size} color={color} />
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.secondaryText,
                headerStyle: {
                    backgroundColor: colors.card,
                },
                headerTintColor: colors.text,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                },
                headerShown: true,
                headerRight: () => <ThemeToggleButton />,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Movago" }} />
            <Tab.Screen name="Lessons" component={LessonsStackScreen} options={{ title: "Уроки", headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileStackScreen} options={{ title: "Профіль", headerShown: false }} />
        </Tab.Navigator>
    )
}

export default function MainNavigator() {
    const { isAuthenticated, loading } = useContext(AuthContext)
    const navigation = useNavigation<any>()

    useEffect(() => {
        console.log("MainNavigator: Auth state changed", { isAuthenticated, loading })
    }, [isAuthenticated, loading])

    useEffect((): void => {
        try {
            if (!loading && !isAuthenticated) {
                if (navigation.canGoBack()) {
                    console.log("MainNavigator: Resetting navigation to Login")
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Login" }],
                    })
                }
            }
        } catch (error) {
            console.error("MainNavigator navigation error:", error)
        }
    }, [isAuthenticated, loading, navigation])

    if (loading) {
        console.log("MainNavigator: Still loading auth state")
        return null
    }

    console.log("MainNavigator: Rendering", isAuthenticated ? "MainTabs" : "AuthStack")
    return isAuthenticated ? <MainTabs /> : <AuthStack />
}
