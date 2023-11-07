import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SchoolService } from 'src/root/service/school.service';
import { OpenSideBar, notifyMessageAndNotificationCount, totalMessageAndNotificationCount } from 'src/root/user-template/side-bar/side-bar.component';

@Component({
    selector: 'schoolProfile-root',
    templateUrl: './myEarnings.component.html',
    styleUrls: []
  })

export class MyEarningsComponent implements OnInit {
    isOpenSidebar:boolean = false;
    isOpenSearch:boolean = false;
    hamburgerCountSubscription!: Subscription;
    hamburgerCount:number = 0;


    constructor(private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute) { 
    }
  
    ngOnInit(): void {
      if (!this.hamburgerCountSubscription) {
        this.hamburgerCountSubscription = totalMessageAndNotificationCount.subscribe(response => {
          this.hamburgerCount = response.hamburgerCount;
        });
      }
      notifyMessageAndNotificationCount.next({});
    }

    back(): void {
      window.history.back();
    }
  

    openSearch(){
      this.isOpenSearch = true;
    }

    closeSearch(){
      this.isOpenSearch = false;
    }
 
    openSidebar(){
      OpenSideBar.next({isOpenSideBar:true})
    }
  
}
