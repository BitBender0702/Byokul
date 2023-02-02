import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/root/service/auth.service';

@Component({
  selector: 'logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private route:ActivatedRoute,
     protected router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    
    localStorage.removeItem("jwt");
    this.authService.loginState$.next(false);
    this.router.navigate(['../login'], { relativeTo: this.route });
  }

}
