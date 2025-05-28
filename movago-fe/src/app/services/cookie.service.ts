import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class CookieService {
  private cookieConsentKey: string = "movago-cookie-consent"

  constructor() {}

  setCookie(name: string, value: string, days: number, path = "/"): void {
    const preferences: Record<string, boolean> | null = this.getConsentPreferences()
    const cookieCategory: string = this.getCookieCategory(name)

    if (name === this.cookieConsentKey) {
      const expires = new Date()
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=${path};SameSite=Lax`
      return
    }

    if (cookieCategory === "necessary" || (preferences && preferences[cookieCategory])) {
      const expires = new Date()
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=${path};SameSite=Lax`
    }
  }

  getCookie(name: string): string | null {
    const nameEQ: string = name + "="
    const ca: string[] = document.cookie.split(";")
    for (let i: number = 0; i < ca.length; i++) {
      let c: string = ca[i]
      while (c.charAt(0) === " ") {
        c = c.substring(1, c.length)
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length)
      }
    }
    return null
  }

  deleteCookie(name: string, path = "/"): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};SameSite=Lax`
  }

  getConsentPreferences(): Record<string, boolean> | null {
    const savedConsent: string | null = this.getCookie(this.cookieConsentKey)
    return savedConsent ? JSON.parse(savedConsent) : null
  }

  hasConsent(): boolean {
    return this.getCookie(this.cookieConsentKey) !== null
  }

  private getCookieCategory(name: string): string {
    const cookieCategories: Record<string, string> = {
      JSESSIONID: "necessary",
      session: "necessary",
      csrf_token: "necessary",
      [this.cookieConsentKey]: "necessary",

      language: "functional",
      theme: "functional",
      user_preferences: "functional",

      _ga: "analytics",
      _gid: "analytics",
      _gat: "analytics",

      _fbp: "marketing",
      ads: "marketing",
    }

    return cookieCategories[name] || "necessary"
  }
}
