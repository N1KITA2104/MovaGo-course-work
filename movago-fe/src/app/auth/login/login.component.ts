import { Component } from "@angular/core"
import { AuthService } from "../../services/auth.service"
import { Router } from "@angular/router"
import {FormsModule, FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl} from "@angular/forms"
import { NgIf } from "@angular/common"
import { RouterLink } from "@angular/router"

@Component({
  selector: "app-login",
  imports: [FormsModule, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl<string>("", [Validators.required, Validators.email]),
    password: new FormControl<string>("", [Validators.required]),
  })

  errorMessage: string = ""
  isLoading: boolean = false
  showPassword: boolean = false

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword
  }

  login(): void {
    if (this.loginForm.valid) {
      this.isLoading = true

      const email: string = this.loginForm.value.email ?? ""
      const password: string = this.loginForm.value.password ?? ""

      this.authService.login({ email, password }).subscribe({
        next: (): void => {
          this.isLoading = false
          this.router.navigate(["/"])
        },
        error: (error: { error?: { message?: string } }): void => {
          this.isLoading = false
          this.errorMessage = error.error?.message ?? "Невірний email або пароль"
        },
      })
    } else {
      this.markFormGroupTouched(this.loginForm)
      this.errorMessage = "Будь ласка, заповніть всі поля правильно."
    }
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
