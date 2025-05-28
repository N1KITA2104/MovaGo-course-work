import { Injectable, Renderer2, RendererFactory2 } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"

export type Theme = "light" | "dark"

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private renderer: Renderer2
  private themeKey: string = "mova-go-theme"
  private currentThemeSubject: BehaviorSubject<Theme> = new BehaviorSubject<Theme>(this.getStoredTheme())

  public currentTheme$: Observable<Theme> = this.currentThemeSubject.asObservable()

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null)
    this.initTheme()
  }

  private getStoredTheme(): Theme {
    const storedTheme = localStorage.getItem(this.themeKey) as Theme
    return storedTheme === "dark" ? "dark" : "light"
  }

  private initTheme(): void {
    const theme: Theme = this.getStoredTheme()
    this.setTheme(theme)
  }

  public setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme)
    localStorage.setItem(this.themeKey, theme)

    if (theme === "dark") {
      document.body.classList.add("dark-theme")
      document.body.classList.remove("light-theme")
    } else {
      document.body.classList.add("light-theme")
      document.body.classList.remove("dark-theme")
    }
  }

  public toggleTheme(): void {
    const currentTheme: Theme = this.currentThemeSubject.getValue()
    const newTheme: Theme = currentTheme === "light" ? "dark" : "light"
    this.setTheme(newTheme)
  }

  public isDarkTheme(): boolean {
    return this.currentThemeSubject.getValue() === "dark"
  }
}

