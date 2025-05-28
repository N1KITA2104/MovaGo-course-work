import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ThemeService, Theme } from "../../services/theme.service"

@Component({
  selector: "app-theme-toggle",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./theme-toggle.component.html",
  styleUrls: ["./theme-toggle.component.scss"],
})
export class ThemeToggleComponent implements OnInit {
  isDarkTheme: boolean = false

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.currentTheme$.subscribe((theme: Theme): void => {
      this.isDarkTheme = theme === "dark"
    })
  }

  toggleTheme(): void {
    this.themeService.toggleTheme()
  }
}

