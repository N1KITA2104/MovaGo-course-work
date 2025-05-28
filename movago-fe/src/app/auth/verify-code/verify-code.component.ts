import { Component, OnInit } from "@angular/core"
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { NgIf } from "@angular/common"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-verify-code",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: "./verify-code.component.html",
  styleUrls: ["./verify-code.component.scss"],
})
export class VerifyCodeComponent implements OnInit {
  verifyCodeForm: FormGroup = new FormGroup({
    code: new FormControl("", [Validators.required, Validators.pattern("^[0-9]{6}$")]),
  })

  isLoading: boolean = false
  errorMessage: string = ""
  email: string | null = null

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.email = localStorage.getItem("resetEmail")

    if (!this.email) {
      this.router.navigate(["/forgot-password"])
    }
  }

  verifyCode(): void {
    if (this.verifyCodeForm.invalid || !this.email) {
      this.markFormGroupTouched(this.verifyCodeForm)
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const code: any = this.verifyCodeForm.value.code

    this.authService.verifyResetCode(this.email, code).subscribe({
      next: (response: any): void => {
        this.isLoading = false
        localStorage.setItem("resetToken", response.resetToken)
        this.router.navigate(["/reset-password"])
      },
      error: (error: any): void => {
        this.isLoading = false
        this.errorMessage = error.error?.message || "Помилка при перевірці коду"
      },
    })
  }

  resendCode(): void {
    if (!this.email) {
      this.errorMessage = "Email не знайдено. Спробуйте знову."
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    this.authService.requestPasswordReset(this.email).subscribe({
      next: (): void => {
        this.isLoading = false
        this.verifyCodeForm.get("code")?.setValue("")
      },
      error: (error: any): void => {
        this.isLoading = false
        this.errorMessage = error.error?.message || "Помилка при повторному надсиланні коду"
      },
    })
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
