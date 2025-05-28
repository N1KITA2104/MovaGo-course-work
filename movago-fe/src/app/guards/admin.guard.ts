import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import {User} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private userService: UserService, private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return this.userService.userProfile$.pipe(
      filter((user: User | null): user is User => !!user),
      take(1),
      map((user: User | null): boolean => {
        const isAdmin: boolean = user?.role === 'admin';
        if (isAdmin) {
          return true;
        } else {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      })
    );
  }
}
