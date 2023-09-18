import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AddUserLanguage } from 'src/root/interfaces/user/addUserLanguage';
import { DeleteUserLanguage } from 'src/root/interfaces/user/deleteUserLanguage';
import { EditUserModel } from 'src/root/interfaces/user/editUserModel';
import { UserService } from 'src/root/service/user.service';
import { MultilingualComponent, changeLanguage } from '../../sharedModule/Multilingual/multilingual.component';

import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { addPostResponse, CreatePostComponent } from '../../createPost/createPost.component';
import { FollowUnFollowEnum } from 'src/root/Enums/FollowUnFollowEnum';
import { FollowUnfollow } from 'src/root/interfaces/FollowUnfollow';
import { PostService } from 'src/root/service/post.service';
import { PostViewComponent, deletePostResponse, savedPostResponse } from '../../postView/postView.component';
import { MessageService } from 'primeng/api';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { BehaviorSubject, Subject, Subscription, filter } from 'rxjs';
import { ReelsViewComponent, deleteReelResponse } from '../../reels/reelsView.component';
import { SignalrService } from 'src/root/service/signalr.service';
import { NotificationType, NotificationViewModel } from 'src/root/interfaces/notification/notificationViewModel';
import { PostAuthorTypeEnum } from 'src/root/Enums/postAuthorTypeEnum';
import { CertificateViewComponent } from '../../certificateView/certificateView.component';
import { SharePostComponent, sharedPostResponse } from '../../sharePost/sharePost.component';
import { SchoolService } from 'src/root/service/school.service';
import { ClassCourseModalComponent, savedClassCourseResponse } from '../../ClassCourseModal/classCourseModal.component';
import { LikeUnlikeClassCourse } from 'src/root/interfaces/school/likeUnlikeClassCourse';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { AuthService } from 'src/root/service/auth.service';
import { RolesEnum } from 'src/root/RolesEnum/rolesEnum';
import { deleteSchoolResponse } from '../../school/schoolProfile/schoolProfile.component';
import { deleteClassResponse } from '../../class/classProfile/classProfile.component';
import { deleteCourseResponse } from '../../course/courseProfile/courseProfile.component';
import flatpickr from 'flatpickr';
import { Arabic } from 'flatpickr/dist/l10n/ar';
import { Spanish } from 'flatpickr/dist/l10n/es';
import { Turkish } from 'flatpickr/dist/l10n/tr';
import { DatePipe } from '@angular/common';
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';
import { savedReelResponse } from '../../reelsSlider/reelsSlider.component';
import { Dimensions, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { DeleteSchoolCertificate } from 'src/root/interfaces/school/deleteSchoolCertificate';
import { DeleteUserCertificate } from 'src/root/interfaces/user/deleteUserCertificate';
import { AddUserCertificate } from 'src/root/interfaces/user/addUserCertificate';
import { defined } from 'chart.js/dist/helpers/helpers.core';
import { deleteModalPostResponse } from '../../delete-confirmation/delete-confirmation.component';
export const userImageResponse = new Subject<{ userAvatar: string, gender: number }>();
export const chatResponse = new Subject<{ receiverId: string, type: string, chatTypeId: string }>();



@Component({
  selector: 'userProfile-root',
  templateUrl: './userProfile.component.html',
  styleUrls: ['./userProfile.component.css'],
  providers: [MessageService]
})

export class UserProfileComponent extends MultilingualComponent implements OnInit {

  @BlockUI() blockUi!: NgBlockUI;

  isOpenSidebar: boolean = false;
  isDataLoaded: boolean = false;
  isSubmitted: boolean = false;
  isOpenModal: boolean = false;
  loadingIcon: boolean = false;
  postLoadingIcon: boolean = false;
  reelsLoadingIcon: boolean = false;
  blockedDocument: boolean = false;
  isProfileGrid: boolean = true;
  userId!: string;
  isFollowed!: boolean;
  likesLength!: number;
  isLiked!: boolean;
  disableSaveButton!: boolean;
  private _userService;
  private _authService;
  private _postService;
  private _signalrService;
  private _schoolService;
  user: any;
  validToken!: string;
  userLanguage!: AddUserLanguage;
  deleteLanguage!: DeleteUserLanguage;
  filteredLanguages!: any[];
  languages: any;
  EMAIL_PATTERN = '[a-zA-Z0-9]+?(\\.[a-zA-Z0-9]+)*@[a-zA-Z]+\\.[a-zA-Z]{2,3}';
  editUser: any;
  editUserForm!: FormGroup;
  languageForm!: FormGroup;
  userCertificateForm!: FormGroup;
  updateUserDetails!: EditUserModel;
  isOwner!: boolean;
  followUnfollowUser!: FollowUnfollow;
  followersLength!: number;
  likeUnlikePost!: LikeUnlikePost;
  currentLikedPostId!: string;
  postView!: PostView;
  loginUserId!: string;
  gender!: string;
  gridItemInfo: any;
  isGridItemInfo: boolean = false;
  userParamsData$: any;
  itemsPerSlide = 5;
  singleSlideOffset = true;
  noWrap = true;
  frontEndPageNumber: number = 1;
  reelsPageNumber: number = 1;
  savedPostsPageNumber: number = 1;
  sharedPostsPageNumber: number = 1;
  likedPostsPageNumber: number = 1;
  savedClassCoursePageNumber: number = 1;
  scrolled: boolean = false;
  savedPostScrolled: boolean = false;
  savedClassCourseScrolled: boolean = false;
  sharedPostsScrolled: boolean = false;
  likedPostsScrolled: boolean = false;
  scrollFeedResponseCount: number = 1;
  scrollSavedPostResponseCount: number = 1;
  scrollSharedPostResponseCount: number = 1;
  scrollLikedPostResponseCount: number = 1;
  scrollSavedClassCourseResponseCount: number = 1;
  notificationViewModel!: NotificationViewModel;
  @ViewChild('closeEditModal') closeEditModal!: ElementRef;
  @ViewChild('closeLanguageModal') closeLanguageModal!: ElementRef;
  @ViewChild('imageFile') imageFile!: ElementRef;
  @ViewChild('carousel') carousel!: ElementRef;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('createPostModal', { static: true }) createPostModal!: CreatePostComponent;
  @ViewChild('dateOfBirth') dateOfBirthRef!: ElementRef;
  @ViewChild('issuedDate') issuedDateRef!: ElementRef;
  uploadImage!: any;
  fileToUpload = new FormData();
  translate!: TranslateService;
  isSavedProfileList: boolean = false;
  savedPostsList!: any;
  sharedPostsList!: any;
  likedPostsList!: any;
  likedReelsList!: any;
  savedReelsList!: any;
  sharedReelsList!: any;
  isSavedPostList!: boolean;
  isSharedPostList!: boolean;
  isLikedPostList!: boolean;
  isSavedClassCourseList!: boolean;
  isPostTab: boolean = true;
  isSavedPostTab: boolean = false;
  isSharedPostTab: boolean = false;
  isLikedPostTab: boolean = false;
  isSavedClassCourseTab: boolean = false;
  savedPostGridInfo: any;
  sharedPostGridInfo: any;
  likedPostGridInfo: any;
  isSavedPostGridInfo: boolean = false;
  isSharedPostGridInfo: boolean = false;
  isLikedPostGridInfo: boolean = false;
  savedClassCourseGridInfo: any;
  isSavedClassCourseGridInfo: boolean = false;
  savedClassCourseList!: any;
  saveClassCoursePageNumber: number = 1;
  currentLikedClassCourseId!: string;
  isClassCourseLiked!: boolean;
  likesClassCourseLength!: number;
  likeUnlikeClassCourses!: LikeUnlikeClassCourse;
  schoolId!: string;
  isSavedMessageAlready: boolean = true;
  savedPostSubscription!: Subscription;
  savedReelSubscription!: Subscription;
  addPostSubscription!: Subscription;
  changeLanguageSubscription!: Subscription;
  sharedPostSubscription!: Subscription;
  savedClassCourseSubscription!: Subscription;
  // addTeacherSubscription!:Subscription;
  isOnInitInitialize: boolean = false;
  savedMessage!: string;
  removedMessage!: string;
  deletePostSubscription!: Subscription;
  deleteReelSubscription!: Subscription;
  // deleteSchoolSubscription!: Subscription;
  // deleteClassSubscription!: Subscription;
  // deleteCourseSubscription!: Subscription;
  previousRoute!: any;
  filteredAttachments: any[] = [];
  filteredSavedPostAttachments!: any;
  userAvatar: string = '';
  countries: any;
  cities: any;
  states: any;
  requiredCountry: any;


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
  deleteCertificate!: DeleteUserCertificate;
  userCertificate!: AddUserCertificate;
  certificateForm!: FormGroup;
  certificateToUpload = new FormData();
  userCertificateInfo: any;
  @ViewChild('closeCertificateModal') closeCertificateModal!: ElementRef;

  @ViewChild('hiddenButton') hiddenButtonRef!: ElementRef;
  @ViewChild('openUserOwnCertificate') openUserOwnCertificate!: ElementRef;

  isBanFollower!: boolean;
  deleteModalPostSubscription!:Subscription;



  constructor(injector: Injector, private translateService: TranslateService, private titleService: Title, private meta: Meta, private datePipe: DatePipe, authService: AuthService, signalrservice: SignalrService, public messageService: MessageService, private bsModalService: BsModalService, userService: UserService, postService: PostService, private route: ActivatedRoute, private domSanitizer: DomSanitizer, private fb: FormBuilder, private router: Router, private http: HttpClient, private activatedRoute: ActivatedRoute, private cd: ChangeDetectorRef, private schoolService: SchoolService) {
    super(injector);
    this._userService = userService;
    this._authService = authService;
    this._postService = postService;
    this._schoolService = schoolService;
    this._signalrService = signalrservice;

    this.userParamsData$ = this.route.params.subscribe((routeParams) => {
      this.userId = routeParams.schoolName;
      if (!this.loadingIcon && this.isOnInitInitialize) {
        this.ngOnInit();
      }
    });
  }

  ngOnInit(): void {
    debugger
    document.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      const contextMenu = document.querySelector('.context-menu');
  const saveAsOption = contextMenu?.querySelector('.save-as');
  if (saveAsOption) {
    saveAsOption.remove();
  }
  });
    this.checkScreenSize();
    if(this.isScreenMobile){
      this.itemsPerSlide = 2;
      this.profileGrid();
    }
    this.isOnInitInitialize = true;
    this.postLoadingIcon = false;
    if (this._authService.roleUser(RolesEnum.SchoolAdmin)) {
      this._authService.loginState$.next(false);
      this._authService.loginAdminState$.next(true);
    }
    else {
      this._authService.loginState$.next(true);
    }
    this.validToken = localStorage.getItem("jwt") ?? '';
    this.loadingIcon = true;
    var selectedLang = localStorage.getItem("selectedLanguage");
    this.translate.use(selectedLang ?? '');
    var id = this.route.snapshot.paramMap.get('userId');
    this.userId = id ?? '';

    this._userService.getUserById(this.userId).subscribe((response) => {
      debugger
      this.frontEndPageNumber = 1;
      this.reelsPageNumber = 1;
      this.user = response;
      this.titleService.setTitle(this.user.firstName + " " + this.user.lastName);
      this.addDescriptionMetaTag(this.user.description);
      this.followersLength = this.user.followers.length;
      this.isOwnerOrNot();
      this.loadingIcon = false;
      this.scrolled = false;
      this.postLoadingIcon = false;
      this.isDataLoaded = true;
      this.cd.detectChanges();
      this.addEventListnerOnCarousel();
      this.user.posts = this.getFilteredAttachments(this.user.posts);
    });

    this._userService.getLanguageList().subscribe((response) => {
      this.languages = response;
    });

    this.userLanguage = {
      userId: '',
      languageIds: []
    };

    this.languageForm = this.fb.group({
      languages: this.fb.control([], [Validators.required]),
    });

    this.deleteLanguage = {
      userId: '',
      languageId: ''
    };

    this.editUserForm = this.fb.group({
      firstName: this.fb.control(''),
      lastName: this.fb.control(''),
      dob: this.fb.control(new Date().toISOString().substring(0, 10)),
      gender: this.fb.control(''),
      description: this.fb.control(''),
      contactEmail: this.fb.control(''),
      country: this.fb.control(''),
      state: this.fb.control('')
    });

    this.InitializeFollowUnfollowUser();
    this.InitializeLikeUnlikePost();
    this.InitializePostView();

    userImageResponse.subscribe(response => {
      this.user.avatar = response.userAvatar;
    });

    if (!this.addPostSubscription) {
      this.addPostSubscription = addPostResponse.subscribe((postResponse: any) => {
        debugger
        // this.loadingIcon = true;
        // if(postResponse.response.postType == 1){
        //   var translatedMessage = this.translateService.instant('PostCreatedSuccessfully');
        // }
        // else if(postResponse.response.postType == 3){
        //   var translatedMessage = this.translateService.instant('ReelCreatedSuccessfully');
        // }
        // else{
        //   var translatedMessage = this.translateService.instant('PostUpdatedSuccessfully');
        // }
        // const translatedSummary = this.translateService.instant('Success');
        // this.messageService.add({severity:'success', summary:translatedSummary,life: 3000, detail:translatedMessage});
        this._userService.getUserById(this.userId).subscribe((response) => {
          debugger
          this.user = response;
          this.titleService.setTitle(this.user.firstName + " " + this.user.lastName);
          this.addDescriptionMetaTag(this.user.description);
          this.cd.detectChanges();
          this.followersLength = this.user.followers.length;
          this.isOwnerOrNot();
          this.loadingIcon = false;
          this.isDataLoaded = true;
          this.scrolled = false;
          this.postLoadingIcon = false;
          this.cd.detectChanges();
          this.addEventListnerOnCarousel();
          this.user.posts = this.getFilteredAttachments(this.user.posts);
          //this.showPostDiv(postResponse.response);
        });
      });
    }

    if (!this.savedPostSubscription) {
      this.savedPostSubscription = savedPostResponse.subscribe(response => {
        if (response.isPostSaved) {
          const translatedMessage = this.translateService.instant('PostSavedSuccessfully');
          const translatedSummary = this.translateService.instant('Success');
          this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        }
        if (!response.isPostSaved) {
          const translatedMessage = this.translateService.instant('PostRemovedSuccessfully');
          const translatedSummary = this.translateService.instant('Success');
          this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
          if (this.savedPostsList != undefined) {
            var isSavedPost = this.savedPostsList.find((x: { id: any; }) => x.id == response.postId);
            let indexToRemove = this.savedPostsList.findIndex((x: { id: any; }) => x.id == isSavedPost.id);
            if (indexToRemove !== -1) {
              this.savedPostsList.splice(indexToRemove, 1);
            }
          }
        }
      });
    }

    if (!this.savedReelSubscription) {
      this.savedReelSubscription = savedReelResponse.subscribe(response => {
        if (response.isReelSaved) {
          const translatedMessage = this.translateService.instant('ReelSavedSuccessfully');
          const translatedSummary = this.translateService.instant('Success');
          this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        }
        if (!response.isReelSaved) {
          const translatedMessage = this.translateService.instant('ReelRemovedSuccessfully');
          const translatedSummary = this.translateService.instant('Success');
          this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
          if (this.savedReelsList != undefined) {
            var isSavedReel = this.savedReelsList.find((x: { id: any; }) => x.id == response.id);
            let indexToRemove = this.savedReelsList.findIndex((x: { id: any; }) => x.id == isSavedReel.id);
            if (indexToRemove !== -1) {
              this.savedReelsList.splice(indexToRemove, 1);
            }
          }
        }
      });
    }

    this.sharedPostSubscription = sharedPostResponse.subscribe(response => {
      if (response.postType == 1) {
        const translatedMessage = this.translateService.instant('PostSharedSuccessfully');
        const translatedSummary = this.translateService.instant('Success');
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        var post = this.user.posts.find((x: { id: string; }) => x.id == response.postId);
        if (post == undefined || null) {
          var post = this.savedPostsList.find((x: { id: string; }) => x.id == response.postId);
          post.postSharedCount++;
        }
        else {
          post.postSharedCount++;
        }
      }
      else {
        const translatedMessage = this.translateService.instant('ReelSharedSuccessfully');
        const translatedSummary = this.translateService.instant('Success');
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
        if (response.isSaved) {
          this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: `${response.type} saved successfully` });
        }
        if (!response.isSaved) {
          this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: `${response.type} removed successfully` });
          if (this.savedClassCourseList != undefined) {
            var isSavedClassCourse = this.savedClassCourseList.find((x: { id: any; }) => x.id == response.id);
            let indexToRemove = this.savedClassCourseList.findIndex((x: { id: any; }) => x.id == isSavedClassCourse.id);
            if (indexToRemove !== -1) {
              this.savedClassCourseList.splice(indexToRemove, 1);
            }
          }
        }
      });
    }

    if (!this.deletePostSubscription) {
      this.deletePostSubscription = deletePostResponse.subscribe(response => {
        const translatedMessage = this.translateService.instant('PostDeletedSuccessfully');
        const translatedSummary = this.translateService.instant('Success');
        this.isGridItemInfo = false;
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        var deletedPost = this.user.posts.find((x: { id: string; }) => x.id == response.postId);
        const index = this.user.posts.indexOf(deletedPost);
        if (index > -1) {
          this.user.posts.splice(index, 1);
        }
      });
    }

    if (!this.deleteReelSubscription) {
      this.deleteReelSubscription = deleteReelResponse.subscribe(response => {
        const translatedMessage = this.translateService.instant('ReelDeletedSuccessfully');
        const translatedSummary = this.translateService.instant('Success');
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        var deletedPost = this.user.reels.find((x: { id: string; }) => x.id == response.postId);
        const index = this.user.reels.indexOf(deletedPost);
        if (index > -1) {
          this.user.reels.splice(index, 1);
        }
      });
    }

    this.deleteCertificate = {
      userId: '',
      certificateId: '',
    };

    this.userCertificate = {
      userId: '',
      certificates: [],
    };

    this.certificateForm = this.fb.group({
      certificates: this.fb.control([], [Validators.required]),
    });

    this.userCertificateForm = this.fb.group({
      certificateName: this.fb.control('', [Validators.required]),
      provider: this.fb.control('', [Validators.required]),
      issuedDate: this.fb.control(new Date().toISOString().substring(0, 10), [Validators.required]),
      description: this.fb.control(''),
      certificateId: this.fb.control(''),
    });


    const buttons = document.querySelectorAll(".videoChange");
    buttons.forEach(button => {
      debugger;
      button.addEventListener("click", () => {
        let VideoElement:HTMLVideoElement | null = document.getElementById('displayVideo') as HTMLVideoElement
        VideoElement.pause();
      });
    });


    if(!this.deleteModalPostSubscription){
      this.deleteModalPostSubscription = deleteModalPostResponse.subscribe(response =>{
        this.ngOnInit();
      })
    }
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

  getByUserId() {
    if (this.userId == undefined) {
      this.postLoadingIcon = true;
      return;
    }
    this._userService.getPostsByUserId(this.userId, this.frontEndPageNumber).subscribe((response) => {
      debugger;
      var result = this.getFilteredAttachments(response);
      this.user.posts = [...this.user.posts, ...result];
      this.postLoadingIcon = false;
      this.scrollFeedResponseCount = response.length;
      this.scrolled = false;
    });
  }

  openSidebar() {
    OpenSideBar.next({ isOpenSideBar: true })
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
    if (this.userParamsData$) {
      this.userParamsData$.unsubscribe();
    }
    if (this.deleteModalPostSubscription) {
      this.deleteModalPostSubscription.unsubscribe();
    }
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    const windowSize = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;
    if (!this.loadingIcon) {
      if (scrollPosition >= bodyHeight - windowSize) {
        if (this.isPostTab) {
          if (!this.scrolled && this.scrollFeedResponseCount != 0) {
            this.scrolled = true;
            this.postLoadingIcon = true;
            this.frontEndPageNumber++;
            this.getByUserId();
          }
        }
        if (this.isSavedPostTab) {
          if (!this.savedPostScrolled && this.scrollSavedPostResponseCount != 0) {
            this.savedPostScrolled = true;
            this.postLoadingIcon = true;
            this.savedPostsPageNumber++;
            this.getNextSavedPosts();
          }
        }
        if (this.isSharedPostTab) {
          if (!this.sharedPostsScrolled && this.scrollSharedPostResponseCount != 0) {
            this.sharedPostsScrolled = true;
            this.postLoadingIcon = true;
            this.sharedPostsPageNumber++;
            this.getNextSharedPosts();
          }
        }
        if (this.isLikedPostTab) {
          if (!this.likedPostsScrolled && this.scrollLikedPostResponseCount != 0) {
            this.likedPostsScrolled = true;
            this.postLoadingIcon = true;
            this.likedPostsPageNumber++;
            this.getNextLikedPosts();
          }
        }
        if (this.isSavedClassCourseTab) {
          if (!this.savedClassCourseScrolled && this.scrollSavedClassCourseResponseCount != 0) {
            this.savedClassCourseScrolled = true;
            this.postLoadingIcon = true;
            this.saveClassCoursePageNumber++;
            this.getNextSavedClassCourse();
          }
        }
      }
    }
  }

  getNextSavedPosts() {
    this._postService.getSavedPostsByUser(this.userId, this.savedPostsPageNumber, 1).subscribe((response) => {
      this.savedPostsList = [...this.savedPostsList, ...response];
      this.postLoadingIcon = false;
      this.scrollSavedPostResponseCount = response.length;
      this.savedPostScrolled = false;
    });
  }

  getNextSharedPosts() {
    this._postService.getSharedPostsByUser(this.userId, this.sharedPostsPageNumber, 1).subscribe((response) => {
      this.sharedPostsList = [...this.sharedPostsList, ...response];
      this.postLoadingIcon = false;
      this.scrollSharedPostResponseCount = response.length;
      this.sharedPostsScrolled = false;
    });
  }

  getNextLikedPosts() {
    this._postService.getLikedPostsByUser(this.userId, this.likedPostsPageNumber, 1).subscribe((response) => {
      this.likedPostsList = [...this.likedPostsList, ...response];
      this.postLoadingIcon = false;
      this.scrollLikedPostResponseCount = response.length;
      this.likedPostsScrolled = false;
    });
  }

  getNextSavedClassCourse() {
    this._schoolService.getSavedClassCourse(this.userId, this.saveClassCoursePageNumber).subscribe((response) => {
      this.savedClassCourseList = [...this.savedClassCourseList, ...response];
      this.postLoadingIcon = false;
      this.scrollSavedClassCourseResponseCount = response.length;
      this.savedClassCourseScrolled = false;
    });
  }

  addEventListnerOnCarousel() {
    if (this.carousel != undefined) {
      if ($('carousel')[0].querySelectorAll('a.carousel-control-next')[0]) {
        $('carousel')[0].querySelectorAll('a.carousel-control-next')[0].addEventListener('click', () => {
          debugger
          this.reelsPageNumber++;
          if (this.reelsPageNumber == 2) {
            this.reelsLoadingIcon = true;
          }
          if (this.isPostTab) {
            this._userService.getReelsByUserId(this.user.id, this.reelsPageNumber).subscribe((response) => {
              this.user.reels = [...this.user.reels, ...response];
              this.reelsLoadingIcon = false;
            });
          }

          if (this.isSavedPostTab) {
            this._postService.getSavedPostsByUser(this.user.id, this.reelsPageNumber, 3).subscribe((response) => {
              this.savedReelsList = [...this.savedReelsList, ...response];
              this.reelsLoadingIcon = false;
            });
          }

          if (this.isSharedPostTab) {
            this._postService.getSharedPostsByUser(this.user.id, this.reelsPageNumber, 3).subscribe((response) => {
              this.sharedReelsList = [...this.sharedReelsList, ...response];
              this.reelsLoadingIcon = false;
            });
          }

          if (this.isLikedPostTab) {
            this._postService.getLikedPostsByUser(this.user.id, this.reelsPageNumber, 3).subscribe((response) => {
              this.likedReelsList = [...this.likedReelsList, ...response];
              this.reelsLoadingIcon = false;
            });
          }

        })
      }
    }
  }

  InitializeFollowUnfollowUser() {
    this.followUnfollowUser = {
      id: '',
      isFollowed: false
    };
  }

  InitializePostView() {
    this.postView = {
      postId: '',
      userId: ''
    };
  }

  InitializeLikeUnlikePost() {
    this.likeUnlikePost = {
      postId: '',
      userId: '',
      isLike: false,
      commentId: ''
    };

  }

  isOwnerOrNot() {
    debugger
    var validToken = localStorage.getItem("jwt");
    if (validToken != null) {
      let jwtData = validToken.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.loginUserId = decodedJwtData.jti;
      if (this.gender == undefined) {
        localStorage.setItem('gender', decodedJwtData.gender);


        this.gender = decodedJwtData.gender;
      }
      if (decodedJwtData.sub == this.user.email) {
        this.isOwner = true;
      }
      else {
        this.isOwner = false;


        this._userService.isFollowerBan(this.loginUserId, this.user.id).subscribe((response: any) => {
          debugger
          // this.isBanFollower = response.
        });
        this.isFollowedOwnerOrNot(decodedJwtData.jti);
      }
    }
  }

  isFollowedOwnerOrNot(userId: string) {
    var followers: any[] = this.user.followers;
    var isFollowed = followers.filter(x => x.followerId == userId);
    if (isFollowed.length != 0) {
      this.isFollowed = true;
    }
    else {
      this.isFollowed = false;
    }
  }

  captureLanguageId(event: any) {
    var languageId = event.id;
    this.userLanguage.languageIds.push(languageId);
  }

  filterLanguages(event: any) {

    var userLanguages: any[] = this.user.languages;
    var languages: any[] = this.languages;
    this.languages = languages.filter(x => !userLanguages.find(y => y.id == x.id));

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

  saveUserLanguages() {

    this.isSubmitted = true;
    if (!this.languageForm.valid) {
      return;
    }
    this.loadingIcon = true;
    this.userLanguage.userId = this.user.id;
    this._userService.saveUserLanguages(this.userLanguage).subscribe((response: any) => {
      const translatedMessage = this.translateService.instant('LanguageAddedSuccessfully');
      const translatedSummary = this.translateService.instant('Success');
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
      this.closeLanguagesModal();
      this.isSubmitted = true;
      this.ngOnInit();

    });
  }

  deleteUserLanguage() {
    this.loadingIcon = true;
    this.deleteLanguage.userId = this.user.id;
    this._userService.deleteUserLanguage(this.deleteLanguage).subscribe((response: any) => {
      const translatedMessage = this.translateService.instant('LanguageDeletedSuccessfully');
      const translatedSummary = this.translateService.instant('Success');
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
      this.ngOnInit();
    });
  }

  getDeletedLanguage(deletedLanguage: string) {
    this.deleteLanguage.languageId = deletedLanguage;
  }

  followUser(userId: string, from: string) {
    debugger;
    if (this.validToken == '') {
      window.open('user/auth/login', '_blank');
    }
    else {
      this.followUnfollowUser.id = userId;
      if (from == FollowUnFollowEnum.Follow) {
        this.followersLength += 1;
        this.isFollowed = true;
        this.followUnfollowUser.isFollowed = true;
        var notificationContent = "followed you"
        var postId = '00000000-0000-0000-0000-000000000000';
        var post = null;
        this.initializeNotificationViewModel(userId, NotificationType.Followings, notificationContent, postId);
      }
      else {
        this.followersLength -= 1;
        this.isFollowed = false;
        this.followUnfollowUser.isFollowed = false;
      }
      this._userService.saveUserFollower(this.followUnfollowUser).subscribe((response) => {
        this.InitializeFollowUnfollowUser();
      });
    }
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

  getUserDetails(userId: string) {
    this._userService.getUserEditDetails(userId).subscribe((response) => {
      this.editUser = response;
      this.userAvatar = this.editUser.avatar;
      this.initializeEditFormControls();
    })
  }

  initializeEditFormControls() {
    debugger
    this.uploadImage = '';
    this.imageFile.nativeElement.value = "";
    this.fileToUpload.set('avatarImage', '');

    var dob = this.editUser.dob;
    if (dob != null) {
      dob = dob.substring(0, dob.indexOf('T'));
      dob = this.datePipe.transform(dob, 'MM/dd/yyyy');
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    flatpickr('#date_of_birth', {
      minDate: "1903-12-31",
      maxDate: new Date(),
      dateFormat: "m/d/Y",
      defaultDate: dob
    });

    this._userService.getCountryList().subscribe((response) => {
      debugger
      this.countries = response;
      this._userService.getStateList(this.user.countryName).subscribe((response) => {
        this.states = response;
        this.requiredCountry = this.countries.find((x: { countryName: string; }) => x.countryName == this.user.countryName);
        // var requiredCity = this.cities.find((x: { cityName: string; }) => x.cityName == this.user.cityName);
        this.editUserForm = this.fb.group({
          firstName: this.fb.control(this.editUser.firstName, [Validators.required]),
          lastName: this.fb.control(this.editUser.lastName, [Validators.required]),
          dob: this.fb.control(dob, [Validators.required]),
          gender: this.fb.control(this.editUser.gender, [Validators.required]),
          description: this.fb.control(this.editUser.description ?? ''),
          contactEmail: this.fb.control(this.editUser.contactEmail ?? '', [Validators.pattern(this.EMAIL_PATTERN)]),
          country: this.fb.control(this.requiredCountry.countryName),
          state: this.fb.control(this.user.stateName)

        });
        this.editUserForm.updateValueAndValidity();
      });
    });


    // this.editUserForm = this.fb.group({
    //   firstName: this.fb.control(this.editUser.firstName,[Validators.required]),
    //   lastName: this.fb.control(this.editUser.lastName,[Validators.required]),
    //   dob: this.fb.control(dob,[Validators.required]),
    //   gender: this.fb.control(this.editUser.gender,[Validators.required]),
    //   description: this.fb.control(this.editUser.description??''),
    //   contactEmail: this.fb.control(this.editUser.contactEmail??'',[Validators.pattern(this.EMAIL_PATTERN)])
    // });
    // this.editUserForm.updateValueAndValidity();
  }

  handleImageInput(event: any) {
    this.disableSaveButton = true;
    this.fileToUpload.append("avatarImage", event.target.files[0], event.target.files[0].name);
    this.cd.detectChanges();
    const reader = new FileReader();
    reader.onload = (_event) => {
      this.uploadImage = _event.target?.result;
      this.uploadImage = this.domSanitizer.bypassSecurityTrustUrl(this.uploadImage);
      this.disableSaveButton = false;
      this.cd.detectChanges();
    }
    reader.readAsDataURL(event.target.files[0]);
  }

  updateUser() {
    debugger
    this.isSubmitted = true;
    if (!this.editUserForm.valid) {
      return;
    }
    this.loadingIcon = true;
    if (!this.uploadImage) {
      this.fileToUpload.append('avatar', this.userAvatar);

    }
    this.fileToUpload.append("avatarImage", this.selectedImage);

    this.updateUserDetails = this.editUserForm.value;
    this.fileToUpload.append('id', this.user.id);
    this.fileToUpload.append('firstName', this.updateUserDetails.firstName);
    this.fileToUpload.append('lastName', this.updateUserDetails.lastName);
    this.fileToUpload.append('dob', this.updateUserDetails.dob);
    this.fileToUpload.append('gender', this.updateUserDetails.gender.toString());
    this.fileToUpload.append('description', this.updateUserDetails.description);
    this.fileToUpload.append('contactEmail', this.updateUserDetails.contactEmail);
    this.fileToUpload.append('countryName', this.updateUserDetails.country);
    this.fileToUpload.append('stateName', this.updateUserDetails.state);

    // this.user.countryName = this.updateUserDetails.country;
    // this.user.cityName = this.updateUserDetails.city;
    this._userService.editUser(this.fileToUpload).subscribe((response: any) => {
      debugger
      this.closeModal();
      this.isSubmitted = true;
      this.user.avatar = response.avatar;
      userImageResponse.next({ userAvatar: response.avatar, gender: response.gender });
      this.fileToUpload = new FormData();

      const translatedMessage = this.translateService.instant('ProfileUpdatedSuccessfully');
      const translatedSummary = this.translateService.instant('Success');
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
      var gender = localStorage.getItem('gender');
      gender = this.updateUserDetails.gender.toString();
      localStorage.setItem('gender', gender);
      this.gender = gender;
      this.ngOnInit();
    });

  }

  private closeModal(): void {
    this.closeEditModal.nativeElement.click();
  }

  private closeLanguagesModal(): void {
    this.closeLanguageModal.nativeElement.click();
  }

  omit_special_char(event: any) {
    var k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32) && !(k >= 48 && k <= 57);
  }

  removeLanguage(event: any) {
    const languageIndex = this.userLanguage.languageIds.findIndex((item) => item === event.id);
    if (languageIndex > -1) {
      this.userLanguage.languageIds.splice(languageIndex, 1);
    }
  }

  resetLanguageModal() {
    this.isSubmitted = false;
    this.userLanguage.languageIds = [];
    this.languageForm.setValue({
      languages: [],
    });
  }

  createPost() {
    this.isOpenModal = true;

  }

  blockUI() {
    this.blockUi.start("Loading");
  }

  unblockUI() {
    this.blockUi.stop();
  }

  profileGrid() {
    this.isProfileGrid = true;

  }

  profileList() {
    this.isProfileGrid = false;
    this.isGridItemInfo = true;
    this.cd.detectChanges();
    if (this.videoPlayer != undefined) {
      // videojs(this.videoPlayer.nativeElement, {autoplay: false});
    }
  }

  savePostGrid() {
    this.isSavedPostList = true;

  }

  savePostList() {
    this.isSavedPostList = false;

  }

  sharePostGrid() {
    this.isSharedPostList = true;

  }

  sharePostList() {
    this.isSharedPostList = false;

  }

  likePostGrid() {
    this.isLikedPostList = true;

  }

  likePostList() {
    this.isLikedPostList = false;

  }

  saveClassCourseGrid() {
    this.isSavedClassCourseList = true;

  }

  saveClassCourseList() {
    this.isSavedClassCourseList = false;

  }

  back(): void {
    window.history.back();
  }

  openPostModal(isLiveTabOpen?: boolean): void {
    const initialState = {
      userId: this.user.id,
      from: "user",
      isLiveTabOpen: isLiveTabOpen
    };
    this.bsModalService.show(CreatePostComponent, { initialState });
  }

  pinUnpinPost(attachmentId: string, isPinned: boolean, type?: number) {
    if (this.isPostTab) {
      this._postService.pinUnpinPost(attachmentId, isPinned).subscribe((response) => {
        this.ngOnInit();
      });
    }

    if (this.isSavedPostTab) {
      this._postService.pinUnpinSavedPost(attachmentId, isPinned).subscribe((response) => {
        this.GetSavedPostsByUser(this.user.id, this.isSavedPostList);
      });
    }

    if (this.isSharedPostTab) {
      this._postService.pinUnpinSharedPost(attachmentId, isPinned).subscribe((response) => {
        this.getSharedPostsByUser(this.user.id, this.isSharedPostList);
      });
    }

    if (this.isLikedPostTab) {
      this._postService.pinUnpinLikedPost(attachmentId, isPinned).subscribe((response) => {
        this.getLikedPostsByUser(this.user.id, this.isLikedPostList);
      });
    }

    if (this.isSavedClassCourseTab) {
      if (type != undefined) {
        this._postService.pinUnpinSavedClassCourse(attachmentId, isPinned, type).subscribe((response) => {
          this.GetSavedClassCourseByUser(this.user.id, this.isSavedClassCourseList);
        });
      }
    }

  }


  openPostsViewModal(posts: any): void {
    if (posts.isLive) {
      localStorage.setItem("urlBeforeLiveStream",window.location.href)
      this._postService.openLiveStream(posts, this.loginUserId).subscribe((response) => {
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

  openReelsViewModal(postAttachmentId: string, postId: string): void {
    debugger
    const screenWidthThreshold = 768;
    const isMobileOrTab = window.innerWidth < screenWidthThreshold;
    // if (isMobileOrTab) {
    // this.router.navigateByUrl(`user/reelsView/${this.user.id}/user/${postAttachmentId}`);
    this.router.navigate(
      [`user/reelsView/${this.user.id}/user/${postAttachmentId}/${postId}`],
      { state: { post: { postId: postId } } });

    //   } else {
    //   const initialState = {
    //     postAttachmentId: postAttachmentId
    //   };
    //   this.bsModalService.show(ReelsViewComponent,{initialState});
    // }
  }

  userChat() {
    if (this.validToken == '') {
      window.open('user/auth/login', '_blank');
    }
    else {
      window.location.href = `user/chat`;
    }
  }

  likeUnlikePosts(postId: string, isLike: boolean, postType: number, post: any, from: number) {
    this.currentLikedPostId = postId;
    if (this.isPostTab) {
      var posts = this.user.posts;
    }
    if (this.isSavedPostTab) {
      var posts = this.savedPostsList;
    }
    if (this.isSharedPostTab) {
      var posts = this.sharedPostsList;
    }
    if (this.isLikedPostTab) {
      var posts = this.likedPostsList;
    }
    posts.filter((p: any) => p.id == postId).forEach((item: any) => {
      var likes: any[] = item.likes;
      var isLiked = likes.filter(x => x.userId == this.loginUserId && x.postId == postId);
      if (isLiked.length != 0) {
        this.isLiked = false;
        this.likesLength = item.likes.length - 1;
        item.isPostLikedByCurrentUser = false;
      }
      else {
        this.isLiked = true;
        this.likesLength = item.likes.length + 1;
        item.isPostLikedByCurrentUser = true;
        var notificationType = NotificationType.Likes;
        var notificationContent = "liked your post";
        this.initializeNotificationViewModel(post.createdBy, notificationType, notificationContent, postId, postType, post);
      }
    });


    this.likeUnlikePost.postId = postId;
    this.likeUnlikePost.isLike = isLike;
    this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
    this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
      if (this.isPostTab) {
        this.user.posts.filter((p: any) => p.id == postId).forEach((item: any) => {
          item.likes = response;
        });
      }
      if (this.isSavedPostTab) {
        this.savedPostsList.filter((p: any) => p.id == postId).forEach((item: any) => {
          item.likes = response;
        });
      }
      if (this.isSharedPostTab) {
        this.sharedPostsList.filter((p: any) => p.id == postId).forEach((item: any) => {
          item.likes = response;
        });
      }
      if (this.isLikedPostTab) {
        this.likedPostsList.filter((p: any) => p.id == postId).forEach((item: any) => {
          item.likes = response;
        });
      }
      this.InitializeLikeUnlikePost();
      console.log("succes");
    });
  }

  showPostDiv(post: any) {
    debugger
    $('.imgDisplay').attr("style", "display:none;")
    $('.' + post.id).prevAll('.imgDisplay').first().attr("style", "display:block;");
    // if(post.postAttachments != undefined){
    //   var postAttach = post.postAttachments[0];
    //   debugger
    //   if(postAttach != undefined){
    //     if(postAttach.fileType != 1){
    //         try{
    //           videojs(postAttach.id);
    //         } catch{
    //         }
    //     }
    //   }
    // }
    // if(post.id != undefined){
    //   videojs(post.id);
    // }
    //var posts: any[] = this.user.posts;
    this.gridItemInfo = post;//posts.find(x => x.id == postId);
    if (this.gridItemInfo.isLive) {
      this.isGridItemInfo = true;
      this._postService.openLiveStream(this.gridItemInfo, this.loginUserId).subscribe((response) => {
      });
    }
    else {
      this.isGridItemInfo = true;
      this.cd.detectChanges();
      if (this.videoPlayer != undefined) {
        // videojs(this.videoPlayer.nativeElement, {autoplay: false});
      }

      this.addPostView(this.gridItemInfo.id);
    }
    var postValueTag = this.gridItemInfo.postTags[0].postTagValue;
    this.postsTagValues = JSON.parse(postValueTag);
  }
  postsTagValues: any;

  checkIfIntro(e: any) {
    var isIntro = e.classList.contains('intro');
    // var initVideo = e.classList.contains('initVideo');
    // if(isIntro && !initVideo){
    //   var id = `#${this.gridItemInfo.postAttachments[0].id}`;
    //   var videoElement = $(id);
    //   if(videoElement != null){
    //     e.classList.add("initVideo");
    //     this.intializeVideoJs();
    //   }

    // }
    return isIntro;
  }

  intializeVideoJs() {
    var post = this.gridItemInfo;
    if (post.postAttachments != undefined) {
      var postAttach = post.postAttachments[0];
      if (postAttach != undefined) {
        if (postAttach.fileType != 1) {
          try {
            // videojs(postAttach.id);
          } catch {
          }
        }
      }
    }
    return true;
  }

  showSavedPostDiv(postId: string) {
    var posts: any[] = this.savedPostsList;
    this.savedPostGridInfo = posts.find(x => x.id == postId);
    this.isSavedPostGridInfo = true;
    this.addPostView(this.savedPostGridInfo.id);
  }

  showSharedPostDiv(postId: string) {
    var posts: any[] = this.sharedPostsList;
    this.sharedPostGridInfo = posts.find(x => x.id == postId);
    this.isSharedPostGridInfo = true;
    this.addPostView(this.sharedPostGridInfo.id);
  }

  showLikedPostDiv(postId: string) {
    var posts: any[] = this.likedPostsList;
    this.likedPostGridInfo = posts.find(x => x.id == postId);
    this.isLikedPostGridInfo = true;
    this.addPostView(this.likedPostGridInfo.id);
  }

  showSavedClassCourseDiv(id: string) {
    var classCourses: any[] = this.savedClassCourseList;
    this.savedClassCourseGridInfo = classCourses.find(x => x.id == id);
    this.isSavedClassCourseGridInfo = true;
  }

  addPostView(postId: string) {

    if (this.loginUserId != undefined) {
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

  hideSavedPostGridInfo() {
    this.isSavedPostGridInfo = this.isSavedPostGridInfo ? false : true;
  }

  hideSharedPostGridInfo() {
    this.isSharedPostGridInfo = this.isSharedPostGridInfo ? false : true;
  }

  hideLikedPostGridInfo() {
    this.isLikedPostGridInfo = this.isLikedPostGridInfo ? false : true;
  }

  hideSavedClassCourseGridInfo() {
    this.isSavedClassCourseGridInfo = this.isSavedClassCourseGridInfo ? false : true;
  }

  openChat(userId: string, type: string) {
    var chatTypeId = ''
    this.router.navigate(
      [`user/chats`],
      { state: { chatHead: { receiverId: userId, type: type, chatTypeId: '' } } });
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

  openSharePostModal(postId: string, postType: number): void {
    const initialState = {
      postId: postId,
      postType: postType
    };
    this.bsModalService.show(SharePostComponent, { initialState });
  }

  GetSavedPostsByUser(userId: string, isSavedPostList?: boolean) {
    this.loadingIcon = true;
    this.isPostTab = false;
    this.isSavedClassCourseTab = false;
    this.isSharedPostTab = false;
    this.isLikedPostTab = false;
    this.isSavedPostTab = true;
    if (isSavedPostList != undefined) {
      this.isSavedPostList = isSavedPostList;
    }
    else {
      this.isSavedPostList = true;
    }
    this.savedPostsPageNumber = 1;
    this.reelsPageNumber = 1;
    this._postService.getSavedPostsByUser(userId, this.savedPostsPageNumber, 1).subscribe((response) => {
      this.savedPostsList = response;
      const allAttachments = this.savedPostsList.flatMap((x: { postAttachments: any; }) => x.postAttachments);
      this.filteredSavedPostAttachments = allAttachments.filter((x: { fileType: number; }) => x.fileType == 3);
      this.savedPostsList = this.savedPostsList.map((post: { postAttachments: any[]; }) => {
        const filteredPostAttachments = post.postAttachments.filter(x => x.fileType != 3);
        return { ...post, postAttachments: filteredPostAttachments };
      });
      this.loadingIcon = false;
    });

    this._postService.getSavedPostsByUser(userId, this.savedPostsPageNumber, 3).subscribe((response) => {
      this.savedReelsList = response;
      this.cd.detectChanges();
      this.addEventListnerOnCarousel();
    });

  }

  isPostsTab() {
    this.isPostTab = true;
    this.isSavedPostTab = false;
    this.isSavedClassCourseTab = false;
    this.reelsPageNumber = 1;
    this.cd.detectChanges();
    this.addEventListnerOnCarousel();
  }

  savePost(postId: string, from: number) {
    if (this.isPostTab) {
      var posts: any[] = this.user.posts;
      var isSavedPost = posts.find(x => x.id == postId);
    }
    if (this.isSavedPostTab) {
      var posts: any[] = this.savedPostsList;
      var isSavedPost = posts.find(x => x.id == postId);
      let indexToRemove = posts.findIndex(x => x.id == isSavedPost.id);

      if (indexToRemove !== -1) {
        posts.splice(indexToRemove, 1);
      }
    }

    if (this.isSharedPostTab) {
      var isSavedPost = this.sharedPostsList.find((x: { id: string; }) => x.id == postId);
    }
    if (this.isLikedPostTab) {
      var isSavedPost = this.likedPostsList.find((x: { id: string; }) => x.id == postId);
    }

    if (isSavedPost.isPostSavedByCurrentUser) {
      isSavedPost.savedPostsCount -= 1;
      isSavedPost.isPostSavedByCurrentUser = false;
      const translatedMessage = this.translateService.instant('PostRemovedSuccessfully');
      const translatedSummary = this.translateService.instant('Success');
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
    }
    else {
      isSavedPost.savedPostsCount += 1;
      isSavedPost.isPostSavedByCurrentUser = true;
      const translatedMessage = this.translateService.instant('PostSavedSuccessfully');
      const translatedSummary = this.translateService.instant('Success');
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
    }

    this._postService.savePost(postId, this.userId).subscribe((result) => {
    });
  }

  GetSavedClassCourseByUser(userId: string, isSavedClassCourseList?: boolean) {
    this.loadingIcon = true;
    this.isPostTab = false;
    this.isSavedPostTab = false;
    this.isSharedPostTab = false;
    this.isLikedPostTab = false;
    this.isSavedClassCourseTab = true;
    if (isSavedClassCourseList != undefined) {
      this.isSavedClassCourseList = isSavedClassCourseList;
    }
    else {
      this.isSavedClassCourseList = true;
    }
    this.saveClassCoursePageNumber = 1;
    this.reelsPageNumber = 1;
    this._schoolService.getSavedClassCourse(userId, this.saveClassCoursePageNumber).subscribe((response) => {
      this.savedClassCourseList = response;
      this.postLoadingIcon = false;
      this.loadingIcon = false;
    });
    // }

  }

  getDeletedId(id: string, type: any) {
    if (type == 1) {
      this._schoolService.deleteClass(id).subscribe((response) => {
        this.ngOnInit();
      });
    }
    if (type == 2) {
      this._schoolService.deleteCourse(id).subscribe((response) => {
        this.ngOnInit();
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

  openClassCourseViewModal(item: string): void {
    const initialState = {
      classCourseItem: item,
    };
    let videoElement: HTMLVideoElement | null = document.getElementById('displayVideo') as HTMLVideoElement
    if(videoElement){
       var vdo: HTMLVideoElement | null = videoElement.children[0]  as HTMLVideoElement
       if(vdo){
        vdo.pause();
       }
    }
    this.bsModalService.show(ClassCourseModalComponent, { initialState });
  }

  likeUnlikeClassCourse(Id: string, isLike: boolean, type: number) {
    this.currentLikedClassCourseId = Id;
    this.savedClassCourseList.filter((p: any) => p.id == Id).forEach((item: any) => {
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
      .subscribe((result) => {
        if (type == 1) {
          this.savedClassCourseList
            .filter((p: any) => p.id == Id)
            .forEach((item: any) => {
              item.classLikes = result.response;
            });
        } else {
          this.savedClassCourseList
            .filter((p: any) => p.id == Id)
            .forEach((item: any) => {
              item.courseLikes = result.response;
            });
        }

        this.InitializeLikeUnlikeClassCourse();
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

  saveClassCourse(id: string, type: number) {
    var classCourseList: any[] = this.savedClassCourseList;
    const translatedSummary = this.translateService.instant('Success');
    var isSavedClassCourse = classCourseList.find(x => x.id == id);
    if (type == 1) {
      this.savedMessage = this.translateService.instant('ClassSavedSuccessfully');
      this.removedMessage = this.translateService.instant('ClassRemovedSuccessfully');
    }
    if (type == 2) {
      this.savedMessage = this.translateService.instant('CourseSavedSuccessfully');
      this.removedMessage = this.translateService.instant('CourseRemovedSuccessfully');
    }

    var isSavedClassCourse = this.savedClassCourseList.find((x: { id: any; }) => x.id == id);
    let indexToRemove = this.savedClassCourseList.findIndex((x: { id: any; }) => x.id == isSavedClassCourse.id);
    if (indexToRemove !== -1) {
      this.savedClassCourseList.splice(indexToRemove, 1);
    }

    if (isSavedClassCourse.isClassCourseSavedByCurrentUser) {
      isSavedClassCourse.savedClassCourseCount -= 1;
      isSavedClassCourse.isClassCourseSavedByCurrentUser = false;
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: this.removedMessage });
    }
    else {
      isSavedClassCourse.savedClassCourseCount += 1;
      isSavedClassCourse.isClassCourseSavedByCurrentUser = true;
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: this.savedMessage });
    }

    this._schoolService.saveClassCourse(id, this.userId, type).subscribe((result) => {
    });
  }

  getDeletedSchool(schoolId: string) {
    [
      this.schoolId = schoolId
    ]
  }

  deleteSchoolTeacher() {
    this.loadingIcon = true;
    this._userService.deleteSchoolTeacher(this.schoolId).subscribe((response: any) => {
      const translatedMessage = this.translateService.instant('YouLeftSchoolSuccessfully');
      const translatedSummary = this.translateService.instant('Success');
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
      this.ngOnInit();
    });
  }

  deleteSchoolStudent() {
    this.loadingIcon = true;
    this._userService.deleteSchoolStudent(this.schoolId).subscribe((response: any) => {
      const translatedMessage = this.translateService.instant('YouLeftSchoolSuccessfully');
      const translatedSummary = this.translateService.instant('Success');
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
      this.ngOnInit();
    });
  }

  getSharedPostsByUser(userId: string, isSharedPostList?: boolean) {
    this.loadingIcon = true;
    this.isPostTab = false;
    this.isSavedClassCourseTab = false;
    this.isSavedPostTab = false;
    this.isLikedPostTab = false;
    this.isSharedPostTab = true;
    if (isSharedPostList != undefined) {
      this.isSharedPostList = isSharedPostList;
    }
    else {
      this.isSharedPostList = true;
    }
    this.sharedPostsPageNumber = 1;
    this.reelsPageNumber = 1;
    this._postService.getSharedPostsByUser(userId, this.sharedPostsPageNumber, 1).subscribe((response) => {
      this.sharedPostsList = response;
      this.loadingIcon = false;
    });

    this._postService.getSharedPostsByUser(userId, this.sharedPostsPageNumber, 3).subscribe((response) => {
      this.sharedReelsList = response;
      this.cd.detectChanges();
      this.addEventListnerOnCarousel();
    });

  }

  getLikedPostsByUser(userId: string, isLikedPostList?: boolean) {
    this.loadingIcon = true;
    this.isPostTab = false;
    this.isSavedClassCourseTab = false;
    this.isSavedPostTab = false;
    this.isSharedPostTab = false;
    this.isLikedPostTab = true;
    if (isLikedPostList != undefined) {
      this.isLikedPostList = isLikedPostList;
    }
    else {
      this.isLikedPostList = true;
    }
    this.likedPostsPageNumber = 1;
    this.reelsPageNumber = 1;
    this._postService.getLikedPostsByUser(userId, this.likedPostsPageNumber, 1).subscribe((response) => {
      this.likedPostsList = response;
      this.loadingIcon = false;
    });

    this._postService.getLikedPostsByUser(userId, this.likedPostsPageNumber, 3).subscribe((response) => {
      this.likedReelsList = response;
      this.cd.detectChanges();
      this.addEventListnerOnCarousel();
    });

  }

  // getFilteredAttachments(feeds: any): any {
  //   debugger
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
    debugger;
    const allAttachments = feeds.flatMap((post: { postAttachments: any[]; }) => post.postAttachments);
    this.filteredAttachments = allAttachments.filter((attachment: { fileType: number; }) => attachment.fileType === 3);
      let result = allAttachments.filter((attachment: { fileType: number; fileName: string; }) => {
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
    if (this.user.avatar != null) {
      this.userAvatar = '';
    }
    this.uploadImage = '';
    this.fileToUpload.set('avatarImage', '');
  }

  openShareClassCourseModal(schoolName: string, name: string, type: number) {
    var initialState: any;
    if (type == 1) {
      initialState = {
        className: name,
        schoolName: schoolName
      };
    }
    else {
      initialState = {
        courseName: name,
        schoolName: schoolName
      };
    }

    this.bsModalService.show(SharePostComponent, { initialState });
  }

  getSelectedLanguage() {
    var selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(selectedLanguage ?? '');
    var locale = selectedLanguage == "ar" ? Arabic : selectedLanguage == "sp" ? Spanish : selectedLanguage == "tr" ? Turkish : null
    const dateOfBirthElement = this.dateOfBirthRef.nativeElement;
    dateOfBirthElement._flatpickr.set("locale", locale);
  }

  getSelectedLanguageForCertificate() {
    var selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(selectedLanguage ?? '');
    var locale = selectedLanguage == "ar" ? Arabic : selectedLanguage == "sp" ? Spanish : selectedLanguage == "tr" ? Turkish : null
    const issuedDateElement = this.issuedDateRef.nativeElement;
    issuedDateElement._flatpickr.set("locale", locale);
  }

  getStateByCountry(event: any) {
    debugger
    var countryName = event.value;
    this._userService.getStateList(countryName).subscribe((response) => {
      debugger
      this.states = response;
      // this.editUserForm.get('city')?.setValue('');
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
    debugger
    this.uploadImage = this.croppedImage;
    this.cropModalRef.hide();
  }

  getDeletedCertificate(deletedCertificate: string) {
    debugger
    this.deleteCertificate.certificateId = deletedCertificate;
  }

  resetCertificateModal() {
    this.isSubmitted = false;
    this.userCertificate.certificates = [];
    this.uploadImage = null;
    this.userCertificateForm = this.fb.group({
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

  handleCertificates(event: any) {
    this.userCertificate.certificates.push(event.target.files[0]);
  }

  saveUserCertificates() {
    this.isSubmitted = true;
    if (!this.certificateForm.valid) {
      return;
    }
    this.loadingIcon = true;
    for (var i = 0; i < this.userCertificate.certificates.length; i++) {
      this.certificateToUpload.append(
        'certificates',
        this.userCertificate.certificates[i]
      );
    }
    this.certificateToUpload.append('userId', this.user.id);
    this._userService
      .saveUserCertificates(this.certificateToUpload)
      .subscribe((response: any) => {
        this.closeCertificatesModal();
        this.isSubmitted = false;
        this.userCertificate.certificates = [];
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
      });
  }

  private closeCertificatesModal(): void {
    this.closeCertificateModal.nativeElement.click();
  }

  deleteUserCertificate() {
    this.loadingIcon = true;
    this.deleteCertificate.userId = this.user.id;
    this._userService
      .deleteUserCertificate(this.deleteCertificate)
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

  previousGuid: string = '';

  generateGuid(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

  }


  getRandomClass(iscontainer: boolean) {
    var number = this.isScreenPc ? 3 : this.isScreenTablet ? 2 : this.isScreenMobile ? 1 : 0;
    if (iscontainer)
      return this.generateGuid();
    else
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
              // videojs(this.postDivId);
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

  uploadImageName: string = "";
  avatarImage!: any;
  handleUserCertificate(event: any) {
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

  initializeCertificateForm() {
    this.userCertificateForm = this.fb.group({
      certificateName: this.fb.control('', [Validators.required]),
      provider: this.fb.control('', [Validators.required]),
      issuedDate: this.fb.control(new Date().toISOString().substring(0, 10), [Validators.required]),
      description: this.fb.control(''),
      certificateId: this.fb.control(''),
    });
  }

  saveUsercertificcate() {
    debugger
    this.isSubmitted = true;
    if (!this.userCertificateForm.valid) {
      return;
    }

    if (this.uploadImage == null) {
      return;
    }

    this.loadingIcon = true;
    var formValue = this.userCertificateForm.value;

    //here we will add if id has
    if (formValue.certificateId != "") {
      this.certificateToUpload.append('certificateId', formValue.certificateId);
    }

    if (typeof this.uploadImage == "string") {
      this.certificateToUpload.append('certificateUrl', this.uploadImage);
    }
    this.certificateToUpload.append('certificateName', formValue.certificateName);
    this.certificateToUpload.append('provider', formValue.provider);
    this.certificateToUpload.append('issuedDate', formValue.issuedDate);
    this.certificateToUpload.append('description', formValue.description);

    // this.userCertificateForm.updateValueAndValidity();

    this._userService.saveUserCertificates(this.certificateToUpload).subscribe((response: any) => {
      debugger
      this.closeCertificatesModal();
      this.isSubmitted = false;
      this.certificateToUpload = new FormData();
      this.userCertificate.certificates = [];
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

  openUserOwnCertificateModal(certificateInfo: any) {
    debugger
    this.certificateToUpload.set('certificateImage', '');
    this.userCertificateInfo = certificateInfo;
    this.openUserOwnCertificate.nativeElement.click();
    this.cd.detectChanges();
  }

  editUserCertificate(userCertificateInfo: any) {
    debugger
    var issuedDate = userCertificateInfo.issuedDate.substring(0, userCertificateInfo.issuedDate.indexOf('T'));
    issuedDate = this.datePipe.transform(issuedDate, 'MM/dd/yyyy');

    flatpickr('#issuedDate', {
      minDate: "1903-12-31",
      maxDate: new Date(),
      dateFormat: "m/d/Y",
      defaultDate: issuedDate
    });

    this.userCertificateForm = this.fb.group({
      certificateName: this.fb.control(userCertificateInfo.certificateName, [Validators.required]),
      provider: this.fb.control(userCertificateInfo.provider, [Validators.required]),
      issuedDate: this.fb.control(issuedDate, [Validators.required]),
      description: this.fb.control(userCertificateInfo.description),
      certificateId: this.fb.control(userCertificateInfo.id)
    });

    this.uploadImage = userCertificateInfo.certificateUrl;
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

  parseTheListViewTags(tags: any) {
    for (let index = 0; index < tags.length; index++) {
      const element = tags[index].postTagValue;
      try {
        var reelsTags = JSON.parse(element);
      }
      catch { }
      return reelsTags
    }
  }

  navigateToProfile(sharedProfileUrl: string) {
    if (sharedProfileUrl) {
      const urlSegments = sharedProfileUrl.split('/').slice(3); 
      const routeUrl = '/' + urlSegments.join('/');
      this.router.navigateByUrl(routeUrl);
    }
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
          debugger
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

}


