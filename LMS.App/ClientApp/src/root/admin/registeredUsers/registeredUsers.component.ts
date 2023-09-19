import { Component, OnInit,Injector, QueryList, ViewChild, ViewChildren, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { AdminService } from 'src/root/service/admin/admin.service';
import { RegisteredUsers } from 'src/root/interfaces/admin/registeredUsers';
import { BanUnbanUsers } from 'src/root/interfaces/admin/banUnbanUser';
import { BanUnbanEnum } from 'src/root/Enums/BanUnbanEnum';
import { VerifyUsers } from 'src/root/interfaces/admin/verifyUser';
import { Table } from 'primeng/table';
import { OpenAdminSideBar } from '../admin-template/side-bar/adminSide-bar.component';
import { MultilingualComponent, changeLanguage } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/root/service/auth.service';
import { SignalrService } from 'src/root/service/signalr.service';


export const banUnbanUserProgression = new Subject<{userId: string}>();


@Component({
  selector: 'registered-users',
  templateUrl: './registeredUsers.component.html',
  styleUrls: ['registeredUsers.component.css'],
})
export class RegisteredUsersComponent extends MultilingualComponent implements OnInit, OnDestroy {

  private _adminService;
  private _signalRService;

  private _authService;
  isSubmitted: boolean = false;
  registeredUsers!:RegisteredUsers[];
  selectedUsers!: RegisteredUsers[];
  banUnbanUser!: BanUnbanUsers;
  verifyUsers!: VerifyUsers;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;
  sortOrder = 'asc';
  cloned!:any;
  @ViewChild('dt') table!: Table;
  changeLanguageSubscription!:Subscription;


  
  constructor(injector: Injector,authService: AuthService,private fb: FormBuilder,private http: HttpClient,adminService: AdminService, signalRService:SignalrService) {
    super(injector);
    this._adminService = adminService;
    this._authService = authService;
    this._signalRService = signalRService
  }

  ngOnInit(): void {
    this.loadingIcon = true;
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this._authService.loginAdminState$.next(true);
    this.translate.use(this.selectedLanguage ?? '');
        this._adminService.getRegUsers().subscribe((response) => {
          this.registeredUsers = response;
          this.cloned = response.slice(0);
          this.loadingIcon = false;
          this.isDataLoaded = true;
        });  
        this.InitializeBanUnbanUser();
        this.InitializeVerifyUser();
      
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
      }

      InitializeBanUnbanUser(){
        this.banUnbanUser = {
          userId: '',
          isBan: false
         };
      }

      InitializeVerifyUser(){
        this.verifyUsers = {
          userId: '',
          isVerify: false
         };
      }

      userIdForLogout:string=''
      getBanUserDetails(userid:string,from:string){
        this.banUnbanUser.userId = userid;
        this.userIdForLogout = userid;
        if(from == BanUnbanEnum.Ban){
          this.banUnbanUser.isBan = true;
        }
        else{
          this.banUnbanUser.isBan = false;

        }
      }

      banUser(){
        this.loadingIcon = true;
        this._adminService.banUnbanUser(this.banUnbanUser).subscribe((response) => {
          this.InitializeBanUnbanUser();
          this.ngOnInit();
          debugger
          this._signalRService.logoutBanUser(this.userIdForLogout)
        });  

      }

      getVerifyUserDetails(userid:string,from:string){
        this.verifyUsers.userId = userid;
        if(from == "Verify"){
          this.verifyUsers.isVerify = true;
        }
        else{
          this.verifyUsers.isVerify = false;

        }

        
      }

      verifyUser(){
        this.loadingIcon = true;
        this._adminService.verifyUser(this.verifyUsers).subscribe((response) => {
          this.InitializeVerifyUser();
          this.ngOnInit();
        }); 

      }
     
      viewUserProfile(userId:string){
        window.location.href=`user/userProfile/${userId}`;

      }

      // Rest of your component code...
    
      search(event: any) {
        this.table.filterGlobal(event.target.value, 'contains');
      }

      compareIsBan(a: boolean, b: boolean): number {
        if (a && !b) {
          return 1;
        } else if (!a && b) {
          return -1;
        } else {
          return 0;
        }
      }

      sort(column: any) {
        this.registeredUsers = this.registeredUsers.sort((a:any, b:any) => {
          const aValue = a[column] ? 1 : 0;
          const bValue = b[column] ? 1 : 0;
          return this.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      }

      resetSorting(): void {
        this.table.reset();
        this.registeredUsers = this.cloned.slice(0);
      }

      openAdminSideBar(){
        OpenAdminSideBar.next({isOpenSideBar:true})
      }

    }
    
  


   

