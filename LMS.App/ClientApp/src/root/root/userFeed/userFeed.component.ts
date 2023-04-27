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
import { PostViewComponent, savedPostResponse } from '../postView/postView.component';
import { ReelsViewComponent, savedReelResponse } from '../reels/reelsView.component';
import { SharePostComponent, sharedPostResponse } from '../sharePost/sharePost.component';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { AuthService } from 'src/root/service/auth.service';
import { Subscribable, Subscription } from 'rxjs';

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
    isProfileGrid:boolean = true;
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
    isGlobalFeedLoading!:boolean;


    constructor(injector: Injector,private authService:AuthService,private bsModalService: BsModalService,notificationService:NotificationService,postService: PostService,public userService:UserService, public options: ModalOptions,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute,public messageService:MessageService,private cd: ChangeDetectorRef) { 
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
      this.translate.use(selectedLang ?? '');
      this.isOwnerOrNot();
        this._userService.getMyFeed(1,this.myFeedsPageNumber,this.searchString).subscribe((response) => {
          this.isGlobalFeed = false;
          this.postLoadingIcon = false;
            this.myFeeds = response;
            this.isMyFeedPostsExist = true;
            this.checkMyFeedExist();
            if(this.myFeeds.length == 0){
               this.isMyFeedsEmpty = true;
               this.getGlobalFeedsData()
            }
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

          this.getGlobalFeedsData();
          this.InitializeLikeUnlikePost();

          if(!this.addPostSubscription){
           this.addPostSubscription = addPostResponse.subscribe((response) => {          
              this.messageService.add({severity: 'success',summary: 'Success',life: 3000,detail: 'Post created successfully',
              });
            });
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

          if(!this.savedReelSubscription){
            this.savedReelSubscription = savedReelResponse.subscribe(response => {
              if(response.isReelSaved){
                this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel saved successfully'});
              }
              if(!response.isReelSaved){
                this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel removed successfully'});
              }
            });
          }

          this.sharedPostSubscription = sharedPostResponse.subscribe( response => {
            debugger
            if(response.postType == 1){
              this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post shared successfully'});
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
    }

    checkMyFeedExist(){
      if(this.isMyFeedPostsExist && this.isMyFeedReelsExist){
        this.isDataLoaded = true;
        this.loadingIcon = false;
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

  if (scrollPosition >= bodyHeight - windowSize) {
    if(!this.isGlobalFeed){
      if(!this.scrolled && this.scrollMyFeedResponseCount != 0 && this.myFeeds !=undefined){
        this.scrolled = true;
      this.postLoadingIcon = true;
      this.myFeedsPageNumber++;
      this._userService.getMyFeed(1,this.myFeedsPageNumber,this.searchString).subscribe((response) => {
        if(this.myFeeds!=undefined){
        this.myFeeds =[...this.myFeeds, ...response];
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
      this.globalFeeds =[...this.globalFeeds, ...result];
      this.postLoadingIcon = false;
      this.scrollGlobalFeedResponseCount = result;
      this.scrolled = false;
      });
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
        this.isOpenSidebar = true;
      }

      openPostsViewModal(posts:string): void {
        const initialState = {
          posts: posts
        };
        this.bsModalService.show(PostViewComponent,{initialState});
      }

      getGlobalFeeds(){
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
          }
      }

      openPostModal(): void {
        const initialState = {
          userId: this.userId,
          from: "user"
        };
          this.bsModalService.show(CreatePostComponent,{initialState});
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

      openReelsViewModal(postAttachmentId:string): void {
        const initialState = {
          postAttachmentId: postAttachmentId
        };
        this.bsModalService.show(ReelsViewComponent,{initialState});
      }

      openSharePostModal(postId:string,postType:number): void {
        const initialState = {
          postId: postId,
          postType: postType
        };
        this.bsModalService.show(SharePostComponent,{initialState});
      }

      feedSearch(){
        if(!this.isOpenGlobalFeed){
        this.myFeedsPageNumber = 1;
        this.reelsPageNumber = 1;
        
        if(this.searchString.length >2 || this.searchString == ""){
          // this.loadingIcon = true;
          this._userService.getMyFeed(1,this.myFeedsPageNumber,this.searchString).subscribe((response) => {
            this.loadingIcon = false;
             this.myFeeds = response;
            });
  
            this._userService.getMyFeed(3,this.myFeedsPageNumber,this.searchString).subscribe((result) => {
              this.myFeedsReels = result;
              this.loadingIcon = false;
            });
        }
      }

      else{
        this.globalFeedsPageNumber = 1;
        this.globalReelsPageNumber = 1;
        
        if(this.searchString.length >2 || this.searchString == ""){
          // this.loadingIcon = true;
          this._userService.getGlobalFeed(1,this.globalFeedsPageNumber,this.searchString).subscribe((response) => {
            this.globalFeeds = response;
            this.loadingIcon = false;
          });
    
          this._userService.getGlobalFeed(3, this.globalReelsPageNumber,this.searchString).subscribe((result) => {
              this.globalFeedReels = result;
              this.loadingIcon = false;
            });
          }
        }
        }
      
        getMyFeeds(){
          this.isOpenGlobalFeed = false;
        }

        savePost(postId:string){
          debugger
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
}
