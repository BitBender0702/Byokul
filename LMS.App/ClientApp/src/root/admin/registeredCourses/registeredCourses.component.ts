import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { AdminService } from 'src/root/service/admin/admin.service';
import { EnableDisableClassCourse } from 'src/root/interfaces/admin/enableDisableClassCourse';
import { RegisteredCourses } from 'src/root/interfaces/admin/registeredCourses';
import { Table } from 'primeng/table';
import { OpenAdminSideBar } from '../admin-template/side-bar/adminSide-bar.component';

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
  cloned!:any;
  @ViewChild('dt') table!: Table;
  


  constructor(private fb: FormBuilder,private http: HttpClient,adminService: AdminService) {
    this._adminService = adminService;
  }

  ngOnInit(): void {
    this.loadingIcon = true;
        this._adminService.getRegCourses().subscribe((response) => {
          this.registeredCourses = response;
          this.cloned = response.slice(0);
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
    
  


   

