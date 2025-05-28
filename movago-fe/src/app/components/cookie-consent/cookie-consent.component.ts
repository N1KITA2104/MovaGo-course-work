import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { CookieService } from "../../services/cookie.service"

interface CookieCategory {
  id: string
  name: string
  description: string
  required: boolean
  enabled: boolean
}

@Component({
  selector: "app-cookie-consent",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./cookie-consent.component.html",
  styleUrl: "./cookie-consent.component.scss",
})
export class CookieConsentComponent implements OnInit {
  showConsent: boolean = false
  showDetails: boolean = false
  cookieConsentKey: string = "movago-cookie-consent"
  cookieCategories: CookieCategory[] = [
    {
      id: "necessary",
      name: "Необхідні",
      description: "Ці файли cookie необхідні для функціонування веб-сайту і не можуть бути вимкнені.",
      required: true,
      enabled: true,
    },
    {
      id: "functional",
      name: "Функціональні",
      description:
        "Ці файли cookie дозволяють веб-сайту запам'ятовувати вибір, який ви зробили, та надавати розширені, персоналізовані функції.",
      required: false,
      enabled: false,
    },
    {
      id: "analytics",
      name: "Аналітичні",
      description:
        "Ці файли cookie допомагають нам зрозуміти, як відвідувачі взаємодіють з веб-сайтом, збираючи та повідомляючи інформацію анонімно.",
      required: false,
      enabled: false,
    },
    {
      id: "marketing",
      name: "Маркетингові",
      description:
        "Ці файли cookie використовуються для відстеження відвідувачів на веб-сайтах. Мета полягає в тому, щоб відображати релевантні та привабливі для користувача оголошення.",
      required: false,
      enabled: false,
    },
  ]

  constructor(private cookieService: CookieService) {}

  ngOnInit(): void {
    const savedConsent: string | null = this.cookieService.getCookie(this.cookieConsentKey)

    if (!savedConsent) {
      setTimeout((): void => {
        this.showConsent = true
      }, 1000)
    } else {
      try {
        const savedPreferences: any = JSON.parse(savedConsent)
        this.cookieCategories.forEach((category: CookieCategory): void => {
          if (savedPreferences[category.id] !== undefined) {
            category.enabled = savedPreferences[category.id]
          }
        })
      } catch (e) {
        console.error("Error parsing cookie consent preferences", e)
        this.showConsent = true
      }
    }
  }

  acceptAll(): void {
    this.cookieCategories.forEach((category: CookieCategory): void => {
      category.enabled = true
    })
    this.savePreferences()
    this.showConsent = false
  }

  acceptNecessary(): void {
    this.cookieCategories.forEach((category: CookieCategory): void => {
      category.enabled = category.required
    })
    this.savePreferences()
    this.showConsent = false
  }

  saveCustomPreferences(): void {
    this.savePreferences()
    this.showConsent = false
    this.showDetails = false
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails
  }

  private savePreferences(): void {
    const preferences: Record<string, boolean> = {}
    this.cookieCategories.forEach((category: CookieCategory): void => {
      preferences[category.id] = category.enabled
    })

    this.cookieService.setCookie(this.cookieConsentKey, JSON.stringify(preferences), 365)
  }
}
