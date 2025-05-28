import { Component, OnInit, OnDestroy, HostListener } from "@angular/core"
import { Router, RouterLink, RouterLinkActive } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { UserService } from "../../services/user.service"
import { AsyncPipe, NgIf } from "@angular/common"
import { User } from "../../models/user.model"
import { Subject, takeUntil } from "rxjs"
import { ThemeToggleComponent } from "../theme-toggle/theme-toggle.component"
import { HumanNumberPipe } from '../../pipes/human-number.pipe';

@Component({
  selector: "app-header",
  standalone: true,
  imports: [RouterLinkActive, RouterLink, NgIf, AsyncPipe, ThemeToggleComponent, HumanNumberPipe],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent implements OnInit, OnDestroy {
  userProfile: User | null = null
  private destroy$: Subject<void> = new Subject<void>()

  isMobileMenuOpen: boolean = false

  isHeaderHidden: boolean = false
  private lastScrollTop: number = 0
  private scrollThreshold: number = 50

  constructor(
    public authService: AuthService,
    public userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userService.userProfile$.pipe(takeUntil(this.destroy$)).subscribe((profile: User | null): void => {
      this.userProfile = profile
      if (!profile && this.authService.isLoggedIn()) {
        this.userService.refreshUserProfile()
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  logout(): void {
    this.authService.logout()
    this.userService.clearUserProfile()
    this.router.navigate(["/login"]).then()
    this.closeMobileMenu()
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll(): void {
    const currentScrollTop: number = window.scrollY || document.documentElement.scrollTop

    if (Math.abs(this.lastScrollTop - currentScrollTop) > this.scrollThreshold) {
      this.isHeaderHidden = currentScrollTop > this.lastScrollTop && currentScrollTop > 70
      this.lastScrollTop = currentScrollTop
    }

    if (currentScrollTop <= 10) {
      this.isHeaderHidden = false
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize(): void {
    if (window.innerWidth > 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu()
    }
  }
}
