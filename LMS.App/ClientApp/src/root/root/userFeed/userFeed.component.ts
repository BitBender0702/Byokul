import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'post-view',
    templateUrl: './userFeed.component.html',
    styleUrls: ['./userFeed.component.css'],
    providers: [MessageService]
  })

export class UserFeedComponent extends MultilingualComponent implements OnInit, OnDestroy {

    private _userService;
    private _notificationService;
    showCommentsField:boolean = false;
    messageToGroup!:string;
    likeUnlikePost!: LikeUnlikePost;
    postView!:PostView;
    isProfileGrid:boolean = false;
    myFeeds:any;
    myFeedsReels:any;
    globalFeeds:any;
    isOpenSidebar:boolean = false;
    isOwner!:boolean;
    userId!:string;
    isDataLoaded:boolean = false;
    loadingIcon:boolean = false;
    postLoadingIcon: boolean = false;
    reelsLoadingIcon:boolean = false;
    currentLikedPostId!:string;
    likesLength!:number;
    isLiked!:boolean;
    gridItemInfo:any;
    isGridItemInfo: boolean = false;
    gridItemInfoForGlobal:any;
    isGridItemInfoForGlobal: boolean = false;
    private _postService;
    private _authService;
    itemsPerSlide = 7;
    singleSlideOffset = true;
    noWrap = true;
    globalSearchPageNumber = 1;
    globalSearchPageSize = 5;
    myFeedsPageNumber:number = 1;
    reelsPageNumber:number = 1;
    globalFeedsPageNumber:number = 1;
    globalReelsPageNumber:number = 1;
    scrollMyFeedResponseCount:number = 1;
    scrollGlobalFeedResponseCount:any;
    globalFeedReels:any;
    isGlobalFeed:boolean = false;
    isMyFeedsEmpty:boolean = false;
    isMyFeedReelsEmpty:boolean = false;
    @ViewChild('carousel') carousel!: ElementRef;
    @ViewChild('globalReelCarousel') globalReelCarousel!: ElementRef;
    @ViewChild('searchInput') searchInput!: ElementRef;
    @ViewChild('myFeedPlayer') myFeedPlayer!: ElementRef;
    @ViewChild('globalFeedPlayer') globalFeedPlayer!: ElementRef;

    scrolled:boolean = false;

    searchString:string = "";
    isOpenGlobalFeed:boolean = false;
    isGlobalPostsExist:boolean = false;
    isGlobalReelsExist:boolean = false;
    isMyFeedPostsExist:boolean = false;
    isMyFeedReelsExist:boolean = false;
    addPostSubscription!: Subscription;
    savedPostSubscription!: Subscription;
    changeLanguageSubscription!: Subscription;
    sharedPostSubscription!: Subscription;
    savedReelSubscription!: Subscription;
    deletePostSubscription!: Subscription;
    deleteReelSubscription!: Subscription;
    isGlobalFeedLoading!:boolean;
    gender!:string;

    feedTab!:string;
    globalSearchResult!:any;
    filteredMyFeedAttachments:any[] = [];
    filteredGlobalFeedAttachments:any[] = [];
    showSearchResults:boolean = false;
    searchNotFound:boolean = false;
    modalRef!:any;
    globalSearchField!:string;


    constructor(injector: Injector,private translateService: TranslateService,private authService:AuthService,private bsModalService: BsModalService,notificationService:NotificationService,postService: PostService,public userService:UserService, public options: ModalOptions,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute,public messageService:MessageService,private cd: ChangeDetectorRef) { 
      super(injector);
      this._userService = userService;
      this._postService = postService;
      this._authService = authService;
      this._notificationService = notificationService;
    }

    ngOnChanges(): void {
      if(this.carousel){
      this.carousel.nativeElement.querySelectorAll('span.carousel-control-next-icon')
        .forEach((elem: Element) => {
          elem.remove();
        });
      }
    }
  
    ngOnInit(): void {
      this.postLoadingIcon = false;
      this.loadingIcon = true;
      this._authService.loginState$.next(true);
      var selectedLang = localStorage.getItem('selectedLanguage');
      this.feedTab = localStorage.getItem('feedTab')??'';
      if(this.feedTab != ''){
        if (window.performance.navigation.type === 1) {
          var feedTab = localStorage.getItem('feedTab');
          feedTab = 'myFeed';
          localStorage.setItem('feedTab',feedTab);
          this.feedTab = 'myFeed';
        }
        // if (window.performance.navigation.type === 2) {
        //   this.feedTab = localStorage.getItem('feedTab')??'';
        // }
      }
      this.gender = localStorage.getItem("gender")??'';
      this.translate.use(selectedLang ?? '');
      this.isOwnerOrNot();
      
      if(this.feedTab == 'globalFeed'){
          this.getGlobalFeeds();
      }
      else{
        this._userService.getMyFeed(1,this.myFeedsPageNumber,this.searchString).subscribe((response) => {
          this.isGlobalFeed = false;
          this.postLoadingIcon = false;
            this.myFeeds = response;
            this.myFeeds = this.getFilteredAttachments(this.myFeeds,"myFeed");
            this.isMyFeedPostsExist = true;
            this.checkMyFeedExist();
            if(this.myFeeds.length == 0){
               this.isMyFeedsEmpty = true;
               this.getGlobalFeedsData()
            }
            this.addListenerToNextButton();
              // this.isDataLoaded = true;
          });

          this._userService.getMyFeed(3,this.myFeedsPageNumber,this.searchString).subscribe((result) => {
            this.myFeedsReels = result;
            this.isMyFeedReelsExist = true;
            this.checkMyFeedExist();
            if(this.myFeedsReels.length == 0){
              this.isMyFeedReelsEmpty = true;
              this.getGlobalFeedsData()
           }
            // this.isDataLoaded = true;
            // this.loadingIcon = false;
            this.addListenerToNextButton();
          });
        }

          this.getGlobalFeedsData();
          this.InitializeLikeUnlikePost();

          if(!this.addPostSubscription){
           this.addPostSubscription = addPostResponse.subscribe((response) => {   
            var feedTab = localStorage.getItem('feedTab');
            feedTab = 'myFeed';
            localStorage.setItem('feedTab',feedTab);
            this.router.navigateByUrl(`user/userFeed}`);
            this.refreshRoute();
              //this.ngOnInit();
              const translatedMessage = this.translateService.instant('PostCreatedSuccessfully');
              const translatedSummary = this.translateService.instant('Success');
              this.messageService.add({severity: 'success',summary: translatedSummary,life: 3000,detail: translatedMessage,
              });
            });
          }

          if(!this.savedPostSubscription){
            this.savedPostSubscription = savedPostResponse.subscribe(response => {
              const translatedSummary = this.translateService.instant('Success');
              if(response.isPostSaved){
                const translatedMessage = this.translateService.instant('PostSavedSuccessfully');
                this.messageService.add({severity:'success', summary:translatedSummary,life: 3000, detail:translatedMessage});
              }
              if(!response.isPostSaved){
                const translatedMessage = this.translateService.instant('PostRemovedSuccessfully');
                this.messageService.add({severity:'success', summary:translatedSummary,life: 3000, detail:translatedMessage});
              }
            });
          }

          if(!this.savedReelSubscription){
            this.savedReelSubscription = savedReelResponse.subscribe(response => {
              const translatedSummary = this.translateService.instant('Success');
              if(response.isReelSaved){
                const translatedMessage = this.translateService.instant('ReelSavedSuccessfully');
                this.messageService.add({severity:'success', summary:translatedSummary,life: 3000, detail:translatedMessage});
              }
              if(!response.isReelSaved){
                const translatedMessage = this.translateService.instant('ReelRemovedSuccessfully');
                this.messageService.add({severity:'success', summary:translatedSummary,life: 3000, detail:translatedMessage});
              }
            });
          }

          this.sharedPostSubscription = sharedPostResponse.subscribe( response => {
            if(response.postType == 1){
              const translatedSummary = this.translateService.instant('Success');
              const translatedMessage = this.translateService.instant('ReelSavedSuccessfully');
              this.messageService.add({severity:'success', summary:translatedSummary,life: 3000, detail:translatedMessage});
              var post = this.myFeeds.find((x: { id: string; }) => x.id == response.postId); 
              if(post == undefined || null){
                var post = this.globalFeeds.find((x: { id: string; }) => x.id == response.postId); 
              }
              post.postSharedCount++;
            }
            else
              this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel shared successfully'});
            });

          if(!this.changeLanguageSubscription){
            this.changeLanguageSubscription = changeLanguage.subscribe(response => {
              this.translate.use(response.language);
            })
          }

            feedState.subscribe(response => {
            })

          if(!this.deletePostSubscription){
            this.deletePostSubscription = deletePostResponse.subscribe(response => {
                this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post deleted successfully'});
                var deletedPost = this.myFeeds?.find((x: { id: string; }) => x.id == response.postId);
                if(deletedPost != null){
                  const index = this.myFeeds.indexOf(deletedPost);
                  if (index > -1) {
                    this.myFeeds.splice(index, 1);
                  }
                }
                var deletedPost = this.globalFeeds?.find((x: { id: string; }) => x.id == response.postId);
                if(deletedPost != null){
                const index = this.globalFeeds.indexOf(deletedPost);
                if (index > -1) {
                  this.globalFeeds.splice(index, 1);
                 }
                }
            });
          }
      
          if(!this.deleteReelSubscription){
            this.deleteReelSubscription = deleteReelResponse.subscribe(response => {
                this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel deleted successfully'});
                var deletedReel = this.myFeedsReels?.find((x: { id: string; }) => x.id == response.postId);
                if(deletedReel != null){
                  const index = this.myFeedsReels.indexOf(deletedReel);
                  if (index > -1) {
                    this.myFeedsReels.splice(index, 1);
                  }
                }
                  var deletedReel = this.globalFeedReels?.find((x: { id: string; }) => x.id == response.postId);
                  if(deletedReel != null){
                  const index = this.globalFeedReels.indexOf(deletedReel);
                  if (index > -1) {
                    this.globalFeedReels.splice(index, 1);
                  }
                }
            });
          }
    }

    checkMyFeedExist(){
      if(this.isMyFeedPostsExist && this.isMyFeedReelsExist){
        this.isDataLoaded = true;
        this.loadingIcon = false;
        this.cd.detectChanges();
        localStorage.setItem('feedTab','myFeed');
      }
  }

  ngOnDestroy(): void {
    if(this.changeLanguageSubscription){
      this.changeLanguageSubscription.unsubscribe();
    }
    if(this.sharedPostSubscription){
      this.sharedPostSubscription.unsubscribe();
    }
    if(this.savedReelSubscription){
      this.savedReelSubscription.unsubscribe();
    }
    if(this.deletePostSubscription){
      this.deletePostSubscription.unsubscribe();
    }
    if(this.deleteReelSubscription){
      this.deleteReelSubscription.unsubscribe();
    }
  }

    getGlobalFeedsData(){
      if(this.isMyFeedsEmpty && this.isMyFeedReelsEmpty){
        this.getGlobalFeeds();
      }
    }

  addListenerToNextButton() {
    if(this.carousel != undefined){
      
      setTimeout(() => {
        if($('#reels-carousel')[0].querySelectorAll('a.carousel-control-next')[0])
        {
          $('#reels-carousel')[0].querySelectorAll('a.carousel-control-next')[0].addEventListener('click', () => {
            this.reelsPageNumber++;
            if(this.reelsPageNumber == 2){
              this.reelsLoadingIcon = true;
            }
            this._userService.getMyFeed(3, this.reelsPageNumber,this.searchString).subscribe((response) => {
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
    if(this.globalReelCarousel != undefined){
      
      setTimeout(() => {
        if($('#globalReels-carousel')[0].querySelectorAll('a.carousel-control-next')[0])
        {
          $('#globalReels-carousel')[0].querySelectorAll('a.carousel-control-next')[0].addEventListener('click', () => {
            this.globalReelsPageNumber++;
            if(this.globalReelsPageNumber == 2){
              this.reelsLoadingIcon = true;
            }

          this._userService.getGlobalFeed(3, this.globalReelsPageNumber,this.searchString).subscribe((result) => {
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
    if(!this.loadingIcon){
      if (scrollPosition >= bodyHeight - windowSize) {
        if(!this.isGlobalFeed){
          if(!this.scrolled && this.scrollMyFeedResponseCount != 0 && this.myFeeds !=undefined){
           this.scrolled = true;
           this.postLoadingIcon = true;
           this.myFeedsPageNumber++;
           this._userService.getMyFeed(1,this.myFeedsPageNumber,this.searchString).subscribe((response) => {
            if(this.myFeeds!=undefined){
             var result = this.getFilteredAttachments(response,"myFeed");    
             this.myFeeds = [...this.myFeeds, ...result]; 
            }
           this.postLoadingIcon = false;
           this.scrollMyFeedResponseCount = response.length;
           this.scrolled = false;
     });
    
  }
   }
  else{
    if(!this.scrolled && this.scrollGlobalFeedResponseCount != 0){
      this.scrolled = true;
    this.postLoadingIcon = true;
    this.globalFeedsPageNumber++;    
    this._userService.getGlobalFeed(1,this.globalFeedsPageNumber,this.searchString).subscribe((result) => {
      // this.globalFeeds =[...this.globalFeeds, ...result];
      // this.globalFeeds = this.getFilteredAttachments(this.globalFeeds,"globalFeed");
      var result = this.getFilteredAttachments(result,"globalFeed");    
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

    InitializeLikeUnlikePost(){
      this.likeUnlikePost = {
        postId: '',
        userId: '',
        isLike:false,
        commentId:''
       };
    }

    profileGrid(){
        this.isProfileGrid = true;
      }
  
      profileList(){
        this.isProfileGrid = false;
        this.isGridItemInfo = true;
        this.isGridItemInfoForGlobal = true;
        this.cd.detectChanges();
        if(this.myFeedPlayer != undefined){
          videojs(this.myFeedPlayer.nativeElement, {autoplay: false});
        }

        if(this.globalFeedPlayer != undefined){
          videojs(this.globalFeedPlayer.nativeElement, {autoplay: false});
        }
      }

      saveUserPreference(title:string,description:string,postTags:any){
      var tagString = '';
      postTags.forEach(function (item:any) {
        tagString = tagString + item.postTagValue
      }); 

      var preferenceString = (title??'') + ' ' + (description??'') + ' ' + tagString??'';
      this._userService.saveUserPreference(preferenceString).subscribe((response) => {
        this.myFeeds = response;
      });
      }

      openSidebar(){
        OpenSideBar.next({isOpenSideBar:true})
      }

      openPostsViewModal(posts:any,postType?:string): void {
      if(postType == "myFeeds"){
        var postAttachments = this.filteredMyFeedAttachments.filter(x => x.postId == posts.id);
      }
      else{
        var postAttachments = this.filteredGlobalFeedAttachments.filter(x => x.postId == posts.id);
      }
        const initialState = {
          posts: posts,
          postAttachments: postAttachments
        };
        this.bsModalService.show(PostViewComponent,{initialState});
      }

      getGlobalFeeds(){
        var feedTab = localStorage.getItem('feedTab');
        feedTab = 'globalFeed';
        localStorage.setItem('feedTab',feedTab);
        this.feedTab = feedTab;
        if(this.isGlobalFeedLoading){
          return;
        }
        this.isOpenGlobalFeed = true;
        this.isGlobalFeed = true;
        this.loadingIcon = true;
       if(this.globalFeeds == undefined){
        this.loadingIcon = true;
        this._userService.getGlobalFeed(1,this.globalFeedsPageNumber,this.searchString).subscribe((response) => {
            this.globalFeeds = response;
            this.globalFeeds = this.getFilteredAttachments(this.globalFeeds, "globalFeed");
            // this.loadingIcon = false;
            // this.isDataLoaded = true;
            this.isGlobalPostsExist = true;
            this.checkGlobalFeedExist()
          });
        }
        this._userService.getGlobalFeed(3, this.globalReelsPageNumber,this.searchString).subscribe((result) => {
            this.globalFeedReels = result;
            // this.loadingIcon = false;
            // this.isDataLoaded = true;
            this.isGlobalReelsExist = true;
            this.checkGlobalFeedExist()
            this.addGlobalFeedListenerToNextButton();
            });

        this.isGlobalFeedLoading = true;  
        feedState.next('globalFeed');  
        }

        checkGlobalFeedExist(){
           if(this.isGlobalPostsExist && this.isGlobalReelsExist){
            this.isDataLoaded = true;
             this.loadingIcon = false;
           }
        }

      isOwnerOrNot(){
        var validToken = localStorage.getItem("jwt");
          if (validToken != null) {
            let jwtData = validToken.split('.')[1]
            let decodedJwtJsonData = window.atob(jwtData)
            let decodedJwtData = JSON.parse(decodedJwtJsonData);
            this.userId = decodedJwtData.jti;
            this.gender = localStorage.getItem("gender")??"";
            if(this.gender == ""){
              localStorage.setItem("gender",decodedJwtData.gender);
            }
          }
      }

      openPostModal(): void {
        const initialState = {
          userId: this.userId,
          from: "user"
        };
        this.modalRef = this.bsModalService.show(CreatePostComponent,{initialState});
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

      likeUnlikePosts(postId:string, isLike:boolean,postType:number,post:any){
        this.currentLikedPostId = postId;

        this.myFeeds.filter((p : any) => p.id == postId).forEach( (item : any) => {
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
           this.myFeeds.filter((p : any) => p.id == postId).forEach( (item : any) => {
            var itemss = item.likes;
            item.likes = response;
          }); 
           this.InitializeLikeUnlikePost();
           console.log("succes");
        });
      }

      likeUnlikeGlobalPosts(postId:string, isLike:boolean,postType:number,post:any){
        this.currentLikedPostId = postId;
        this.globalFeeds.filter((p : any) => p.id == postId).forEach( (item : any) => {
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
           this.globalFeeds.filter((p : any) => p.id == postId).forEach( (item : any) => {
            var itemss = item.likes;
            item.likes = response;
          }); 
           this.InitializeLikeUnlikePost();
           console.log("succes");
        });
      }

      showPostDiv(postId:string,From:string){
        if(From == 'FromMyFeeds'){
          var posts: any[] = this.myFeeds;
          this.gridItemInfo = posts.find(x => x.id == postId);
          this.isGridItemInfo = true;
          this.cd.detectChanges();
          const player = videojs(this.myFeedPlayer.nativeElement, {autoplay: false});
          this.addPostView(this.gridItemInfo.id,From);
        }
        else{
          var posts: any[] = this.globalFeeds;
          this.gridItemInfoForGlobal = posts.find(x => x.id == postId);
          this.isGridItemInfoForGlobal = true;
          this.cd.detectChanges();
          const player = videojs(this.globalFeedPlayer.nativeElement, {autoplay: false});
          this.addPostView(this.gridItemInfoForGlobal.id,From);
        }
      }
      
      addPostView(postId:string,From:string){
        if(this.userId != undefined){
         this.initializePostView();
        this.postView.postId = postId;
        this._postService.postView(this.postView).subscribe((response) => {
          if(From == 'FromMyFeeds'){
            this.gridItemInfo.views.length = response;
          }
          else{
            this.gridItemInfoForGlobal.views.length = response;
          }
         }); 
        }
      }
      
      initializePostView(){
        this.postView ={
          postId:'',
          userId:''
         }
      }
      
      hideGridItemInfo(From:string){
        if(From == 'FromMyFeeds'){
        this.isGridItemInfo = this.isGridItemInfo ? false : true;
        }
        else{
          this.isGridItemInfoForGlobal = this.isGridItemInfoForGlobal ? false : true;
        }
      }

      getSelectedSchool(schoolName:string){
        window.location.href=`profile/school/${schoolName.replace(" ","").toLowerCase()}`;
      }
    
      getSelectedClass(className:string,schoolName:string){
        window.location.href=`profile/class/${schoolName.replace(" ","").toLowerCase()}/${className.replace(" ","").toLowerCase()}`;
      }
    
      getSelectedCourse(courseName:string,schoolName:string){
        window.location.href=`profile/course/${schoolName.replace(" ","").toLowerCase()}/${courseName.replace(" ","").toLowerCase()}`;
      }
    
      getUserDetails(userId:string){
        window.location.href=`user/userProfile/${userId}`;
      }

      openReelsViewModal(postAttachmentId:string,from:number): void {
        if(from == 1){
          this.router.navigateByUrl(`user/reelsView/${this.myFeedsReels}/myFeed`);
        }
        else{
          this.router.navigateByUrl(`user/reelsView/${this.globalFeedReels}/globalFeed`);
        }
        // const initialState = {
        //   postAttachmentId: postAttachmentId
        // };
        // this.bsModalService.show(ReelsViewComponent,{initialState});
      }

      openSharePostModal(postId:string,postType:number): void {
        const initialState = {
          postId: postId,
          postType: postType
        };
        this.bsModalService.show(SharePostComponent,{initialState});
      }

      globalSearch(){
           this.globalSearchPageNumber = 1;
           this.globalSearchPageSize = 5;
           this.showSearchResults = false;
           if(this.searchString.length >2){
            this._userService.globalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize).subscribe((response:any) => {
              debugger
              this.loadingIcon = false;
              this.globalSearchResult = {};
              response.forEach((item:any) => {
                debugger
                if(item.type == 4){
                  this.globalSearchField = "User";
                }
                if(item.type == 1){
                  this.globalSearchField = "School";
                }
                if(item.type == 2 || item.type == 3){
                  this.globalSearchField = "ClassAndCourse";
                }
                if (this.globalSearchResult[ this.globalSearchField]) {
                  if(this.globalSearchResult[this.globalSearchField].length < 5){
                    this.globalSearchResult[ this.globalSearchField].push(item);
                  }
                } else {
                  this.globalSearchResult[ this.globalSearchField] = [item];
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
               if(response.length == 0){
                this.searchNotFound = true;
               }
               else{
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
      
        getMyFeeds(){
          this.isOpenGlobalFeed = false;
          var feedTab = localStorage.getItem('feedTab')??'';
          feedTab = 'myFeed';
          localStorage.setItem('feedTab',feedTab);
          this.feedTab = feedTab;

          if(this.myFeeds == undefined && this.myFeedsReels == undefined){
            this.loadingIcon = true;
            this._userService.getMyFeed(1,this.myFeedsPageNumber,this.searchString).subscribe((response) => {
              this.isGlobalFeed = false;
              this.postLoadingIcon = false;
                this.myFeeds = response;
                this.myFeeds = this.getFilteredAttachments(this.myFeeds,"myFeed");
                this.isMyFeedPostsExist = true;
                this.checkMyFeedExist();
                if(this.myFeeds.length == 0){
                   this.isMyFeedsEmpty = true;
                   this.getGlobalFeedsData()
                }
              });
    
              this._userService.getMyFeed(3,this.myFeedsPageNumber,this.searchString).subscribe((result) => {
                this.myFeedsReels = result;
                this.isMyFeedReelsExist = true;
                this.checkMyFeedExist();
                if(this.myFeedsReels.length == 0){
                  this.isMyFeedReelsEmpty = true;
                  this.getGlobalFeedsData()
               }
                this.addListenerToNextButton();
              });
          }
          this.cd.detectChanges();
        }

        savePost(postId:string){
          var myFeeds: any[] = this.myFeeds;
          var isSavedPost = myFeeds.find(x => x.id == postId);
          if(isSavedPost == undefined){
            var isSavedPost = this.globalFeeds.find((x: { id: string; }) => x.id == postId);
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
        back(): void {
          window.history.back();
        }
        openCertificateViewModal(certificateUrl:string,certificateName:string,from?:number,event?:Event){
          var fromValue = PostAuthorTypeEnum.School;
          if(from != undefined){
            fromValue = from;
            event?.stopPropagation();
          }
          const initialState = {
            certificateUrl: certificateUrl,
            certificateName:certificateName,
            from:fromValue
          };
          this.bsModalService.show(CertificateViewComponent, { initialState });
        }

        getFilteredAttachments(feeds:any,from:string):any{
          const allAttachments = feeds.flatMap((post: { postAttachments: any; }) => post.postAttachments);
          if(from == "myFeed"){
            var result = allAttachments.filter((attachment: { fileType: number; }) => attachment.fileType === 3);
            this.filteredMyFeedAttachments = [...this.filteredMyFeedAttachments, ...result];
          }
          else{
            var result = allAttachments.filter((attachment: { fileType: number; }) => attachment.fileType === 3);
            this.filteredGlobalFeedAttachments = [...this.filteredGlobalFeedAttachments, ...result];
          }
          feeds = feeds.map((post: { postAttachments: any[]; }) => {
          const filteredPostAttachments = post.postAttachments.filter(postAttachment => postAttachment.fileType !== 3);
          return { ...post, postAttachments: filteredPostAttachments };
          });
          return feeds;
        }

        refreshRoute() {
          const currentUrl = this.router.url;
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigateByUrl(currentUrl);
          });
        }

        getObjectKeys(obj: any): string[] {
          if(obj != null){
          console.log(Object.keys(obj));
          return Object.keys(obj).sort();
        }
        return [];
        }
}
