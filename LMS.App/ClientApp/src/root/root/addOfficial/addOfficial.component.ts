import {ChangeDetectorRef, Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { SchoolService } from 'src/root/service/school.service';
import { TeacherService } from 'src/root/service/teacher.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddOfficialViewModel } from 'src/root/interfaces/teacher/addOfficialViewModel';
import { PermissionViewModel } from 'src/root/interfaces/permission/permissionViewModel';
import { PermissionNameConstant } from 'src/root/interfaces/permissionNameConstant';
import { Constant } from 'src/root/interfaces/constant';
import { NotificationType, NotificationViewModel } from 'src/root/interfaces/notification/notificationViewModel';
import { UserService } from 'src/root/service/user.service';
import { SignalrService } from 'src/root/service/signalr.service';
export const addTeacherResponse = new Subject<{isEdit:boolean;userName?:string,userId?:string,teacherId?:string}>();

@Component({
    selector: 'fileStorage',
    templateUrl: './addOfficial.component.html',
    styleUrls: ['./addOfficial.component.css'],
    providers: [MessageService]
  })

export class AddOfficialComponent extends MultilingualComponent implements OnInit, OnDestroy {
  private _schoolService;
  private _teacherService;
  private _userService;
  private _signalrService;
  selectedLanguage:any;
  isDataLoaded: boolean = false;
  userId!:string;
  loginUserId!:string;
  selectedUserId!:string;
  schoolId!:string;
  filteredUsers!: any[];
  officialInfo:any;
  schoolFollowers:any;
  changeLanguageSubscription!:Subscription;  
  disabled: boolean = true;
  createTeacherForm!:FormGroup;

  // here from permissions
  schoolList:any;
  classList:any;
  courseList:any;
  selectedSchools:string[]=[];
  selectedClasses:string[]=[];
  selectedCourses:string[]=[];
  permissions:any;
  permissionsForm!:FormGroup;
  addOfficialViewmodel!:AddOfficialViewModel;
  schoolPermissions:string[]=[];
  classPermissions:string[]=[];
  coursePermissions:string[]=[];
  hideClassSection!:boolean;
  hideCourseSection!:boolean;
  allSchoolSelected!:boolean;
  isSubmitted: boolean = false;
  loadingIcon: boolean = false;
  userPermissions:any;
  isEdit:boolean = false;
  schoolName:string = "";
  notificationViewModel!: NotificationViewModel;
  constructor(injector: Injector,private fb: FormBuilder,signalrService:SignalrService,userService:UserService,private bsModalService: BsModalService,schoolService:SchoolService,public options: ModalOptions,teacherService:TeacherService,private cd: ChangeDetectorRef) { 
    super(injector);
    this._schoolService = schoolService;
    this._teacherService = teacherService;
    this._userService = userService;
    this._signalrService = signalrService;
  }

  ngOnInit(): void {
    debugger
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage?? '');    

    this.officialInfo = this.options.initialState;
    this.schoolId = this.officialInfo.schoolId;
    this.loginUserId = this.officialInfo.loginUserId;
    this.isEdit = this.officialInfo.isEdit;
    this.schoolName = this.officialInfo.schoolName;

    //get school followers

    this._schoolService.getAllSchoolFollowers(this.schoolId).subscribe((response: any) => {
      debugger
      this.schoolFollowers = response;
    });

    this.selectedSchools.push(this.schoolId);

    // this._schoolService.getUserAllSchools(this.userId).subscribe((schoolList) => {    
    //   this.schoolList = schoolList;
    //   // this.loadingIcon = false;
    // });

    // getClassesAndCourses(event:any){
    //   if(this.selectedSchools.length > 0 && !this.allSchoolSelected){
    //      if(this.selectedSchools != undefined){
    //       var a = this.selectedSchools;
          this._schoolService.getSchoolClassCourseForOfficials(this.schoolId).subscribe((result) => {
            debugger
              this.classList = result.classes;
              this.courseList = result.courses;
            });
    //   }
    // }
    // }

    this._teacherService.getAllPermissions().subscribe((permissions) => {
      this.permissions = permissions;
    });

    this.permissionsForm = this.fb.group({
      selectedSchools:this.fb.control('',[Validators.required])
    });
    this.initializeAddTeacherViewModel();

    this.createTeacherForm = this.fb.group({
      user: this.fb.control('',[Validators.required]),
    });

    if(!this.changeLanguageSubscription){
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.selectedLanguage = localStorage.getItem("selectedLanguage");
        this.translate.use(this.selectedLanguage?? '');
      })
    }

    if(this.isEdit){
      this.userId = this.officialInfo.userId;
      var userName = this.officialInfo.userName;
      var user = {
        userId:this.userId,
        userName:userName
      }
      this.createTeacherForm.get('user')?.setValue(user);
      

      this._teacherService.getTeacherPermissions(this.userId, this.schoolId).subscribe((permissions) => {
        debugger
        this.selectedClasses = permissions.classIds;
        this.selectedCourses = permissions.courseIds;
        this.schoolPermissions = permissions.schoolPermissionIds
        this.classPermissions = permissions.classPermissionIds;
        this.coursePermissions = permissions.coursePermissionIds;


        for (const permission of this.permissions) {
          permission.isSelectedSchoolPermission = this.schoolPermissions.includes(permission.id);
          permission.isSelectedClassPermission = this.classPermissions.includes(permission.id);
          permission.isSelectedCoursePermission = this.coursePermissions.includes(permission.id);
        }
      });
      this.cd.detectChanges();
      }

  }

  ngOnDestroy(): void {
    if(this.changeLanguageSubscription){
      this.changeLanguageSubscription.unsubscribe();
    }
  }

  close(): void {
    debugger
    this.bsModalService.hide();
  }

  initializeAddTeacherViewModel(){
    this.addOfficialViewmodel = {
        userId:'',
        schoolId:'',
        permissions:{
            schoolPermissions: [],
            classPermissions: [],
            coursePermissions: []
        } as PermissionViewModel,
        isAllSchoolSelected:false,
        isAllClassSelected:false,
        isAllCourseSelected:false,
        ownerId:''
    }
}

  filterUsers(event:any) {
    debugger
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.schoolFollowers.length; i++) {
      let schoolFollowers = this.schoolFollowers[i];
      if (schoolFollowers.userName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(schoolFollowers);
      }
    }
    this.filteredUsers = filtered;
  }

  hideUnhideClassCourse(event:any){
    if(this.selectedSchools.length == this.schoolList.length && event.value.length >0){
        this.allSchoolSelected = true;
        this.hideClassSection = true;
        this.hideCourseSection = true;
    }
    if(this.selectedSchools.length < this.schoolList.length && event.value.length >= 0){
        this.allSchoolSelected = false;
        this.hideClassSection = false;
        this.hideCourseSection = false;
    }
}

getSchoolPermissions(permission:any,event:any){

  if(permission.name == PermissionNameConstant.CreateEditCourse && event.target.checked){
      this.hideCourseSection = true;
      this.addOfficialViewmodel.isAllCourseSelected = true;

      var permissions: any[] = this.permissions;
      var coursepermissions = permissions.filter(x => x.permissionType === 3);
      var allCoursePermissions = coursepermissions.map(x => x.id);

      if(this.selectedSchools?.length == this.schoolList?.length){
         var coursePermissions = {
             courseId:PermissionNameConstant.DefaultCourseId,
             PermissionIds:allCoursePermissions
          };
          this.addOfficialViewmodel.permissions.coursePermissions.push(coursePermissions);
      }

      else{
          this.selectedSchools.forEach(schoolId => {
              var coursePermissions = {
                  courseId:PermissionNameConstant.DefaultCourseId,
                  PermissionIds:allCoursePermissions,
                  schoolId:schoolId
              };
              this.addOfficialViewmodel.permissions.coursePermissions.push(coursePermissions);
          });
      }

  }

  if(permission.name == PermissionNameConstant.CreateEditCourse && !event.target.checked){
      this.hideCourseSection = false;
  }

  if(permission.name == PermissionNameConstant.CreateEditClass && event.target.checked){
      this.hideClassSection = true;
      var permissions: any[] = this.permissions;
      var classpermissions = permissions.filter(x => x.permissionType === 2);
      var allClassPermissions = classpermissions.map(x => x.id);

          this.selectedSchools.forEach(schoolId => {
              var classPermissions = {
                  classId:PermissionNameConstant.DefaultClassId,
                  PermissionIds:allClassPermissions,
                  schoolId:this.schoolId
              };
              this.addOfficialViewmodel.permissions.classPermissions.push(classPermissions);
          });
  }

  if(permission.name == PermissionNameConstant.CreateEditClass && !event.target.checked){
      this.hideClassSection = false;
  }

  var index = this.schoolPermissions.indexOf(permission.id);
  if(index > -1){
  this.schoolPermissions.splice(index, 1);
  }
  this.schoolPermissions.push(permission.id);
}

getClassPermissions(permissionId:string){



  var index = this.classPermissions.indexOf(permissionId);
  if(index > -1){
  this.classPermissions.splice(index, 1);
  }
  this.classPermissions.push(permissionId);
}

getCoursePermissions(permissionId:string){
  var index = this.coursePermissions.indexOf(permissionId);
  if(index > -1){
  this.coursePermissions.splice(index, 1);
  }
  this.coursePermissions.push(permissionId);
}

addOfficial(){
  debugger
  this.isSubmitted = true;
  if (!this.createTeacherForm.valid) {
      return;
  }
  this.loadingIcon = true;
  var teacherInfo =this.createTeacherForm.value;
  // this.addTeacherViewmodel.firstName = teacherInfo.firstName;
  // this.addTeacherViewmodel.lastName = teacherInfo.lastName;
  // this.addTeacherViewmodel.email = teacherInfo.email;
  // this.addTeacherViewmodel.gender = Number(teacherInfo.gender);
  // this.addTeacherViewmodel.isAllSchoolSelected = this.allSchoolSelected;
  this.addOfficialViewmodel.userId = teacherInfo.user.userId;
  this.addOfficialViewmodel.ownerId = this.loginUserId;
  this.addOfficialViewmodel.schoolId = this.schoolId;

  if(this.selectedClasses?.length == this.classList?.length){
      this.addOfficialViewmodel.isAllClassSelected = true;
  }

  if(this.selectedCourses?.length == this.courseList?.length){
      this.addOfficialViewmodel.isAllCourseSelected = true;
  }

  this.selectedSchools.forEach(schoolId => {
      var schoolPermissions = {
          schoolId:schoolId,
          PermissionIds:this.schoolPermissions
      };
      this.addOfficialViewmodel.permissions.schoolPermissions.push(schoolPermissions);
  });

 if(this.addOfficialViewmodel.isAllClassSelected){
  this.selectedSchools.forEach(schoolId => {
       var classPermissions = {
          classId:PermissionNameConstant.DefaultClassId,
          PermissionIds:this.classPermissions,
          schoolId:this.schoolId
      };
      this.addOfficialViewmodel.permissions.classPermissions.push(classPermissions);
  });
 }
 else{
  this.selectedClasses.forEach(classId => {
      var classPermissions = {
          classId:classId,
          PermissionIds:this.classPermissions
      };
      this.addOfficialViewmodel.permissions.classPermissions.push(classPermissions);
  });
}

if(this.addOfficialViewmodel.isAllCourseSelected){
  this.selectedSchools.forEach(schoolId => {
       var coursePermissions = {
          courseId:PermissionNameConstant.DefaultCourseId,
          PermissionIds:this.coursePermissions,
          schoolId:schoolId
      };
      this.addOfficialViewmodel.permissions.coursePermissions.push(coursePermissions);
  });
 }
 else{
  this.selectedCourses.forEach(courseId => {
      var coursePermissions = {
          courseId:courseId,
          PermissionIds:this.coursePermissions
      };
      this.addOfficialViewmodel.permissions.coursePermissions.push(coursePermissions);
  });
}  

if(this.isEdit){
  this._teacherService.updateOfficial(this.addOfficialViewmodel).subscribe((result) => {
    debugger
    this.bsModalService.hide();
    this.loadingIcon = false;
    addTeacherResponse.next({isEdit:true}); 
    this._signalrService.addTeacher(result.teacherId);
});
}
else{
  this._teacherService.addOfficial(this.addOfficialViewmodel).subscribe((result) => {
      debugger
      this.bsModalService.hide();
      this.loadingIcon = false;
      var userInfo = this.schoolFollowers.find((x: { userId: string; }) => x.userId == this.addOfficialViewmodel.userId);
      addTeacherResponse.next({isEdit:false,userName:userInfo.userName,userId:userInfo.userId,teacherId:result.teacherId});
      var notificationContent = "has added you as Teacher."
      var postId =Constant.defaultGuid;
      this.initializeNotificationViewModel(this.addOfficialViewmodel.userId, NotificationType.TeacherAdded, notificationContent, postId);
      debugger;
      this._signalrService.addTeacher(result.teacherId);
  });
    
}
}

initializeNotificationViewModel(userid: string, notificationType: NotificationType, notificationContent: string, postId: string, postType?: number, post?: any) {
  debugger
  this._userService.getUser(this.loginUserId).subscribe((response) => {
    this.notificationViewModel = {
      id: '00000000-0000-0000-0000-000000000000',
      userId: userid,
      actionDoneBy: this.loginUserId,
      avatar: response.avatar,
      isRead: false,
      notificationContent: `${response.firstName + ' ' + response.lastName + ' ' + notificationContent}`,
      notificationType: notificationType,
      postId: postId,
      postType: postType,
      post: post,
      followersIds: null
    }
    debugger;
    this._signalrService.sendNotification(this.notificationViewModel);
  });
}



}


