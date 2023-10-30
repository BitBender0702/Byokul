import { Component, ElementRef, HostListener, Injectable, Injector, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "src/root/service/user.service";
import { Subscription } from "rxjs";
import { FollowUnfollow } from "src/root/interfaces/FollowUnfollow";
import { FollowUnFollowEnum } from "src/root/Enums/FollowUnFollowEnum";
import { MultilingualComponent, changeLanguage } from "../sharedModule/Multilingual/multilingual.component";
import { StudentService } from "src/root/service/student.service";
import { OpenSideBar, notifyMessageAndNotificationCount, totalMessageAndNotificationCount } from "src/root/user-template/side-bar/side-bar.component";
import { CourseService } from "src/root/service/course.service";
import { ClassService } from "src/root/service/class.service";

import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ClassCourseEnum } from "src/root/Enums/classCourseEnum";



@Component({
  selector: 'user-Followers',
  templateUrl: './studentList.component.html',
  styleUrls: ['./studentList.component.css'],
  providers:[MessageService]
})

export class StudentListComponent extends MultilingualComponent implements OnInit, OnDestroy {

  private _studentService;
  private _courseService;
  private _classService;
  id!: string;
  type!: number;
  userId!: string;
  searchString: string = "";
  studentsPageNumber: number = 1;
  students!: any;
  isOpenSidebar: boolean = false;
  loadingIcon: boolean = false;
  isDataLoaded: boolean = false;
  scrolled: boolean = false;
  scrollStudentsResponseCount: number = 1;
  postLoadingIcon: boolean = false;
  loginUserId!: string;
  isOwner: boolean = false;
  hamburgerCountSubscription!: Subscription;
  hamburgerCount:number = 0;
  changeLanguageSubscription!: Subscription;
  showSearchButtonForMobile:boolean=false;

  constructor(injector: Injector, studentService: StudentService, private route: ActivatedRoute, 
    courseService: CourseService, classService: ClassService, private translateService: TranslateService,
    private cd: ChangeDetectorRef,
    public messageService: MessageService
    ) {
    super(injector);
    this._studentService = studentService;
    this._courseService = courseService;
    this._classService = classService;
  }

  ngOnInit(): void {
    debugger
    this.loadingIcon = true;
    var selectedLang = localStorage.getItem('selectedLanguage');
    this.translate.use(selectedLang ?? '');
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    var type = this.route.snapshot.paramMap.get('type') ?? '';
    this.type = Number(type);
    if (this.type == 1) {
      this._studentService.getSchoolStudents(this.id, this.studentsPageNumber, this.searchString).subscribe((response) => {
        debugger
        this.students = response;
        this.loadingIcon = false;
        this.isDataLoaded = true;
      });
    }

    if (this.type == 2) {
      this._studentService.getClassStudents(this.id, this.studentsPageNumber, this.searchString).subscribe((response) => {
        debugger
        this.students = response;
        this.loadingIcon = false;
        this.isDataLoaded = true;
      });
    }

    if (this.type == 3) {
      this._studentService.getCourseStudents(this.id, this.studentsPageNumber, this.searchString).subscribe((response) => {
        debugger
        this.students = response;
        this.loadingIcon = false;
        this.isDataLoaded = true;
      });
    }


    if (!this.changeLanguageSubscription) {
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.translate.use(response.language);
      })
    }

    if (!this.hamburgerCountSubscription) {
      this.hamburgerCountSubscription = totalMessageAndNotificationCount.subscribe(response => {
        debugger
        this.hamburgerCount = response.hamburgerCount;
      });
    }

    notifyMessageAndNotificationCount.next({});
    this.isOwnerOrNot();
  }

  ngOnDestroy(): void {
    if (this.changeLanguageSubscription) {
      this.changeLanguageSubscription.unsubscribe();
    }
    if (this.hamburgerCountSubscription) {
      this.hamburgerCountSubscription.unsubscribe();
    }
  }

  isOwnerOrNot() {
    var validToken = localStorage.getItem("jwt");
    if (validToken != null) {
      let jwtData = validToken.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.loginUserId = decodedJwtData.jti;
      if (this.loginUserId == this.userId) {
        this.isOwner = true;
      }
      else {
        this.isOwner = false;
      }
    }
  }

  getSelectedFollowing(followingId: string) {
    window.location.href = `user/userProfile/${followingId}`;
  }

  back(): void {
    window.history.back();
  }

  openSidebar() {
    OpenSideBar.next({ isOpenSideBar: true })
  }

  studentsSearch() {
    this.studentsPageNumber = 1;
    if (this.searchString.length > 2 || this.searchString == "") {
      if (this.type == 1) {
        this._studentService.getSchoolStudents(this.id, this.studentsPageNumber, this.searchString).subscribe((response) => {
          this.students = response;
        });
      }
      if (this.type == 2) {
        this._studentService.getClassStudents(this.id, this.studentsPageNumber, this.searchString).subscribe((response) => {
          this.students = response;
        });
      }
      if (this.type == 3) {
        this._studentService.getCourseStudents(this.id, this.studentsPageNumber, this.searchString).subscribe((response) => {
          this.students = response;
        });
      }
    }

  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    const windowSize = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;

    if (scrollPosition >= bodyHeight - windowSize) {
      if (!this.scrolled && this.scrollStudentsResponseCount != 0) {
        this.scrolled = true;
        this.postLoadingIcon = true;
        this.studentsPageNumber++;
        this.getStudents();
      }
    }
  }

  getStudents() {
    if (this.type == 1) {
      this._studentService.getSchoolStudents(this.id, this.studentsPageNumber, this.searchString).subscribe((response) => {
        this.students = [...this.students, ...response];
        this.postLoadingIcon = false;
        this.scrollStudentsResponseCount = response.length;
        this.scrolled = false;
      });
    }
    if (this.type == 2) {
      this._studentService.getClassStudents(this.id, this.studentsPageNumber, this.searchString).subscribe((response) => {
        this.students = [...this.students, ...response];
        this.postLoadingIcon = false;
        this.scrollStudentsResponseCount = response.length;
        this.scrolled = false;
      });
    }
    if (this.type == 3) {
      this._studentService.getCourseStudents(this.id, this.studentsPageNumber, this.searchString).subscribe((response) => {
        this.students = [...this.students, ...response];
        this.postLoadingIcon = false;
        this.scrollStudentsResponseCount = response.length;
        this.scrolled = false;
      });
    }
  }


  classOrCourseData: any;


  // getReportFollower(){

  // }

  banFollower(studentId: string, classOrCourseId: string) {
    debugger;
    if (this.type == 2) {
      this.classOrCourseData = {
        studentId: studentId,
        classId: classOrCourseId,
        courseId: null,
        bannerId: this.loginUserId
      }

      this._classService.banUnbanStudentFromClass(this.classOrCourseData).subscribe((response) => {
        debugger;
        if (response.message == "Student is banned") {
          const translatedInfoSummary = this.translateService.instant('Success');
          const translatedMessage = this.translateService.instant('Student is banned');
          this.messageService.add({ severity: 'success', summary: translatedInfoSummary, life: 3000, detail: translatedMessage });
          this.ngOnInit();
          this.cd.detectChanges();
        } else if(response.message == "Student is unbanned"){
          const translatedInfoSummary = this.translateService.instant('Success');
          const translatedMessage = this.translateService.instant('Student is unbanned');
          this.messageService.add({ severity: 'success', summary: translatedInfoSummary, life: 3000, detail: translatedMessage });
          this.ngOnInit();
          this.cd.detectChanges();
        }
      });


    }
    if (this.type == 3) {
      this.classOrCourseData = {
        studentId: studentId,
        classId: null,
        courseId: classOrCourseId,
        bannerId: this.loginUserId
      }


      this._courseService.banUnbanStudentFromCourse(this.classOrCourseData).subscribe((response) => {
        debugger;
        if (response.message == "Student is banned") {
          const translatedInfoSummary = this.translateService.instant('Success');
          const translatedMessage = this.translateService.instant('Student is banned');
          this.messageService.add({ severity: 'success', summary: translatedInfoSummary, life: 3000, detail: translatedMessage });
          this.ngOnInit();
          this.cd.detectChanges();
        } else if(response.message == "Student is unbanned"){
          const translatedInfoSummary = this.translateService.instant('Success');
          const translatedMessage = this.translateService.instant('Student is unbanned');
          this.messageService.add({ severity: 'success', summary: translatedInfoSummary, life: 3000, detail: translatedMessage });
          this.ngOnInit();
          this.cd.detectChanges();
        }
      });;
    }
  }

  openSearch(){
    this.showSearchButtonForMobile=true;
  }

}
