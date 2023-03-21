import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, Injector, OnInit, ViewChild} from '@angular/core';
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
import { CreatePostComponent } from '../createPost/createPost.component';
import { PostViewComponent } from '../postView/postView.component';
import { ReelsViewComponent } from '../reels/reelsView.component';
import { SharePostComponent } from '../sharePost/sharePost.component';

@Component({
    selector: 'post-view',
    templateUrl: './userFeed.component.html',
    styleUrls: ['./userFeed.component.css'],
    providers: [MessageService]
  })

export class UserFeedComponent implements OnInit {

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
    scrolled:boolean = false;

    searchString:string = "";
    isOpenGlobalFeed:boolean = false;

    constructor(private bsModalService: BsModalService,notificationService:NotificationService,postService: PostService,public userService:UserService, public options: ModalOptions,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute,public messageService:MessageService) { 
         this._userService = userService;
         this._postService = postService;
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
      this.isOwnerOrNot();
        this._userService.getMyFeed(1,this.myFeedsPageNumber,this.searchString).subscribe((response) => {
          this.isGlobalFeed = false;
          this.postLoadingIcon = false;
            this.myFeeds = response;
            if(this.myFeeds.length == 0){
               this.isMyFeedsEmpty = true;
               this.getGlobalFeedsData()
            }
              this.isDataLoaded = true;
          });

          this._userService.getMyFeed(3,this.myFeedsPageNumber,this.searchString).subscribe((result) => {
            this.myFeedsReels = result;
            if(this.myFeedsReels.length == 0){
              this.isMyFeedReelsEmpty = true;
              this.getGlobalFeedsData()
           }
            this.isDataLoaded = true;
            this.loadingIcon = false;
            this.isDataLoaded = true;
            this.addListenerToNextButton();
          });

          this.getGlobalFeedsData();
          this.InitializeLikeUnlikePost();
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
        this.isOpenGlobalFeed = true;
        this.isGlobalFeed = true;
        this.loadingIcon = true;
       if(this.globalFeeds == undefined){
        this.loadingIcon = true;
        this._userService.getGlobalFeed(1,this.globalFeedsPageNumber,this.searchString).subscribe((response) => {
            this.globalFeeds = response;
            this.loadingIcon = false;
            this.isDataLoaded = true;
            console.log(this.globalFeeds);
          });
        }
          this._userService.getGlobalFeed(3, this.globalReelsPageNumber,this.searchString).subscribe((result) => {
              this.globalFeedReels = result;
              this.loadingIcon = false;
              this.isDataLoaded = true;
              this.addGlobalFeedListenerToNextButton();

            });
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
          this.addPostView(this.gridItemInfo.id,From);
        }
        else{
          var posts: any[] = this.globalFeeds;
          this.gridItemInfoForGlobal = posts.find(x => x.id == postId);
          this.isGridItemInfoForGlobal = true;
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

      openSharePostModal(postId:string): void {
        const initialState = {
          postId: postId
        };
        this.bsModalService.show(SharePostComponent,{initialState});
      }

      feedSearch(){
        if(!this.isOpenGlobalFeed){
        this.myFeedsPageNumber = 1;
        this.reelsPageNumber = 1;
        
        if(this.searchString.length >2 || this.searchString == ""){
          this.loadingIcon = true;
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
          this.loadingIcon = true;
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
          var myFeeds: any[] = this.myFeeds;
          var isSavedPost = myFeeds.find(x => x.id == postId);

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
