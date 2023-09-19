import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { AdminService } from 'src/root/service/admin/admin.service';
import { RegisteredClasses } from 'src/root/interfaces/admin/registeredClasses';
import { EnableDisableClassCourse } from 'src/root/interfaces/admin/enableDisableClassCourse';
import { Table } from 'primeng/table';
import { AuthService } from 'src/root/service/auth.service';
import { OpenAdminSideBar } from '../admin-template/side-bar/adminSide-bar.component';
import { MultilingualComponent, changeLanguage } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { Subscription } from 'rxjs';
import { ClassService } from 'src/root/service/class.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { SignalrService } from 'src/root/service/signalr.service';


@Component({
  selector: 'registered-classes',
  templateUrl: './registeredClasses.component.html',
  styleUrls: ['registeredClasses.component.css'],
})
export class RegisteredClassesComponent extends MultilingualComponent implements OnInit, OnDestroy {

  private _adminService;
  private _authService;
  private _classService;
  private _signalRService;
  isSubmitted: boolean = false;
  registeredClasses!:RegisteredClasses[];
  selectedClasses!: RegisteredClasses[];
  enableDisableClass!: EnableDisableClassCourse;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;
  cloned!:any;
  @ViewChild('dt') table!: Table;
  changeLanguageSubscription!:Subscription;
  classId!:string
  classDeletedOrNot!:boolean

  
  // constructor(injector: Injector,private fb: FormBuilder,private http: HttpClient,adminService: AdminService,authService: AuthService, signalRService: SignalrService) {
  constructor(injector: Injector,private fb: FormBuilder,signalRService: SignalrService,private http: HttpClient,adminService: AdminService,authService: AuthService,classService:ClassService,private translateService: TranslateService,public messageService: MessageService) {
    super(injector);
    this._adminService = adminService;
    this._authService = authService;
    this._signalRService = signalRService;
    this._classService = classService
  }

  ngOnInit(): void {
    this.loadingIcon = true;
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this._authService.loginAdminState$.next(true);
    this.translate.use(this.selectedLanguage ?? '');
        this._adminService.getRegClasses().subscribe((response) => {
          debugger
          this.registeredClasses = response;
          this.cloned = response.slice(0);
          this.loadingIcon = false;
          this.isDataLoaded = true;
        });  

        this.InitializeEnableDisableClass();

        if(!this.changeLanguageSubscription){
          this.changeLanguageSubscription = changeLanguage.subscribe(response => {
            this.translate.use(response.language);
          })
        }
      }

      InitializeEnableDisableClass(){
        this.enableDisableClass = {
            Id: '',
            isDisable: false
           };
      }

      getDisableClassDetails(classId:string,from:string){
        this.enableDisableClass.Id = classId;
        this.classIdForReload = classId;
        if(from == "Enable"){
          this.enableDisableClass.isDisable = true;
        }
        else{
          this.enableDisableClass.isDisable = false;

        }
      }

      getDeleteClassDetails(classId:string,from:string){
        this.classId = classId
        if(from == "notDeleted"){
          this.classDeletedOrNot = false
        }
        else{ 
          this.classDeletedOrNot = true
        }
      }

      deleteClass(){
        this._classService.deleteClass(this.classId).subscribe((response) => {
          //ownedClassResponse.next({ classId: this.class.classId, classAvatar: "", className: "", schoolName: "", action: "delete" });
          // const translatedSuccessSummary = this.translateService.instant('Success');
          // const translatedMessage = this.translateService.instant('SchoolRestoredSuccessfully');
          // this.messageService.add({ severity: 'success', summary: translatedSuccessSummary, life: 3000, detail: translatedMessage });
          // this.loadingIcon = false;
          this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Class deleted successfully' });
          this.loadingIcon = false;
          // deleteClassResponse.next('delete');
        });
      }

      restoreClass(){
        this._classService.restoreClass(this.classId).subscribe((response) => {
          //ownedClassResponse.next({ classId: this.class.classId, classAvatar: "", className: "", schoolName: "", action: "delete" });
          // const translatedSuccessSummary = this.translateService.instant('Success');
          // const translatedMessage = this.translateService.instant('SchoolRestoredSuccessfully');
          // this.messageService.add({ severity: 'success', summary: translatedSuccessSummary, life: 3000, detail: translatedMessage });
          // this.loadingIcon = false;
          this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Class Restored successfully' });
          this.loadingIcon = false;
          // deleteClassResponse.next('delete');
        });
      }

      ngOnDestroy(): void {
        if(this.changeLanguageSubscription){
          this.changeLanguageSubscription.unsubscribe();
        }
      }

      classIdForReload='';
      disableClass(){
        this.loadingIcon = true;
        this._adminService.enableDisableClass(this.enableDisableClass).subscribe((response) => {
          this.InitializeEnableDisableClass();
          this.ngOnInit();
          debugger;
          this._signalRService.reloadClassCourseProfile(this.classIdForReload)
        });  

      }
     
      viewClassProfile(classId:string){
        window.location.href=`user/classProfile/${classId}`;

      }

      search(event: any) {
        this.table.filterGlobal(event.target.value, 'contains');
      }

      resetSorting(): void {
        this.table.reset();
        this.registeredClasses = this.cloned.slice(0);
      }

      openAdminSideBar(){
        OpenAdminSideBar.next({isOpenSideBar:true})
      }
    }
    
  


   

