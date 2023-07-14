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


@Component({
  selector: 'registered-classes',
  templateUrl: './registeredClasses.component.html',
  styleUrls: ['registeredClasses.component.css'],
})
export class RegisteredClassesComponent extends MultilingualComponent implements OnInit, OnDestroy {

  private _adminService;
  private _authService;
  isSubmitted: boolean = false;
  registeredClasses!:RegisteredClasses[];
  selectedClasses!: RegisteredClasses[];
  enableDisableClass!: EnableDisableClassCourse;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;
  cloned!:any;
  @ViewChild('dt') table!: Table;
  changeLanguageSubscription!:Subscription;

  
  constructor(injector: Injector,private fb: FormBuilder,private http: HttpClient,adminService: AdminService,authService: AuthService) {
    super(injector);
    this._adminService = adminService;
    this._authService = authService;
  }

  ngOnInit(): void {
    this.loadingIcon = true;
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage ?? '');
        this._adminService.getRegClasses().subscribe((response) => {
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
        if(from == "Enable"){
          this.enableDisableClass.isDisable = true;
        }
        else{
          this.enableDisableClass.isDisable = false;

        }
      }

      ngOnDestroy(): void {
        if(this.changeLanguageSubscription){
          this.changeLanguageSubscription.unsubscribe();
        }
      }

      disableClass(){
        this.loadingIcon = true;
        this._adminService.enableDisableClass(this.enableDisableClass).subscribe((response) => {
          this.InitializeEnableDisableClass();
          this.ngOnInit();
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
    
  


   

