import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
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
import { Subject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Constant } from 'src/root/interfaces/constant';
import { SharePostComponent } from '../sharePost/sharePost.component';
import { deletePostResponse, sharePostResponse } from '../postView/postView.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SchoolService } from 'src/root/service/school.service';
import { CourseService } from 'src/root/service/course.service';
import { ClassService } from 'src/root/service/class.service';
import { ChatService } from 'src/root/service/chatService';
import { CommentViewModel } from 'src/root/interfaces/chat/commentViewModel';
import { SignalrService, commentDeleteResponse, commentLikeResponse, commentResponse } from 'src/root/service/signalr.service';
import { PostView } from 'src/root/interfaces/post/postView';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { CreatePostComponent, addPostResponse } from '../createPost/createPost.component';
import { deleteReelResponse } from '../root.component';
import { ReelsService } from 'src/root/service/reels.service';
import { StudentService } from 'src/root/service/student.service';
import { ClassCourseEnum } from 'src/root/Enums/classCourseEnum';
import { CommentLikeUnlike } from 'src/root/interfaces/chat/commentsLike';
import { ChatType } from 'src/root/interfaces/chat/chatType';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';

// import { TranslateService } from '@ngx-translate/core';

export const savedReelResponse = new Subject<{ isReelSaved: boolean, id: string }>();


@Component({
  selector: 'fileStorage',
  templateUrl: './reelsSlider.component.html',
  styleUrls: ['./reelsSlider.component.css'],
  providers: [MessageService]
})

export class ReelsSliderComponent extends MultilingualComponent implements OnInit, AfterViewInit, OnDestroy {
  private _userService;
  private _schoolService;
  private _classService;
  private _courseService;
  private _chatService;
  private _signalRService;
  private _notificationService;
  private _postService;
  reelsPageNumber: number = 1;
  commentsPageNumber: number = 1;
  reels: any;
  isDataLoaded: boolean = false;
  loadingIcon: boolean = false;
  commentResponseSubscription!: Subscription;
  isFinishDownReels: boolean = false;
  isFinishUpReels: boolean = false;
  @ViewChild('videoComp') videoComp: any;
  @ViewChild(SlickCarouselComponent, { static: false }) carousel!: SlickCarouselComponent;
  @ViewChild('slickCarousel') slickCarousel!: ElementRef;

  commentDeletdResponseSubscription!: Subscription;


  @ViewChild('slickCarouselRef', { read: ElementRef }) slickCarouselRef!: ElementRef;


  //test
  @ViewChild('slider') slider: any;
  isMobileView: boolean = false;

  // for like
  currentLikedPostId!: string;
  likesLength!: number;
  userId!: string;
  likeUnlikePost!: LikeUnlikePost;
  reel: any;
  isCommentsDisabled!: boolean;
  gender!: string;
  commentsLoadingIcon: boolean = false;
  sender: any;
  commentViewModel!: CommentViewModel;
  messageToGroup!: string;
  postView!: PostView;
  selectedReel: any;
  videos: any = [];
  reelId: string = "";
  from: string = "";
  selectedReelIndex: number = 0;
  slickSlider: any;
  firstPostId: string = "";
  lastPostId: string = "";
  ownerId: string = "";
  post: any;
  postId:string = "";
  reelSubscription!:Subscription;
  commentsScrolled: boolean = false;
  scrollCommentsResponseCount: number = 1;
  @ViewChild('groupChatList') groupChatList!: ElementRef;


  commentLikeUnlike!: CommentLikeUnlike;

  private _studentService;
  private _reelsService;

  constructor(injector: Injector,private bsModalService: BsModalService, private route: ActivatedRoute, private translateService: TranslateService, public messageService: MessageService, private userService: UserService,private reelService: ReelsService,private studentService: StudentService, private schoolService: SchoolService, private classService: ClassService, private courseService: CourseService, private notificationService: NotificationService, private postService: PostService, private chatService: ChatService, private signalRService: SignalrService, private cd: ChangeDetectorRef, private renderer: Renderer2) {
    super(injector);
    this._userService = userService;
    this._schoolService = schoolService;
    this._classService = classService;
    this._courseService = courseService;
    this._notificationService = notificationService;
    this._postService = postService;
    this._chatService = chatService;
    this._signalRService = signalRService;
    this._reelsService = reelService;
    this._studentService = studentService;
  }

  ngOnInit() {
    debugger
    var selectedLang = localStorage.getItem("selectedLanguage");
    this.translate.use(selectedLang ?? '');
    // this.post = history.state.post;
    this.InitializePostView();
    this.getSenderInfo();
    this.checkScreenSize();
    this.loadingIcon = true;
    this.ownerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.from = this.route.snapshot.paramMap.get('from') ?? '';
    this.reelId = this.route.snapshot.paramMap.get('reelId') ?? '';
    this.postId = this.route.snapshot.paramMap.get('postId') ?? '';
    this.addPostView(this.postId);

    if (this.from == Constant.User) {
      this.getReelsByUser(this.ownerId);
    }
    if (this.from == Constant.School) {
      this.getReelsBySchool(this.ownerId);
    }
    if (this.from == Constant.Class) {
      this.getReelsByClass(this.ownerId);
    }
    if (this.from == Constant.Course) {
      this.getReelsByCourse(this.ownerId);
    }
    if (this.from == Constant.MyFeed) {
      this.getMyFeedReels();
    }
    if (this.from == Constant.GlobalFeed) {
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
    this.gender = localStorage.getItem("gender") ?? '';
    if (!this.commentResponseSubscription) {
      this.commentResponseSubscription = commentResponse.subscribe(response => {
        debugger;
        var comment: any[] = this.reel.comments;
        var commentObj = { id: response.id, content: response.message, likeCount: 0, isCommentLikedByCurrentUser: false, userAvatar: response.senderAvatar, userName: response.userName, userId: response.userId, isUserVerified: response.isUserVerified };
        comment.push(commentObj);
        this.cd.detectChanges();
        this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
      });
    }

    if(!this.commentDeletdResponseSubscription){
      commentDeleteResponse.subscribe(response =>{
        debugger;
        let indexOfComment = this.reel.comments.findIndex((x:any) => x.id == response.commentId)
        this.reel.comments.splice(indexOfComment, 1);
        this.reel.commentsCount--;
      })
    }

    commentLikeResponse.subscribe(response => {
      var comments: any[] = this.reels.post.comments;
      var reqComment = comments.find(x => x.id == response.commentId);
      if (response.isLike) {
        reqComment.likeCount = reqComment.likeCount + 1;
      }
      else {
        reqComment.likeCount = reqComment.likeCount - 1;
      }
    });


    if (!this.reelSubscription) {
      this.reelSubscription = addPostResponse.subscribe((response:any) => {
      var isReelExist = this.reels.find((x:any) => x.id == response.response.id)
      var index = this.reels.findIndex((x:any)=> x.id == response.response.id)
      if(isReelExist != null){
        this._postService.getPostById(isReelExist.id).subscribe(response =>{
          debugger
          isReelExist = response;
          // this.reels.splice(index, 1, isReelExist);
          this.reels[index].title=response.title;
          this.reels[index].postAttachments[0].fileUrl = response.postAttachments[0].fileUrl;
          let videoJsElement = document.getElementById(`video-${index}`);
          if(videoJsElement){
            const firstElement = videoJsElement.children[0];
            if (firstElement) {
              const videoElement = firstElement.children[0] as HTMLVideoElement;
              if (videoElement) {
                videoElement.src = response.postAttachments[0].fileUrl;
                videoElement.play();
                let newUrl = `/user/reelsView/${this.ownerId}/${this.from}/${response.postAttachments[0].id}/${response.id}`
                history.replaceState({}, '', newUrl)
              }
            }
          }
          debugger;
          this.cd.detectChanges();
        })
      }
      // let filteredReel = this.reels.forEach((element:any) => {
      //   debugger
      //   if(element.id == newReel.response){
      //     var index = this.reels.findIndex((x:any)=> x.id == element.id)
      //     this._postService.getPostById(element.id).subscribe(response =>{
      //       this.reels.splice(index,1, response);
      //     })
      //   }
      // })
    });
   }

   var modal = document.getElementById('comments-modal');
   window.onclick = (event) => {
    if (event.target == modal) {
      if (modal != null) {
        this.isModalOpen = false;
      }
    }
  }
  }

  ngOnDestroy(): void {
    if (this.commentResponseSubscription) {
      this.commentResponseSubscription.unsubscribe();
    }
    if (this.reelSubscription) {
      this.reelSubscription.unsubscribe();
    }
    if (this.commentDeletdResponseSubscription) {
      this.commentDeletdResponseSubscription.unsubscribe();
    }
  }

  getReelsByUser(userId: string) {
    this._userService.GetSliderReelsByUserId(userId, this.reelId, 3).subscribe((response) => {
      debugger
      this.reels = response;
      this.selectedReel = this.reels[0];
      this.lastPostId = this.reels[this.reels.length - 1].id;
      this.firstPostId = this.reels[0].id;
      this.reels.forEach((reel: any) => {
        
        // Extract postAttachments from each reel and add them to the allPostAttachments list
        const postAttachments = reel.postAttachments;
        this.videos.push(...postAttachments);
      });

      var index = this.videos.findIndex((x: { id: string; }) => x.id == this.reelId);
      this.selectedReelIndex = index;
      this.carouselConfig.initialSlide = this.selectedReelIndex;
      // this.reels.find(x => x.);
      this.initializeReelsSlider();
      setTimeout(() => {
        const initialVideoElement = document.querySelector(`#video-${this.selectedReelIndex}`);
        if(initialVideoElement){
          const firstElement = initialVideoElement.children[0];
          if (firstElement) {
            const videoElement = firstElement.children[0] as HTMLVideoElement;
            if (videoElement) {
              videoElement?.play();
              videoElement.autoplay = true;
            }
          }
        }
      }, 1000);
    });
  }

  getReelsBySchool(schoolId: string) {
    this._schoolService.GetSliderReelsBySchoolId(schoolId, this.reelId, 3).subscribe((response) => {
      this.reels = response;
      this.selectedReel = this.reels[0];
      this.lastPostId = this.reels[this.reels.length - 1].id;
      this.firstPostId = this.reels[0].id;
      this.reels.forEach((reel: any) => {
        
        // Extract postAttachments from each reel and add them to the allPostAttachments list
        const postAttachments = reel.postAttachments;
        this.videos.push(...postAttachments);
      });
      var index = this.videos.findIndex((x: { id: string; }) => x.id == this.reelId);
      this.selectedReelIndex = index;
      this.carouselConfig.initialSlide = this.selectedReelIndex;
      this.getReelsById(this.reels, this.selectedReelIndex);
      // this.reels.find(x => x.);
      this.initializeReelsSlider();
      setTimeout(() => {
        const initialVideoElement = document.querySelector(`#video-${this.selectedReelIndex}`);
        if(initialVideoElement){
          const firstElement = initialVideoElement.children[0];
          if (firstElement) {
            const videoElement = firstElement.children[0] as HTMLVideoElement;
            if (videoElement) {
              videoElement?.play();
              videoElement.autoplay = true;
            }
          }
        }
      }, 1000);
    });
  }

  getReelsByClass(classId: string) {
    debugger;
    this._classService.GetSliderReelsByClassId(classId, this.reelId, 3).subscribe((response) => {
      this.reels = response;
      this.postForComment = response;
      this.selectedReel = this.reels[0];
      this.lastPostId = this.reels[this.reels.length - 1].id;
      this.firstPostId = this.reels[0].id;
      this.reels.forEach((reel: any) => {
        
        // Extract postAttachments from each reel and add them to the allPostAttachments list
        const postAttachments = reel.postAttachments;
        this.videos.push(...postAttachments);
      });

      var index = this.videos.findIndex((x: { id: string; }) => x.id == this.reelId);
      this.selectedReelIndex = index;
      this.carouselConfig.initialSlide = this.selectedReelIndex;
      this.getReelsById(this.reels, this.selectedReelIndex);
      // this.reels.find(x => x.);
      this.initializeReelsSlider();
      setTimeout(() => {
        const initialVideoElement = document.querySelector(`#video-${this.selectedReelIndex}`);
        if(initialVideoElement){
          const firstElement = initialVideoElement.children[0];
          if (firstElement) {
            const videoElement = firstElement.children[0] as HTMLVideoElement;
            if (videoElement) {
              videoElement?.play();
              videoElement.autoplay = true;
            }
          }
        }
      }, 1000);
    });
  }

  getReelsByCourse(courseId: string) {
    this._courseService.GetSliderReelsByCourseId(courseId, this.reelId, 3).subscribe((response) => {
      this.reels = response;
      this.selectedReel = this.reels[0];
      this.lastPostId = this.reels[this.reels.length - 1].id;
      this.firstPostId = this.reels[0].id;
      this.reels.forEach((reel: any) => {
        
        // Extract postAttachments from each reel and add them to the allPostAttachments list
        const postAttachments = reel.postAttachments;
        this.videos.push(...postAttachments);
      });

      var index = this.videos.findIndex((x: { id: string; }) => x.id == this.reelId);
      this.selectedReelIndex = index;
      this.carouselConfig.initialSlide = this.selectedReelIndex;
      this.getReelsById(this.reels, this.selectedReelIndex);
      // this.reels.find(x => x.);
      this.initializeReelsSlider();
      setTimeout(() => {
        const initialVideoElement = document.querySelector(`#video-${this.selectedReelIndex}`);
        if(initialVideoElement){
          const firstElement = initialVideoElement.children[0];
          if (firstElement) {
            const videoElement = firstElement.children[0] as HTMLVideoElement;
            if (videoElement) {
              videoElement?.play();
              videoElement.autoplay = true;
            }
          }
        }
      }, 1000);



      this.postForComment = response;



    });
  }

  getMyFeedReels() {
    this._userService.getMyFeedSliderReels(this.userId, this.reelId, 3).subscribe((response) => {
      this.reels = response;
      this.selectedReel = this.reels[0];
      this.lastPostId = this.reels[this.reels.length - 1].id;
      this.firstPostId = this.reels[0].id;
      this.reels.forEach((reel: any) => {
        
        // Extract postAttachments from each reel and add them to the allPostAttachments list
        const postAttachments = reel.postAttachments;
        this.videos.push(...postAttachments);
      });

      var index = this.videos.findIndex((x: { id: string; }) => x.id == this.reelId);
      this.selectedReelIndex = index;
      this.carouselConfig.initialSlide = this.selectedReelIndex;
      debugger
      this.getReelsById(this.reels, this.selectedReelIndex);
      // this.reels.find(x => x.);
      this.initializeReelsSlider();
      setTimeout(() => {
        const initialVideoElement = document.querySelector(`#video-${this.selectedReelIndex}`);
        if(initialVideoElement){
          const firstElement = initialVideoElement.children[0];
          if (firstElement) {
            const videoElement = firstElement.children[0] as HTMLVideoElement;
            if (videoElement) {
              videoElement?.play();
              videoElement.autoplay = true;
            }
          }
        }
      }, 1000);
    });
  }

  getGlobalFeedReels() {
    this._userService.getGlobalFeedSliderReels(this.userId, this.reelId, 3).subscribe((response) => {
      this.reels = response;
      this.selectedReel = this.reels[0];
      this.lastPostId = this.reels[this.reels.length - 1].id;
      this.firstPostId = this.reels[0].id;
      this.reels.forEach((reel: any) => {
        
        // Extract postAttachments from each reel and add them to the allPostAttachments list
        const postAttachments = reel.postAttachments;
        this.videos.push(...postAttachments);
      });

      var index = this.videos.findIndex((x: { id: string; }) => x.id == this.reelId);
      this.selectedReelIndex = index;
      this.carouselConfig.initialSlide = this.selectedReelIndex;
      this.getReelsById(this.reels, this.selectedReelIndex);
      // this.reels.find(x => x.);
      this.initializeReelsSlider();
      setTimeout(() => {
        const initialVideoElement = document.querySelector(`#video-${this.selectedReelIndex}`);
        if(initialVideoElement){
          const firstElement = initialVideoElement.children[0];
          if (firstElement) {
            const videoElement = firstElement.children[0] as HTMLVideoElement;
            if (videoElement) {
              videoElement?.play();
              videoElement.autoplay = true;
            }
          }
        }
      }, 1000);
    });
  }

  initializeReelsSlider() {
    this.loadingIcon = false;
    this.isDataLoaded = true;
    this.cd.detectChanges();
    //   this.checkMobileView();
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
    // this.initializeSlick();
    // const carouselElement = $('.slick', '.vertical-slider');
    // carouselElement.on('wheel', this.onScroll);

    // const videos = document.querySelectorAll('video');
    // videos.forEach((video: HTMLVideoElement) => {
    //   video.addEventListener('ended', () => {
    //     video.play();
    //   });
    // });

    setTimeout(() => {
      for (let i = 0; i < this.reels?.length; i++) {
        const videoId = `video-${i}`;
        let videojsElement = document.getElementById(videoId);
        if (videojsElement) {
          const firstElement = videojsElement.children[0];
          if (firstElement) {
            const videoElement = firstElement.children[0] as HTMLVideoElement;
            if (videoElement) {
              videoElement.play();
              videoElement.muted = true;
            }
          }
        }
      }
    }, 1000);



  }

  //   @HostListener('window:resize', ['$event'])
  //   onResize(event: any) {
  //     this.checkMobileView();
  //   }

  //   onSliderScroll(event: any) {
  //     this.isMobileView = window.innerWidth <= 768;
  //     if (!this.isMobileView) {
  //       const delta = Math.sign(event.deltaY);
  //       if (delta > 0) {
  //         $('.slick', '.vertical-slider').slick('slickNext');
  //       } else if (delta < 0) {
  //         $('.slick', '.vertical-slider').slick('slickPrev');
  //       }
  //     }
  //     else{
  //        // Autoplay video if it's within the current slide
  // const currentSlideIndex = $('.slick', '.vertical-slider').slick('slickCurrentSlide');
  // const videoElement = $('.slick', '.vertical-slider').find('.item').eq(currentSlideIndex).find('video')[0];
  // if (videoElement) {
  //   videoElement.play();
  // }
  //     }
  //   }

  toggleVideoPlayback(event: any) {
    const videoElement = event.target;
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
    this.cd.detectChanges();
  }

  //   checkMobileView() {
  //     this.isMobileView = window.innerWidth <= 768;
  //     if ( $('.slick', '.vertical-slider') && this.isMobileView) {
  //         $('.slick', '.vertical-slider').slick('unslick');
  //         this.initializeSlick();
  //     } else if ( $('.slick', '.vertical-slider') && !this.isMobileView) {
  //       $('.slick', '.vertical-slider').slick('unslick');
  //       this.initializeSlick();
  //     }
  //   }



  //   initializeSlick() {
  //     
  //     var a = this.selectedReelIndex;
  //     this.cd.detectChanges();
  //     const self = this;
  //     this.slickSlider = $('.slick', '.vertical-slider').slick({
  //       lazyLoad: 'ondemand',
  //       vertical: true,
  //       verticalSwiping: true,
  //       slidesToShow: 1,
  //       slidesToScroll: 1,
  //       autoplay: false,
  //       initialSlide : this.selectedReelIndex,

  //       // onBeforeChange: function(slideIndex: any) {
  //       //   
  //       //   const previousVideoElement = $(this).find('.item').eq(slideIndex).find('video')[0];
  //       //   if (previousVideoElement) {
  //       //     previousVideoElement.pause();
  //       //   }
  //       // },
  //       // onAfterChange: (slideIndex: any) => {
  //       //   
  //       //   const currentItem = self.reels[slideIndex]; // Access the component's `reels` property
  //       //   self.addPostView(currentItem.id);

  //       //   const currentVideoElement = $(this).find('.item').eq(slideIndex).find('video')[0];
  //       //   if (currentVideoElement) {
  //       //     currentVideoElement.play();
  //       //   }
  //       // }
  //     });

  //     const initialVideoElement : HTMLVideoElement | null = document.querySelector(`#video-${this.selectedReelIndex}`);
  //       if (initialVideoElement) {
  //         initialVideoElement.play();
  //         initialVideoElement.muted = false;
  //       }


  //     // this.slickSlider.on('swipe', function(event:any, slick:any, direction:any) {
  //     //   
  //     //   if (direction === 'up') {
  //     //     // User has swiped upwards
  //     //     self.onSlideUp();
  //     //   } else if (direction === 'down') {
  //     //     // User has swiped downwards
  //     //     self.onSlideDown();
  //     //   }
  //     // });
  //     this.slickSlider.on('beforeChange', function(event:any, slick:any, currentSlide:any, nextSlide:any) {
  //       

  //       if(self.currentSlide != currentSlide && self.nextSlide != nextSlide){
  //       const direction = nextSlide > currentSlide ? 'down' : 'up';
  //       if (direction === 'up') {
  //         self.onSlideUp();
  //       }
  //       if (direction === 'down') {
  //         self.onSlideDown();
  //         self.isReelLoad = true;
  //       }
  //     }
  //     self.currentSlide = currentSlide;
  //     self.nextSlide = nextSlide;

  //       // if(direction == "up"){
  //       //   self.onSlideUp();
  //       // }
  //       // if(direction == "down"){
  //       //   self.onSlideDown();
  //       // }
  //   // console.log('Direction:', direction);
  //       // Find the current video element within the current slide
  //       const currentVideo = $(slick.$slides[currentSlide]).find('video')[0];

  //       // Pause the current video playback
  //       if (currentVideo && !currentVideo.paused) {
  //         currentVideo.pause();
  //       }

  //       self.cd.detectChanges();
  //     });

  //     this.slickSlider.on('afterChange', function(event:any, slick:any, currentSlide:any) {
  //       
  //       // Find the new video element within the current slide
  //       const newVideo = $(slick.$slides[currentSlide]).find('video')[0];

  //       // Play the new video
  //       if (newVideo && newVideo.paused) {
  //         newVideo.play();
  //       }
  //       self.cd.detectChanges();

  //     });

  //     const currentSlideIndex = $('.slick', '.vertical-slider').slick('slickCurrentSlide');
  //     const videoElement = $('.slick', '.vertical-slider').find('.item').eq(currentSlideIndex).find('video')[0];
  //     if (videoElement) {
  //       videoElement.play();
  //     }
  //   }



  onSlideUp() {
    if (this.from == "user") {
      this._userService.GetSliderReelsByUserId(this.userId, this.firstPostId, 1).subscribe((response: any) => {
        this.reels.unshift(...response);
        this.lastPostId = this.reels[this.reels.length - 1].id;
        this.firstPostId = this.reels[0].id;
        // this.isReelLoad = true;
        this.cd.detectChanges();
        // this.reels = this.reels.concat(response);

      });
    }

    if (this.from == "school") {
      this._schoolService.GetSliderReelsBySchoolId(this.ownerId, this.firstPostId, 1).subscribe((response: any) => {
        
        this.reels.unshift(...response);
        this.lastPostId = this.reels[this.reels.length - 1].id;
        this.firstPostId = this.reels[0].id;
        // this.isReelLoad = true;
        this.cd.detectChanges();
        // this.reels = this.reels.concat(response);
      });
    }

    if (this.from == "class") {
      this._classService.GetSliderReelsByClassId(this.ownerId, this.firstPostId, 1).subscribe((response: any) => {
        
        this.reels.unshift(...response);
        this.lastPostId = this.reels[this.reels.length - 1].id;
        this.firstPostId = this.reels[0].id;
        // this.isReelLoad = true;
        this.cd.detectChanges();
        // this.reels = this.reels.concat(response);

      });
    }

    if (this.from == "course") {
      this._courseService.GetSliderReelsByCourseId(this.ownerId, this.firstPostId, 1).subscribe((response: any) => {
        
        this.reels.unshift(...response);
        this.lastPostId = this.reels[this.reels.length - 1].id;
        this.firstPostId = this.reels[0].id;
        // this.isReelLoad = true;
        this.cd.detectChanges();
        // this.reels = this.reels.concat(response);

      });
    }

    if (this.from == "myFeed") {
      this._userService.getMyFeedSliderReels(this.userId, this.firstPostId, 1).subscribe((response: any) => {
        
        this.reels.unshift(...response);
        this.lastPostId = this.reels[this.reels.length - 1].id;
        this.firstPostId = this.reels[0].id;
        // this.isReelLoad = true;
        this.cd.detectChanges();
        // this.reels = this.reels.concat(response);

      });
    }

    if (this.from == "globalFeed") {
      this._userService.getGlobalFeedSliderReels(this.userId, this.firstPostId, 1).subscribe((response: any) => {
        
        this.reels.unshift(...response);
        this.lastPostId = this.reels[this.reels.length - 1].id;
        this.firstPostId = this.reels[0].id;
        // this.isReelLoad = true;
        this.cd.detectChanges();
        // this.reels = this.reels.concat(response);

      });
    }
  }

  isReelLoad: boolean = false;
  nextSlide: any;
  currentSlide: any;
  onSlideDown() {
    // if(!this.isReelLoad){

    if (this.from == "user" && !this.isFinishDownReels) {
      this._userService.GetSliderReelsByUserId(this.userId, this.lastPostId, 2).subscribe((response: any) => {
        
        this.reels.push(...response);
        if (response.length == 0) {
          this.isFinishDownReels = true;
        }
        const previousSlideCount = this.reels.length;

        this.lastPostId = this.reels[this.reels.length - 1].id;
        this.firstPostId = this.reels[0].id;

        const newSlideCount = this.reels.length;
        const slideOffset = newSlideCount - previousSlideCount;
        this.cd.detectChanges();
        // this.reels = this.reels.concat(response);

      });
    }

    if (this.from == "school") {
      this._schoolService.GetSliderReelsBySchoolId(this.ownerId, this.lastPostId, 2).subscribe((response: any) => {
        
        this.reels.push(...response);
        const previousSlideCount = this.reels.length;

        this.lastPostId = this.reels[this.reels.length - 1].id;
        this.firstPostId = this.reels[0].id;

        const newSlideCount = this.reels.length;
        const slideOffset = newSlideCount - previousSlideCount;
        this.cd.detectChanges();
        // this.reels = this.reels.concat(response);

      });
    }

    if (this.from == "class") {
      this._classService.GetSliderReelsByClassId(this.ownerId, this.lastPostId, 2).subscribe((response: any) => {
        
        this.reels.push(...response);
        const previousSlideCount = this.reels.length;

        this.lastPostId = this.reels[this.reels.length - 1].id;
        this.firstPostId = this.reels[0].id;

        const newSlideCount = this.reels.length;
        const slideOffset = newSlideCount - previousSlideCount;
        this.cd.detectChanges();
        // this.reels = this.reels.concat(response);

      });
    }

    if (this.from == "course") {
      this._courseService.GetSliderReelsByCourseId(this.ownerId, this.lastPostId, 2).subscribe((response: any) => {
        
        this.reels.push(...response);
        const previousSlideCount = this.reels.length;

        this.lastPostId = this.reels[this.reels.length - 1].id;
        this.firstPostId = this.reels[0].id;

        const newSlideCount = this.reels.length;
        const slideOffset = newSlideCount - previousSlideCount;
        this.cd.detectChanges();
        // this.reels = this.reels.concat(response);

      });
    }

    if (this.from == "myFeed") {
      this._userService.getMyFeedSliderReels(this.userId, this.lastPostId, 2).subscribe((response: any) => {
        
        this.reels.push(...response);
        const previousSlideCount = this.reels.length;

        this.lastPostId = this.reels[this.reels.length - 1].id;
        this.firstPostId = this.reels[0].id;

        const newSlideCount = this.reels.length;
        const slideOffset = newSlideCount - previousSlideCount;
        this.cd.detectChanges();
        // this.reels = this.reels.concat(response);

      });
    }


    if (this.from == "globalFeed") {
      this._userService.getGlobalFeedSliderReels(this.userId, this.lastPostId, 2).subscribe((response: any) => {
        
        this.reels.push(...response);
        const previousSlideCount = this.reels.length;

        this.lastPostId = this.reels[this.reels.length - 1].id;
        this.firstPostId = this.reels[0].id;

        const newSlideCount = this.reels.length;
        const slideOffset = newSlideCount - previousSlideCount;
        this.cd.detectChanges();
        // this.reels = this.reels.concat(response);

      });
    }
    // }
  }


  //   getSlideMarkup(response: any[]): string {
  //     let slideMarkup = '';

  //     for (const item of response) {
  //       // Generate the slide markup based on the item and provided HTML structure
  //       const slideHtml = `
  //         <div class="item">
  //           <div class="f-poppins" [ngStyle]="!isMobileView ? {'width': '50%'} : {'width': '100%'}">
  //             <div class="live-content" id="reel_content">
  //               <div class="live-inner w-100 reel_mobile">
  //                 <div class="live-image overflow-hidden position-relative">
  //                   <div class="reel_videoinner">
  //                     <video controls>
  //                       <source [src]="item.fileUrl" type="video/mp4">
  //                     </video>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       `;

  //       slideMarkup += slideHtml;
  //     }

  //     return slideMarkup;
  //   }





  addPostView(postId: string, post?: any) {
    
    this.postView.postId = postId;
    this._postService.postView(this.postView).subscribe((response) => {
      
      if (post != undefined) {
        post.views.length = response;

        // test
      }
    });
  }

  // for like

  likeUnlikePosts(postId: string, isLike: boolean, postType: number, post: any) {
    debugger;
    this.currentLikedPostId = postId;
    var likes: any[] = post.likes;
    var isLiked = likes?.filter(x => x.userId == this.userId && x.postId == postId);
    if (isLiked?.length != 0) {
      //this.isLiked = false;
      this.likesLength = post.likes?.length - 1;
      post.isPostLikedByCurrentUser = false;
      const translatedMessage = this.translateService.instant('ReelUnLikedSuccessfully');
      const translatedSummary = this.translateService.instant('Success');
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
    }
    else {
      //this.isLiked = true;
      this.likesLength = post.likes?.length + 1;
      post.isPostLikedByCurrentUser = true;
      if(post.createdBy != this.userId){
        var notificationContent = `liked your post(${post.title})`;
        this._notificationService.initializeNotificationViewModel(post.createdBy, NotificationType.Likes, notificationContent, this.userId, postId, postType, post, null).subscribe((_response) => {
        });
      }
      const translatedMessage = this.translateService.instant('ReelLikedSuccessfully');
      const translatedSummary = this.translateService.instant('Success');
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
    }

    this.likeUnlikePost.postId = postId;
    this.likeUnlikePost.isLike = isLike;
    this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
    this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
      
      post.likes = response;
      this.InitializeLikeUnlikePost();
    });


  }


  // get sender info

  getSenderInfo() {
    var validToken = localStorage.getItem("jwt");
    if (validToken != null) {
      let jwtData = validToken.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.userId = decodedJwtData.jti;
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

  InitializePostView() {
    this.postView = {
      postId: '',
      userId: ''
    };

  }

  saveReel(postId: string, post: any) {
    
    if (post.isPostSavedByCurrentUser) {
      post.savedPostsCount -= 1;
      post.isPostSavedByCurrentUser = false;
      const translatedMessage = this.translateService.instant('ReelRemovedSuccessfully');
      const translatedSummary = this.translateService.instant('Success');
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
      // savedReelResponse.next({isReelSaved:false,id:postId}); 
    }
    else {
      post.savedPostsCount += 1;
      post.isPostSavedByCurrentUser = true;
      const translatedMessage = this.translateService.instant('ReelSavedSuccessfully');
      const translatedSummary = this.translateService.instant('Success');
      this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
      // savedReelResponse.next({isReelSaved:false,id:postId}); 
    }
    this._postService.savePost(postId, this.userId).subscribe((_result) => {
    });
  }

  openSharePostModal(post: any, postType: number, title: string, description: string): void {
    
    if (post?.name == Constant.Private || post?.serviceType == Constant.Paid) {
      sharePostResponse.next({});
    }
    else {
      var image: string = '';
      if (postType == 1) {
        var postAttachments = post.postAttachments.find((x: { fileType: number; }) => x.fileType == 1);
        if (postAttachments != undefined) {
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
      this.bsModalService.show(SharePostComponent, { initialState });
    }
  }

  isModalOpen:boolean = false;
  openCommentsSection(reel: any) {
    debugger;
    this.isModalOpen = true;
    this.reel = reel;
    this.commentsPageNumber = 1;
    this._chatService.getComments(reel.id, this.commentsPageNumber).subscribe((response) => {
      this.reel.comments = response;
    });

    this._userService.getUser(this.userId).subscribe((response) => {
      this.sender = response;
    });
    this._signalRService.createGroupName(reel.id)
  }

  showCommentsDiv(isShowComments: boolean) {
    if (isShowComments) {
      this.isCommentsDisabled = false;
    }
    else {
      this.isCommentsDisabled = true;
    }

    this._postService.enableDisableComments(this.reel.id, this.isCommentsDisabled).subscribe((_response) => {

    });
  }

  @HostListener('scroll', ['$event'])
  scrollHandler(event: any) {
     const element = event.target;
     if (element.scrollTop === 0) {
        if(!this.commentsScrolled && this.scrollCommentsResponseCount != 0){
            this.commentsScrolled = true;
            this.commentsLoadingIcon = true;
            this.commentsPageNumber++;
            this.getNextComments();
            }
     }

  }

  getNextComments() {
    debugger;
    this._chatService.getComments(this.reel.id, this.commentsPageNumber).subscribe((response) => {
      this.reel.comments = response.concat(this.reel.comments);
      this.cd.detectChanges();
      this.commentsLoadingIcon = false;
      this.scrollCommentsResponseCount = response.length;
      this.commentsScrolled = false;
      const chatList = this.groupChatList.nativeElement;
      const chatListHeight = chatList.scrollHeight;
      this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.clientHeight;
      const scrollOptions = {
        duration: 300,
        easing: 'ease-in-out'
      };
      chatList.scrollTo({
        top: this.groupChatList.nativeElement.scrollTop,
        left: 0,
        ...scrollOptions
      });
    });
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    debugger;
    const screenWidth = window.innerWidth;
    if (screenWidth >= 992) {
      this.isMobileView = false;
    }
    else {
      this.isMobileView = true;
    }
  }

  // previousScrollPosition: number = window.pageYOffset;
  //  @HostListener('window:scroll', [])
  //  onWindowScroll() {
  //    const currentScrollPosition = window.pageYOffset;

  //    if (currentScrollPosition > this.previousScrollPosition) {
  //      // Slide Down
  //      this.onSlideDown();
  //    } else if (currentScrollPosition < this.previousScrollPosition) {
  //      // Slide Up
  //      this.onSlideUp();
  //    }
  //   }

  sendToGroup(reel: any) {
    debugger;
    let message = this.messageToGroup;
    if(!message || message.trim().length == 0){
      return;
    }
    var comment: any[] = reel.comments;
    this.InitializeCommentViewModel();
    this.commentViewModel.userId = this.sender.id;
    this.commentViewModel.groupName = reel.id + "_group";
    this.commentViewModel.userName = this.sender.firstName + " " + this.sender.lastName;
    this.commentViewModel.content = this.messageToGroup;
    this.commentViewModel.userAvatar = this.sender.avatar;
    this.commentViewModel.isUserVerified = this.sender.isVarified;
    this.messageToGroup = "";
    this.commentViewModel.id = Constant.defaultGuid;
    this._chatService.addComments(this.commentViewModel).subscribe((response) => {
      debugger;
      comment.push(response);
      reel.commentsCount = comment.length;
      this.cd.detectChanges();
      this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
      this.commentViewModel.id = response.id;
      this._signalRService.sendToGroup(this.commentViewModel);
      if(reel.parentId != this.userId){
        var translatedMessage = this.translateService.instant('commented in your reel');
        var notificationContent = translatedMessage;
        this._notificationService.initializeNotificationViewModel(reel.parentId, NotificationType.CommentSent, notificationContent, this.userId, reel.id, reel.postType, null, null,null,null).subscribe((response) => {
        });
      }
    });
  }

  InitializeCommentViewModel() {
    this.commentViewModel = {
      id: '',
      userId: '',
      content: '',
      groupName: '',
      userAvatar: '',
      createdOn: new Date(),
      userName: '',
      isUserVerified: false
    };
  }

  hideCommentModal() {
    this.bsModalService.hide();
  }




  // new from here


  getVolume:any;
  afterChange(event: any) {
    const currentItem = this.reels[event.currentSlide];
    this.addPostView(currentItem.id, currentItem);
    const currentSlideIndex = event.currentSlide;
    const videojsElement: HTMLVideoElement | null = document.querySelector(`#video-${currentSlideIndex}`);
    if (videojsElement) {
      const firstElement = videojsElement.children[0];
      if (firstElement) {
        const videoElement = firstElement.children[0] as HTMLVideoElement
        if (videoElement) {
          videoElement.play()
          videoElement.muted = this.muted;
        }
      }
    }

  }

  muted:boolean=true;
  beforeChange(event: any) {
    const currentSlideIndex = event.currentSlide;
    const direction = event.nextSlide > event.currentSlide ? 'down' : 'up';
    if (direction === 'up') {
      this.onSlideUp();
    }
    if (direction === 'down') {
      this.onSlideDown();
    }
    const videojsElement: HTMLVideoElement | null = document.querySelector(`#video-${currentSlideIndex}`);
    if (videojsElement) {
      const firstElement = videojsElement.children[0];
      if (firstElement) {
        const videoElement = firstElement.children[0] as HTMLVideoElement
        if (videoElement) {
          videoElement.pause();
          if(videoElement.muted == false){
            this.muted = false
          } else{
            this.muted = true
          }
        }
      }
    }
  }


  carouselConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    accessibility: true,
    dots: true,
    numberOfDots: 3,
    vertical: true,
    verticalSwiping: true,
    arrows: false,
    autoplay: false,
    infinite: false,
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

  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    if(!this.isModalOpen){
    if (event.deltaY < 0) {
      // Scroll up
      this.carousel.slickPrev();
    } else if (event.deltaY > 0) {
      // Scroll down
      this.carousel.slickNext();
    }
  }

  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    
    this.cd.detectChanges();
    const slick = this.slickCarouselRef.nativeElement.slick;
    switch (event.key) {
      case 'ArrowUp':
        slick.slickPrev();
        break;
      case 'ArrowDown':
        slick.slickNext();
        break;
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

  getDeletedPostId(id:string){
    this.loadingIcon = true;
    this._postService.deletePost(id).subscribe((_response) => {
      var deletedPost = this.reels.find((x: { id: string; }) => x.id == id);
      const index = this.reels.indexOf(deletedPost);
      if (index > -1) {
        this.reels.splice(index, 1);
      }
      this.loadingIcon = false;
      deleteReelResponse.next({});
      if(this.index == this.reels.length){
        debugger
        let newUrl = `/user/reelsView/${this.ownerId}/${this.from}/${this.reels[this.index - 1].postAttachments[0].id}/${this.reels[this.index - 1].id}`
        history.replaceState({}, '', newUrl);
        return;
      }
      let newUrl = `/user/reelsView/${this.ownerId}/${this.from}/${this.reels[this.index + 1].postAttachments[0].id}/${this.reels[this.index + 1].id}`
      history.replaceState({}, '', newUrl)
    });
  }

  openPostModal(post: any) {
    debugger
    // this.bsModalService.hide(this.bsModalService.config.id);
    // this.cd.detectChanges();
    const initialState = {
      editPostId: post.id,
      type:Constant.Reel,
      from: post.postAuthorType == 1 ? "school" : post.postAuthorType == 2 ? "class" : post.postAuthorType == 3 ? "course" : post.postAuthorType == 4 ? "user" : undefined
    };
    setTimeout(() => {
      this.bsModalService.show(CreatePostComponent, { initialState });
    }, 500);
    //this.bsModalService.show(CreatePostComponent,{initialState});
  }



  fromForComment:any;
  postForComment: any;
  isBanned:boolean=false;
  isUserBanned(){
    debugger;
    this._studentService.isStudentBannedFromClassCourse(this.ownerId, this.fromForComment, this.parentId).subscribe((response:any)=>{
      debugger;
      if(response == true){
        this.isBanned = true;
      } else{
        this.isBanned = false;
      }
    });
    

  }

  initializeCommentLikeUnlike() {
    this.commentLikeUnlike = {
      commentId: "",
      userId: "",
      likeCount: 0,
      isLike: false,
      groupName: ""
    }

  }

  deleteComment(item:any){
    debugger;
    // this.initializeCommentLikeUnlike();
    // this.commentLikeUnlike.userId = this.userId;
    // this.commentLikeUnlike.commentId = item.id;
    // this.commentLikeUnlike.groupName = item.groupName;
    // if(this.userId == item.userId){
    //   this._signalRService.notifyCommentDelete(this.commentLikeUnlike);
    //   let indexOfComment = this.reel.comments.findIndex((x:any) => x.id == this.commentLikeUnlike.commentId)
    //   this.reel.comments.splice(indexOfComment, 1)
    // }

    const initialState = { item : item, from : "deleteComment" };
    this.bsModalService.show(DeleteConfirmationComponent, { initialState });
   
  }


  parentId:string=''
  getReelsById(reels:any, index:any){
    debugger;
    this._reelsService.getReelById(reels[index]?.postAttachments[0]?.id).subscribe((response:any) => {
      this.postForComment = response;
      if(response.class != null || response.course != null){
        if(response.class?.classId != null){
          this.fromForComment = ClassCourseEnum.Class
          this.parentId = response.class.classId
        }
        if(response.course?.courseId != null){
          this.fromForComment = ClassCourseEnum.Course
          this.parentId = response.course.courseId
        }
        this.isUserBanned();
      }
      
    })
  }

  deleteId:any;
  index:any;
  getDeleteId(deleteId:any, index?:any){
    this.deleteId = deleteId;
    this.index = index;
  }

  // playPause(e: any) {
  //   debugger;
  //   if (e.target.nodeName === 'VIDEO') {
  //     if (!this.videoComp.player.paused()) {
  //       this.videoComp.player.pause();
  //     } else {
  //       this.videoComp.player.play();
  //     }
  //   }
  // }

  touchStartX: number = 0;
  touchEndX: number = 0;
  swipeThreshold = 50;
  isSwiping = false;
  lastTap = 0;
  doubleTapDelay = 500;

  onTouchStart(event:any, index?:number, video?:any){
    if(this.isMobileView){
      this.touchStartX = event.touches[0].clientX;
      this.isSwiping = false;
    }
  }

  onTouchEnd(event: TouchEvent, index?:number, video?:any) {
    if(this.isMobileView){
      this.touchEndX = event.changedTouches[0].clientX;
      const deltaX = this.touchEndX - this.touchStartX;

      if (Math.abs(deltaX) > this.swipeThreshold) {
        this.isSwiping = true;
      } else {
        const currentTime = new Date().getTime();
        const tapDelay = currentTime - this.lastTap;

        if (tapDelay < this.doubleTapDelay) {
          this.likeVideo(index, video);
        } else {
          this.togglePlayPause(index);
        }

        this.lastTap = currentTime;
      }
    }
  }

  togglePlayPause(index?: number, video?:any) {
    let videoJsElement = document.getElementById(`video-${index}`);
    if (videoJsElement) {
      const firstElement = videoJsElement.children[0];
      if (firstElement) {
        const videoElement = firstElement.children[0] as HTMLVideoElement;
        if (videoElement) {
          if (videoElement.paused) {
            videoElement.play();
          } else {
            videoElement.pause();
          }
        }
      }
    }
  }
  

  likeVideo(index?:number, video?:any){
    this.likeUnlikePosts(video.id, true, video.postType, video);
    this.togglePlayPause(index);
    console.log('hy')
  }

  likeUnlikeComments(commentId: string, _isLike: boolean, _isCommentLikedByCurrentUser: boolean, _likeCount: number, reel?:any) {
    debugger;
    var comment: any[] = reel.comments;
    var isCommentLiked = comment.find(x => x.id == commentId);
    this.initializeCommentLikeUnlike();
    this.commentLikeUnlike.userId = this.sender.id;
    this.commentLikeUnlike.commentId = commentId;
    this.commentLikeUnlike.groupName = isCommentLiked.groupName;
    if (isCommentLiked.isCommentLikedByCurrentUser) {
      isCommentLiked.isCommentLikedByCurrentUser = false;
      isCommentLiked.likeCount = isCommentLiked.likeCount - 1;
      this.commentLikeUnlike.isLike = false;
      this.commentLikeUnlike.likeCount = isCommentLiked.likeCount;
    }
    else {
      isCommentLiked.isCommentLikedByCurrentUser = true;
      isCommentLiked.likeCount = isCommentLiked.likeCount + 1;

      this.commentLikeUnlike.isLike = true;
      this.commentLikeUnlike.likeCount = isCommentLiked.likeCount;
    }
    // if(this.sender.id != isCommentLiked.user.id){
      this.signalRService.notifyCommentLike(this.commentLikeUnlike);
      if(isCommentLiked.user.id != this.sender.id && this.commentLikeUnlike.isLike){
        var translatedMessage = this.translateService.instant('liked your comment');
        var notificationContent = translatedMessage;
        this._notificationService.initializeNotificationViewModel(isCommentLiked.user.id, NotificationType.CommentSent, notificationContent, this.sender.id, reel.id, reel.postType, null, null).subscribe((response) => {
      });
    }

    // }
    // this._signalRService.sendNotification();
  }

  modalClose(){
    this.isModalOpen = false;
    this.cd.detectChanges();
  }

}



