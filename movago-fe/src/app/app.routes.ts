import type { Routes } from "@angular/router"
import { HomeComponent } from "./pages/home/home.component"
import { LoginComponent } from "./auth/login/login.component"
import { RegisterComponent } from "./auth/register/register.component"
import { LessonsComponent } from "./pages/lessons/lessons.component"
import { LessonDetailComponent } from "./pages/lesson-detail/lesson-detail.component"
import { ProfileComponent } from "./pages/profile/profile.component"
import { AuthGuard } from "./guards/auth.guard"
import { AdminPageComponent } from "./pages/admin-page/admin-page.component"
import { AdminGuard } from "./guards/admin.guard"
import { UnauthorizedPageComponent } from "./pages/unauthorized-page/unauthorized-page.component"
import { ForgotPasswordComponent } from "./auth/forgot-password/forgot-password.component"
import { VerifyCodeComponent } from "./auth/verify-code/verify-code.component"
import { ResetPasswordComponent } from "./auth/reset-password/reset-password.component"
import { UserProfileComponent } from "./pages/user-profile/user-profile.component"

export const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    component: RegisterComponent,
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
  },
  {
    path: "verify-code",
    component: VerifyCodeComponent,
  },
  {
    path: "reset-password",
    component: ResetPasswordComponent,
  },
  {
    path: "lessons",
    component: LessonsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "lessons/:id",
    component: LessonDetailComponent,
  },
  {
    path: "profile",
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "users/:id",
    component: UserProfileComponent,
  },
  {
    path: "admin",
    component: AdminPageComponent,
    canActivate: [AdminGuard],
  },
  {
    path: "unauthorized",
    component: UnauthorizedPageComponent,
  },
  {
    path: "**",
    redirectTo: "",
  },
]
