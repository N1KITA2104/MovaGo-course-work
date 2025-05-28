import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { User } from "../../../../models/user.model"

@Component({
  selector: "app-user-status-modal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./user-status-modal.component.html",
  styleUrl: "./user-status-modal.component.scss",
})
export class UserStatusModalComponent {
  @Input() selectedUser: User | null = null
  @Input() selectedStatus: "active" | "inactive" | "pending" | null = null

  @Output() statusSelected = new EventEmitter<"active" | "inactive" | "pending">()
  @Output() saveStatus = new EventEmitter<void>()
  @Output() closeModal = new EventEmitter<Event>()

  selectStatus(status: "active" | "inactive" | "pending"): void {
    this.statusSelected.emit(status)
  }

  onSaveStatus(): void {
    this.saveStatus.emit()
  }

  onCloseModal(event: Event): void {
    this.closeModal.emit(event)
  }
}
