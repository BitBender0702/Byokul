import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { AdminService } from 'src/root/service/admin/admin.service';
import { BanUnbanEnum } from 'src/root/Enums/BanUnbanEnum';
import { BanUnbanSchools } from 'src/root/interfaces/admin/banUnbanSchools';
import { RegisteredSchools } from 'src/root/interfaces/admin/registeredSchools';
import { VerifySchools } from 'src/root/interfaces/admin/verifySchools';

@Component({
  selector: 'registered-schools',
  templateUrl: './registeredSchools.component.html',
  styleUrls: ['registeredSchools.component.css'],
})
export class RegisteredSchoolsComponent implements OnInit {

  private _adminService;
  isSubmitted: boolean = false;
  registeredSchools!:RegisteredSchools[];
  selectedSchools!: RegisteredSchools[];
  banUnbanSchool!: BanUnbanSchools;
  verifySchool!: VerifySchools;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;


  
  constructor(private fb: FormBuilder,private http: HttpClient,adminService: AdminService) {
    this._adminService = adminService;
  }

  ngOnInit(): void {
    this.loadingIcon = true;
        this._adminService.getRegSchools().subscribe((response) => {
          this.registeredSchools = response;
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
    }
    
  


   

