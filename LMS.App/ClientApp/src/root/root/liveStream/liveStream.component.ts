import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { UserService } from 'src/root/service/user.service';
import { MultilingualComponent } from '../sharedModule/Multilingual/multilingual.component';
import { NotificationType, NotificationViewModel } from 'src/root/interfaces/notification/notificationViewModel';
import { Constant } from 'src/root/interfaces/constant';
import { SignalrService, commentLikeResponse, commentResponse, endMeetingResponse, liveUsersCountResponse, postLikeResponse, postViewResponse, saveStreamResponse, shareStreamResponse } from 'src/root/service/signalr.service';
import { ActivatedRoute } from '@angular/router';
import { PostService } from 'src/root/service/post.service';
import { ChatService } from 'src/root/service/chatService';
import { CommentViewModel } from 'src/root/interfaces/chat/commentViewModel';
import { constants } from 'buffer';
import { PostView } from 'src/root/interfaces/post/postView';
import { CommentLikeUnlike } from 'src/root/interfaces/chat/commentsLike';
import { NotificationService } from 'src/root/service/notification.service';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { BigBlueButtonService } from 'src/root/service/bigBlueButton';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharePostComponent } from '../sharePost/sharePost.component';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'live-stream',
    templateUrl: './liveStream.component.html',
    styleUrls: ['./liveStream.component.css'],
    providers: [MessageService],
  })
  

  export class LiveStreamComponent extends MultilingualComponent implements OnInit, OnDestroy {
    private _signalrService;
    private _postService;
    private _chatService;
    private _userService;
    private _notificationService;
    private _bigBlueButtonService;
    isDataLoaded:boolean = false;
    showCommentsField:boolean = true;
    streamUrl:any;
    streamUrl2:any;
    notificationViewModel!:NotificationViewModel;
    userId!:string;
    isOwner!:boolean;
    meetingId!:string;
    postId!:string;
    messageToGroup!:string;
    post:any;
    pageNumber:number = 1;
    commentViewModel!: CommentViewModel;
    commentLikeUnlike!:CommentLikeUnlike;
    postView!:PostView;
    sender:any;
    isCommentsDisabled!:boolean;
    commentsScrolled:boolean = false;
    scrollCommentsResponseCount:number = 1;
    commentsLoadingIcon: boolean = false;
    commentsPageNumber:number = 1;
    gender!:string;
    currentLikedPostId!:string;
    likesLength!:number;
    isLiked!:boolean;
    likeUnlikePost!: LikeUnlikePost;
    liveUsersCount:number = 0;
    lastCommentTime:any;
    isCommentsEnabled:boolean = true;
    streamPassword!:string;
    showEmojiPicker = false;
    loadingIcon:boolean = false;
    from!:string;
    followersIds:any;
    currentTime:any;
    postCreatedDate:any;
    timeDifferenceInSeconds:any;
    dropdownOpen = false;
    selectedOption = '';
    streamCountDown: any;
    @ViewChild('groupChatList') groupChatList!: ElementRef;


    constructor( injector: Injector,private modalService: NgbModal,private bsModalService: BsModalService,
      private cd: ChangeDetectorRef,public messageService: MessageService,private route: ActivatedRoute,private domSanitizer: DomSanitizer, signalrService:SignalrService,postService:PostService,chatService:ChatService,userService:UserService,notificationService:NotificationService,bigBlueButtonService:BigBlueButtonService) {
        super(injector);
        this._signalrService = signalrService;
        this._postService = postService;
        this._chatService = chatService;
        this._userService = userService;
        this._notificationService = notificationService;
        this._bigBlueButtonService = bigBlueButtonService;
    }

    ngOnInit(): void {
      debugger
      // this.loadingIcon = true;
      this.getSenderInfo();
      this.postId = this.route.snapshot.paramMap.get('postId')??'';
      this.streamUrl = this.route.snapshot.paramMap.get('streamUrl')??'';
      const url = 'https://byokulstream.northeurope.cloudapp.azure.com/bigbluebutton/api/join?';
      this.streamUrl = url + this.streamUrl;
      this.from = this.route.snapshot.paramMap.get('from')??'';
      //this.isOwner = Boolean(isOwner);
      const params = new URLSearchParams(this.streamUrl.split('?')[1]);
      this.meetingId = params.get('meetingID')?.replace("meetings","")??'';
      this.streamPassword = params.get('password')??'';
      this._postService.getPostById(this.postId).subscribe((response) => {
        debugger
        this.post = response;
        this.postCreatedDate = new Date(this.post.createdOn);
        this.getComments();
        this.isCommentsDisabled = response.isCommentsDisabled
        this.createGroupName();
        this.commentResponse();
        this.commentLikeResponse();
        this.postLikeResponse();
        this.saveStreamResponse();
        this.addViewResponse();
        this.endMeetingResponse();
        this.shareStreamResponse();
        this.liveUsersCountResponse();
        response.postAttachments.forEach((element: any) => {
          if(element.fileType == 1){
            this.post.coverThumbnail = element.fileUrl;
          }
        });
        this.currentTime = new Date().getTime();
        this.postCreatedDate = this.postCreatedDate.getTime();
debugger
        const differenceInMilliseconds = this.currentTime - this.postCreatedDate;
        const timeDifferenceInMiliSeconds = Math.floor(differenceInMilliseconds / 1000);

this.timeDifferenceInSeconds = Math.floor(timeDifferenceInMiliSeconds / 1000);
var timeDifferenceInMinutes = this.timeDifferenceInSeconds / 60.0;

if(this.timeDifferenceInSeconds<60){
  this.timeDifferenceInSeconds = 60 - this.timeDifferenceInSeconds;
}

        setTimeout(() => {
          debugger
          this.streamUrl2 = this.domSanitizer.bypassSecurityTrustResourceUrl(this.streamUrl);
        }, this.timeDifferenceInSeconds);
        this.timer(timeDifferenceInMinutes);

        this.addPostView(this.post.id);
        this._signalrService.notifyLiveUsers(this.post.id + "_group",false);
        this.gender = localStorage.getItem("gender")??'';
        this.isDataLoaded = true;

        if(this.post.createdBy == this.userId){
           this.isOwner = true;
           this.getFollowers(this.post.parentId);
        }
        else{
          this.isOwner = false;
        }
      });


      // var stream = history.state.stream;

      // if(this.isOwner){
      //     this.notificationViewModel = {
      //       id:Constant.defaultGuid,
      //       actionDoneBy: this.userId,
      //       isRead:false,
      //       userId:'',
      //       avatar:'',
      //       notificationContent:this.meetingId,
      //       postId:this.postId,
      //       notificationType:NotificationType.LectureStart,
      //     }
      //     this._signalrService.sendNotification(this.notificationViewModel);
      // }

      const lastComment = {
        commentsCount:1,
        lastCommentTime: Date.now()
      };
       localStorage.setItem('lastCommentTime', JSON.stringify(lastComment));
    }

    ngOnDestroy(): void {
      this._signalrService.notifyLiveUsers(this.post.id + "_group",true);
    }

    getFollowers(parentId:string){
      debugger
      if(this.from == "user"){
        this._notificationService.getUserFollowersIds(parentId).subscribe((response) => {
          debugger
          this.followersIds = response;
          var chatType = 1;
          this.sendNotifications(chatType,parentId);
        });
      }
      if(this.from == "school"){
        this._notificationService.getSchoolFollowersIds(parentId).subscribe((response) => {
          debugger
          this.followersIds = response;
          var chatType = 3;
          this.sendNotifications(chatType,parentId);
        });
      }
      if(this.from == "class"){
        this._notificationService.getClassFollowersIds(parentId).subscribe((response) => {
          debugger
          this.followersIds = response;
          var chatType = 4;
          this.sendNotifications(chatType,parentId);
        });
      }
    }

    sendNotifications(chatType:number,chatTypeId:string){
      this.notificationViewModel = {
        id:Constant.defaultGuid,
        actionDoneBy: this.userId,
        isRead:false,
        userId:'',
        avatar:'',
        notificationContent:this.meetingId,
        postId:this.postId,
        notificationType:NotificationType.LectureStart,
        followersIds:this.followersIds,
        chatType:chatType,
        chatTypeId:chatTypeId
      }
      this._signalrService.sendNotification(this.notificationViewModel);
    }

    showComments(){
     if(this.showCommentsField){
       this.showCommentsField = false;
     }  
     else{
      this.showCommentsField = true;
     }
    }

    back(): void {
      window.history.back();
    }

    timer(minute:any) {
      // let minute = 1;
      let seconds: number = minute * 60;
      let textSec: any = "0";
      let statSec: number = 60;
  
      const prefix = minute < 10 ? "0" : "";
  
      const timer = setInterval(() => {
        seconds--;
        if (statSec != 0) statSec--;
        else statSec = 59;
  
        if (statSec < 10) {
          textSec = "0" + statSec;
        } else textSec = statSec;
  
        this.streamCountDown = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;
  
        if (seconds == 0) {
          console.log("finished");
          clearInterval(timer);
        }
      }, 1000);
    }

    getComments(){
      this._chatService.getComments(this.post.id,this.pageNumber).subscribe((response) => {
        this.post.comments = response;
        });
    }

    sendToGroup(){
      debugger
        this.lastCommentTime = localStorage.getItem('lastCommentTime');
        this.lastCommentTime = JSON.parse(this.lastCommentTime);
        const currentTime = Date.now();
        if (this.lastCommentTime == null) {
          const lastComment = {
            commentsCount:1,
            lastCommentTime: currentTime
          };
          localStorage.setItem('lastCommentTime', JSON.stringify(lastComment));
          // localStorage.setItem('lastCommentTime', currentTime.toString());
        } else {
             const elapsedSeconds = (currentTime - this.lastCommentTime.lastCommentTime) / 1000;
             if (elapsedSeconds < 60 && this.lastCommentTime.commentsCount <= this.post.commentsPerMinute) {
             this.isCommentsEnabled = true;
            //  this.lastCommentTime = localStorage.getItem('lastCommentTime');
            //  this.lastCommentTime = JSON.parse(this.lastCommentTime);
             this.lastCommentTime.commentsCount++;
             localStorage.setItem('lastCommentTime', JSON.stringify(this.lastCommentTime));
             } 
             else {
              if(elapsedSeconds > 60){
              const lastComment = {
                commentsCount:1,
                lastCommentTime: currentTime
              };
               localStorage.setItem('lastCommentTime', JSON.stringify(lastComment));
               this.isCommentsEnabled = true;
               return;
            }
            else{
                this.isCommentsEnabled = false;
              return;
            }
             }
          }

      
      var comment: any[] = this.post.comments;
      this.InitializeCommentViewModel();
      this.commentViewModel.userId = this.sender.id;
      this.commentViewModel.groupName = this.post.id + "_group";
      this.commentViewModel.content = this.messageToGroup;
      this.commentViewModel.userAvatar = this.sender.avatar;
      this.commentViewModel.gender = this.gender;
      this.messageToGroup = "";
      this.commentViewModel.id = Constant.defaultGuid;
      this._chatService.addComments(this.commentViewModel).subscribe((response) => {
        comment.push(response);
        this.post.commentsCount = comment.length;
        this.cd.detectChanges();
        this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
        this.commentViewModel.id = response.id;
        this._signalrService.sendToGroup(this.commentViewModel);
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
          userName:'',
          gender:''
         };
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
        if(this.gender == undefined){
          localStorage.setItem('gender',decodedJwtData.gender);
          this.gender = decodedJwtData.gender;
        }
       }
      }

      createGroupName(){
        this._signalrService.createGroupName(this.post.id);
        this.postView ={
         postId:'',
         userId:''
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

    commentResponse(){
      commentResponse.subscribe(response => {
        debugger
        var comment: any[] = this.post.comments;
        if(response.senderAvatar == ""){
          if(response.gender == "1"){
            response.senderAvatar = "../../../assets/images/maleProfile.jfif";
          }
          else{
            response.senderAvatar = "../../../assets/images/femaleProfile.jfif"
          }
        }
        var commentObj = {id:response.id,content:response.message,likeCount:0,isCommentLikedByCurrentUser:false,userAvatar:response.senderAvatar};
        comment.push(commentObj);
        this.cd.detectChanges();
        this.groupChatList.nativeElement.scrollTop = this.groupChatList.nativeElement.scrollHeight;
      });
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
     this._signalrService.notifyCommentLike(this.commentLikeUnlike);
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

    postLikeResponse(){
      postLikeResponse.subscribe(response => {
        debugger
        if(response.isLiked){
          if(this.currentLikedPostId!= this.post.id){
          this.post.likes.length = this.post.likes.length + 1;
          }
          if(this.likesLength != undefined && this.currentLikedPostId == this.post.id){
            this.likesLength = this.likesLength + 1;
          }
        }
        else{
          if(this.currentLikedPostId!= this.post.id){
          this.post.likes.length = this.post.likes.length - 1;
          }
          if(this.likesLength != undefined && this.currentLikedPostId == this.post.id){
            this.likesLength = this.likesLength - 1;
          }
        }
      });
    }

    saveStreamResponse(){
      saveStreamResponse.subscribe(response => {
        if(response.isSaved){
            this.post.savedPostsCount = this.post.savedPostsCount + 1;
        }
        else{
          this.post.savedPostsCount = this.post.savedPostsCount - 1;
        }
      });
    }

    addViewResponse(){
      postViewResponse.subscribe(response => {
        if(response.isAddView){
          // if(this.currentLikedPostId!= this.post.id){
          // this.post.likes.length = this.post.likes.length + 1;
          // }
          // if(this.likesLength != undefined && this.currentLikedPostId == this.post.id){
            this.post.views.length = this.post.views.length + 1;
          // }
        }
        this.liveUsersCount = this.post.views.length;
      });
    }

    endMeetingResponse(){
      endMeetingResponse.subscribe(response => {
        setTimeout(() => {
        window.history.back();
        }, 3000);
      });
    }

    shareStreamResponse(){
      shareStreamResponse.subscribe(response => {
       this.post.postSharedCount = this.post.postSharedCount + 1;
      });
    }

    liveUsersCountResponse(){
      liveUsersCountResponse.subscribe(response => {
        if(response.isLeaveStream){
           this.liveUsersCount = this.liveUsersCount - 1;
        }
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

      this._signalrService.notifyPostView(postId + "_group",this.userId);



    }

    likeUnlikePosts(postId:string, isLike:boolean,postType:number,post:any){      
      this.InitializeLikeUnlikePost();
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
      this.likeUnlikePost.commentId = Constant.defaultGuid;
      this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
        this.post.likes = response;
         this.InitializeLikeUnlikePost();
      });

      this._signalrService.notifyPostLike(this.post.id + "_group",this.userId,this.isLiked);
    
    }

    InitializeLikeUnlikePost(){
      this.likeUnlikePost = {
        postId: '',
        userId: '',
        isLike:false,
        commentId:''
       };

    }

    endLiveStream(){
      debugger
      var endMeetingViewModel = {
        meetingId:this.meetingId + "meetings",
        password:this.streamPassword,
        postId:this.postId
      }
      this._bigBlueButtonService.endMeeting(endMeetingViewModel).subscribe((response) => {
       debugger
      //  this.modalService.open('endMeeting-Modal');
      //  setTimeout(() => {
      //   // this.activeModal.close();
      //   window.history.back();
      // }, 10000);
      this._signalrService.notifyEndMeeting(this.post.id + "_group");

      

      });
    }

    toggleEmojiPicker(){
      this.showEmojiPicker = !this.showEmojiPicker;
    }

    addEmoji(event:any) {
      debugger
      if(this.messageToGroup != undefined){
      var text = `${this.messageToGroup}${event.emoji.native}`;
      this.messageToGroup = text;
      }
      else{
      var text = `${event.emoji.native}`;
      this.messageToGroup = text;
      }
      // this.showEmojiPicker = false;
    }

    openSharePostModal(): void {
      if(this.post.isClassPrivateOrPaid){
        this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'This class is private/paid, you cant share the post!'});
      }
      else{
          const initialState = {
          streamUrl: this.streamUrl,
          streamId:this.post.id     
          };
           this.bsModalService.show(SharePostComponent,{initialState});
        }
    }

    savePost(postId:string){
      debugger
      if(this.post.isPostSavedByCurrentUser){
        this.post.savedPostsCount -= 1;
        this.post.isPostSavedByCurrentUser = false;
        this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Stream removed from successfully'});
       }
       else{
        this.post.savedPostsCount += 1;
        this.post.isPostSavedByCurrentUser = true;
        this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Stream will saved successfully after stream ends'});
       }
       this._signalrService.notifySaveStream(this.post.id + "_group",this.userId,this.post.isPostSavedByCurrentUser);
       this._postService.savePost(postId,this.userId).subscribe((result) => {
      });
    }

    toggleDropdown(): void {
      this.dropdownOpen = !this.dropdownOpen;
    }
  
    selectOption(noOfComments: number): void {
      debugger
      this.toggleDropdown();
      this.post.commentsPerMinute = noOfComments;
      this.lastCommentTime = localStorage.getItem('lastCommentTime');
        this.lastCommentTime = JSON.parse(this.lastCommentTime);
        const currentTime = Date.now();
        const lastComment = {
          commentsCount:noOfComments,
          lastCommentTime: currentTime
        };
        localStorage.setItem('lastCommentTime', JSON.stringify(lastComment));
      this._postService.updateCommentThrottling(this.post.id,noOfComments).subscribe((response) => {
      });
    }
}
