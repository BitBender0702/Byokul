import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RolesEnum } from 'src/root/RolesEnum/rolesEnum';
import { AuthService } from 'src/root/service/auth.service';


@Injectable({
  providedIn: 'root'
})
export class StudentsAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
    
    if (this.authService.loginRequired) {
        this.router.navigate(["user/Auth/login"]);
        return false;
    } else {
      if(!this.authService.roleUser(RolesEnum.SchoolStudent)){
        localStorage.removeItem("jwt");
        this.router.navigateByUrl("user/Auth/login");
      }
        return true;
    }
}
  
}
