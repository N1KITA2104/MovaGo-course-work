import { Component } from "@angular/core"
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { NgIf } from "@angular/common"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
  })

  isLoading: boolean = false
  errorMessage: string = ""
  successMessage: string = ""
  demoCode: string | null = null
  isDemoMode: boolean = false
  demoEmail: string | null = null

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  requestReset(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched(this.forgotPasswordForm)
      return
    }

    this.isLoading = true
    this.errorMessage = ""
    this.demoCode = null

    const email: any = this.forgotPasswordForm.value.email

    this.authService.requestPasswordReset(email).subscribe({
      next: (response: any): void => {
        this.isLoading = false
        this.successMessage = response.message

        localStorage.setItem("resetEmail", email)

        if (response.demoMode) {
          this.isDemoMode = true
          this.demoCode = response.resetCode
          this.demoEmail = response.demoEmail

          if (this.demoEmail && this.demoEmail !== email) {
            this.errorMessage = `В демо-режиме восстановление пароля доступно только для email: ${this.demoEmail}`
            localStorage.setItem("resetEmail", this.demoEmail)
          }
        }
      },
      error: (error: any): void => {
        this.isLoading = false
        this.errorMessage = error.error?.message || "Помилка при запиті на відновлення паролю"

        if (error.error?.demoMode) {
          this.isDemoMode = true
          this.demoEmail = error.error.demoEmail
          this.errorMessage = `В демо-режиме восстановление пароля доступно только для email: ${this.demoEmail}`
        }
      },
    })
  }

  goToVerifyCode(): void {
    this.router.navigate(["/verify-code"])
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control: AbstractControl<any, any>): void => {
      control.markAsTouched()
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      }
    })
  }
}
