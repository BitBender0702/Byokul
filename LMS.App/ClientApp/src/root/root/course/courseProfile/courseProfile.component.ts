import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MessageService } from 'primeng/api';
import { PermissionTypeEnum } from 'src/root/Enums/permissionTypeEnum';
import { PostAuthorTypeEnum } from 'src/root/Enums/postAuthorTypeEnum';
import { Constant } from 'src/root/interfaces/constant';
import { AddCourseCertificate } from 'src/root/interfaces/course/addCourseCertificate';
import { AddCourseLanguage } from 'src/root/interfaces/course/addCourseLanguage';
import { AddCourseTeacher } from 'src/root/interfaces/course/addCourseTeacher';
import { CourseView } from 'src/root/interfaces/course/courseView';
import { DeleteCourseCertificate } from 'src/root/interfaces/course/deleteCourseCertificate';
import { DeleteCourseLanguage } from 'src/root/interfaces/course/deleteCourseLanguage';
import { DeleteCourseTeacher } from 'src/root/interfaces/course/deleteCourseTeacher';
import { NotificationType } from 'src/root/interfaces/notification/notificationViewModel';
import { PermissionNameConstant } from 'src/root/interfaces/permissionNameConstant';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { CourseService } from 'src/root/service/course.service';
import { NotificationService } from 'src/root/service/notification.service';
import { PostService } from 'src/root/service/post.service';
import { CertificateViewComponent } from '../../certificateView/certificateView.component';
import { addPostResponse, CreatePostComponent } from '../../createPost/createPost.component';
import { PostViewComponent, deletePostResponse, savedPostResponse } from '../../postView/postView.component';
import { ReelsViewComponent, deleteReelResponse, savedReelResponse } from '../../reels/reelsView.component';
import { MultilingualComponent, changeLanguage } from '../../sharedModule/Multilingual/multilingual.component';
import { SharePostComponent, sharedPostResponse } from '../../sharePost/sharePost.component';
import { ownedCourseResponse } from '../createCourse/createCourse.component';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { PaymentComponent, paymentStatusResponse } from '../../payment/payment.component';
import { AuthService } from 'src/root/service/auth.service';
import { SignalrService, commentLikeResponse } from 'src/root/service/signalr.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { RolesEnum } from 'src/root/RolesEnum/rolesEnum';
import { generateCertificateResponse } from '../../generateCertificate/generateCertificate.component';
import { OpenSideBar, enableDisableScc, notifyMessageAndNotificationCount, totalMessageAndNotificationCount } from 'src/root/user-template/side-bar/side-bar.component';
export const convertIntoClassResponse = new Subject<{ classId: string, className: string, school: any, avatar: string }>();
export const deleteCourseResponse = new BehaviorSubject<string>('');
import { Dimensions, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { TranslateService } from '@ngx-translate/core';


import { DatePipe } from '@angular/common';
import flatpickr from 'flatpickr';
import { Arabic } from 'flatpickr/dist/l10n/ar';
import { Spanish } from 'flatpickr/dist/l10n/es';
import { Turkish } from 'flatpickr/dist/l10n/tr';
import { CurrencyEnum } from 'src/root/Enums/CurrencyEnum';
import { enumToObjects } from 'src/root/Enums/getEnum';
import { ClassCourseRating } from 'src/root/interfaces/course/addCourseRating';
import { userPermission } from '../../root.component';
import { deleteModalPostResponse } from '../../delete-confirmation/delete-confirmation.component';
import { disableEnableResponse } from 'src/root/admin/registeredCourses/registeredCourses.component';
import { UserService } from 'src/root/service/user.service';


@Component({
  selector: 'courseProfile-root',
  templateUrl: './courseProfile.component.html',
  styleUrls: ['./courseProfile.component.css'],
  providers: [MessageService]
})

export class CourseProfileComponent extends MultilingualComponent implements OnInit, OnDestroy {

  private _courseService;
  private _postService;
  private _notificationService;
  private _signalrService;
  private _authService;

  userPermissionSubscription!:Subscription;
  
  course: any;
  isProfileGrid: boolean = true;
  // isOpenSidebar:boolean = false;
  // isOpenModal:boolean = false;
  loadingIcon: boolean = false;
  courseId!: string;
  isOwner!: boolean;
  isOpenSidebar: boolean = false;
  isOpenModal: boolean = false;
  isSubmitted: boolean = false;
  courseLanguage!: AddCourseLanguage;
  courseTeacher!: AddCourseTeacher;
  deleteLanguage!: DeleteCourseLanguage;
  deleteTeacher!: DeleteCourseTeacher;
  editCourseForm!: FormGroup;
  languageForm!: FormGroup;
  teacherForm!: FormGroup;
  certificateForm!: FormGroup;
  uploadImage!: any;
  updateCourseDetails!: any;
  accessibility: any;
  filteredLanguages!: any[];
  languages: any;
  filteredTeachers!: any[];
  teachers: any;
  deleteCertificate!: DeleteCourseCertificate;
  courseCertificate!: AddCourseCertificate;
  certificateToUpload = new FormData();
  fileToUpload = new FormData();
  isCoursePaid!: boolean;
  disabled: boolean = true;
  validToken!: string;
  currentLikedPostId!: string;
  userId!: string;
  likesLength!: number;
  isLiked!: boolean;
  likeUnlikePost!: LikeUnlikePost;
  courseName!: string;
  gridItemInfo: any;
  isGridItemInfo: boolean = false;
  postView!: PostView;
  courseView!: CourseView;
  itemsPerSlide = 5;
  singleSlideOffset = true;
  noWrap = true;
  courseParamsData$: any;
  schoolName!: string;
  postsPageNumber: number = 1;
  reelsPageNumber: number = 1;
  postLoadingIcon: boolean = false;
  reelsLoadingIcon: boolean = false;
  scrolled: boolean = false;
  scrollFeedResponseCount: number = 1;

  userPermissions: any;
  hasPostPermission!: boolean;
  hasUpdateCoursePermission!: boolean;
  hasAddCourseCertificatesPermission!: boolean;
  hasAddLanguagesPermission!: boolean;
  hasIssueCertificatePermission!: boolean;
  hasManageTeachersPermission!: boolean;
  isOnInitInitialize: boolean = false;


  cropTemplate:any;


  isConvertIntoCourse!: boolean;
  savedPostSubscription!: Subscription;
  savedReelSubscription!: Subscription;
  addPostSubscription!: Subscription;
  changeLanguageSubscription!: Subscription;
  paymentStatusSubscription!: Subscription;
  sharedPostSubscription!: Subscription;
  deletePostSubscription!: Subscription;
  deleteReelSubscription!: Subscription;
  generateCertificateSubscription!: Subscription;
  filteredAttachments: any[] = [];
  courseAvatar: string = '';

   

  imageChangedEvent: any = '';
  croppedImage: any = '';
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {};
  selectedImage: any = '';
  isSelected: boolean = false;
  cropModalRef!: BsModalRef;
  currencies:any;
  @ViewChild('hiddenButton') hiddenButtonRef!: ElementRef;


  @ViewChild('closeEditModal') closeEditModal!: ElementRef;
  @ViewChild('closeTeacherModal') closeTeacherModal!: ElementRef;
  @ViewChild('closeLanguageModal') closeLanguageModal!: ElementRef;
  @ViewChild('closeCertificateModal') closeCertificateModal!: ElementRef;
  @ViewChild('imageFile') imageFile!: ElementRef;
  @ViewChild('carousel') carousel!: ElementRef;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;

  @ViewChild('createPostModal', { static: true }) createPostModal!: CreatePostComponent;
  courseCertificateForm!: FormGroup;
  courseCertificateInfo: any;
  @ViewChild('openCourseOwnCertificate') openCourseOwnCertificate!: ElementRef;
  courseRatingView!:ClassCourseRating;
  isAllowedForFileStorage:boolean = false;
  deleteModalPostSubscription!: Subscription;
  disableEnableResponseSubsciption!: Subscription;

  private _userService;

  isDataLoaded: boolean = false;
  hamburgerCountSubscription!: Subscription;
  hamburgerCount:number = 0;
  
  constructor(injector: Injector,userService: UserService, private translateService: TranslateService,private signalrService:SignalrService,private datePipe: DatePipe, private titleService: Title, private meta: Meta, authService: AuthService, notificationService: NotificationService, public messageService: MessageService, postService: PostService, private bsModalService: BsModalService, courseService: CourseService, private route: ActivatedRoute, private domSanitizer: DomSanitizer, private fb: FormBuilder, private router: Router, private http: HttpClient, private activatedRoute: ActivatedRoute, private cd: ChangeDetectorRef) {
    super(injector);
    this._courseService = courseService;
    this._postService = postService;
    this._notificationService = notificationService;
    this._authService = authService;
    this.currencies = enumToObjects(CurrencyEnum);
    this._signalrService = signalrService;
    this._userService = userService;
    this.courseParamsData$ = this.route.params.subscribe((routeParams) => {
      this.courseName = routeParams.courseName;
      if (!this.loadingIcon && this.isOnInitInitialize) {
        this.ngOnInit();
      }
    });
  }


  isBanned:any;
  isStorageUnAvailable:boolean=false;
  ngOnInit(): void {
    this.checkScreenSize();
    if (this.isScreenMobile) {
      this.itemsPerSlide = 2;
      this.profileGrid();
    }
    // this.meta.addTag({ rel: 'canonical', href: 'https://www.byokul.com/course' });
    if (this._authService.roleUser(RolesEnum.SchoolAdmin)) {
      this._authService.loginState$.next(false);
      this._authService.loginAdminState$.next(true);
    }
    else {
      this._authService.loginState$.next(true);
    }
    this.isOnInitInitialize = true;
    this.postLoadingIcon = false;
    this.validToken = localStorage.getItem("jwt") ?? '';
    this.loadingIcon = true;
    var selectedLang = localStorage.getItem("selectedLanguage");
    this.translate.use(selectedLang ?? '');

    let newCourseName = this.courseName.split('.').join("").split(" ").join("").toLowerCase();
    this._courseService.getCourseById(newCourseName).subscribe((response) => {
      debugger
      this.postsPageNumber = 1;
      this.reelsPageNumber = 1;
      this.course = response;
      this.titleService.setTitle(this.course.courseName);
      this.addDescriptionMetaTag(this.course.description);
      this.courseAvatar = this.course.avatar;
      this.isOwnerOrNot();
      this.loadingIcon = false;
      this.isDataLoaded = true;
      this.cd.detectChanges();
      this.scrolled = false;
      this.postLoadingIcon = false;
      this.addCourseView(this.course.courseId);
      this.addEventListnerOnCarousel();
      this.course.posts = this.getFilteredAttachments(this.course.posts);
      this.isRatedByUser = response.isRatedByUser;
      this.isBanned = response.isBannedFromClassCourse;

      this.isUserBannedId = response.courseId

      this.checkIfUserIsBanned();


      this.isAllowedForFileStorage = response.isFileStorageAccessible;
      this.permissionForFileStorage(response.teachers);


      if(response.school.availableStorageSpace <= 0){
        this.isStorageUnAvailable = true;
      }

      if(response.isEnable){
        this.router.navigate([`/profile/courses/${this.course.courseName}/null/null`]);
        return;
       }

      if(response.isDisableByOwner && !response.isDeleted && !this.isOwner){
        this.router.navigate([`/profile/courses/${this.course.courseName}/false/true`]);
        return;
       }

       if(!response.isDisableByOwner && response.isDeleted){
        this.router.navigate([`/profile/courses/${this.course.courseName}/true/false`]);
        return;
       }

       if(response.isDisableByOwner && response.isDeleted){
        this.router.navigate([`/profile/courses/${this.course.courseName}/true/true`]);
        return;
       }

    });

    this.editCourseForm = this.fb.group({
      schoolName: this.fb.control(''),
      courseName: this.fb.control(''),
      serviceTypeId: this.fb.control(''),
      accessibilityId: this.fb.control(''),
      description: this.fb.control(''),
      price: this.fb.control(''),
      currency: this.fb.control(''),
      languageIds: this.fb.control(''),

    });

    this._courseService.getAccessibility().subscribe((response) => {
      this.accessibility = response;
    });

    this._courseService.getLanguageList().subscribe((response) => {
      this.languages = response;
    });

    this._courseService.getAllTeachers().subscribe((response) => {
      this.teachers = response;
    });

    this.languageForm = this.fb.group({
      languages: this.fb.control([], [Validators.required]),
    });

    this.teacherForm = this.fb.group({
      teachers: this.fb.control([], [Validators.required]),
    });

    this.certificateForm = this.fb.group({
      certificates: this.fb.control([], [Validators.required]),
    });

    this.initializeCourseCertificateForm();


    this.deleteLanguage = {
      courseId: '',
      languageId: ''
    };

    this.deleteTeacher = {
      courseId: '',
      teacherId: ''
    };

    this.courseLanguage = {
      courseId: '',
      languageIds: []
    };

    this.courseTeacher = {
      courseId: '',
      teacherIds: []
    };

    this.deleteCertificate = {
      courseId: '',
      certificateId: ''
    }


    this.courseCertificate = {
      courseId: '',
      certificates: []
    }
    this.InitializeLikeUnlikePost();

    //  addPostResponse.subscribe(response => {
    //   this.ngOnInit();
    // });
    if (!this.addPostSubscription) {
      this.addPostSubscription = addPostResponse.subscribe((postResponse: any) => {
        debugger
        // this.loadingIcon = true;
        //   if(postResponse.response.postType == 1){
        //     var translatedMessage = this.translateService.instant('PostCreatedSuccessfully');
        //   }
        //   else if(postResponse.response.postType == 3){
        //     var translatedMessage = this.translateService.instant('ReelCreatedSuccessfully');
        //   }
        //   else{
        //     var translatedMessage = this.translateService.instant('PostUpdatedSuccessfully');
        //   }
        // const translatedSummary = this.translateService.instant('Success');
        // this.messageService.add({severity: 'success',summary: translatedSummary,life: 3000,detail: translatedMessage,});      
        let newCourseName = this.courseName.split('.').join("").split(" ").join("").toLowerCase()   
        this._courseService.getCourseById(newCourseName).subscribe((response) => {
          this.course = response;
          this.titleService.setTitle(this.course.courseName);
          this.addDescriptionMetaTag(this.course.description);
          this.courseAvatar = this.course.avatar;
          this.isOwnerOrNot();
          this.loadingIcon = false;
          this.isDataLoaded = true;
          this.scrolled = false;
          this.postLoadingIcon = false;
          this.addCourseView(this.course.courseId);
          this.course.posts = this.getFilteredAttachments(this.course.posts);

          if(response.school.availableStorageSpace <= 0){
            this.isStorageUnAvailable = true;
          }

          if(response.isDisableByOwner && !this.isOwner){
            this.router.navigate([`/profile/courses/${this.course.courseName}/disabled`]);
          }
    
          if(response.isDeletedByOwner && !this.isOwner){
            this.router.navigate([`/profile/courses/${this.course.courseName}/deleted`]);
          }   
    
          // this.showPostDiv(postResponse.response.id);    
        });
      });
    }

    var isConvertIntoCourse = history.state.convertIntoCourse;
    if (isConvertIntoCourse) {
      this.cd.detectChanges();
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Class converted into course successfully', });
    }

    if (!this.savedPostSubscription) {
      this.savedPostSubscription = savedPostResponse.subscribe(response => {
        if (response.isPostSaved) {
          this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Post saved successfully' });
        }
        if (!response.isPostSaved) {
          this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Post removed successfully' });
        }
      });
    }

    if (!this.savedReelSubscription) {
      this.savedReelSubscription = savedReelResponse.subscribe(response => {
        if (response.isReelSaved) {
          this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Reel saved successfully' });
        }
        if (!response.isReelSaved) {
          this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Reel removed successfully' });
        }
      });
    }

    this.sharedPostSubscription = sharedPostResponse.subscribe(response => {
      const translatedSummary = this.translateService.instant('Success');
      if (response.postType == 1) {
        const translatedMessage = this.translateService.instant('PostSharedSuccessfully');
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        var post = this.course.posts.find((x: { id: string; }) => x.id == response.postId);
        post.postSharedCount++;
      }
      else{
        const translatedMessage = this.translateService.instant('ReelSharedSuccessfully');
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
      }
    });

    if (!this.changeLanguageSubscription) {
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.translate.use(response.language);
      })
    }

    this.paymentStatusSubscription = paymentStatusResponse.subscribe(response => {
      this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: 'We will notify when payment will be successful' });
    });

    if (!this.deletePostSubscription) {
      this.deletePostSubscription = deletePostResponse.subscribe(response => {
        this.isGridItemInfo = false;
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Post deleted successfully' });
        var deletedPost = this.course.posts.find((x: { id: string; }) => x.id == response.postId);
        const index = this.course.posts.indexOf(deletedPost);
        if (index > -1) {
          this.course.posts.splice(index, 1);
        }
      });
    }

    if (!this.deleteReelSubscription) {
      this.deleteReelSubscription = deleteReelResponse.subscribe(response => {
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Reel deleted successfully' });
        var deletedPost = this.course.reels.find((x: { id: string; }) => x.id == response.postId);
        const index = this.course.reels.indexOf(deletedPost);
        if (index > -1) {
          this.course.reels.splice(index, 1);
        }
      });
    }

    if (!this.generateCertificateSubscription) {
      this.generateCertificateSubscription = generateCertificateResponse.subscribe(response => {
        if (response.isCertificateSendToAll) {
          this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: 'We will notify you, when certificate will be sent to all the students' });
        }
        else {
          this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: `Certificate successfully sent to the ${response.studentName}` });
        }
      });
    }

    this.courseRatingView = {
      courseId: '',
      classId: null,
      userId:'',
      rating:0
    }


    if(!this.userPermissionSubscription){
      this.userPermissionSubscription = userPermission.subscribe(data=>{
        debugger;
        window.location.reload();
      })
    }

       
    if(!this.deleteModalPostSubscription){
      this.deleteModalPostSubscription = deleteModalPostResponse.subscribe(response => {
        this.ngOnInit();
      })
    }

    if(!this.disableEnableResponseSubsciption){
      this.disableEnableResponseSubsciption = disableEnableResponse.subscribe(response => {
        debugger;
        this.ngOnInit();
      })
    }

    if (!this.hamburgerCountSubscription) {
      this.hamburgerCountSubscription = totalMessageAndNotificationCount.subscribe(response => {
        debugger
        this.hamburgerCount = response.hamburgerCount;
      });
    }
    notifyMessageAndNotificationCount.next({});


  }

  addEventListnerOnCarousel() {
    if (this.carousel != undefined) {
      if ($('carousel')[0].querySelectorAll('a.carousel-control-next')[0]) {
        $('carousel')[0].querySelectorAll('a.carousel-control-next')[0].addEventListener('click', () => {
          this.reelsPageNumber++;
          if (this.reelsPageNumber == 2) {
            this.reelsLoadingIcon = true;
          }
          this._courseService.getReelsByCourseId(this.course.classId, this.reelsPageNumber).subscribe((response) => {
            this.course.reels = [...this.course.reels, ...response];
            this.reelsLoadingIcon = false;

          });

        })
      }
    }
  }

  initializeCourseCertificateForm(){
    this.courseCertificateForm = this.fb.group({
      courseId: this.fb.control(''),
      certificateName: this.fb.control('', [Validators.required]),
      provider: this.fb.control('', [Validators.required]),
      issuedDate: this.fb.control(new Date().toISOString().substring(0, 10), [Validators.required]),
      description: this.fb.control(''),
      certificateId: this.fb.control(''),
    });
  }

  InitializeLikeUnlikePost() {
    this.likeUnlikePost = {
      postId: '',
      userId: '',
      isLike: false,
      commentId: ''
    };

  }

  ngOnDestroy(): void {
    if (this.paymentStatusSubscription) {
      this.paymentStatusSubscription.unsubscribe();
    }

    if (this.userPermissionSubscription) {
      this.userPermissionSubscription.unsubscribe();
    }

    if (this.savedPostSubscription) {
      this.savedPostSubscription.unsubscribe();
    }
    if (this.changeLanguageSubscription) {
      this.changeLanguageSubscription.unsubscribe();
    }
    if (this.savedReelSubscription) {
      this.savedReelSubscription.unsubscribe();
    }
    if (this.sharedPostSubscription) {
      this.sharedPostSubscription.unsubscribe();
    }
    if (this.courseParamsData$) {
      this.courseParamsData$.unsubscribe();
    }
    if (this.deletePostSubscription) {
      this.deletePostSubscription.unsubscribe();
    }
    if (this.deleteReelSubscription) {
      this.deleteReelSubscription.unsubscribe();
    }
    if (this.generateCertificateSubscription) {
      this.generateCertificateSubscription.unsubscribe();
    }
    if (this.deleteModalPostSubscription) {
      this.deleteModalPostSubscription.unsubscribe();
    }
    if (this.disableEnableResponseSubsciption) {
      this.disableEnableResponseSubsciption.unsubscribe();
    }
    if (this.hamburgerCountSubscription) {
      this.hamburgerCountSubscription.unsubscribe();
    }
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    const windowSize = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;

    if (scrollPosition >= bodyHeight - windowSize) {
      if (!this.scrolled && this.scrollFeedResponseCount != 0) {
        this.scrolled = true;
        this.postLoadingIcon = true;
        this.postsPageNumber++;
        this.getPostsByCourseId();
      }
    }
  }

  openSidebar() {
    OpenSideBar.next({ isOpenSideBar: true })
  }

  addDescriptionMetaTag(description: string) {
    const existingTag = this.meta.getTag('name="description"');
    if (existingTag) {
      this.meta.updateTag({ name: 'description', content: description });
    }
    else {
      this.meta.addTag({ name: 'description', content: description });
    }
  }

  getPostsByCourseId() {
    if (this.course?.courseId == undefined) {
      this.postLoadingIcon = true;
      return;
    }
    this._courseService.getPostsByCourseId(this.course.courseId, this.postsPageNumber).subscribe((response) => {
      var result = this.getFilteredAttachments(response);
      this.course.posts = [...this.course.posts, ...result];
      this.postLoadingIcon = false;
      this.scrolled = false;
      this.scrollFeedResponseCount = response.length;

    });
  }

  isOwnerOrNot() {
    var validToken = localStorage.getItem("jwt");
    if (validToken != null) {
      let jwtData = validToken.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.userId = decodedJwtData.jti;
      if (decodedJwtData.sub == this.course.createdBy) {
        this.isOwner = true;
      }
      else {
        this.isOwner = false;
      }

    }

    this.userPermissions = JSON.parse(localStorage.getItem('userPermissions') ?? '');
    var userPermissions: any[] = this.userPermissions;
    debugger;
    userPermissions.forEach(element => {
      if ((element.typeId == this.course.courseId || element.typeId == PermissionNameConstant.DefaultCourseId) && element.ownerId == this.course.school.createdById && element.permissionType == PermissionTypeEnum.Course && element.permission.name == PermissionNameConstant.Post && (element.schoolId == null || element.schoolId == this.course.school.schoolId)) {
        this.hasPostPermission = true;
      }
      if ((element.typeId == this.course.courseId || element.typeId == PermissionNameConstant.DefaultCourseId) && element.ownerId == this.course.school.createdById && element.permissionType == PermissionTypeEnum.Course && element.permission.name == PermissionNameConstant.UpdateCourse && (element.schoolId == null || element.schoolId == this.course.school.schoolId)) {
        this.hasUpdateCoursePermission = true;
      }
      if ((element.typeId == this.course.courseId || element.typeId == PermissionNameConstant.DefaultCourseId) && element.ownerId == this.course.school.createdById && element.permissionType == PermissionTypeEnum.Course && element.permission.name == PermissionNameConstant.IssueCertificate && (element.schoolId == null || element.schoolId == this.course.school.schoolId)) {
        this.hasIssueCertificatePermission = true;
      }
      if ((element.typeId == this.course.courseId || element.typeId == PermissionNameConstant.DefaultCourseId) && element.ownerId == this.course.school.createdById && element.permissionType == PermissionTypeEnum.Course && element.permission.name == PermissionNameConstant.AddCourseCertificates && (element.schoolId == null || element.schoolId == this.course.school.schoolId)) {
        this.hasAddCourseCertificatesPermission = true;
      }
      if ((element.typeId == this.course.courseId || element.typeId == PermissionNameConstant.DefaultCourseId) && element.ownerId == this.course.school.createdById && element.permissionType == PermissionTypeEnum.Course && element.permission.name == PermissionNameConstant.AddLanguages && (element.schoolId == null || element.schoolId == this.course.school.schoolId)) {
        this.hasAddLanguagesPermission = true;
      }
      if ((element.typeId == this.course.courseId || element.typeId == PermissionNameConstant.DefaultCourseId) && element.ownerId == this.course.school.createdById && element.permissionType == PermissionTypeEnum.Course && element.permission.name == PermissionNameConstant.ManageTeachers && (element.schoolId == null || element.schoolId == this.course.school.schoolId)) {
        this.hasManageTeachersPermission = true;
      }
    });

  }


  initializeEditFormControls() {
    this.courseAvatar = this.course.avatar;
    this.uploadImage = '';
    this.imageFile.nativeElement.value = "";
    this.fileToUpload.set('avatarImage', '');

    var selectedLanguages: string[] = [];

    this.course.languages.forEach((item: { id: string; }) => {
      selectedLanguages.push(item.id)
    });

    this.editCourseForm = this.fb.group({
      schoolName: this.fb.control(this.course.school.schoolName),
      courseName: this.fb.control(this.course.courseName, [Validators.required]),
      accessibilityId: this.fb.control(this.course.accessibilityId, [Validators.required]),
      price: this.fb.control(this.course.price),
      description: this.fb.control(this.course.description),
      languageIds: this.fb.control(selectedLanguages, [Validators.required]),
      serviceTypeId: this.fb.control(this.course.serviceTypeId, [Validators.required]),
      currency:this.fb.control(this.course.currency),
    });

    if (this.course.serviceTypeId == '0d846894-caa4-42f3-8e8a-9dba6467672b') {
      this.getPaidCourse();

    }
    this.editCourseForm.updateValueAndValidity();
  }

  // dateLessThan(from: string, to: string, currentDate:string) {
  //   return (group: FormGroup): {[key: string]: any} => {
  //    let f = group.controls[from];
  //    let t = group.controls[to];
  //    if (f.value > t.value || f.value < currentDate) {
  //      return {
  //        dates: `Please enter valid date`
  //      };
  //    }
  //    return {};
  //   }
  // }

  // getCurrentDate(){
  //   var today = new Date();
  //     var dd = String(today. getDate()). padStart(2, '0');
  //     var mm = String(today. getMonth() + 1). padStart(2, '0');
  //     var yyyy = today. getFullYear();
  //   ​  var currentDate = yyyy + '-' + mm + '-' + dd;
  //     return currentDate;
  //   }

  getDeletedLanguage(deletedLanguage: string) {
    this.deleteLanguage.languageId = deletedLanguage;
  }

  getDeletedTeacher(deletedTeacher: string) {
    this.deleteTeacher.teacherId = deletedTeacher;
  }

  captureLanguageId(event: any) {
    var languageId = event.id;
    this.courseLanguage.languageIds.push(languageId);
    // this.languageIds.push(languageId);
  }

  filterLanguages(event: any) {

    var courseLanguages: any[] = this.course.languages;
    var languages: any[] = this.languages;

    this.languages = languages.filter(x => !courseLanguages.find(y => y.id == x.id));

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

  saveCourseLanguages() {
    this.isSubmitted = true;
    if (!this.languageForm.valid) {
      return;
    }
    this.loadingIcon = true;
    this.courseLanguage.courseId = this.course.courseId;
    this._courseService.saveCourseLanguages(this.courseLanguage).subscribe((response: any) => {
      this.closeLanguagesModal();
      this.isSubmitted = false;
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Language added successfully' });
      this.ngOnInit();

    });
  }

  deleteCourseLanguage() {
    this.loadingIcon = true;
    this.deleteLanguage.courseId = this.course.courseId;
    this._courseService.deleteCourseLanguage(this.deleteLanguage).subscribe((respteachersonse: any) => {
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Language deleted successfully' });
      this.ngOnInit();

    });
  }

  captureTeacherId(event: any) {
    var teacherId = event.teacherId;
    this.courseTeacher.teacherIds.push(teacherId);
  }

  filterTeachers(event: any) {
    var courseTeachers: any[] = this.course.teachers;
    var teachers: any[] = this.teachers;

    this.teachers = teachers.filter(x => !courseTeachers.find(y => y.teacherId == x.teacherId));

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

  saveCourseTeachers() {
    this.isSubmitted = true;
    if (!this.teacherForm.valid) {
      return;
    }
    this.loadingIcon = true;
    this.courseTeacher.courseId = this.course.courseId;
    this._courseService.saveCourseTeachers(this.courseTeacher).subscribe((response: any) => {
      this.closeTeachersModal();
      this.isSubmitted = false;
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Official added successfully' });
      this.ngOnInit();

    });
  }

  deleteCourseTeacher() {
    this.loadingIcon = true;
    this.deleteTeacher.courseId = this.course.courseId;
    this._courseService.deleteCourseTeacher(this.deleteTeacher).subscribe((response: any) => {
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Official deleted successfully' });
      this._signalrService.addTeacher(this.deleteTeacher.teacherId);
      this.ngOnInit();
    });

  }

  getDeletedCertificate(deletedCertificate: string) { 
    debugger
    this.deleteCertificate.certificateId = deletedCertificate;
  }

  deleteCourseCertificate() {
    this.loadingIcon = true;
    this.deleteCertificate.courseId = this.course.courseId;
    this._courseService.deleteCourseCertificate(this.deleteCertificate).subscribe((response: any) => {
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Certificate deleted successfully' });
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
    this.courseCertificate.certificates.push(event.target.files[0]);
  }

  saveCourseCertificates() {
    this.isSubmitted = true;
    if (!this.certificateForm.valid) {
      return;
    }
    this.loadingIcon = true;
    for (var i = 0; i < this.courseCertificate.certificates.length; i++) {
      this.certificateToUpload.append('certificates', this.courseCertificate.certificates[i]);
    }
    this.certificateToUpload.append('courseId', this.course.courseId);
    this._courseService.saveCourseCertificates(this.certificateToUpload).subscribe((response: any) => {
      this.closeCertificatesModal();
      this.isSubmitted = false;
      this.courseCertificate.certificates = [];
      this.certificateToUpload.set('certificates', '');
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Certificate added successfully' });
      this.ngOnInit();

    });
  }

  updateCourse() {
    this.isSubmitted = true;
    if (!this.editCourseForm.valid) {
      return;
    }
    this.loadingIcon = true;

    if (!this.uploadImage) {
      this.fileToUpload.append('avatar', this.courseAvatar);
    }

    this.fileToUpload.append("avatarImage", this.selectedImage);

    this.updateCourseDetails = this.editCourseForm.value;
    this.schoolName = this.editCourseForm.get('schoolName')?.value;
    this.fileToUpload.append('courseId', this.course.courseId);
    this.fileToUpload.append('courseName', this.updateCourseDetails.courseName);
    this.fileToUpload.append('price', this.updateCourseDetails.price?.toString());
    this.fileToUpload.append('currency', this.updateCourseDetails.currency);
    this.fileToUpload.append('accessibilityId', this.updateCourseDetails.accessibilityId);
    this.fileToUpload.append('languageIds', JSON.stringify(this.updateCourseDetails.languageIds));
    this.fileToUpload.append('description', this.updateCourseDetails.description);
    this.fileToUpload.append('serviceTypeId', this.updateCourseDetails.serviceTypeId);

    this._courseService.editCourse(this.fileToUpload).subscribe((response: any) => {
      this.closeModal();
      this.isSubmitted = true;
      ownedCourseResponse.next({ courseId: response.courseId, courseAvatar: response.avatar, courseName: response.courseName, schoolName: this.schoolName, action: "update" });
      this.fileToUpload = new FormData();
      this.cd.detectChanges();
      const translatedSummary = this.translateService.instant('Success');
      const translatedMessage = this.translateService.instant('CourseUpdatedsuccessfully');
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
      // this.ngOnInit();
    });
  }



  getFreeCourse() {
    this.isCoursePaid = false;
    this.editCourseForm.get('price')?.removeValidators(Validators.required);
    this.editCourseForm.patchValue({
      price: null,
    });
  }

  getPaidCourse() {
    this.isCoursePaid = true;
    this.editCourseForm.get('price')?.addValidators(Validators.required);
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

  resetCertificateModal() {
    this.isSubmitted = false;
    // this.courseCertificate.certificates = [];
    this.uploadImage = null;
    this.initializeCourseCertificateForm();
    this.certificateToUpload.set('certificateImage', '');
    flatpickr('#issuedDate', {
      minDate: "1903-12-31",
      maxDate: new Date(),
      dateFormat: "m/d/Y",
      defaultDate: new Date()
    });
  }

  removeTeacher(event: any) {
    const teacherIndex = this.courseTeacher.teacherIds.findIndex((item) => item === event.teacherId);
    if (teacherIndex > -1) {
      this.courseTeacher.teacherIds.splice(teacherIndex, 1);
    }
  }

  removeLanguage(event: any) {
    const languageIndex = this.courseLanguage.languageIds.findIndex((item) => item === event.id);
    if (languageIndex > -1) {
      this.courseLanguage.languageIds.splice(languageIndex, 1);
    }
  }

  resetLanguageModal() {
    this.isSubmitted = false;
    this.courseLanguage.languageIds = [];
    this.languageForm.setValue({
      languages: [],
    });

  }

  resetTeacherModal() {
    this.isSubmitted = false;
    var re = this.teacherForm.get('teachers')?.value;
    this.teacherForm.setValue({
      teachers: [],
    });

  }

  //   createPost(){
  //     this.isOpenModal = true;

  //   }

  profileGrid() {
    this.isProfileGrid = true;

  }

  profileList() {
    this.isProfileGrid = false;
    this.isGridItemInfo = true;
    this.cd.detectChanges();
    if (this.videoPlayer != undefined) {
      videojs(this.videoPlayer.nativeElement, { autoplay: false });
    }
  }

  // openPostModal(): void {
  //   const initialState = {
  //     courseId: this.course.courseId,
  //     from: "course"
  //   };
  //   this.bsModalService.show(CreatePostComponent, { initialState });
  // }

  openPostModal(isLiveTabOpen?: boolean, isShareProfile?:boolean): void {
    if(isShareProfile === true){
      const initialState = {
        courseId: this.course.courseId,
        from: "course",
        isLiveTabOpen: isLiveTabOpen,
        isShareProfile: isShareProfile
      };
      debugger
      this.bsModalService.show(CreatePostComponent, { initialState });
      return
    }

    if(!this.isStorageUnAvailable){
      const initialState = {
        courseId: this.course.courseId,
        from: "course",
        isLiveTabOpen: isLiveTabOpen,
        isShareProfile: isShareProfile
      };
      debugger
      this.bsModalService.show(CreatePostComponent, { initialState });
    } else{
      const translatedSummary = this.translateService.instant('Info');
      const translatedMessage = this.translateService.instant('SchoolHasNoStorageSpace');
      this.messageService.add({
        severity: 'info',
        summary: translatedSummary,
        life: 3000,
        detail: translatedMessage,
      });
    }
  }

  pinUnpinPost(attachmentId: string, isPinned: boolean) {
    this._postService.pinUnpinPost(attachmentId, isPinned).subscribe((response) => {
      this.ngOnInit();
      console.log(response);
    });

  }

  convertToClass(courseName: string, schoolName: string) {
    courseName = courseName.split(" ").join("").toLowerCase();
    schoolName = schoolName.split(" ").join("").toLowerCase()
    this._courseService.convertToClass(courseName).subscribe((response) => {
      // localStorage.setItem("isCourseConvertIntoClass", JSON.stringify(true));
      convertIntoClassResponse.next({ classId: response.classId, className: response.className, avatar: response.avatar, school: response.school });
      // convertIntoCourseResponse.next({courseId:response.courseId, courseName:response.courseName, avatar:response.avatar,school:response.school});
      this.router.navigate([`profile/class/${schoolName}/${courseName}`],
        { state: { convertIntoClass: true } });
      //window.location.href = `profile/class/${schoolName.replace(" ","").toLowerCase()}/${courseName.replace(" ","").toLowerCase()}`;
    });
  }


  openPostsViewModal(posts: any, isBanned?:any): void {
    var postAttachments = this.filteredAttachments.filter(x => x.postId == posts.id);
    const initialState = {
      posts: posts,
      postAttachments: postAttachments,
      isBanned: this.isBanned
    };
    let videoElement: HTMLVideoElement | null = document.getElementById('displayVideo') as HTMLVideoElement
    if(videoElement){
       var vdo: HTMLVideoElement | null = videoElement.children[0]  as HTMLVideoElement
       if(vdo){
        vdo.pause();
       }
    }
    this.bsModalService.show(PostViewComponent, { initialState });
  }

  requestMessage(userId: string, type: string, chatTypeId: string) {
    if (this.validToken == '') {
      window.open('user/auth/login', '_blank');
    }
    else {
      //window.location.href=`user/chat`;
      this.router.navigate(
        [`user/chats`],
        { state: { chatHead: { receiverId: userId, type: type, chatTypeId: chatTypeId } } });
    }
  }

  likeUnlikePosts(postId: string, isLike: boolean, postType: number, post: any) {
    this.currentLikedPostId = postId;
    this.course.posts.filter((p: any) => p.id == postId).forEach((item: any) => {
      var likes: any[] = item.likes;
      var isLiked = likes.filter(x => x.userId == this.userId && x.postId == postId);
      if (isLiked.length != 0) {
        this.isLiked = false;
        this.likesLength = item.likes.length - 1;
        item.isPostLikedByCurrentUser = false;
      }
      else {
        this.isLiked = true;
        this.likesLength = item.likes.length + 1;
        item.isPostLikedByCurrentUser = true;
        if (post.title != null) {
          var notificationContent = `liked your post(${post.title})`;
        }
        else {
          var notificationContent = "liked your post";
        }
        if(post.createdBy != this.userId){
          this._notificationService.initializeNotificationViewModel(post.createdBy, NotificationType.Likes, notificationContent, this.userId, postId, postType, post, null).subscribe((response) => {
          });
        }
      }
    });


    this.likeUnlikePost.postId = postId;
    this.likeUnlikePost.isLike = isLike;
    this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
    this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {


      this.course.posts.filter((p: any) => p.id == postId).forEach((item: any) => {
        var itemss = item.likes;
        item.likes = response;
      });




      this.InitializeLikeUnlikePost();
    });


  }

  showPostDiv(post: any) {
    $('.imgDisplay').attr("style", "display:none;")
    $('.' + post.id).prevAll('.imgDisplay').first().attr("style", "display:block;");

    var posts: any[] = this.course.posts;
    this.gridItemInfo = post;
    // this.gridItemInfo.postAttachments = this.gridItemInfo.postAttachments.filter((x: { fileType: number; }) => x.fileType !=3);
    this.isGridItemInfo = true;
    this.cd.detectChanges();
    // const player = videojs(this.videoPlayer.nativeElement, { autoplay: false });
    this.addPostView(this.gridItemInfo.id);

    var postValueTag = this.gridItemInfo.postTags[0].postTagValue;
    this.postsTagValues = JSON.parse(postValueTag);
  }
  postsTagValues: any;
  addPostView(postId: string) {

    if (this.userId != undefined) {
      this.initializePostView();
      this.postView.postId = postId;
      this._postService.postView(this.postView).subscribe((response) => {

        this.gridItemInfo.views.length = response;
      });
    }
  }

  initializePostView() {
    this.postView = {
      postId: '',
      userId: ''
    }
  }

  hideGridItemInfo() {
    let videoElement: HTMLVideoElement | null = document.getElementById('displayVideo') as HTMLVideoElement
    if(videoElement){
       var vdo: HTMLVideoElement | null = videoElement.children[0]  as HTMLVideoElement
       if(vdo){
        vdo.pause();
       }
    }
    this.isGridItemInfo = this.isGridItemInfo ? false : true;

  }

  addCourseView(courseId: string) {
    if (this.userId != undefined) {
      this.initializeCourseView();
      this.courseView.courseId = courseId;
      this._courseService.courseView(this.courseView).subscribe((response) => {
        //this.posts.posts.views.length = response;
      });
    }

  }
  initializeCourseView() {
    this.courseView = {
      courseId: '',
      userId: ''
    }
  }

  back(): void {
    window.history.back();
  }

  openReelsViewModal(postAttachmentId: string, postId: string): void {
    this.router.navigate(
      [`user/reelsView/${this.course.courseId}/course/${postAttachmentId}/${postId}`],
      // { state: { post: { postId: postId } } });
      { state: { post: { postId: postId, banned:this.isBanned } } });
    // const initialState = {
    //   postAttachmentId: postAttachmentId
    // };
    // this.bsModalService.show(ReelsViewComponent,{initialState});
  }

  openCertificateViewModal(certificateUrl: string, certificateName: string, from?: number, event?: Event) {
    var fromValue = PostAuthorTypeEnum.Course;
    if (from != undefined) {
      fromValue = from;
      event?.stopPropagation();
    }
    const initialState = {
      certificateUrl: certificateUrl,
      certificateName: certificateName,
      from: fromValue
    };
    this.bsModalService.show(CertificateViewComponent, { initialState });
  }

  openSharePostModal(postId: string, postType: number, title: string, description: string): void {
    if (this.course.accessibility.name == Constant.Private || this.course.serviceType.type == Constant.Paid) {
      this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: 'This course is private/paid, you cant share the post!' });
    }
    else {
      var image: string = '';
      if (postType == 1) {
        var post = this.course.posts.find((x: { id: string; }) => x.id == postId);
        var postAttachments = post.postAttachments.find((x: { fileType: number; }) => x.fileType == 1);
        if (postAttachments != undefined) {
          image = postAttachments.fileUrl;
        }
      }
      const initialState = {
        postId: postId,
        postType: postType,
        title: title,
        description: description,
        image: image
      };
      this.bsModalService.show(SharePostComponent, { initialState });
    }
  }

  openProfileShareModal(): void {
    debugger
    const initialState = {
      courseId: this.course.courseId,
      schoolName: this.course.school.schoolName,
      courseName: this.course.courseName,
      from: "course",
      isShareProfile: true
    };
    this.bsModalService.show(SharePostComponent, { initialState });
  }

  savePost(postId: string) {
    var posts: any[] = this.course.posts;
    var isSavedPost = posts.find(x => x.id == postId);

    if (isSavedPost.isPostSavedByCurrentUser) {
      isSavedPost.savedPostsCount -= 1;
      isSavedPost.isPostSavedByCurrentUser = false;
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Post removed successfully' });
    }
    else {
      isSavedPost.savedPostsCount += 1;
      isSavedPost.isPostSavedByCurrentUser = true;
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Post saved successfully' });
    }

    this._postService.savePost(postId, this.userId).subscribe((result) => {
    });
  }

  openPaymentModal() {
    var courseDetails = { "id": this.course.courseId, "name": this.course.courseName, "avatar": this.course.avatar, "type": 2, "amount": this.course.price, "currency": this.course.currency }
    const initialState = {
      paymentDetails: courseDetails
    };
    this.bsModalService.show(PaymentComponent, { initialState });
  }

  createCertificate(courseId: string, type: string) {
    this._courseService.getCourseInfoForCertificate(courseId).subscribe((response) => {
      if (response.students.length == 0) {
        this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: 'Your course does not have any students yet' });
        return;
      }
      else {
        this.router.navigate([`user/createCertificate`], { state: { certificateInfo: { id: courseId, type: type, } } });
      }
    });
  }

  // getFilteredAttachments(feeds: any): any {
  //   const allAttachments = feeds.flatMap((post: { postAttachments: any; }) => post.postAttachments);
  //   var result = allAttachments.filter((attachment: { fileType: number; }) => attachment.fileType === 3);
  //   this.filteredAttachments = [...this.filteredAttachments, ...result];
  //   feeds = feeds.map((post: { postAttachments: any[]; }) => {
  //     const filteredPostAttachments = post.postAttachments.filter(postAttachment => postAttachment.fileType !== 3);
  //     return { ...post, postAttachments: filteredPostAttachments };
  //   });
  //   return feeds;
  // }

  getFilteredAttachments(feeds: any): any {
    const allAttachments = feeds.flatMap((post: { postAttachments: any[]; }) => post.postAttachments);
    this.filteredAttachments = allAttachments.filter((attachment: { fileType: number; }) => attachment.fileType === 3);
      const result = allAttachments.filter((attachment: { fileType: number; fileName: string; }) => {
      return attachment.fileType === 3 && 
             !this.filteredAttachments.some(existingAttachment =>
               existingAttachment.fileType === 3 &&
               existingAttachment.fileName === attachment.fileName
             );
    });
  
    this.filteredAttachments = [...this.filteredAttachments, ...result];
      feeds = feeds.map((post: { postAttachments: any[]; }) => {
      const filteredPostAttachments = post.postAttachments.filter(
        postAttachment => postAttachment.fileType !== 3
      );
      return { ...post, postAttachments: filteredPostAttachments };
    });
  
    return feeds;
  }

  removeLogo() {
    if (this.course.avatar != null) {
      this.courseAvatar = '';
    }
    this.uploadImage = '';
    this.fileToUpload.set('avatarImage', '');
  }

  deleteCourse() {
    if (this.course.students > 0) {
      this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: 'Course with registered users can not be automatically deleted. Please contact site administration for deletion request.' });
    }
    else {
      this._courseService.deleteCourse(this.course.courseId).subscribe((response) => {
        ownedCourseResponse.next({ courseId: this.course.courseId, courseAvatar: "", courseName: "", schoolName: "", action: "delete" });
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Course deleted successfully' });
        setTimeout(() => {
          this.router.navigateByUrl(`user/userProfile/${this.userId}`);
        }, 3000);
        // this.router.navigateByUrl(`user/userProfile/${this.userId}`)
        // deleteCourseResponse.next('delete');
      });
    }
  }

  unableDisableCourse() {
    this.loadingIcon = true;
    this._courseService.enableDisableCourse(this.course.courseId).subscribe((response) => {
      debugger
      if (this.course.isDisableByOwner) {
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Course enabled successfully' });
        enableDisableScc.next({isDisable:false,courseId:this.course.courseId});
      }
      else {
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Course disabled successfully' });
        enableDisableScc.next({isDisable:true,courseId:this.course.courseId});
      }
      this.ngOnInit();
    });
  }

  imageCropped(event: ImageCroppedEvent) {
    debugger
    this.selectedImage = event.blob;
    this.croppedImage = this.domSanitizer.bypassSecurityTrustResourceUrl(
      event.objectUrl!
    );
  }

  imageLoaded() {
    this.showCropper = true;
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    console.log('Cropper ready', sourceImageDimensions);
  }

  loadImageFailed() {
    console.log('Load failed');
  }

  onFileChange(event: any): void {
    debugger
    this.isSelected = true;
    this.imageChangedEvent = event;
    this.hiddenButtonRef.nativeElement.click();
  }



  cropModalOpen(template: TemplateRef<any>) {
    this.cropModalRef = this.bsModalService.show(template);
  }

  closeCropModal() {
    this.cropModalRef.hide();
  }

  applyCropimage() {
    this.uploadImage = this.croppedImage.changingThisBreaksApplicationSecurity;
    this.cropModalRef.hide();
  }

  previousGuid: string = '';

  generateGuid(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

  }


  getRandomClass(index: number, iscontainer: boolean) {
    var number = this.isScreenPc ? 3 : this.isScreenTablet ? 2 : this.isScreenMobile ? 1 : 0;
    if (index % number == 0 && iscontainer) {
      this.previousGuid = this.generateGuid();
    }
    return this.previousGuid;
  }

  postDivId: string = "";
  openDialouge(event: any, post: any) {
    debugger;
    const parts = event.currentTarget.className.split(' ');
    this.postDivId = parts[3];
    if (post.postAttachments != undefined) {
      var postAttach = post.postAttachments[0];
      debugger
      if (postAttach != undefined) {
        if (postAttach.fileType != 1) {
          if (this.postDivId != "") {
            try {
              videojs(this.postDivId);
            } catch {
              var displayDivs = document.getElementsByClassName("imgDisplay");
            }
          }
        }
      }
    }
    var displayDivs = document.getElementsByClassName("imgDisplay");
    for (var i = 0; i < displayDivs.length; i++) {

      if (displayDivs[i].className.includes(this.postDivId)) {
        displayDivs[i].setAttribute("style", "display:block;");
      } else {
        displayDivs[i].setAttribute("style", "display:none;");
      }
      //elements[i].style.display = displayState;
    }

    //  var playerId = "video01" + this.counter;
    //  const vjsPlayer = videojs(playerId, { autoplay: false });
    //  this.cd.detectChanges();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.checkScreenSize();
  }

  isScreenPc!: boolean;
  isScreenTablet!: boolean;
  isScreenMobile!: boolean;
  private checkScreenSize() {
    const screenWidth = window.innerWidth;
    this.isScreenPc = screenWidth >= 992;
    this.isScreenTablet = screenWidth >= 768 && screenWidth < 992;
    this.isScreenMobile = screenWidth < 768;
  }

  getDeletedPostId(id: string) {
    debugger
    this.loadingIcon = true;
    this._postService.deletePost(id).subscribe((_response) => {
      this.loadingIcon = false;
      deletePostResponse.next({ postId: id });
    });
  }

  openEditPostModal(post: any) {
    debugger
    const initialState = {
      editPostId: post.id,
      from: post.postAuthorType == 1 ? "school" : post.postAuthorType == 2 ? "class" : post.postAuthorType == 3 ? "course" : post.postAuthorType == 4 ? "user" : undefined
    };
    this.bsModalService.show(CreatePostComponent, { initialState });
  }


  parseTheTags(tags: any) {
    for (let index = 0; index < tags.length; index++) {
      const element = tags[index].postTagValue;
      try {
        var reelsTags = JSON.parse(element);
      }
      catch { }
      return reelsTags
    }

  }


  editCourseCertificate(courseCertificateInfo: any) {
    debugger
    // dob = dob.substring(0, dob.indexOf('T'));     

    var issuedDate = courseCertificateInfo.issuedDate.substring(0, courseCertificateInfo.issuedDate.indexOf('T'));
    issuedDate = this.datePipe.transform(issuedDate, 'MM/dd/yyyy');

    flatpickr('#issuedDate', {
      minDate: "1903-12-31",
      maxDate: new Date(),
      dateFormat: "m/d/Y",
      defaultDate: issuedDate
    });

    this.courseCertificateForm = this.fb.group({
      courseId: this.fb.control(this.course.courseId),
      certificateName: this.fb.control(courseCertificateInfo.certificateName, [Validators.required]),
      provider: this.fb.control(courseCertificateInfo.provider, [Validators.required]),
      issuedDate: this.fb.control(issuedDate, [Validators.required]),
      description: this.fb.control(courseCertificateInfo.description),
      certificateId: this.fb.control(courseCertificateInfo.id)
    });

    this.uploadImage = courseCertificateInfo.certificateUrl;
  }


  saveCourseCertificate() {
    debugger
    this.isSubmitted = true;
    if (!this.courseCertificateForm.valid) {
      return;
    }

    if (this.uploadImage == null) {
      return;
    }

    this.loadingIcon = true;
    var formValue = this.courseCertificateForm.value;

    //here we will add if id has
    if (formValue.certificateId != "") {
      this.certificateToUpload.append('certificateId', formValue.certificateId);
    }

    if (typeof this.uploadImage == "string") {
      this.certificateToUpload.append('certificateUrl', this.uploadImage);
    }
    this.certificateToUpload.append('courseId', this.course.courseId);
    this.certificateToUpload.append('certificateName', formValue.certificateName);
    this.certificateToUpload.append('provider', formValue.provider);
    this.certificateToUpload.append('issuedDate', formValue.issuedDate);
    this.certificateToUpload.append('description', formValue.description);

    // this.userCertificateForm.updateValueAndValidity();

    this._courseService.saveCourseCertificates(this.certificateToUpload).subscribe((response: any) => {
      debugger
      this.closeCertificatesModal();
      this.isSubmitted = false;
      this.certificateToUpload = new FormData();
      this.courseCertificate.certificates = [];
      // this.certificateToUpload.set('certificateImage', '');
      if (formValue.certificateId != "") {
        var translatedSummary = this.translateService.instant('Success');
        var translatedMessage = this.translateService.instant('CertificateUpdatedSuccessfully');
      }
      else {
        var translatedSummary = this.translateService.instant('Success');
        var translatedMessage = this.translateService.instant('CertificateAddedSuccessfully');
      }
      this.messageService.add({
        severity: 'success',
        summary: translatedSummary,
        life: 3000,
        detail: translatedMessage,
      });
      this.ngOnInit();
    });
  }


  openCourseCertificate(certificateInfo: any) {
    debugger
    this.certificateToUpload.set('certificateImage', '');
    this.courseCertificateInfo = certificateInfo;
    this.openCourseOwnCertificate.nativeElement.click();
    this.cd.detectChanges();
  }


  removeUploadCertificateImage() {
    this.uploadImage = null;
    this.certificateToUpload.set('certificateImage', '');
    this.avatarImage = undefined;
    this.uploadImageName = "";

  }
  
  uploadImageName: string = "";
  avatarImage!: any;
  handleCourseCertificate(event: any) {
    debugger
    this.certificateToUpload.append("certificateImage", event.target.files[0], event.target.files[0].name);
    this.uploadImageName = event.target.files[0].name;
    const reader = new FileReader();
    reader.onload = (_event) => {
      this.uploadImage = _event.target?.result;
      this.uploadImage = this.domSanitizer.bypassSecurityTrustUrl(this.uploadImage);
    }
    reader.readAsDataURL(event.target.files[0]);
    this.avatarImage = this.fileToUpload.get('avatarImage');
  }


  getSelectedLanguage() {
    var selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(selectedLanguage ?? '');
    var locale = selectedLanguage == "ar" ? Arabic : selectedLanguage == "sp" ? Spanish : selectedLanguage == "tr" ? Turkish : null
    // const dateOfBirthElement = this.founded.nativeElement;
    // dateOfBirthElement._flatpickr.set("locale", locale);
  }


  rateTheCourse(courseName:any, schoolName:any){
    this.courseRatingView = {
      userId: this.userId,
      classId:null,
      courseId: this.course.courseId,
      rating:this.rateNumber
    }
    debugger
    this._courseService.courseRating(this.courseRatingView).subscribe((response) => {
      debugger;
      this.isRatedByUser = true;
      this.course.rating = response.courseRating;
      this.cd.detectChanges();
      const translatedInfoSummary = this.translateService.instant('Success');
      const translatedMessage = this.translateService.instant('ThankYouForYourRating');
      this.messageService.add({severity:'success', summary:translatedInfoSummary,life: 3000, detail:translatedMessage});
      // this.isDataLoaded = true;
      // this.classCourseDetails.classCourseItem.comments = response;
      });;
  }


  isRatedByUser:boolean=false;
  rateNumber: number = 0;
  isRated: boolean = false;
  fakeArray = new Array(5);
  ratedArray: number[] = [];

  ratingNumber(rateNumber: number) {
    this.rateNumber = rateNumber + 1;
    this.isRated = true;
    this.ratedArray[0] = this.rateNumber;


  }


  touchStartX:number=0
  touchStart(event: any) {
    this.touchStartX = event.touches[0].clientX;
  }

  touchEnd(event: any) {
    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchEndX - this.touchStartX;

    if (deltaX > 0) {
      if (this.carousel != undefined) {
        const nextButton = $('carousel')[0].querySelectorAll('a.carousel-control-prev')[0] as HTMLButtonElement
        if (nextButton) {
          nextButton.click();
        }
      }
    } else if (deltaX < 0) {
      const nextButton = $('carousel')[0].querySelectorAll('a.carousel-control-next')[0] as HTMLButtonElement
      if (nextButton) {
        nextButton.click();
      }
    }
  }



  permissionForFileStorage(teacherForFileStorage:any){
    let isAllowedForFileStorage = teacherForFileStorage?.find((x:any) => x?.userId == this.userId);
    if(isAllowedForFileStorage != undefined || isAllowedForFileStorage != null){
      this.isAllowedForFileStorage = true;
    }
  }


  userIsBanned:boolean=false;
  isUserBannedId:string='';
  checkIfUserIsBanned(){
    debugger;
    this.loadingIcon = true;
    this._userService.isUserBanned(this.userId, this.isUserBannedId, PostAuthorTypeEnum.Course).subscribe((response)=>{
      debugger;
      this.loadingIcon = false;
      if(response.data == true){
        this.userIsBanned = true
      }
    })
  }


  
}
