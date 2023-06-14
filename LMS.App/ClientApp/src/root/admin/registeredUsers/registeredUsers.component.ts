import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { AdminService } from 'src/root/service/admin/admin.service';
import { RegisteredUsers } from 'src/root/interfaces/admin/registeredUsers';
import { BanUnbanUsers } from 'src/root/interfaces/admin/banUnbanUser';
import { BanUnbanEnum } from 'src/root/Enums/BanUnbanEnum';
import { VarifyUsers } from 'src/root/interfaces/admin/verifyUser';
import { Table } from 'primeng/table';
import { OpenAdminSideBar } from '../admin-template/side-bar/adminSide-bar.component';

@Component({
  selector: 'registered-users',
  templateUrl: './registeredUsers.component.html',
  styleUrls: ['registeredUsers.component.css'],
})
export class RegisteredUsersComponent implements OnInit {

  private _adminService;
  isSubmitted: boolean = false;
  registeredUsers!:RegisteredUsers[];
  selectedUsers!: RegisteredUsers[];
  banUnbanUser!: BanUnbanUsers;
  verifyUser!: VarifyUsers;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;
  sortOrder = 'asc';
  cloned!:any;
  @ViewChild('dt') table!: Table;


  
  constructor(private fb: FormBuilder,private http: HttpClient,adminService: AdminService) {
    this._adminService = adminService;
  }

  ngOnInit(): void {
    this.loadingIcon = true;
        this._adminService.getRegUsers().subscribe((response) => {
          this.registeredUsers = response;
          this.cloned = response.slice(0);
          this.loadingIcon = false;
          this.isDataLoaded = true;
        });  
        this.InitializeBanUnbanUser();
        this.InitializeVerifyUser();
      
      }

      InitializeBanUnbanUser(){
        this.banUnbanUser = {
          userId: '',
          isBan: false
         };
      }

      InitializeVerifyUser(){
        this.verifyUser = {
          userId: '',
          isVerify: false
         };
      }

      getBanUserDetails(userid:string,from:string){
        this.banUnbanUser.userId = userid;
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
        });  

      }

      getVarifyUserDetails(userid:string,from:string){
        this.verifyUser.userId = userid;
        if(from == "Verify"){
          this.verifyUser.isVerify = true;
        }
        else{
          this.verifyUser.isVerify = false;

        }

        
      }

      varifyUser(){
        this.loadingIcon = true;
        this._adminService.varifyUser(this.verifyUser).subscribe((response) => {
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
    
  


   

