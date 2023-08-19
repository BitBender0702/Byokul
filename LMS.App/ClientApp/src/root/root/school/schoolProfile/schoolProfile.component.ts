import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, finalize, Subject, Subscription } from 'rxjs';
import { EditSchoolModel } from 'src/root/interfaces/school/editSchoolModel';
import { AddSchoolLanguage } from 'src/root/interfaces/school/addSchoolLanguage';
import { SchoolService } from 'src/root/service/school.service';
import { DeleteSchoolLanguage } from 'src/root/interfaces/school/deleteSchoolLanguage';
import { AddSchoolTeacher } from 'src/root/interfaces/school/addSchoolTeacher';
import { DeleteSchoolTeacher } from 'src/root/interfaces/school/deleteSchoolTeacher';
import { AddSchoolCertificate } from 'src/root/interfaces/school/addSchoolCertificate';
import { DeleteSchoolCertificate } from 'src/root/interfaces/school/deleteSchoolCertificate';
import { MultilingualComponent, changeLanguage } from '../../sharedModule/Multilingual/multilingual.component';
import {
  addPostResponse,
  CreatePostComponent,
} from '../../createPost/createPost.component';

import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FollowUnfollow } from 'src/root/interfaces/FollowUnfollow';
import { FollowUnFollowEnum } from 'src/root/Enums/FollowUnFollowEnum';
import { PostService } from 'src/root/service/post.service';
import { PostViewComponent, deletePostResponse, savedPostResponse } from '../../postView/postView.component';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { LikeUnlikeClassCourse } from 'src/root/interfaces/school/likeUnlikeClassCourse';
import { MessageService } from 'primeng/api';
import { ReelsViewComponent, deleteReelResponse, savedReelResponse } from '../../reels/reelsView.component';
import { ownedSchoolResponse } from '../createSchool/createSchool.component';
import * as $ from 'jquery';
import { ClassCourseModalComponent, savedClassCourseResponse } from '../../ClassCourseModal/classCourseModal.component';
import { NotificationService } from 'src/root/service/notification.service';
import { NotificationType, NotificationViewModel } from 'src/root/interfaces/notification/notificationViewModel';
import { CourseService } from 'src/root/service/course.service';
import { ClassService } from 'src/root/service/class.service';
import { ClassCourseFilterTypeEnum } from 'src/root/Enums/classCourseFilterTypeEnum';
import { CertificateViewComponent } from '../../certificateView/certificateView.component';
import { PostAuthorTypeEnum } from 'src/root/Enums/postAuthorTypeEnum';
import { PermissionNameConstant } from 'src/root/interfaces/permissionNameConstant';
import { PermissionTypeEnum } from 'src/root/Enums/permissionTypeEnum';
import { SharePostComponent, sharedPostResponse } from '../../sharePost/sharePost.component';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { AuthService } from 'src/root/service/auth.service';
import { RolesEnum } from 'src/root/RolesEnum/rolesEnum';
import { ownedClassResponse } from '../../class/createClass/createClass.component';
import { ownedCourseResponse } from '../../course/createCourse/createCourse.component';
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/root/service/user.service';
import { Dimensions, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input';
import { DatePipe } from '@angular/common';
import flatpickr from 'flatpickr';
import { Arabic } from 'flatpickr/dist/l10n/ar';
import { Spanish } from 'flatpickr/dist/l10n/es';
import { Turkish } from 'flatpickr/dist/l10n/tr';
import { SignalrService, notiFyTeacherResponse } from 'src/root/service/signalr.service';
export const deleteSchoolResponse = new BehaviorSubject<string>('');

import { NgxMaskModule } from 'ngx-mask';
import { v4 as uuidv4 } from 'uuid';
import { IyizicoService } from 'src/root/service/iyizico.service';
import { Constant } from 'src/root/interfaces/constant';


@Component({
  selector: 'schoolProfile-root',
  templateUrl: './schoolProfile.component.html',
  styleUrls: ['./schoolProfile.component.css'],
  providers: [MessageService],
})
export class SchoolProfileComponent
  extends MultilingualComponent
  implements OnInit, OnDestroy, OnChanges {
  private _schoolService;
  private _postService;
  private _notificationService;
  private _classService;
  private _courseService;
  private _authService;
  private _userService;
  private _signalrService;
  private _iyizicoService;
  school: any;
  isProfileGrid: boolean = true;
  isOpenSidebar: boolean = false;
  hideFeedFilters: boolean = true;
  loadingIcon: boolean = false;
  postLoadingIcon: boolean = false;
  reelsLoadingIcon: boolean = false;
  isOpenModal: boolean = false;
  schoolId!: string;
  isDataLoaded: boolean = false;
  isSchoolFollowed: boolean = false;
  validToken!: string;
  editSchool: any;
  editSchoolForm!: FormGroup;
  accessibility: any;
  isSubmitted: boolean = false;
  fileToUpload = new FormData();
  certificateToUpload = new FormData();
  uploadImage!: any;
  updateSchoolDetails!: EditSchoolModel;
  languageForm!: FormGroup;
  teacherForm!: FormGroup;
  certificateForm!: FormGroup;
  languageIds: string[] = [];
  schoolLanguage!: AddSchoolLanguage;
  schoolTeacher!: AddSchoolTeacher;
  schoolCertificate!: AddSchoolCertificate;
  filteredLanguages!: any[];
  languages: any;
  deleteLanguage!: DeleteSchoolLanguage;
  deleteTeacher!: DeleteSchoolTeacher;
  deleteCertificate!: DeleteSchoolCertificate;
  EMAIL_PATTERN = '[a-zA-Z0-9]+?(\\.[a-zA-Z0-9]+)*@[a-zA-Z]+\\.[a-zA-Z]{2,3}';
  selectedCertificates: any;
  isOwner!: boolean;
  teacherInfo: any[] = [];
  teachers: any;
  filteredTeachers!: any[];
  followUnfollowSchool!: FollowUnfollow;
  isFollowed!: boolean;
  followersLength!: number;
  classCourseList: any;
  likesLength!: number;
  isLiked!: boolean;
  likeUnlikePost!: LikeUnlikePost;
  likeUnlikeClassCourses!: LikeUnlikeClassCourse;
  userId!: string;
  currentLikedPostId!: string;
  currentLikedClassCourseId!: string;
  schoolName!: string;
  gridItemInfo: any;
  isGridItemInfo: boolean = false;
  postView!: PostView;
  likesClassCourseLength!: number;
  isClassCourseLiked!: boolean;
  itemsPerSlide = 7;
  singleSlideOffset = true;
  noWrap = true;
  isFeedHide: boolean = false;
  frontEndPageNumber: number = 1;
  scrollFeedResponseCount: number = 1;
  classCoursePageNumber: number = 1;
  scrollClassCourseResponseCount: number = 1;
  classCourseItem: any;
  classFilters: any;
  courseFilters: any;
  noOfAppliedClassFilters!: number;
  noOfAppliedCourseFilters!: number;
  classFilterList: any[] = [];
  courseFilterList: any[] = [];
  filteredAttachments: any[] = [];
  isOnInitInitialize: boolean = false;
  schoolAvatar: string = '';
  counter: any;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  maxLength = "15";
  // PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  selectedCountryISO: any;
  notificationViewModel!: NotificationViewModel;

  @ViewChild('closeEditModal') closeEditModal!: ElementRef;
  @ViewChild('closeTeacherModal') closeTeacherModal!: ElementRef;
  @ViewChild('closeLanguageModal') closeLanguageModal!: ElementRef;
  @ViewChild('closeCertificateModal') closeCertificateModal!: ElementRef;
  @ViewChild('imageFile') imageFile!: ElementRef;
  @ViewChild('carousel') carousel!: ElementRef;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  videoPlayers!: QueryList<ElementRef<HTMLVideoElement>>;
  @ViewChild('schoolTabButton') schoolTabButton!: ElementRef;

  @ViewChild('createPostModal', { static: true })
  createPostModal!: CreatePostComponent;
  Certificates!: string[];
  schoolParamsData$: any;
  reelsPageNumber: number = 1;
  scrolled: boolean = false;
  userPermissions: any;
  hasAllPermission: any;
  hasPostPermission!: boolean;
  hasUpdateSchoolPermission!: boolean;
  hasCreateEditClassPermission!: boolean;
  hasCreateEditCoursePermission!: boolean;
  hasManageTeachersPermission!: boolean;
  hasAddSchoolCertificatesPermission!: boolean;
  hasAddLanguagesPermission!: boolean;
  videoElements: any;
  savedPostSubscription!: Subscription;
  savedReelSubscription!: Subscription;
  changeLanguageSubscription!: Subscription;
  addPostSubscription!: Subscription;
  sharedPostSubscription!: Subscription;
  savedClassCourseSubscription!: Subscription;
  deletePostSubscription!: Subscription;
  deleteReelSubscription!: Subscription;
  getCountriesSubscription!: Subscription;
  savedMessage!: string;
  removedMessage!: string;
  requiredCountry: any;
  countries: any;
  iseditDataLoaded!: boolean;

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

  videoFileUrl: string = '';



  mask = '(000) 000-0000';
  @ViewChild('founded') founded!: ElementRef;
  @ViewChild('hiddenButton') hiddenButtonRef!: ElementRef;


  // test
  clickedPostId: string | null = null;
  showDiv: boolean = false;

  schoolCertificateForm!: FormGroup;
  schoolCertificateInfo: any;
  @ViewChild('openSchoolOwnCertificate') openSchoolOwnCertificate!: ElementRef;

  constructor(
    injector: Injector,
    private translateService: TranslateService,
    public messageService: MessageService,
    public iyizicoService: IyizicoService,
    postService: PostService,
    private bsModalService: BsModalService,
    private matDialog: MatDialog,
    public modalService: NgbModal,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    schoolService: SchoolService,
    authService: AuthService,
    userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    notificationService: NotificationService,
    classService: ClassService,
    courseService: CourseService,
    private cd: ChangeDetectorRef,
    private renderer: Renderer2,
    private el: ElementRef,
    private meta: Meta,
    private titleService: Title,
    private datePipe: DatePipe,
    signalRService: SignalrService,

  ) {
    super(injector);
    this._schoolService = schoolService;
    this._postService = postService;
    this._notificationService = notificationService;
    this._classService = classService,
      this._courseService = courseService
      this._iyizicoService = iyizicoService;
    this._authService = authService;
    this._userService = userService;
    this._signalrService = signalRService;
    this.schoolParamsData$ = this.route.params.subscribe((routeParams) => {
      this.schoolName = routeParams.schoolName;
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
    if (this.savedClassCourseSubscription) {
      this.savedClassCourseSubscription.unsubscribe();
    }
    if (this.deletePostSubscription) {
      this.deletePostSubscription.unsubscribe();
    }
    if (this.deleteReelSubscription) {
      this.deleteReelSubscription.unsubscribe();
    }
    if (this.schoolParamsData$) {
      this.schoolParamsData$.unsubscribe();
    }
    if (this.getCountriesSubscription) {
      this.getCountriesSubscription.unsubscribe();
    }
  }
  ngOnChanges(): void {

  }
  ngOnInit(): void {
    this.checkScreenSize();
    if(this.isScreenMobile){
      this.profileGrid();
    }
    this.classCourseList = undefined;
    if (this._authService.roleUser(RolesEnum.SchoolAdmin)) {
      this._authService.loginState$.next(false);
      this._authService.loginAdminState$.next(true);
    }
    else {
      this._authService.loginState$.next(true);
    }
    this.isOnInitInitialize = true;
    this.postLoadingIcon = false;
    this.loadingIcon = true;
    this.validToken = localStorage.getItem('jwt') ?? '';
    var selectedLang = localStorage.getItem('selectedLanguage');
    this.translate.use(selectedLang ?? '');



    this._schoolService.getSchoolById(this.schoolName.split('.').join("").split(" ").join("").toLowerCase()).subscribe(async (response) => {
      debugger
      this.frontEndPageNumber = 1;
      this.reelsPageNumber = 1;
      this.school = response;
      this.titleService.setTitle(this.school.schoolName);
      this.addDescriptionMetaTag(this.school.description);
      this.schoolAvatar = this.school.avatar;
      this.followersLength = this.school.schoolFollowers.length;
      this.isOwnerOrNot();
      this.loadingIcon = false;
      this.postLoadingIcon = false;
      this.scrolled = false;
      this.isDataLoaded = true;
      this.cd.detectChanges();
      this.noOfAppliedClassFilters = this.school.noOfAppliedClassFilters;
      this.noOfAppliedCourseFilters = this.school.noOfAppliedCourseFilters;
      this.addEventListnerOnCarousel();
      // const schoolTabButtonElement = this.el.nativeElement.querySelector('#school-tab');
      // this.renderer.addClass(schoolTabButtonElement, 'active');
      const ClassCourseButtonElement = this.el.nativeElement.querySelector('#classes-tab');
      const hasActiveClass = ClassCourseButtonElement.classList.contains('active');
      if (hasActiveClass) {
        this.GetSchoolClassCourseList(this.school.schoolId, undefined, 1);
      }

      // this.renderer.removeClass(ClassCourseButtonElement, 'active');
      this.cd.detectChanges();
      this.school.posts = this.getFilteredAttachments(this.school.posts);
    });

    this._schoolService.getAccessibility().subscribe((response) => {
      this.accessibility = response;
    });

    this._schoolService.getLanguageList().subscribe((response) => {
      this.languages = response;
    });

    this._schoolService.getAllTeachers().subscribe((response) => {
      this.teachers = response;
    });

    this.editSchoolForm = this.fb.group({
      schoolName: this.fb.control(''),
      schoolSlogan: this.fb.control(''),
      founded: this.fb.control(''),
      accessibilityId: this.fb.control(''),
      schoolEmail: this.fb.control(''),
      description: this.fb.control(''),
      owner: this.fb.control(''),
      country: this.fb.control(''),
      phoneNumber: this.fb.control(''),
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

    this.schoolCertificateForm = this.fb.group({
      schoolId: this.fb.control(''),
      certificateName: this.fb.control('', [Validators.required]),
      provider: this.fb.control('', [Validators.required]),
      issuedDate: this.fb.control(new Date().toISOString().substring(0, 10), [Validators.required]),
      description: this.fb.control(''),
      certificateId: this.fb.control(''),
    });

    this.schoolLanguage = {
      schoolId: '',
      languageIds: [],
    };

    this.deleteLanguage = {
      schoolId: '',
      languageId: '',
    };

    this.schoolTeacher = {
      schoolId: '',
      teacherIds: [],
    };

    this.deleteTeacher = {
      schoolId: '',
      teacherId: '',
    };

    this.schoolCertificate = {
      schoolId: '',
      certificates: [],
    };

    this.deleteCertificate = {
      schoolId: '',
      certificateId: '',
    };

    this.InitializeLikeUnlikePost();

    this.followUnfollowSchool = {
      id: '',
      isFollowed: false,
    };

    if (!this.addPostSubscription) {
      this.addPostSubscription = addPostResponse.subscribe((postResponse: any) => {
        debugger
        // if(postResponse.response.postType == 1){
        //   var translatedMessage = this.translateService.instant('PostCreatedSuccessfully');
        // }
        // else if(postResponse.response.postType == 3){
        //   var translatedMessage = this.translateService.instant('ReelCreatedSuccessfully');
        // }
        // else{
        //   var translatedMessage = this.translateService.instant('PostUpdatedSuccessfully');
        // }
        // // this.loadingIcon = true;
        // const translatedSummary = this.translateService.instant('Success');
        // this.messageService.add({severity: 'success',summary: translatedSummary,life: 3000,detail: translatedMessage,});
        let newSchoolName = this.schoolName.split('.').join("").split(" ").join("").toLowerCase()
        this._schoolService.getSchoolById(newSchoolName).subscribe((response) => {
          this.school = response;
          this.titleService.setTitle(this.school.schoolName);
          this.addDescriptionMetaTag(this.school.description);
          this.loadingIcon = false;
          this.postLoadingIcon = false;
          this.scrolled = false;
          this.followersLength = this.school.schoolFollowers.length;
          this.isOwnerOrNot();
          this.loadingIcon = false;
          this.isDataLoaded = true;
          this.school.posts = this.getFilteredAttachments(this.school.posts);
          //  this.showPostDiv(postResponse.response.id);   
        });
      });
    }

    if (!this.savedPostSubscription) {
      this.savedPostSubscription = savedPostResponse.subscribe(response => {
        const translatedSummary = this.translateService.instant('Success');
        if (response.isPostSaved) {
          const translatedMessage = this.translateService.instant('PostSavedSuccessfully');
          this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        }
        if (!response.isPostSaved) {
          const translatedMessage = this.translateService.instant('PostRemovedSuccessfully');
          this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        }
      });
    }

    if (!this.savedReelSubscription) {
      this.savedReelSubscription = savedReelResponse.subscribe(response => {
        const translatedSummary = this.translateService.instant('Success');
        if (response.isReelSaved) {
          const translatedMessage = this.translateService.instant('ReelSavedSuccessfully');
          this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        }
        if (!response.isReelSaved) {
          const translatedMessage = this.translateService.instant('ReelRemovedSuccessfully');
          this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        }
      });
    }

    this.sharedPostSubscription = sharedPostResponse.subscribe(response => {
      const translatedSummary = this.translateService.instant('Success');
      if (response.postType == 1) {
        const translatedMessage = this.translateService.instant('PostSharedSuccessfully');
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        var post = this.school.posts.find((x: { id: string; }) => x.id == response.postId);
        post.postSharedCount++;
      }
      else {
        const translatedMessage = this.translateService.instant('ReelSharedSuccessfully');
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
      }
    });

    if (!this.changeLanguageSubscription) {
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.translate.use(response.language);
      })
    }

    if (!this.savedClassCourseSubscription) {
      this.savedClassCourseSubscription = savedClassCourseResponse.subscribe(response => {
        const translatedSummary = this.translateService.instant('Success');
        if (response.isSaved) {
          this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: `${response.type} saved successfully` });
        }
        if (!response.isSaved) {
          this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: `${response.type} removed successfully` });
        }
      });
    }

    if (!this.deletePostSubscription) {
      this.deletePostSubscription = deletePostResponse.subscribe(response => {
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('PostDeletedSuccessfully');
        this.isGridItemInfo = false;
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        var deletedPost = this.school.posts.find((x: { id: string; }) => x.id == response.postId);
        const index = this.school.posts.indexOf(deletedPost);
        if (index > -1) {
          this.school.posts.splice(index, 1);
        }
      });
    }

    if (!this.deleteReelSubscription) {
      this.deleteReelSubscription = deleteReelResponse.subscribe(response => {
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('ReelDeletedSuccessfully');
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        var deletedPost = this.school.reels.find((x: { id: string; }) => x.id == response.postId);
        const index = this.school.reels.indexOf(deletedPost);
        if (index > -1) {
          this.school.reels.splice(index, 1);
        }
      });
    }

    // const existingTag = this.meta.getTag(`title =(${this.school.schoolName})`);
    //       if (!existingTag) {
    //         this.meta.addTag({ name: 'robots', content: 'nofollow' });
    //       }


  }

  playVideoOnHover:boolean=false
  videoAutoplayStates: { [key: string]: boolean } = {};

  async convertBlobUrlToStream(blobUrl: string): Promise<any> {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    var stream = blob.stream();
    const imageUrl = URL.createObjectURL(blob);
    return blob.stream();
  }

  addEventListnerOnCarousel() {
    if (this.carousel != undefined) {
      if ($('carousel')[0].querySelectorAll('a.carousel-control-next')[0]) {
        $('carousel')[0].querySelectorAll('a.carousel-control-next')[0].addEventListener('click', () => {
          this.reelsPageNumber++;
          if (this.reelsPageNumber == 2) {
            this.reelsLoadingIcon = true;
          }
          this._schoolService.getReelsBySchoolId(this.school.schoolId, this.reelsPageNumber).subscribe((response) => {
            this.school.reels = [...this.school.reels, ...response];
            this.reelsLoadingIcon = false;
          });
        })
      }
    }
  }
  InitializeLikeUnlikePost() {
    this.likeUnlikePost = {
      postId: '',
      userId: '',
      isLike: false,
      commentId: '',
    };
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    const windowSize = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;

    if (scrollPosition >= bodyHeight - windowSize) {
      if (this.isFeedHide) {
        if (!this.scrolled && this.scrollClassCourseResponseCount != 0) {
          this.scrolled = true;
          this.postLoadingIcon = true;
          this.classCoursePageNumber++;
          this.GetSchoolClassCourses();
        }
      }
      if (!this.scrolled && this.scrollFeedResponseCount != 0) {
        this.scrolled = true;
        this.postLoadingIcon = true;
        this.frontEndPageNumber++;
        this.getPostsBySchoolId();
      }
    }
  }

  addDescriptionMetaTag(description: string) {
    debugger
    const existingTag = this.meta.getTag('name="description"');
    if (existingTag) {
      this.meta.updateTag({ name: 'description', content: description });
    }
    else {
      this.meta.addTag({ name: 'description', content: description });
    }
  }

  getPostsBySchoolId() {
    if (this.school?.schoolId == undefined) {
      this.postLoadingIcon = true;
      return;
    }
    this._schoolService.getPostsBySchoolId(this.school.schoolId, this.frontEndPageNumber).subscribe((response) => {
      var result = this.getFilteredAttachments(response);
      this.school.posts = [...this.school.posts, ...result];
      this.postLoadingIcon = false;
      this.scrollFeedResponseCount = response.length;
      this.scrolled = false;
    });
  }

  GetSchoolClassCourses() {
    if (this.school?.schoolId == undefined) {
      this.postLoadingIcon = true;
      return;
    }
    this._schoolService.getSchoolClassCourseList(this.school.schoolId, this.classCoursePageNumber).subscribe((result) => {
      if (this.classCourseList != undefined) {
        this.classCourseList = [...this.classCourseList, ...result];
      }
      this.postLoadingIcon = false;
      this.scrollClassCourseResponseCount = result.length;
      this.scrolled = false;
    });
  }

  isOwnerOrNot() {
    debugger
    var validToken = localStorage.getItem('jwt');
    if (validToken != null) {
      let jwtData = validToken.split('.')[1];
      let decodedJwtJsonData = window.atob(jwtData);
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.userId = decodedJwtData.jti;
      if (decodedJwtData.sub == this.school.createdBy) {
        this.isOwner = true;
      } else {
        this.isOwner = false;
        this.isFollowedOwnerOrNot(decodedJwtData.jti);
      }
    }

    this.userPermissions = JSON.parse(localStorage.getItem('userPermissions') ?? '');
    var userPermissions: any[] = this.userPermissions;

    userPermissions.forEach(element => {
      debugger
      if ((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.Post) {
        this.hasPostPermission = true;
      }
      if ((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.UpdateSchool) {
        this.hasUpdateSchoolPermission = true;
      }
      if ((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.CreateEditClass) {
        this.hasCreateEditClassPermission = true;
      }
      if ((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.CreateEditCourse) {
        this.hasCreateEditCoursePermission = true;
      }
      if ((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.ManageTeachers) {
        this.hasManageTeachersPermission = true;
      }
      if ((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.AddSchoolCertificates) {
        this.hasAddSchoolCertificatesPermission = true;
      }
      if ((element.typeId == this.school.schoolId || element.typeId == PermissionNameConstant.DefaultSchoolId) && element.ownerId == this.school.createdById && element.permissionType == PermissionTypeEnum.School && element.permission.name == PermissionNameConstant.AddLanguages) {
        this.hasAddLanguagesPermission = true;
      }
    });
  }

  isFollowedOwnerOrNot(userId: string) {
    var followers: any[] = this.school.schoolFollowers;
    var isFollowed = followers.filter((x) => x.userId == userId);
    if (isFollowed.length != 0) {
      this.isFollowed = true;
    } else {
      this.isFollowed = false;
    }
  }

  followSchool(schoolId: string, from: string, school: any) {
    if (this.validToken == '') {
      window.open('user/auth/login', '_blank');
    } else {
      this.followUnfollowSchool.id = schoolId;
      if (from == FollowUnFollowEnum.Follow) {
        this.followersLength += 1;
        this.isFollowed = true;
        this.followUnfollowSchool.isFollowed = true;
        var notificationContent = `followed your school ${school.schoolName}`
        var postId = '00000000-0000-0000-0000-000000000000';
        var post = null;
        this.initializeNotificationViewModel(school.createdById, NotificationType.Followings, notificationContent, postId, school.schoolId);
      } else {
        this.followersLength -= 1;
        this.isFollowed = false;
        this.followUnfollowSchool.isFollowed = false;
      }
      this._schoolService
        .saveSchoolFollower(this.followUnfollowSchool)
        .subscribe((response) => {
          debugger
          console.log(response);
          if (response.result == 'success') {
            this.isSchoolFollowed = true;
          }
        });
    }
  }

  initializeNotificationViewModel(userid: string, notificationType: NotificationType, notificationContent: string, postId: string, schoolId?: string, postType?: number, post?: any) {
    this._userService.getUser(this.userId).subscribe((response) => {
      debugger
      this.notificationViewModel = {
        id: '00000000-0000-0000-0000-000000000000',
        userId: userid,
        actionDoneBy: this.userId,
        avatar: response.avatar,
        isRead: false,
        notificationContent: `${response.firstName + ' ' + response.lastName + ' ' + notificationContent}`,
        notificationType: notificationType,
        postId: postId,
        postType: postType,
        post: post,
        followersIds: null,
        chatTypeId: schoolId
      }
      this._signalrService.sendNotification(this.notificationViewModel);
    });
  }

  back(): void {
    window.history.back();
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

  openSidebar() {
    OpenSideBar.next({ isOpenSideBar: true })
  }

  getSchoolDetails(schoolId: string) {
    debugger;
    this._schoolService.getSchoolEditDetails(schoolId).subscribe((response) => {
      debugger
      this.editSchool = response;
      this.initializeEditFormControls();
    });
  }

  initializeEditFormControls() {
    debugger
    // if(this.getCountriesSubscription == null){
    this.getCountriesSubscription = this._userService.getCountryList().subscribe((response) => {
      debugger
      this.countries = response;
      this.requiredCountry = this.countries.find((x: { countryName: string; }) => x.countryName == this.school.countryName);
      this.schoolAvatar = this.school.avatar;
      this.uploadImage = '';
      this.cd.detectChanges();
      this.imageFile.nativeElement.value = '';
      this.fileToUpload.set('avatarImage', '');
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      var currentDate = yyyy + '-' + mm + '-' + dd;

      var founded = this.editSchool.founded;
      if (founded != null) {
        founded = founded.substring(0, founded.indexOf('T'));
        founded = this.datePipe.transform(founded, 'MM/dd/yyyy');
      }

      flatpickr('#founded', {
        minDate: "1903-12-31",
        maxDate: new Date(),
        dateFormat: "m/d/Y",
        defaultDate: founded
      });

      this.selectedCountryISO = CountryISO[this.requiredCountry.countryName as keyof typeof CountryISO];

      this.editSchoolForm = this.fb.group(
        {
          schoolName: this.fb.control(this.editSchool.schoolName, [
            Validators.required,
          ]),
          schoolSlogan: this.fb.control(this.editSchool.schoolSlogan ?? ''),
          founded: this.fb.control(founded, [Validators.required]),
          accessibilityId: this.fb.control(this.editSchool.accessibilityId, [
            Validators.required,
          ]),
          schoolEmail: this.fb.control(this.editSchool.schoolEmail ?? '', [
            Validators.pattern(this.EMAIL_PATTERN),
          ]),
          description: this.fb.control(this.editSchool.description ?? ''),
          owner: this.fb.control(this.editSchool.user.email),
          country: this.fb.control(this.requiredCountry.countryName),
          phoneNumber: [this.editSchool.phoneNumber, [Validators.required]]
        },
        { validator: this.dateLessThan('founded', currentDate) }
      );
      this.editSchoolForm.updateValueAndValidity();
    });
    // }
  }

  dateLessThan(from: string, to: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let f = group.controls[from];
      let t = to;
      if (f.value > t) {
        return {
          dates: `Founded date should be less than Current date`,
        };
      }
      return {};
    };
  }

  resetImage() { }
  updateSchool() {
    debugger
    var phoneNumber = this.editSchoolForm.get('phoneNumber')?.value;

    this.isSubmitted = true;
    if (!this.editSchoolForm.valid) {
      return;
    }

    this.fileToUpload.append("avatarImage", this.selectedImage);

    this.updateSchoolDetails = this.editSchoolForm.value;
    this.fileToUpload.append('schoolId', this.school.schoolId);
    this.fileToUpload.append('schoolName', this.updateSchoolDetails.schoolName);
    this.fileToUpload.append(
      'schoolSlogan',
      this.updateSchoolDetails.schoolSlogan
    );
    this.fileToUpload.append('founded', this.updateSchoolDetails.founded);
    this.fileToUpload.append(
      'accessibilityId',
      this.updateSchoolDetails.accessibilityId
    );
    this.fileToUpload.append(
      'schoolEmail',
      this.updateSchoolDetails.schoolEmail
    );
    this.fileToUpload.append(
      'description',
      this.updateSchoolDetails.description
    );
    this.fileToUpload.append('countryName', this.updateSchoolDetails.country);
    this.fileToUpload.append('phoneNumber', phoneNumber.number)

    this._schoolService
      .editSchool(this.fileToUpload)
      .subscribe((response: any) => {
        this.closeModal();
        this.isSubmitted = false;
        this.schoolName = this.updateSchoolDetails.schoolName;
        ownedSchoolResponse.next({
          schoolId: response.schoolId,
          schoolAvatar: response.avatar,
          schoolName: response.schoolName,
          action: 'update',
        });
        this.fileToUpload = new FormData();
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('SchoolUpdatedsuccessfully');
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        this.ngOnInit();
      });
  }

  private closeModal(): void {
    this.closeEditModal.nativeElement.click();
  }

  private closeCertificatesModal(): void {
    this.closeCertificateModal.nativeElement.click();
  }

  private closeTeachersModal(): void {
    this.closeTeacherModal.nativeElement.click();
  }

  private closeLanguagesModal(): void {
    this.closeLanguageModal.nativeElement.click();
  }

  handleImageInput(event: any) {
    this.fileToUpload.append(
      'avatarImage',
      event.target.files[0],
      event.target.files[0].name
    );
    const reader = new FileReader();
    reader.onload = (_event) => {
      this.uploadImage = _event.target?.result;
      this.uploadImage = this.domSanitizer.bypassSecurityTrustUrl(
        this.uploadImage
      );
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  handleCertificates(event: any) {
    this.schoolCertificate.certificates.push(event.target.files[0]);
  }

  filterLanguages(event: any) {
    var schoolLanguages: any[] = this.school.languages;
    var languages: any[] = this.languages;

    this.languages = languages.filter(
      (x) => !schoolLanguages.find((y) => y.id == x.id)
    );

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

  captureLanguageId(event: any) {
    var languageId = event.id;
    this.schoolLanguage.languageIds.push(languageId);
  }

  saveSchoolLanguages() {
    this.isSubmitted = true;
    if (!this.languageForm.valid) {
      return;
    }
    this.loadingIcon = true;
    this.schoolLanguage.schoolId = this.school.schoolId;
    this._schoolService
      .saveSchoolLanguages(this.schoolLanguage)
      .subscribe((response: any) => {
        this.closeLanguagesModal();
        this.isSubmitted = false;
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('LanguageAddedSuccessfully');
        this.messageService.add({
          severity: 'success',
          summary: translatedSummary,
          life: 3000,
          detail: translatedMessage,
        });
        this.ngOnInit();
      });
  }

  getDeletedLanguage(deletedLanguage: string) {
    this.deleteLanguage.languageId = deletedLanguage;
  }

  deleteSchoolLanguage() {
    this.loadingIcon = true;
    this.deleteLanguage.schoolId = this.school.schoolId;
    this._schoolService
      .deleteSchoolLanguage(this.deleteLanguage)
      .subscribe((response: any) => {
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('LanguageDeletedSuccessfully');
        this.messageService.add({
          severity: 'success',
          summary: translatedSummary,
          life: 3000,
          detail: translatedMessage,
        });
        this.ngOnInit();
      });
  }

  filterTeachers(event: any) {
    var schoolTeachers: any[] = this.school.teachers;
    var teachers: any[] = this.teachers;

    this.teachers = teachers.filter(
      (x) => !schoolTeachers.find((y) => y.teacherId == x.teacherId)
    );

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

  captureTeacherId(event: any) {
    var teacherId = event.teacherId;
    this.schoolTeacher.teacherIds.push(teacherId);
    this.teacherInfo.push(event);
  }

  saveSchoolTeachers() {
    this.isSubmitted = true;
    if (!this.teacherForm.valid) {
      return;
    }

    this.loadingIcon = true;
    this.schoolTeacher.schoolId = this.school.schoolId;
    this._schoolService
      .saveSchoolTeachers(this.schoolTeacher)
      .subscribe((response: any) => {
        this.teachers = [];
        this.closeTeachersModal();
        this.isSubmitted = false;
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('TeacherAddedSuccessfully');
        this.messageService.add({
          severity: 'success',
          summary: translatedSummary,
          life: 3000,
          detail: translatedMessage,
        });
        this.ngOnInit();
      });
  }

  getDeletedTeacher(deletedTeacher: string) {
    this.deleteTeacher.teacherId = deletedTeacher;
  }

  deleteSchoolTeacher() {
    this.loadingIcon = true;
    this.deleteTeacher.schoolId = this.school.schoolId;
    this._schoolService
      .deleteSchoolTeacher(this.deleteTeacher)
      .subscribe((response: any) => {
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('TeacherDeletedSuccessfully');
        this.messageService.add({
          severity: 'success',
          summary: translatedSummary,
          life: 3000,
          detail: translatedMessage,
        });
        this._signalrService.addTeacher(this.deleteTeacher.teacherId);
        this.ngOnInit();
      });
  }

  // saveSchoolCertificates() {
  //   this.isSubmitted = true;
  //   if (!this.certificateForm.valid) {
  //     return;
  //   }
  //   this.loadingIcon = true;
  //   for (var i = 0; i < this.schoolCertificate.certificates.length; i++) {
  //     this.certificateToUpload.append(
  //       'certificates',
  //       this.schoolCertificate.certificates[i]
  //     );
  //   }
  //   this.certificateToUpload.append('schoolId', this.school.schoolId);
  //   this._schoolService
  //     .saveSchoolCertificates(this.certificateToUpload)
  //     .subscribe((response: any) => {
  //       this.closeCertificatesModal();
  //       this.isSubmitted = false;
  //       this.schoolCertificate.certificates = [];
  //       this.certificateToUpload.set('certificates', '');
  //       const translatedSummary = this.translateService.instant('Success');
  //       const translatedMessage = this.translateService.instant('CertificateAddedSuccessfully');
  //       this.messageService.add({
  //         severity: 'success',
  //         summary: translatedSummary,
  //         life: 3000,
  //         detail: translatedMessage,
  //       });
  //       this.ngOnInit();
  //       console.log(response);
  //     });
  // }

  getDeletedCertificate(deletedCertificate: string) {
    this.deleteCertificate.certificateId = deletedCertificate;
  }

  deleteSchoolCertificate() {
    this.loadingIcon = true;
    this.deleteCertificate.schoolId = this.school.schoolId;
    this._schoolService
      .deleteSchoolCertificate(this.deleteCertificate)
      .subscribe((response: any) => {
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('CertificateDeletedSuccessfully');
        this.messageService.add({
          severity: 'success',
          summary: translatedSummary,
          life: 3000,
          detail: translatedMessage,
        });
        this.ngOnInit();
      });
  }

  resetCertificateModal() {
    this.isSubmitted = false;
    // this.addSchoolCertificate.certificates = [];
    this.uploadImage = null;
    this.schoolCertificateForm = this.fb.group({
      certificateName: this.fb.control('', [Validators.required]),
      provider: this.fb.control('', [Validators.required]),
      issuedDate: this.fb.control(new Date().toISOString().substring(0, 10), [Validators.required]),
      description: this.fb.control(''),
      certificateId: this.fb.control(''),
    });
    this.certificateToUpload.set('certificateImage', '');
    flatpickr('#issuedDate', {
      minDate: "1903-12-31",
      maxDate: new Date(),
      dateFormat: "m/d/Y",
      defaultDate: new Date()
    });
  }

  resetLanguageModal() {
    this.isSubmitted = false;
    this.schoolLanguage.languageIds = [];
    this.languageForm.setValue({
      languages: [],
    });
  }

  resetTeacherModal() {
    this.isSubmitted = false;
    this.teacherForm.setValue({
      teachers: [],
    });
  }

  removeTeacher(event: any) {
    const teacherIndex = this.schoolTeacher.teacherIds.findIndex(
      (item) => item === event.teacherId
    );
    if (teacherIndex > -1) {
      this.schoolTeacher.teacherIds.splice(teacherIndex, 1);
    }
  }

  removeLanguage(event: any) {
    const languageIndex = this.schoolLanguage.languageIds.findIndex(
      (item) => item === event.id
    );
    if (languageIndex > -1) {
      this.schoolLanguage.languageIds.splice(languageIndex, 1);
    }
  }

  createPost() {
    this.isOpenModal = true;
  }

  openPostModal(isLiveTabOpen?: boolean): void {
    const initialState = {
      schoolId: this.school.schoolId,
      from: 'school',
      isLiveTabOpen: isLiveTabOpen
    };
    this.bsModalService.show(CreatePostComponent, { initialState, backdrop: 'static' });
  }

  pinUnpinPost(attachmentId: string, isPinned: boolean) {
    this._postService
      .pinUnpinPost(attachmentId, isPinned)
      .subscribe((response) => {
        this.ngOnInit();
        console.log(response);
      });
  }

  openPostsViewModal(posts: any): void {
    if (posts.isLive) {
      this._postService.openLiveStream(posts, this.userId).subscribe((response) => {
      });
    }
    else {
      var postAttachments = this.filteredAttachments.filter(x => x.postId == posts.id);
      const initialState = {
        posts: posts,
        postAttachments: postAttachments
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
  }

  openClassCourseViewModal(item: string): void {
    const initialState = {
      classCourseItem: item,
    };
    this.bsModalService.show(ClassCourseModalComponent, { initialState });
  }

  hideUnhideFeedFilters(hideUnhide: boolean) {
    this.isFeedHide = false;
    if (hideUnhide) {
      this.hideFeedFilters = true;
    } else {
      this.hideFeedFilters = false;
    }
  }

  GetSchoolClassCourseList(schoolId: string, appliedFilters?: boolean, pageNumber?: number) {
    var school = this.school;
    this.isFeedHide = true;
    this.hideFeedFilters = false;
    if (pageNumber != undefined) {
      this.classCoursePageNumber = pageNumber;
    }
    if (this.classCourseList == undefined || appliedFilters) {
      this.loadingIcon = true;
      this._schoolService.getSchoolClassCourseList(schoolId, this.classCoursePageNumber).subscribe((response) => {
        debugger
        this.classCourseList = response;
        console.log(this.classCourseList);
        this.loadingIcon = false;
      });
    }
  }

  pinUnpinClassCourse(id: string, type: string, isPinned: boolean) {
    this._schoolService
      .pinUnpinClassCourse(id, type, isPinned)
      .subscribe((response) => {
        this.ngOnInit();
      });
  }

  schoolChat(userId: string, type: string, chatTypeId: string) {
    if (this.validToken == '') {
      window.open('user/auth/login', '_blank');
    } else {
      this.router.navigate([`user/chats`], {
        state: {
          chatHead: { receiverId: userId, type: type, chatTypeId: chatTypeId },
        },
      });
    }
  }

  getDeletedId(id: string, type: any, noOfStudents: number) {
    const translatedSummary = this.translateService.instant('Info');
    if (type == 1) {
      if (noOfStudents > 0) {
        const translatedMessage = this.translateService.instant('ClassNotAutomaticallyDeleted');
        this.messageService.add({ severity: 'info', summary: translatedSummary, life: 3000, detail: translatedMessage });
      }
      else {
        this._schoolService.deleteClass(id).subscribe((response) => {
          ownedClassResponse.next({ classId: id, classAvatar: "", className: "", schoolName: "", action: "delete" });
          this.ngOnInit();
        });
      }
    }
    if (type == 2) {
      if (noOfStudents > 0) {
        const translatedMessage = this.translateService.instant('CourseNotAutomaticallyDeleted');
        this.messageService.add({ severity: 'info', summary: translatedSummary, life: 3000, detail: translatedMessage });
      }
      else {
        this._schoolService.deleteCourse(id).subscribe((response) => {
          ownedCourseResponse.next({ courseId: id, courseAvatar: "", courseName: "", schoolName: "", action: "delete" });
          this.ngOnInit();
        });
      }
    }
  }

  deleteClassCourse() { }

  likeUnlikePosts(postId: string, isLike: boolean, postType: number, post: any) {
    this.currentLikedPostId = postId;
    this.school.posts
      .filter((p: any) => p.id == postId)
      .forEach((item: any) => {
        var likes: any[] = item.likes;

        var isLiked = likes.filter(
          (x) => x.userId == this.userId && x.postId == postId
        );
        if (isLiked.length != 0) {
          this.isLiked = false;
          this.likesLength = item.likes.length - 1;
          item.isPostLikedByCurrentUser = false;
        } else {
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
    this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000';
    this._postService
      .likeUnlikePost(this.likeUnlikePost)
      .subscribe((response) => {
        this.school.posts
          .filter((p: any) => p.id == postId)
          .forEach((item: any) => {
            var itemss = item.likes;
            item.likes = response;
          });

        this.InitializeLikeUnlikePost();
        console.log('succes');
      });
  }



  showPostDiv(post: any) {
    debugger
    $('.imgDisplay').attr("style", "display:none;")
    $('.' + post.id).prevAll('.imgDisplay').first().attr("style", "display:block;");

    // this.counter = uuidv4();
    // this.clickedPostId = postId;
    // this.showDiv = true;

    // var posts: any[] = this.school.posts;
    this.gridItemInfo = post;
    this.gridItemInfo.postAttachments
    if (this.gridItemInfo.isLive) {
      this.isGridItemInfo = true;
      this._postService.openLiveStream(this.gridItemInfo, this.userId).subscribe((response) => {
      });
    }
    else {
      this.isGridItemInfo = true;
      this.cd.detectChanges();
      // const videoElements = document.getElementById("video01" + this.gridItemInfo.id);
      // videoElements.forEach((videoElement: ElementRef<HTMLVideoElement>) => {
      // var playerId = "video01" + this.counter;
      // const vjsPlayer = videojs(playerId, { autoplay: false });
      this.cd.detectChanges();
      // });
      // this.videoPlayers.forEach(player => {
      //   debugger
      //   const videoElement = player.nativeElement;
      //   const vjsPlayer = videojs(videoElement, { autoplay: false });
      // });

      // const player = videojs(this.videoPlayer.nativeElement, {autoplay: false});
      this.addPostView(this.gridItemInfo.id);
      var postValueTag = this.gridItemInfo.postTags[0].postTagValue;
      this.postsTagValues = JSON.parse(postValueTag);
    }
  }

  postsTagValues:any;
  
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
      userId: '',
    };
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

  likeUnlikeClassCourse(Id: string, isLike: boolean, type: number) {
    this.currentLikedClassCourseId = Id;
    this.classCourseList
      .filter((p: any) => p.id == Id)
      .forEach((item: any) => {
        //   // here item.likes is null
        if (item.type == 1) {
          var likes: any[] = item.classLikes;
          var isLiked = likes.filter(
            (x) => x.userId == this.userId && x.classId == Id
          );
        } else {
          var likes: any[] = item.courseLikes;
          var isLiked = likes.filter(
            (x) => x.userId == this.userId && x.courseId == Id
          );
        }
        // var likes: any[] = item.likes;

        if (isLiked.length != 0) {
          this.isClassCourseLiked = false;
          if (item.type == 1) {
            this.likesClassCourseLength = item.classLikes.length - 1;
          } else {
            this.likesClassCourseLength = item.courseLikes.length - 1;
          }
          item.isLikedByCurrentUser = false;
        } else {
          this.isClassCourseLiked = true;
          if (item.type == 1) {
            this.likesClassCourseLength = item.classLikes.length + 1;
          } else {
            this.likesClassCourseLength = item.courseLikes.length + 1;
          }

          item.isLikedByCurrentUser = true;
        }
      });

    this.InitializeLikeUnlikeClassCourse();
    this.likeUnlikeClassCourses.Id = Id;
    this.likeUnlikeClassCourses.isLike = isLike;
    this.likeUnlikeClassCourses.type = type;

    this._schoolService
      .likeUnlikeClassCourse(this.likeUnlikeClassCourses)
      .subscribe((response) => {
        if (type == 1) {
          this.classCourseList
            .filter((p: any) => p.id == Id)
            .forEach((item: any) => {
              item.classLikes = response;
            });
        } else {
          this.classCourseList
            .filter((p: any) => p.id == Id)
            .forEach((item: any) => {
              item.courseLikes = response;
            });
        }

        this.InitializeLikeUnlikeClassCourse();
        console.log('succes');
      });
  }

  InitializeLikeUnlikeClassCourse() {
    this.likeUnlikeClassCourses = {
      isLike: false,
      userId: '',
      Id: '',
      type: 0,
    };
  }

  openReelsViewModal(postAttachmentId: string, postId: string): void {
    this.router.navigate(
      [`user/reelsView/${this.school.schoolId}/school/${postAttachmentId}`],
      { state: { post: { postId: postId } } });
    // const initialState = {
    //   postAttachmentId: postAttachmentId,
    // };
    // this.bsModalService.show(ReelsViewComponent, { initialState });
  }

  getClassFilters() {
    this._classService.getClassFilters(this.userId, this.school.schoolId).subscribe((classFilters) => {
      this.classFilters = classFilters;
      this.noOfAppliedClassFilters = this.classFilters[0].noOfAppliedFilters;
    });

  }

  getCourseFilters() {
    this._courseService.getCourseFilters(this.userId, this.school.schoolId).subscribe((courseFilters) => {
      this.courseFilters = courseFilters;
      this.noOfAppliedCourseFilters = this.courseFilters[0].noOfAppliedFilters;
    });

  }

  changeClassFilterSettings(id: string, isActive: boolean) {
    var classFilters: any[] = this.classFilters;
    var item = classFilters.find(x => x.id == id);
    item.isFilterActive = isActive;

    var filterItem = { id: '', isActive: false, schoolId: '' };
    filterItem.id = id;
    filterItem.isActive = isActive;
    filterItem.schoolId = this.school.schoolId;
    if (isActive) {
      this.noOfAppliedClassFilters += 1;

    }
    if (!isActive) {
      this.noOfAppliedClassFilters -= 1;

    }
    var index = this.classFilterList.findIndex(x => x.id == id);
    if (index > -1) {
      this.classFilterList.splice(index, 1);
    }
    this.classFilterList.push(filterItem);
  }

  changeCourseFilterSettings(id: string, isActive: boolean) {
    var courseFilters: any[] = this.courseFilters;
    var item = courseFilters.find(x => x.id == id);
    item.isFilterActive = isActive;

    var filterItem = { id: '', isActive: false, schoolId: '' };
    filterItem.id = id;
    filterItem.isActive = isActive;
    filterItem.schoolId = this.school.schoolId;
    if (isActive) {
      this.noOfAppliedCourseFilters += 1;

    }
    if (!isActive) {
      this.noOfAppliedCourseFilters -= 1;

    }
    var index = this.courseFilterList.findIndex(x => x.id == id);
    if (index > -1) {
      this.courseFilterList.splice(index, 1);
    }
    this.courseFilterList.push(filterItem);
  }

  saveClassFilters() {
    this._classService.saveClassFilters(this.classFilterList).subscribe((response) => {
      this.classFilterList = [];
      this.GetSchoolClassCourseList(this.school.schoolId, true, 1);
    });
  }

  saveCourseFilters() {
    this._courseService.saveCourseFilters(this.courseFilterList).subscribe((response) => {
      this.courseFilterList = [];
      this.GetSchoolClassCourseList(this.school.schoolId, true, 1);
    });
  }

  openCertificateViewModal(certificateUrl: string, certificateName: string, from?: number, event?: Event) {
    var fromValue = PostAuthorTypeEnum.School;
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
    debugger
    var image: string = '';
    if (postType == 1) {
      var post = this.school.posts.find((x: { id: string; }) => x.id == postId);
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

  savePost(postId: string) {
    const translatedMessage = this.translateService.instant('Success');
    var posts: any[] = this.school.posts;
    var isSavedPost = posts.find(x => x.id == postId);

    if (isSavedPost.isPostSavedByCurrentUser) {
      isSavedPost.savedPostsCount -= 1;
      isSavedPost.isPostSavedByCurrentUser = false;
      const translatedMessage = this.translateService.instant('PostRemovedSuccessfully');
      this.messageService.add({ severity: 'success', summary: translatedMessage, life: 3000, detail: translatedMessage });
    }
    else {
      isSavedPost.savedPostsCount += 1;
      isSavedPost.isPostSavedByCurrentUser = true;
      const translatedMessage = this.translateService.instant('PostSavedSuccessfully');
      this.messageService.add({ severity: 'success', summary: translatedMessage, life: 3000, detail: translatedMessage });
    }

    this._postService.savePost(postId, this.userId).subscribe((result) => {
    });
  }

  saveClassCourse(id: string, type: number) {
    const translatedMessage = this.translateService.instant('Success');
    var classCourseList: any[] = this.classCourseList;
    var isSavedClassCourse = classCourseList.find(x => x.id == id);

    if (isSavedClassCourse.isClassCourseSavedByCurrentUser) {
      isSavedClassCourse.savedClassCourseCount -= 1;
      isSavedClassCourse.isClassCourseSavedByCurrentUser = false;
      if (type == 1) {
        this.savedMessage = this.translateService.instant('ClassSavedSuccessfully');
        this.removedMessage = this.translateService.instant('ClassRemovedSuccessfully');
      }
      if (type == 2) {
        this.savedMessage = this.translateService.instant('CourseSavedSuccessfully');
        this.removedMessage = this.translateService.instant('CourseRemovedSuccessfully');
      }
      this.messageService.add({ severity: 'success', summary: translatedMessage, life: 3000, detail: this.removedMessage });
    }
    else {
      isSavedClassCourse.savedClassCourseCount += 1;
      isSavedClassCourse.isClassCourseSavedByCurrentUser = true;
      this.messageService.add({ severity: 'success', summary: translatedMessage, life: 3000, detail: this.savedMessage });
    }

    this._schoolService.saveClassCourse(id, this.userId, type).subscribe((result) => {
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

  clearAllClassFilters(event: any) {
    event.stopPropagation();
    this.classFilters.forEach((element: any) => {
      if (element.isFilterActive) {
        this.noOfAppliedClassFilters -= 1;
      }
      element.isFilterActive = false;
      element.schoolId = this.school.schoolId;
      element.id = element.id;
    });

    this.classFilterList = this.classFilters;
  }

  clearAllCourseFilters(event: any) {
    event.stopPropagation();
    this.courseFilters.forEach((element: any) => {
      if (element.isFilterActive) {
        this.noOfAppliedCourseFilters -= 1;
      }
      element.isFilterActive = false;
      element.schoolId = this.school.schoolId;
      element.id = element.id;
    });

    this.courseFilterList = this.courseFilters;
  }

  deleteSchool() {
    if (this.school.students > 0) {
      const translatedInfoSummary = this.translateService.instant('Info');
      const translatedMessage = this.translateService.instant('SchoolNotAutomaticallyDeleted');
      this.messageService.add({ severity: 'info', summary: translatedInfoSummary, life: 3000, detail: translatedMessage });
    }
    else {
      this._schoolService.deleteSchool(this.school.schoolId).subscribe((response) => {
        ownedSchoolResponse.next({ schoolId: this.school.schoolId, schoolAvatar: "", schoolName: "", action: "delete" });
        const translatedSuccessSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('SchoolDeletedSuccessfully');
        this.messageService.add({ severity: 'success', summary: translatedSuccessSummary, life: 3000, detail: translatedMessage });
        setTimeout(() => {
          this.router.navigateByUrl(`user/userProfile/${this.userId}`);
        }, 3000);
        // deleteSchoolResponse.next('delete');
      });
    }
  }

  removeLogo() {
    if (this.school.avatar != null) {
      this.schoolAvatar = '';
    }
    this.uploadImage = '';
    this.fileToUpload.set('avatarImage', '');
  }

  unableDisableSchool() {
    this.loadingIcon = true;
    this._schoolService.enableDisableSchool(this.school.schoolId).subscribe((response) => {
      const translatedInfoSummary = this.translateService.instant('Success');
      if (this.school.isDisableByOwner) {
        const translatedMessage = this.translateService.instant('SchoolEnabledSuccessfully');

        this.messageService.add({ severity: 'success', summary: translatedInfoSummary, life: 3000, detail: translatedMessage });
      }
      else {
        const translatedMessage = this.translateService.instant('SchoolDisabledSuccessfully');

        this.messageService.add({ severity: 'success', summary: translatedInfoSummary, life: 3000, detail: translatedMessage });
      }
      this.ngOnInit();
    });

  }

  openShareClassCourseModal(schoolName: string, name: string, type: number, description: string, image: string) {
    debugger
    var initialState: any;
    if (type == 1) {
      initialState = {
        className: name,
        schoolName: schoolName,
        title: name,
        description: description,
        image: image
      };
    }
    else {
      initialState = {
        courseName: name,
        schoolName: schoolName,
        title: name,
        description: description,
        image: image
      };
    }
    this.bsModalService.show(SharePostComponent, { initialState });
  }

  // phoneFormatter() {
  //   const phoneNumberControl = this.editSchoolForm.get('phoneNumber');
  //   let phoneNumber = phoneNumberControl?.value;

  //   if (phoneNumber.startsWith('+')) {
  //     phoneNumber = '+' + phoneNumber.substr(1).replace(/\D/g, '');
  //   } else {
  //     phoneNumber = phoneNumber.replace(/\D/g, '');
  //   }

  //   if (phoneNumber.length > 11) {
  //     phoneNumber = phoneNumber.substr(0, 11);
  //   }

  //   if (phoneNumber.length > 3) {
  //     phoneNumber = `(${phoneNumber.substr(0, 3)}) ${phoneNumber.substr(3)}`;
  //   }
  //   if (phoneNumber.length > 9) {
  //     phoneNumber = `${phoneNumber.substr(0, 9)}-${phoneNumber.substr(9)}`;
  //   }

  //   phoneNumberControl?.setValue(phoneNumber);
  // }

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
    this.uploadImage = this.croppedImage.changingThisBreaksApplicationSecurity;
    this.cropModalRef.hide();
  }

  changeCountryIsoCode(event: any) {
    debugger
    var countryName = event.value;
    this.selectedCountryISO = CountryISO[countryName as keyof typeof CountryISO];

  }

  getSelectedLanguage() {
    var selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(selectedLanguage ?? '');
    var locale = selectedLanguage == "ar" ? Arabic : selectedLanguage == "sp" ? Spanish : selectedLanguage == "tr" ? Turkish : null
    const dateOfBirthElement = this.founded.nativeElement;
    dateOfBirthElement._flatpickr.set("locale", locale);
  }

  onPhoneNumberChange(value: any) {
    debugger
    var phoneNumber = this.formatPhoneNumber(value.number);
    // this.propagateChange(this.phoneNumber);
  }

  formatPhoneNumber(value: string): string {
    debugger
    if (!value) {
      return '';
    }
    // Remove all non-digit characters
    const cleanedValue = value.replace(/\D/g, '');
    // Apply the desired format
    const areaCode = cleanedValue.slice(0, 3);
    const middlePart = cleanedValue.slice(3, 6);
    const lastPart = cleanedValue.slice(6, 10);
    return `(${areaCode}) ${middlePart}-${lastPart}`;
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
        //     var playerId = "video01" + this.counter;
        // const vjsPlayer = videojs(playerId, { autoplay: false });
        // this.cd.detectChanges();
        displayDivs[i].setAttribute("style", "display:block;");
      } else {
        displayDivs[i].setAttribute("style", "display:none;");
      }
      //elements[i].style.display = displayState;
    }

    // var playerId = "video01" + this.counter;
    // const vjsPlayer = videojs(playerId, { autoplay: false });
    // this.cd.detectChanges();
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

  get schoolEmailValue(): string {
    return this.editSchoolForm.get('schoolEmail')?.value;
  }

  formatDescription(description: string): string {
    debugger
    var result = description.replace(/\n/g, '<br/>');
    return result;
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


  // resetCertificateModal() {
  //   this.isSubmitted = false;
  //   this.addSchoolCertificate.certificates = [];
  //   this.uploadImage = null;
  //   this.schoolCertificateForm = this.fb.group({
  //     certificateName: this.fb.control('', [Validators.required]),
  //     provider: this.fb.control('', [Validators.required]),
  //     issuedDate: this.fb.control(new Date().toISOString().substring(0, 10), [Validators.required]),
  //     description: this.fb.control(''),
  //     certificateId: this.fb.control(''),
  //   });
  //   this.certificateToUpload.set('certificateImage','');
  //   flatpickr('#issuedDate',{
  //     minDate:"1903-12-31",
  //     maxDate:new Date(),
  //     dateFormat: "m/d/Y",
  //     defaultDate: new Date()
  //     });
  // }

  // handleCertificates(event: any) {
  //   this.addSchoolCertificate.certificates.push(event.target.files[0]);
  // }

  saveSchoolCertificates() {
    debugger;
    this.isSubmitted = true;
    if (!this.schoolCertificateForm.valid) {
      return;
    }
    this.loadingIcon = true;
    for (var i = 0; i < this.schoolCertificate.certificates.length; i++) {
      this.certificateToUpload.append(
        'certificates',
        this.schoolCertificate.certificates[i]
      );
    }
    this.certificateToUpload.append('userId', this.school.id);
    this._schoolService
      .saveSchoolCertificates(this.certificateToUpload)
      .subscribe((response: any) => {
        this.closeCertificatesModal();
        this.isSubmitted = false;
        // this.addSchoolCertificate.certificates = [];
        this.certificateToUpload.set('certificates', '');
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('CertificateAddedSuccessfully');
        this.messageService.add({
          severity: 'success',
          summary: translatedSummary,
          life: 3000,
          detail: translatedMessage,
        });
        this.ngOnInit();
        console.log(response);
      });
  }

  uploadImageName: string = "";
  avatarImage!: any;
  handleSchoolCertificate(event: any) {
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

  removeUploadCertificateImage() {
    this.uploadImage = null;
    this.certificateToUpload.set('certificateImage', '');
    this.avatarImage = undefined;
    this.uploadImageName = "";

  }

  saveSchoolCertificate() {
    debugger
    this.isSubmitted = true;
    if (!this.schoolCertificateForm.valid) {
      return;
    }

    if (this.uploadImage == null) {
      return;
    }

    this.loadingIcon = true;
    var formValue = this.schoolCertificateForm.value;

    //here we will add if id has
    if (formValue.certificateId != "") {
      this.certificateToUpload.append('certificateId', formValue.certificateId);
    }

    if (typeof this.uploadImage == "string") {
      this.certificateToUpload.append('certificateUrl', this.uploadImage);
    }
    this.certificateToUpload.append('schoolId', this.school.schoolId);
    this.certificateToUpload.append('certificateName', formValue.certificateName);
    this.certificateToUpload.append('provider', formValue.provider);
    this.certificateToUpload.append('issuedDate', formValue.issuedDate);
    this.certificateToUpload.append('description', formValue.description);

    // this.userCertificateForm.updateValueAndValidity();

    this._schoolService.saveSchoolCertificates(this.certificateToUpload).subscribe((response: any) => {
      debugger
      this.closeCertificatesModal();
      this.isSubmitted = false;
      this.certificateToUpload = new FormData();
      this.schoolCertificate.certificates = [];
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

  editSchoolCertificate(schoolCertificateInfo: any) {
    debugger
    // dob = dob.substring(0, dob.indexOf('T'));     

    var issuedDate = schoolCertificateInfo.issuedDate.substring(0, schoolCertificateInfo.issuedDate.indexOf('T'));
    issuedDate = this.datePipe.transform(issuedDate, 'MM/dd/yyyy');

    flatpickr('#issuedDate', {
      minDate: "1903-12-31",
      maxDate: new Date(),
      dateFormat: "m/d/Y",
      defaultDate: issuedDate
    });

    this.schoolCertificateForm = this.fb.group({
      schoolId: this.fb.control(this.school.schoolId),
      certificateName: this.fb.control(schoolCertificateInfo.certificateName, [Validators.required]),
      provider: this.fb.control(schoolCertificateInfo.provider, [Validators.required]),
      issuedDate: this.fb.control(issuedDate, [Validators.required]),
      description: this.fb.control(schoolCertificateInfo.description),
      certificateId: this.fb.control(schoolCertificateInfo.id)
    });

    this.uploadImage = schoolCertificateInfo.certificateUrl;
  }

  openSchoolCertificate(certificateInfo: any) {
    debugger
    this.certificateToUpload.set('certificateImage', '');
    this.schoolCertificateInfo = certificateInfo;
    this.openSchoolOwnCertificate.nativeElement.click();
    this.cd.detectChanges();
  }


  parseTheTags(tags:any){
    for (let index = 0; index < tags?.length; index++) {
      const element = tags[index].postTagValue;
      try{
      var reelsTags = JSON.parse(element);}
      catch{}
      return reelsTags
    }
    
  }

  cancelSchoolSubscriptionId:string = "";
  getCancelSubscriptionSchoolId(schoolId: string) {
    this.cancelSchoolSubscriptionId = schoolId;
  }

  cancelSubscription(){
    this._iyizicoService.cancelSubscription(this.cancelSchoolSubscriptionId).subscribe((response: any) => {
      debugger
      if(response.errorMessage == Constant.Success){
        var message = "Subscription cenceled successfully"
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: message });
      }
      else{
        this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: response.errorMessage });
      }
    });
  }

  renewSchoolSubscriptionId:string = "";
  getRenewSubscriptionSchoolId(schoolId: string) {
    this.renewSchoolSubscriptionId = schoolId;
  }

  renewSubscription(){
    this._iyizicoService.renewSubscription(this.renewSchoolSubscriptionId).subscribe((response: any) => {
      debugger
    });
  }

  @ViewChild('videoPlayerOnHover') videoPlayerOnHover!: ElementRef;
  playVideo(item:any) {
    const video = document.querySelector(`[src="${item.thumbnailUrl}"]`) as HTMLVideoElement;
    if (video) {
      video.play();
    }
  }

  pauseVideo(item:any) {
    const video = document.querySelector(`[src="${item.thumbnailUrl}"]`) as HTMLVideoElement;
    if (video) {
      video.pause();
    }
  }

}

