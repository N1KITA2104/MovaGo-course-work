import { Component, OnInit } from "@angular/core"
import { RouterOutlet } from "@angular/router"
import { FooterComponent } from "./components/footer/footer.component"
import { HeaderComponent } from "./components/header/header.component"
import { UserService } from "./services/user.service"
import { AuthService } from "./services/auth.service"
import { CookieConsentComponent } from "./components/cookie-consent/cookie-consent.component"

@Component({
  selector: "app-root",
  imports: [RouterOutlet, FooterComponent, HeaderComponent, CookieConsentComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  title: string = "MovaGo"

  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.authState$.subscribe((isAuthenticated: boolean): void => {
      if (isAuthenticated) {
        this.userService.refreshUserProfile()
      } else {
        this.userService.clearUserProfile()
      }
    })

    if (this.authService.isLoggedIn()) {
      this.userService.refreshUserProfile()
    }
  }
}
