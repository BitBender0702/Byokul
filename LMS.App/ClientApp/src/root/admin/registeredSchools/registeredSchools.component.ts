import { Component, OnInit,Injector, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { AdminService } from 'src/root/service/admin/admin.service';
import { BanUnbanEnum } from 'src/root/Enums/BanUnbanEnum';
import { BanUnbanSchools } from 'src/root/interfaces/admin/banUnbanSchools';
import { RegisteredSchools } from 'src/root/interfaces/admin/registeredSchools';
import { VerifySchools } from 'src/root/interfaces/admin/verifySchools';
import { Table } from 'primeng/table';
import { AuthService } from 'src/root/service/auth.service';
import { OpenAdminSideBar } from '../admin-template/side-bar/adminSide-bar.component';
import { MultilingualComponent, changeLanguage } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { Subscription } from 'rxjs';
import { DeleteRestoreSchools } from 'src/root/interfaces/admin/deleteRestoreSchools';
import { SchoolService } from 'src/root/service/school.service';
import { TranslateService } from '@ngx-translate/core';
import { ownedSchoolResponse } from 'src/root/root/school/createSchool/createSchool.component';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'registered-schools',
  templateUrl: './registeredSchools.component.html',
  styleUrls: ['registeredSchools.component.css'],
})
export class RegisteredSchoolsComponent extends MultilingualComponent implements OnInit, OnDestroy {

  private _adminService;
  private _authService;
  private _schoolService;
  isSubmitted: boolean = false;
  registeredSchools!:RegisteredSchools[];
  selectedSchools!: RegisteredSchools[];
  banUnbanSchool!: BanUnbanSchools;
  verifySchool!: VerifySchools;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;
  myPaginationString!:string;
  cloned!:any;
  deleteRestoreSchool!:DeleteRestoreSchools
  isDeletedOrNot!:boolean
  schoolId!:string
  @ViewChild('dt') table!: Table;
  changeLanguageSubscription!:Subscription;
  
  constructor(injector: Injector,private fb: FormBuilder,private http: HttpClient,adminService: AdminService,authService: AuthService,schoolService:SchoolService,private translateService: TranslateService,public messageService: MessageService) {
    super(injector);
    this._adminService = adminService;
    this._authService = authService;
    this._schoolService = schoolService
  }

  ngOnInit(): void {
    this._authService.loginAdminState$.next(true);
    this.loadingIcon = true;
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage ?? '');
        this._adminService.getRegSchools().subscribe((response) => {
          this.registeredSchools = response;
          this.cloned = response.slice(0);
          this.loadingIcon = false;
          this.isDataLoaded = true;
        });  

        this.InitializeBanUnbanSchool();
        this.InitializeVerifySchool();

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
     
      getDeleteSchoolDetails(schoolid:string,from:string){
        debugger;
        
        this.schoolId = schoolid
        if(from == "notDeleted"){
          this.isDeletedOrNot = false
        }
        else{ 
          this.isDeletedOrNot = true
        }
        // this.deleteRestoreSchool.schoolId = schoolid

        // if(from == "notDeleted"){
        //   this.deleteRestoreSchool.isDeleted = true;
        // }
        // else{
        //   this.deleteRestoreSchool.isDeleted=false;
        // }
      }

      RestoreSchool(){
        debugger
        this.loadingIcon = true;
        this._schoolService.restoreSchool(this.schoolId).subscribe((response) => {
          //ownedSchoolResponse.next({ schoolId: this.schoolId, schoolAvatar: "", schoolName: "", action: "delete" });
          const translatedSuccessSummary = this.translateService.instant('Success');
          const translatedMessage = this.translateService.instant('SchoolRestoredSuccessfully');
          this.messageService.add({ severity: 'success', summary: translatedSuccessSummary, life: 3000, detail: translatedMessage });
          this.loadingIcon = false;
          //deleteSchoolResponse.next('delete');
        });
      }



      deleteSchool(){
        this.loadingIcon = true;
        debugger;
        this._schoolService.deleteSchool(this.schoolId).subscribe((response) => {
          ownedSchoolResponse.next({ schoolId: this.schoolId, schoolAvatar: "", schoolName: "", action: "delete" });
          const translatedSuccessSummary = this.translateService.instant('Success');
          const translatedMessage = this.translateService.instant('SchoolDeletedSuccessfully');
          this.messageService.add({ severity: 'success', summary: translatedSuccessSummary, life: 3000, detail: translatedMessage });
          this.loadingIcon = false;
          // deleteSchoolResponse.next('delete');
        });

      
       
        // if (this.school.students > 0) {
        //   const translatedInfoSummary = this.translateService.instant('Info');
        //   const translatedMessage = this.translateService.instant('SchoolNotAutomaticallyDeleted');
        //   this.messageService.add({ severity: 'info', summary: translatedInfoSummary, life: 3000, detail: translatedMessage });
        // }
        // else {
        //   this._schoolService.deleteSchool(this.school.schoolId).subscribe((response) => {
        //     ownedSchoolResponse.next({ schoolId: this.school.schoolId, schoolAvatar: "", schoolName: "", action: "delete" });
        //     const translatedSuccessSummary = this.translateService.instant('Success');
        //     const translatedMessage = this.translateService.instant('SchoolDeletedSuccessfully');
        //     this.messageService.add({ severity: 'success', summary: translatedSuccessSummary, life: 3000, detail: translatedMessage });
        //     setTimeout(() => {
        //       this.router.navigateByUrl(`user/userProfile/${this.userId}`);
        //     }, 3000);
        //     // deleteSchoolResponse.next('delete');
        //   });
        // }
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

      openAdminSideBar(){
        OpenAdminSideBar.next({isOpenSideBar:true})
      }
     

     
    }
    
  


   

