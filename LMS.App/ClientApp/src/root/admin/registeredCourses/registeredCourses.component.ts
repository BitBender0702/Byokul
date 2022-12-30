import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { AdminService } from 'src/root/service/admin/admin.service';
import { EnableDisableClassCourse } from 'src/root/interfaces/admin/enableDisableClassCourse';
import { RegisteredCourses } from 'src/root/interfaces/admin/registeredCourses';

@Component({
  selector: 'registered-courses',
  templateUrl: './registeredCourses.component.html',
  styleUrls: ['registeredCourses.component.css'],
})
export class RegisteredCoursesComponent implements OnInit {

  private _adminService;
  isSubmitted: boolean = false;
  registeredCourses!:RegisteredCourses[];
  selectedCourses!: RegisteredCourses[];
  enableDisableCourse!: EnableDisableClassCourse;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;


  constructor(private fb: FormBuilder,private http: HttpClient,adminService: AdminService) {
    this._adminService = adminService;
  }

  ngOnInit(): void {
    this.loadingIcon = true;
        this._adminService.getRegCourses().subscribe((response) => {
          this.registeredCourses = response;
          this.loadingIcon = false;
          this.isDataLoaded = true;
        });  

        this.InitializeEnableDisableCourse();    
      }

      InitializeEnableDisableCourse(){
        this.enableDisableCourse = {
            Id: '',
            isDisable: false
           };
      }

      getDisableCourseDetails(courseId:string,from:string){
        this.enableDisableCourse.Id = courseId;
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
        });  

      }

      // viewCourseProfile(courseId:string){
      //   window.location.href=`user/courseProfile/${courseId}`;

      // }
    }
    
  


   

