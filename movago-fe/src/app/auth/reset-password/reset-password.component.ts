import { Component, OnInit } from "@angular/core"
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  type AbstractControl,
  type ValidationErrors,
  type ValidatorFn,
} from "@angular/forms"
import { Router } from "@angular/router"
import { NgIf, NgClass } from "@angular/common"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass],
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup

  isLoading: boolean = false
  errorMessage: string = ""
  successMessage: string = ""
  email: string | null = null
  resetToken: string | null = null

  showPassword: boolean = false
  showConfirmPassword: boolean = false
  passwordStrength: number = 0
  passwordStrengthText: string = ""
  passwordStrengthClass: string = ""

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.resetPasswordForm = new FormGroup(
      {
        password: new FormControl("", [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
        ]),
        confirmPassword: new FormControl("", [Validators.required]),
      },
      { validators: this.passwordMatchValidator },
    )
  }

  ngOnInit(): void {
    this.email = localStorage.getItem("resetEmail")
    this.resetToken = localStorage.getItem("resetToken")

    if (!this.email || !this.resetToken) {
      this.router.navigate(["/forgot-password"])
    }

    this.resetPasswordForm.get("password")?.valueChanges.subscribe((): void => {
      this.checkPasswordStrength()
    })
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password: AbstractControl<any, any> | null = control.get("password")
    const confirmPassword: AbstractControl<any, any> | null = control.get("confirmPassword")

    return password && confirmPassword && password.value !== confirmPassword.value ? { passwordMismatch: true } : null
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword
  }

  checkPasswordStrength(): void {
    const password: any = this.resetPasswordForm.get("password")?.value

    if (!password) {
      this.passwordStrength = 0
      this.passwordStrengthText = ""
      this.passwordStrengthClass = ""
      return
    }

    let strength: number = 0

    if (password.length >= 8) {
      strength += 20
    } else if (password.length >= 6) {
      strength += 10
    }

    if (password.match(/[a-z]+/)) {
      strength += 20
    }

    if (password.match(/[A-Z]+/)) {
      strength += 20
    }

    if (password.match(/[0-9]+/)) {
      strength += 20
    }

    if (password.match(/[$@#&!]+/)) {
      strength += 20
    }

    this.passwordStrength = strength

    if (strength < 40) {
      this.passwordStrengthText = "Слабкий"
      this.passwordStrengthClass = "weak"
    } else if (strength < 70) {
      this.passwordStrengthText = "Середній"
      this.passwordStrengthClass = "medium"
    } else {
      this.passwordStrengthText = "Сильний"
      this.passwordStrengthClass = "strong"
    }
  }

  resetPassword(): void {
    if (this.resetPasswordForm.invalid || !this.email || !this.resetToken) {
      this.markFormGroupTouched(this.resetPasswordForm)
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const newPassword: any = this.resetPasswordForm.value.password

    this.authService.resetPassword(this.email, this.resetToken, newPassword).subscribe({
      next: (response: any): void => {
        this.isLoading = false
        this.successMessage = response.message || "Пароль успішно змінено"

        localStorage.removeItem("resetEmail")
        localStorage.removeItem("resetToken")
      },
      error: (error: any): void => {
        this.isLoading = false
        this.errorMessage = error.error?.message || "Помилка при зміні паролю"
      },
    })
  }

  goToLogin(): void {
    this.router.navigate(["/login"])
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
