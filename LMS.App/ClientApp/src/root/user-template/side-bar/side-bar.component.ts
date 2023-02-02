import { Component, Injector, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ownedClassResponse } from 'src/root/root/class/createClass/createClass.component';
import { ownedCourseResponse } from 'src/root/root/course/createCourse/createCourse.component';
import { ownedSchoolResponse } from 'src/root/root/school/createSchool/createSchool.component';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { userImageResponse } from 'src/root/root/user/userProfile/userProfile.component';
import { UserService } from 'src/root/service/user.service';

@Component({
  selector: 'side-bar',
  templateUrl: 'side-bar.component.html',
  styleUrls: ['side-bar.component.css']
})
export class SideBarComponent extends MultilingualComponent implements OnInit {
  items!: MenuItem[];
  private _userService;
  sidebarInfo:any;
  validUser!:Boolean;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;

  @Input() isOpenSidebar!:boolean;

  constructor(injector: Injector,userService: UserService,private router: Router) {
    super(injector);
    this._userService = userService;
    
  }

  ngOnInit(): void {
    this.loadingIcon = true;
      var validToken = localStorage.getItem("jwt");
        if (validToken != null) {
          this.validUser = true;
        }
        else{
        this.validUser = false;
        }
        
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this._userService.getSidebarInfo().subscribe((response) => {
      this.sidebarInfo = response;
      this.loadingIcon = false;
      this.isDataLoaded = true;
    });

    userImageResponse.subscribe(response => {
      this.sidebarInfo.user.avatar = response.userAvatar;
    });

    ownedSchoolResponse.subscribe(response => {
      if(response.action== "add"){
      let schoolObj = {
        avatar:response.schoolAvatar,
        schoolName: response.schoolName
      };
      if(this.sidebarInfo)
        this.sidebarInfo.ownedSchools.push(schoolObj);
    }
    else{
      var ownedSchools: any[] = this.sidebarInfo.ownedSchools;
      var reqSchool = ownedSchools.find(x=> x.schoolId == response.schoolId);
      reqSchool.schoolName = response.schoolName;
      reqSchool.avatar = response.schoolAvatar;
      this.router.navigateByUrl(`profile/school/${response.schoolName.replace(" ","").toLowerCase()}`);
    }
      // this.ngOnInit();
    });

    ownedClassResponse.subscribe(response => {
      if(response.action== "add"){
      let classObj = {
        avatar:response.classAvatar,
        className: response.className,
        school:{
          schoolName:response.schoolName
        }
      };
      if(this.sidebarInfo)
        this.sidebarInfo.ownedClasses.push(classObj);
    }
    else{
      var ownedClasses: any[] = this.sidebarInfo.ownedClasses;
      var reqClass = ownedClasses.find(x=> x.classId == response.classId);
      reqClass.className = response.className;
      reqClass.avatar = response.classAvatar;
      this.router.navigateByUrl(`profile/class/${reqClass.school.schoolName.replace(" ","").toLowerCase()}/${response.className.replace(" ","").toLowerCase()}`);
    }
      // this.ngOnInit();
    });

    ownedCourseResponse.subscribe(response => {
      if(response.action== "add"){
      let courseObj = {
        avatar:response.courseAvatar,
        courseName: response.courseName,
        school:{
          schoolName:response.schoolName
        }
      };
      if(this.sidebarInfo)
        this.sidebarInfo.ownedCourses.push(courseObj);
    }
    else{
      var ownedCourses: any[] = this.sidebarInfo.ownedCourses;
      var reqClass = ownedCourses.find(x=> x.courseId == response.courseId);
      reqClass.courseName = response.courseName;
      reqClass.avatar = response.courseAvatar;
      this.router.navigateByUrl(`profile/course/${reqClass.school.schoolName.replace(" ","").toLowerCase()}/${response.courseName.replace(" ","").toLowerCase()}`);
    }
      // this.ngOnInit();
    });

  }

  closeSidebar(){
    this.isOpenSidebar = false;
  }

  getSelectedSchool(schoolName:string){
    // window.location.href=`user/schoolProfile/${schoolId}`;
    this.router.navigateByUrl(`profile/school/${schoolName.replace(" ","").toLowerCase()}`);

    //window.location.href=`profile/school/${schoolName.replace(" ","").toLowerCase()}`;

  }

  getSelectedClass(className:string,schoolName:string){
    
    // window.location.href=`profile/class/${schoolName.replace(" ","").toLowerCase()}/${className.replace(" ","").toLowerCase()}`;

    this.router.navigateByUrl(`profile/class/${schoolName.replace(" ","").toLowerCase()}/${className.replace(" ","").toLowerCase()}`);

  }

  getSelectedCourse(courseName:string,schoolName:string){
    
    // window.location.href=`user/courseProfile/${courseId}`;
    // window.location.href=`profile/course/${schoolName.replace(" ","").toLowerCase()}/${courseName.replace(" ","").toLowerCase()}`;

    this.router.navigateByUrl(`profile/course/${schoolName.replace(" ","").toLowerCase()}/${courseName.replace(" ","").toLowerCase()}`);


  }

  getUserDetails(userId:string){
    // window.location.href=`user/userProfile/${userId}`;
    this.router.navigateByUrl(`user/userProfile/${userId}`);

  }
}
