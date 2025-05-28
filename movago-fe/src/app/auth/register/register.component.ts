import { Component, OnInit } from "@angular/core"
import { AuthService } from "../../services/auth.service"
import { Router } from "@angular/router"
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms"
import { NgIf, NgClass } from "@angular/common"
import { RouterLink } from "@angular/router"

interface User {
  email: string
  password: string
  username: string
}

@Component({
  selector: "app-register",
  imports: [ReactiveFormsModule, NgIf, NgClass, RouterLink],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup
  errorMessage: string = ""
  isLoading: boolean = false
  showPassword: boolean = false
  showConfirmPassword: boolean = false
  passwordStrength: number = 0
  passwordStrengthText: string = ""
  passwordStrengthClass: string = ""
  formProgress: number = 0

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = new FormGroup(
      {
        username: new FormControl("", [Validators.required, Validators.minLength(3)]),
        email: new FormControl("", [Validators.required, Validators.email]),
        password: new FormControl("", [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/),
        ]),
        confirmPassword: new FormControl("", [Validators.required]),
      },
      { validators: this.passwordMatchValidator },
    )
  }

  ngOnInit(): void {
    this.registerForm.valueChanges.subscribe((): void => {
      this.updateFormProgress()
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
    const password: any = this.registerForm.get("password")?.value

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

  updateFormProgress(): void {
    const controls: {[key: string]: AbstractControl<any, any>} = this.registerForm.controls
    let validControlsCount: number = 0
    const totalControls: number = Object.keys(controls).length

    for (const controlName in controls) {
      if (controls[controlName].valid) {
        validControlsCount++
      }
    }

    this.formProgress = Math.round((validControlsCount / totalControls) * 100)
  }

  register(): void {
    if (this.registerForm.valid) {
      this.isLoading = true
      const user: User = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
      }

      this.authService.register(user).subscribe({
        next: (): void => {
          this.isLoading = false
          this.router.navigate(["/login"])
        },
        error: (error: any): void => {
          this.isLoading = false
          this.errorMessage = error.error?.message || "Помилка при реєстрації. Спробуйте пізніше."
        },
      })
    } else {
      this.markFormGroupTouched(this.registerForm)
      this.errorMessage = "Будь ласка, заповніть всі поля правильно."
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched()
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      }
    })
  }
}
