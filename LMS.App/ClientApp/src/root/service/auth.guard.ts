import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RolesEnum } from '../RolesEnum/rolesEnum';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (this.authService.loginRequired) {
        this.router.navigate(["user/auth/login"]);
        return false;
    } else {
         return true;
    }
}
  
}
