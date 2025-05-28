import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { User } from "../../models/user.model"
import { UserService } from "../../services/user.service"
import { environment } from "../../../environments/environment"

@Component({
  selector: "app-profile-edit-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./profile-edit-modal.component.html",
  styleUrls: ["./profile-edit-modal.component.scss"],
})
export class ProfileEditModalComponent implements OnInit {
  @Input() user: User | null = null
  @Output() close: EventEmitter<void> = new EventEmitter<void>()
  @Output() profileUpdated: EventEmitter<User> = new EventEmitter<User>()

  editableProfile: {
    username: string
    email: string
    description: string
  } = {
    username: "",
    email: "",
    description: "",
  }

  selectedFile: File | null = null
  previewUrl: string | ArrayBuffer | null = null
  isUploading: boolean = false
  errorMessage: string = ""
  apiUrl: string = environment.apiUrl

  private photoTimestamp: number = new Date().getTime()

  constructor(private userService: UserService) {}

  getProfilePhotoUrl(photoPath: string): string {
    if (!photoPath) return ""

    if (photoPath.startsWith("http")) {
      return photoPath
    }

    return `${this.apiUrl}${photoPath}?t=${this.photoTimestamp}`
  }

  ngOnInit(): void {
    if (this.user) {
      this.editableProfile = {
        username: this.user.username,
        email: this.user.email,
        description: this.user.description || "",
      }

      if (this.user.profilePhoto) {
        this.previewUrl = this.getProfilePhotoUrl(this.user.profilePhoto)
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0]

      if (this.selectedFile.size > 5 * 1024 * 1024) {
        this.errorMessage = "Максимальний размір файла - 5MB"
        this.selectedFile = null
        return
      }

      if (!this.selectedFile.type.startsWith("image/")) {
        this.errorMessage = "Можно завантажити тільки зображення"
        this.selectedFile = null
        return
      }

      this.errorMessage = ""

      const reader = new FileReader()
      reader.onload = (): void => {
        this.previewUrl = reader.result
      }
      reader.readAsDataURL(this.selectedFile)
    }
  }

  uploadPhoto(): void {
    if (!this.selectedFile) return

    this.isUploading = true
    this.errorMessage = ""

    this.userService.uploadProfilePhoto(this.selectedFile).subscribe({
      next: (user: User): void => {
        this.isUploading = false
        this.profileUpdated.emit(user)
        this.close.emit()
      },
      error: (error: any): void => {
        this.isUploading = false
        this.errorMessage = error.error?.message || "Помилка при завантаженні зображення"
        console.error("Error uploading image:", error)
      },
    })
  }

  saveProfile(): void {
    if (!this.user) return

    const updatedProfile: Partial<User> = {
      username: this.editableProfile.username,
      email: this.editableProfile.email,
      description: this.editableProfile.description,
    }

    this.userService.updateUserProfile(updatedProfile).subscribe({
      next: (user: User): void => {
        this.profileUpdated.emit(user)
        this.close.emit()
      },
      error: (error: any): void => {
        this.errorMessage = error.error?.message || "Помилка при оновленні профіля"
        console.error("Error updating profile:", error)
      },
    })
  }

  closeModal(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit()
    }
  }

  removePhoto(): void {
    this.selectedFile = null
    this.previewUrl = null
    this.errorMessage = ""

    if (this.user && this.user.profilePhoto) {
      this.isUploading = true

      this.userService.deleteProfilePhoto().subscribe({
        next: (user: User): void => {
          this.isUploading = false
          this.profileUpdated.emit(user)
        },
        error: (error: any): void => {
          this.isUploading = false
          this.errorMessage = error.error?.message || "Помилка при видаленні фото"
          console.error("Error removing photo:", error)
        },
      })
    }
  }
}
