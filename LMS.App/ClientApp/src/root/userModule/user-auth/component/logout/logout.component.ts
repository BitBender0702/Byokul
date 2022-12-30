import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private route:ActivatedRoute,
     protected router: Router) { }

  ngOnInit(): void {
    
    localStorage.removeItem("jwt");
    this.router.navigate(['../login'], { relativeTo: this.route });
  }

}
