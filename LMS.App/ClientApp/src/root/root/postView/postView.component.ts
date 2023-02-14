import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { CommentViewModel } from 'src/root/interfaces/chat/commentViewModel';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { ChatService } from 'src/root/service/chatService';
import { PostService } from 'src/root/service/post.service';
import { SchoolService } from 'src/root/service/school.service';
import { commentResponse, SignalrService } from 'src/root/service/signalr.service';
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

    constructor(private bsModalService: BsModalService,chatService: ChatService,public signalRService: SignalrService,public postService:PostService, public options: ModalOptions,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute,userService:UserService) { 
         this._postService = postService;
         this._signalRService = signalRService;
         this._userService = userService;
         this._chatService = chatService;
    }
  
    ngOnInit(): void {
      //this.getLoginUserId();
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

      // here we count ++ for view
      if(this.posts.posts.postId != null){
        this.addPostView(this.posts.posts.postId);
      }
      else{
      this.addPostView(this.posts.posts.id);
      }
    //   this.postView.postId = this.posts.posts.id;
    //   this._postService.postView(this.postView).subscribe((response) => {
    //  });

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
      var commentObj = {content:response.message,likeCount:0,isCommentLikedByCurrentUser:false,userAvatar:response.senderAvatar};
      comment.push(commentObj);
    });


    }

    // getLoginUserId(){
    //   var validToken = localStorage.getItem("jwt");
    //   if (validToken != null) {
    //     let jwtData = validToken.split('.')[1]
    //     let decodedJwtJsonData = window.atob(jwtData)
    //     let decodedJwtData = JSON.parse(decodedJwtJsonData);
    //     this.userId = decodedJwtData.jti;
    //   }
    // }

    InitializeLikeUnlikePost(){
      this.likeUnlikePost = {
        postId: '',
        userId: '',
        isLike:false,
        commentId:''
       };

    }

    show() {
      //this.bsModalService.show(this.templatefirst);
      this.createPostModal.show();
     }

     close(): void {
      this.bsModalService.hide();
      //this.addAttachmentModal.nativeElement.click();
    }
  
    showComments(){
      
      if(this.showCommentsField){
          this.showCommentsField = false;
      }
      else{
          this.showCommentsField = true;
      }
  }

  // here from like post
  // likeUnlikePosts(postId:string,isLike:boolean){
  //   this.likeUnlikePost.postId = postId;
  //   this.likeUnlikePost.isLike = isLike;
  //   this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
  //   this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
  //      console.log("succes");
  //   });


  // }

  likeUnlikePosts(postId:string, isLike:boolean){
    this.currentLikedPostId = postId;
    // this.user.posts.filter((p : any) => p.id == postId).forEach( (item : any) => {
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
      // this.user.posts.filter((p : any) => p.id == postId).forEach( (item : any) => {
      //  var itemss = item.likes;
      //  item.likes = response;
     }); 
    }
  
  }

  sendToGroup(){
    var comment: any[] = this.posts.posts.comments;
    var commentObj = {content:this.messageToGroup,likeCount:0,isCommentLikedByCurrentUser:false,userAvatar:this.sender.avatar};
    comment.push(commentObj);

    this.InitializeCommentViewModel();
    this.commentViewModel.userId = this.sender.id;
    this.commentViewModel.groupName = this.posts.posts.id + "_group";
    this.commentViewModel.content = this.messageToGroup;
    this.commentViewModel.userAvatar = this.sender.avatar;
    var response ={receiver:this.sender.firstName,message:this.messageToGroup,isTest:false};
    //this.generateChatDiv(response,this.sender.avatar);
    this._signalRService.sendToGroup(this.commentViewModel);


    
    
    }

    InitializeCommentViewModel(){
      this.commentViewModel = {
        userId: '',
        content:'',
        groupName:'',
        userAvatar:''
       };

    }

    likeUnlikeComments(commentId:string, isLike:boolean,isCommentLikedByCurrentUser:boolean,likeCount:number){
      var comment: any[] = this.posts.posts.comments;
      var isCommentLiked = comment.find(x => x.id == commentId);
     if(isCommentLiked.isCommentLikedByCurrentUser){
      isCommentLiked.isCommentLikedByCurrentUser = false;
      isCommentLiked.likeCount = isCommentLiked.likeCount - 1;
      this.signalRService.notifyCommentLike(commentId,isCommentLiked.likeCount,false,this.posts.posts.id + "_group");
     }
     else{
      isCommentLiked.isCommentLikedByCurrentUser = true;
      isCommentLiked.likeCount = isCommentLiked.likeCount + 1;
      this.signalRService.notifyCommentLike(commentId,isCommentLiked.likeCount,true,this.posts.posts.id + "group");
     }

     if(commentId!= undefined){
        this._postService.likeUnlikeComments(commentId,isLike).subscribe((response) => {
      });
    }
  }
}
