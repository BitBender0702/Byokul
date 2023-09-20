import { Component, OnInit,Injector, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { AdminService } from 'src/root/service/admin/admin.service';
import { EnableDisableClassCourse } from 'src/root/interfaces/admin/enableDisableClassCourse';
import { RegisteredCourses } from 'src/root/interfaces/admin/registeredCourses';
import { Table } from 'primeng/table';
import { OpenAdminSideBar } from '../admin-template/side-bar/adminSide-bar.component';
import { MultilingualComponent, changeLanguage } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/root/service/auth.service';
import { SignalrService } from 'src/root/service/signalr.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { CourseService } from 'src/root/service/course.service';

export const disableEnableResponse = new Subject<{reloadClassCourseProfile:string}>();

@Component({
  selector: 'registered-courses',
  templateUrl: './registeredCourses.component.html',
  styleUrls: ['registeredCourses.component.css'],
})
export class RegisteredCoursesComponent extends MultilingualComponent implements OnInit,OnDestroy {

  private _adminService;
  private _authService;
  private _signalRService;
  private  _courseService;
  isSubmitted: boolean = false;
  registeredCourses!:RegisteredCourses[];
  selectedCourses!: RegisteredCourses[];
  enableDisableCourse!: EnableDisableClassCourse;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;
  cloned!:any;
  @ViewChild('dt') table!: Table;
  changeLanguageSubscription!:Subscription;
  courseId!:string
  courseDeletedOrNot!:boolean

  


  constructor(injector: Injector,authService: AuthService,private fb: FormBuilder,private http: HttpClient,adminService: AdminService, signalRService: SignalrService,courseService:CourseService,private translateService: TranslateService,public messageService: MessageService) {
    super(injector);
    this._adminService = adminService;
    this._authService = authService;
    this._signalRService = signalRService
    this._courseService = courseService
  }

  ngOnInit(): void {
    this.loadingIcon = true;
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this._authService.loginAdminState$.next(true);
    this.translate.use(this.selectedLanguage ?? '');
        this._adminService.getRegCourses().subscribe((response) => {
          this.registeredCourses = response;
          this.cloned = response.slice(0);
          this.loadingIcon = false;
          this.isDataLoaded = true;
        });  

        this.InitializeEnableDisableCourse();    

        if(!this.changeLanguageSubscription){
          this.changeLanguageSubscription = changeLanguage.subscribe(response => {
            this.translate.use(response.language);
          })
        }
      }

      InitializeEnableDisableCourse(){
        this.enableDisableCourse = {
            Id: '',
            isDisable: false
           };
      }

      ngOnDestroy(): void {
        if(this.changeLanguageSubscription){
          this.changeLanguageSubscription.unsubscribe();
        }
      }
      courseIdForReload = '';
      getDisableCourseDetails(courseId:string,from:string){
        this.enableDisableCourse.Id = courseId;
        this.courseIdForReload = courseId
        if(from == "Enable"){
          this.enableDisableCourse.isDisable = true;
        }
        else{
          this.enableDisableCourse.isDisable = false;

        }
      }

      disableCourse(){
        this.loadingIcon = true;
        this._adminService.enableDisableCourse(this.enableDisableCourse).subscribe((response) => {
          this.InitializeEnableDisableCourse();
          this.ngOnInit();
          // disableEnableResponse.next({});
          this._signalRService.reloadClassCourseProfile(this.courseIdForReload)
        });  

      }


      getDeleteCourseDetails(courseId:string,from:string){
        this.courseId = courseId
        if(from == "notDeleted"){
          this.courseDeletedOrNot = false
        }
        else{ 
          this.courseDeletedOrNot = true
        }
      }

      deleteCourse(){
        this.loadingIcon=true;
        this._courseService.deleteCourse(this.courseId).subscribe((response) => {
          this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Course deleted successfully' });
          this.loadingIcon = false;
         this.ngOnInit()
        });
      }

      restoreCourse(){
        this.loadingIcon = true;
        this._courseService.restoreCourse(this.courseId).subscribe((response) => {
          this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Course Restored successfully' });
          this.loadingIcon = false;
          this.ngOnInit()
        });
      }

      search(event: any) {
        this.table.filterGlobal(event.target.value, 'contains');
      }

      resetSorting(): void {
        this.table.reset();
        this.registeredCourses = this.cloned.slice(0);
      }

      openAdminSideBar(){
        OpenAdminSideBar.next({isOpenSideBar:true})
      }
    }
    
  


   

