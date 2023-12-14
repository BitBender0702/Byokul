import { ChangeDetectorRef, Component, ElementRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
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
export const unreadChatResponse =new Subject<{readMessagesCount: number,type:string,chatHeadId?:string}>(); 
export const OpenSideBar =new Subject<{isOpenSideBar:boolean}>(); 
export const enableDisableScc =new Subject<{isDisable:boolean,schoolId?:string,classId?:string,courseId?:string}>(); 
export const totalMessageAndNotificationCount =new Subject<{hamburgerCount:number}>(); 
export const notifyMessageAndNotificationCount =new Subject<{}>(); 
export const followedClassResponse =new Subject<{classId: string, classAvatar : string,className:string,schoolName:string }>(); 
export const followedCourseResponse =new Subject<{courseId: string, courseAvatar : string,courseName:string,schoolName:string }>(); 

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
  isUserBanned:boolean= false;
  notificationResponseSubscription!:Subscription;
  enableDisableSccSubscription!:Subscription;
  unreadChatSubscription!: Subscription;
  notifyMessageAndNotificationSubscription!: Subscription;
  followedClassResponseSubscription!: Subscription;
  followedCourseResponseSubscription!: Subscription;

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
      this.isUserBanned = response.user.isBan
      this.cd.detectChanges();
      this.loadingIcon = false;
      this.isDataLoaded = true;
      
    });

     if (!this.notifyMessageAndNotificationSubscription) {
      this.notifyMessageAndNotificationSubscription = notifyMessageAndNotificationCount.subscribe(response => {
        if(this.sidebarInfo == undefined){
          this._userService.getSidebarInfo().subscribe((response) => {
            this.sidebarInfo = response;
            var totalCount = this.sidebarInfo?.unreadNotificationCount + this.sidebarInfo?.unreadMessageCount;
            totalMessageAndNotificationCount.next({hamburgerCount:totalCount});
          });
        }
        else{
          var totalCount = this.sidebarInfo?.unreadNotificationCount + this.sidebarInfo?.unreadMessageCount;
          totalMessageAndNotificationCount.next({hamburgerCount:totalCount});
        }
      })
    }  

    if(!this.enableDisableSccSubscription){
      this.enableDisableSccSubscription = enableDisableScc.subscribe(response => {
      if(response.schoolId){
        var disableSchool = this.sidebarInfo.ownedSchools.find((x: { schoolId: string; })=> x.schoolId == response.schoolId);
        if(response.isDisable){
          disableSchool.isDisableByOwner = true;
        }
        else{
          disableSchool.isDisableByOwner = false;
        }
      }
      if(response.classId){
        var disableClass = this.sidebarInfo.ownedClasses.find((x: { classId: string; })=> x.classId == response.classId);
        if(response.isDisable){
          disableClass.isDisableByOwner = true;
        }
        else{
          disableClass.isDisableByOwner = false;
        }
      }
      if(response.courseId){
        var disableCourse = this.sidebarInfo.ownedCourses.find((x: { courseId: string; })=> x.courseId == response.courseId);
        if(response.isDisable){
          disableCourse.isDisableByOwner = true;
        }
        else{
          disableCourse.isDisableByOwner = false;
        }
      }

      });
    }

    if(!this.notificationResponseSubscription){
      this.notificationResponseSubscription = notificationResponse.subscribe(response => {
        this.sidebarInfo.unreadNotificationCount = this.sidebarInfo?.unreadNotificationCount + 1;
        var totalCount = this.sidebarInfo?.unreadNotificationCount + this.sidebarInfo?.unreadMessageCount;
        totalMessageAndNotificationCount.next({hamburgerCount:totalCount});
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

    if(!this.unreadChatSubscription){
      this.unreadChatSubscription = unreadChatResponse.subscribe(response => {
      if(response.readMessagesCount != undefined){
      if(response.type=="add"){
        this.sidebarInfo.unreadMessageCount = this.sidebarInfo.unreadMessageCount + response.readMessagesCount;
        var totalCount = this.sidebarInfo?.unreadNotificationCount + this.sidebarInfo?.unreadMessageCount;
        totalMessageAndNotificationCount.next({hamburgerCount:totalCount});
      }
      else{
        this.sidebarInfo.unreadMessageCount = this.sidebarInfo.unreadMessageCount - response.readMessagesCount;
        var totalCount = this.sidebarInfo?.unreadNotificationCount + this.sidebarInfo?.unreadMessageCount;
        totalMessageAndNotificationCount.next({hamburgerCount:totalCount});
      }
    }
    });
  }

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
      const encodedSchoolName = encodeURIComponent(reqSchool.schoolName.replace(" ",""));
      setTimeout(() => {
        this.router.navigateByUrl(`profile/school/${encodedSchoolName.toLowerCase()}`);
      }, 3000);
    }
  }
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
      const encodedSchoolName = encodeURIComponent(reqClass.school.schoolName.replace(" ",""));
      const encodedClassName = encodeURIComponent(response.className.replace(" ",""));


      setTimeout(() => {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigateByUrl(`profile/class/${encodedSchoolName.toLowerCase()}/${encodedClassName.toLowerCase()}`); 
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

      const encodedSchoolName = encodeURIComponent(reqClass.school.schoolName);
      const encodedCourseName = encodeURIComponent(response.courseName);

      setTimeout(() => {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigateByUrl(`profile/course/${encodedSchoolName.toLowerCase()}/${encodedCourseName.toLowerCase()}`);
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

    if (!this.followedClassResponseSubscription) {
      this.followedClassResponseSubscription = followedClassResponse.subscribe(response => {
        let classObj = {
          classId:response.classId,
          avatar:response.classAvatar,
          className: response.className,
          school:{
            schoolName:response.schoolName
          }
        };
        if(this.sidebarInfo)
          this.sidebarInfo.followedClasses.push(classObj);
      });
    }

    if (!this.followedCourseResponseSubscription) {
      this.followedCourseResponseSubscription = followedCourseResponse.subscribe(response => {
        let courseObj = {
          courseId:response.courseId,
          avatar:response.courseAvatar,
          courseName: response.courseName,
          school:{
            schoolName:response.schoolName
          }
        };
        if(this.sidebarInfo)
          this.sidebarInfo.followedCourses.push(courseObj);
      });
    }
    
  }

  ngOnDestroy(): void {
    if(this.notificationResponseSubscription){
      this.notificationResponseSubscription.unsubscribe();
    }
    if(this.enableDisableSccSubscription){
      this.enableDisableSccSubscription.unsubscribe();
    }
    if (this.unreadChatSubscription) {
      this.unreadChatSubscription.unsubscribe();
    }
    if (this.notifyMessageAndNotificationSubscription) {
      this.notifyMessageAndNotificationSubscription.unsubscribe();
    }
    if (this.followedClassResponseSubscription) {
      this.followedClassResponseSubscription.unsubscribe();
    }
    if (this.followedCourseResponseSubscription) {
      this.followedCourseResponseSubscription.unsubscribe();
    }
  }

  closeSidebar(){
    this.isOpenSidebar = false;
  }

  getSelectedSchool(schoolName:string){
    schoolName = encodeURIComponent(schoolName.toLowerCase());
    this.router.navigateByUrl(`profile/school/${schoolName}`);
    this.closeSidebar()
  }

  getSelectedClass(className:string,schoolName:string){
    className = className.split(" ").join("").toLowerCase();
    schoolName = schoolName.split(" ").join("").toLowerCase();
    const encodedClassName = encodeURIComponent(className);
    const encodedSchoolName = encodeURIComponent(schoolName);
    this.router.navigateByUrl(`profile/class/${encodedSchoolName}/${encodedClassName}`);
    this.closeSidebar()

  }

  getSelectedCourse(courseName:string,schoolName:string){
    courseName = courseName.split(" ").join("").toLowerCase()
    schoolName = schoolName.split(" ").join("").toLowerCase()
    const encodedCourseName = encodeURIComponent(courseName);
    const encodedSchoolName = encodeURIComponent(schoolName);
    this.router.navigateByUrl(`profile/course/${encodedSchoolName}/${encodedCourseName}`);
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
    var feedTab = localStorage.getItem('feedTab')??'';
    if(feedTab != ''){
      localStorage.setItem('feedTab','globalFeed');
    }
    this.closeSidebar()
  }

}
