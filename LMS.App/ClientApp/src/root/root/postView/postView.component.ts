import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
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
import { commentLikeResponse, commentResponse, SignalrService } from 'src/root/service/signalr.service';
import { UserService } from 'src/root/service/user.service';
import { SharePostComponent } from '../sharePost/sharePost.component';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { MessageService } from 'primeng/api';

export const sharePostResponse =new Subject<{}>();  
export const savedPostResponse =new Subject<{isPostSaved:boolean,postId:string}>();  


@Component({
    selector: 'post-view',
    templateUrl: './postView.component.html',
    styleUrls: ['./postView.component.css'],
    providers: [MessageService]
  })

export class PostViewComponent implements OnInit,AfterViewInit {
    posts:any;    
    @ViewChild('createPostModal', { static: true }) createPostModal!: ModalDirective;
    @ViewChild('groupChatList') groupChatList!: ElementRef;
    @ViewChild('videoPlayer') videoPlayer!: ElementRef;
    private _signalRService;
    private _userService;
    private _chatService;
    private _notificationService;
    showCommentsField:boolean = true;
    messageToGroup!:string;
    private _postService;
    likeUnlikePost!: LikeUnlikePost;
    postView!:PostView;
    currentLikedPostId!:string;
    likesLength!:number;
    isLiked!:boolean;
    userId!:string;
    pageNumber:number = 1;
    isDataLoaded:boolean = false;
    sender:any;
    commentViewModel!: CommentViewModel;
    commentLikeUnlike!:CommentLikeUnlike;
    isCommentsDisabled!:boolean;
    postId!:string;
    postPageView:boolean = false;
    post!:any;
    commentsScrolled:boolean = false;
    scrollCommentsResponseCount:number = 1;
    commentsLoadingIcon: boolean = false;
    commentsPageNumber:number = 1;
    isPlayerLoad:boolean = false;

    constructor(private bsModalService: BsModalService,public messageService:MessageService,notificationService:NotificationService,chatService: ChatService,public signalRService: SignalrService,public postService:PostService, public options: ModalOptions,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute,userService:UserService,private cd: ChangeDetectorRef) { 
         this._postService = postService;
         this._signalRService = signalRService;
         this._userService = userService;
         this._chatService = chatService;
         this._notificationService = notificationService;
    }
  
    ngOnInit(): void {
      var id = this.activatedRoute.snapshot.paramMap.get('id');
      if(id != null){
        this.postId = id;
        this.postPageView = true;
      }

      else{
      this.posts = this.options.initialState;
      this.post = this.posts.posts;
      this.postId = this.post.id;
      this.getComments();
      }

      this._postService.getPostById(this.postId).subscribe((response) => {
        if(id != null){
          this.post = response;
          this.getComments();
        }
        this.isCommentsDisabled = response.isCommentsDisabled
        this.createGroupName();
        this.commentResponse();
        this.commentLikeResponse();
        if(this.post.postId != null){
          this.addPostView(this.post.postId);
        }
        else{
        this.addPostView(this.post.id);
        }
        this.isDataLoaded = true;
        this.cd.detectChanges();
        

        var modal = document.getElementById('modal-post');
        window.onclick = (event) => {
         if (event.target == modal) {
          if (modal != null) {
           this.bsModalService.hide();
          }
        } 
       }

        const player = videojs(this.videoPlayer.nativeElement, {autoplay: false,});
        this.isPlayerLoad = true;
        this.cd.detectChanges();
        });

        this.InitializeLikeUnlikePost();
        this.getSenderInfo();
        this.cd.detectChanges();

        this.savePreferences(this.post.title,this.post.description,this.post.postTags);
    }

    ngAfterViewInit() {        
      setTimeout(() => this.scrollToBottom());
    } 

    savePreferences(title:string,description:string,postTags:any){
      var tagString = '';
      postTags.forEach(function (item:any) {
        tagString = tagString + item.postTagValue
      }); 

      var preferenceString = (title??'') + ' ' + (description??'') + ' ' + tagString??'';
      this._userService.saveUserPreference(preferenceString).subscribe((response) => {
      });
    }

  scrollToBottom(): void {
      try {
          this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
      } catch(err) { }                 
  }

    commentResponse(){
      commentResponse.subscribe(response => {
        var comment: any[] = this.post.comments;
        var commentObj = {id:response.id,content:response.message,likeCount:0,isCommentLikedByCurrentUser:false,userAvatar:response.senderAvatar};
        comment.push(commentObj);
        this.cd.detectChanges();
        this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
      });
    }

    commentLikeResponse(){
      commentLikeResponse.subscribe(response => {
        var comments: any[] = this.post.comments;
        var reqComment = comments.find(x => x.id == response.commentId);
        if(response.isLike){
          reqComment.likeCount = reqComment.likeCount + 1;
        }
        else{
          reqComment.likeCount = reqComment.likeCount - 1;
        }
      });
    }

    getComments(){
      this._chatService.getComments(this.post.id,this.pageNumber).subscribe((response) => {
        this.post.comments = response;
        });
    }

    getSenderInfo(){
      var validToken = localStorage.getItem("jwt");
      if (validToken != null) {
      let jwtData = validToken.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.userId = decodedJwtData.jti;

    this._userService.getUser(this.userId).subscribe((response) => {
      this.sender = response;
    });
     }
    }

    createGroupName(){
      this._signalRService.createGroupName(this.post.id);
      this.postView ={
       postId:'',
       userId:''
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

    show() {
      this.createPostModal.show();
     }

     close(): void {
      this.bsModalService.hide();
    }
  
    showComments(){
      
      if(this.showCommentsField){
          this.showCommentsField = false;
      }
      else{
          this.showCommentsField = true;
      }
  }

  likeUnlikePosts(postId:string, isLike:boolean,postType:number,post:any){
    this.currentLikedPostId = postId;
      var likes: any[] = this.post.likes;
      var isLiked = likes.filter(x => x.userId == this.userId && x.postId == postId);
    if(isLiked.length != 0){
      this.isLiked = false;
      this.likesLength = this.post.likes.length - 1;
      this.post.isPostLikedByCurrentUser = false;
    }
    else{
      this.isLiked = true;
      this.likesLength = this.post.likes.length + 1;
      this.post.isPostLikedByCurrentUser = true;
      var notificationContent = `liked your post(${post.title})`;
      this._notificationService.initializeNotificationViewModel(post.createdBy,NotificationType.Likes,notificationContent,this.userId,postId,postType,post,null).subscribe((response) => { 
      });
    }

    this.likeUnlikePost.postId = postId;
    this.likeUnlikePost.isLike = isLike;
    this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
    this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
      this.post.likes = response;
       this.InitializeLikeUnlikePost();
       console.log("succes");
    });
  
  
  }

  
  addPostView(postId:string){
    
    if(this.userId != undefined){
    this.postView.postId = postId;
    this._postService.postView(this.postView).subscribe((response) => {
      
      console.log('success');
      this.post.views.length = response;
     }); 
    }
  }

  sendToGroup(){
    var comment: any[] = this.post.comments;
    this.InitializeCommentViewModel();
    this.commentViewModel.userId = this.sender.id;
    this.commentViewModel.groupName = this.post.id + "_group";
    this.commentViewModel.content = this.messageToGroup;
    this.commentViewModel.userAvatar = this.sender.avatar;
    this.messageToGroup = "";
    this.commentViewModel.id = '00000000-0000-0000-0000-000000000000';
    this._chatService.addComments(this.commentViewModel).subscribe((response) => {
      comment.push(response);
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

    likeUnlikeComments(commentId:string, isLike:boolean,isCommentLikedByCurrentUser:boolean,likeCount:number){
      var comment: any[] = this.post.comments;
      var isCommentLiked = comment.find(x => x.id == commentId);
      this.initializeCommentLikeUnlike();
      this.commentLikeUnlike.userId = this.sender.id;
      this.commentLikeUnlike.commentId = commentId;
      this.commentLikeUnlike.groupName = this.post.id + "_group";
     if(isCommentLiked.isCommentLikedByCurrentUser){
      isCommentLiked.isCommentLikedByCurrentUser = false;
      isCommentLiked.likeCount = isCommentLiked.likeCount - 1;
      this.commentLikeUnlike.isLike = false;
      this.commentLikeUnlike.likeCount = isCommentLiked.likeCount;
     }
     else{
      isCommentLiked.isCommentLikedByCurrentUser = true;
      isCommentLiked.likeCount = isCommentLiked.likeCount + 1;

      this.commentLikeUnlike.isLike = true;
      this.commentLikeUnlike.likeCount = isCommentLiked.likeCount;
     }
     this.signalRService.notifyCommentLike(this.commentLikeUnlike);
    }

    initializeCommentLikeUnlike(){
      this.commentLikeUnlike = {
        commentId:"",
        userId:"",
        likeCount:0,
        isLike:false,
        groupName:""
      }

    }

    showCommentsDiv(isShowComments:boolean){
      if(isShowComments){
        this.isCommentsDisabled = false;
      }
      else{
        this.isCommentsDisabled = true;
      }

      this._postService.enableDisableComments(this.post.id,this.isCommentsDisabled).subscribe((response) => {
        
       }); 
    }

    openSharePostModal(postId:string, postType:number): void {
      if(this.posts?.name == Constant.Private || this.posts?.serviceType == Constant.Paid){
        sharePostResponse.next({}); 
      }
      else{
      const initialState = {
        postId: postId,
        postType: postType
      };
      this.bsModalService.show(SharePostComponent,{initialState});
    }
  }

    back(): void {
      window.history.back();
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
    this._chatService.getComments(this.post.id,this.commentsPageNumber).subscribe((response) => {
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

  savePost(postId:string){
    if(this.post.isPostSavedByCurrentUser){
      this.post.savedPostsCount -= 1;
      this.post.isPostSavedByCurrentUser = false;
      savedPostResponse.next({isPostSaved:false,postId:postId}); 
     }
     else{
      this.post.savedPostsCount += 1;
      this.post.isPostSavedByCurrentUser = true;
      savedPostResponse.next({isPostSaved:true,postId:postId}); 
     }
     this._postService.savePost(postId,this.userId).subscribe((result) => {
    });
  }

}
