import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { MessageService } from 'primeng/api';
import { NotificationType } from 'src/root/interfaces/notification/notificationViewModel';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { UserPreference } from 'src/root/interfaces/post/userPreference';
import { NotificationService } from 'src/root/service/notification.service';
import { PostService } from 'src/root/service/post.service';
import { SchoolService } from 'src/root/service/school.service';
import { UserService } from 'src/root/service/user.service';
import { CreatePostComponent, addPostResponse } from '../createPost/createPost.component';
import { PostViewComponent, deletePostResponse, savedPostResponse } from '../postView/postView.component';
import { ReelsViewComponent, deleteReelResponse, savedReelResponse } from '../reels/reelsView.component';
import { SharePostComponent, sharedPostResponse } from '../sharePost/sharePost.component';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { AuthService } from 'src/root/service/auth.service';
import { BehaviorSubject, Subscribable, Subscription } from 'rxjs';
import { feedState } from 'src/root/userModule/user-auth/component/login/login.component';
import { PostAuthorTypeEnum } from 'src/root/Enums/postAuthorTypeEnum';
import { CertificateViewComponent } from '../certificateView/certificateView.component';
import { OpenSideBar, notifyMessageAndNotificationCount, totalMessageAndNotificationCount } from 'src/root/user-template/side-bar/side-bar.component';
import { TranslateService } from '@ngx-translate/core';
import { deleteModalPostResponse } from '../delete-confirmation/delete-confirmation.component';

@Component({
  selector: 'post-view',
  templateUrl: './userFeed.component.html',
  styleUrls: ['./userFeed.component.css'],
  providers: [MessageService]
})

export class UserFeedComponent extends MultilingualComponent implements OnInit, OnDestroy {

  private _userService;
  private _notificationService;
  showCommentsField: boolean = false;
  messageToGroup!: string;
  likeUnlikePost!: LikeUnlikePost;
  postView!: PostView;
  isProfileGrid: boolean = true;
  myFeeds: any;
  myFeedsReels: any;
  globalFeeds: any;
  isOpenSidebar: boolean = false;
  isOwner!: boolean;
  userId!: string;
  isDataLoaded: boolean = false;
  loadingIcon: boolean = false;
  postLoadingIcon: boolean = false;
  reelsLoadingIcon: boolean = false;
  currentLikedPostId!: string;
  likesLength!: number;
  isLiked!: boolean;
  gridItemInfo: any;
  isGridItemInfo: boolean = false;
  gridItemInfoForGlobal: any;
  isGridItemInfoForGlobal: boolean = false;
  private _postService;
  private _authService;
  itemsPerSlide = 5;
  singleSlideOffset = true;
  noWrap = true;
  globalSearchPageNumber = 1;
  globalSearchPageSize = 5;
  myFeedsPageNumber: number = 1;
  reelsPageNumber: number = 1;
  globalFeedsPageNumber: number = 1;
  globalReelsPageNumber: number = 1;
  scrollMyFeedResponseCount: number = 1;
  scrollGlobalFeedResponseCount: any;
  globalFeedReels: any;
  isGlobalFeed: boolean = false;
  isMyFeedsEmpty: boolean = false;
  isMyFeedReelsEmpty: boolean = false;
  @ViewChild('carousel') carousel!: ElementRef;
  @ViewChild('globalReelCarousel') globalReelCarousel!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('globalSearchResults') globalSearchResults!: ElementRef;
  @ViewChild('myFeedPlayer') myFeedPlayer!: ElementRef;
  @ViewChild('globalFeedPlayer') globalFeedPlayer!: ElementRef;

  scrolled: boolean = false;

  searchString: string = "";
  isOpenGlobalFeed: boolean = false;
  isGlobalPostsExist: boolean = false;
  isGlobalReelsExist: boolean = false;
  isMyFeedPostsExist: boolean = false;
  isMyFeedReelsExist: boolean = false;
  addPostSubscription!: Subscription;
  savedPostSubscription!: Subscription;
  changeLanguageSubscription!: Subscription;
  sharedPostSubscription!: Subscription;
  savedReelSubscription!: Subscription;
  deletePostSubscription!: Subscription;
  deleteReelSubscription!: Subscription;
  isGlobalFeedLoading!: boolean;
  gender!: string;

  feedTab!: string;
  globalSearchResult!: any;
  filteredMyFeedAttachments: any[] = [];
  filteredGlobalFeedAttachments: any[] = [];
  showSearchResults: boolean = false;
  searchNotFound: boolean = false;
  modalRef!: any;
  globalSearchField!: string;
  deleteModalPostSubscription!: Subscription;
  hamburgerCountSubscription!: Subscription;
  hamburgerCount:number = 0;

  constructor(injector: Injector, private renderer: Renderer2, private elementRef: ElementRef, private translateService: TranslateService, private authService: AuthService, private bsModalService: BsModalService, notificationService: NotificationService, postService: PostService, public userService: UserService, public options: ModalOptions, private fb: FormBuilder, private router: Router, private http: HttpClient, private activatedRoute: ActivatedRoute, public messageService: MessageService, private cd: ChangeDetectorRef) {
    super(injector);
    this._userService = userService;
    this._postService = postService;
    this._authService = authService;
    this._notificationService = notificationService;

    this.renderer.listen('document', 'click', (event: Event) => {
      const targetElement = event.target as HTMLElement;
      const isClickInsideInput = this.searchInput.nativeElement.contains(targetElement);
      const isClickInsideTemplate = targetElement.closest('.search-results') !== null;
      if (!isClickInsideInput && !isClickInsideTemplate) {
        this.showSearchResults = false; // Set a flag to hide the template
      }
    });
  }

  ngOnChanges(): void {
    if (this.carousel) {
      this.carousel.nativeElement.querySelectorAll('span.carousel-control-next-icon')
        .forEach((elem: Element) => {
          elem.remove();
        });
    }
  }

  ngOnInit(): void {
    this.checkScreenSize();
    if(this.isScreenMobile){
      this.itemsPerSlide = 2;
      this.profileGrid();
    }
    this.postLoadingIcon = false;
    this.loadingIcon = true;
    this._authService.loginState$.next(true);
    var selectedLang = localStorage.getItem('selectedLanguage');
    this.feedTab = localStorage.getItem('feedTab') ?? '';
    if (this.feedTab != '') {
      if (window.performance.navigation.type === 1) {
        var feedTab = localStorage.getItem('feedTab');
        feedTab = 'globalFeed';
        localStorage.setItem('feedTab', feedTab);
        this.feedTab = 'globalFeed';
      }
      // if (window.performance.navigation.type === 2) {
      //   this.feedTab = localStorage.getItem('feedTab')??'';
      // }
    }
    else{
        localStorage.setItem('feedTab', 'globalFeed');
        this.feedTab = "globalFeed";
      }
    this.gender = localStorage.getItem("gender") ?? '';
    this.translate.use(selectedLang ?? '');
    this.isOwnerOrNot();

    if (this.feedTab == 'globalFeed') {
      this.getGlobalFeeds();
    }
    else {
      this._userService.getMyFeed(1, this.myFeedsPageNumber, this.searchString).subscribe((response) => {
        try{
        this.isGlobalFeed = false;
        this.postLoadingIcon = false;
        this.myFeeds = response;
        this.myFeeds = this.getFilteredAttachments(this.myFeeds, "myFeed");
        this.isMyFeedPostsExist = true;
        this.checkMyFeedExist();
        if (this.myFeeds.length == 0) {
          this.isMyFeedsEmpty = true;
          // this.getGlobalFeedsData()
        }
        else{
          this.addListenerToNextButton();
        }
       }
        catch{
          this.isMyFeedsEmpty = true;
        }
        // this.isDataLoaded = true;
      });

      this._userService.getMyFeed(3, this.myFeedsPageNumber, this.searchString).subscribe((result) => {
        this.myFeedsReels = result;
        this.isMyFeedReelsExist = true;
        this.checkMyFeedExist();
        if (this.myFeedsReels.length == 0) {
          this.isMyFeedReelsEmpty = true;
          // this.getGlobalFeedsData()
        }
        // this.isDataLoaded = true;
        // this.loadingIcon = false;
        else{
          this.addListenerToNextButton();
        }
      });
    }

    this.getGlobalFeedsData();
    this.InitializeLikeUnlikePost();

    if (!this.addPostSubscription) {
      this.addPostSubscription = addPostResponse.subscribe((postResponse: any) => {
        var feedTab = localStorage.getItem('feedTab');
        feedTab = 'myFeed';
        localStorage.setItem('feedTab', feedTab);
        this.feedTab = "myFeed";
        this.router.navigateByUrl(`user/userFeed}`);
        this.refreshRoute(postResponse);
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
      if (response.postType == 1) {
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('PostSharedSuccessfully');
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        var post = this.myFeeds?.find((x:any) => x.id == response.postId);
        if (post == undefined || null) {
          var post = this.globalFeeds.find((x: { id: string; }) => x.id == response.postId);
          post.postSharedCount++;
        }
      }
      else{
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('ReelSharedSuccessfully');
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
      }
    });

    if (!this.changeLanguageSubscription) {
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.translate.use(response.language);
      })
    }

    feedState.subscribe(response => {
    })

    if (!this.deleteModalPostSubscription) {
      this.deleteModalPostSubscription = deletePostResponse.subscribe(response => {
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('PostDeletedSuccessfully');
        this.isGridItemInfo = false;
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        var deletedPost = this.myFeeds?.find((x: { id: string; }) => x.id == response.postId);
        if (deletedPost != null) {
          const index = this.myFeeds.indexOf(deletedPost);
          if (index > -1) {
            this.myFeeds.splice(index, 1);
          }
        }
        var deletedPost = this.globalFeeds?.find((x: { id: string; }) => x.id == response.postId);
        if (deletedPost != null) {
          const index = this.globalFeeds.indexOf(deletedPost);
          if (index > -1) {
            this.globalFeeds.splice(index, 1);
          }
        }
      });
    }

    if (!this.deleteReelSubscription) {
      this.deleteReelSubscription = deleteReelResponse.subscribe(response => {
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Reel deleted successfully' });
        var deletedReel = this.myFeedsReels?.find((x: { id: string; }) => x.id == response.postId);
        if (deletedReel != null) {
          const index = this.myFeedsReels.indexOf(deletedReel);
          if (index > -1) {
            this.myFeedsReels.splice(index, 1);
          }
        }
        var deletedReel = this.globalFeedReels?.find((x: { id: string; }) => x.id == response.postId);
        if (deletedReel != null) {
          const index = this.globalFeedReels.indexOf(deletedReel);
          if (index > -1) {
            this.globalFeedReels.splice(index, 1);
          }
        }
      });
    }

    if (!this.hamburgerCountSubscription) {
      this.hamburgerCountSubscription = totalMessageAndNotificationCount.subscribe(response => {
        this.hamburgerCount = response.hamburgerCount;
      });
    }
    notifyMessageAndNotificationCount.next({});

    const buttons = document.querySelectorAll(".videoChange");
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        let VideoElement:HTMLVideoElement | null = document.getElementById('#displayVideo') as HTMLVideoElement
        VideoElement.pause();
      });
    });

    if(!this.deleteModalPostSubscription){
      this.deleteModalPostSubscription = deleteModalPostResponse.subscribe(response =>{
        this.ngOnInit();
      })
    }



  }

  checkMyFeedExist() {
    if (this.isMyFeedPostsExist && this.isMyFeedReelsExist) {
      this.isDataLoaded = true;
      this.loadingIcon = false;
      this.cd.detectChanges();
      var feedTabEmpty = localStorage.getItem('feedTab') ?? '';
      if(feedTabEmpty == ''){
        localStorage.setItem('feedTab', 'globalFeed');
        this.cd.detectChanges();
      }
      else{
        localStorage.setItem('feedTab', 'myFeed');
      }
    }
  }

  ngOnDestroy(): void {
    if (this.changeLanguageSubscription) {
      this.changeLanguageSubscription.unsubscribe();
    }
    if (this.sharedPostSubscription) {
      this.sharedPostSubscription.unsubscribe();
    }
    if (this.savedReelSubscription) {
      this.savedReelSubscription.unsubscribe();
    }
    if (this.deletePostSubscription) {
      this.deletePostSubscription.unsubscribe();
    }
    if (this.deleteReelSubscription) {
      this.deleteReelSubscription.unsubscribe();
    }
    if (this.addPostSubscription) {
      this.addPostSubscription.unsubscribe();
    }
    if (this.deleteModalPostSubscription) {
      this.deleteModalPostSubscription.unsubscribe();
    }
    if (this.hamburgerCountSubscription) {
      this.hamburgerCountSubscription.unsubscribe();
    }
  }

  getGlobalFeedsData() {
    if (this.isMyFeedsEmpty && this.isMyFeedReelsEmpty) {
      this.getGlobalFeeds();
    }
  }

  addListenerToNextButton() {
    if (this.carousel != undefined) {

      setTimeout(() => {
        if ($('#reels-carousel')[0].querySelectorAll('a.carousel-control-next')[0]) {
          $('#reels-carousel')[0].querySelectorAll('a.carousel-control-next')[0].addEventListener('click', () => {
            this.reelsPageNumber++;
            if (this.reelsPageNumber == 2) {
              this.reelsLoadingIcon = true;
            }
            this._userService.getMyFeed(3, this.reelsPageNumber, this.searchString).subscribe((response) => {
              this.myFeedsReels = [...this.myFeedsReels, ...response];
              this.reelsLoadingIcon = false;
            });
          })
        }
      },
        1500);
    }
  }

  addGlobalFeedListenerToNextButton() {
    if (this.globalReelCarousel != undefined) {

      setTimeout(() => {
        if ($('#globalReels-carousel')[0].querySelectorAll('a.carousel-control-next')[0]) {
          $('#globalReels-carousel')[0].querySelectorAll('a.carousel-control-next')[0].addEventListener('click', () => {
            this.globalReelsPageNumber++;
            if (this.globalReelsPageNumber == 2) {
              this.reelsLoadingIcon = true;
            }

            this._userService.getGlobalFeed(3, this.globalReelsPageNumber, this.searchString).subscribe((result) => {
              this.globalFeedReels = [...this.globalFeedReels, ...result];
              this.reelsLoadingIcon = false;
            });
          })
        }
      },
        1500);
    }
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    const windowSize = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;
    if (!this.loadingIcon) {
      if (scrollPosition >= bodyHeight - windowSize) {
        if (!this.isGlobalFeed) {
          if (!this.scrolled && this.scrollMyFeedResponseCount != 0 && this.myFeeds != undefined) {
            this.scrolled = true;
            this.postLoadingIcon = true;
            this.myFeedsPageNumber++;
            this._userService.getMyFeed(1, this.myFeedsPageNumber, this.searchString).subscribe((response) => {
              if (this.myFeeds != undefined) {
                var result = this.getFilteredAttachments(response, "myFeed");
                this.myFeeds = [...this.myFeeds, ...result];
              }
              this.postLoadingIcon = false;
              this.scrollMyFeedResponseCount = response.length;
              this.scrolled = false;
            });

          }
        }
        else {
          if (!this.scrolled && this.scrollGlobalFeedResponseCount != 0) {
            this.scrolled = true;
            this.postLoadingIcon = true;
            this.globalFeedsPageNumber++;
            this._userService.getGlobalFeed(1, this.globalFeedsPageNumber, this.searchString).subscribe((result) => {
              // this.globalFeeds =[...this.globalFeeds, ...result];
              // this.globalFeeds = this.getFilteredAttachments(this.globalFeeds,"globalFeed");
              var result = this.getFilteredAttachments(result, "globalFeed");
              this.globalFeeds = [...this.globalFeeds, ...result];
              this.postLoadingIcon = false;
              this.scrollGlobalFeedResponseCount = result;
              this.scrolled = false;
            });
          }
          // }
        }
      }
    }
  }

  InitializeLikeUnlikePost() {
    this.likeUnlikePost = {
      postId: '',
      userId: '',
      isLike: false,
      commentId: ''
    };
  }

  profileGrid() {
    this.isProfileGrid = true;
  }

  profileList() {
    this.isProfileGrid = false;
    this.isGridItemInfo = true;
    this.isGridItemInfoForGlobal = true;
    this.cd.detectChanges();
    if (this.myFeedPlayer != undefined) {
      // videojs(this.myFeedPlayer.nativeElement, {autoplay: false});
    }

    if (this.globalFeedPlayer != undefined) {
      // videojs(this.globalFeedPlayer.nativeElement, {autoplay: false});
    }
  }

  saveUserPreference(title: string, description: string, postTags: any) {
    var tagString = '';
    postTags.forEach(function (item: any) {
      tagString = tagString + item.postTagValue
    });

    var preferenceString = (title ?? '') + ' ' + (description ?? '') + ' ' + tagString ?? '';
    this._userService.saveUserPreference(preferenceString).subscribe((response) => {
      this.myFeeds = response;
    });
  }

  openSidebar() {
    OpenSideBar.next({ isOpenSideBar: true })
  }

  openPostsViewModal(posts: any, postType?: string): void {
    if (postType == "myFeeds") {
      var postAttachments = this.filteredMyFeedAttachments.filter(x => x.postId == posts.id);
    }
    else {
      var postAttachments = this.filteredGlobalFeedAttachments.filter(x => x.postId == posts.id);
    }
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

  getGlobalFeeds() {
    var feedTab = localStorage.getItem('feedTab');
    feedTab = 'globalFeed';
    localStorage.setItem('feedTab', feedTab);
    this.feedTab = feedTab;
    if (this.isGlobalFeedLoading) {
      return;
    }
    this.isOpenGlobalFeed = true;
    this.isGlobalFeed = true;
    this.loadingIcon = true;
    if (this.globalFeeds == undefined) {
      this.loadingIcon = true;
      this._userService.getGlobalFeed(1, this.globalFeedsPageNumber, this.searchString).subscribe((response) => {
        this.globalFeeds = response;
        this.globalFeeds = this.getFilteredAttachments(this.globalFeeds, "globalFeed");
        // this.loadingIcon = false;
        // this.isDataLoaded = true;
        this.isGlobalPostsExist = true;
        this.checkGlobalFeedExist();
        this.addGlobalFeedListenerToNextButton();
      });
    }
    this._userService.getGlobalFeed(3, this.globalReelsPageNumber, this.searchString).subscribe((result) => {
      this.globalFeedReels = result;
      // this.loadingIcon = false;
      // this.isDataLoaded = true;
      this.isGlobalReelsExist = true;
      this.checkGlobalFeedExist();
      this.addGlobalFeedListenerToNextButton();
    });

    this.isGlobalFeedLoading = true;
    feedState.next('globalFeed');
  }

  checkGlobalFeedExist() {
    if (this.isGlobalPostsExist && this.isGlobalReelsExist) {
      this.isDataLoaded = true;
      this.loadingIcon = false;
      this.cd.detectChanges();
    }
  }

  isOwnerOrNot() {
    var validToken = localStorage.getItem("jwt");
    if (validToken != null) {
      let jwtData = validToken.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.userId = decodedJwtData.jti;
      this.gender = localStorage.getItem("gender") ?? "";
      if (this.gender == "") {
        localStorage.setItem("gender", decodedJwtData.gender);
      }
    }
  }

  openPostModal(): void {
    const initialState = {
      userId: this.userId,
      from: "user"
    };
    this.modalRef = this.bsModalService.show(CreatePostComponent, { initialState });
    // this.modalRef.content.onClose.subscribe((result:any) => {
    // var feedTab = sessionStorage.getItem('feedTab');
    // feedTab = 'myFeed';
    // sessionStorage.setItem('feedTab','myFeed');
    // this.feedTab = 'myFeed';
    // //var a = this.myFeeds;
    // //var b = this.myFeedsReels;
    // //this.cd.detectChanges();
    //  //this.getMyFeeds();
    //   // Handle the response from the modal component here
    // });
  }

  likeUnlikePosts(postId: string, isLike: boolean, postType: number, post: any) {
    this.currentLikedPostId = postId;

    this.myFeeds.filter((p: any) => p.id == postId).forEach((item: any) => {
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
      this.myFeeds.filter((p: any) => p.id == postId).forEach((item: any) => {
        var itemss = item.likes;
        item.likes = response;
      });
      this.InitializeLikeUnlikePost();
      console.log("succes");
    });
  }

  likeUnlikeGlobalPosts(postId: string, isLike: boolean, postType: number, post: any) {
    this.currentLikedPostId = postId;
    this.globalFeeds.filter((p: any) => p.id == postId).forEach((item: any) => {
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
      this.globalFeeds.filter((p: any) => p.id == postId).forEach((item: any) => {
        var itemss = item.likes;
        item.likes = response;
      });
      this.InitializeLikeUnlikePost();
      console.log("succes");
    });
  }

  showPostDiv(post: any, From: string) {
    if (From == 'FromMyFeeds') {
      $('.imgDisplay').attr("style", "display:none;")
      $('.' + post.id).prevAll('.imgDisplay').first().attr("style", "display:block;");
      var posts: any[] = this.myFeeds;
      this.gridItemInfo = post;
      this.isGridItemInfo = true;
      this.cd.detectChanges();
      // const player = videojs(this.myFeedPlayer.nativeElement, {autoplay: false});
      this.addPostView(this.gridItemInfo.id, From);
      var postValueTag = this.gridItemInfo.postTags[0].postTagValue;
      try{
      this.postsTagValues = JSON.parse(postValueTag);}
      catch{}
    }
    else {
      $('.imgDisplay').attr("style", "display:none;")
      $('.' + post.id).prevAll('.imgDisplay').first().attr("style", "display:block;");
      var posts: any[] = this.globalFeeds;
      this.gridItemInfoForGlobal = post;
      this.isGridItemInfoForGlobal = true;
      this.cd.detectChanges();
      // const player = videojs(this.globalFeedPlayer.nativeElement, {autoplay: false});
      this.addPostView(this.gridItemInfoForGlobal.id, From);
      var postValueTag = this.gridItemInfoForGlobal.postTags[0].postTagValue;
      this.postsTagValues = JSON.parse(postValueTag);
    }

  }
  postsTagValues: any;

  addPostView(postId: string, From: string) {
    if (this.userId != undefined) {
      this.initializePostView();
      this.postView.postId = postId;
      this._postService.postView(this.postView).subscribe((response) => {
        if (From == 'FromMyFeeds') {
          this.gridItemInfo.views.length = response;
        }
        else {
          this.gridItemInfoForGlobal.views.length = response;
        }
      });
    }
  }

  initializePostView() {
    this.postView = {
      postId: '',
      userId: ''
    }
  }

  hideGridItemInfo(From: string) {
    let videoElement: HTMLVideoElement | null = document.getElementById('displayVideo') as HTMLVideoElement
    if(videoElement){
       var vdo: HTMLVideoElement | null = videoElement.children[0]  as HTMLVideoElement
       if(vdo){
        vdo.pause();
       }
    }
    if (From == 'FromMyFeeds') {
      this.isGridItemInfo = this.isGridItemInfo ? false : true;
    }
    else {
      this.isGridItemInfoForGlobal = this.isGridItemInfoForGlobal ? false : true;
    }
  }

  getSelectedSchool(schoolName: string) {
    window.location.href = `profile/school/${schoolName.split(" ").join("").toLowerCase()}`;
  }

  getSelectedClass(className: string, schoolName: string) {
    window.location.href = `profile/class/${schoolName.split(" ").join("").toLowerCase()}/${className.split(" ").join("").toLowerCase()}`;
  }

  getSelectedCourse(courseName: string, schoolName: string) {
    window.location.href = `profile/course/${schoolName.split(" ").join("").toLowerCase()}/${courseName.split(" ").join("").toLowerCase()}`;
  }

  getUserDetails(userId: string) {
    window.location.href = `user/userProfile/${userId}`;
  }

  openReelsViewModal(postAttachmentId: string, from: number, postId: string): void {
    if (from == 1) {
      this.router.navigate(
        [`user/reelsView//""/myFeed/${postAttachmentId}/${postId}`],
        { state: { post: { postId: postId } } });
    }
    else {
      this.router.navigate(
        [`user/reelsView/""/globalFeed/${postAttachmentId}/${postId}`],
        { state: { post: { postId: postId } } });
    }
    // const initialState = {
    //   postAttachmentId: postAttachmentId
    // };
    // this.bsModalService.show(ReelsViewComponent,{initialState});
  }

  openSharePostModal(postId: string, postType: number): void {
    const initialState = {
      postId: postId,
      postType: postType
    };
    this.bsModalService.show(SharePostComponent, { initialState });
  }

  globalSearch() {
    this.globalSearchPageNumber = 1;
    this.globalSearchPageSize = 5;
    this.showSearchResults = false;
    if (this.searchString.length > 2) {
      this._userService.globalSearch(this.searchString, this.globalSearchPageNumber, this.globalSearchPageSize).subscribe((response: any) => {
        this.loadingIcon = false;
        this.globalSearchResult = {};
        response.forEach((item: any) => {
          if (item.type == 4 && !item.isPost) {
            this.globalSearchField = "User";
          }
          if (item.type == 1 && !item.isPost) {
            this.globalSearchField = "School";
          }
          if(item.type == 2 && !item.isPost){
            this.globalSearchField = "Class"
          }
          if (item.type == 3 && !item.isPost) {
            this.globalSearchField = "Course";
          }
          if (item.isPost) {
            this.globalSearchField = "Posts";
          }
          if (this.globalSearchResult[this.globalSearchField]) {
            if (this.globalSearchResult[this.globalSearchField].length < 5) {
              this.globalSearchResult[this.globalSearchField].push(item);
            }
          } else {
            this.globalSearchResult[this.globalSearchField] = [item];
          }
        });

        // const originalObject = {
        //   School: [/* Array of school objects */],
        //   ClassAndCourse: [/* Array of class and course objects */],
        //   User: [/* Array of user objects */]
        // };

        const reorderedObject = {
          User: this.globalSearchResult.User,
          ClassAndCourse: this.globalSearchResult.ClassAndCourse,
          School: this.globalSearchResult.School
        };

        var ab = reorderedObject;

        var a = this.globalSearchResult;
        //  this.globalSearchResult = response;
        this.showSearchResults = true;
        if (response.length == 0) {
          this.searchNotFound = true;
        }
        else {
          this.searchNotFound = false;
        }
      });
    }
    //   if(!this.isOpenGlobalFeed){
    //   this.myFeedsPageNumber = 1;
    //   this.reelsPageNumber = 1;

    //   if(this.searchString.length >2 || this.searchString == ""){
    //     // this.loadingIcon = true;
    //     this._userService.getMyFeed(1,this.myFeedsPageNumber,this.searchString).subscribe((response) => {
    //       this.loadingIcon = false;
    //        this.myFeeds = response;
    //       });

    //       this._userService.getMyFeed(3,this.myFeedsPageNumber,this.searchString).subscribe((result) => {
    //         this.myFeedsReels = result;
    //         this.loadingIcon = false;
    //       });
    //   }
    // }

    // else{
    //   this.globalFeedsPageNumber = 1;
    //   this.globalReelsPageNumber = 1;

    //   if(this.searchString.length >2 || this.searchString == ""){
    //     // this.loadingIcon = true;
    //     this._userService.getGlobalFeed(1,this.globalFeedsPageNumber,this.searchString).subscribe((response) => {
    //       this.globalFeeds = response;
    //       this.loadingIcon = false;
    //     });

    //     this._userService.getGlobalFeed(3, this.globalReelsPageNumber,this.searchString).subscribe((result) => {
    //         this.globalFeedReels = result;
    //         this.loadingIcon = false;
    //       });
    //     }
    //   }
  }

  getMyFeeds() {
    this.isOpenGlobalFeed = false;
    var feedTab = localStorage.getItem('feedTab') ?? '';
    feedTab = 'myFeed';
    localStorage.setItem('feedTab', feedTab);
    this.feedTab = feedTab;

    if (this.myFeeds == undefined && this.myFeedsReels == undefined) {
      this.loadingIcon = true;
      this._userService.getMyFeed(1, this.myFeedsPageNumber, this.searchString).subscribe((response) => {
        if(response){
          this.isGlobalFeed = false;
          this.postLoadingIcon = false;
          this.myFeeds = response;
          this.myFeeds = this.getFilteredAttachments(this.myFeeds, "myFeed");
          this.isMyFeedPostsExist = true;
          this.checkMyFeedExist();
          if (this.myFeeds.length == 0) {
            this.isMyFeedsEmpty = true;
            // this.getGlobalFeedsData()
          }
        }
      });

      this._userService.getMyFeed(3, this.myFeedsPageNumber, this.searchString).subscribe((result) => {
        if(result){
          this.myFeedsReels = result;
          this.isMyFeedReelsExist = true;
          this.checkMyFeedExist();
          if (this.myFeedsReels.length == 0) {
            this.isMyFeedReelsEmpty = true;
            // this.getGlobalFeedsData()
          }
          else{
            this.addListenerToNextButton();
          }
        }
      });
    }
    this.cd.detectChanges();
  }

  savePost(postId: string) {
    var myFeeds: any[] = this.myFeeds;
    var isSavedPost = myFeeds?.find(x => x.id == postId) ?? undefined;
    if (isSavedPost == undefined) {
      var isSavedPost = this.globalFeeds.find((x: { id: string; }) => x.id == postId);
    }

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
  back(): void {
    window.history.back();
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

  getFilteredAttachments(feeds: any, from: string): any {
    const allAttachments = feeds.flatMap((post: { postAttachments: any; }) => post.postAttachments);
    if (from == "myFeed") {
      var result = allAttachments.filter((attachment: { fileType: number; }) => attachment.fileType === 3);
      this.filteredMyFeedAttachments = [...this.filteredMyFeedAttachments, ...result];
    }
    else {
      var result = allAttachments.filter((attachment: { fileType: number; }) => attachment.fileType === 3);
      this.filteredGlobalFeedAttachments = [...this.filteredGlobalFeedAttachments, ...result];
    }
    feeds = feeds.map((post: { postAttachments: any[]; }) => {
      const filteredPostAttachments = post.postAttachments.filter(postAttachment => postAttachment.fileType !== 3);
      return { ...post, postAttachments: filteredPostAttachments };
    });
    return feeds;
  }

  refreshRoute(postResponse: any) {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(currentUrl);

      setTimeout(() => {

        if (postResponse.response.postType == 1) {
          var translatedMessage = this.translateService.instant('PostCreatedSuccessfully');
        }
        else {
          var translatedMessage = this.translateService.instant('ReelCreatedSuccessfully');
        }
        const translatedSummary = this.translateService.instant('Success');

        this.messageService.add({
          severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage,
        });
        this.cd.detectChanges();
      }, 3000);
    });
  }

  getObjectKeys(obj: any): string[] {
    if (obj != null) {
      console.log(Object.keys(obj));
      return Object.keys(obj).sort();
    }
    return [];
  }

  // @HostListener('document:click', ['$event'])
  // clickOutside(event: MouseEvent) {
  //   this.cd.detectChanges();
  //   if (!this.searchInput.nativeElement.contains(event.target) && !this.globalSearchResults.nativeElement.contains(event.target)) {
  //     this.showSearchResults = false;
  //   }
  // }

  toggleSearchResults() {
    this.showSearchResults = !this.showSearchResults;
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
    const parts = event.currentTarget.className.split(' ');
    this.postDivId = parts[3];

    if (post.postAttachments != undefined) {
      var postAttach = post.postAttachments[0];
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




  carouselConfigForReels = {
    slidesToShow: 1,
    slidesToScroll: 1,
    accessibility: true,
    dots: true,
    numberOfDots:3,
    vertical:true,
    verticalSwiping:true,
    arrows: false,
    autoplay: false,
    infinite:false,
    autoplaySpeed: 3000,
    initialSlide: -1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };


  carouselConfig = {
    slidesToShow: this.itemsPerSlide,
    slidesToScroll: 1,
    autoplay: false,
    infinite: false,
    arrow:true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrow:false
        },
      },
    ],
  };



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
      if (this.globalReelCarousel != undefined) {
        const nextButton = $('#globalReels-carousel')[0].querySelectorAll('a.carousel-control-prev')[0] as HTMLButtonElement
        if (nextButton) {
          nextButton.click();
        }
      }
    } else if (deltaX < 0) {
      const nextButton = $('#globalReels-carousel')[0].querySelectorAll('a.carousel-control-next')[0] as HTMLButtonElement
      if (nextButton) {
        nextButton.click();
      }
    }
  }


  touchEndUser(event: any) {
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


  hideSearchSection(){
    this.showSearchResults = false;
  }

  showSearchButtonForMobile:boolean=false;

  openSearch(){
    this.showSearchButtonForMobile=true;
  }

  navigateToUrl(url:string){
    window.location.href = url;
  }
}
