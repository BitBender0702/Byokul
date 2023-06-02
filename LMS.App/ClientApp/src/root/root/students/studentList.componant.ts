import { Component, ElementRef, HostListener, Injectable, Injector, OnDestroy, OnInit, ViewChild } from "@angular/core"; 
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "src/root/service/user.service";
import { Subscription } from "rxjs";
import { FollowUnfollow } from "src/root/interfaces/FollowUnfollow";
import { FollowUnFollowEnum } from "src/root/Enums/FollowUnFollowEnum";
import { MultilingualComponent, changeLanguage } from "../sharedModule/Multilingual/multilingual.component";
import { StudentService } from "src/root/service/student.service";

@Component({
  selector: 'user-Followers',
  templateUrl: './studentList.component.html',
  styleUrls: ['./studentList.component.css']
})

export class StudentListComponent extends MultilingualComponent implements OnInit, OnDestroy{

    private _studentService;
    id!:string;
    type!:number;
    userId!:string;
    searchString:string = "";
    studentsPageNumber:number = 1;
    students!:any;
    isOpenSidebar:boolean = false;
    loadingIcon:boolean = false;
    isDataLoaded:boolean = false;
    scrolled:boolean = false;
    scrollStudentsResponseCount:number = 1;
    postLoadingIcon: boolean = false;
    loginUserId!:string;
    isOwner:boolean = false;
    changeLanguageSubscription!: Subscription;

    constructor(injector: Injector,studentService: StudentService,private route: ActivatedRoute) { 
      super(injector);
        this._studentService = studentService;
      
      }

    ngOnInit(): void {
     debugger
      this.loadingIcon = true;
      var selectedLang = localStorage.getItem('selectedLanguage');
      this.translate.use(selectedLang ?? '');
      this.id = this.route.snapshot.paramMap.get('id') ?? '';
      var type = this.route.snapshot.paramMap.get('type') ?? '';
      this.type = Number(type);
      if(this.type == 1){
        this._studentService.getSchoolStudents(this.id,this.studentsPageNumber,this.searchString).subscribe((response) => {
            debugger
            this.students = response;
            this.loadingIcon = false;
            this.isDataLoaded = true;
          });
      }

      if(this.type == 2){
        this._studentService.getClassStudents(this.id,this.studentsPageNumber,this.searchString).subscribe((response) => {
            debugger
            this.students = response;
            this.loadingIcon = false;
            this.isDataLoaded = true;
        });
      }

      if(this.type == 3){
        this._studentService.getCourseStudents(this.id,this.studentsPageNumber,this.searchString).subscribe((response) => {
            debugger
            this.students = response;
            this.loadingIcon = false;
            this.isDataLoaded = true;
        });
      }
    

      if(!this.changeLanguageSubscription){
        this.changeLanguageSubscription = changeLanguage.subscribe(response => {
          this.translate.use(response.language);
        })
      }

      this.isOwnerOrNot();
    }

    ngOnDestroy(): void {
      if(this.changeLanguageSubscription){
        this.changeLanguageSubscription.unsubscribe();
      }
    }

    isOwnerOrNot(){
      var validToken = localStorage.getItem("jwt");
        if (validToken != null) {
          let jwtData = validToken.split('.')[1]
          let decodedJwtJsonData = window.atob(jwtData)
          let decodedJwtData = JSON.parse(decodedJwtJsonData);
          this.loginUserId = decodedJwtData.jti;
          if(this.loginUserId == this.userId){
            this.isOwner = true;
          }
          else{
            this.isOwner = false;
          }
        }
    }

    getSelectedFollowing(followingId:string){
      window.location.href=`user/userProfile/${followingId}`;
    }

    back(): void {
      window.history.back();
    }

    studentsSearch(){
      this.studentsPageNumber = 1;
      if(this.searchString.length >2 || this.searchString == ""){
        if(this.type == 1){
            this._studentService.getSchoolStudents(this.id,this.studentsPageNumber,this.searchString).subscribe((response) => {
                this.students = response;
            });
        }
        if(this.type == 2){
            this._studentService.getClassStudents(this.id,this.studentsPageNumber,this.searchString).subscribe((response) => {
                this.students = response;
            });
        }
        if(this.type == 3){
            this._studentService.getCourseStudents(this.id,this.studentsPageNumber,this.searchString).subscribe((response) => {
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
        if(!this.scrolled && this.scrollStudentsResponseCount != 0){
        this.scrolled = true;
        this.postLoadingIcon = true;
        this.studentsPageNumber++;
        this.getStudents();
       }
      }
  }

  getStudents(){
    if(this.type == 1){
        this._studentService.getSchoolStudents(this.id,this.studentsPageNumber,this.searchString).subscribe((response) => {
            this.students =[...this.students, ...response];
            this.postLoadingIcon = false;
            this.scrollStudentsResponseCount = response.length; 
            this.scrolled = false;
        });
    }
    if(this.type == 2){
        this._studentService.getClassStudents(this.id,this.studentsPageNumber,this.searchString).subscribe((response) => {
            this.students =[...this.students, ...response];
            this.postLoadingIcon = false;
            this.scrollStudentsResponseCount = response.length; 
            this.scrolled = false;
        });
    }
    if(this.type == 3){
        this._studentService.getCourseStudents(this.id,this.studentsPageNumber,this.searchString).subscribe((response) => {
            this.students =[...this.students, ...response];
            this.postLoadingIcon = false;
            this.scrollStudentsResponseCount = response.length; 
            this.scrolled = false;
        });
    }
  }
}
