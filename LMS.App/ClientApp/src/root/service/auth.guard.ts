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
        this.router.navigate(["schoolAdmin/auth/login"]);
        return false;
    } else {
      if(!this.authService.roleUser(RolesEnum.SchoolAdmin)){
        localStorage.removeItem("jwt");
        this.router.navigateByUrl("schoolAdmin/auth/login");
      }
        return true;
    }
}
  
}
