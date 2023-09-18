import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {MenuItem} from 'primeng/api';
import { AdminService } from 'src/root/service/admin/admin.service';
import { AuthService } from 'src/root/service/auth.service';
import { OpenAdminSideBar } from '../admin-template/side-bar/adminSide-bar.component';
import { MultilingualComponent, changeLanguage } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'adminHome-class',
  templateUrl: './adminHome.component.html',
  styleUrls: ['adminHome.component.css'],
})
export class AdminHomeComponent extends MultilingualComponent implements OnInit,OnDestroy {

  private _adminService;
  private _authService;
  isSubmitted: boolean = false;
  dashboardDetails:any;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;
  changeLanguageSubscription!:Subscription;

  
  constructor(injector: Injector,private fb: FormBuilder,private http: HttpClient,adminService: AdminService,authService: AuthService) {
    super(injector);
    this._adminService = adminService;
    this._authService = authService;
  }

  ngOnInit(): void {
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage ?? '');
    this._authService.loginState$.next(false);
    this._authService.loginAdminState$.next(true);
    this.loadingIcon = true;
    this._adminService.getDashboardDetails().subscribe((response) => {
      this.dashboardDetails = response;
      this.loadingIcon = false;
      this.isDataLoaded = true;
    });  

    if(!this.changeLanguageSubscription){
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.translate.use(response.language);
      })
    }
     
    }

    ngOnDestroy(): void {
      if(this.changeLanguageSubscription){
        this.changeLanguageSubscription.unsubscribe();
      }
      this._authService.loginAdminState$.next(false);
    }

    openAdminSideBar(){
      OpenAdminSideBar.next({isOpenSideBar:true})
    }

    hideSidebar(){
      // this._authService.loginAdminState$.next(false);
    }
    
  }


   

