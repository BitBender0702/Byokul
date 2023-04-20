import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Injector, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AddClassCertificate } from 'src/root/interfaces/class/addClassCertificate';
import { AddClassLanguage } from 'src/root/interfaces/class/addClassLanguage';
import { AddClassTeacher } from 'src/root/interfaces/class/addClassTeacher';
import { DeleteClassCertificate } from 'src/root/interfaces/class/deleteClassCertificate';
import { DeleteClassLanguage } from 'src/root/interfaces/class/deleteClassLanguage';
import { DeleteClassTeacher } from 'src/root/interfaces/class/deleteClassTeacher';
import { EditClassModel } from 'src/root/interfaces/class/editClassModel';
import { ClassService } from 'src/root/service/class.service';
import { PostService } from 'src/root/service/post.service';
import { addPostResponse, CreatePostComponent } from '../../createPost/createPost.component';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';
import { PostViewComponent, savedPostResponse, sharePostResponse } from '../../postView/postView.component';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { ClassView } from 'src/root/interfaces/class/classView';
import { MessageService } from 'primeng/api';
import { ReelsViewComponent } from '../../reels/reelsView.component';
import { ownedClassResponse } from '../createClass/createClass.component';
import { PaymentComponent, paymentStatusResponse } from '../../payment/payment.component';
import { NotificationService } from 'src/root/service/notification.service';
import { NotificationType } from 'src/root/interfaces/notification/notificationViewModel';
import { CertificateViewComponent } from '../../certificateView/certificateView.component';
import { PostAuthorTypeEnum } from 'src/root/Enums/postAuthorTypeEnum';
import { PermissionNameConstant } from 'src/root/interfaces/permissionNameConstant';
import { PermissionTypeEnum } from 'src/root/Enums/permissionTypeEnum';
import { SharePostComponent } from '../../sharePost/sharePost.component';
import { Constant } from 'src/root/interfaces/constant';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { AuthService } from 'src/root/service/auth.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';



export const convertIntoCourseResponse =new Subject<{courseId: string, courseName : string,school:any,avatar:string}>(); 


@Component({
    selector: 'classProfile-root',
    templateUrl: './classProfile.component.html',
    styleUrls: ['./classProfile.component.css'],
    providers: [MessageService]
  })

export class ClassProfileComponent extends MultilingualComponent implements OnInit,OnDestroy,OnChanges {

  private destroy$: Subject<void> = new Subject();
    private _classService;
    private _postService;
    private _notificationService;
    private _authService;
    class:any;
    isProfileGrid:boolean = true;
    isOpenSidebar:boolean = false;
    isOpenModal:boolean = false;
    loadingIcon:boolean = false;
    postLoadingIcon: boolean = false;
    reelsLoadingIcon:boolean = false;
    classId!:string;
    validToken!:string;

    classLanguage!:AddClassLanguage;
    classTeacher!:AddClassTeacher;
    deleteLanguage!: DeleteClassLanguage;
    deleteTeacher!: DeleteClassTeacher;

    editClass:any;
    editClassForm!:FormGroup;
    languageForm!:FormGroup;
    teacherForm!:FormGroup;
    certificateForm!:FormGroup;
    uploadImage!:any;
    updateClassDetails!:EditClassModel;
    accessibility:any;
    filteredLanguages!: any[];
    languages:any;
    filteredTeachers!: any[];
    teachers:any;
    deleteCertificate!: DeleteClassCertificate;
    classCertificate!:AddClassCertificate;
    certificateToUpload = new FormData();
    fileToUpload= new FormData();
    isSubmitted: boolean = false;
    isClassPaid!:boolean;
    disabled:boolean = true;
    currentDate!:string;
    isOwner!:boolean;
    userId!:string;
    likesLength!:number;
    isLiked!:boolean;
    likeUnlikePost!: LikeUnlikePost;
    currentLikedPostId!:string;
    className!:string;
    gridItemInfo:any;
    isGridItemInfo: boolean = false;
    postView!:PostView;
    classView!:ClassView;
    bsModalRef!: BsModalRef;

    itemsPerSlide = 7;
    singleSlideOffset = true;
    noWrap = true;
    classParamsData$: any;
    schoolName!:string;
    postsEndPageNumber: number = 1;
    reelsPageNumber:number = 1;
    scrollFeedResponseCount:number = 1;
    scrolled:boolean = false;

    userPermissions:any;
    hasPostPermission!:boolean;
    hasUpdateClassPermission!:boolean;
    hasAddClassCertificatesPermission!:boolean;
    hasAddLanguagesPermission!:boolean;
    hasIssueCertificatePermission!:boolean;
    hasManageTeachersPermission!:boolean;
    isOnInitInitialize:boolean = false;
    savedPostSubscription!: Subscription;
    addPostSubscription!: Subscription;
    paymentStatusSubscription!:Subscription;
    public event: EventEmitter<any> = new EventEmitter();

    @ViewChild('closeEditModal') closeEditModal!: ElementRef;
    @ViewChild('closeTeacherModal') closeTeacherModal!: ElementRef;
    @ViewChild('closeLanguageModal') closeLanguageModal!: ElementRef;
    @ViewChild('closeCertificateModal') closeCertificateModal!: ElementRef;
    @ViewChild('imageFile') imageFile!: ElementRef;
    @ViewChild('carousel') carousel!: ElementRef;
    @ViewChild('videoPlayer') videoPlayer!: ElementRef;

    @ViewChild('createPostModal', { static: true }) createPostModal!: CreatePostComponent;

    isDataLoaded:boolean = false;
    constructor(injector: Injector,authService:AuthService,notificationService:NotificationService,public messageService:MessageService,postService:PostService,private bsModalService: BsModalService,classService: ClassService,private route: ActivatedRoute,private domSanitizer: DomSanitizer,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute,private cd: ChangeDetectorRef) { 
      super(injector);
        this._classService = classService;
        this._postService = postService;
        this._notificationService = notificationService;
        this._authService = authService;
        this.classParamsData$ = this.route.params.subscribe((routeParams) => {
          if(this.savedPostSubscription){
            this.savedPostSubscription.unsubscribe;
          }
          this.className = routeParams.className;
          if (!this.loadingIcon && this.isOnInitInitialize)
          {
             this.ngOnInit();
          }
        });
    }

    ngOnDestroy(): void {
      if(this.paymentStatusSubscription){
        this.paymentStatusSubscription.unsubscribe();
      }
      this.destroy$.next();
      this.destroy$.complete();
      if(this.classParamsData$) 
      {
         this.classParamsData$.unsubscribe();
      }
    }

    ngOnChanges(): void {
     
    }
  
    ngOnInit(): void {
      this.isOnInitInitialize = true;
      this.postLoadingIcon = false;
      this._authService.loginState$.next(true);
      this.validToken = localStorage.getItem("jwt")?? '';
      this.loadingIcon = true;
      var selectedLang = localStorage.getItem("selectedLanguage");
      this.translate.use(selectedLang?? '');

      // this.className = this.route.snapshot.paramMap.get('className')??'';

      this._classService.getClassById(this.className.replace(" ","").toLowerCase()).subscribe((response) => {
        this.postsEndPageNumber = 1;
        this.reelsPageNumber = 1;
        this.class = response;
        this.isOwnerOrNot();
        this.loadingIcon = false;
        this.isDataLoaded = true;
        this.cd.detectChanges();
        this.postLoadingIcon = false;
        this.scrolled = false;
        this.addClassView(this.class.classId);
        this.addEventListnerOnCarousel();
       
      });

      this.editClassForm = this.fb.group({
        schoolName: this.fb.control(''),
        className: this.fb.control(''),
        noOfStudents: this.fb.control(''),
        startDate: this.fb.control(''),
        endDate: this.fb.control(''),
        accessibilityId: this.fb.control(''),
        price: this.fb.control(''),
        description: this.fb.control(''),
        languageIds:this.fb.control(''),
        serviceTypeId:this.fb.control('')

      });

       this._classService.getAccessibility().subscribe((response) => {
        this.accessibility = response;
      });
  
      this._classService.getLanguageList().subscribe((response) => {
        this.languages = response;
      });

      this._classService.getAllTeachers().subscribe((response) => {
        this.teachers = response;
      });

      this.languageForm = this.fb.group({
        languages:this.fb.control([],[Validators.required]),
      });

      this.teacherForm = this.fb.group({
        teachers:this.fb.control([],[Validators.required]),
      });

      this.certificateForm = this.fb.group({
        certificates:this.fb.control([],[Validators.required]),
      });

      this.deleteLanguage = {
        classId: '',
        languageId: ''
       };

       this.deleteTeacher = {
        classId: '',
        teacherId: ''
       };
      
      this.classLanguage = {
        classId: '',
        languageIds: []
       };

       this.classTeacher = {
        classId: '',
        teacherIds: []
       };

       this.deleteCertificate = {
        classId:'',
        certificateId:''
       }

       
       this.classCertificate = {
        classId:'',
        certificates:[]
       }

       this.InitializeLikeUnlikePost();

       if(!this.addPostSubscription){
       this.addPostSubscription = addPostResponse.subscribe(response => {
          this.loadingIcon = true;
          this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post created successfully'});
          this._classService.getClassById(this.className.replace(" ","").toLowerCase()).subscribe((response) => {
            this.class = response;
            this.isOwnerOrNot();
            this.loadingIcon = false;
            this.isDataLoaded = true;
            this.postLoadingIcon = false;
            this.scrolled = false;
            this.addClassView(this.class.classId);
          });
        });
      }

      sharePostResponse.subscribe(response => {
        this.messageService.add({severity:'info', summary:'Info',life: 3000, detail:'This class is private/paid, you cant share the post!'});
      });

      // const isCourseConvertIntoClass = JSON.parse(localStorage.getItem("isCourseConvertIntoClass")??'');
      // if(isCourseConvertIntoClass){
      //   this.cd.detectChanges();
      //   this.messageService.add({severity: 'success',summary: 'Success',life: 3000,detail: 'Course converted into class successfully',}); 
      //   localStorage.removeItem("isCourseConvertIntoClass");
      // }

      var isConvertIntoClass = history.state.convertIntoClass;
      if(isConvertIntoClass){
        this.cd.detectChanges();
        this.messageService.add({severity: 'success',summary: 'Success',life: 3000,detail: 'Course converted into class successfully',}); 
      }

      if(!this.savedPostSubscription){
        this.savedPostSubscription = savedPostResponse.subscribe(response => {
          if(response.isPostSaved){
            this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post saved successfully'});
          }
          if(!response.isPostSaved){
            this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post removed successfully'});
          }
        });
      }

        this.paymentStatusSubscription = paymentStatusResponse.subscribe(response => {
          this.messageService.add({severity:'info', summary:'Info',life: 3000, detail:'We will notify when payment will be successful'});
        });
    }

    getClassDetails(classId:string){
      this._classService.getClassEditDetails(classId).subscribe((response) => {
        this.editClass = response;
        this.initializeEditFormControls();
    })
    
  }

  addEventListnerOnCarousel(){
    if(this.carousel!=undefined){
      if($('carousel')[0].querySelectorAll('a.carousel-control-next')[0])
      {
        $('carousel')[0].querySelectorAll('a.carousel-control-next')[0].addEventListener('click', () => {
          this.reelsPageNumber++;
          if(this.reelsPageNumber == 2){
            this.reelsLoadingIcon = true;
          }
          this._classService.getReelsByClassId(this.class.classId, this.reelsPageNumber).subscribe((response) => {
             this.class.reels = [...this.class.reels, ...response];
             this.reelsLoadingIcon = false;
        });

        })
      }  
  }
  }

  InitializeLikeUnlikePost(){
    this.likeUnlikePost = {
      postId: '',
      userId: '',
      isLike:false,
      commentId:''
     };

  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    const windowSize = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;

    if (scrollPosition >= bodyHeight - windowSize) {
      if(!this.scrolled && this.scrollFeedResponseCount != 0){
      this.scrolled = true;
      this.postLoadingIcon = true;
      this.postsEndPageNumber++;
      this.getPostsByClassId();
    }
  }
  }


  getPostsByClassId() {
    if(this.class?.classId == undefined){
      this.postLoadingIcon = true;
      return;
    }
    this._classService.getPostsByClassId(this.class.classId, this.postsEndPageNumber).subscribe((response) => {
        this.class.posts = [...this.class.posts, ...response];
        this.postLoadingIcon = false;
        this.scrollFeedResponseCount = response.length;  
        this.scrolled = false;
      });
  }

  isOwnerOrNot(){
    var validToken = localStorage.getItem("jwt");
      if (validToken != null) {
        let jwtData = validToken.split('.')[1]
        let decodedJwtJsonData = window.atob(jwtData)
        let decodedJwtData = JSON.parse(decodedJwtJsonData);
        this.userId = decodedJwtData.jti;
        if(decodedJwtData.sub == this.class.createdBy){
          this.isOwner = true;
        }
        else{
          this.isOwner = false;
        }
      }

      this.userPermissions  = JSON.parse(localStorage.getItem('userPermissions')??'');
      var userPermissions: any[] = this.userPermissions;
  
      userPermissions.forEach(element => {
          if((element.typeId == this.class.classId || element.typeId == PermissionNameConstant.DefaultClassId) && element.ownerId == this.class.school.createdById && element.permissionType == PermissionTypeEnum.Class && element.permission.name == PermissionNameConstant.Post && (element.schoolId == null || element.schoolId == this.class.school.schoolId)){
          this.hasPostPermission = true;
          }
          if((element.typeId == this.class.classId || element.typeId == PermissionNameConstant.DefaultClassId) && element.ownerId == this.class.school.createdById && element.permissionType == PermissionTypeEnum.Class && element.permission.name == PermissionNameConstant.UpdateClass && (element.schoolId == null || element.schoolId == this.class.school.schoolId)){
          this.hasUpdateClassPermission = true;
          }
          if((element.typeId == this.class.classId || element.typeId == PermissionNameConstant.DefaultClassId)  && element.ownerId == this.class.school.createdById && element.permissionType == PermissionTypeEnum.Class && element.permission.name == PermissionNameConstant.IssueCertificate && (element.schoolId == null || element.schoolId == this.class.school.schoolId)){
          this.hasIssueCertificatePermission = true;
          }
          if((element.typeId == this.class.classId || element.typeId == PermissionNameConstant.DefaultClassId) && element.ownerId == this.class.school.createdById && element.permissionType == PermissionTypeEnum.Class && element.permission.name == PermissionNameConstant.AddClassCertificates && (element.schoolId == null || element.schoolId == this.class.school.schoolId)){
          this.hasAddClassCertificatesPermission = true;
          }
          if((element.typeId == this.class.classId || element.typeId == PermissionNameConstant.DefaultClassId)  && element.ownerId == this.class.school.createdById && element.permissionType == PermissionTypeEnum.Class && element.permission.name == PermissionNameConstant.AddLanguages && (element.schoolId == null || element.schoolId == this.class.school.schoolId)){
          this.hasAddLanguagesPermission = true;
          }
          if((element.typeId == this.class.classId || element.typeId == PermissionNameConstant.DefaultClassId) && element.ownerId == this.class.school.createdById && element.permissionType == PermissionTypeEnum.Class && element.permission.name == PermissionNameConstant.ManageTeachers && (element.schoolId == null || element.schoolId == this.class.school.schoolId)){
            this.hasManageTeachersPermission = true;
          }
      });
      
  }
  

    initializeEditFormControls(){
      this.uploadImage = '';
      this.imageFile.nativeElement.value = "";
      this.fileToUpload.set('avatarImage','');

      var startDate = this.editClass.startDate;
      startDate = startDate.substring(0, startDate.indexOf('T'));

      var endDate = this.editClass.endDate;
      endDate = endDate.substring(0, endDate.indexOf('T'));

      var selectedLanguages:string[] = [];

      this.editClass.languages.forEach((item: { id: string; }) => {
        selectedLanguages.push(item.id)
      });

      this.currentDate = this.getCurrentDate();


      this.editClassForm = this.fb.group({
        schoolName: this.fb.control(this.editClass.school.schoolName),
        className: this.fb.control(this.editClass.className,[Validators.required]),
        noOfStudents: this.fb.control(this.editClass.noOfStudents,[Validators.required]),
        startDate: this.fb.control(startDate,[Validators.required]),
        endDate: this.fb.control(endDate,[Validators.required]),
        accessibilityId: this.fb.control(this.editClass.accessibilityId,[Validators.required]),
        price: this.fb.control(this.editClass.price),
        description: this.fb.control(this.editClass.description),
        languageIds:this.fb.control(selectedLanguages,[Validators.required]),
        serviceTypeId:this.fb.control(this.editClass.serviceTypeId,[Validators.required])

      }, {validator: this.dateLessThan('startDate', 'endDate',this.currentDate)});

      if(this.editClass.serviceTypeId == '0d846894-caa4-42f3-8e8a-9dba6467672b'){
        this.getPaidClass();

      }
      this.editClassForm.updateValueAndValidity();
    }

    dateLessThan(from: string, to: string, currentDate:string) {
      return (group: FormGroup): {[key: string]: any} => {
       let f = group.controls[from];
       let t = group.controls[to];
       if (f.value > t.value || f.value < currentDate) {
         return {
           dates: `Please enter valid date`
         };
       }
       return {};
      }
    }

    getCurrentDate(){
      var today = new Date();
        var dd = String(today. getDate()). padStart(2, '0');
        var mm = String(today. getMonth() + 1). padStart(2, '0');
        var yyyy = today. getFullYear();
      ​  var currentDate = yyyy + '-' + mm + '-' + dd;
        return currentDate;
      }

    getDeletedLanguage(deletedLanguage:string){
      this.deleteLanguage.languageId = deletedLanguage;
    }

    getDeletedTeacher(deletedTeacher:string){
      this.deleteTeacher.teacherId = deletedTeacher;
    }

    captureLanguageId(event: any) {
      var languageId = event.id;
      this.classLanguage.languageIds.push(languageId);
    }

    filterLanguages(event:any) {
  
      var schoolLanguages: any[] = this.class.languages;
      var languages: any[] = this.languages;
  
      this.languages = languages.filter(x => !schoolLanguages.find(y => y.id == x.id));
      
      let filtered: any[] = [];
      let query = event.query;
      for (let i = 0; i < this.languages.length; i++) {
        let language = this.languages[i];
        if (language.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
          filtered.push(language);
        }
      }

  
      this.filteredLanguages = filtered;
    }

    saveClassLanguages(){
      this.isSubmitted = true;
      if (!this.languageForm.valid) {
        return;
      }
      this.loadingIcon = true;
      this.classLanguage.classId = this.class.classId;
      this._classService.saveClassLanguages(this.classLanguage).subscribe((response:any) => {
        this.closeLanguagesModal();
        this.isSubmitted = false;
        this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Language added successfully'});
        this.ngOnInit();
  
      });
    }

    deleteClassLanguage(){
      this.loadingIcon = true;
      this.deleteLanguage.classId = this.class.classId;
      this._classService.deleteClassLanguage(this.deleteLanguage).subscribe((response:any) => {
        this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Language deleted successfully'});
        this.ngOnInit();
      });
  
    }

    captureTeacherId(event: any) {
      var teacherId = event.teacherId;
      this.classTeacher.teacherIds.push(teacherId);
    }

    filterTeachers(event:any) {
          var classTeachers: any[] = this.class.teachers;
          var teachers: any[] = this.teachers;
      
          this.teachers = teachers.filter(x => !classTeachers.find(y => y.teacherId == x.teacherId));
      
          let filteredTeachers: any[] = [];
          let query = event.query;
          for (let i = 0; i < this.teachers.length; i++) {
            let teacher = this.teachers[i];
            if (teacher.firstName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
              filteredTeachers.push(teacher);
            }
          }
          this.filteredTeachers = filteredTeachers;
        }

        saveClassTeachers(){
          this.isSubmitted = true;
          if (!this.teacherForm.valid) {
            return;
          }
          this.loadingIcon = true;
          this.classTeacher.classId = this.class.classId;
          this._classService.saveClassTeachers(this.classTeacher).subscribe((response:any) => {
            this.closeTeachersModal();
            this.isSubmitted = false;
            this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Teacher added successfully'});
            this.ngOnInit();
      
          });
        }

        deleteClassTeacher(){
          this.loadingIcon = true;
          this.deleteTeacher.classId = this.class.classId;
          this._classService.deleteClassTeacher(this.deleteTeacher).subscribe((response:any) => {
            this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Teacher deleted successfully'});
            this.ngOnInit();
      
          });
      
        }

        getDeletedCertificate(deletedCertificate:string){
          this.deleteCertificate.certificateId = deletedCertificate;
        }

        deleteClassCertificate(){
          this.loadingIcon = true;
          this.deleteCertificate.classId = this.class.classId;
          this._classService.deleteClassCertificate(this.deleteCertificate).subscribe((response:any) => {
            this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Certificate added successfully'});
            this.ngOnInit();
          });
      
        }

        handleImageInput(event: any) {
          this.fileToUpload.append("avatarImage", event.target.files[0], event.target.files[0].name);
          const reader = new FileReader();
          reader.onload = (_event) => { 
              this.uploadImage = _event.target?.result; 
              this.uploadImage = this.domSanitizer.bypassSecurityTrustUrl(this.uploadImage);
          }
          reader.readAsDataURL(event.target.files[0]); 
      
        }

        handleCertificates(event: any) {
            this.classCertificate.certificates.push(event.target.files[0]);
        }

        saveClassCertificates(){
          this.isSubmitted = true;
          if (!this.certificateForm.valid) {
            return;
          }
          this.loadingIcon = true;
          for(var i=0; i<this.classCertificate.certificates.length; i++){
            this.certificateToUpload.append('certificates', this.classCertificate.certificates[i]);
         }
          this.certificateToUpload.append('classId', this.class.classId);
          this._classService.saveClassCertificates(this.certificateToUpload).subscribe((response:any) => {
            this.closeCertificatesModal();
            this.isSubmitted = false;
            this.classCertificate.certificates = [];
            this.certificateToUpload.set('certificates','');
            this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Certificate deleted successfully'});
            this.ngOnInit();
          });
        }

        updateClass(){
          debugger
           this.isSubmitted=true;
           if (!this.editClassForm.valid) {
           return;
          }

          this.loadingIcon = true;
      
          if(!this.uploadImage){
            this.fileToUpload.append('avatar', this.editClass.avatar);
          }
      
          this.updateClassDetails=this.editClassForm.value;
          this.schoolName = this.editClassForm.get('schoolName')?.value;
          this.fileToUpload.append('classId', this.class.classId);
          this.fileToUpload.append('className', this.updateClassDetails.className);
          this.fileToUpload.append('noOfStudents', this.updateClassDetails.noOfStudents.toString());
          this.fileToUpload.append('startDate', this.updateClassDetails.startDate);
          this.fileToUpload.append('endDate', this.updateClassDetails.endDate);
          this.fileToUpload.append('price', this.updateClassDetails.price?.toString());
          this.fileToUpload.append('accessibilityId',this.updateClassDetails.accessibilityId);
          this.fileToUpload.append('languageIds',JSON.stringify(this.updateClassDetails.languageIds));
          this.fileToUpload.append('description',this.updateClassDetails.description);
          this.fileToUpload.append('serviceTypeId',this.updateClassDetails.serviceTypeId);
        
          this._classService.editClass(this.fileToUpload).subscribe((response:any) => {
            this.closeModal();
            this.isSubmitted=true;
            ownedClassResponse.next({classId:response.classId, classAvatar:response.avatar, className:response.className,schoolName: this.schoolName, action:"update"});

            this.fileToUpload = new FormData();
            this.cd.detectChanges();
            this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Class updated successfully'});
            // this.ngOnInit();
          });
      
          
        }

        getFreeClass(){
          this.isClassPaid = false;
          this.editClassForm.get('price')?.removeValidators(Validators.required);
          this.editClassForm.patchValue({
            price: null,
          });
        }
      
        getPaidClass(){
          this.isClassPaid = true;
          this.editClassForm.get('price')?.addValidators(Validators.required);
        }

        private closeModal(): void {
          this.closeEditModal.nativeElement.click();
      }

      private closeTeachersModal(): void {
        this.closeTeacherModal.nativeElement.click();
      }

      private closeLanguagesModal(): void {
        this.closeLanguageModal.nativeElement.click();
      }

      private closeCertificatesModal(): void {
        this.closeCertificateModal.nativeElement.click();
      }

      resetCertificateModal(){
        this.isSubmitted = false;
        this.classCertificate.certificates = [];
      }

      removeTeacher(event: any){
        const teacherIndex = this.classTeacher.teacherIds.findIndex((item) => item === event.teacherId);
        if (teacherIndex > -1) {
          this.classTeacher.teacherIds.splice(teacherIndex, 1);
        }
      }
    
      removeLanguage(event: any){
        const languageIndex = this.classLanguage.languageIds.findIndex((item) => item === event.id);
        if (languageIndex > -1) {
          this.classLanguage.languageIds.splice(languageIndex, 1);
        }
      }

      resetLanguageModal(){
        this.isSubmitted=false;
        this.languageForm.setValue({
          languages: [],
        });

      }
    
      resetTeacherModal(){
        this.isSubmitted=false;
        var re = this.teacherForm.get('teachers')?.value;
        this.teacherForm.setValue({
          teachers: [],
        });
    
      }

      createPost(){
        this.isOpenModal = true;
    
      }

      profileGrid(){
        this.isProfileGrid = true;
  
      }
  
      profileList(){
        this.isProfileGrid = false;
        this.isGridItemInfo = true;
        this.cd.detectChanges();
        if(this.videoPlayer != undefined){
          videojs(this.videoPlayer.nativeElement, {autoplay: false});
        }
      }

      openPostModal(): void {
        const initialState = {
          classId: this.class.classId,
          from: "class"
        };
        this.bsModalService.show(CreatePostComponent,{initialState});
    }

    pinUnpinPost(attachmentId:string,isPinned:boolean){
      this._postService.pinUnpinPost(attachmentId,isPinned).subscribe((response) => {
        this.ngOnInit();
        console.log(response);
      });
    
    }

    convertToCourse(className:string,schoolName:string){
      this._classService.convertToCourse(className.replace(" ","").toLowerCase()).subscribe((response) => {
        // localStorage.setItem("isClassConvertIntoCourse", JSON.stringify(true));

        convertIntoCourseResponse.next({courseId:response.classId, courseName:response.className, avatar:response.avatar,school:response.school});
        this.router.navigate([`profile/course/${schoolName.replace(" ","").toLowerCase()}/${className.replace(" ","").toLowerCase()}`],
          { state: { convertIntoCourse: true } });
        //window.location.href = `profile/course/${schoolName.replace(" ","").toLowerCase()}/${className.replace(" ","").toLowerCase()}`;
      });
    }

    openPostsViewModal(posts:string): void {
      const initialState = {
        posts: posts,
        serviceType: this.class.serviceType.type,
        accessibility: this.class.accessibility.name
      };
     this.bsModalRef= this.bsModalService.show(PostViewComponent,{initialState});

     this.bsModalRef.content.event.subscribe((res: { data: any; }) => {
      
      var a = res.data;
      //this.itemList.push(res.data);
    });
    }


    

    requestMessage(userId:string,type:string,chatTypeId:string){
      if(this.validToken == ''){
        window.open('user/auth/login', '_blank');
      }
      else{
        //window.location.href=`user/chat`;
        this.router.navigate(
          [`user/chats`],
          { state: { chatHead: {receiverId: userId, type : type,chatTypeId:chatTypeId} } });
      }   
    }

    likeUnlikePosts(postId:string, isLike:boolean,postType:number,post:any){
      this.currentLikedPostId = postId;
      this.class.posts.filter((p : any) => p.id == postId).forEach( (item : any) => {
        var likes: any[] = item.likes;
        var isLiked = likes.filter(x => x.userId == this.userId && x.postId == postId);
        if(isLiked.length != 0){
          this.isLiked = false;
          this.likesLength = item.likes.length - 1;
          item.isPostLikedByCurrentUser = false;
        }
        else{
          this.isLiked = true;
          this.likesLength = item.likes.length + 1;
          item.isPostLikedByCurrentUser = true;
          if(post.title != null){
            var notificationContent = `liked your post(${post.title})`;
          }
          else{
            var notificationContent = "liked your post";
          }
          this._notificationService.initializeNotificationViewModel(post.createdBy,NotificationType.Likes,notificationContent,this.userId,postId,postType,post,null).subscribe((response) => {
          });
      
        }
      }); 
      
     
      this.likeUnlikePost.postId = postId;
      this.likeUnlikePost.isLike = isLike;
      this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
      this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
    
    
         this.class.posts.filter((p : any) => p.id == postId).forEach( (item : any) => {
          var itemss = item.likes;
          item.likes = response;
        }); 
  
         this.InitializeLikeUnlikePost();
         console.log("succes");
      });


    
    
    }

    showPostDiv(postId:string){
      var posts: any[] = this.class.posts;
      this.gridItemInfo = posts.find(x => x.id == postId);
      this.isGridItemInfo = true;
      this.cd.detectChanges();
      const player = videojs(this.videoPlayer.nativeElement, { autoplay: false });
      this.addPostView(this.gridItemInfo.id);
    }

    addPostView(postId:string){
      
      if(this.userId != undefined){
       this.initializePostView();
      this.postView.postId = postId;
      this._postService.postView(this.postView).subscribe((response) => {
        
        this.gridItemInfo.views.length = response;
       }); 
      }
    
     
    
    }

    initializePostView(){
      this.postView ={
        postId:'',
        userId:''
       }
    }
    
    hideGridItemInfo(){
      this.isGridItemInfo = this.isGridItemInfo ? false : true;
    
    }

    addClassView(classId:string){
      
      if(this.userId != undefined){
        this.initializeClassView();
      this.classView.classId = classId;
      this._classService.classView(this.classView).subscribe((response) => {
        
        console.log('success');
        //this.posts.posts.views.length = response;
       }); 
      }
    
    }
    initializeClassView(){
      this.classView = {
        classId:'',
        userId:''
      }
    }

    openReelsViewModal(postAttachmentId:string): void {
      
      const initialState = {
        postAttachmentId: postAttachmentId
      };
      this.bsModalService.show(ReelsViewComponent,{initialState});
    }

    openPaymentModal(){
      var classDetails = {"id":this.class.classId,"name":this.class.className,"avatar":this.class.avatar,"type":1,"amount":this.class.price}
      const initialState = {
        paymentDetails: classDetails
      };
      this.bsModalService.show(PaymentComponent,{initialState});
    }

    openCertificateViewModal(certificateUrl:string,certificateName:string){
      const initialState = {
        certificateUrl: certificateUrl,
        certificateName:certificateName,
        from:PostAuthorTypeEnum.Class
      };
      this.bsModalService.show(CertificateViewComponent, { initialState });
    }

    openSharePostModal(postId:string): void {
      if(this.class.accessibility.name == Constant.Private || this.class.serviceType.type == Constant.Paid){
        this.messageService.add({severity:'info', summary:'Info',life: 3000, detail:'This class is private/paid, you cant share the post!'});
      }
      else{
      const initialState = {
        postId: postId
      };
      this.bsModalService.show(SharePostComponent,{initialState});
    }
    }

    savePost(postId:string){
      var posts: any[] = this.class.posts;
      var isSavedPost = posts.find(x => x.id == postId);
    
      if(isSavedPost.isPostSavedByCurrentUser){
        isSavedPost.savedPostsCount -= 1;
        isSavedPost.isPostSavedByCurrentUser = false;
        this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post removed successfully'});
       }
       else{
        isSavedPost.savedPostsCount += 1;
        isSavedPost.isPostSavedByCurrentUser = true;
        this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post saved successfully'});
       }
    
      this._postService.savePost(postId,this.userId).subscribe((result) => {
      });
    }

    createCertificate(classId:string,type:string){
      this._classService.getClassInfoForCertificate(classId).subscribe((response) => {
        if(response.students.length == 0){
          this.messageService.add({severity:'info', summary:'Info',life: 3000, detail:'Your class does not have any students yet'});
          return;
        }
        else{
          this.router.navigate([`user/createCertificate`],{ state: { certificateInfo: {id: classId, type : type,} } });
        }
      });
    }
  
}
