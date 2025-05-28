import { Component, OnInit, OnDestroy } from "@angular/core"
import { RouterLink } from "@angular/router"
import {NgIf, NgOptimizedImage} from "@angular/common"
import { AuthService } from "../../services/auth.service"
import { UserService } from "../../services/user.service"
import { User } from "../../models/user.model"
import { ActivityCalendarComponent } from "../../components/activity-calendar/activity-calendar.component"
import { Subject } from "rxjs"
import { takeUntil } from "rxjs/operators"

@Component({
  selector: "app-home",
  standalone: true,
  imports: [RouterLink, NgIf, ActivityCalendarComponent, NgOptimizedImage],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  userProfile: User | null = null
  isAdmin: boolean = false
  private destroy$: Subject<void> = new Subject<void>()

  constructor(
    public authService: AuthService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.userService.userProfile$.pipe(takeUntil(this.destroy$)).subscribe({
        next: (profile: User | null): void => {
          this.userProfile = profile
          this.isAdmin = profile?.role === "admin"
          if (!profile) {
            this.userService.refreshUserProfile()
          }
        },
        error: (error: any): void => {
          console.error("Error fetching user profile:", error)
        },
      })
    } else {
      this.userProfile = null
      this.isAdmin = false
    }

    this.authService.authState$.pipe(takeUntil(this.destroy$)).subscribe((isAuthenticated: boolean): void => {
      if (!isAuthenticated) {
        this.userProfile = null
        this.isAdmin = false
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}

