import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PermissionViewModel } from 'src/root/interfaces/permission/permissionViewModel';
import { PermissionNameConstant } from 'src/root/interfaces/permissionNameConstant';
import { AddTeacherViewModel } from 'src/root/interfaces/teacher/addTeacherViewModel';
import { AuthService } from 'src/root/service/auth.service';
import { SchoolService } from 'src/root/service/school.service';
import { TeacherService } from 'src/root/service/teacher.service';
import { UserService } from 'src/root/service/user.service';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';
import { NotificationType, NotificationViewModel } from 'src/root/interfaces/notification/notificationViewModel';
import { SignalrService } from 'src/root/service/signalr.service';
import { addTeacherResponse } from '../addOfficial/addOfficial.component';
// export const addTeacherResponse =new BehaviorSubject <boolean>(false);  

@Component({
    selector: 'addTeacher-root',
    templateUrl: './addteacher.component.html',
    styleUrls: ['./addteacher.component.css'],
    providers: [MessageService]

  })

export class AddTeacherComponent extends MultilingualComponent implements OnInit, OnDestroy{
    loadingIcon:boolean = false;
    isSubmitted: boolean = false;
    addNewOrExisting:any;
    createTeacherForm!:FormGroup;
    permissionsForm!:FormGroup;
    isAddNewteacher!:boolean;
    loginUserId!:string;
    private _schoolService;
    private _teacherService;
    private _userService;
    private _authService;
    private _signalrService;
    schoolList:any;
    classList:any;
    courseList:any;
    selectedSchools:string[]=[];
    selectedClasses:string[]=[];
    selectedCourses:string[]=[];
    permissions:any;
    addTeacherViewmodel!:AddTeacherViewModel;
    schoolPermissions:string[]=[];
    schoolIds:string[]=[];
    EMAIL_PATTERN = '[a-zA-Z0-9]+?(\\.[a-zA-Z0-9]+)*@[a-zA-Z]+\\.[a-zA-Z]{2,3}';
    classPermissions:string[]=[];
    coursePermissions:string[]=[];
    hideClassSection!:boolean;
    hideCourseSection!:boolean;
    allSchoolSelected!:boolean;
    selectedItems: string[] = [];
    changeLanguageSubscription!: Subscription;


    notificationViewModel!: NotificationViewModel;

    constructor(injector: Injector,private fb: FormBuilder, signalrservice: SignalrService,private router: Router,private route: ActivatedRoute,authService:AuthService,schoolService:SchoolService,teacherService:TeacherService,userService:UserService,public messageService:MessageService, private http: HttpClient,private activatedRoute: ActivatedRoute) { 
        super(injector);
        this._schoolService = schoolService;
        this._teacherService = teacherService;
        this._userService = userService;
        this._authService = authService;
        this._signalrService = signalrservice;

    }
  
    ngOnInit(): void {
        this.loadingIcon = true;
        this._authService.loginState$.next(true);
        var selectedLang = localStorage.getItem('selectedLanguage');
        this.translate.use(selectedLang ?? '');
        this.loginUserId = this.route.snapshot.paramMap.get('userId')??'';
        this.isAddNewteacher = true;

        this._schoolService.getUserAllSchools(this.loginUserId).subscribe((schoolList) => {    
            this.schoolList = schoolList;
            this.loadingIcon = false;
          });

          this._teacherService.getAllPermissions().subscribe((permissions) => {
            this.permissions = permissions;
          });

     this.createTeacherForm = this.fb.group({
        firstName: this.fb.control('',[Validators.required]),
        lastName: this.fb.control('',[Validators.required]),
        email: this.fb.control('',[Validators.required,Validators.pattern(this.EMAIL_PATTERN)]),
        gender: this.fb.control('',[Validators.required]),
      });

      this.permissionsForm = this.fb.group({
        selectedSchools:this.fb.control('',[Validators.required])
      });
      this.initializeAddTeacherViewModel();

      if(!this.changeLanguageSubscription){
        this.changeLanguageSubscription = changeLanguage.subscribe(response => {
          this.translate.use(response.language);
        })
      }
    }

    ngOnDestroy(): void {
        if(this.changeLanguageSubscription){
            this.changeLanguageSubscription.unsubscribe();
          }
    }

    back(): void {
      window.history.back();
    }

    openSidebar() {
      OpenSideBar.next({isOpenSideBar:true})
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
    getClassesAndCourses(event:any){
        if(this.selectedSchools.length > 0 && !this.allSchoolSelected){
           if(this.selectedSchools != undefined){
            var a = this.selectedSchools;
            this._schoolService.getSchoolsClassCourse(JSON.stringify(this.selectedSchools)).subscribe((result) => {
                this.classList = result.classes;
                this.courseList = result.courses;
              });
        }
    }
    }

    addTeacher(){
        this.isSubmitted = true;
        if (!this.createTeacherForm.valid) {
            return;
        }
        this.loadingIcon = true;
        var teacherInfo =this.createTeacherForm.value;
        this.addTeacherViewmodel.firstName = teacherInfo.firstName;
        this.addTeacherViewmodel.lastName = teacherInfo.lastName;
        this.addTeacherViewmodel.email = teacherInfo.email;
        this.addTeacherViewmodel.gender = Number(teacherInfo.gender);
        this.addTeacherViewmodel.isAllSchoolSelected = this.allSchoolSelected;
        this.addTeacherViewmodel.ownerId = this.loginUserId;

        if(this.selectedClasses?.length == this.classList?.length){
            this.addTeacherViewmodel.isAllClassSelected = true;
        }

        if(this.selectedCourses?.length == this.courseList?.length){
            this.addTeacherViewmodel.isAllCourseSelected = true;
        }

        this.selectedSchools.forEach(schoolId => {
            var schoolPermissions = {
                schoolId:schoolId,
                PermissionIds:this.schoolPermissions
            };
            this.addTeacherViewmodel.permissions.schoolPermissions.push(schoolPermissions);
        });
    
       if(this.addTeacherViewmodel.isAllClassSelected){
        this.selectedSchools.forEach(schoolId => {
             var classPermissions = {
                classId:PermissionNameConstant.DefaultClassId,
                PermissionIds:this.classPermissions,
                schoolId:schoolId
            };
            this.addTeacherViewmodel.permissions.classPermissions.push(classPermissions);
        });
       }
       else{
        this.selectedClasses.forEach(classId => {
            var classPermissions = {
                classId:classId,
                PermissionIds:this.classPermissions
            };
            this.addTeacherViewmodel.permissions.classPermissions.push(classPermissions);
        });
      }

      if(this.addTeacherViewmodel.isAllCourseSelected){
        this.selectedSchools.forEach(schoolId => {
             var coursePermissions = {
                courseId:PermissionNameConstant.DefaultCourseId,
                PermissionIds:this.coursePermissions,
                schoolId:schoolId
            };
            this.addTeacherViewmodel.permissions.coursePermissions.push(coursePermissions);
        });
       }
       else{
        this.selectedCourses.forEach(courseId => {
            var coursePermissions = {
                courseId:courseId,
                PermissionIds:this.coursePermissions
            };
            this.addTeacherViewmodel.permissions.coursePermissions.push(coursePermissions);
        });
    }  

        this._teacherService.addTeacher(this.addTeacherViewmodel).subscribe((result) => {
            this.router.navigateByUrl(`user/userProfile/${this.loginUserId}`);
            var notificationContent = "has added you as Teacher."
            console.log(notificationContent)
            var postId = '00000000-0000-0000-0000-000000000000';
            this.initializeNotificationViewModel(this.existingUserId, NotificationType.TeacherAdded, notificationContent, postId);
            addTeacherResponse.next({isEdit:true}); 
            this._signalrService.addTeacher(result);
        });
    }

    initializeAddTeacherViewModel(){
        this.addTeacherViewmodel = {
            firstName:'',
            lastName:'',
            email:'',
            gender:0,
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

    
    getSchoolPermissions(permission:any,event:any){

        if(permission.name == PermissionNameConstant.CreateEditCourse && event.target.checked){
            this.hideCourseSection = true;
            this.addTeacherViewmodel.isAllCourseSelected = true;

            var permissions: any[] = this.permissions;
            var coursepermissions = permissions.filter(x => x.permissionType === 3);
            var allCoursePermissions = coursepermissions.map(x => x.id);

            if(this.selectedSchools?.length == this.schoolList?.length){
               var coursePermissions = {
                   courseId:PermissionNameConstant.DefaultCourseId,
                   PermissionIds:allCoursePermissions
                };
                this.addTeacherViewmodel.permissions.coursePermissions.push(coursePermissions);
            }

            else{
                this.selectedSchools.forEach(schoolId => {
                    var coursePermissions = {
                        courseId:PermissionNameConstant.DefaultCourseId,
                        PermissionIds:allCoursePermissions,
                        schoolId:schoolId
                    };
                    this.addTeacherViewmodel.permissions.coursePermissions.push(coursePermissions);
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
                        schoolId:schoolId
                    };
                    this.addTeacherViewmodel.permissions.classPermissions.push(classPermissions);
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

    getSchoolIds(schoolId:string){
        var index = this.schoolIds.indexOf(schoolId);
        if(index > -1){
        this.schoolIds.splice(index, 1);
        }
        this.schoolIds.push(schoolId);
    }

    existingUserId:string=''
    getExistingUser(){        
        var email =this.createTeacherForm.get("email")?.value;
        if(email != ""){
          this._userService.getUserByEmail(email).subscribe((result) => {
            if(result != null){
                this.createTeacherForm.setValue({
                    firstName: result.firstName,
                    lastName: result.lastName,
                    gender: result.gender,
                    email: result.email
                });
                this.existingUserId = result.id
            }
          });
        }
    }

    // omit_special_char(event:any)
    // {   
    //    var k;  
    //    k = event.charCode;
    //    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32) && !(k >= 48 && k <= 57);
    //  }

    omit_special_char(event: any) {
        const regex = /[\p{L}\p{M}\s]/u;
        if (event.key && event.key.match(regex)) {
            return true;
        }
        return false;
    }


    
  initializeNotificationViewModel(userid: string, notificationType: NotificationType, notificationContent: string, postId: string, postType?: number, post?: any) {
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
      this._signalrService.sendNotification(this.notificationViewModel);
    });
  }



}
