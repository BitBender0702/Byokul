import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { CommentLikeUnlike } from 'src/root/interfaces/chat/commentsLike';
import { CommentViewModel } from 'src/root/interfaces/chat/commentViewModel';
import { NotificationType } from 'src/root/interfaces/notification/notificationViewModel';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { ChatService } from 'src/root/service/chatService';
import { NotificationService } from 'src/root/service/notification.service';
import { PostService } from 'src/root/service/post.service';
import { SchoolService } from 'src/root/service/school.service';
import { commentLikeResponse, commentResponse, SignalrService } from 'src/root/service/signalr.service';
import { UserService } from 'src/root/service/user.service';

@Component({
    selector: 'post-view',
    templateUrl: './postView.component.html',
    styleUrls: ['./postView.component.css']
  })

export class PostViewComponent implements OnInit {

    posts:any;
    @ViewChild('createPostModal', { static: true }) createPostModal!: ModalDirective;

    //
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

    constructor(private bsModalService: BsModalService,notificationService:NotificationService,chatService: ChatService,public signalRService: SignalrService,public postService:PostService, public options: ModalOptions,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute,userService:UserService) { 
         this._postService = postService;
         this._signalRService = signalRService;
         this._userService = userService;
         this._chatService = chatService;
         this._notificationService = notificationService;
    }
  
    ngOnInit(): void {
      this.posts = this.options.initialState;
      this._chatService.getComments(this.posts.posts.id,this.pageNumber).subscribe((response) => {
        this.isDataLoaded = true;
        this.posts.posts.comments = response;
        });

      this._signalRService.createGroupName(this.posts.posts.id);
       this.postView ={
        postId:'',
        userId:''
       }

      if(this.posts.posts.postId != null){
        this.addPostView(this.posts.posts.postId);
      }
      else{
      this.addPostView(this.posts.posts.id);
      }

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

     this.InitializeLikeUnlikePost();

     commentResponse.subscribe(response => {
      var comment: any[] = this.posts.posts.comments;
      var commentObj = {id:response.id,content:response.message,likeCount:0,isCommentLikedByCurrentUser:false,userAvatar:response.senderAvatar};
      comment.push(commentObj);
    });

    commentLikeResponse.subscribe(response => {
      var comments: any[] = this.posts.posts.comments;
      var reqComment = comments.find(x => x.id == response.commentId);
      if(response.isLike){
        reqComment.likeCount = reqComment.likeCount + 1;
      }
      else{
        reqComment.likeCount = reqComment.likeCount - 1;
      }
      

    });


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
      var likes: any[] = this.posts.posts.likes;
      var isLiked = likes.filter(x => x.userId == this.userId && x.postId == postId);
    if(isLiked.length != 0){
      this.isLiked = false;
      this.likesLength = this.posts.posts.likes.length - 1;
      this.posts.posts.isPostLikedByCurrentUser = false;
    }
    else{
      this.isLiked = true;
      this.likesLength = this.posts.posts.likes.length + 1;
      this.posts.posts.isPostLikedByCurrentUser = true;

      var notificationContent = `liked your post(${post.title})`;
      //this.initializeNotificationViewModel(this.user.id,notificationType,notificationContent);

      this._notificationService.initializeNotificationViewModel(post.createdBy,NotificationType.Likes,notificationContent,this.userId,postId,postType,post,null).subscribe((response) => {
          
      });
  
    }

    
   
    this.likeUnlikePost.postId = postId;
    this.likeUnlikePost.isLike = isLike;
    this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
    this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
      this.posts.posts.likes = response;
       this.InitializeLikeUnlikePost();
       console.log("succes");
    });
  
  
  }

  
  addPostView(postId:string){
    
    if(this.userId != undefined){
    this.postView.postId = postId;
    this._postService.postView(this.postView).subscribe((response) => {
      
      console.log('success');
      this.posts.posts.views.length = response;
     }); 
    }
  
  }

  sendToGroup(){
    var comment: any[] = this.posts.posts.comments;
    this.InitializeCommentViewModel();
    this.commentViewModel.userId = this.sender.id;
    this.commentViewModel.groupName = this.posts.posts.id + "_group";
    this.commentViewModel.content = this.messageToGroup;
    this.commentViewModel.userAvatar = this.sender.avatar;
    this.messageToGroup = "";
    this.commentViewModel.id = '00000000-0000-0000-0000-000000000000';
    this._chatService.addComments(this.commentViewModel).subscribe((response) => {
      comment.push(response);
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
        userAvatar:''
       };
    }

    likeUnlikeComments(commentId:string, isLike:boolean,isCommentLikedByCurrentUser:boolean,likeCount:number){
      var comment: any[] = this.posts.posts.comments;
      var isCommentLiked = comment.find(x => x.id == commentId);
      this.initializeCommentLikeUnlike();
      this.commentLikeUnlike.userId = this.sender.id;
      this.commentLikeUnlike.commentId = commentId;
      this.commentLikeUnlike.groupName = this.posts.posts.id + "_group";
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

}
