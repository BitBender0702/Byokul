import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { sharePostResponse } from '../postView/postView.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SchoolService } from 'src/root/service/school.service';
import { CourseService } from 'src/root/service/course.service';
import { ClassService } from 'src/root/service/class.service';
import { ChatService } from 'src/root/service/chatService';
import { CommentViewModel } from 'src/root/interfaces/chat/commentViewModel';
import { SignalrService, commentLikeResponse, commentResponse } from 'src/root/service/signalr.service';
import { PostView } from 'src/root/interfaces/post/postView';
import { SlickCarouselComponent } from 'ngx-slick-carousel';

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
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild(SlickCarouselComponent, { static: false }) carousel!: SlickCarouselComponent;
  @ViewChild('slickCarousel') slickCarousel!: ElementRef;


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
  @ViewChild('groupChatList') groupChatList!: ElementRef;


  constructor(injector: Injector, private bsModalService: BsModalService, private route: ActivatedRoute, private translateService: TranslateService, public messageService: MessageService, private userService: UserService, private schoolService: SchoolService, private classService: ClassService, private courseService: CourseService, private notificationService: NotificationService, private postService: PostService, private chatService: ChatService, private signalRService: SignalrService, private cd: ChangeDetectorRef) {
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
    this.translate.use(selectedLang ?? '');
    this.post = history.state.post;
    this.InitializePostView();
    this.getSenderInfo();
    this.addPostView(this.post.postId);
    this.loadingIcon = true;
    this.ownerId = this.route.snapshot.paramMap.get('id') ?? '';
    this.from = this.route.snapshot.paramMap.get('from') ?? '';
    this.reelId = this.route.snapshot.paramMap.get('reelId') ?? '';






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
        debugger
        var comment: any[] = this.reels.post.comments;
        var commentObj = { id: response.id, content: response.message, likeCount: 0, isCommentLikedByCurrentUser: false, userAvatar: response.senderAvatar, userName: response.userName, userId: response.userId, isUserVerified: response.isUserVerified };
        comment.push(commentObj);
        this.cd.detectChanges();
        this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
      });
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
  }

  ngOnDestroy(): void {
    if (this.commentResponseSubscription) {
      this.commentResponseSubscription.unsubscribe();
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
        debugger
        // Extract postAttachments from each reel and add them to the allPostAttachments list
        const postAttachments = reel.postAttachments;
        this.videos.push(...postAttachments);
      });

      var index = this.videos.findIndex((x: { id: string; }) => x.id == this.reelId);
      this.selectedReelIndex = index;
      this.carouselConfig.initialSlide = this.selectedReelIndex;
      // this.reels.find(x => x.);
      this.initializeReelsSlider();
      const initialVideoElement: HTMLVideoElement | null = document.querySelector(`#video-${this.selectedReelIndex}`);
      if (initialVideoElement) {
        initialVideoElement.play();
        initialVideoElement.muted = false;
      }
    });
  }

  getReelsBySchool(schoolId: string) {
    debugger
    this._schoolService.GetSliderReelsBySchoolId(schoolId, this.reelId, 3).subscribe((response) => {
      this.reels = response;
      this.selectedReel = this.reels[0];
      this.lastPostId = this.reels[this.reels.length - 1].id;
      this.firstPostId = this.reels[0].id;
      this.reels.forEach((reel: any) => {
        debugger
        // Extract postAttachments from each reel and add them to the allPostAttachments list
        const postAttachments = reel.postAttachments;
        this.videos.push(...postAttachments);
      });

      var index = this.videos.findIndex((x: { id: string; }) => x.id == this.reelId);
      this.selectedReelIndex = index;
      this.carouselConfig.initialSlide = this.selectedReelIndex;
      // this.reels.find(x => x.);
      this.initializeReelsSlider();
      const initialVideoElement: HTMLVideoElement | null = document.querySelector(`#video-${this.selectedReelIndex}`);
      if (initialVideoElement) {
        initialVideoElement.play();
        initialVideoElement.muted = false;
      }
    });
  }

  getReelsByClass(classId: string) {
    debugger
    this._classService.GetSliderReelsByClassId(classId, this.reelId, 3).subscribe((response) => {
      this.reels = response;
      this.selectedReel = this.reels[0];
      this.lastPostId = this.reels[this.reels.length - 1].id;
      this.firstPostId = this.reels[0].id;
      this.reels.forEach((reel: any) => {
        debugger
        // Extract postAttachments from each reel and add them to the allPostAttachments list
        const postAttachments = reel.postAttachments;
        this.videos.push(...postAttachments);
      });

      var index = this.videos.findIndex((x: { id: string; }) => x.id == this.reelId);
      this.selectedReelIndex = index;
      this.carouselConfig.initialSlide = this.selectedReelIndex;
      // this.reels.find(x => x.);
      this.initializeReelsSlider();
      const initialVideoElement: HTMLVideoElement | null = document.querySelector(`#video-${this.selectedReelIndex}`);
      if (initialVideoElement) {
        initialVideoElement.play();
        initialVideoElement.muted = false;
      }
    });
  }

  getReelsByCourse(courseId: string) {
    debugger
    this._courseService.GetSliderReelsByCourseId(courseId, this.reelId, 3).subscribe((response) => {
      this.reels = response;
      this.selectedReel = this.reels[0];
      this.lastPostId = this.reels[this.reels.length - 1].id;
      this.firstPostId = this.reels[0].id;
      this.reels.forEach((reel: any) => {
        debugger
        // Extract postAttachments from each reel and add them to the allPostAttachments list
        const postAttachments = reel.postAttachments;
        this.videos.push(...postAttachments);
      });

      var index = this.videos.findIndex((x: { id: string; }) => x.id == this.reelId);
      this.selectedReelIndex = index;
      this.carouselConfig.initialSlide = this.selectedReelIndex;
      // this.reels.find(x => x.);
      this.initializeReelsSlider();
      const initialVideoElement: HTMLVideoElement | null = document.querySelector(`#video-${this.selectedReelIndex}`);
      if (initialVideoElement) {
        initialVideoElement.play();
        initialVideoElement.muted = false;
      }
    });
  }

  getMyFeedReels() {
    this._userService.getMyFeedSliderReels(this.userId, this.reelId, 3).subscribe((response) => {
      this.reels = response;
      this.selectedReel = this.reels[0];
      this.lastPostId = this.reels[this.reels.length - 1].id;
      this.firstPostId = this.reels[0].id;
      this.reels.forEach((reel: any) => {
        debugger
        // Extract postAttachments from each reel and add them to the allPostAttachments list
        const postAttachments = reel.postAttachments;
        this.videos.push(...postAttachments);
      });

      var index = this.videos.findIndex((x: { id: string; }) => x.id == this.reelId);
      this.selectedReelIndex = index;
      this.carouselConfig.initialSlide = this.selectedReelIndex;
      // this.reels.find(x => x.);
      this.initializeReelsSlider();
      const initialVideoElement: HTMLVideoElement | null = document.querySelector(`#video-${this.selectedReelIndex}`);
      if (initialVideoElement) {
        initialVideoElement.play();
        initialVideoElement.muted = false;
      }
    });
  }

  getGlobalFeedReels() {
    this._userService.getGlobalFeedSliderReels(this.userId, this.reelId, 3).subscribe((response) => {
      this.reels = response;
      this.selectedReel = this.reels[0];
      this.lastPostId = this.reels[this.reels.length - 1].id;
      this.firstPostId = this.reels[0].id;
      this.reels.forEach((reel: any) => {
        debugger
        // Extract postAttachments from each reel and add them to the allPostAttachments list
        const postAttachments = reel.postAttachments;
        this.videos.push(...postAttachments);
      });

      var index = this.videos.findIndex((x: { id: string; }) => x.id == this.reelId);
      this.selectedReelIndex = index;
      this.carouselConfig.initialSlide = this.selectedReelIndex;
      // this.reels.find(x => x.);
      this.initializeReelsSlider();
      const initialVideoElement: HTMLVideoElement | null = document.querySelector(`#video-${this.selectedReelIndex}`);
      if (initialVideoElement) {
        initialVideoElement.play();
        initialVideoElement.muted = false;
      }
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
  //     debugger
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
  //       //   debugger
  //       //   const previousVideoElement = $(this).find('.item').eq(slideIndex).find('video')[0];
  //       //   if (previousVideoElement) {
  //       //     previousVideoElement.pause();
  //       //   }
  //       // },
  //       // onAfterChange: (slideIndex: any) => {
  //       //   debugger
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
  //     //   debugger
  //     //   if (direction === 'up') {
  //     //     // User has swiped upwards
  //     //     self.onSlideUp();
  //     //   } else if (direction === 'down') {
  //     //     // User has swiped downwards
  //     //     self.onSlideDown();
  //     //   }
  //     // });
  //     this.slickSlider.on('beforeChange', function(event:any, slick:any, currentSlide:any, nextSlide:any) {
  //       debugger

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
  //       debugger
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
        debugger
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
        debugger
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
        debugger
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
        debugger
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
        debugger
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
        debugger
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
    debugger
    // if(!this.isReelLoad){

    if (this.from == "user" && !this.isFinishDownReels) {
      this._userService.GetSliderReelsByUserId(this.userId, this.lastPostId, 2).subscribe((response: any) => {
        debugger
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
        debugger
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
        debugger
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
        debugger
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
        debugger
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
        debugger
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
    debugger
    this.postView.postId = postId;
    this._postService.postView(this.postView).subscribe((response) => {
      debugger
      if (post != undefined) {
        post.views.length = response;

        // test
      }
    });
  }

  // for like

  likeUnlikePosts(postId: string, isLike: boolean, postType: number, post: any) {
    debugger
    this.currentLikedPostId = postId;
    var likes: any[] = post.likes;
    var isLiked = likes.filter(x => x.userId == this.userId && x.postId == postId);
    if (isLiked.length != 0) {
      //this.isLiked = false;
      this.likesLength = post.likes.length - 1;
      post.isPostLikedByCurrentUser = false;
    }
    else {
      //this.isLiked = true;
      this.likesLength = post.likes.length + 1;
      post.isPostLikedByCurrentUser = true;
      var notificationContent = `liked your post(${post.title})`;
      this._notificationService.initializeNotificationViewModel(post.createdBy, NotificationType.Likes, notificationContent, this.userId, postId, postType, post, null).subscribe((_response) => {
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
    debugger
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
    debugger
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

  openCommentsSection(reel: any) {
    debugger
    this.reel = reel;
    this._chatService.getComments(reel.id, this.commentsPageNumber).subscribe((response) => {
      debugger
      this.reel.comments = response;
    });

    this._userService.getUser(this.userId).subscribe((response) => {
      this.sender = response;
    });
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

  @HostListener('window:resize')
  onWindowResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
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
    debugger
    var comment: any[] = reel.comments;
    this.InitializeCommentViewModel();
    this.commentViewModel.userId = this.sender.id;
    this.commentViewModel.groupName = reel.id + "_group";
    this.commentViewModel.content = this.messageToGroup;
    this.commentViewModel.userAvatar = this.sender.avatar;
    this.commentViewModel.isUserVerified = this.sender.isVerified;
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


  afterChange(event: any) {
    debugger
    const currentItem = this.reels[event.currentSlide];
    this.addPostView(currentItem.id, currentItem);
    const currentSlideIndex = event.currentSlide;
    const videojsElement: HTMLVideoElement | null = document.querySelector(`#video-${currentSlideIndex}`);
    if (videojsElement) {
      const firstElement = videojsElement.children[0];
      if (firstElement) {
        const videoElement = firstElement.children[0] as HTMLVideoElement
        console.log(videoElement)
        if (videoElement) {
          debugger
          videoElement.play();
        }
      }
    }

  }

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
        console.log(videoElement)
        if (videoElement) {
          debugger
          videoElement.pause();
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
    if (event.deltaY < 0) {
      // Scroll up
      this.carousel.slickPrev();
    } else if (event.deltaY > 0) {
      // Scroll down
      this.carousel.slickNext();
    }

  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    debugger
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



}



