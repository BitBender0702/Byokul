import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AddUserLanguage } from 'src/root/interfaces/user/addUserLanguage';
import { DeleteUserLanguage } from 'src/root/interfaces/user/deleteUserLanguage';
import { EditUserModel } from 'src/root/interfaces/user/editUserModel';
import { UserService } from 'src/root/service/user.service';
import { MultilingualComponent, changeLanguage } from '../../sharedModule/Multilingual/multilingual.component';

import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { BsModalService } from 'ngx-bootstrap/modal';
import { addPostResponse, CreatePostComponent } from '../../createPost/createPost.component';
import { FollowUnFollowEnum } from 'src/root/Enums/FollowUnFollowEnum';
import { FollowUnfollow } from 'src/root/interfaces/FollowUnfollow';
import { PostService } from 'src/root/service/post.service';
import { PostViewComponent, savedPostResponse } from '../../postView/postView.component';
import { MessageService } from 'primeng/api';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { ReelsViewComponent, savedReelResponse } from '../../reels/reelsView.component';
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

export const userImageResponse =new Subject<{userAvatar : string}>();  
export const chatResponse =new Subject<{receiverId : string , type: string,chatTypeId:string}>();  



@Component({
    selector: 'userProfile-root',
    templateUrl: './userProfile.component.html',
    styleUrls: ['./userProfile.component.css'],
    providers: [MessageService]
  })

  export class UserProfileComponent extends MultilingualComponent implements OnInit {

    @BlockUI() blockUi!: NgBlockUI;

    isOpenSidebar:boolean = false;
    isDataLoaded:boolean = false;
    isSubmitted: boolean = false;
    isOpenModal:boolean = false;
    loadingIcon:boolean = false;
    postLoadingIcon: boolean = false;
    reelsLoadingIcon:boolean = false;
    blockedDocument: boolean = false;
    isProfileGrid:boolean = true;
    userId!:string;
    isFollowed!:boolean;
    likesLength!:number;
    isLiked!:boolean;

    private _userService;
    private _authService;
    private _postService;
    private _signalrService;
    private _schoolService;
    user:any;
    validToken!:string;

    userLanguage!:AddUserLanguage;
    deleteLanguage!: DeleteUserLanguage;
    filteredLanguages!: any[];
    languages:any;
    EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
    editUser:any;
    editUserForm!:FormGroup;
    languageForm!:FormGroup;
    updateUserDetails!:EditUserModel;
    isOwner!:boolean;
    followUnfollowUser!: FollowUnfollow;
    followersLength!:number;
    likeUnlikePost!: LikeUnlikePost;
    currentLikedPostId!:string;
    postView!:PostView;
    loginUserId!:string;
    gridItemInfo:any;
    isGridItemInfo: boolean = false;
    userParamsData$: any;

    itemsPerSlide = 7;
    singleSlideOffset = true;
    noWrap = true;

    frontEndPageNumber:number = 1;
    reelsPageNumber:number = 1;
    savedPostsPageNumber:number = 1;
    sharedPostsPageNumber:number = 1;
    likedPostsPageNumber:number = 1;
    savedClassCoursePageNumber:number = 1;
    scrolled:boolean = false;
    savedPostScrolled:boolean = false;
    savedClassCourseScrolled:boolean = false;
    sharedPostsScrolled:boolean = false;
    likedPostsScrolled:boolean = false;
    scrollFeedResponseCount:number = 1;
    scrollSavedPostResponseCount:number = 1;
    scrollSharedPostResponseCount:number = 1;
    scrollLikedPostResponseCount:number = 1;
    scrollSavedClassCourseResponseCount:number = 1;
    notificationViewModel!:NotificationViewModel;
    @ViewChild('closeEditModal') closeEditModal!: ElementRef;
    @ViewChild('closeLanguageModal') closeLanguageModal!: ElementRef;
    @ViewChild('imageFile') imageFile!: ElementRef;
    @ViewChild('carousel') carousel!: ElementRef;
    @ViewChild('videoPlayer') videoPlayer!: ElementRef;

    @ViewChild('createPostModal', { static: true }) createPostModal!: CreatePostComponent;


    uploadImage!:any;
    fileToUpload= new FormData();
    translate!: TranslateService;
    isSavedProfileList: boolean = false;
    savedPostsList!:any;
    sharedPostsList!:any;
    likedPostsList!:any;
    likedReelsList!:any;
    savedReelsList!:any;
    sharedReelsList!:any;
    isSavedPostList!:boolean;
    isSharedPostList!:boolean;
    isLikedPostList!:boolean;
    isSavedClassCourseList!:boolean;

    isPostTab:boolean = true;
    isSavedPostTab:boolean = false;
    isSharedPostTab:boolean = false;
    isLikedPostTab:boolean = false;
    isSavedClassCourseTab:boolean = false;
    savedPostGridInfo:any;
    sharedPostGridInfo:any;
    likedPostGridInfo:any;
    isSavedPostGridInfo: boolean = false;
    isSharedPostGridInfo: boolean = false;
    isLikedPostGridInfo: boolean = false;
    savedClassCourseGridInfo:any;
    isSavedClassCourseGridInfo: boolean = false;


    savedClassCourseList!:any;
    saveClassCoursePageNumber: number = 1;

    currentLikedClassCourseId!: string;
    isClassCourseLiked!: boolean;
    likesClassCourseLength!: number;
    likeUnlikeClassCourses!: LikeUnlikeClassCourse;
    schoolId!:string;
    isSavedMessageAlready:boolean = true;
    savedPostSubscription!: Subscription;
    savedReelSubscription!: Subscription;
    addPostSubscription!: Subscription;
    changeLanguageSubscription!:Subscription;
    sharedPostSubscription!:Subscription;
    savedClassCourseSubscription!:Subscription;
    isOnInitInitialize:boolean = false;
    savedMessage!:string;
    removedMessage!:string;


    constructor(injector: Injector,authService:AuthService,signalrservice:SignalrService,public messageService:MessageService, private bsModalService: BsModalService,userService: UserService,postService: PostService,private route: ActivatedRoute,private domSanitizer: DomSanitizer,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute,private cd: ChangeDetectorRef,private schoolService:SchoolService) { 
      super(injector);
        this._userService = userService;
        this._authService = authService;
        this._postService = postService;
        this._schoolService = schoolService;
        this._signalrService = signalrservice;
        // this.userParamsData$ = this.route.params.subscribe(routeParams => {
        //   if(!this.loadingIcon)
        //   this.ngOnInit();
        // });

        this.userParamsData$ = this.route.params.subscribe((routeParams) => {
          this.userId = routeParams.schoolName;
          if (!this.loadingIcon && this.isOnInitInitialize){
            this.ngOnInit();
          }
        });
    }
  
    ngOnInit(): void {
      this.isOnInitInitialize = true;
      this.postLoadingIcon = false;
      this._authService.loginState$.next(true);
      this.validToken = localStorage.getItem("jwt")?? '';
      this.loadingIcon = true;
      var selectedLang = localStorage.getItem("selectedLanguage");
      this.translate.use(selectedLang?? '');
      var id = this.route.snapshot.paramMap.get('userId');
      this.userId = id ?? '';

      this._userService.getUserById(this.userId).subscribe((response) => {
        this.frontEndPageNumber = 1;
        this.reelsPageNumber = 1;
        this.user = response;
        this.followersLength = this.user.followers.length;
        this.isOwnerOrNot();
        this.loadingIcon = false;
        this.scrolled = false;
        this.postLoadingIcon = false;
        this.isDataLoaded = true;
        this.cd.detectChanges();
        this.addEventListnerOnCarousel();
      });

      this._userService.getLanguageList().subscribe((response) => {
        this.languages = response;
      });

      this.userLanguage = {
        userId: '',
        languageIds: []
       };

       this.languageForm = this.fb.group({
        languages:this.fb.control([],[Validators.required]),
      });

       this.deleteLanguage = {
        userId: '',
        languageId: ''
       };

       this.editUserForm = this.fb.group({
        firstName: this.fb.control(''),
        lastName: this.fb.control(''),
        dob: this.fb.control(''),
        gender: this.fb.control(''),
        description: this.fb.control(''),
        contactEmail: this.fb.control('')
      });

      this.InitializeFollowUnfollowUser();
      this.InitializeLikeUnlikePost();
      this.InitializePostView();

      userImageResponse.subscribe(response => {
        
        this.user.avatar = response.userAvatar;
      });

      if(!this.addPostSubscription){
      this.addPostSubscription = addPostResponse.subscribe(response => {
        this.loadingIcon = true;
        this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post created successfully'});
        this._userService.getUserById(this.userId).subscribe((response) => {
          this.user = response;
          this.followersLength = this.user.followers.length;
          this.isOwnerOrNot();
          this.loadingIcon = false;
          this.isDataLoaded = true;
          this.scrolled = false;
          this.postLoadingIcon = false;
          this.cd.detectChanges();
          this.addEventListnerOnCarousel();
        });
      });
    }

      if(!this.savedPostSubscription){
        this.savedPostSubscription = savedPostResponse.subscribe(response => {
          debugger
          if(response.isPostSaved){
            this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post saved successfully'});
          }
          if(!response.isPostSaved){
              this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post removed successfully'});
              if(this.savedPostsList != undefined){
                var isSavedPost = this.savedPostsList.find((x: { id: any; }) => x.id == response.postId);
                let indexToRemove = this.savedPostsList.findIndex((x: { id: any; }) => x.id == isSavedPost.id);
                if (indexToRemove !== -1) {
                  this.savedPostsList.splice(indexToRemove, 1);
                }
              }
          }
        });
      }

      if(!this.savedReelSubscription){
        this.savedReelSubscription = savedReelResponse.subscribe(response => {
          if(response.isReelSaved){
            this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel saved successfully'});
          }
          if(!response.isReelSaved){
            this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel removed successfully'});
            if(this.savedReelsList != undefined){
              var isSavedReel = this.savedReelsList.find((x: { id: any; }) => x.id == response.id);
              let indexToRemove = this.savedReelsList.findIndex((x: { id: any; }) => x.id == isSavedReel.id);
              if (indexToRemove !== -1) {
                this.savedReelsList.splice(indexToRemove, 1);
              }
            }
          }
        });
      }

      this.sharedPostSubscription = sharedPostResponse.subscribe( response => {
        debugger
        if(response.postType == 1){
          this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post shared successfully'});
          var post = this.user.posts.find((x: { id: string; }) => x.id == response.postId); 
          if(post == undefined || null){
            var post = this.savedPostsList.find((x: { id: string; }) => x.id == response.postId); 
            post.postSharedCount++;
          } 
          else{
            post.postSharedCount++;
          }
        }
        else
          this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel shared successfully'});
        });

      if(!this.changeLanguageSubscription){
        this.changeLanguageSubscription = changeLanguage.subscribe(response => {
          this.translate.use(response.language);
        })
      }

      if(!this.savedClassCourseSubscription){
        this.savedClassCourseSubscription = savedClassCourseResponse.subscribe(response => {
          if(response.isSaved){
            this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:`${response.type} saved successfully`});
          }
          if(!response.isSaved){
            this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:`${response.type} removed successfully`});
            if(this.savedClassCourseList != undefined){
              var isSavedClassCourse = this.savedClassCourseList.find((x: { id: any; }) => x.id == response.id);
              let indexToRemove = this.savedClassCourseList.findIndex((x: { id: any; }) => x.id == isSavedClassCourse.id);
              if (indexToRemove !== -1) {
                this.savedClassCourseList.splice(indexToRemove, 1);
              }
            }
          }
        });
      }

    }

    getByUserId(){
      if(this.userId == undefined){
        this.postLoadingIcon = true;
        return;
      }
      this._userService.getPostsByUserId(this.userId,this.frontEndPageNumber).subscribe((response) => {
        this.user.posts =[...this.user.posts, ...response];
        this.postLoadingIcon = false;
        this.scrollFeedResponseCount = response.length; 
        this.scrolled = false;
      });
    }

    ngOnDestroy(): void {
      if(this.savedPostSubscription){
        this.savedPostSubscription.unsubscribe();
      }
      if(this.savedReelSubscription){
        this.savedReelSubscription.unsubscribe();
      }
      if(this.changeLanguageSubscription){
        this.changeLanguageSubscription.unsubscribe();
      }
      if(this.sharedPostSubscription){
        this.sharedPostSubscription.unsubscribe();
      }
      if(this.savedClassCourseSubscription){
        this.savedClassCourseSubscription.unsubscribe();
      }
      if(this.userParamsData$){
        this.userParamsData$.unsubscribe();
      }
    }

    @HostListener("window:scroll", [])
    onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    const windowSize = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;

      if (scrollPosition >= bodyHeight - windowSize) {
        if(this.isPostTab){
          if(!this.scrolled && this.scrollFeedResponseCount != 0){
            this.scrolled = true;
            this.postLoadingIcon = true;
            this.frontEndPageNumber++;
            this.getByUserId();
          }
        }
        if(this.isSavedPostTab){
          if(!this.savedPostScrolled && this.scrollSavedPostResponseCount != 0){
            this.savedPostScrolled = true;
            this.postLoadingIcon = true;
            this.savedPostsPageNumber++;
            this.getNextSavedPosts();
          }
        }
        if(this.isSharedPostTab){
          if(!this.sharedPostsScrolled && this.scrollSharedPostResponseCount != 0){
            this.sharedPostsScrolled = true;
            this.postLoadingIcon = true;
            this.sharedPostsPageNumber++;
            this.getNextSharedPosts();
          }
        }
        if(this.isLikedPostTab){
          if(!this.likedPostsScrolled && this.scrollLikedPostResponseCount != 0){
            this.likedPostsScrolled = true;
            this.postLoadingIcon = true;
            this.likedPostsPageNumber++;
            this.getNextLikedPosts();
          }
        }
        if(this.isSavedClassCourseTab){
          if(!this.savedClassCourseScrolled && this.scrollSavedClassCourseResponseCount != 0){
            this.savedClassCourseScrolled = true;
            this.postLoadingIcon = true;
            this.saveClassCoursePageNumber++;
            this.getNextSavedClassCourse();
          }
        }
       }
     }

     getNextSavedPosts(){
      this._postService.getSavedPostsByUser(this.userId,this.savedPostsPageNumber,1).subscribe((response) => {
        this.savedPostsList =[...this.savedPostsList, ...response];
        this.postLoadingIcon = false;
        this.scrollSavedPostResponseCount = response.length; 
        this.savedPostScrolled = false;
      });
    }

    getNextSharedPosts(){
      this._postService.getSharedPostsByUser(this.userId,this.sharedPostsPageNumber,1).subscribe((response) => {
        this.sharedPostsList =[...this.sharedPostsList, ...response];
        this.postLoadingIcon = false;
        this.scrollSharedPostResponseCount = response.length; 
        this.sharedPostsScrolled = false;
      });
    }

    getNextLikedPosts(){
      this._postService.getLikedPostsByUser(this.userId,this.likedPostsPageNumber,1).subscribe((response) => {
        this.likedPostsList =[...this.likedPostsList, ...response];
        this.postLoadingIcon = false;
        this.scrollLikedPostResponseCount = response.length; 
        this.likedPostsScrolled = false;
      });
    }

    getNextSavedClassCourse(){
      this._schoolService.getSavedClassCourse(this.userId,this.saveClassCoursePageNumber).subscribe((response) => {
        this.savedClassCourseList =[...this.savedClassCourseList, ...response];
        this.postLoadingIcon = false;
        this.scrollSavedClassCourseResponseCount = response.length; 
        this.savedClassCourseScrolled = false;
      });
    }

    addEventListnerOnCarousel(){
      debugger
     if(this.carousel!=undefined){
        if($('carousel')[0].querySelectorAll('a.carousel-control-next')[0]){
          $('carousel')[0].querySelectorAll('a.carousel-control-next')[0].addEventListener('click', () => {
            debugger
            this.reelsPageNumber++;
            if(this.reelsPageNumber == 2){
              this.reelsLoadingIcon = true;
            }
            if(this.isPostTab){
              this._userService.getReelsByUserId(this.user.id, this.reelsPageNumber).subscribe((response) => {
                 this.user.reels = [...this.user.reels, ...response];
                 this.reelsLoadingIcon = false;
              });
            }

            if(this.isSavedPostTab){
              this._postService.getSavedPostsByUser(this.user.id, this.reelsPageNumber,3).subscribe((response) => {
                this.savedReelsList = [...this.savedReelsList, ...response];
                this.reelsLoadingIcon = false;
             });
            }

            if(this.isSharedPostTab){
              this._postService.getSharedPostsByUser(this.user.id, this.reelsPageNumber,3).subscribe((response) => {
                this.sharedReelsList = [...this.sharedReelsList, ...response];
                this.reelsLoadingIcon = false;
             });
            }

            if(this.isLikedPostTab){
              this._postService.getLikedPostsByUser(this.user.id, this.reelsPageNumber,3).subscribe((response) => {
                this.likedReelsList = [...this.likedReelsList, ...response];
                this.reelsLoadingIcon = false;
             });
            }

            })
          }  
      }
     }

    InitializeFollowUnfollowUser(){
      this.followUnfollowUser = {
        id: '',
        isFollowed: false
       };
    }

    InitializePostView(){
      this.postView = {
        postId: '',
        userId: ''
       };
    }

    InitializeLikeUnlikePost(){
      this.likeUnlikePost = {
        postId: '',
        userId: '',
        isLike:false,
        commentId:''
       };

    }

    isOwnerOrNot(){
      var validToken = localStorage.getItem("jwt");
        if (validToken != null) {
          let jwtData = validToken.split('.')[1]
          let decodedJwtJsonData = window.atob(jwtData)
          let decodedJwtData = JSON.parse(decodedJwtJsonData);
          this.loginUserId = decodedJwtData.jti;
          if(decodedJwtData.sub == this.user.email){
            this.isOwner = true;
          }
          else{
            this.isOwner = false;
            this.isFollowedOwnerOrNot(decodedJwtData.jti);
          }
        }
    }

    isFollowedOwnerOrNot(userId:string){
      var followers: any[] = this.user.followers;
      var isFollowed = followers.filter(x => x.followerId == userId);
      if(isFollowed.length != 0){
        this.isFollowed = true;
      }
      else{
        this.isFollowed = false;
      }
  }

    captureLanguageId(event: any) {
      var languageId = event.id;
      this.userLanguage.languageIds.push(languageId);
    }

    filterLanguages(event:any) {

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

    saveUserLanguages(){
      
      this.isSubmitted = true;
      if (!this.languageForm.valid) {
        return;
      }
      this.loadingIcon = true;
      this.userLanguage.userId = this.user.id;
      this._userService.saveUserLanguages(this.userLanguage).subscribe((response:any) => {
        
        this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Language added successfully'});
        this.closeLanguagesModal();
        this.isSubmitted = true;
        this.ngOnInit();     
  
      });
    }

    deleteUserLanguage(){
      this.loadingIcon = true;
      this.deleteLanguage.userId = this.user.id;
      this._userService.deleteUserLanguage(this.deleteLanguage).subscribe((response:any) => {
        this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Language deleted successfully'});
        this.ngOnInit();
      });
    }

    getDeletedLanguage(deletedLanguage:string){
      this.deleteLanguage.languageId = deletedLanguage;
    }

    followUser(userId:string,from:string){
      if(this.validToken == ''){
        window.open('user/auth/login', '_blank');
      }
      else{
      this.followUnfollowUser.id = userId;
      if(from == FollowUnFollowEnum.Follow){
        this.followersLength += 1;
        this.isFollowed = true;
        this.followUnfollowUser.isFollowed = true;
        var notificationContent = "followed you"
        var postId = '00000000-0000-0000-0000-000000000000';
        var post = null;
        this.initializeNotificationViewModel(userId,NotificationType.Followings,notificationContent,postId);
      }
      else{
        this.followersLength -= 1; 
        this.isFollowed = false;
        this.followUnfollowUser.isFollowed = false;
      }
      this._userService.saveUserFollower(this.followUnfollowUser).subscribe((response) => {
        this.InitializeFollowUnfollowUser();
      });
    }
    }

    initializeNotificationViewModel(userid:string,notificationType:NotificationType,notificationContent:string,postId:string,postType?:number,post?:any){
      this._userService.getUser(this.loginUserId).subscribe((response) => {
        this.notificationViewModel = {
          id:'00000000-0000-0000-0000-000000000000',
          userId: userid,
          actionDoneBy: this.loginUserId,
          avatar: response.avatar,
          isRead:false,
          notificationContent:`${response.firstName + ' ' + response.lastName + ' ' + notificationContent}`,
          notificationType:notificationType,
          postId:postId,
          postType:postType,
          post:post
        }
        this._signalrService.sendNotification(this.notificationViewModel);
      });
    }

    getUserDetails(userId:string){
      this._userService.getUserEditDetails(userId).subscribe((response) => {
        this.editUser = response;
        this.initializeEditFormControls();
    })
  }

  initializeEditFormControls(){
    this.uploadImage = '';
    this.imageFile.nativeElement.value = "";
    this.fileToUpload.set('avatarImage','');
    
    var dob = this.editUser.dob;
    if(dob!=null){
      dob = dob.substring(0, dob.indexOf('T'));
    }

    this.editUserForm = this.fb.group({
      firstName: this.fb.control(this.editUser.firstName,[Validators.required]),
      lastName: this.fb.control(this.editUser.lastName,[Validators.required]),
      dob: this.fb.control(dob,[Validators.required]),
      gender: this.fb.control(this.editUser.gender,[Validators.required]),
      description: this.fb.control(this.editUser.description??''),
      contactEmail: this.fb.control(this.editUser.contactEmail??'',[Validators.pattern(this.EMAIL_PATTERN)])
    });
    this.editUserForm.updateValueAndValidity();
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

  updateUser(){
    
    this.isSubmitted=true;
    if (!this.editUserForm.valid) {
      return;
    }
    this.loadingIcon = true;
    if(!this.uploadImage){
      this.fileToUpload.append('avatar', this.editUser.avatar);

    }

    this.updateUserDetails=this.editUserForm.value;
    this.fileToUpload.append('id', this.user.id);
    this.fileToUpload.append('firstName', this.updateUserDetails.firstName);
    this.fileToUpload.append('lastName', this.updateUserDetails.lastName);
    this.fileToUpload.append('dob', this.updateUserDetails.dob);
    this.fileToUpload.append('gender',this.updateUserDetails.gender.toString());
    this.fileToUpload.append('description',this.updateUserDetails.description);
    this.fileToUpload.append('contactEmail',this.updateUserDetails.contactEmail);

    this._userService.editUser(this.fileToUpload).subscribe((response:any) => {
      this.closeModal();
      this.isSubmitted=true;
      userImageResponse.next({userAvatar: response.avatar}); 
      this.fileToUpload = new FormData();
      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Profile updated successfully'});
      this.ngOnInit();
    });

  }
  
  private closeModal(): void {
    this.closeEditModal.nativeElement.click();
  }

  private closeLanguagesModal(): void {
    this.closeLanguageModal.nativeElement.click();
  }

omit_special_char(event:any)
{   
   var k;  
   k = event.charCode;
   return((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57)); 
}

removeLanguage(event: any){
  const languageIndex = this.userLanguage.languageIds.findIndex((item) => item === event.id);
  if (languageIndex > -1) {
    this.userLanguage.languageIds.splice(languageIndex, 1);
  }
}

resetLanguageModal(){
  this.isSubmitted = false;
  this.languageForm.setValue({
    languages: [],
  });
}

createPost(){
  this.isOpenModal = true;

}

blockUI() {
  this.blockUi.start("Loading");
}

unblockUI(){
  this.blockUi.stop();
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

savePostGrid(){
  this.isSavedPostList = true;

}

savePostList(){
  this.isSavedPostList = false;

}

sharePostGrid(){
  this.isSharedPostList = true;

}

sharePostList(){
  this.isSharedPostList = false;

}

likePostGrid(){
  this.isLikedPostList = true;

}

likePostList(){
  this.isLikedPostList = false;

}

saveClassCourseGrid(){
  this.isSavedClassCourseList = true;

}

saveClassCourseList(){
  this.isSavedClassCourseList = false;

}

back(): void {
  window.history.back();
}

openPostModal(): void {
  const initialState = {
    userId: this.user.id,
    from: "user"
  };
    this.bsModalService.show(CreatePostComponent,{initialState});
}

pinUnpinPost(attachmentId:string,isPinned:boolean,type?:number){
  if(this.isPostTab){
    this._postService.pinUnpinPost(attachmentId,isPinned).subscribe((response) => {
      debugger
      // if(this.isSavedPostTab){
      //   this.GetSavedPostsByUser(this.user.id,this.isSavedPostList);
      // }
      // else{
        this.ngOnInit();
      // }
    });
  }

  if(this.isSavedPostTab){
    this._postService.pinUnpinSavedPost(attachmentId,isPinned).subscribe((response) => {
      this.GetSavedPostsByUser(this.user.id,this.isSavedPostList);
    });
  }

  if(this.isSharedPostTab){
    this._postService.pinUnpinSharedPost(attachmentId,isPinned).subscribe((response) => {
      this.getSharedPostsByUser(this.user.id,this.isSharedPostList);
    });
  }

  if(this.isLikedPostTab){
    this._postService.pinUnpinLikedPost(attachmentId,isPinned).subscribe((response) => {
      this.getLikedPostsByUser(this.user.id,this.isLikedPostList);
    });
  }

  if(this.isSavedClassCourseTab){
    if(type != undefined){
      this._postService.pinUnpinSavedClassCourse(attachmentId,isPinned,type).subscribe((response) => {
        this.GetSavedClassCourseByUser(this.user.id,this.isSavedClassCourseList);
      });
    }
  }

}


openPostsViewModal(posts:string): void {
  const initialState = {
    posts: posts
  };
  this.bsModalService.show(PostViewComponent,{initialState});
}

openReelsViewModal(postAttachmentId:string): void {
  const initialState = {
    postAttachmentId: postAttachmentId
  };
  this.bsModalService.show(ReelsViewComponent,{initialState});
}

userChat(){
  if(this.validToken == ''){
    window.open('user/auth/login', '_blank');
  }
  else{
    window.location.href=`user/chat`;
  }   
}

likeUnlikePosts(postId:string, isLike:boolean,postType:number,post:any,from:number){
  debugger
  this.currentLikedPostId = postId;
  if(this.isPostTab){
    var posts = this.user.posts;
  }
  if(this.isSavedPostTab){
    var posts = this.savedPostsList;
  }
  if(this.isSharedPostTab){
    var posts = this.sharedPostsList;
  }
  if(this.isLikedPostTab){
    var posts = this.likedPostsList;
  }
  posts.filter((p : any) => p.id == postId).forEach( (item : any) => {
    debugger
    var likes: any[] = item.likes;
    var isLiked = likes.filter(x => x.userId == this.loginUserId && x.postId == postId);
  if(isLiked.length != 0){
    this.isLiked = false;
    this.likesLength = item.likes.length - 1;
    item.isPostLikedByCurrentUser = false;

    //this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post removed successfully'});
  }
  else{
    this.isLiked = true;
    this.likesLength = item.likes.length + 1;
    item.isPostLikedByCurrentUser = true;
    var notificationType = NotificationType.Likes;
    var notificationContent = "liked your post";
    this.initializeNotificationViewModel(post.createdBy,notificationType,notificationContent,postId,postType,post);
  }
  }); 
  
 
  this.likeUnlikePost.postId = postId;
  this.likeUnlikePost.isLike = isLike;
  this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
  this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
    if(this.isPostTab){
     this.user.posts.filter((p : any) => p.id == postId).forEach( (item : any) => {
      item.likes = response;
    }); 
   }
   if(this.isSavedPostTab){
     this.savedPostsList.filter((p : any) => p.id == postId).forEach( (item : any) => {
       item.likes = response;
   });
  }
   if(this.isSharedPostTab){
     this.sharedPostsList.filter((p : any) => p.id == postId).forEach( (item : any) => {
       item.likes = response;
   });
  }
   if(this.isLikedPostTab){
     this.likedPostsList.filter((p : any) => p.id == postId).forEach( (item : any) => {
       item.likes = response;
   });
  }
     this.InitializeLikeUnlikePost();
     console.log("succes");
  });
}

showPostDiv(postId:string){
  var posts: any[] = this.user.posts;
  this.gridItemInfo = posts.find(x => x.id == postId);
  this.isGridItemInfo = true;
  this.cd.detectChanges();
  videojs(this.videoPlayer.nativeElement, {autoplay: false});
  this.addPostView(this.gridItemInfo.id);
}

showSavedPostDiv(postId:string){
  var posts: any[] = this.savedPostsList;
  this.savedPostGridInfo = posts.find(x => x.id == postId);
  this.isSavedPostGridInfo = true;
  this.addPostView(this.savedPostGridInfo.id);
}

showSharedPostDiv(postId:string){
  var posts: any[] = this.sharedPostsList;
  this.sharedPostGridInfo = posts.find(x => x.id == postId);
  this.isSharedPostGridInfo = true;
  this.addPostView(this.sharedPostGridInfo.id);
}

showLikedPostDiv(postId:string){
  var posts: any[] = this.likedPostsList;
  this.likedPostGridInfo = posts.find(x => x.id == postId);
  this.isLikedPostGridInfo = true;
  this.addPostView(this.likedPostGridInfo.id);
}

showSavedClassCourseDiv(id:string){
  var classCourses: any[] = this.savedClassCourseList;
  this.savedClassCourseGridInfo = classCourses.find(x => x.id == id);
  this.isSavedClassCourseGridInfo = true;
}

addPostView(postId:string){
  
  if(this.loginUserId != undefined){
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

hideSavedPostGridInfo(){
  this.isSavedPostGridInfo = this.isSavedPostGridInfo ? false : true;
}

hideSharedPostGridInfo(){
  this.isSharedPostGridInfo = this.isSharedPostGridInfo ? false : true;
}

hideLikedPostGridInfo(){
  this.isLikedPostGridInfo = this.isLikedPostGridInfo ? false : true;
}

hideSavedClassCourseGridInfo(){
  this.isSavedClassCourseGridInfo = this.isSavedClassCourseGridInfo ? false : true;
}

openChat(userId:string,type:string){
var chatTypeId = ''
  this.router.navigate(
    [`user/chats`],
    { state: { chatHead: {receiverId: userId, type : type,chatTypeId:''} } });
}

openCertificateViewModal(certificateUrl:string,certificateName:string){
  const initialState = {
    certificateUrl: certificateUrl,
    certificateName:certificateName,
    from:PostAuthorTypeEnum.School
  };
  this.bsModalService.show(CertificateViewComponent, { initialState });
}

openSharePostModal(postId:string,postType:number): void {
  const initialState = {
    postId: postId,
    postType: postType
  };
  this.bsModalService.show(SharePostComponent,{initialState});
}

GetSavedPostsByUser(userId:string, isSavedPostList?:boolean){
  debugger
  this.loadingIcon = true;
  this.isPostTab = false;
  this.isSavedClassCourseTab = false;
  this.isSharedPostTab = false;
  this.isLikedPostTab = false;
  this.isSavedPostTab = true;
  if(isSavedPostList != undefined){
    this.isSavedPostList = isSavedPostList;
  }
  else{
    this.isSavedPostList = true;
  }
  this.savedPostsPageNumber = 1;
  this.reelsPageNumber = 1;
  this._postService.getSavedPostsByUser(userId,this.savedPostsPageNumber,1).subscribe((response) => {
    debugger
    this.savedPostsList = response;
    this.loadingIcon = false;
   }); 

   this._postService.getSavedPostsByUser(userId,this.savedPostsPageNumber,3).subscribe((response) => {
    debugger
    this.savedReelsList = response;
    this.cd.detectChanges();
    this.addEventListnerOnCarousel();
   }); 

}

isPostsTab(){
  this.isPostTab = true;
  this.isSavedPostTab = false;
  this.isSavedClassCourseTab = false;
  this.reelsPageNumber = 1;
  this.cd.detectChanges();
  this.addEventListnerOnCarousel();
}

savePost(postId:string,from:number){
  debugger
  if(this.isPostTab){
    var posts: any[] = this.user.posts;
    var isSavedPost = posts.find(x => x.id == postId);
  }
  if(this.isSavedPostTab){
    var posts: any[] = this.savedPostsList;
    var isSavedPost = posts.find(x => x.id == postId);
    let indexToRemove = posts.findIndex(x => x.id == isSavedPost.id);

    if (indexToRemove !== -1) {
      posts.splice(indexToRemove, 1);
    }
  }

  if(this.isSharedPostTab){
    var isSavedPost = this.sharedPostsList.find((x: { id: string; }) => x.id == postId);
  }
  if(this.isLikedPostTab){
    var isSavedPost = this.likedPostsList.find((x: { id: string; }) => x.id == postId);
  }

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

GetSavedClassCourseByUser(userId:string,isSavedClassCourseList?:boolean){
  this.loadingIcon = true;
  this.isPostTab = false;
  this.isSavedPostTab = false;
  this.isSharedPostTab = false;
  this.isLikedPostTab = false;
  this.isSavedClassCourseTab = true;
  if(isSavedClassCourseList != undefined){
    this.isSavedClassCourseList = isSavedClassCourseList;
  }
  else{
    this.isSavedClassCourseList = true;
  }
  this.saveClassCoursePageNumber = 1;
  this.reelsPageNumber = 1;
  this._schoolService.getSavedClassCourse(userId,this.saveClassCoursePageNumber).subscribe((response) => {
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
    .subscribe((response) => {
      if (type == 1) {
        this.savedClassCourseList
          .filter((p: any) => p.id == Id)
          .forEach((item: any) => {
            item.classLikes = response;
          });
      } else {
        this.savedClassCourseList
          .filter((p: any) => p.id == Id)
          .forEach((item: any) => {
            item.courseLikes = response;
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

saveClassCourse(id:string,type:number){
  var classCourseList: any[] = this.savedClassCourseList;
  var isSavedClassCourse = classCourseList.find(x => x.id == id);
  if(type == 1){
    this.savedMessage = 'Class saved successfully';
    this.removedMessage = 'Class removed successfully'
  }
  if(type == 2){
    this.savedMessage = 'Course saved successfully';
    this.removedMessage = 'Course removed successfully'
  }

    var isSavedClassCourse = this.savedClassCourseList.find((x: { id: any; }) => x.id == id);
    let indexToRemove = this.savedClassCourseList.findIndex((x: { id: any; }) => x.id == isSavedClassCourse.id);
    if (indexToRemove !== -1) {
      this.savedClassCourseList.splice(indexToRemove, 1);
    }

  if(isSavedClassCourse.isClassCourseSavedByCurrentUser){
    isSavedClassCourse.savedClassCourseCount -= 1;
    isSavedClassCourse.isClassCourseSavedByCurrentUser = false;
    this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:this.removedMessage});
   }
   else{
    isSavedClassCourse.savedClassCourseCount += 1;
    isSavedClassCourse.isClassCourseSavedByCurrentUser = true;
    this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:this.savedMessage});
   }

  this._schoolService.saveClassCourse(id,this.userId,type).subscribe((result) => {
  });
}

getDeletedSchool(schoolId:string){[
  this.schoolId = schoolId
]}

deleteSchoolTeacher() {
  this.loadingIcon = true;
  this._userService.deleteSchoolTeacher(this.schoolId).subscribe((response: any) => {
      this.messageService.add({severity: 'success',summary: 'Success',life: 3000,detail: 'You have left the school successfully'});
      this.ngOnInit();
    });
}

deleteSchoolStudent() {
  this.loadingIcon = true;
  this._userService.deleteSchoolStudent(this.schoolId).subscribe((response: any) => {
      this.messageService.add({severity: 'success',summary: 'Success',life: 3000,detail: 'You have left the school successfully'});
      this.ngOnInit();
    });
}

getSharedPostsByUser(userId:string, isSharedPostList?:boolean){
  debugger
  this.loadingIcon = true;
  this.isPostTab = false;
  this.isSavedClassCourseTab = false;
  this.isSavedPostTab = false;
  this.isLikedPostTab = false;
  this.isSharedPostTab = true;
  if(isSharedPostList != undefined){
    this.isSharedPostList = isSharedPostList;
  }
  else{
    this.isSharedPostList = true;
  }
  this.sharedPostsPageNumber = 1;
  this.reelsPageNumber = 1;
  this._postService.getSharedPostsByUser(userId,this.sharedPostsPageNumber,1).subscribe((response) => {
    debugger
    this.sharedPostsList = response;
    this.loadingIcon = false;
   }); 

   this._postService.getSharedPostsByUser(userId,this.sharedPostsPageNumber,3).subscribe((response) => {
    debugger
    this.sharedReelsList = response;
    this.cd.detectChanges();
    this.addEventListnerOnCarousel();
   }); 

}

getLikedPostsByUser(userId:string, isLikedPostList?:boolean){

  debugger
  this.loadingIcon = true;
  this.isPostTab = false;
  this.isSavedClassCourseTab = false;
  this.isSavedPostTab = false;
  this.isSharedPostTab = false;
  this.isLikedPostTab = true;
  if(isLikedPostList != undefined){
    this.isLikedPostList = isLikedPostList;
  }
  else{
    this.isLikedPostList = true;
  }
  this.likedPostsPageNumber = 1;
  this.reelsPageNumber = 1;
  this._postService.getLikedPostsByUser(userId,this.likedPostsPageNumber,1).subscribe((response) => {
    debugger
    this.likedPostsList = response;
    this.loadingIcon = false;
   }); 

   this._postService.getLikedPostsByUser(userId,this.likedPostsPageNumber,3).subscribe((response) => {
    debugger
    this.likedReelsList = response;
    this.cd.detectChanges();
    this.addEventListnerOnCarousel();
   }); 

}

}


