import { Component, ElementRef, Injector, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { CommentLikeUnlike } from 'src/root/interfaces/chat/commentsLike';
import { CommentViewModel } from 'src/root/interfaces/chat/commentViewModel';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { LikeUnlikeClassCourse } from 'src/root/interfaces/school/likeUnlikeClassCourse';
import { ChatService } from 'src/root/service/chatService';
import { PostService } from 'src/root/service/post.service';
import { ReelsService } from 'src/root/service/reels.service';
import { SchoolService } from 'src/root/service/school.service';
import { commentLikeResponse, commentResponse, signalRResponse, SignalrService } from 'src/root/service/signalr.service';
import { UserService } from 'src/root/service/user.service';

@Component({
    selector: 'classCourseModal-view',
    templateUrl: 'classCourseModal.component.html',
    styleUrls: ['classCourseModal.component.css'],
  })
  
  export class ClassCourseModalComponent implements OnInit {

    classCourseItem:any;
    classCourseDetails:any;
    currentLikedClassCourseId!: string;
    isClassCourseLiked!: boolean;
    likesClassCourseLength!: number;
    likeUnlikeClassCourses!: LikeUnlikeClassCourse;
    private _schoolService;
    private _signalRService;
    private _userService;

    reels:any;
    isOpenSidebar:boolean = false;
    isDataLoaded:boolean = false;
    showCommentsField:boolean = true;
    senderId!:string;
    sender:any;
    messageToGroup!:string;
    userId!:string;
    user:any;
    // private _signalRService;
    // private _userService;
    currentLikedPostId!:string;
    likesLength!:number;
    isLiked!:boolean;
    likeUnlikePost!: LikeUnlikePost;
    postView!:PostView;
    loginUserId!:string;

    postAttachmentId:any;
    commentViewModel!: CommentViewModel;
    commentLikeCount!:number;
    private _chatService;
    pageNumber:number = 1;
    commentLikeUnlike!:CommentLikeUnlike;

    @ViewChild('groupChatList') groupChatList!: ElementRef;

    constructor(private bsModalService: BsModalService,chatService:ChatService,schoolService: SchoolService,public options: ModalOptions,private userService: UserService,postService: PostService,public signalRService: SignalrService,private route: ActivatedRoute,reelsService: ReelsService,private activatedRoute: ActivatedRoute) { 
        this._schoolService = schoolService;
        this._chatService = chatService;
        this._signalRService = signalRService;
        this._userService = userService;
  
      }

     ngOnInit(): void {
         this.getLoginUserId();
         this.classCourseDetails = this.options.initialState;
         this._chatService.getComments(this.classCourseDetails.classCourseItem.id,this.pageNumber).subscribe((response) => {
          this.isDataLoaded = true;
          this.classCourseDetails.classCourseItem.comments = response;
          });

          this._signalRService.createGroupName(this.classCourseDetails.classCourseItem.id);

          var validToken = localStorage.getItem("jwt");
          if (validToken != null) {
          let jwtData = validToken.split('.')[1]
          let decodedJwtJsonData = window.atob(jwtData)
          let decodedJwtData = JSON.parse(decodedJwtJsonData);
          this.userId = decodedJwtData.jti;

        this._userService.getUser(this.userId).subscribe((response) => {
          this.sender = response;
        });

        commentResponse.subscribe(response => {
          var comment: any[] =this.classCourseDetails.classCourseItem.comments;
          var commentObj = {id:response.id,content:response.message,likeCount:0,isCommentLikedByCurrentUser:false,userAvatar:response.senderAvatar};
          comment.push(commentObj);
        });

        commentLikeResponse.subscribe(response => {
          var comments: any[] = this.classCourseDetails.classCourseItem.comments;
          var reqComment = comments.find(x => x.id == response.commentId);
          if(response.isLike){
            reqComment.likeCount = reqComment.likeCount + 1;
          }
          else{
            reqComment.likeCount = reqComment.likeCount - 1;
          }
          

        });
        
      }
     }

    getLoginUserId(){
      var validToken = localStorage.getItem("jwt");
      if (validToken != null) {
        let jwtData = validToken.split('.')[1]
        let decodedJwtJsonData = window.atob(jwtData)
        let decodedJwtData = JSON.parse(decodedJwtJsonData);
        this.userId = decodedJwtData.jti;
      }
    }


    back(): void {
        window.history.back();
      }

      close(): void {
        this.bsModalService.hide();
      }

      
  likeUnlikeClassCourse(Id: string, isLike: boolean, type: number) {
    this.currentLikedClassCourseId = Id;

        if (this.classCourseDetails.classCourseItem.type == 1) {
          var likes: any[] = this.classCourseDetails.classCourseItem.classLikes;
          var isLiked = likes.filter((x) => x.userId == this.userId && x.classId == Id);
        } 
        else {
          var likes: any[] = this.classCourseDetails.classCourseItem.courseLikes;
          var isLiked = likes.filter((x) => x.userId == this.userId && x.courseId == Id);
        }

        if (isLiked.length != 0) {
          this.isClassCourseLiked = false;
          if (this.classCourseDetails.classCourseItem.type == 1) {
            this.likesClassCourseLength = this.classCourseDetails.classCourseItem.classLikes.length - 1;
          } else {
            this.likesClassCourseLength = this.classCourseDetails.classCourseItem.courseLikes.length - 1;
          }
          this.classCourseDetails.classCourseItem.isLikedByCurrentUser = false;
        } else {
          this.isClassCourseLiked = true;
          if (this.classCourseDetails.classCourseItem.type == 1) {
            this.likesClassCourseLength = this.classCourseDetails.classCourseItem.classLikes.length + 1;
          } else {
            this.likesClassCourseLength = this.classCourseDetails.classCourseItem.courseLikes.length + 1;
          }

          this.classCourseDetails.classCourseItem.isLikedByCurrentUser = true;
        }

    this.InitializeLikeUnlikeClassCourse();
    this.likeUnlikeClassCourses.Id = Id;
    this.likeUnlikeClassCourses.isLike = isLike;
    this.likeUnlikeClassCourses.type = type;

    this._schoolService
      .likeUnlikeClassCourse(this.likeUnlikeClassCourses)
      .subscribe((response) => {
        if (type == 1) {
          this.classCourseDetails.classCourseItem.classLikes = response;
        } else {
          this.classCourseDetails.classCourseItem.courseLikes = response;
        }

        this.InitializeLikeUnlikeClassCourse();
      });
  }

  InitializeLikeUnlikeClassCourse() {
    this.likeUnlikeClassCourses = {
      isLike: false,
      userId: '',
      Id: '',
      type: 0,
    };
  }

  likeUnlikeComments(commentId:string, isLike:boolean,isCommentLikedByCurrentUser:boolean,likeCount:number){
    var comment: any[] = this.classCourseDetails.classCourseItem.comments;
    var isCommentLiked = comment.find(x => x.id == commentId);
    this.initializeCommentLikeUnlike();
    this.commentLikeUnlike.userId = this.sender.id;
    this.commentLikeUnlike.commentId = commentId;
    this.commentLikeUnlike.groupName = this.classCourseDetails.classCourseItem.id + "_group";
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

  sendToGroup(){
    var comment: any[] = this.classCourseDetails.classCourseItem.comments;
    this.InitializeCommentViewModel();
    this.commentViewModel.userId = this.sender.id;
    this.commentViewModel.groupName = this.classCourseDetails.classCourseItem.id + "_group";
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
      userAvatar:'',
      createdOn:new Date(),
      userName:''
     };
  }
}
