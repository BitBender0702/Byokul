import { ChangeDetectorRef, Component, ElementRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { unreadChatResponse } from 'src/root/root/chat/chat.component';
import { convertIntoCourseResponse } from 'src/root/root/class/classProfile/classProfile.component';
import { ownedClassResponse } from 'src/root/root/class/createClass/createClass.component';
import { convertIntoClassResponse } from 'src/root/root/course/courseProfile/courseProfile.component';
import { ownedCourseResponse } from 'src/root/root/course/createCourse/createCourse.component';
import { unreadNotificationResponse } from 'src/root/root/Notifications/notifications.component';
import { ownedSchoolResponse } from 'src/root/root/school/createSchool/createSchool.component';
import { MultilingualComponent } from 'src/root/root/sharedModule/Multilingual/multilingual.component';
import { userImageResponse } from 'src/root/root/user/userProfile/userProfile.component';
import { UserService } from 'src/root/service/user.service';
import { dashboardResponse } from 'src/root/userModule/user-auth/component/login/login.component';
import { Subject, Subscription } from 'rxjs';
import { notificationResponse } from 'src/root/service/signalr.service';

export const OpenSideBar =new Subject<{isOpenSideBar:boolean}>(); 

@Component({
  selector: 'side-bar',
  templateUrl: 'side-bar.component.html',
  styleUrls: ['side-bar.component.css']
})
export class SideBarComponent extends MultilingualComponent implements OnInit, OnDestroy{
  items!: MenuItem[];
  private _userService;
  sidebarInfo:any;
  validUser!:Boolean;
  loadingIcon:boolean = false;
  isDataLoaded:boolean = false;
  loginUserId!:string;
  isOpenSidebar: boolean = false;
  notificationResponseSubscription!:Subscription;
  // @Input() isOpenSidebar!:boolean;

  constructor(injector: Injector,userService: UserService,private router: Router,private cd: ChangeDetectorRef, private elementRef: ElementRef) {
    super(injector);
    this._userService = userService;
    
  }

  ngOnInit(): void {
    this.getCurrentUserId();
    this.loadingIcon = true;
      var validToken = localStorage.getItem("jwt");
        if (validToken != null) {
          this.validUser = true;
          let jwtData = validToken.split('.')[1];
          let decodedJwtJsonData = window.atob(jwtData);
          let decodedJwtData = JSON.parse(decodedJwtJsonData);
          this.loginUserId = decodedJwtData.jti;
        }
        else{
        this.validUser = false;
        }
        
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage ?? '');
    this._userService.getSidebarInfo().subscribe((response) => {
      this.sidebarInfo = response;
      this.cd.detectChanges();
      this.loadingIcon = false;
      this.isDataLoaded = true;
    });

    if(!this.notificationResponseSubscription){
      this.notificationResponseSubscription = notificationResponse.subscribe(response => {
      debugger
        this.sidebarInfo.unreadNotificationCount = this.sidebarInfo?.unreadNotificationCount + 1;
      });
    }

    OpenSideBar.subscribe(response => {
      this.isOpenSidebar = response.isOpenSideBar;
    });
    dashboardResponse.subscribe(response => {
      if(response.token != ''){
      this._userService.getSidebarInfo(response.token).subscribe((response) => {
        this.sidebarInfo = response;
        this.loadingIcon = false;
        this.isDataLoaded = true;
      });
    }
    });

    unreadChatResponse.subscribe(response => {
      if(response.type=="add"){
        this.sidebarInfo.unreadMessageCount = this.sidebarInfo.unreadMessageCount + response.readMessagesCount;
      }
      else{
        this.sidebarInfo.unreadMessageCount = this.sidebarInfo.unreadMessageCount - response.readMessagesCount;
      }
    });

    unreadNotificationResponse.subscribe(response => {
      if(response.type =="remove"){
      this.sidebarInfo.unreadNotificationCount = 0;
      }
      else{
        this.sidebarInfo.unreadNotificationCount += 1;
      }
    });   


    userImageResponse.subscribe(response => {
      this.sidebarInfo.user.gender = response.gender;
      this.sidebarInfo.user.avatar = response.userAvatar;
      this.cd.detectChanges();
    });

    ownedSchoolResponse.subscribe(response => {
      if(response.action== "add"){
      let schoolObj = {
        schoolId:response.schoolId,
        avatar:response.schoolAvatar,
        schoolName: response.schoolName
      };
      if(this.sidebarInfo)
        this.sidebarInfo.ownedSchools.push(schoolObj);
    }
    else{
      if(response.action== "delete"){
        var indexToRemove = this.sidebarInfo.ownedSchools.findIndex((x: { schoolId: string; })=> x.schoolId == response.schoolId);
        if (indexToRemove !== -1) {
          this.sidebarInfo.ownedSchools.splice(indexToRemove, 1);
        }
      }
      else{
      var ownedSchools: any[] = this.sidebarInfo.ownedSchools;
      var reqSchool = ownedSchools.find(x=> x.schoolId == response.schoolId);
      reqSchool.schoolName = response.schoolName;
      reqSchool.avatar = response.schoolAvatar;
      setTimeout(() => {
        this.router.navigateByUrl(`profile/school/${response.schoolName.replace(" ","").toLowerCase()}`);
      }, 3000);
    }
  }
      // this.ngOnInit();
    });

    ownedClassResponse.subscribe(response => {
      if(response.action== "add"){
      let classObj = {
        classId:response.classId,
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
      if(response.action== "delete"){
        var indexToRemove = this.sidebarInfo.ownedClasses.findIndex((x: { classId: string; })=> x.classId == response.classId);
        if (indexToRemove !== -1) {
          this.sidebarInfo.ownedClasses.splice(indexToRemove, 1);
        }
      }
      else{
      var ownedClasses: any[] = this.sidebarInfo.ownedClasses;
      var reqClass = ownedClasses.find(x=> x.classId == response.classId);
      reqClass.className = response.className;
      reqClass.avatar = response.classAvatar;
      

      setTimeout(() => {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigateByUrl(`profile/class/${reqClass.school.schoolName.replace(" ","").toLowerCase()}/${response.className.replace(" ","").toLowerCase()}`); 
      }, 3000);
     }
    }
    });

    ownedCourseResponse.subscribe(response => {
      if(response.action== "add"){
      let courseObj = {
        courseId:response.courseId,
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
      if(response.action== "delete"){
        var indexToRemove = this.sidebarInfo.ownedCourses.findIndex((x: { courseId: string; })=> x.courseId == response.courseId);
        if (indexToRemove !== -1) {
          this.sidebarInfo.ownedCourses.splice(indexToRemove, 1);
        }
      }
      else{
      var ownedCourses: any[] = this.sidebarInfo.ownedCourses;
      var reqClass = ownedCourses.find(x=> x.courseId == response.courseId);
      reqClass.courseName = response.courseName;
      reqClass.avatar = response.courseAvatar;
      setTimeout(() => {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigateByUrl(`profile/course/${reqClass.school.schoolName.replace(" ","").toLowerCase()}/${response.courseName.replace(" ","").toLowerCase()}`);
      }, 3000);
    }
  }
    });

    convertIntoCourseResponse.subscribe(response => {
      let courseObject = {
        courseId:response.courseId,
        avatar:response.avatar,
        courseName: response.courseName,
        school: response.school,
      };
      if(this.sidebarInfo)
      var index = this.sidebarInfo.ownedClasses.findIndex((x: { classId: any; }) => x.classId == response.courseId);
      if (index !== -1) {
        this.sidebarInfo.ownedClasses.splice(index, 1);
      }

        this.sidebarInfo.ownedCourses.push(courseObject);
    });

    convertIntoClassResponse.subscribe(response => {
      let classObject = {
        classId:response.classId,
        avatar:response.avatar,
        className: response.className,
        school: response.school
      };
      if(this.sidebarInfo)
      var index = this.sidebarInfo.ownedCourses.findIndex((x: { courseId: any; }) => x.courseId == response.classId);
      if (index !== -1) {
        this.sidebarInfo.ownedCourses.splice(index, 1);
      }
        this.sidebarInfo.ownedClasses.push(classObject);
    });
    
  }


  ngOnDestroy(): void {
    if(this.notificationResponseSubscription){
      this.notificationResponseSubscription.unsubscribe();
    }
  }

  closeSidebar(){
    this.isOpenSidebar = false;
  }

  getSelectedSchool(schoolName:string){
    schoolName = schoolName.split('.').join("").split(" ").join("").toLowerCase()
    this.router.navigateByUrl(`profile/school/${schoolName}`);
    this.closeSidebar()
  }

  getSelectedClass(className:string,schoolName:string){
    className = className.split('.').join("").split(" ").join("").toLowerCase()
    schoolName = schoolName.split('.').join("").split(" ").join("").toLowerCase()
    this.router.navigateByUrl(`profile/class/${schoolName}/${className}`);
    this.closeSidebar()

  }

  getSelectedCourse(courseName:string,schoolName:string){
    courseName = courseName.split('.').join("").split(" ").join("").toLowerCase()
    schoolName = schoolName.split('.').join("").split(" ").join("").toLowerCase()
    this.router.navigateByUrl(`profile/course/${schoolName}/${courseName}`);
    this.closeSidebar()

  }

  getUserDetails(userId:string){
    this.router.navigateByUrl(`user/userProfile/${userId}`);
    this.closeSidebar()

  }

  getCurrentUserId(){
    var validToken = localStorage.getItem("jwt");
    if (validToken != null) {
      let jwtData = validToken.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.loginUserId = decodedJwtData.jti;
    }
    this.closeSidebar()

  }

  openGlobalFeedTab(){
    debugger
    var feedTab = localStorage.getItem('feedTab')??'';
    if(feedTab != ''){
      localStorage.setItem('feedTab','globalFeed');
    }
    this.closeSidebar()
  }

  // window.onload = function(){
  //   debugger
  //   var hideSiedBar = document.getElementById('side-bar');
  //   document.onclick = function(e:any) {
  //     if(hideSiedBar)
  //     if(e.target.id !== 'hideSiedBar'){
  //       hideSiedBar.style.display = 'none';
  //     }
  //   }
  // }

  // document.addEventListener("click", function(event) {
  //   // Check if the click occurred outside the sidebar
  //   if (!sidebar.contains(event.target)) {
  //     // Close the sidebar
  //     sidebar.style.display = "none";
  //   }
  // });
  

}
