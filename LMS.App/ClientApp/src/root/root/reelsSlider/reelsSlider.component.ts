import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent } from '../sharedModule/Multilingual/multilingual.component';
// import * as $ from 'jquery';
declare const $: any;
import 'slick-carousel/slick/slick';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/root/service/user.service';
import videojs from 'video.js';
import { NotificationType } from 'src/root/interfaces/notification/notificationViewModel';
import { NotificationService } from 'src/root/service/notification.service';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostService } from 'src/root/service/post.service';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Constant } from 'src/root/interfaces/constant';
import { SharePostComponent } from '../sharePost/sharePost.component';
import { sharePostResponse } from '../postView/postView.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SchoolService } from 'src/root/service/school.service';
import { CourseService } from 'src/root/service/course.service';
import { ClassService } from 'src/root/service/class.service';
import { ChatService } from 'src/root/service/chatService';
import { CommentViewModel } from 'src/root/interfaces/chat/commentViewModel';
import { SignalrService } from 'src/root/service/signalr.service';
import { PostView } from 'src/root/interfaces/post/postView';

export const savedReelResponse =new Subject<{isReelSaved:boolean,id:string}>();


@Component({
    selector: 'fileStorage',
    templateUrl: './reelsSlider.component.html',
    styleUrls: ['./reelsSlider.component.css'],
    providers: [MessageService]
  })

export class ReelsSliderComponent extends MultilingualComponent implements OnInit, AfterViewInit {
    private _userService;
    private _schoolService;
    private _classService;
    private _courseService;
    private _chatService;
    private _signalRService;
    private _notificationService;
    private _postService;
    reelsPageNumber:number = 1;
    commentsPageNumber:number = 1;
    reels:any;
    isDataLoaded:boolean = false;
    loadingIcon:boolean = false;
    @ViewChild('videoPlayer') videoPlayer!: ElementRef;


    //test
    @ViewChild('slider') slider: any;
    isMobileView: boolean = false;

    // for like
    currentLikedPostId!:string;
    likesLength!:number;
    userId!:string;
    likeUnlikePost!: LikeUnlikePost;
    reel:any;
    isCommentsDisabled!:boolean;
    gender!:string;
    commentsLoadingIcon: boolean = false;
    sender:any;
    commentViewModel!: CommentViewModel;
    messageToGroup!:string;
    postView!:PostView;
    selectedReel:any;
    @ViewChild('groupChatList') groupChatList!: ElementRef;


    constructor(injector: Injector,private bsModalService: BsModalService, private  route: ActivatedRoute, private translateService: TranslateService, public messageService:MessageService, private userService:UserService,private schoolService:SchoolService,private classService:ClassService, private courseService:CourseService, private notificationService:NotificationService,private postService:PostService,private chatService:ChatService,private signalRService: SignalrService, private cd: ChangeDetectorRef) {
      super(injector);
        this._userService = userService;
        this._schoolService = schoolService;
        this._classService = classService;
        this._courseService = courseService;
        this._notificationService = notificationService;
        this._postService = postService;
        this._chatService = chatService;
        this._signalRService = signalRService;
     }

    ngOnInit() {
      debugger
      var selectedLang = localStorage.getItem("selectedLanguage");
      this.translate.use(selectedLang?? '');
      this.getSenderInfo();
        this.loadingIcon = true;
        var id = this.route.snapshot.paramMap.get('id')??'';
        var from = this.route.snapshot.paramMap.get('from')??'';


        if(from == Constant.User){
           this.getReelsByUser(id);
        }
        if(from == Constant.School){
          this.getReelsBySchool(id);
        }
        if(from == Constant.Class){
          this.getReelsByClass(id);
        }
        if(from == Constant.Course){
          this.getReelsByCourse(id);
        }
        if(from == Constant.MyFeed){
          this.getMyFeedReels();
        }
        if(from == Constant.GlobalFeed){
          this.getGlobalFeedReels();
        }

      //   this._userService.getReelsByUserId(userId, this.reelsPageNumber).subscribe((response) => {
      //       this.reels = response;
      //       this.loadingIcon = false;
      //       this.isDataLoaded = true;
      //       this.cd.detectChanges();
      //       this.checkMobileView();
      //       var res = document.getElementsByClassName("slick");
      //       var res1 = document.getElementsByClassName("vertical-slider");
      // //       $('.slick', '.vertical-slider').slick({
      // //           vertical: true,
      // //           verticalSwiping: true,
      // //           slidesToShow: 1,
      // //           slidesToScroll: 1,

      // //           swipeToSlide: true,
      // // swipe: true,
      // // touchMove: true,
      // // arrows: false,
      // // dots: false,

      // // autoplay: true
                
      // //       });
      //    });
        this.InitializeLikeUnlikePost();
        this.InitializePostView();
        this.gender = localStorage.getItem("gender")??'';
     }

     getReelsByUser(userId:string){
      this._userService.getReelsByUserId(userId, this.reelsPageNumber).subscribe((response) => {
        debugger
        this.reels = response;
        this.selectedReel = this.reels[0];
        this.initializeReelsSlider();
      });
     }

     getReelsBySchool(schoolId:string){
      debugger
      this._schoolService.getReelsBySchoolId(schoolId, this.reelsPageNumber).subscribe((response) => {
        this.reels = response;
        this.initializeReelsSlider();
      });
     }

     getReelsByClass(classId:string){
      debugger
      this._classService.getReelsByClassId(classId, this.reelsPageNumber).subscribe((response) => {
        this.reels = response;
        this.initializeReelsSlider();
      });
     }

     getReelsByCourse(courseId:string){
      debugger
      this._courseService.getReelsByCourseId(courseId, this.reelsPageNumber).subscribe((response) => {
        this.reels = response;
        this.initializeReelsSlider();
      });
     }

     getMyFeedReels(){
      debugger
      this._userService.getMyFeed(3, this.reelsPageNumber,"").subscribe((response) => {
        this.reels = response;
        this.initializeReelsSlider();
      });
     }

     getGlobalFeedReels(){
      debugger
      this._userService.getGlobalFeed(3, this.reelsPageNumber,"").subscribe((response) => {
        this.reels = response;
        this.initializeReelsSlider();
      });
     }

     initializeReelsSlider(){
      this.loadingIcon = false;
      this.isDataLoaded = true;
      this.cd.detectChanges();
      this.checkMobileView();
     }
     

    back(): void {
       window.history.back();
    }

    // toggleVideoPlayback(video: any) {
    //     this.cd.detectChanges();
    //     const videoElement = this.videoPlayer.nativeElement as HTMLVideoElement;
    //     if (videoElement.paused) {
    //       videoElement.play();
    //     } else {
    //       videoElement.pause();
    //     }
    //   }

    //   toggleVideoPlayback(video: HTMLVideoElement) {
    //     if (video.paused) {
    //       video.play();
    //     } else {
    //       video.pause();
    //     }
    //   }

      ngAfterViewInit() {
        this.initializeSlick();
        // const carouselElement = $('.slick', '.vertical-slider');
        // carouselElement.on('wheel', this.onScroll);

        // const videos = document.querySelectorAll('video');
        // videos.forEach((video: HTMLVideoElement) => {
        //   video.addEventListener('ended', () => {
        //     video.play();
        //   });
        // });
      }

      @HostListener('window:resize', ['$event'])
      onResize(event: any) {
        this.checkMobileView();
      }

      onSliderScroll(event: any) {
        this.isMobileView = window.innerWidth <= 768;
        if (!this.isMobileView) {
          const delta = Math.sign(event.deltaY);
          if (delta > 0) {
            $('.slick', '.vertical-slider').slick('slickNext');
          } else if (delta < 0) {
            $('.slick', '.vertical-slider').slick('slickPrev');
          }
        }
        else{
           // Autoplay video if it's within the current slide
    const currentSlideIndex = $('.slick', '.vertical-slider').slick('slickCurrentSlide');
    const videoElement = $('.slick', '.vertical-slider').find('.item').eq(currentSlideIndex).find('video')[0];
    if (videoElement) {
      videoElement.play();
    }
        }
      }

      toggleVideoPlayback(event: any) {
        const videoElement = event.target;
        if (videoElement.paused) {
          videoElement.play();
        } else {
          videoElement.pause();
        }
        this.cd.detectChanges();
      }

      checkMobileView() {
        this.isMobileView = window.innerWidth <= 768;
        if ( $('.slick', '.vertical-slider') && this.isMobileView) {
            $('.slick', '.vertical-slider').slick('unslick');
            this.initializeSlick();
        } else if ( $('.slick', '.vertical-slider') && !this.isMobileView) {
          $('.slick', '.vertical-slider').slick('unslick');
          this.initializeSlick();
        }
      }
    
      initializeSlick() {
        this.cd.detectChanges();
        const self = this;
        $('.slick', '.vertical-slider').slick({
          vertical: true,
          verticalSwiping: true,
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplay: false,

          onBeforeChange: function(slideIndex: any) {
            debugger
            const previousVideoElement = $(this).find('.item').eq(slideIndex).find('video')[0];
            if (previousVideoElement) {
              previousVideoElement.pause();
            }
          },
          onAfterChange: (slideIndex: any) => {
            debugger
            const currentItem = self.reels[slideIndex]; // Access the component's `reels` property
            self.addPostView(currentItem.id);
      
            const currentVideoElement = $(this).find('.item').eq(slideIndex).find('video')[0];
            if (currentVideoElement) {
              currentVideoElement.play();
            }
          }
          // onBeforeChange: function(slideIndex: any) {
          //   // Pause the previous video when transitioning to the next slide
          //   const previousVideoElement = $(this).find('.item').eq(slideIndex).find('video')[0];
          //   if (previousVideoElement) {
          //     previousVideoElement.pause();
          //   }
          // },
          // onAfterChange: function(slideIndex: any) {
          //   debugger
          //   // for add view
          //   const currentItem = this.reels[slideIndex];
          //   this.addPostView(currentItem.id);

          //   // Play the video of the current slide
          //   const currentVideoElement = $(this).find('.item').eq(slideIndex).find('video')[0];
          //   if (currentVideoElement) {
          //     debugger
          //     currentVideoElement.play();
          //   }
          // }
        });

        const currentSlideIndex = $('.slick', '.vertical-slider').slick('slickCurrentSlide');
        const videoElement = $('.slick', '.vertical-slider').find('.item').eq(currentSlideIndex).find('video')[0];
        if (videoElement) {
          videoElement.play();
        }
      }


      addPostView(postId:string){
        debugger
        if(this.userId != undefined){
        this.postView.postId = postId;
        this._postService.postView(this.postView).subscribe((response) => {
          this.reels.post.views.length = response;
         }); 
        }
      
      }

      // for like

      likeUnlikePosts(postId:string, isLike:boolean,postType:number,post:any){
        debugger
        this.currentLikedPostId = postId;
          var likes: any[] = post.likes;
          var isLiked = likes.filter(x => x.userId == this.userId && x.postId == postId);
        if(isLiked.length != 0){
          //this.isLiked = false;
          this.likesLength = post.likes.length - 1;
          post.isPostLikedByCurrentUser = false;
        }
        else{
          //this.isLiked = true;
          this.likesLength = post.likes.length + 1;
          post.isPostLikedByCurrentUser = true;
          var notificationContent = `liked your post(${post.title})`;
          this._notificationService.initializeNotificationViewModel(post.createdBy,NotificationType.Likes,notificationContent,this.userId,postId,postType,post,null).subscribe((_response) => { 
          });
        }
    
        this.likeUnlikePost.postId = postId;
        this.likeUnlikePost.isLike = isLike;
        this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
        this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
          debugger
           post.likes = response;
           this.InitializeLikeUnlikePost();
        });
      
      
      }
      

      // get sender info

      getSenderInfo(){
        var validToken = localStorage.getItem("jwt");
        if (validToken != null) {
        let jwtData = validToken.split('.')[1]
        let decodedJwtJsonData = window.atob(jwtData)
        let decodedJwtData = JSON.parse(decodedJwtJsonData);
        this.userId = decodedJwtData.jti;
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

      InitializePostView(){
        this.postView = {
          postId: '',
          userId: ''
         };
  
      }

      saveReel(postId:string,post:any){
        debugger
        if(post.isPostSavedByCurrentUser){
          post.savedPostsCount -= 1;
          post.isPostSavedByCurrentUser = false;
          const translatedMessage = this.translateService.instant('ReelRemovedSuccessfully');
          const translatedSummary = this.translateService.instant('Success');
          this.messageService.add({severity:'success', summary:translatedSummary,life: 3000, detail:translatedMessage});
          // savedReelResponse.next({isReelSaved:false,id:postId}); 
         }
         else{
          post.savedPostsCount += 1;
          post.isPostSavedByCurrentUser = true;
          const translatedMessage = this.translateService.instant('ReelSavedSuccessfully');
          const translatedSummary = this.translateService.instant('Success');
          this.messageService.add({severity:'success', summary:translatedSummary,life: 3000, detail:translatedMessage});
          // savedReelResponse.next({isReelSaved:false,id:postId}); 
         }
         this._postService.savePost(postId,this.userId).subscribe((_result) => {
        });
      }

      openSharePostModal(post:any, postType:number,title:string,description:string): void {
        debugger
        if(post?.name == Constant.Private || post?.serviceType == Constant.Paid){
          sharePostResponse.next({}); 
        }
        else{
          var image:string = '';
          if(postType == 1){
            var postAttachments = post.postAttachments.find((x: { fileType: number; }) => x.fileType == 1);
            if(postAttachments != undefined){
              image = postAttachments.fileUrl;
            }
          }
        const initialState = {
          postId: post.id,
          postType: postType,
          title: title,
          description: description,
          image: image
        };
        this.bsModalService.show(SharePostComponent,{initialState});
      }
    }

    openCommentsSection(reel:any){
      debugger
      this.reel = reel;
      this._chatService.getComments(reel.id,this.commentsPageNumber).subscribe((response) => {
        debugger
        this.reel.comments = response;
        });

        this._userService.getUser(this.userId).subscribe((response) => {
          this.sender = response;
        });
    }

    showCommentsDiv(isShowComments:boolean){
      if(isShowComments){
        this.isCommentsDisabled = false;
      }
      else{
        this.isCommentsDisabled = true;
      }

      this._postService.enableDisableComments(this.reel.id,this.isCommentsDisabled).subscribe((_response) => {
        
       }); 
    }

    @HostListener('scroll', ['$event'])
    scrollHandler(event: any) {
    //  const element = event.target;
    //  if (element.scrollTop === 0) {
    //     if(!this.commentsScrolled && this.scrollCommentsResponseCount != 0){
    //         this.commentsScrolled = true;
    //         this.commentsLoadingIcon = true;
    //         this.commentsPageNumber++;
    //         this.getNextComments();
    //         }
    //  }
     
   }

   sendToGroup(reel:any){
    debugger
    var comment: any[] = reel.comments;
    this.InitializeCommentViewModel();
    this.commentViewModel.userId = this.sender.id;
    this.commentViewModel.groupName = reel.id + "_group";
    this.commentViewModel.content = this.messageToGroup;
    this.commentViewModel.userAvatar = this.sender.avatar;
    this.messageToGroup = "";
    this.commentViewModel.id = Constant.defaultGuid;
    this._chatService.addComments(this.commentViewModel).subscribe((response) => {
      debugger
      comment.push(response);
      reel.commentsCount = comment.length;
      this.cd.detectChanges();
      this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
      this.commentViewModel.id = response.id;
      this._signalRService.sendToGroup(this.commentViewModel);
      });
    }

    InitializeCommentViewModel(){
      this.commentViewModel = {
        id:'',
        userId: '',
        content:'',
        groupName:'',
        userAvatar:'',
        createdOn:new Date(),
        userName:''
       };
    }
}
