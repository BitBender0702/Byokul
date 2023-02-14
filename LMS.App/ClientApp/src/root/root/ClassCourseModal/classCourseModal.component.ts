import { Component, ElementRef, Injector, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { CommentViewModel } from 'src/root/interfaces/chat/commentViewModel';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { LikeUnlikeClassCourse } from 'src/root/interfaces/school/likeUnlikeClassCourse';
import { ChatService } from 'src/root/service/chatService';
import { PostService } from 'src/root/service/post.service';
import { ReelsService } from 'src/root/service/reels.service';
import { SchoolService } from 'src/root/service/school.service';
import { commentResponse, signalRResponse, SignalrService } from 'src/root/service/signalr.service';
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

    @ViewChild('groupChatList') groupChatList!: ElementRef;

    constructor(private bsModalService: BsModalService,chatService:ChatService,schoolService: SchoolService,public options: ModalOptions,private userService: UserService,postService: PostService,public signalRService: SignalrService,private route: ActivatedRoute,reelsService: ReelsService,private activatedRoute: ActivatedRoute) { 
        //   this._reelsService = reelsService;
        //   this._signalRService = signalRService;
        //   this._userService = userService;
        //   this._postService = postService;
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
          var commentObj = {content:response.message,likeCount:0,isCommentLikedByCurrentUser:false,userAvatar:response.senderAvatar};
          comment.push(commentObj);
        });
      }

    //     this._reelsService.getReelById(this.postAttachmentId.postAttachmentId).subscribe((response) => {
    //         this.reels = response;
    //         this.addPostView(this.reels.post.id);
    //         this.isDataLoaded = true;

    //         this._signalRService.createGroupName(this.reels.id);
    //         // this.loadingIcon = false;
    //       });

    //       var validToken = localStorage.getItem("jwt");
    //       if (validToken != null) {
    //       let jwtData = validToken.split('.')[1]
    //       let decodedJwtJsonData = window.atob(jwtData)
    //       let decodedJwtData = JSON.parse(decodedJwtJsonData);
    //       this.senderId = decodedJwtData.jti;

    //     this._userService.getUser(this.senderId).subscribe((response) => {
    //       this.sender = response;
    //     });

             
    //   }

    //       this.InitializeLikeUnlikePost();
    //       this.InitializePostView();

    //       commentResponse.subscribe(response => {
    //         debugger
    //         var comment: any[] = this.reels.post.comments;
    //         var commentObj = {content:response.message,likeCount:0,isCommentLikedByCurrentUser:false,userAvatar:response.senderAvatar};
    //         comment.push(commentObj);

    //         // var result ={receiver:this.sender.firstName,message:response.message,isTest:false};
    //         // this.generateChatDiv(result,response.senderAvatar);
    //       });



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

    // InitializeCommentViewModel(){
    //   this.commentViewModel = {
    //     userId: '',
    //     content:'',
    //     groupName:'',
    //     userAvatar:''
    //    };

    // }



    // showComments(){
    //     if(this.showCommentsField){
    //         this.showCommentsField = false;
    //     }
    //     else{
    //         this.showCommentsField = true;
    //     }
    // }

    // InitializeLikeUnlikePost(){
    //   this.likeUnlikePost = {
    //     postId: '',
    //     userId: '',
    //     isLike:false,
    //     commentId:''
    //    };

    // }

    // InitializePostView(){
    //   this.postView = {
    //     postId: '',
    //     userId: ''
    //    };

    // }

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
  }

  sendToGroup(){
    var comment: any[] = this.classCourseDetails.classCourseItem.comments;
    var commentObj = {content:this.messageToGroup,likeCount:0,isCommentLikedByCurrentUser:false,userAvatar:this.sender.avatar};
    comment.push(commentObj);

    this.InitializeCommentViewModel();
    this.commentViewModel.userId = this.sender.id;
    this.commentViewModel.groupName = this.classCourseDetails.classCourseItem.id + "_group";
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


  }
