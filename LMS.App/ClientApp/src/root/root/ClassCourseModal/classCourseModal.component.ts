import { Component, ElementRef, Injector, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
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
import { SharePostComponent } from '../sharePost/sharePost.component';
import { ClassCourseFilterTypeEnum } from 'src/root/Enums/classCourseFilterTypeEnum';
import { ClassService } from 'src/root/service/class.service';
import { CourseService } from 'src/root/service/course.service';
import { FormGroup } from '@angular/forms';
export const savedClassCourseResponse =new Subject<{isSaved:boolean,id:string,type:string}>();  


@Component({
    selector: 'classCourseModal-view',
    templateUrl: 'classCourseModal.component.html',
    styleUrls: ['classCourseModal.component.css'],
  })
  
  export class ClassCourseModalComponent implements OnInit, OnDestroy {

    classCourseItem:any;
    classCourseDetails:any;
    currentLikedClassCourseId!: string;
    isClassCourseLiked!: boolean;
    likesClassCourseLength!: number;
    likeUnlikeClassCourses!: LikeUnlikeClassCourse;
    private _schoolService;
    private _signalRService;
    private _userService;
    private _classService;
    private _courseService;


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
    gender!:string;
    commentLikeUnlike!:CommentLikeUnlike;
    commentResponseSubscription!:Subscription;

    courseCertificateForm!:FormGroup;
    courseCertificateInfo:any;
    @ViewChild('openCourseOwnCertificate') openCourseOwnCertificate!: ElementRef;

    @ViewChild('groupChatList') groupChatList!: ElementRef;

    constructor(private bsModalService: BsModalService,classService:ClassService,courseService:CourseService,chatService:ChatService,schoolService: SchoolService,public options: ModalOptions,private userService: UserService,postService: PostService,public signalRService: SignalrService,private route: ActivatedRoute,reelsService: ReelsService,private activatedRoute: ActivatedRoute) { 
        this._schoolService = schoolService;
        this._chatService = chatService;
        this._signalRService = signalRService;
        this._userService = userService;
        this._classService = classService;
        this._courseService = courseService;
  
      }

     ngOnInit(): void {
      debugger
         this.getLoginUserId();
         this.gender = localStorage.getItem("gender")??'';
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

        if(!this.commentResponseSubscription){
        this.commentResponseSubscription = commentResponse.subscribe(response => {
          var comment: any[] =this.classCourseDetails.classCourseItem.comments;
          var commentObj = {id:response.id,content:response.message,likeCount:0,isCommentLikedByCurrentUser:false,userAvatar:response.senderAvatar};
          comment.push(commentObj);
        });
      }

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

    ngOnDestroy(): void {
      if(this.commentResponseSubscription){
        this.commentResponseSubscription.unsubscribe();
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

  saveClassCourse(id:string,type:number){
    if(type == 1){
      var typeString = "Class";
    }
    else{
      var typeString = "Course";
    }
    if(this.classCourseDetails.classCourseItem.isClassCourseSavedByCurrentUser){
      this.classCourseDetails.classCourseItem.savedClassCourseCount -= 1;
      this.classCourseDetails.classCourseItem.isClassCourseSavedByCurrentUser = false;
      savedClassCourseResponse.next({isSaved:false,id:id,type:typeString}); 
     }
     else{
      this.classCourseDetails.classCourseItem.savedClassCourseCount += 1;
      this.classCourseDetails.classCourseItem.isClassCourseSavedByCurrentUser = true;
      savedClassCourseResponse.next({isSaved:true,id:id,type:typeString}); 
     }
    this._schoolService.saveClassCourse(this.classCourseDetails.classCourseItem,this.userId,type).subscribe((result) => {
    });
  }

  hideModal(){
    this.bsModalService.hide();
  }

  openShareClassCourseModal(schoolName:string,name:string,type:number){
    var initialState:any;
    if(type == 1){
        initialState = {
        className: name,
        schoolName: schoolName
      };
    }
    else{
        initialState = {
        courseName: name,
        schoolName: schoolName
      };
    }
    this.bsModalService.show(SharePostComponent,{initialState});
  }


  showCommentsDiv(id:string,type:number,isShowComments:boolean){
    debugger
    if(isShowComments){
      this.classCourseDetails.classCourseItem.isCommentsDisabled = false;
    }
    else{
      this.classCourseDetails.classCourseItem.isCommentsDisabled = true;
    }

    if(type == ClassCourseFilterTypeEnum.Class){
      this._classService.enableDisableComments(id,this.classCourseDetails.classCourseItem.isCommentsDisabled).subscribe((_response:any) => {
      }); 
    }
    else{
      this._courseService.enableDisableComments(id,this.classCourseDetails.classCourseItem.isCommentsDisabled).subscribe((_response:any) => {
      }); 
    }
  }

  hideCommentModal(){
    this.bsModalService.hide();
  }
}
