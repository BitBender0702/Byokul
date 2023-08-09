import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Injector, OnChanges, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
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
import { MultilingualComponent, changeLanguage } from '../../sharedModule/Multilingual/multilingual.component';
import { PostViewComponent, deletePostResponse, savedPostResponse, sharePostResponse } from '../../postView/postView.component';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { ClassView } from 'src/root/interfaces/class/classView';
import { MessageService } from 'primeng/api';
import { ReelsViewComponent, deleteReelResponse, savedReelResponse } from '../../reels/reelsView.component';
import { ownedClassResponse } from '../createClass/createClass.component';
import { PaymentComponent, paymentStatusResponse } from '../../payment/payment.component';
import { NotificationService } from 'src/root/service/notification.service';
import { NotificationType } from 'src/root/interfaces/notification/notificationViewModel';
import { CertificateViewComponent } from '../../certificateView/certificateView.component';
import { PostAuthorTypeEnum } from 'src/root/Enums/postAuthorTypeEnum';
import { PermissionNameConstant } from 'src/root/interfaces/permissionNameConstant';
import { PermissionTypeEnum } from 'src/root/Enums/permissionTypeEnum';
import { SharePostComponent, sharedPostResponse } from '../../sharePost/sharePost.component';
import { Constant } from 'src/root/interfaces/constant';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { AuthService } from 'src/root/service/auth.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RolesEnum } from 'src/root/RolesEnum/rolesEnum';
import { DatePipe, formatDate } from '@angular/common';
import { generateCertificateResponse } from '../../generateCertificate/generateCertificate.component';
import { Arabic } from 'flatpickr/dist/l10n/ar';
import { Spanish } from 'flatpickr/dist/l10n/es';
import { Turkish } from 'flatpickr/dist/l10n/tr';
import flatpickr from 'flatpickr';
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';
import { TranslateService } from '@ngx-translate/core';
import { Dimensions, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';


export const deleteClassResponse = new BehaviorSubject<string>('');
export const convertIntoCourseResponse = new Subject<{ courseId: string, courseName: string, school: any, avatar: string }>();


@Component({
  selector: 'classProfile-root',
  templateUrl: './classProfile.component.html',
  styleUrls: ['./classProfile.component.css'],
  providers: [MessageService]
})

export class ClassProfileComponent extends MultilingualComponent implements OnInit, OnDestroy, OnChanges {

  private destroy$: Subject<void> = new Subject();
  private _classService;
  private _postService;
  private _notificationService;
  private _authService;
  class: any;
  isProfileGrid: boolean = true;
  isOpenSidebar: boolean = false;
  isOpenModal: boolean = false;
  loadingIcon: boolean = false;
  postLoadingIcon: boolean = false;
  reelsLoadingIcon: boolean = false;
  classId!: string;
  validToken!: string;

  classLanguage!: AddClassLanguage;
  classTeacher!: AddClassTeacher;
  deleteLanguage!: DeleteClassLanguage;
  deleteTeacher!: DeleteClassTeacher;

  editClass: any;
  editClassForm!: FormGroup;
  languageForm!: FormGroup;
  teacherForm!: FormGroup;
  certificateForm!: FormGroup;
  uploadImage!: any;
  updateClassDetails!: EditClassModel;
  accessibility: any;
  filteredLanguages!: any[];
  languages: any;
  filteredTeachers!: any[];
  teachers: any;
  deleteCertificate!: DeleteClassCertificate;
  classCertificate!: AddClassCertificate;
  certificateToUpload = new FormData();
  fileToUpload = new FormData();
  isSubmitted: boolean = false;
  isClassPaid!: boolean;
  disabled: boolean = true;
  currentDate!: string;
  isOwner!: boolean;
  userId!: string;
  likesLength!: number;
  isLiked!: boolean;
  likeUnlikePost!: LikeUnlikePost;
  currentLikedPostId!: string;
  className!: string;
  gridItemInfo: any;
  isGridItemInfo: boolean = false;
  postView!: PostView;
  classView!: ClassView;
  bsModalRef!: BsModalRef;

  itemsPerSlide = 7;
  singleSlideOffset = true;
  noWrap = true;
  classParamsData$: any;
  schoolName!: string;
  postsEndPageNumber: number = 1;
  reelsPageNumber: number = 1;
  scrollFeedResponseCount: number = 1;
  scrolled: boolean = false;

  userPermissions: any;
  hasPostPermission!: boolean;
  hasUpdateClassPermission!: boolean;
  hasAddClassCertificatesPermission!: boolean;
  hasAddLanguagesPermission!: boolean;
  hasIssueCertificatePermission!: boolean;
  hasManageTeachersPermission!: boolean;
  classAvatar: string = '';
  isOnInitInitialize: boolean = false;
  selectedLang: any;
  savedPostSubscription!: Subscription;
  savedReelSubscription!: Subscription;
  addPostSubscription!: Subscription;
  changeLanguageSubscription!: Subscription;
  paymentStatusSubscription!: Subscription;
  sharedPostSubscription!: Subscription;
  deletePostSubscription!: Subscription;
  deleteReelSubscription!: Subscription;
  generateCertificateSubscription!: Subscription;

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
  @ViewChild('hiddenButton') hiddenButtonRef!: ElementRef;

  minDate: any;
  filteredAttachments: any[] = [];

  classCertificateForm!: FormGroup;
  classCertificateInfo: any;

  @ViewChild('openClassOwnCertificate') openClassOwnCertificate!: ElementRef;


  public event: EventEmitter<any> = new EventEmitter();

  @ViewChild('closeEditModal') closeEditModal!: ElementRef;
  @ViewChild('closeTeacherModal') closeTeacherModal!: ElementRef;
  @ViewChild('closeLanguageModal') closeLanguageModal!: ElementRef;
  @ViewChild('closeCertificateModal') closeCertificateModal!: ElementRef;
  @ViewChild('imageFile') imageFile!: ElementRef;
  @ViewChild('carousel') carousel!: ElementRef;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('startDate') startDateRef!: ElementRef;
  @ViewChild('endDate') endDateRef!: ElementRef;
  @ViewChild('createPostModal', { static: true }) createPostModal!: CreatePostComponent;

  isDataLoaded: boolean = false;
  constructor(injector: Injector, private translateService: TranslateService, private titleService: Title, private meta: Meta, private datePipe: DatePipe, authService: AuthService, notificationService: NotificationService, public messageService: MessageService, postService: PostService, private bsModalService: BsModalService, classService: ClassService, private route: ActivatedRoute, private domSanitizer: DomSanitizer, private fb: FormBuilder, private router: Router, private http: HttpClient, private activatedRoute: ActivatedRoute, private cd: ChangeDetectorRef) {
    super(injector);
    this._classService = classService;
    this._postService = postService;
    this._notificationService = notificationService;
    this._authService = authService;
    this.classParamsData$ = this.route.params.subscribe((routeParams) => {
      if (this.savedPostSubscription) {
        this.savedPostSubscription.unsubscribe;
      }
      this.className = routeParams.className;
      if (!this.loadingIcon && this.isOnInitInitialize) {
        this.ngOnInit();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.savedPostSubscription) {
      this.savedPostSubscription.unsubscribe();
    }
    if (this.savedReelSubscription) {
      this.savedReelSubscription.unsubscribe();
    }
    if (this.changeLanguageSubscription) {
      this.changeLanguageSubscription.unsubscribe();
    }
    if (this.sharedPostSubscription) {
      this.sharedPostSubscription.unsubscribe();
    }
    if (this.paymentStatusSubscription) {
      this.paymentStatusSubscription.unsubscribe();
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
    this.destroy$.next();
    this.destroy$.complete();
    if (this.classParamsData$) {
      this.classParamsData$.unsubscribe();
    }
  }

  ngOnChanges(): void {

  }

  reelsTags: any;
  ngOnInit(): void {

    debugger
    this.checkScreenSize();
    if (this.isScreenMobile) {
      this.profileGrid();
    }
    // this.meta.addTag({ rel: 'canonical', href: 'https://www.byokul.com' });
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
    this.selectedLang = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLang ?? '');
    this.minDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    // this.className = this.route.snapshot.paramMap.get('className')??'';

    this._classService.getClassById(this.className.replace(" ", "").toLowerCase()).subscribe((response) => {
      this.postsEndPageNumber = 1;
      this.reelsPageNumber = 1;
      this.class = response;
      this.titleService.setTitle(this.class.className);
      this.addDescriptionMetaTag(this.class.description);
      this.classAvatar = this.class.avatar;
      this.isOwnerOrNot();
      this.loadingIcon = false;
      this.isDataLoaded = true;
      this.cd.detectChanges();
      this.postLoadingIcon = false;
      this.scrolled = false;
      this.addClassView(this.class.classId);
      this.addEventListnerOnCarousel();
      this.class.posts = this.getFilteredAttachments(this.class.posts);
 


      //here is the code


      // this.reelsTags = JSON.parse(postValueTag);




      //     this.translateService.get(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])
      // .subscribe(translations => {
      //   debugger
      //   // Store the translated month names
      //   this.translateService.set('months', translations);
      // });
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
      languageIds: this.fb.control(''),
      serviceTypeId: this.fb.control('')

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
      languages: this.fb.control([], [Validators.required]),
    });

    this.teacherForm = this.fb.group({
      teachers: this.fb.control([], [Validators.required]),
    });

    this.certificateForm = this.fb.group({
      certificates: this.fb.control([], [Validators.required]),
    });

    this.initializeClassCertificateForm();

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
      classId: '',
      certificateId: ''
    }


    this.classCertificate = {
      classId: '',
      certificates: []
    }

    this.InitializeLikeUnlikePost();

    if (!this.addPostSubscription) {
      this.addPostSubscription = addPostResponse.subscribe((postResponse: any) => {
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
        this._classService.getClassById(this.className.replace(" ", "").replace(".","").toLowerCase()).subscribe((response) => {
          this.class = response;
          this.titleService.setTitle(this.class.className);
          this.addDescriptionMetaTag(this.class.description);
          this.classAvatar = this.class.avatar;
          this.isOwnerOrNot();
          this.loadingIcon = false;
          this.isDataLoaded = true;
          this.postLoadingIcon = false;
          this.scrolled = false;
          this.addClassView(this.class.classId);
          this.class.posts = this.getFilteredAttachments(this.class.posts);
          // this.showPostDiv(postResponse.response.id);    
        });
      });
    }

    sharePostResponse.subscribe(response => {
      this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: 'This class is private/paid, you cant share the post!' });
    });

    // const isCourseConvertIntoClass = JSON.parse(localStorage.getItem("isCourseConvertIntoClass")??'');
    // if(isCourseConvertIntoClass){
    //   this.cd.detectChanges();
    //   this.messageService.add({severity: 'success',summary: 'Success',life: 3000,detail: 'Course converted into class successfully',}); 
    //   localStorage.removeItem("isCourseConvertIntoClass");
    // }

    var isConvertIntoClass = history.state.convertIntoClass;
    if (isConvertIntoClass) {
      this.cd.detectChanges();
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Course converted into class successfully', });
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
      if (response.postType == 1) {
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Post shared successfully' });
        var post = this.class.posts.find((x: { id: string; }) => x.id == response.postId);
        post.postSharedCount++;
      }
      else
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Reel shared successfully' });
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
        var deletedPost = this.class.posts.find((x: { id: string; }) => x.id == response.postId);
        const index = this.class.posts.indexOf(deletedPost);
        if (index > -1) {
          this.class.posts.splice(index, 1);
        }
      });
    }

    if (!this.deleteReelSubscription) {
      this.deleteReelSubscription = deleteReelResponse.subscribe(response => {
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Reel deleted successfully' });
        var deletedPost = this.class.reels.find((x: { id: string; }) => x.id == response.postId);
        const index = this.class.reels.indexOf(deletedPost);
        if (index > -1) {
          this.class.reels.splice(index, 1);
        }
      });
    }

    // if(!this.generateCertificateSubscription){
    this.generateCertificateSubscription = generateCertificateResponse.subscribe(response => {
      if (response.isCertificateSendToAll) {
        this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: 'We will notify you, when certificate will be sent to all the students' });
      }
      else {
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: `Certificate successfully sent to the ${response.studentName}` });
      }
    });
    // }
  }

  getClassDetails(classId: string) {
    this._classService.getClassEditDetails(classId).subscribe((response) => {
      this.editClass = response;
      this.initializeEditFormControls();
    })

  }

  translateDate(date: Date): any {
    debugger
    var formatteddate = this.datePipe.transform(date, 'MMMM d, y', '', 'es');
    const formattedDate = formatDate(date, 'MMMM d, y', 'ar');
    return formatteddate;
  }

  addEventListnerOnCarousel() {
    if (this.carousel != undefined) {
      if ($('carousel')[0].querySelectorAll('a.carousel-control-next')[0]) {
        $('carousel')[0].querySelectorAll('a.carousel-control-next')[0].addEventListener('click', () => {
          this.reelsPageNumber++;
          if (this.reelsPageNumber == 2) {
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

  initializeClassCertificateForm(){
    this.classCertificateForm = this.fb.group({
      classId: this.fb.control(''),
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

  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    const windowSize = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;

    if (scrollPosition >= bodyHeight - windowSize) {
      if (!this.scrolled && this.scrollFeedResponseCount != 0) {
        this.scrolled = true;
        this.postLoadingIcon = true;
        this.postsEndPageNumber++;
        this.getPostsByClassId();
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

  getPostsByClassId() {
    if (this.class?.classId == undefined) {
      this.postLoadingIcon = true;
      return;
    }
    this._classService.getPostsByClassId(this.class.classId, this.postsEndPageNumber).subscribe((response) => {
      var result = this.getFilteredAttachments(response);
      this.class.posts = [...this.class.posts, ...result];
      this.postLoadingIcon = false;
      this.scrollFeedResponseCount = response.length;
      this.scrolled = false;
    });
  }

  isOwnerOrNot() {
    var validToken = localStorage.getItem("jwt");
    if (validToken != null) {
      let jwtData = validToken.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.userId = decodedJwtData.jti;
      if (decodedJwtData.sub == this.class.createdBy) {
        this.isOwner = true;
      }
      else {
        this.isOwner = false;
      }
    }

    this.userPermissions = JSON.parse(localStorage.getItem('userPermissions') ?? '');
    var userPermissions: any[] = this.userPermissions;

    userPermissions.forEach(element => {
      if ((element.typeId == this.class.classId || element.typeId == PermissionNameConstant.DefaultClassId) && element.ownerId == this.class.school.createdById && element.permissionType == PermissionTypeEnum.Class && element.permission.name == PermissionNameConstant.Post && (element.schoolId == null || element.schoolId == this.class.school.schoolId)) {
        this.hasPostPermission = true;
      }
      if ((element.typeId == this.class.classId || element.typeId == PermissionNameConstant.DefaultClassId) && element.ownerId == this.class.school.createdById && element.permissionType == PermissionTypeEnum.Class && element.permission.name == PermissionNameConstant.UpdateClass && (element.schoolId == null || element.schoolId == this.class.school.schoolId)) {
        this.hasUpdateClassPermission = true;
      }
      if ((element.typeId == this.class.classId || element.typeId == PermissionNameConstant.DefaultClassId) && element.ownerId == this.class.school.createdById && element.permissionType == PermissionTypeEnum.Class && element.permission.name == PermissionNameConstant.IssueCertificate && (element.schoolId == null || element.schoolId == this.class.school.schoolId)) {
        this.hasIssueCertificatePermission = true;
      }
      if ((element.typeId == this.class.classId || element.typeId == PermissionNameConstant.DefaultClassId) && element.ownerId == this.class.school.createdById && element.permissionType == PermissionTypeEnum.Class && element.permission.name == PermissionNameConstant.AddClassCertificates && (element.schoolId == null || element.schoolId == this.class.school.schoolId)) {
        this.hasAddClassCertificatesPermission = true;
      }
      if ((element.typeId == this.class.classId || element.typeId == PermissionNameConstant.DefaultClassId) && element.ownerId == this.class.school.createdById && element.permissionType == PermissionTypeEnum.Class && element.permission.name == PermissionNameConstant.AddLanguages && (element.schoolId == null || element.schoolId == this.class.school.schoolId)) {
        this.hasAddLanguagesPermission = true;
      }
      if ((element.typeId == this.class.classId || element.typeId == PermissionNameConstant.DefaultClassId) && element.ownerId == this.class.school.createdById && element.permissionType == PermissionTypeEnum.Class && element.permission.name == PermissionNameConstant.ManageTeachers && (element.schoolId == null || element.schoolId == this.class.school.schoolId)) {
        this.hasManageTeachersPermission = true;
      }
    });

  }


  initializeEditFormControls() {


    this.classAvatar = this.class.avatar;
    this.uploadImage = '';
    this.imageFile.nativeElement.value = "";
    this.fileToUpload.set('avatarImage', '');

    var startDate = this.editClass.startDate;
    startDate = startDate.substring(0, startDate.indexOf('T'));
    startDate = this.datePipe.transform(startDate, 'MM/dd/yyyy');

    var endDate = this.editClass.endDate;
    endDate = endDate.substring(0, endDate.indexOf('T'));
    endDate = this.datePipe.transform(endDate, 'MM/dd/yyyy');

    var selectedLanguages: string[] = [];

    this.editClass.languages.forEach((item: { id: string; }) => {
      selectedLanguages.push(item.id)
    });

    this.currentDate = this.getCurrentDate();

    flatpickr('#start_date', {
      minDate: new Date(),
      dateFormat: "m/d/Y",
      defaultDate: startDate
    });

    flatpickr('#end_date', {
      minDate: new Date(),
      dateFormat: "m/d/Y",
      defaultDate: endDate
    });

    this.editClassForm = this.fb.group({
      schoolName: this.fb.control(this.editClass.school.schoolName),
      className: this.fb.control(this.editClass.className, [Validators.required]),
      noOfStudents: this.fb.control(this.editClass.noOfStudents, [Validators.required]),
      startDate: this.fb.control(startDate, [Validators.required]),
      endDate: this.fb.control(endDate, [Validators.required]),
      accessibilityId: this.fb.control(this.editClass.accessibilityId, [Validators.required]),
      price: this.fb.control(this.editClass.price),
      description: this.fb.control(this.editClass.description),
      languageIds: this.fb.control(selectedLanguages, [Validators.required]),
      serviceTypeId: this.fb.control(this.editClass.serviceTypeId, [Validators.required])

    }, { validator: this.dateLessThan('startDate', 'endDate', this.currentDate) });

    if (this.editClass.serviceTypeId == '0d846894-caa4-42f3-8e8a-9dba6467672b') {
      this.getPaidClass();

    }
    this.editClassForm.updateValueAndValidity();
  }

  dateLessThan(from: string, to: string, currentDate: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let f = group.controls[from];
      let t = group.controls[to];
      if ((new Date(f.value) > new Date(t.value) && t.value != "" && f.value != "") || new Date(f.value) < new Date(currentDate)) {
        return {
          dates: `Please enter valid date`
        };
      }
      return {};
    }
  }

  getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var currentDate = mm + '/' + dd + '/' + yyyy;
    return currentDate;
  }

  back(): void {
    window.history.back();
  }

  getDeletedLanguage(deletedLanguage: string) {
    this.deleteLanguage.languageId = deletedLanguage;
  }

  getDeletedTeacher(deletedTeacher: string) {
    this.deleteTeacher.teacherId = deletedTeacher;
  }

  captureLanguageId(event: any) {
    var languageId = event.id;
    this.classLanguage.languageIds.push(languageId);
  }

  filterLanguages(event: any) {

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

  saveClassLanguages() {
    this.isSubmitted = true;
    if (!this.languageForm.valid) {
      return;
    }
    this.loadingIcon = true;
    this.classLanguage.classId = this.class.classId;
    this._classService.saveClassLanguages(this.classLanguage).subscribe((response: any) => {
      this.closeLanguagesModal();
      this.isSubmitted = false;
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Language added successfully' });
      this.ngOnInit();

    });
  }

  deleteClassLanguage() {
    this.loadingIcon = true;
    this.deleteLanguage.classId = this.class.classId;
    this._classService.deleteClassLanguage(this.deleteLanguage).subscribe((response: any) => {
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Language deleted successfully' });
      this.ngOnInit();
    });

  }

  captureTeacherId(event: any) {
    var teacherId = event.teacherId;
    this.classTeacher.teacherIds.push(teacherId);
  }

  filterTeachers(event: any) {
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

  saveClassTeachers() {
    this.isSubmitted = true;
    if (!this.teacherForm.valid) {
      return;
    }
    this.loadingIcon = true;
    this.classTeacher.classId = this.class.classId;
    this._classService.saveClassTeachers(this.classTeacher).subscribe((response: any) => {
      this.closeTeachersModal();
      this.isSubmitted = false;
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Teacher added successfully' });
      this.ngOnInit();

    });
  }

  deleteClassTeacher() {
    this.loadingIcon = true;
    this.deleteTeacher.classId = this.class.classId;
    this._classService.deleteClassTeacher(this.deleteTeacher).subscribe((response: any) => {
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Teacher deleted successfully' });
      this.ngOnInit();

    });

  }

  getDeletedCertificate(deletedCertificate: string) {
    debugger
    this.deleteCertificate.certificateId = deletedCertificate;
  }

  deleteClassCertificate() {
    debugger
    this.loadingIcon = true;
    this.deleteCertificate.classId = this.class.classId;
    this._classService.deleteClassCertificate(this.deleteCertificate).subscribe((response: any) => {
      this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Certificate added successfully' });
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

  // saveClassCertificates(){
  //   this.isSubmitted = true;
  //   if (!this.certificateForm.valid) {
  //     return;
  //   }
  //   this.loadingIcon = true;
  //   for(var i=0; i<this.classCertificate.certificates.length; i++){
  //     this.certificateToUpload.append('certificates', this.classCertificate.certificates[i]);
  //  }
  //   this.certificateToUpload.append('classId', this.class.classId);
  //   this._classService.saveClassCertificates(this.certificateToUpload).subscribe((response:any) => {
  //     this.closeCertificatesModal();
  //     this.isSubmitted = false;
  //     this.classCertificate.certificates = [];
  //     this.certificateToUpload.set('certificates','');
  //     this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Certificate deleted successfully'});
  //     this.ngOnInit();
  //   });
  // }
  saveClassCertificate() {
    debugger
    this.isSubmitted = true;
    if (!this.classCertificateForm.valid) {
      return;
    }

    if (this.uploadImage == null) {
      return;
    }

    this.loadingIcon = true;
    var formValue = this.classCertificateForm.value;

    //here we will add if id has
    if (formValue.certificateId != "") {
      this.certificateToUpload.append('certificateId', formValue.certificateId);
    }

    if (typeof this.uploadImage == "string") {
      this.certificateToUpload.append('certificateUrl', this.uploadImage);
    }
    this.certificateToUpload.append('classId', this.class.classId);
    this.certificateToUpload.append('certificateName', formValue.certificateName);
    this.certificateToUpload.append('provider', formValue.provider);
    this.certificateToUpload.append('issuedDate', formValue.issuedDate);
    this.certificateToUpload.append('description', formValue.description);

    // this.userCertificateForm.updateValueAndValidity();

    this._classService.saveClassCertificates(this.certificateToUpload).subscribe((response: any) => {
      debugger
      this.closeCertificatesModal();
      this.isSubmitted = false;
      this.certificateToUpload = new FormData();
      this.classCertificate.certificates = [];
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

  removeUploadCertificateImage() {
    this.uploadImage = null;
    this.certificateToUpload.set('certificateImage', '');
    this.avatarImage = undefined;
    this.uploadImageName = "";
  }


  updateClass() {
    this.isSubmitted = true;
    if (!this.editClassForm.valid) {
      return;
    }

    this.loadingIcon = true;

    if (!this.uploadImage) {
      this.fileToUpload.append('avatar', this.classAvatar);
    }

    this.fileToUpload.append("avatarImage", this.selectedImage);

    this.updateClassDetails = this.editClassForm.value;
    this.schoolName = this.editClassForm.get('schoolName')?.value;
    this.fileToUpload.append('classId', this.class.classId);
    this.fileToUpload.append('className', this.updateClassDetails.className);
    this.fileToUpload.append('noOfStudents', this.updateClassDetails.noOfStudents.toString());
    this.fileToUpload.append('startDate', this.updateClassDetails.startDate);
    this.fileToUpload.append('endDate', this.updateClassDetails.endDate);
    this.fileToUpload.append('price', this.updateClassDetails.price?.toString());
    this.fileToUpload.append('accessibilityId', this.updateClassDetails.accessibilityId);
    this.fileToUpload.append('languageIds', JSON.stringify(this.updateClassDetails.languageIds));
    this.fileToUpload.append('description', this.updateClassDetails.description);
    this.fileToUpload.append('serviceTypeId', this.updateClassDetails.serviceTypeId);

    this._classService.editClass(this.fileToUpload).subscribe((response: any) => {
      this.closeModal();
      this.isSubmitted = true;
      ownedClassResponse.next({ classId: response.classId, classAvatar: response.avatar, className: response.className, schoolName: this.schoolName, action: "update" });

      this.fileToUpload = new FormData();
      this.cd.detectChanges();
      const translatedSummary = this.translateService.instant('Success');
      const translatedMessage = this.translateService.instant('ClassUpdatedsuccessfully');
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
      // this.ngOnInit();
    });


  }

  getFreeClass() {
    this.isClassPaid = false;
    this.editClassForm.get('price')?.removeValidators(Validators.required);
    this.editClassForm.patchValue({
      price: null,
    });
  }

  getPaidClass() {
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

  resetCertificateModal() {
    this.isSubmitted = false;
    // this.classCertificate.certificates = [];

    this.uploadImage = null;
    this.initializeClassCertificateForm();
    this.certificateToUpload.set('certificateImage', '');
    flatpickr('#issuedDate', {
      minDate: "1903-12-31",
      maxDate: new Date(),
      dateFormat: "m/d/Y",
      defaultDate: new Date()
    });
  }

  removeTeacher(event: any) {
    const teacherIndex = this.classTeacher.teacherIds.findIndex((item) => item === event.teacherId);
    if (teacherIndex > -1) {
      this.classTeacher.teacherIds.splice(teacherIndex, 1);
    }
  }

  removeLanguage(event: any) {
    const languageIndex = this.classLanguage.languageIds.findIndex((item) => item === event.id);
    if (languageIndex > -1) {
      this.classLanguage.languageIds.splice(languageIndex, 1);
    }
  }

  resetLanguageModal() {
    this.isSubmitted = false;
    this.classLanguage.languageIds = [];
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

  createPost() {
    this.isOpenModal = true;

  }

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

  openPostModal(isLiveTabOpen?: boolean): void {
    const initialState = {
      classId: this.class.classId,
      from: "class",
      isLiveTabOpen: isLiveTabOpen
    };
    this.bsModalService.show(CreatePostComponent, { initialState });
  }

  pinUnpinPost(attachmentId: string, isPinned: boolean) {
    this._postService.pinUnpinPost(attachmentId, isPinned).subscribe((response) => {
      this.ngOnInit();
      console.log(response);
    });

  }


  convertToCourse(className: string, schoolName: string) {
    this._classService.convertToCourse(className.replace(" ", "").toLowerCase()).subscribe((response) => {
      // localStorage.setItem("isClassConvertIntoCourse", JSON.stringify(true));
      debugger
      convertIntoCourseResponse.next({ courseId: response.classId, courseName: response.className, avatar: response.avatar, school: response.school });
      debugger
      this.router.navigate([`profile/course/${schoolName.replace(" ", "").toLowerCase()}/${className.replace(" ", "").toLowerCase()}`],
        { state: { convertIntoCourse: true } });
      //window.location.href = `profile/course/${schoolName.replace(" ","").toLowerCase()}/${className.replace(" ","").toLowerCase()}`;
    });

  }

  openPostsViewModal(posts: any): void {
    debugger
    if (posts.isLive) {
      this._postService.openLiveStream(posts, this.userId).subscribe((response) => {
      });
    }
    else {
      var postAttachments = this.filteredAttachments.filter(x => x.postId == posts.id);
      const initialState = {
        posts: posts,
        postAttachments: postAttachments,
        serviceType: this.class.serviceType.type,
        accessibility: this.class.accessibility.name
      };
      let videoElement: HTMLVideoElement | null = document.getElementById('displayVideo') as HTMLVideoElement
    if(videoElement){
       var vdo: HTMLVideoElement | null = videoElement.children[0]  as HTMLVideoElement
       if(vdo){
        vdo.pause();
       }
    }
      this.bsModalRef = this.bsModalService.show(PostViewComponent, { initialState });

      this.bsModalRef.content.event.subscribe((res: { data: any; }) => {

        var a = res.data;
        //this.itemList.push(res.data);
      });
    }
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
    this.class.posts.filter((p: any) => p.id == postId).forEach((item: any) => {
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
        this._notificationService.initializeNotificationViewModel(post.createdBy, NotificationType.Likes, notificationContent, this.userId, postId, postType, post, null).subscribe((response) => {
        });

      }
    });


    this.likeUnlikePost.postId = postId;
    this.likeUnlikePost.isLike = isLike;
    this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
    this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {


      this.class.posts.filter((p: any) => p.id == postId).forEach((item: any) => {
        var itemss = item.likes;
        item.likes = response;
      });

      this.InitializeLikeUnlikePost();
      console.log("succes");
    });




  }

  showPostDiv(post: any) {
    debugger
    $('.imgDisplay').attr("style", "display:none;")
    $('.' + post.id).prevAll('.imgDisplay').first().attr("style", "display:block;");

    // var posts: any[] = this.class.posts;
    this.gridItemInfo = post;
    if (this.gridItemInfo.isLive) {
      this.isGridItemInfo = true;
      this._postService.openLiveStream(this.gridItemInfo, this.userId).subscribe((response) => {
      });
    }
    else {
      debugger
      this.isGridItemInfo = true;
      this.cd.detectChanges();
      // const player = videojs(this.videoPlayer.nativeElement, { autoplay: false });
      this.addPostView(this.gridItemInfo.id);
    }
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

  addClassView(classId: string) {

    if (this.userId != undefined) {
      this.initializeClassView();
      this.classView.classId = classId;
      this._classService.classView(this.classView).subscribe((response) => {

        console.log('success');
        //this.posts.posts.views.length = response;
      });
    }

  }
  initializeClassView() {
    this.classView = {
      classId: '',
      userId: ''
    }
  }

  openReelsViewModal(postAttachmentId: string, postId: string): void {
    this.router.navigate(
      [`user/reelsView/${this.class.classId}/class/${postAttachmentId}`],
      { state: { post: { postId: postId } } });
    // const initialState = {
    //   postAttachmentId: postAttachmentId
    // };
    // this.bsModalService.show(ReelsViewComponent,{initialState});
  }

  openPaymentModal() {
    var classDetails = { "id": this.class.classId, "name": this.class.className, "avatar": this.class.avatar, "type": 1, "amount": this.class.price }
    const initialState = {
      paymentDetails: classDetails
    };
    this.bsModalService.show(PaymentComponent, { initialState });
  }

  openCertificateViewModal(certificateUrl: string, certificateName: string, from?: number, event?: Event) {
    var fromValue = PostAuthorTypeEnum.Class;
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
    if (this.class.accessibility.name == Constant.Private || this.class.serviceType.type == Constant.Paid) {
      this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: 'This class is private/paid, you cant share the post!' });
    }
    else {
      var image: string = '';
      if (postType == 1) {
        var post = this.class.posts.find((x: { id: string; }) => x.id == postId);
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

  savePost(postId: string) {
    var posts: any[] = this.class.posts;
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

  createCertificate(classId: string, type: string) {
    this._classService.getClassInfoForCertificate(classId).subscribe((response) => {
      if (response.students.length == 0) {
        this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: 'Your class does not have any students yet' });
        return;
      }
      else {
        this.router.navigate([`user/createCertificate`], { state: { certificateInfo: { id: classId, type: type, } } });
      }
    });
  }

  getFilteredAttachments(feeds: any): any {
    const allAttachments = feeds.flatMap((post: { postAttachments: any; }) => post.postAttachments);
    var result = allAttachments.filter((attachment: { fileType: number; }) => attachment.fileType === 3);
    this.filteredAttachments = [...this.filteredAttachments, ...result];
    feeds = feeds.map((post: { postAttachments: any[]; }) => {
      const filteredPostAttachments = post.postAttachments.filter(postAttachment => postAttachment.fileType !== 3);
      return { ...post, postAttachments: filteredPostAttachments };
    });
    return feeds;
  }

  removeLogo() {
    if (this.class.avatar != null) {
      this.classAvatar = '';
    }
    this.uploadImage = '';
    this.fileToUpload.set('avatarImage', '');
  }

  deleteClass() {
    if (this.class.students > 0) {
      this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: 'Class with registered users can not be automatically deleted. Please contact site administration for deletion request.' });
    }
    else {
      this._classService.deleteClass(this.class.classId).subscribe((response) => {
        ownedClassResponse.next({ classId: this.class.classId, classAvatar: "", className: "", schoolName: "", action: "delete" });
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Class deleted successfully' });
        setTimeout(() => {
          this.router.navigateByUrl(`user/userProfile/${this.userId}`);
        }, 3000);
        // this.router.navigateByUrl(`user/userProfile/${this.userId}`)
        // deleteClassResponse.next('delete');
      });
    }
  }

  unableDisableClass() {
    this.loadingIcon = true;
    this._classService.enableDisableClass(this.class.classId).subscribe((response) => {
      if (this.class.isDisableByOwner) {
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Class enabled successfully' });
      }
      else {
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Class disabled successfully' });
      }
      this.ngOnInit();
    });
  }

  getSelectedLanguage() {
    var selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(selectedLanguage ?? '');
    var locale = selectedLanguage == "ar" ? Arabic : selectedLanguage == "sp" ? Spanish : selectedLanguage == "tr" ? Turkish : null
    const startDateElement = this.startDateRef.nativeElement;
    startDateElement._flatpickr.set("locale", locale);
    const endDateElement = this.endDateRef.nativeElement;
    endDateElement._flatpickr.set("locale", locale);
  }

  formatLocalizedDate(date: any): string {
    debugger
    var locale = this.translate.currentLang;
    const formattedDate = this.datePipe.transform(date, 'MMMM d, y', '', locale) ?? '';
    return this.translate.instant(formattedDate);
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
    console.log('Image loaded');
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
    this.uploadImage = this.croppedImage;
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

  uploadImageName: string = "";
  avatarImage!: any;
  handleClassCertificate(event: any) {
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

  editClassCertificate(classCertificateInfo: any) {
    debugger
    // dob = dob.substring(0, dob.indexOf('T'));     

    var issuedDate = classCertificateInfo.issuedDate.substring(0, classCertificateInfo.issuedDate.indexOf('T'));
    issuedDate = this.datePipe.transform(issuedDate, 'MM/dd/yyyy');

    flatpickr('#issuedDate', {
      minDate: "1903-12-31",
      maxDate: new Date(),
      dateFormat: "m/d/Y",
      defaultDate: issuedDate
    });

    this.classCertificateForm = this.fb.group({
      schoolId: this.fb.control(this.class.classId),
      certificateName: this.fb.control(classCertificateInfo.certificateName, [Validators.required]),
      provider: this.fb.control(classCertificateInfo.provider, [Validators.required]),
      issuedDate: this.fb.control(issuedDate, [Validators.required]),
      description: this.fb.control(classCertificateInfo.description),
      certificateId: this.fb.control(classCertificateInfo.id)
    });

    this.uploadImage = classCertificateInfo.certificateUrl;
  }

  openClassOwnCertificateModal(certificateInfo: any) {
    debugger
    this.certificateToUpload.set('certificateImage', '');
    this.classCertificateInfo = certificateInfo;
    this.openClassOwnCertificate.nativeElement.click();
    this.cd.detectChanges();
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

  parseTheListTags(tags: any) {
    for (let index = 0; index < tags.length; index++) {
      const element = tags[index].postTagValue;
      try {
        var reelsTags = JSON.parse(element);
      }
      catch { }
      return reelsTags
    }
  }


  openClassCertificate(certificateInfo: any) {
    debugger
    this.certificateToUpload.set('certificateImage', '');
    this.classCertificateInfo = certificateInfo;
    this.openClassOwnCertificate.nativeElement.click();
    this.cd.detectChanges();
  }

}
