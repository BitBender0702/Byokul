import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import { CommentLikeUnlike } from 'src/root/interfaces/chat/commentsLike';
import { CommentViewModel } from 'src/root/interfaces/chat/commentViewModel';
import { Constant } from 'src/root/interfaces/constant';
import { NotificationType } from 'src/root/interfaces/notification/notificationViewModel';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { ChatService } from 'src/root/service/chatService';
import { NotificationService } from 'src/root/service/notification.service';
import { PostService } from 'src/root/service/post.service';
import { SchoolService } from 'src/root/service/school.service';
import { commentDeleteResponse, commentLikeResponse, commentResponse, SignalrService } from 'src/root/service/signalr.service';
import { UserService } from 'src/root/service/user.service';
import { SharePostComponent } from '../sharePost/sharePost.component';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { MessageService } from 'primeng/api';
import { CertificateViewComponent } from '../certificateView/certificateView.component';
import { JoinMeetingModel } from 'src/root/interfaces/bigBlueButton/joinMeeting';
import { BigBlueButtonService } from 'src/root/service/bigBlueButton';
import { CreatePostComponent } from '../createPost/createPost.component';
import { StudentService } from 'src/root/service/student.service';
import { ClassCourseEnum } from 'src/root/Enums/classCourseEnum';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';

import { TranslateService } from '@ngx-translate/core';
import { response } from 'express';


export const sharePostResponse = new Subject<{}>();
export const deletePostResponse = new Subject<{ postId: string }>();
export const savedPostResponse = new Subject<{ isPostSaved: boolean, postId: string }>();

export const deleteCommentResponse = new Subject<{ commentId: string }>();

@Component({
  selector: 'post-view',
  templateUrl: './postView.component.html',
  styleUrls: ['./postView.component.css'],
  providers: [MessageService]
})

export class PostViewComponent implements OnInit, AfterViewInit, OnDestroy {
  posts: any;
  @ViewChild('createPostModal', { static: true }) createPostModal!: ModalDirective;
  @ViewChild('groupChatList') groupChatList!: ElementRef;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  private _signalRService;
  private _userService;
  private _chatService;
  private _notificationService;
  private _bigBlueButtonService;
  showCommentsField: boolean = true;
  messageToGroup!: string;
  private _postService;
  likeUnlikePost!: LikeUnlikePost;
  postView!: PostView;
  currentLikedPostId!: string;
  likesLength!: number;
  isLiked!: boolean;
  userId!: string;
  pageNumber: number = 1;
  isDataLoaded: boolean = false;
  sender: any;
  commentViewModel!: CommentViewModel;
  commentLikeUnlike!: CommentLikeUnlike;
  isCommentsDisabled!: boolean;
  postId!: string;
  postPageView: boolean = false;
  post!: any;
  commentsScrolled: boolean = false;
  scrollCommentsResponseCount: number = 1;
  commentsLoadingIcon: boolean = false;
  commentsPageNumber: number = 1;
  isPlayerLoad: boolean = false;
  gender!: string;
  loadingIcon: boolean = false;

  base64String!: Uint8Array;
  base64String2!: any;
  imageSource!: any;
  joinMeetingViewModel!: JoinMeetingModel;
  commentResponseSubscription!: Subscription;

  commentDeletdResponseSubscription!: Subscription

  private _studentService;

  constructor(private bsModalService: BsModalService,private translateService: TranslateService, bigBlueButtonService: BigBlueButtonService,studentService: StudentService, public messageService: MessageService, notificationService: NotificationService, chatService: ChatService, public signalRService: SignalrService, public postService: PostService, public options: ModalOptions, private fb: FormBuilder, private router: Router, private http: HttpClient, private activatedRoute: ActivatedRoute, userService: UserService, private cd: ChangeDetectorRef) {
    this._postService = postService;
    this._signalRService = signalRService;
    this._userService = userService;
    this._chatService = chatService;
    this._notificationService = notificationService;
    this._bigBlueButtonService = bigBlueButtonService;
    this._studentService = studentService;
  }

  isBanned:boolean = false;
  ngOnInit(): void {
    debugger
    this.getSenderInfo();
    var id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id != null) {
      this.postId = id;
      this.postPageView = true;
    }
    else {
      debugger
      this.posts = this.options.initialState;
      this.post = this.posts.posts;

      // this.isBanned = this.posts.isBanned

      var postValueTag = this.post.postTags[0]?.postTagValue;
      try{
        this.postsTagValues = JSON.parse(postValueTag);
      }
      catch{
        
      }
      //   if(this.post.postAuthorType == 2 || this.post.postAuthorType == 3){
      //   this.post.postAttachments.forEach((item: any) => {
      //   const byteArray = new Uint8Array(atob(item.byteArray).split('').map(char => char.charCodeAt(0)));
      //   if(item.fileType == 1){
      //     var type = 'image/png';
      //   }
      //   else{
      //     var type = 'video/mp4';
      //   }
      //   const blob = new Blob([byteArray], { type: type });
      //   const reader = new FileReader();
      //   reader.onloadend = () => {
      //     item.fileUrl = reader.result as string;
      //   };
      //   reader.readAsDataURL(blob);      
      // });

      //   }

      // this.base64String = Uint8Array.from(window.atob(this.post.postAttachments[0].byteArrayUrl), (c) => c.charCodeAt(0)) 
      // const base64String = btoa(String.fromCharCode.apply(null, this.post.postAttachments[0].byteArrayUrl));
      // this.imageSource = `data:image/png;base64,${base64String}`;
      //this.base64String2 = atob(this.post.postAttachments[0].byteArrayUrl);
      // this.base64String = btoa(String.fromCharCode.apply(null, this.post.postAttachments[0].byteArrayUrl));
      this.postId = this.post.id;
      this.getComments();
    }

    debugger
    this._postService.getPostById(this.postId).subscribe((response) => {
      debugger
      this.postForComment = response;
      this.isUserBanned();
      if (id != null) {
        this.post = response;
        // this.base64String = btoa(String.fromCharCode.apply(null, this.post.postAttachments[0].base64String));
        this.getComments();
      }

      if (this.post.isLive) {
        if (this.post.createdBy == this.userId) {
          this.router.navigate(
            [`liveStream`, this.post.id, false]
          );
        }

        else {
          this.initializeJoinMeetingViewModel();
          this._userService.getUser(this.userId).subscribe((result) => {
            debugger
            this.joinMeetingViewModel.name = result.firstName + " " + result.lastName;
            var params = new URLSearchParams(this.post.streamUrl.split('?')[1]);
            this.joinMeetingViewModel.meetingId = params.get('meetingID')?.replace("meetings", "") ?? '';
            this.joinMeetingViewModel.postId = this.post.id;
            this._bigBlueButtonService.joinMeeting(this.joinMeetingViewModel).subscribe((response) => {
              //  const fullNameIndex = response.url.indexOf('fullName='); // find the index of "fullName="
              //  const newUrl = response.url.slice(fullNameIndex);
              this.router.navigate(
                [`liveStream`, this.post.id, false]
                //     { state: { stream: {streamUrl: response.url, userId:this.userId, meetingId: meetingId, isOwner:false} } });
                // });
              );
            });
          });
        }
      }

      else {



        this.isCommentsDisabled = response.isCommentsDisabled
        this.createGroupName();
        this.commentResponse();
        this.commentLikeResponse();
        debugger
        if (this.post.postId != null) {
          this.addPostView(this.post.postId);
        }
        else {
          this.addPostView(this.post.id);
        }


        // if(this.post.postAuthorType == 2 || this.post.postAuthorType == 3){
        //   this.post.postAttachments.forEach((item: any) => {
        //     debugger
        //   const byteArray = new Uint8Array(atob(item.byteArray).split('').map(char => char.charCodeAt(0)));
        //   if(item.fileType == 1){
        //     var type = 'image/png';
        //   }
        //   else{
        //     var type = 'video/mp4';
        //   }
        //   const blob = new Blob([byteArray], { type: type });
        //   const reader = new FileReader();
        //   reader.onloadend = () => {
        //     debugger
        //     item.fileUrl = reader.result as string;
        //     this.isDataLoaded = true;
        //     this.initializeVideoPlayer();
        //   };
        //   reader.readAsDataURL(blob);      
        // });

        //   }
        //   else{
        this.isDataLoaded = true;
        // this.initializeVideoPlayer();
        //  }        

      setTimeout(() => {
        var modal = document.getElementById('modal-post');
        window.onclick = (event) => {
          if (event.target == modal) {
            if (modal != null) {
              this.bsModalService.hide();
            }
          }
        }
      }, 0);

        this.isPlayerLoad = true;
        this.cd.detectChanges();
      }
    });


    this.gender = localStorage.getItem("gender") ?? '';
    this.InitializeLikeUnlikePost();
    // this.getSenderInfo();
    this.cd.detectChanges();

    this.savePreferences(this.post.title, this.post.description, this.post.postTags);

    // setTimeout(() => {
    //   this.addEventListnerOnCarousel();
    // }, 1000);

    if(!this.commentDeletdResponseSubscription){
      commentDeleteResponse.subscribe(response =>{
        let indexOfComment = this.post.comments.findIndex((x:any) => x.id == response.commentId)
        this.post.comments.splice(indexOfComment, 1)
      })
    }

    

  }

  ngOnDestroy(): void {
    if (this.commentResponseSubscription) {
      this.commentResponseSubscription.unsubscribe();
    }
    if (this.commentDeletdResponseSubscription) {
      this.commentDeletdResponseSubscription.unsubscribe();
    }
    // if (this.commentDeletdResponseSubscription) {
    //   this.commentDeletdResponseSubscription.unsubscribe();
    // }
  }

  ngAfterViewInit() {
    setTimeout(() => this.scrollToBottom());

    setTimeout(() => {
      this.addEventListnerOnCarousel();
    }, 1000);
    
  }

  initializeJoinMeetingViewModel() {
    this.joinMeetingViewModel = {
      name: '',
      meetingId: '',
      postId: ''
    }
  }

  initializeVideoPlayer() {
    this.cd.detectChanges();
    // const player = videojs(this.videoPlayer.nativeElement, { autoplay: false, });
  }

  savePreferences(title: string, description: string, postTags: any) {
    debugger
    var tagString = '';
    postTags.forEach(function (item: any) {
      tagString = tagString + item.postTagValue
    });

    var preferenceString = (title ?? '') + ' ' + (description ?? '') + ' ' + tagString ?? '';
    this._userService.saveUserPreference(preferenceString).subscribe((_response) => {
    });
  }

  scrollToBottom(): void {
    try {
      this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
    } catch (err) { }
  }

  commentResponse() {
    if (!this.commentResponseSubscription) {
      this.commentResponseSubscription = commentResponse.subscribe(response => {
        debugger
        var comment: any[] = this.post.comments;
        var commentObj = { id: response.id, content: response.message, likeCount: 0, isCommentLikedByCurrentUser: false, userAvatar: response.senderAvatar, userName: response.userName, userId: response.userId, isUserVerified: response.isUserVerified };
        comment.push(commentObj);
        this.cd.detectChanges();
        this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
      });
    }
  }

  commentLikeResponse() {
    commentLikeResponse.subscribe(response => {
      debugger;
      var comments: any[] = this.post.comments;
      var reqComment = comments.find(x => x.id == response.commentId);
      if (response.isLike) {
        reqComment.likeCount = reqComment.likeCount + 1;
      }
      else {
        reqComment.likeCount = reqComment.likeCount - 1;
      }
    });
  }

  getComments() {
    this._chatService.getComments(this.post.id, this.pageNumber).subscribe((response) => {
      debugger
      this.post.comments = response;
    });
  }

  getSenderInfo() {
    debugger
    var validToken = localStorage.getItem("jwt");
    if (validToken != null) {
      let jwtData = validToken.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.userId = decodedJwtData.jti;

      this._userService.getUser(this.userId).subscribe((response) => {
        debugger;
        this.sender = response;
      });
    }
  }

  createGroupName() {
    this._signalRService.createGroupName(this.post.id);
    this.postView = {
      postId: '',
      userId: ''
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

  postsTagValues: any;
  show() {
    this.createPostModal.show();
  }

  close(): void {
    this.bsModalService.hide();
  }

  showComments() {

    if (this.showCommentsField) {
      this.showCommentsField = false;
    }
    else {
      this.showCommentsField = true;
    }
  }

  likeUnlikePosts(postId: string, isLike: boolean, postType: number, post: any) {
    this.currentLikedPostId = postId;
    var likes: any[] = this.post.likes;
    var isLiked = likes.filter(x => x.userId == this.userId && x.postId == postId);
    if (isLiked.length != 0) {
      this.isLiked = false;
      this.likesLength = this.post.likes.length - 1;
      this.post.isPostLikedByCurrentUser = false;
    }
    else {
      this.isLiked = true;
      this.likesLength = this.post.likes.length + 1;
      this.post.isPostLikedByCurrentUser = true;
      if(post.createdBy != this.userId){
        var notificationContent = `liked your post(${post.title})`;
        this._notificationService.initializeNotificationViewModel(post.createdBy, NotificationType.Likes, notificationContent, this.userId, postId, postType, post, null).subscribe((_response) => {
        });
      }
    }

    this.likeUnlikePost.postId = postId;
    this.likeUnlikePost.isLike = isLike;
    this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
    this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
      this.post.likes = response;
      this.InitializeLikeUnlikePost();
    });


  }


  addPostView(postId: string) {
    debugger;
    if (this.userId != undefined) {
      this.postView.postId = postId;
      this._postService.postView(this.postView).subscribe((response) => {
        this.post.views.length = response;
      });
    }
  }

  sendToGroup() {
    debugger
    if(!this.messageToGroup || this.messageToGroup.trim().length == 0){
      return;
    }
    var comment: any[] = this.post.comments;
    this.InitializeCommentViewModel();
    this.commentViewModel.userId = this.sender.id;
    this.commentViewModel.userName = this.sender.firstName + " " + this.sender.lastName;
    this.commentViewModel.groupName = this.post.id + "_group";
    this.commentViewModel.content = this.messageToGroup;
    this.commentViewModel.userAvatar = this.sender.avatar;
    this.commentViewModel.isUserVerified = this.sender.isVarified;
    this.messageToGroup = "";
    this.commentViewModel.id = '00000000-0000-0000-0000-000000000000';
    this._chatService.addComments(this.commentViewModel).subscribe((response) => {
      debugger
      comment.push(response);
      this.post.commentsCount = comment.length;
      this.cd.detectChanges();
      this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
      this.commentViewModel.id = response.id;
      this._signalRService.sendToGroup(this.commentViewModel);
      if(this.post.parentId != this.userId){
        var translatedMessage = this.translateService.instant('commented your post');
      var notificationContent = translatedMessage;
      this._notificationService.initializeNotificationViewModel(this.post.parentId, NotificationType.CommentSent, notificationContent, this.userId, this.post.id, this.post.postType, null, null).subscribe((response) => {
        debugger;
      });
      }
      // initializeNotificationViewModel(userid:string,notificationType:NotificationType,notificationContent:string,loginUserId:string,postId?:string | null,postType?:number,post?:any,reelId?:string | null,chatType?:number,chatTypeId?:string| null):Observable<any>{
  
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

  likeUnlikeComments(commentId: string, _isLike: boolean, _isCommentLikedByCurrentUser: boolean, _likeCount: number) {
    debugger;
    var comment: any[] = this.post.comments;
    var isCommentLiked = comment.find(x => x.id == commentId);
    this.initializeCommentLikeUnlike();
    this.commentLikeUnlike.userId = this.sender.id;
    this.commentLikeUnlike.commentId = commentId;
    this.commentLikeUnlike.groupName = this.post.id + "_group";
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
        this._notificationService.initializeNotificationViewModel(isCommentLiked.user.id, NotificationType.CommentSent, notificationContent, this.sender.id, this.post.id, this.post.postType, null, null).subscribe((response) => {
      });
    }

    // }
    // this._signalRService.sendNotification();
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

  showCommentsDiv(isShowComments: boolean) {
    if (isShowComments) {
      this.isCommentsDisabled = false;
    }
    else {
      this.isCommentsDisabled = true;
    }

    this._postService.enableDisableComments(this.post.id, this.isCommentsDisabled).subscribe((_response) => {

    });
  }

  openSharePostModal(postId: string, postType: number, title: string, description: string): void {
    debugger
    if (this.posts?.accessibility == Constant.Private || this.posts?.serviceType == Constant.Paid) {
      sharePostResponse.next({});
    }
    else {
      var image: string = '';
      if (postType == 1) {
        var postAttachments = this.post.postAttachments.find((x: { fileType: number; }) => x.fileType == 1);
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
  }

  back(): void {
    window.history.back();
  }

  @HostListener('scroll', ['$event'])
  scrollHandler(event: any) {
    const element = event.target;
    if (element.scrollTop === 0) {
      if (!this.commentsScrolled && this.scrollCommentsResponseCount != 0) {
        this.commentsScrolled = true;
        this.commentsLoadingIcon = true;
        this.commentsPageNumber++;
        this.getNextComments();
      }
    }

  }

  getNextComments() {
    this._chatService.getComments(this.post.id, this.commentsPageNumber).subscribe((response) => {
      this.post.comments = response.concat(this.post.comments);
      this.cd.detectChanges();
      this.commentsLoadingIcon = false;
      this.scrollCommentsResponseCount = response.length;
      this.commentsScrolled = false;
      // Scroll to the bottom of the chat list with animation
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

  savePost(postId: string) {
    if (this.post.isPostSavedByCurrentUser) {
      this.post.savedPostsCount -= 1;
      this.post.isPostSavedByCurrentUser = false;
      savedPostResponse.next({ isPostSaved: false, postId: postId });
    }
    else {
      this.post.savedPostsCount += 1;
      this.post.isPostSavedByCurrentUser = true;
      savedPostResponse.next({ isPostSaved: true, postId: postId });
    }
    this._postService.savePost(postId, this.userId).subscribe((_result) => {
    });
  }

  getDeletedPostId(id: string) {
    // debugger
    // this.loadingIcon = true;
    // this._postService.deletePost(id).subscribe((_response) => {
    //   this.close();
    //   this.loadingIcon = false;
    //   deletePostResponse.next({ postId: id });

    // });

    const initialState={id:id}
    this.bsModalService.show(DeleteConfirmationComponent, { initialState });


  }


  openCertificateViewModal(certificateUrl: string, certificateName: string, from?: number, event?: Event) {
    if (from != undefined) {
      event?.stopPropagation();
    }
    const initialState = {
      certificateUrl: certificateUrl,
      certificateName: certificateName,
      from: from
    };
    this.bsModalService.show(CertificateViewComponent, { initialState });
  }

  hideCommentModal() {
    this.bsModalService.hide();
  }

  openPostModal(post: any) {
    debugger
    this.bsModalService.hide(this.bsModalService.config.id);
    this.cd.detectChanges();
    const initialState = {
      editPostId: post.id,
      from: post.postAuthorType == 1 ? "school" : post.postAuthorType == 2 ? "class" : post.postAuthorType == 3 ? "course" : post.postAuthorType == 4 ? "user" : undefined
    };
    setTimeout(() => {
      this.bsModalService.show(CreatePostComponent, { initialState });
    }, 500);
    //this.bsModalService.show(CreatePostComponent,{initialState});
  }


  from:any;
  postForComment: any;
  isUserBanned(){
    debugger;
    if(this.post?.postAuthorType ==2 || this.post?.postAuthorType ==3){
      if(this.post?.postAuthorType == 2){
        this.from= ClassCourseEnum.Class
      }
      if(this.post?.postAuthorType == 3){
        this.from= ClassCourseEnum.Course
      }
  
      this._studentService.isStudentBannedFromClassCourse(this.sender.id, this.from, this.postForComment.parentId).subscribe((response)=>{
        debugger;
        if(response == true){
          this.isBanned = true;
        } else{
          this.isBanned = false;
        }
      });
    }

  }

  @ViewChild('carouselForPostView') carouselForPostView!: ElementRef;
  addEventListnerOnCarousel() {
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach((carousel, index) => {
      const nextButton = carousel.querySelector('a.carousel-control-next');
      const prevButton = carousel.querySelector('a.carousel-control-prev');
      let carouselForPause:any = this.carouselForPostView;
      
      if (nextButton) {
        nextButton.addEventListener('click', () => {
          let indexForPause = carouselForPause.customActiveSlide
          let length = carouselForPause._slides.length
          if(indexForPause == 0){
            indexForPause = length - 1
          } else{
            indexForPause--;
          }
          this.pauseVideo(indexForPause);
        });
      }
      if (prevButton) {
        prevButton.addEventListener('click', () => {
          let indexForPause = carouselForPause.customActiveSlide
          let length = carouselForPause._slides.length
          if(indexForPause == (length-1)){
            indexForPause = 0
          } else{
            indexForPause++;
          }
          this.pauseVideo(indexForPause);
        });
      }
    });

    // if (this.carouselForPostView != undefined) {
    //   let carousel :any
    //   if ($('carousel')[1].querySelectorAll('a.carousel-control')[1]) {
    //     debugger;
    //     let isButton = $('carousel')[1].querySelectorAll('a.carousel-control-next')[0] as HTMLButtonElement;
    //     isButton.addEventListener('click', () => {
    //       carousel = this.carouselForPostView;
    //       let index = carousel.customActiveSlide 
    //       debugger;
    //       const initialVideoElement = document.getElementById(`video-${index}`);
    //       if(initialVideoElement){
    //         const firstElement = initialVideoElement.children[0];
    //         if (firstElement) {
    //           const videoElement = firstElement.children[0] as HTMLVideoElement;
    //           if (videoElement) {
    //             videoElement.pause();
    //           }
    //         }
    //       }
    //     })
    //   }


    //   if ($('carousel')[1].querySelectorAll('a.carousel-control')[1]) {
    //     let isButton = $('carousel')[1].querySelectorAll('a.carousel-control-prev')[0] as HTMLButtonElement;
    //     isButton.addEventListener('click', () => {
    //       carousel = this.carouselForPostView;
    //       let index = carousel.customActiveSlide 
    //       const initialVideoElement = document.getElementById(`video-${index}`);
    //       if(initialVideoElement){
    //         const firstElement = initialVideoElement.children[0];
    //         if (firstElement) {
    //           const videoElement = firstElement.children[0] as HTMLVideoElement;
    //           if (videoElement) {
    //             videoElement.pause();
    //           }
    //         }
    //       }
    //     })
    //   }
    // }
  }


  // deleteId:any;
  // getDeleteId(deleteId:any){
  //   this.deleteId = deleteId;
  //   debugger;
  // }

  pauseVideo(index:any){
    const initialVideoElement = document.getElementById(`video-${index}`);
    if(initialVideoElement){
      const firstElement = initialVideoElement.children[0];
      if (firstElement) {
        const videoElement = firstElement.children[0] as HTMLVideoElement;
        if (videoElement) {
          videoElement.pause();
        }
      }
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
    //   let indexOfComment = this.post.comments.findIndex((x:any) => x.id == this.commentLikeUnlike.commentId)
    //   this.post.comments.splice(indexOfComment, 1)
    // }
    const initialState = { item : item, from : "deleteComment" };
    this.bsModalService.show(DeleteConfirmationComponent, { initialState });
    // if(!this.deleteCommentResponseSubscription){
    //   deleteCommentResponse.subscribe(response =>{
    //     debugger;
    //     setTimeout(() => {
    //       let indexOfComment = this.post.comments.findIndex((x:any) => x.id == this.commentLikeUnlike.commentId)
    //       this.post.comments.splice(indexOfComment, 1)
    //     }, 0);
    //   })
    // }

  }

  navigateToUrl(url:string){
    window.location.href = url;
  }




}
