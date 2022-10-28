import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  private _router;
    constructor(private router: Router) { 
        this._router = router;
    }
    
  isExpanded = false;

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  isUserAuthenticated = (): boolean => {
    return false
  }
  
  logOut = () => {
    localStorage.removeItem("jwt");
    this.router.navigate(["/login"]);
  }
}
