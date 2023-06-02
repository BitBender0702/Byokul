import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { AdminService } from 'src/root/service/admin/admin.service';
import { BanUnbanEnum } from 'src/root/Enums/BanUnbanEnum';
import { BanUnbanSchools } from 'src/root/interfaces/admin/banUnbanSchools';
import { RegisteredSchools } from 'src/root/interfaces/admin/registeredSchools';
import { VerifySchools } from 'src/root/interfaces/admin/verifySchools';
import { Table } from 'primeng/table';
import { AuthService } from 'src/root/service/auth.service';

@Component({
  selector: 'registered-schools',
  templateUrl: './registeredSchools.component.html',
  styleUrls: ['registeredSchools.component.css'],
})
export class RegisteredSchoolsComponent implements OnInit {

  private _adminService;
  private _authService;
  isSubmitted: boolean = false;
  registeredSchools!:RegisteredSchools[];
  selectedSchools!: RegisteredSchools[];
  banUnbanSchool!: BanUnbanSchools;
  verifySchool!: VerifySchools;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;
  myPaginationString!:string;
  cloned!:any;
  @ViewChild('dt') table!: Table;
  
  constructor(private fb: FormBuilder,private http: HttpClient,adminService: AdminService,authService: AuthService) {
    this._adminService = adminService;
    this._authService = authService;
  }

  ngOnInit(): void {
    this._authService.loginAdminState$.next(true);
    this.loadingIcon = true;
        this._adminService.getRegSchools().subscribe((response) => {
          this.registeredSchools = response;
          this.cloned = response.slice(0);
          this.loadingIcon = false;
          this.isDataLoaded = true;
        });  

        this.InitializeBanUnbanSchool();
        this.InitializeVerifySchool();
      }

      InitializeBanUnbanSchool(){
        this.banUnbanSchool = {
            schoolId: '',
            isBan: false
           };
      }

      InitializeVerifySchool(){
        this.verifySchool = {
          schoolId: '',
          isVerify: false
         };
      }

      getBanSchoolDetails(schoolid:string,from:string){
        this.banUnbanSchool.schoolId = schoolid;
        if(from == BanUnbanEnum.Ban){
          this.banUnbanSchool.isBan = true;
        }
        else{
          this.banUnbanSchool.isBan = false;
        }
      }

      banSchool(){
        this.loadingIcon = true;
        this._adminService.banUnbanSchool(this.banUnbanSchool).subscribe((response) => {
          this.InitializeBanUnbanSchool();
          this.ngOnInit();
        });  
      }

      getVarifySchoolDetails(schoolid:string,from:string){
        this.verifySchool.schoolId = schoolid;
        if(from == "Verify"){
          this.verifySchool.isVerify = true;
        }
        else{
          this.verifySchool.isVerify = false;
        }
      }

      verifySchools(){
        this.loadingIcon = true;
        this._adminService.varifySchool(this.verifySchool).subscribe((response) => {
          this.InitializeVerifySchool();
          this.ngOnInit();
        }); 
      }
     
      viewSchoolProfile(schoolId:string){
        window.location.href=`user/schoolProfile/${schoolId}`;
      }

      search(event: any) {
        this.table.filterGlobal(event.target.value, 'contains');
      }

      resetSorting(): void {
        this.table.reset();
        this.registeredSchools = this.cloned.slice(0);
      }
    }
    
  


   

