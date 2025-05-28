import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { User } from "../../../../models/user.model"
import { HumanNumberPipe } from "../../../../pipes/human-number.pipe"

@Component({
  selector: "app-user-management",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HumanNumberPipe],
  templateUrl: "./user-management.component.html",
  styleUrl: "./user-management.component.scss",
})
export class UserManagementComponent {
  @Input() users: User[] = []
  @Input() loading = false

  @Output() userRoleChanged = new EventEmitter<{ user: User; role: string }>()
  @Output() userStatusChanged = new EventEmitter<{ user: User; status: "active" | "inactive" | "pending" }>()
  @Output() userDeleted = new EventEmitter<User>()
  @Output() openStatusModalRequest = new EventEmitter<User>()

  userSearchQuery = ""
  filteredUsers: User[] = []

  ngOnChanges(): void {
    this.filterUsers()
  }

  filterUsers(): void {
    if (!this.userSearchQuery) {
      this.filteredUsers = [...this.users]
      return
    }

    const query: string = this.userSearchQuery.toLowerCase()
    this.filteredUsers = this.users.filter(
      (user: User): boolean => user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    )
  }

  resetUserSearch(): void {
    this.userSearchQuery = ""
    this.filterUsers()
  }

  updateUserRole(user: User): void {
    this.userRoleChanged.emit({ user, role: user.role })
  }

  updateUserStatus(user: User): void {
    this.userStatusChanged.emit({ user, status: user.status as "active" | "inactive" | "pending" })
  }

  openStatusModal(user: User): void {
    this.openStatusModalRequest.emit(user)
  }

  confirmDeleteUser(user: User): void {
    if (confirm(`Ви впевнені, що хочете видалити користувача ${user.username}?`)) {
      this.userDeleted.emit(user)
    }
  }
}
