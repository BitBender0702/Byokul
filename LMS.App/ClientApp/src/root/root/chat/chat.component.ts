import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  AfterViewInit,
  Injector,
} from '@angular/core';
import {
  signalRResponse,
  SignalrService,
} from 'src/root/service/signalr.service';
import { HttpClient } from '@angular/common/http';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/root/service/user.service';
import { DOCUMENT } from '@angular/common';
import { ChatViewModel } from 'src/root/interfaces/chat/chatViwModel';
import { ChatType } from 'src/root/interfaces/chat/chatType';
import { ChatService } from 'src/root/service/chatService';
import { FileUploadResult } from 'src/root/interfaces/chat/uploadFiles';
import { SaveChatAttachment } from 'src/root/interfaces/chat/saveChatAttachment';
import { AddChatAttachments } from 'src/root/interfaces/chat/addChatAttachments';
import { chatResponse } from '../user/userProfile/userProfile.component';
import { SchoolService } from 'src/root/service/school.service';
import { ClassService } from 'src/root/service/class.service';
import { IfStmt } from '@angular/compiler';
import { CourseService } from 'src/root/service/course.service';
import { Subject, Subscription } from 'rxjs';
import { NotificationService } from 'src/root/service/notification.service';
import { NotificationType } from 'src/root/interfaces/notification/notificationViewModel';
import {
  MultilingualComponent,
  changeLanguage,
} from '../sharedModule/Multilingual/multilingual.component';
import { CertificateViewComponent } from '../certificateView/certificateView.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { ChatVideoComponent } from '../chatVideo/chatVideo.component';
import { UploadVideo } from 'src/root/interfaces/post/uploadVideo';
import {
  OpenSideBar,
  notifyMessageAndNotificationCount,
  totalMessageAndNotificationCount,
  unreadChatResponse,
} from 'src/root/user-template/side-bar/side-bar.component';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
// export const unreadChatResponse =new Subject<{readMessagesCount: number,type:string}>();

@Component({
  selector: 'chat-root',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [MessageService],
})
export class ChatComponent
  extends MultilingualComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  isOpenSidebar: boolean = false;
  userId: string = '';
  senderId!: string;
  chatType!: string;
  chatTypeId!: string;
  chatViewModel!: ChatViewModel;
  formData = new FormData();
  uploadImage: any;
  uploadVideos: any;
  uploadAttachments!: any;
  SaveChatAttachment!: SaveChatAttachment;
  @ViewChild('chatList') chatList!: ElementRef;
  @ViewChild('schoolChatList') schoolChatList!: ElementRef;
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef;

  schoolVerifiedBatch = `<span class="verified-badge " style="font-size: 70%;">
  <img src="../../../../assets/images/verified-badge.svg" style="height: 20px;" class="m-0"/>
   </span>`
userVerifiedBatch = `<span class="verified-badge " style="font-size: 70%;">
<img src="../../../../assets/images/green-verified.svg" style="height: 20px;" class="m-0"/>
</span>`

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        min: 0,
      },
    },
  };

  chartLabels: string[] = ['Real time data for the chart'];
  chartType: ChartType = 'bar';
  chartLegend: boolean = true;
  user: any;
  sender: any;
  messageToUser: string = '';
  recieverMessageInfo!: any;

  topChatHeadUser:any
  topSchoolInboxChatHeadUser:any

  topChatViewIcon:any;
  topChatViewName:any;
  topChatViewIsUserVerified:boolean=false;
  topChatViewIsSchoolVerified:boolean=false;
  topChatViewChatType:any;
  initialChatUsersData:any;


  private _userService;
  private _schoolService;
  private _classService;
  private _courseService;
  private _signalRService;
  private _chatService;
  private _notificationService;
  chatheadSub: any;
  saveChat: any;
  isDataLoaded: boolean = false;
  loadingIcon: boolean = false;
  allChatUsers: any;
  firstuserChats: any;
  usersChatSub: any;
  userChats: any;
  isPinned!: boolean;
  recieverId: any;
  receiverAvatar!: string;
  receiverName!: string;
  selectedFile: FileList | [] = [];
  addChatAttachments!: AddChatAttachments;
  userName!: string;
  invalidMessage!: boolean;
  fullSizeImageName!: string;
  fullSizeVideoName!: string;
  fullSizeImageUrl!: string;
  fullSizeVideoUrl!: string;
  profileURL!: string;
  showMyInbox!: boolean;
  showMySchoolInbox!: boolean;
  school!: any;
  schoolInboxList!: any;
  classInboxList!: any;
  courseInboxList!: any;
  userSchoolsList!: any;
  receiverInfo!: any;
  isSchoolOwner!: boolean;
  frontEndPageNumber: number = 1;
  senderID!: string;
  schoolInfo!: any;
  classInfo!: any;
  courseInfo!: any;
  selectedChatHeadDiv: boolean = false;
  chatHeadId!: string;

  senderAvatar!: any;
  senderName!: any;
  schoolInboxChatType!: string;
  schoolInboxUserName!: string;
  schoolInboxUserAvatar!: string;
  schoolInboxReceiverId!: string;

  chatHeadsPageNumber: number = 1;
  chatHeadScrolled: boolean = false;
  chatHeadsLoadingIcon: boolean = false;
  scrollChatHeadsResponseCount: number = 1;

  chatsPageNumber: number = 1;
  chatsScrolled: boolean = false;
  chatsLoadingIcon: boolean = false;
  scrollChatsResponseCount: number = 1;

  schoolChatsPageNumber: number = 1;
  schoolChatsScrolled: boolean = false;
  schoolChatsLoadingIcon: boolean = false;
  scrollSchoolChatsResponseCount: number = 1;
  schoolInboxes: any;
  exceedUploadFileSize!: boolean;

  videoLoad: boolean = false;
  private player: videojs.Player | null = null;

  searchString: string = '';
  changeLanguageSubscription!: Subscription;
  hamburgerCountSubscription!: Subscription;
  hamburgerCount:number = 0;
  unreadChatSubscription!: Subscription;
  videoObject!: UploadVideo;
  disabledSendButton!: boolean;
  uploadVideo: any[] = [];
  gender!: string;
  replyChat: string = '';
  replyMessageId: string | null = '';
  fileName: string = '';
  fileURL: string = '';
  isSubmitted: boolean = false;
  replyMessageType: number | null = null;
  forwardMessagePageNumber: number = 1;
  forwardUsersList: any;
  isForwarded: boolean = false;
  forwardedFileName!: string;
  forwardedFileURL!: string;
  forwardedFileType!: number;
  selectedChatHeadId!: string;
  forwardedId: string = '';
  isGenerateChatLi: boolean = false;
  groupedMessages: any;
  @ViewChild('chatHeadsScrollList') chatHeadsScrollList!: ElementRef;
  isScreenPc: boolean = false;
  isScreenMobile: boolean = false;
  isChatSelected:boolean=false;
  isChatHeadSelected:boolean=false;
  // @ViewChild('chatScrollList') chatScrollList!: ElementRef;

  constructor(
    @Inject(DOCUMENT) document: Document,
    injector: Injector,
    private translateService: TranslateService,
    public messageService: MessageService,
    private bsModalService: BsModalService,
    notificationService: NotificationService,
    schoolService: SchoolService,
    classService: ClassService,
    courseService: CourseService,
    chatService: ChatService,
    private renderer: Renderer2,
    public signalRService: SignalrService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private router:Router
  ) {
    super(injector);
    this._userService = userService;
    this._schoolService = schoolService;
    this._classService = classService;
    this._courseService = courseService;
    this._signalRService = signalRService;
    this._chatService = chatService;
    this._notificationService = notificationService;

    this._userService.shareDataSubject.subscribe((receiveddata) => {
      console.log(receiveddata);
    });
  }

  ngOnInit() {
    debugger;
    this.checkScreenSize();

    if(this.isScreenMobile){
      this.isChatHeadSelected=true;
      this.isChatSelected=false
    }
    


    this.loadingIcon = true;
    var selectedLang = localStorage.getItem('selectedLanguage');
    this.gender = localStorage.getItem('gender') ?? '';
    this.translate.use(selectedLang ?? '');
    let chatHeadObj = history.state.chatHead;
    if (chatHeadObj != undefined) {
      this.userId = chatHeadObj.receiverId;
      this.chatType = chatHeadObj.type;
      this.chatTypeId = chatHeadObj.chatTypeId;
      this._userService.getUser(this.userId).subscribe((response) => {
        this.user = response;
      });

      if (this.chatTypeId != '' && this.chatType == '3') {
        this._schoolService.getSchool(this.chatTypeId).subscribe((result) => {
          this.schoolInfo = {
            userName: result.schoolName,
            userID: this.userId,
            profileURL: result.avatar,
            chatType: this.chatType,
            chatTypeId: this.chatTypeId,
            school: result,
            chats: [],
            isPinned: false,
            unreadMessageCount: 0,
          };
        });
      }

      if (this.chatTypeId != '' && this.chatType == '4') {
        this._classService.getClass(this.chatTypeId).subscribe((result) => {
          this.classInfo = {
            userName: result.className,
            userID: this.userId,
            profileURL: result.avatar,
            chatType: this.chatType,
            chatTypeId: this.chatTypeId,
            class: result,
            chats: [],
            isPinned: false, 
            unreadMessageCount: 0,
          };
        });
      }

      if (this.chatTypeId != '' && this.chatType == '5') {
        this._courseService.getCourse(this.chatTypeId).subscribe((result) => {
          this.courseInfo = {
            userName: result.courseName,
            userID: this.userId,
            profileURL: result.avatar,
            chatType: this.chatType,
            chatTypeId: this.chatTypeId,
            course: result,
            chats: [],
            isPinned: false,
            unreadMessageCount: 0,
            chatheadId: '1'
          };
        });
      }
    }

    this.loadingIcon = true;
    this.invalidMessage = true;
    this.showMyInbox = true;
    this.showMySchoolInbox = false;
    // document.getElementById('chat')?.addEventListener('scroll', this.myScrollFunction, false);
    // document.getElementById('chat')?.scrollIntoView({
    //   behavior:"smooth",
    // })
    // document.getElementById('chat')?.scrollBy({
    //   top:-100
    // })
    var validToken = localStorage.getItem('jwt');
    if (validToken != null) {
      let jwtData = validToken.split('.')[1];
      let decodedJwtJsonData = window.atob(jwtData);
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.senderId = decodedJwtData.jti; // sender
      // this.getChatUsersList(this.senderId);
      this._userService.getUser(this.senderId).subscribe((response) => {
        this.sender = response;
        this.getChatUsersList(this.senderId);
      });

      this._schoolService
        .getUserAllSchools(this.senderId)
        .subscribe((response) => {
          this.userSchoolsList = response;
        });
    }

    this.uploadImage = [];
    this.uploadVideos = [];
    this.uploadAttachments = [];

    signalRResponse.subscribe((response) => {
      debugger;
      // if(this.chatHeadId == undefined){
      //   var user = this.allChatUsers.find((x: { chatheadId: string; }) => x.chatheadId == '1');
      //   user.chatheadId = response.chatHeadId;
      //   this.chatHeadId = response.chatHeadId;
      // }
      // unreadChatResponse.next({readMessagesCount:1,type:"add"});
      if (this.chatHeadId == response.chatHeadId) {
        var user = this.allChatUsers.find((x: { chatheadId: string; }) => x.chatheadId == '1');
        this._chatService
          .removeUnreadMessageCount(
            response.receiverId,
            response.senderId,
            Number(response.chatType)
          )
          .subscribe((result) => {});
        
            unreadChatResponse.next({
              readMessagesCount: 1,
              type: 'remove',
            });
           
      } else {
        if (this.chatHeadId != '1') {
          // unreadChatResponse.next({readMessagesCount:1,type:"add"});
          var chatUsers: any[] = this.allChatUsers;
          var chatUser = chatUsers.find(
            (x) =>
              x.userID == response.senderId &&
              x.chatType == response.chatType &&
              x.chatHeadId == response.chatHeadId
          );
          if (chatUser == undefined) {
            var chatSchoolUsers: any[] = this.schoolInboxList;
            chatUser = chatSchoolUsers.find(
              (x) =>
                x.userID == response.senderId &&
                x.chatType == response.chatType &&
                x.chatHeadId == response.chatHeadId
            );
            if (chatUser == undefined) {
              var chatClassUsers: any[] = this.classInboxList;
              chatUser = chatClassUsers.find(
                (x) =>
                  x.userID == response.senderId &&
                  x.chatType == response.chatType &&
                  x.chatHeadId == response.chatHeadId
              );
              if (chatUser == undefined) {
                var chatCourseUsers: any[] = this.courseInboxList;
                chatUser = chatCourseUsers.find(
                  (x) =>
                    x.userID == response.senderId &&
                    x.chatType == response.chatType &&
                    x.chatHeadId == response.chatHeadId
                );
              }
            }
          }
          if (chatUser != undefined) {
            // chatUser.unreadMessageCount = chatUser.unreadMessageCount + 1;
          }
        }
      }
      for (let i = 0; i < response.attachments.length; i++) {
        if (response.attachments[i].fileType == 1) {
          this.uploadImage.push(response.attachments[i]);
        }

        if (response.attachments[i].fileType == 2) {
          this.uploadVideos.push(response.attachments[i]);
        }

        if (response.attachments[i].fileType == 3) {
          this.uploadAttachments.push(response.attachments[i]);
        }
      }
      if (response.chatType == '1') {
        debugger
        if (this.allChatUsers == undefined) {
          this.allChatUsers = [];
        }

        var chatUsers: any[] = this.allChatUsers;
        var isuserExist = chatUsers.find(
          (x) =>
            x.userID == response.senderId &&
            x.chatType == 1 &&
            x.chatHeadId == response.chatHeadId
        );
        if (isuserExist == undefined) {
          this._userService.getUser(response.senderId).subscribe((result) => {
            var userDetails = {
              userName: result.firstName + ' ' + result.lastName,
              userID: response.senderId,
              profileURL: result.avatar,
              chatType: response.chatType,
              chats: [],
              chatHeadId: response.chatHeadId,
              isPinned: false,
              unreadMessageCount: 1
            };

            debugger
            if(this.chatHeadId != '1'){
              this.allChatUsers.unshift(userDetails);  
            }
            else{
              var userChatead = this.allChatUsers.find((x: { chatHeadId: string; }) => x.chatHeadId == '1');  
              userChatead.chatHeadId = response.chatHeadId;
            }
            this.senderID = userDetails.userID;
            this.chatType = response.chatType;
            var users: any[] = this.allChatUsers;
            var user = users.find((x) => x.chatHeadId == response.chatHeadId);
            if (response.message != '') {
              user.lastMessage = response.message;
            } else {
              if (response.forwardedFileName != undefined) {
                user.lastMessage = response.forwardedFileName;
              } else {
                user.lastMessage = response.attachments[0].fileName;
              }
            }

            user.time = new Date().toISOString().slice(0, -1);

            var senderDetails = {
              id: response.id,
              receiver: result.firstName + ' ' + result.lastName,
              message: response.message,
              isTest: true,
              receiverId: response.receiverId,
              isSchoolOwner: this.isSchoolOwner,
              replyChatContent: response.replyChatContent,
              replyMessageType: response.replyMessageType,
              fileName: response.fileName,
              fileURL: response.fileURL,
              isForwarded: response.isForwarded,
              forwardedFileName: response.forwardedFileName,
              forwardedFileURL: response.forwardedFileURL,
              forwardedFileType: response.forwardedFileType,
            };
            this.generateChatLi(senderDetails, result.avatar, '1');
          });
        } else {
          var users: any[] = this.allChatUsers;
          var user = users.find((x) => x.chatHeadId == response.chatHeadId);
          const userIndex = this.allChatUsers.findIndex((x: { chatHeadId: string; }) => x.chatHeadId === response.chatHeadId);
          if (userIndex !== -1) {
            let insertIndex = this.allChatUsers.findIndex((x: { isPinned: boolean; }) => x.isPinned === false);
            if (insertIndex === -1) {
              insertIndex = this.allChatUsers.length;
            }
            const userToMove = this.allChatUsers.splice(userIndex, 1)[0];
            this.allChatUsers.splice(insertIndex, 0, userToMove);
          }
          if (this.receiverName == undefined) {
            this.receiverName = user.userName;
          }
          if (this.receiverAvatar == undefined) {
            this.receiverAvatar = user.profileURL;
          }
          this.senderID = user.userID;
          this.chatType = response.chatType;
          if (response.message != '') {
            user.lastMessage = response.message;
          } else {
            if (response.forwardedFileName != undefined) {
              user.lastMessage = response.forwardedFileName;
            } else {
              user.lastMessage = response.attachments[0].fileName;
            }
          }

          user.time = new Date().toISOString().slice(0, -1);

          var result = {
            id: response.id,
            receiver: this.receiverName,
            message: response.message,
            isTest: true,
            receiverId: response.receiverId,
            isSchoolOwner: this.isSchoolOwner,
            replyChatContent: response.replyChatContent,
            replyMessageType: response.replyMessageType,
            fileName: response.fileName,
            fileURL: response.fileURL,
            isForwarded: response.isForwarded,
            forwardedFileName: response.forwardedFileName,
            forwardedFileURL: response.forwardedFileURL,
            forwardedFileType: response.forwardedFileType,
          };
          this.generateChatLi(result, this.receiverAvatar, '1');
        }
      }
      if (response.chatType == '3') {
        if (this.schoolInboxList == undefined) {
          this.schoolInboxList = [];
        }

        var chatUsers: any[] = this.schoolInboxList;
        this.chatType = response.chatType;
        var isuserExist = chatUsers.find(
          (x) =>
            x.userID == response.senderId &&
            x.chatType == 3 &&
            x.chatHeadId == response.chatHeadId
        );
        if (isuserExist == undefined) {
          this._userService.getUser(response.senderId).subscribe((result) => {
            var userDetails = {
              userName: result.firstName + ' ' + result.lastName,
              userID: response.senderId,
              profileURL: result.avatar,
              chatType: response.chatType,
              chatHeadId: response.chatHeadId,
              chats: [],
              school: {
                createdById: '',
                schoolName: '',
                avatar: '',
                schoolId: '',
              },
            };

            this._schoolService
              .getSchool(response.chatTypeId)
              .subscribe((schoolDeatail) => {
                userDetails.school['createdById'] = schoolDeatail.createdById;
                userDetails.school['schoolName'] = schoolDeatail.schoolName;
                userDetails.school['avatar'] = schoolDeatail.avatar;
                userDetails.school['schoolId'] = schoolDeatail.schoolId;
                userDetails.userName =
                  userDetails.userName + '(' + schoolDeatail.schoolName + ')';

                  debugger;
                this.schoolInboxList.unshift(userDetails);

                var users: any[] = this.allChatUsers;
                var receiverLastMessage = users.find(
                  (x) =>
                    x.userID == response.senderId &&
                    x.chatType == 3 &&
                    x.chatHeadId == response.chatHeadId
                );
                if (receiverLastMessage != undefined) {
                  receiverLastMessage.lastMessage = response.message;
                  receiverLastMessage.time = new Date()
                    .toISOString()
                    .slice(0, -1);
                }

                var schoolUsers: any[] = this.schoolInboxList;
                var user = schoolUsers.find(
                  (x) =>
                    x.userID == response.senderId &&
                    x.chatType == 3 &&
                    x.chatHeadId == response.chatHeadId
                );
                //  var users: any[] = this.schoolInboxList;
                //  var user = users.find(x => x.uschatHeadIderID == response.chatHeadId);
                //  user.lastMessage = response.message;
                if (user.school != null) {
                  if (
                    user.school.ownerId == this.sender.id ||
                    user.school?.createdById == this.sender.id
                  ) {
                    this.isSchoolOwner = true;
                    user.lastMessage = response.message;
                    user.time = new Date().toISOString().slice(0, -1);
                    var senderDetails = {
                      id: response.id,
                      receiver:
                        result.firstName +
                        ' ' +
                        result.lastName +
                        '(' +
                        user.school.schoolName +
                        ')',
                      message: response.message,
                      isTest: true,
                      receiverId: response.receiverId,
                      isSchoolOwner: this.isSchoolOwner,
                      replyChatContent: response.replyChatContent,
                      replyMessageType: response.replyMessageType,
                      fileName: response.fileName,
                      fileURL: response.fileURL,
                      isForwarded: response.isForwarded,
                      forwardedFileName: response.forwardedFileName,
                      forwardedFileURL: response.forwardedFileURL,
                      forwardedFileType: response.forwardedFileType,
                    };
                    this.generateChatLi(senderDetails, result.avatar, '3');
                  } else {
                    this.isSchoolOwner = false;
                    var senderDetailss = {
                      id: response.id,
                      receiver: user.school.schoolName,
                      message: response.message,
                      isTest: true,
                      receiverId: response.receiverId,
                      isSchoolOwner: this.isSchoolOwner,
                      replyChatContent: response.replyChatContent,
                      replyMessageType: response.replyMessageType,
                      fileName: response.fileName,
                      fileURL: response.fileURL,
                      isForwarded: response.isForwarded,
                      forwardedFileName: response.forwardedFileName,
                      forwardedFileURL: response.forwardedFileURL,
                      forwardedFileType: response.forwardedFileType,
                    };
                    this.generateChatLi(
                      senderDetailss,
                      user.school.avatar,
                      '3'
                    );
                  }
                } else {
                  this.isSchoolOwner = false;
                  var senderDetailsss = {
                    id: response.id,
                    receiver: user.school.schoolName,
                    message: response.message,
                    isTest: true,
                    receiverId: response.receiverId,
                    isSchoolOwner: this.isSchoolOwner,
                    replyChatContent: response.replyChatContent,
                    replyMessageType: response.replyMessageType,
                    fileName: response.fileName,
                    fileURL: response.fileURL,
                    isForwarded: response.isForwarded,
                    forwardedFileName: response.forwardedFileName,
                    forwardedFileURL: response.forwardedFileURL,
                    forwardedFileType: response.forwardedFileType,
                  };
                  this.generateChatLi(senderDetailsss, user.school.avatar, '3');
                }
                if (response.message != '') {
                  user.lastMessage = response.message;
                } else {
                  if (response.forwardedFileName != undefined) {
                    user.lastMessage = response.forwardedFileName;
                  } else {
                    user.lastMessage = response.attachments[0].fileName;
                  }
                }
                user.time = new Date().toISOString().slice(0, -1);
              });
          });
        } else {
          var users: any[] = this.schoolInboxList;
          var user = users.find((x) => x.chatHeadId == response.chatHeadId);
          user.lastMessage = response.message;
          user.time = new Date().toISOString().slice(0, -1);
          if (user.school != null) {
            if (
              user.school.ownerId == this.sender.id ||
              user.school?.createdById == this.sender.id
            ) {
              this.isSchoolOwner = true;
            } else {
              this.isSchoolOwner = false;
            }
          } else {
            this.isSchoolOwner = false;
          }
          if (response.message != '') {
            user.lastMessage = response.message;
            user.time = new Date().toISOString().slice(0, -1);
          } else {
            if (response.forwardedFileName != undefined) {
              user.lastMessage = response.forwardedFileName;
            } else {
              user.lastMessage = response.attachments[0].fileName;
            }
          }

          var senderDeatail = {
            id: response.id,
            receiver: this.receiverName,
            message: response.message,
            isTest: true,
            receiverId: response.receiverId,
            isSchoolOwner: this.isSchoolOwner,
            replyChatContent: response.replyChatContent,
            replyMessageType: response.replyMessageType,
            fileName: response.fileName,
            fileURL: response.fileURL,
            isForwarded: response.isForwarded,
            forwardedFileName: response.forwardedFileName,
            forwardedFileURL: response.forwardedFileURL,
            forwardedFileType: response.forwardedFileType,
          };
          this.generateChatLi(senderDeatail, this.receiverAvatar, '3');
        }
      }

      if (response.chatType == '4') {
        if (this.classInboxList == undefined) {
          this.classInboxList = [];
        }

        var chatUsers: any[] = this.classInboxList;
        this.chatType = response.chatType;
        var isuserExist = chatUsers.find((x) => x.userID == response.senderId);
        if (isuserExist == undefined) {
          this._userService.getUser(response.senderId).subscribe((result) => {
            var userDetails = {
              userName: result.firstName + ' ' + result.lastName,
              userID: response.senderId,
              profileURL: result.avatar,
              chatType: response.chatType,
              chatHeadId: response.chatHeadId,
              chats: [],
              class: {
                createdById: '',
                className: '',
                avatar: '',
                classId: '',
                schoolId: '',
              },
            };

            this._classService
              .getClass(response.chatTypeId)
              .subscribe((classDeatail) => {
                userDetails.class['createdById'] = classDeatail.createdById;
                userDetails.class['className'] = classDeatail.className;
                userDetails.class['avatar'] = classDeatail.avatar;
                userDetails.class['classId'] = classDeatail.classId;
                userDetails.class['classId'] = classDeatail.classId;
                userDetails.class['schoolId'] = classDeatail.schoolId;
                userDetails.userName =
                  userDetails.userName + '(' + classDeatail.className + ')';

                this.classInboxList.unshift(userDetails);
                this.schoolInboxList.unshift(userDetails);

                var users: any[] = this.allChatUsers;
                var receiverLastMessage = users.find(
                  (x) =>
                    x.userID == response.senderId &&
                    x.chatType == 4 &&
                    x.chatHeadId == response.chatHeadId
                );
                if (receiverLastMessage != undefined) {
                  receiverLastMessage.lastMessage = response.message;
                  receiverLastMessage.time = new Date()
                    .toISOString()
                    .slice(0, -1);
                }

                var classUsers: any[] = this.classInboxList;
                var user = classUsers.find(
                  (x) =>
                    x.userID == response.senderId &&
                    x.chatType == 4 &&
                    x.chatHeadId == response.chatHeadId
                );

                //  var users: any[] = this.schoolInboxList;
                //  var receiverLastMessage = users.find(x => x.userID == response.senderId && x.chatType == 4);
                //  receiverLastMessage.lastMessage = response.message;
                //  var users: any[] = this.classInboxList;
                //  var user = users.find(x => x.usechatHeadIdrID == response.chatHeadId);
                //  if(response.message != ""){
                //   user.lastMessage = response.message;
                //  }
                //  else{
                //   user.lastMessage = response.attachments[0].fileName;
                //  }
                if (user.class != null) {
                  if (
                    user.class.ownerId == this.sender.id ||
                    user.class?.createdById == this.sender.id
                  ) {
                    this.isSchoolOwner = true;
                    user.lastMessage = response.message;
                    user.time = new Date().toISOString().slice(0, -1);
                    var senderDetails = {
                      id: response.id,
                      receiver: result.firstName + ' ' + result.lastName,
                      message: response.message,
                      isTest: true,
                      receiverId: response.receiverId,
                      isSchoolOwner: this.isSchoolOwner,
                      replyChatContent: response.replyChatContent,
                      replyMessageType: response.replyMessageType,
                      fileName: response.fileName,
                      fileURL: response.fileURL,
                      isForwarded: response.isForwarded,
                      forwardedFileName: response.forwardedFileName,
                      forwardedFileURL: response.forwardedFileURL,
                      forwardedFileType: response.forwardedFileType,
                    };
                    this.generateChatLi(senderDetails, result.avatar, '4');
                  } else {
                    this.isSchoolOwner = false;
                    var senderDetailss = {
                      id: response.id,
                      receiver: user.class.className,
                      message: response.message,
                      isTest: true,
                      receiverId: response.receiverId,
                      isSchoolOwner: this.isSchoolOwner,
                      replyChatContent: response.replyChatContent,
                      replyMessageType: response.replyMessageType,
                      fileName: response.fileName,
                      fileURL: response.fileURL,
                      isForwarded: response.isForwarded,
                      forwardedFileName: response.forwardedFileName,
                      forwardedFileURL: response.forwardedFileURL,
                      forwardedFileType: response.forwardedFileType,
                    };
                    this.generateChatLi(senderDetailss, user.class.avatar, '4');
                  }
                } else {
                  this.isSchoolOwner = false;
                  var senderDetailsss = {
                    id: response.id,
                    receiver: user.class.className,
                    message: response.message,
                    isTest: true,
                    receiverId: response.receiverId,
                    isSchoolOwner: this.isSchoolOwner,
                    replyChatContent: response.replyChatContent,
                    replyMessageType: response.replyMessageType,
                    fileName: response.fileName,
                    fileURL: response.fileURL,
                    isForwarded: response.isForwarded,
                    forwardedFileName: response.forwardedFileName,
                    forwardedFileURL: response.forwardedFileURL,
                    forwardedFileType: response.forwardedFileType,
                  };
                  this.generateChatLi(senderDetailsss, user.class.avatar, '4');
                }
              });
          });
        } else {
          var users: any[] = this.allChatUsers;
          var receiverLastMessage = users.find(
            (x) =>
              x.userID == response.senderId &&
              x.chatType == 4 &&
              x.chatHeadId == response.chatHeadId
          );
          if (receiverLastMessage != undefined) {
            receiverLastMessage.lastMessage = response.message;
            receiverLastMessage.time = new Date().toISOString().slice(0, -1);
          }

          var classUsers: any[] = this.classInboxList;
          var user = classUsers.find(
            (x) =>
              x.userID == response.senderId &&
              x.chatType == 4 &&
              x.chatHeadId == response.chatHeadId
          );

          //         var users: any[] = this.allChatUsers;
          //         var receiverLastMessage = users.find(x => x.chatHeadId == response.chatHeadId);
          //         receiverLastMessage.lastMessage = response.message;
          //  var users: any[] = this.classInboxList;
          //  var user = users.find(x => x.userID == response.senderId);
          if (user.class != null) {
            if (
              user.class.ownerId == this.sender.id ||
              user.class?.createdById == this.sender.id
            ) {
              this.isSchoolOwner = true;
              user.lastMessage = response.message;
              user.time = new Date().toISOString().slice(0, -1);
            } else {
              this.isSchoolOwner = false;
            }
          } else {
            this.isSchoolOwner = false;
          }
          if (response.message != '') {
            user.lastMessage = response.message;
            user.time = new Date().toISOString().slice(0, -1);
          } else {
            if (response.forwardedFileName != undefined) {
              user.lastMessage = response.forwardedFileName;
            } else {
              user.lastMessage = response.attachments[0].fileName;
            }
          }

          var senderDeatail = {
            id: response.id,
            receiver: this.receiverName,
            message: response.message,
            isTest: true,
            receiverId: response.receiverId,
            isSchoolOwner: this.isSchoolOwner,
            replyChatContent: response.replyChatContent,
            replyMessageType: response.replyMessageType,
            fileName: response.fileName,
            fileURL: response.fileURL,
            isForwarded: response.isForwarded,
            forwardedFileName: response.forwardedFileName,
            forwardedFileURL: response.forwardedFileURL,
            forwardedFileType: response.forwardedFileType,
          };
          this.generateChatLi(senderDeatail, this.receiverAvatar, '4');
        }
      }

      if (response.chatType == '5') {
        if (this.courseInboxList == undefined) {
          this.courseInboxList = [];
        }

        var chatUsers: any[] = this.courseInboxList;
        this.chatType = response.chatType;
        var isuserExist = chatUsers.find((x) => x.userID == response.senderId);
        if (isuserExist == undefined) {
          this._userService.getUser(response.senderId).subscribe((result) => {
            var userDetails = {
              userName: result.firstName + ' ' + result.lastName,
              userID: response.senderId,
              profileURL: result.avatar,
              chatType: response.chatType,
              chatHeadId: response.chatHeadId,
              chats: [],
              course: {
                createdById: '',
                courseName: '',
                avatar: '',
                courseId: '',
                schoolId: '',
              },
            };

            this._courseService
              .getCourse(response.chatTypeId)
              .subscribe((courseDeatail) => {
                userDetails.course['createdById'] = courseDeatail.createdById;
                userDetails.course['courseName'] = courseDeatail.courseName;
                userDetails.course['avatar'] = courseDeatail.avatar;
                userDetails.course['courseId'] = courseDeatail.courseId;
                userDetails.course['schoolId'] = courseDeatail.schoolId;
                userDetails.userName =
                  userDetails.userName + '(' + courseDeatail.courseName + ')';

                this.courseInboxList.unshift(userDetails);
                this.schoolInboxList.unshift(userDetails);

                var users: any[] = this.allChatUsers;
                var receiverLastMessage = users.find(
                  (x) =>
                    x.userID == response.senderId &&
                    x.chatType == 5 &&
                    x.chatHeadId == response.chatHeadId
                );
                if (receiverLastMessage != undefined) {
                  receiverLastMessage.lastMessage = response.message;
                  receiverLastMessage.time = new Date()
                    .toISOString()
                    .slice(0, -1);
                }

                var courseUsers: any[] = this.courseInboxList;
                var user = courseUsers.find(
                  (x) =>
                    x.userID == response.senderId &&
                    x.chatType == 5 &&
                    x.chatHeadId == response.chatHeadId
                );

                //  var users: any[] = this.allChatUsers;
                //  var receiverLastMessage = users.find(x => x.userID == response.senderId);
                //  receiverLastMessage.lastMessage = response.message;
                //  var users: any[] = this.courseInboxList;
                //  var user = users.find(x => x.userID == response.senderId);
                //  if(response.message != ""){
                //   user.lastMessage = response.message;
                //  }
                //  else{
                //   user.lastMessage = response.attachments[0].fileName;
                //  }
                if (user.course != null) {
                  if (
                    user.course.ownerId == this.sender.id ||
                    user.course?.createdById == this.sender.id
                  ) {
                    this.isSchoolOwner = true;
                    user.lastMessage = response.message;
                    user.time = new Date().toISOString().slice(0, -1);
                    var senderDetails = {
                      id: response.id,
                      receiver: result.firstName + ' ' + result.lastName,
                      message: response.message,
                      isTest: true,
                      receiverId: response.receiverId,
                      isSchoolOwner: this.isSchoolOwner,
                      replyChatContent: response.replyChatContent,
                      replyMessageType: response.replyMessageType,
                      fileName: response.fileName,
                      fileURL: response.fileURL,
                      isForwarded: response.isForwarded,
                      forwardedFileName: response.forwardedFileName,
                      forwardedFileURL: response.forwardedFileURL,
                      forwardedFileType: response.forwardedFileType,
                    };
                    this.generateChatLi(senderDetails, result.avatar, '5');
                  } else {
                    this.isSchoolOwner = false;
                    var senderDetailss = {
                      id: response.id,
                      receiver: user.course.courseName,
                      message: response.message,
                      isTest: true,
                      receiverId: response.receiverId,
                      isSchoolOwner: this.isSchoolOwner,
                      replyChatContent: response.replyChatContent,
                      replyMessageType: response.replyMessageType,
                      fileName: response.fileName,
                      fileURL: response.fileURL,
                      isForwarded: response.isForwarded,
                      forwardedFileName: response.forwardedFileName,
                      forwardedFileURL: response.forwardedFileURL,
                      forwardedFileType: response.forwardedFileType,
                    };
                    this.generateChatLi(
                      senderDetailss,
                      user.course.avatar,
                      '5'
                    );
                  }
                } else {
                  this.isSchoolOwner = false;
                  var senderDetailsss = {
                    id: response.id,
                    receiver: user.course.courseName,
                    message: response.message,
                    isTest: true,
                    receiverId: response.receiverId,
                    isSchoolOwner: this.isSchoolOwner,
                    replyChatContent: response.replyChatContent,
                    replyMessageType: response.replyMessageType,
                    fileName: response.fileName,
                    fileURL: response.fileURL,
                    isForwarded: response.isForwarded,
                    forwardedFileName: response.forwardedFileName,
                    forwardedFileURL: response.forwardedFileURL,
                    forwardedFileType: response.forwardedFileType,
                  };
                  this.generateChatLi(senderDetailsss, user.course.avatar, '5');
                }
              });
          });
        } else {
          var users: any[] = this.allChatUsers;
          var receiverLastMessage = users.find(
            (x) =>
              x.userID == response.senderId &&
              x.chatType == '5' &&
              x.chatHeadId == response.chatHeadId
          );
          if (receiverLastMessage != undefined) {
            receiverLastMessage.lastMessage = response.message;
            receiverLastMessage.time = new Date().toISOString().slice(0, -1);
          }
          var users: any[] = this.courseInboxList;
          var user = users.find(
            (x) =>
              x.userID == response.senderId &&
              x.chatType == '5' &&
              x.chatHeadId == response.chatHeadId
          );
          if (user.course != null) {
            if (
              user.course.ownerId == this.sender.id ||
              user.course?.createdById == this.sender.id
            ) {
              this.isSchoolOwner = true;
              user.lastMessage = response.message;
              user.time = new Date().toISOString().slice(0, -1);
            } else {
              this.isSchoolOwner = false;
            }
          } else {
            this.isSchoolOwner = false;
          }
          if (response.message != '') {
            user.lastMessage = response.message;
            user.time = new Date().toISOString().slice(0, -1);
          } else {
            if (response.forwardedFileName != undefined) {
              user.lastMessage = response.forwardedFileName;
            } else {
              user.lastMessage = response.attachments[0].fileName;
            }
          }

          var senderDeatail = {
            id: response.id,
            receiver: this.receiverName,
            message: response.message,
            isTest: true,
            receiverId: response.receiverId,
            isSchoolOwner: this.isSchoolOwner,
            replyChatContent: response.replyChatContent,
            replyMessageType: response.replyMessageType,
            fileName: response.fileName,
            fileURL: response.fileURL,
            isForwarded: response.isForwarded,
            forwardedFileName: response.forwardedFileName,
            forwardedFileURL: response.forwardedFileURL,
            forwardedFileType: response.forwardedFileType,
          };
          this.generateChatLi(senderDeatail, this.receiverAvatar, '4');
        }
      }
    });

    this.InitializeChatViewModel();

    this.SaveChatAttachment = {
      files: [],
    };

    this.addChatAttachments = {
      fileType: '',
      file: [],
    };

    if (!this.changeLanguageSubscription) {
      this.changeLanguageSubscription = changeLanguage.subscribe((response) => {
        this.translate.use(response.language);
      });
    }

    if (!this.hamburgerCountSubscription) {
      this.hamburgerCountSubscription = totalMessageAndNotificationCount.subscribe(response => {
        debugger
        this.hamburgerCount = response.hamburgerCount;
      });
    }
    notifyMessageAndNotificationCount.next({});

    if (!this.unreadChatSubscription) {
      this.unreadChatSubscription = unreadChatResponse.subscribe((response) => {
        debugger;
        if (response.readMessagesCount != undefined) {
          if (response.type == 'add') {
            var firstDate = Object.keys(this.firstuserChats)[0];
            if (firstDate) {
              var chats = this.firstuserChats[firstDate];
              var isChatHeadActive = chats.find(
                (x: { chatHeadId: string | undefined }) =>
                  x.chatHeadId == response.chatHeadId
              );
              if (isChatHeadActive == null) {
                var reqChatHead = this.allChatUsers.find(
                  (x: { chatHeadId: string | undefined }) =>
                    x.chatHeadId == response.chatHeadId
                );
                reqChatHead.unreadMessageCount += 1;
              }
            }
          }
        }
      });
    }
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    if (this.changeLanguageSubscription) {
      this.changeLanguageSubscription.unsubscribe();
    }
    if (this.unreadChatSubscription) {
      this.unreadChatSubscription.unsubscribe();
    }
    if (this.hamburgerCountSubscription) {
      this.hamburgerCountSubscription.unsubscribe();
    }
  }

  getChatUsersList(senderId: string) {
    debugger;
    this.loadingIcon = true;
    this._chatService
      .getAllChatUsers(senderId, this.chatHeadsPageNumber, this.searchString)
      .subscribe((response) => {
        debugger;
        this.allChatUsers = response;
      
        this.loadingIcon = false;
        this.isDataLoaded = true;

        this.initialChatUsersData = response;

        var chatUsers: any[] = this.allChatUsers;
        // this.schoolInboxList = chatUsers.filter(
        //   (x) => x.chatType == 3 && x.school.ownerId == this.sender.id
        // );
        // this.classInboxList = chatUsers.filter(
        //   (x) => x.chatType == 4 && x.class.createdById == this.sender.id
        // );
        // this.courseInboxList = chatUsers.filter(
        //   (x) => x.chatType == 5 && x.course.createdById == this.sender.id
        // );
        // this.schoolInboxList = [
        //   ...this.schoolInboxList,
        //   ...this.classInboxList,
        //   ...this.courseInboxList,
        // ];
        this.schoolInboxes = this.schoolInboxList;

        if (this.userId != null && this.chatType == '3') {
          var chatUsers: any[] = this.allChatUsers;
          // var chats = chatUsers.filter(x => x.chatType == 3 && x.school.ownerId == this.sender.id);
          // chats = chats.filter(x => x.chatType == 4 && x.class.ownerId == this.sender.id);
          // chats = chats.filter(x => x.chatType == 5 && x.course.ownerId == this.sender.id);

          var isuserExist = chatUsers.find(
            (x) => x.userID == this.userId && x.chatType == '3' && x.chatTypeId == this.schoolInfo.chatTypeId
          );
          if (isuserExist == undefined) {
            this.allChatUsers.unshift(this.schoolInfo);
          } else {
            if (isuserExist.school.ownerId == this.senderId) {
              this.getUsersChat(
                isuserExist.chatHeadId,
                isuserExist.userID,
                isuserExist.profileURL,
                isuserExist.userName,
                isuserExist.chatType,
                'FromSchoolInbox',
                10,
                1,
                isuserExist.school.schoolId
              );
            } else {
              this.getUsersChat(
                isuserExist.chatHeadId,
                isuserExist.userID,
                isuserExist.profileURL,
                isuserExist.userName,
                isuserExist.chatType,
                'FromMyInbox',
                10,
                1
              );
            }
          }
        }

        if (this.userId != null && this.chatType == '4') {
          var chatUsers: any[] = this.allChatUsers;
          var isuserExist = chatUsers.find(
            (x) => x.userID == this.userId && x.chatType == '4' && x.chatTypeId == this.classInfo.chatTypeId
          );
          if (isuserExist == undefined) {
            this.allChatUsers.unshift(this.classInfo);
          } else {
            this.getUsersChat(
              isuserExist.chatHeadId,
              isuserExist.userID,
              isuserExist.profileURL,
              isuserExist.userName,
              isuserExist.chatType,
              'FromMyInbox',
              10,
              1
            );
          }
        }

        if (this.userId != null && this.chatType == '5') {
          var chatUsers: any[] = this.allChatUsers;
          var isuserExist = chatUsers.find(
            (x) => x.userID == this.userId && x.chatType == '5' && x.chatTypeId == this.courseInfo.chatTypeId
          );
          if (isuserExist == undefined) {
            this.allChatUsers.unshift(this.courseInfo);
          } else {
            this.getUsersChat(
              isuserExist.chatHeadId,
              isuserExist.userID,
              isuserExist.profileURL,
              isuserExist.userName,
              isuserExist.chatType,
              'FromMyInbox',
              10,
              1
            );
          }
        }

        // this.schoolInboxList.forEach((item: any) => {
        //   var chats: any = {};
        //   const date = item.time.slice(0, 10);
        //   // const dateTime = new Date(item.time);
        //   // const date = dateTime.toISOString().split('T')[0];
        //   if (chats[date]) {
        //     chats[date].push(item);
        //   } else {
        //     chats[date] = [item];
        //   }

        //   item.chats = chats;

        //   this._userService.getUser(item.userID).subscribe((result) => {
        //     item.userName = result.firstName + result.lastName;
        //     item.profileURL = result.avatar;
        //   });
        //   if (item.chatType == 3) {
        //     const index = this.allChatUsers.indexOf(item);
        //     if (index > -1) {
        //       this.allChatUsers.splice(index, 1);
        //     }
        //   }

        //   if (item.chatType == 4) {
        //     const index = this.allChatUsers.indexOf(item);
        //     if (index > -1) {
        //       this.allChatUsers.splice(index, 1);
        //     }
        //   }

        //   if (item.chatType == 5) {
        //     const index = this.allChatUsers.indexOf(item);
        //     if (index > -1) {
        //       this.allChatUsers.splice(index, 1);
        //     }
        //   }
        // });

        //here if click on message
        if (this.userId != '' && this.chatType == '1') {
          var chatUsers: any[] = this.allChatUsers;
          var isuserExist = chatUsers.find(
            (x) => x.userID == this.userId && x.chatType == '1'
          );
          if (isuserExist == undefined) {
            var user = {
              userName: this.user.firstName + ' ' + this.user.lastName,
              receiverName: this.user.firstName + ' ' + this.user.lastName,
              userID: this.user.id,
              profileURL: this.user.avatar,
              chatType: this.chatType,
              chats: [],
              unreadMessageCount: 0,
              chatHeadId: '1',
              isPinned: false
            };

            this.allChatUsers.unshift(user);
            // if(this.allChatUsers.length == 0){
            //   this.allChatUsers.push(user);
            // }
          } else {
            this.getUsersChat(
              isuserExist.chatHeadId,
              isuserExist.userID,
              isuserExist.profileURL,
              isuserExist.userName,
              isuserExist.chatType,
              'FromMyInbox',
              10,
              1
            );
          }
        }

        this.selectedChatHeadDiv = true;
        this.firstuserChats = this.allChatUsers[0]?.chats;
        if (this.firstuserChats) {
          this.firstuserChats = this.firstuserChats.reduce(
            (groupedChats: any, chat: any) => {
              const date = chat.time.slice(0, 10);
              // const dateTime = new Date(chat.time);
              // const date = dateTime.toISOString().split('T')[0]; // Extracting the date portion

              if (groupedChats[date]) {
                groupedChats[date].push(chat);
              } else {
                groupedChats[date] = [chat];
              }

              return groupedChats;
            },
            {}
          );
        }
        var a = 10;
        this.userName = this.allChatUsers[0].userName;
        this.recieverId = this.allChatUsers[0]?.userID;
        this.receiverAvatar = this.allChatUsers[0]?.profileURL;
        this.receiverName = this.allChatUsers[0]?.userName;
        this.chatType = this.allChatUsers[0]?.chatType;
        this.profileURL = this.sender.avatar;
        unreadChatResponse.next({
          readMessagesCount: this.allChatUsers[0]?.unreadMessageCount,
          type: 'remove',
        });
        this.allChatUsers[0].unreadMessageCount = 0;

        this.chatHeadId = this.allChatUsers[0].chatHeadId;
        this.cd.detectChanges();
        this.chatList.nativeElement.scrollTop =
          this.chatList.nativeElement.scrollHeight;

        var dynamicMessages = localStorage.getItem('messages') ?? '';
        if (dynamicMessages != '') {
          var dynamicMessagesArray = JSON.parse(dynamicMessages);
          var isChatHeadExist = dynamicMessagesArray.find(
            (x: { chatHeadId: any }) =>
              x.chatHeadId == this.allChatUsers[0].chatHeadId
          );
          if (isChatHeadExist != null) {
            this.messageToUser = isChatHeadExist.messageToUser;
          }
        }
        if (dynamicMessages == '') {
          var messageList: any = [];
          localStorage.setItem('messages', JSON.stringify(messageList));
        }
        this.selectedChatHeadId = this.allChatUsers[0].chatHeadId;

        this.topChatHeadUser = this.allChatUsers[0];
        this.topChatViewIcon=this.allChatUsers[0]?.profileURL;
        this.topChatViewName=this.allChatUsers[0].userName;
        this.topChatViewIsSchoolVerified=this.allChatUsers[0].isVerified;
        this.topChatViewIsUserVerified=this.allChatUsers[0].isUserVerified;
        this.topChatViewChatType = this.allChatUsers[0].chatType;
      });
  }

  clearChat() {
    if (this.chatList != undefined) {
      this.chatList.nativeElement
        .querySelectorAll('p')
        .forEach((elem: Element) => {
          elem.remove();
        });
    }
    if (this.schoolChatList != undefined) {
      this.schoolChatList.nativeElement
        .querySelectorAll('p')
        .forEach((elem: Element) => {
          elem.remove();
        });
    }
  }

  getSelectedSchoolInbox(schoolId?: string) {
    debugger;
    if(schoolId){
      this._chatService.getAllSchoolChatUsers(this.senderId, schoolId, 1, this.searchString).subscribe((response) => {
       debugger
       this.schoolInboxList = response.filter(
        (x: { chatType: number; school: { ownerId: any; }; }) => x.chatType == 3 && x.school.ownerId == this.sender.id
      );
      this.classInboxList = response.filter(
        (x: { chatType: number; class: { createdById: any; }; }) => x.chatType == 4 && x.class.createdById == this.sender.id
      );
      this.courseInboxList = response.filter(
        (x: { chatType: number; course: { createdById: any; }; }) => x.chatType == 5 && x.course.createdById == this.sender.id
      );
      this.schoolInboxList = [
        ...this.schoolInboxList,
        ...this.classInboxList,
        ...this.courseInboxList,
      ];     
      
      this.schoolInboxList.forEach((item: any) => {
        var chats: any = {};
        const date = item.time.slice(0, 10);
        // const dateTime = new Date(item.time);
        // const date = dateTime.toISOString().split('T')[0];
        if (chats[date]) {
          chats[date].push(item);
        } else {
          chats[date] = [item];
        }

        item.chats = chats;

        
        // this._userService.getUser(item.userID).subscribe((result) => {
        //   item.userName = result.firstName + result.lastName;
        //   item.profileURL = result.avatar;
        // });
        // if (item.chatType == 3) {
        //   const index = this.allChatUsers.indexOf(item);
        //   if (index > -1) {
        //     this.allChatUsers.splice(index, 1);
        //   }
        // }

        // if (item.chatType == 4) {
        //   const index = this.allChatUsers.indexOf(item);
        //   if (index > -1) {
        //     this.allChatUsers.splice(index, 1);
        //   }
        // }

        // if (item.chatType == 5) {
        //   const index = this.allChatUsers.indexOf(item);
        //   if (index > -1) {
        //     this.allChatUsers.splice(index, 1);
        //   }
        // }
      });


    // this.schoolInboxList = this.schoolInboxes;
    this.showMySchoolInbox = true;
    this.showMyInbox = false;
    var inboxList: any[] = this.schoolInboxList;
    var classInboxList: any[] = this.classInboxList;
    var courseInboxList: any[] = this.courseInboxList;
    inboxList = inboxList.filter((x) => x.school?.schoolId == schoolId);
    classInboxList = classInboxList.filter(
      (x) => x.class?.schoolId == schoolId
    );
    courseInboxList = courseInboxList.filter(
      (x) => x.course?.schoolId == schoolId
    );
    var inboxList = [...inboxList, ...classInboxList, ...courseInboxList];

    if(inboxList.length<=0){
      this.topChatViewName=null
      this.topChatViewIcon=null
    }

    // if(inboxList.length > 0){
    this.schoolInboxList = inboxList;
    let newList: any[] = [];
    var schoolIbList: any[] = this.schoolInboxList;
   

    this.schoolInboxList.forEach((item:any) => {
         this._userService.getUser(item.userID).subscribe((result) => {
          item.userName = result.firstName + " " + result.lastName;
          item.profileURL = result.avatar;
          
          var schoolVerifiedBatch = `<span class="verified-badge " style="font-size: 70%;">
                       <img src="../../../../assets/images/verified-badge.svg" style="height: 20px;" class="m-0"/>
                        </span>`
          var userVerifiedBatch = `<span class="verified-badge " style="font-size: 70%;">
          <img src="../../../../assets/images/green-verified.svg" style="height: 20px;" class="m-0"/>
           </span>`
      if (item.school != null && !(item.userName.indexOf('(') >= 0)) {
          
            //item.userName = item.userName + '(' + item.school.schoolName;
            if(item.isVerified && !item.isUserVerified){
              item.userName = item.userName +' (' + item.school.schoolName + schoolVerifiedBatch;
              // this.topChatViewName = item.userName;
              // this.topChatViewIcon = item.profileURL;
            }
            else if(!item.isVerified && item.isUserVerified){
              item.userName = item.userName+ userVerifiedBatch +' (' + item.school.schoolName;
              // this.topChatViewName = item.userName;
              // this.topChatViewIcon = item.profileURL;
            }
            else if(item.isVerified && item.isUserVerified){
              item.userName = item.userName+ userVerifiedBatch +' (' + item.school.schoolName + schoolVerifiedBatch;
              // this.topChatViewName = item.userName;
              // this.topChatViewIcon = item.profileURL;
            }
            else{
              item.userName = item.userName +' (' + item.school.schoolName
              // this.topChatViewName = item.userName;
              // this.topChatViewIcon = item.profileURL;
            }
            item.userName = item.userName +")";
            this.topChatViewName = this.schoolInboxList[0].userName;
            this.topChatViewIcon = this.schoolInboxList[0].profileURL;

          // }
      }
      if (item.class != null && !(item.userName.indexOf('(') >= 0)) {


        if(item.isUserVerified){
          item.userName = item.userName + userVerifiedBatch + '(' + item.class.className + ')';
        }
        else{
         item.userName = item.userName + '(' + item.class.className + ')';           
        }
        this.topChatViewName = this.schoolInboxList[0].userName;
        this.topChatViewIcon = this.schoolInboxList[0].profileURL;
      }
      if (item.course != null && !(item.userName.indexOf('(') >= 0)) {
        if(item.isUserVerified){
          item.userName = item.userName + userVerifiedBatch + '(' + item.course.courseName + ')';
        }
        else{
         item.userName = item.userName + '(' + item.course.courseName + ')';           
        }
        this.topChatViewName = this.schoolInboxList[0].userName;
        this.topChatViewIcon = this.schoolInboxList[0].profileURL;
      }
      this.cd.detectChanges();
    });
    });

    // Point: here we will differentiate school, class, course individually
    // const schoolInboxChatHeads = document.getElementsByClassName('schoolHead');
    // const len = schoolInboxChatHeads.length;

    // for (let schoolInboxChatIndex = 0; schoolInboxChatIndex < len; schoolInboxChatIndex++) {
    //     const item = schoolIbList[schoolInboxChatIndex];

    //     if (item.school != null && !(item.userName.includes('('))) {
    //         if (item.isVerified && !item.isUserVerified) {
    //             schoolInboxChatHeads[schoolInboxChatIndex].innerHTML = `
    //                 ${item.userName} (${item.school.schoolName}
    //                 <span class="verified-badge " style="font-size: 90%;">
    //                     <img src="../../../../assets/images/verified-badge.svg" style="height: 20px;" class="m-0"/>
    //                 </span>)`;
    //         }
    //         else if (item.isUserVerified && !item.isVerified) {
    //           schoolInboxChatHeads[schoolInboxChatIndex].innerHTML = `
    //               ${item.userName}  <span class="verified-badge " style="font-size: 90%;">
    //               <img src="../../../../assets/images/green-verified.svg" style="height: 20px;" class="m-0"/>
    //               </span> (${item.school.schoolName}
    //              )`;
    //       }
    //       else if(item.isUserVerified && item.isVerified){
    //         schoolInboxChatHeads[schoolInboxChatIndex].innerHTML = `
    //               ${item.userName}  <span class="verified-badge " style="font-size: 90%;">
    //               <img *ngIf="${item.isUserVerified}" src="../../../../assets/images/green-verified.svg" style="height: 20px;" class="m-0"/>
    //                (${item.school.schoolName} <img *ngIf="${item.isVerified}" src="../../../../assets/images/verified-badge.svg" style="height: 20px;" class="m-0"/>
    //              </span>)`;
    //       }
    //       else {
    //             item.userName += `(${item.school.schoolName})`;
    //         }

    //     }

    //     if (item.class != null && !(item.userName.includes('('))) {
    //         item.userName += `(${item.class.className})`;
    //     }

    //     if (item.course != null && !(item.userName.includes('('))) {
    //         item.userName += `(${item.course.courseName})`;
    //     }
    //}

    // schoolIbList.forEach(item => {
    //   let isExist = newList.findIndex(x => x.userID == item.userID);
    //   if (!(isExist >= 0)) {
    //     newList.push(item);
    //   }
    // });
    // this.schoolInboxList = newList;
    // console.log(this.schoolInboxList)
    // console.log("-----")
    this.chatHeadId = this.schoolInboxList[0].chatHeadId;

    unreadChatResponse.next({
      readMessagesCount: this.schoolInboxList[0]?.unreadMessageCount,
      type: 'remove',
    });
    this.schoolInboxList[0].unreadMessageCount = 0;
    if (this.schoolInboxList[0].school != null) {
      this.senderAvatar = this.schoolInboxList[0].school.avatar;
      this.senderName = this.schoolInboxList[0].school.schoolName;
    }

    if (this.schoolInboxList[0].class != null) {
      this.senderAvatar = this.schoolInboxList[0].class.avatar;
      this.senderName = this.schoolInboxList[0].class.className;
    }

    if (this.schoolInboxList[0].course != null) {
      this.senderAvatar = this.schoolInboxList[0].course.avatar;
      this.senderName = this.schoolInboxList[0].course.courseName;
      this.schoolInboxReceiverId = this.schoolInboxList[0].userID;
    }

    this.schoolInboxUserName = this.schoolInboxList[0].userName;
    this.schoolInboxUserAvatar = this.schoolInboxList[0].profileURL;
    this.schoolInboxReceiverId = this.schoolInboxList[0].userID;
    this.chatType = this.schoolInboxList[0].chatType;
    
    // this.topChatViewName = this.schoolInboxList[0].userName
    // this.topChatViewIcon = this.senderAvatar
    this.loadingIcon = false;

    this.topSchoolInboxChatHeadUser = this.schoolInboxList[0];

    // this.schoolChatList.nativeElement.scrollTop = this.schoolChatList.nativeElement.scrollHeight;
    this._chatService
      .getUsersChat(
        this.chatHeadId,
        this.senderId,
        this.schoolInboxList[0].userID,
        this.schoolInboxList[0].chatType,
        10,
        1
      )
      .subscribe((response) => {
        var schoolChats = this.groupBySchoolChat(response);
        this.schoolInboxList[0].chats = schoolChats;
        this.cd.detectChanges();
        this.schoolChatList.nativeElement.scrollTop =
          this.schoolChatList.nativeElement.scrollHeight;

        var dynamicMessages = localStorage.getItem('messages') ?? '';
        if (dynamicMessages != '') {
          var dynamicMessagesArray = JSON.parse(dynamicMessages);
          var isChatHeadExist = dynamicMessagesArray.find(
            (x: { chatHeadId: any }) =>
              x.chatHeadId == this.schoolInboxList[0].chatHeadId
          );
          if (isChatHeadExist != null) {
            this.messageToUser = isChatHeadExist.messageToUser;
          } else {
            this.messageToUser = '';
          }
        }
        if (dynamicMessages == '') {
          var messageList: any = [];
          localStorage.setItem('messages', JSON.stringify(messageList));
        }
        this.selectedChatHeadId = this.schoolInboxList[0].chatHeadId;
      });

    });
  }
    // }
    // else{
    //   this.schoolInboxList[0].chats = null;
    // }
  }

  getUsersChat(
    chatHeadId: string,
    recieverId: string,
    receiverAvatar: string,
    username: string,
    chatType: string,
    From: string,
    pageSize: number,
    pageNumber: number,
    school?: any
  ) {
    debugger;

    
    this.topChatViewIcon=receiverAvatar;
    this.topChatViewName=username;

    if(this.isScreenMobile){
      this.isChatHeadSelected=false;
      this.isChatSelected=true;
    }
    

    
    if(From=="FromMyInbox"){
      this.topChatHeadUser = this.allChatUsers.find((item:any)=>item.chatHeadId == chatHeadId)
      
    }
    if(From=="FromSchoolInbox"){
      this.topSchoolInboxChatHeadUser = this.schoolInboxList.find((item:any)=>item.userID == recieverId)
      let data = this.initialChatUsersData.find((item:any)=>item.userID == recieverId)
    }
    this.topChatViewIsUserVerified = this.topChatHeadUser.isUserVerified;
      this.topChatViewIsSchoolVerified = this.topChatHeadUser.isVerified;

    this.topChatViewChatType=chatType;



    if (this.messageToUser != '') {
      var dynamicMessages = localStorage.getItem('messages') ?? '';
      if (dynamicMessages != '') {
        dynamicMessages = JSON.parse(dynamicMessages);
      }

      var dynamicMessages = localStorage.getItem('messages') ?? '';
      var dynamicMessagesArray = JSON.parse(dynamicMessages);
      var message = {
        chatHeadId: this.selectedChatHeadId,
        messageToUser: this.messageToUser,
      };

      var index = dynamicMessagesArray.findIndex(
        (x: { chatHeadId: string }) => x.chatHeadId == this.selectedChatHeadId
      );
      if (index > -1) {
        dynamicMessagesArray.splice(index, 1);
      }
      dynamicMessagesArray.push(message);
      localStorage.setItem('messages', JSON.stringify(dynamicMessagesArray));
    } else {
      var dynamicMessages = localStorage.getItem('messages') ?? '';
      if (dynamicMessages != '') {
        var dynamicMessagesArray = JSON.parse(dynamicMessages);
        var index = dynamicMessagesArray.findIndex(
          (x: { chatHeadId: string }) => x.chatHeadId == chatHeadId
        );
        if (index > 1) {
          dynamicMessagesArray.splice(index, 1);
          localStorage.setItem(
            'messages',
            JSON.stringify(dynamicMessagesArray)
          );
        }
      }
    }

    var dynamicMessages = localStorage.getItem('messages') ?? '';
    if (dynamicMessages != '') {
      var dynamicMessagesArray = JSON.parse(dynamicMessages);
      var isChatHeadExist = dynamicMessagesArray.find(
        (x: { chatHeadId: string }) => x.chatHeadId == chatHeadId
      );
      if (isChatHeadExist != null) {
        this.messageToUser = isChatHeadExist.messageToUser;
      } else {
        this.messageToUser = '';
      }
    }

    this.selectedChatHeadId = chatHeadId;

    this.loadingIcon = true;
    this.selectedChatHeadDiv = true;
    //var previousChatHeadId = localStorage.getItem("chatHead");
    this.chatHeadId = chatHeadId;
    //localStorage.setItem("chatHead", chatHeadId);

    // here for remove unread message count from chathead and also minus from total count

    var chatUsers: any[] = this.allChatUsers;
    let currentChatHead = chatUsers.find(
      (x) => x.userID == recieverId && x.chatType == chatType
    );
    if (currentChatHead == undefined) {
      var schoolChatUsers: any[] = this.schoolInboxList;
      currentChatHead = schoolChatUsers.find(
        (x) => x.userID == recieverId && x.chatType == chatType
      );
    }
    if (currentChatHead.unreadMessageCount > 0) {
      unreadChatResponse.next({
        readMessagesCount: currentChatHead.unreadMessageCount,
        type: 'remove',
      });
      currentChatHead.unreadMessageCount = 0;
    }

    //document.getElementById('chat')?.addEventListener('scroll', this.myScrollFunction, false);
    // document.getElementById('chat')?.scrollIntoView({
    //   behavior:"smooth",
    // })
    // document.getElementById('chat')?.scrollBy({
    //   top:-100
    // })
    this.clearChat();
    this.usersChatSub = this._chatService
      .getUsersChat(
        chatHeadId,
        this.senderId,
        recieverId,
        Number(chatType),
        pageSize,
        pageNumber
      )
      .subscribe((response) => {
        debugger;
        const groupedItems = response.reduce((acc: any, curr: any) => {
          debugger;
          // const dateTime = new Date(curr.time);
          const date = curr.time.slice(0, 10);
          // const date = dateTime.toISOString().split('T')[0]; // Extracting the date portion
          if (acc[date]) {
            acc[date].push(curr);
          } else {
            acc[date] = [curr];
          }
          return acc;
        }, {});
        var test = groupedItems;
        this.groupedMessages = groupedItems;
        // this.groupedMessages.push(test);
        this.chatHeadId = chatHeadId;
        this.cd.detectChanges();
        console.log(this.groupedMessages);
        if (chatType == '4' && From == 'FromSchoolInbox') {
          this.schoolInboxChatType = '4';
          this.chatType = '4';
          var chatUsers: any[] = this.schoolInboxList;
          let currentChatHead = chatUsers.find(
            (x) =>
              x.user2ID == this.sender.id &&
              x.userID == recieverId &&
              x.chatType == 4
          );
          var schoolChats = this.groupBySchoolChat(response);
          this.schoolInboxList[0].chats = schoolChats;
          this.senderAvatar = currentChatHead.class?.avatar;
          this.senderName = currentChatHead.class?.className;
          this.loadingIcon = false;
          this.schoolInboxUserName = currentChatHead.userName;
          this.schoolInboxUserAvatar = currentChatHead.profileURL;
          this.schoolInboxReceiverId = currentChatHead.userID;
          // this.schoolInboxList[0].school = null;
          // this.schoolInboxList[0].course = null;
          // this.schoolInboxList[0].class = currentChatHead.class;
        } else {
          if (chatType == '3' && From == 'FromSchoolInbox') {
            //   if(school.ownerId == this.senderId){
            //   this.getSelectedSchoolInbox(school.schoolId);
            //  }
            //  else{
            this.schoolInboxChatType = '3';
            this.chatType = '3';
            var schoolChats = this.groupBySchoolChat(response);
            this.schoolInboxList[0].chats = schoolChats;
            this.senderAvatar = currentChatHead.school.avatar;
            this.senderName = currentChatHead.school.schoolName;
            this.loadingIcon = false;
            this.schoolInboxUserName = currentChatHead.userName;
            this.schoolInboxUserAvatar = currentChatHead.profileURL;
            this.schoolInboxReceiverId = currentChatHead.userID;
            // }
          } else {
            if (chatType == '5' && From == 'FromSchoolInbox') {
              this.schoolInboxChatType = '5';
              this.chatType = '5';
              var schoolChats = this.groupBySchoolChat(response);
              this.schoolInboxList[0].chats = schoolChats;
              this.senderAvatar = currentChatHead.course.avatar;
              this.senderName = currentChatHead.course.courseName;
              this.loadingIcon = false;
              this.schoolInboxUserName = currentChatHead.userName;
              this.schoolInboxUserAvatar = currentChatHead.profileURL;
              this.schoolInboxReceiverId = currentChatHead.userID;
              // this.schoolInboxList[0].school = null;
              // this.schoolInboxList[0].course = currentChatHead.course;
              // this.schoolInboxList[0].class = null;
            } else {
              this.userChats = response;
              this.recieverId = recieverId;
              this.userName = username;
              this.receiverAvatar = receiverAvatar;
              this.receiverName = username;
              this.chatType = chatType;
              this.profileURL = this.sender.avatar;
              this.loadingIcon = false;

              if (!this.firstuserChats || this.firstuserChats.length == 0)
                this.firstuserChats = response;
              // her from grouping
              else this.firstuserChats = {};
              response.forEach((item: any) => {
                const date = item.time.slice(0, 10);
                // const dateTime = new Date(item.time);
                // const date = dateTime.toISOString().split('T')[0];
                if (this.firstuserChats[date]) {
                  this.firstuserChats[date].push(item);
                } else {
                  this.firstuserChats[date] = [item];
                }
              });

              // this.firstuserChats = this.userChats.concat(this.firstuserChats);
              // this.firstuserChats = this.userChats;
            }
            this.cd.detectChanges();
            this.chatList.nativeElement.scrollTop =
              this.chatList.nativeElement.scrollHeight;
          }
        }

        //  if(chatType == "5" && From=="FromSchoolInbox"){
        //   this.schoolInboxList[0].chats = response;
        //   this.senderAvatar = currentChatHead.course.avatar;
        //   this.senderName = currentChatHead.course.courseName;
        //   // this.schoolInboxList[0].school = null;
        //   // this.schoolInboxList[0].course = currentChatHead.course;
        //   // this.schoolInboxList[0].class = null;
        //  }
        //  else{
        //   this.userChats = response;
        //  }
      });
      debugger
      //this.ngOnInit();
  }

  pinUnpinChat(recieverId: string, chatType: string, isPinned: boolean) {
    this.isPinned = isPinned;
    var chatUsers: any[] = this.allChatUsers;

    var currentUser = chatUsers.find(
      (x) => x.userID == recieverId && x.chatType == chatType
    );
    const index = this.allChatUsers.indexOf(currentUser);
    if (index > -1) {
      this.allChatUsers.splice(index, 1);
    }
    if (!this.isPinned) {
      currentUser.isPinned = false;
    }
    this.allChatUsers.unshift(currentUser);
    this.usersChatSub = this._chatService
      .pinUnpinChat(this.senderId, recieverId, Number(chatType))
      .subscribe((response) => {
        var isPinned = response;
      });
  }
  InitializeChatViewModel() {
    this.chatViewModel = {
      chatHeadId: '',
      sender: '',
      receiver: '',
      chatType: 0,
      chatTypeId: '',
      message: '',
      replyMessageId: '',
      replyChatContent: '',
      replyMessageType: 0,
      fileName: '',
      fileURL: '',
      isForwarded: false,
      forwardedFileName: null,
      forwardedFileURL: null,
      forwardedFileType: null,
      attachments: [],
      schoolId: null,
    };
  }

  handleImages(event: any) {
    this.exceedUploadFileSize = false;
    this.selectedFile = event.target.files;
    var formData = new FormData();
    for (var i = 0; i < this.selectedFile.length; i++) {
      const maxSizeInBytes: number = 25 * 1024 * 1024;

      if (this.selectedFile[i].size > maxSizeInBytes) {
        this.exceedUploadFileSize = true;
        return;
      }
      formData.append('file', this.selectedFile[i]);
    }
    this.disabledSendButton = true;
    formData.append('fileType', '1');
    this._chatService
      .saveChatAttachments(formData)
      .subscribe((response: any) => {
        response.forEach((item: any) => {
          this.uploadImage.push(item);
        });
        this.disabledSendButton = false;
        formData = new FormData();
        this.selectedFile = [];
        this.invalidMessage = false;
      });
  }

  // handleVideos(event: any) {
  //   this.selectedFile = event.target.files;
  //   var formData = new FormData();
  //   for(var i=0; i<this.selectedFile.length; i++){
  //     formData.append('file', this.selectedFile[i]);
  //  }

  //   formData.append('fileType', '2');

  //     this._chatService.saveChatAttachments(formData).subscribe((response : any) => {
  //       response.forEach((item: any) => {
  //         this.uploadVideos.push(item);
  //       });
  //       formData = new FormData();
  //       this.selectedFile = [];
  //       this.invalidMessage = false;
  // });

  // }

  handleVideos(event: any) {
    this.exceedUploadFileSize = false;
    this.initializeVideoObject();
    this.selectedFile = event.target.files;
    var formData = new FormData();
    for (let i = 0; i < this.selectedFile.length; i++) {
      // this.videos.push(selectedFiles[i]);
      const file = this.selectedFile[i];
      const maxSizeInBytes: number = 25 * 1024 * 1024;

      if (file.size > maxSizeInBytes) {
        // File size exceeds the limit, handle the error as per your requirement
        this.exceedUploadFileSize = true;
        return;
        // Reset the file input field
      }
      this.disabledSendButton = true;
      formData.append('file', this.selectedFile[i]);
      const videoUrl = URL.createObjectURL(file);
      this.getVideoThumbnail(videoUrl, file.name, (thumbnailUrl) => {
        this.videoObject.videoUrl = thumbnailUrl;
        this.videoObject.name = file.name;
        this.videoObject.type = file.type;
        this.uploadVideo.push(this.videoObject);
        this.initializeVideoObject();
      });
    }
    formData.append('fileType', '2');

    this._chatService
      .saveChatAttachments(formData)
      .subscribe((response: any) => {
        response.forEach((item: any) => {
          this.uploadVideos.push(item);
        });
        formData = new FormData();
        this.selectedFile = [];
        this.invalidMessage = false;
        this.disabledSendButton = false;
      });
  }

  initializeVideoObject() {
    this.videoObject = {
      videoUrl: '',
      name: '',
      type: '',
    };
  }

  getVideoThumbnail(
    videoUrl: string,
    fileName: string,
    callback: (thumbnailUrl: string) => void
  ) {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = videoUrl;
    video.currentTime = 4;
    video.addEventListener('loadedmetadata', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      video.addEventListener('seeked', () => {
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL();

        this.saveCanvasToFile(canvas, fileName);
        callback(thumbnailUrl);
      });
      video.currentTime = 4;
    });
  }

  async saveCanvasToFile(canvas: HTMLCanvasElement, fileName: string) {
    const blob = await this.canvasToBlob(canvas);

    let lastSlashIndex = blob.type.lastIndexOf('/');
    if (lastSlashIndex !== -1) {
      var thumbnailType = blob.type.substring(lastSlashIndex + 1);
    }

    let lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      fileName = fileName.substring(0, lastDotIndex + 1);
    }

    fileName = fileName + thumbnailType;

    const file = new File([blob], fileName, { type: blob.type });
    // this.videoThumbnails.push(file);
  }

  canvasToBlob(canvas: HTMLCanvasElement): Promise<any> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      });
    });
  }

  handleAttachments(event: any) {
    this.exceedUploadFileSize = false;
    this.selectedFile = event.target.files;
    var formData = new FormData();
    for (var i = 0; i < this.selectedFile.length; i++) {
      const maxSizeInBytes: number = 25 * 1024 * 1024;
      if (this.selectedFile[i].size > maxSizeInBytes) {
        this.exceedUploadFileSize = true;
        return;
      }
      formData.append('file', this.selectedFile[i]);
    }
    this.disabledSendButton = true;
    formData.append('fileType', '3');

    this._chatService
      .saveChatAttachments(formData)
      .subscribe((response: any) => {
        response.forEach((item: any) => {
          this.uploadAttachments.push(item);
        });
        this.disabledSendButton = false;
        formData = new FormData();
        this.selectedFile = [];
        this.invalidMessage = false;
      });
  }

  removeUploadFile(fileURL: any) {
    this.disabledSendButton = false;
    if (this.uploadImage != undefined) {
      const index = this.uploadImage.findIndex(
        (item: any) => item.fileURL === fileURL
      );
      if (index > -1) {
        this.uploadImage.splice(index, 1);
        this.invalidMessage = true;
      }
    }

    if (this.uploadVideos != undefined) {
      const videoIndex = this.uploadVideos.findIndex(
        (item: any) => item.fileName === fileURL
      );
      const uploadVideoIndex = this.uploadVideo.findIndex(
        (item: any) => item.name === fileURL
      );
      if (uploadVideoIndex > -1) {
        this.uploadVideo.splice(videoIndex, 1);
      }
      if (videoIndex > -1) {
        const existVideo = this.uploadVideos.find(
          (item: any) => item.fileName === fileURL
        );
        fileURL = existVideo.fileURL;
        this.uploadVideos.splice(videoIndex, 1);
        this.invalidMessage = true;
      }
    }

    if (this.uploadAttachments != undefined) {
      const attachmentIndex = this.uploadAttachments.findIndex(
        (item: any) => item.fileURL === fileURL
      );
      if (attachmentIndex > -1) {
        this.uploadAttachments.splice(attachmentIndex, 1);
        this.invalidMessage = true;
      }
    }
    this._chatService
      .removeChatAttachment(fileURL)
      .subscribe((response: any) => {});
  }

  getTextMessage(event: any, receiverId: string) {
    if (this.messageToUser == '') {
      this.invalidMessage = true;
    } else {
      this.invalidMessage = false;
      if (
        event.code == 'Enter' ||
        event.keyCode === 13 ||
        event.keyCode === 108
      ) {
        this.sendToUser(receiverId);
      }
    }
  }

  sendToUser(receiverId: string) {
    debugger;
    var chatTypeId = '';
    this.isSubmitted = false;
    this.InitializeChatViewModel();
    if (receiverId == undefined) {
      receiverId = this.senderID;
    }

    var users: any[] = this.allChatUsers;
    var user = users.find(
      (x) =>
        x.userID == receiverId &&
        x.chatType == this.chatType
        // x.chatHeadId == this.chatHeadId
    );
    if (this.isForwarded == true) {
      this.chatViewModel.isForwarded = this.isForwarded;
      this.chatViewModel.forwardedFileName = this.forwardedFileName == undefined ? null : this.forwardedFileName;
      this.chatViewModel.forwardedFileURL = this.forwardedFileURL == undefined ? null: this.forwardedFileURL;
      this.chatViewModel.forwardedFileType = this.forwardedFileType == undefined ? null: this.forwardedFileType;

      // 
    }
    if (user != undefined) {
      this.receiverInfo = user;
      if (this.replyMessageId != '') {
        this.chatViewModel.replyMessageId = this.replyMessageId;
      } else {
        this.chatViewModel.replyMessageId = null;
      }
      if (this.receiverInfo.school != null) {
        this.chatViewModel.chatTypeId = this.receiverInfo?.school.schoolId;
        chatTypeId = this.receiverInfo?.school.schoolId;
      }
      if (this.receiverInfo.class != null) {
        this.chatViewModel.chatTypeId = this.receiverInfo?.class.classId;
        this.chatViewModel.schoolId = this.receiverInfo?.class.schoolId;
        chatTypeId = this.receiverInfo?.class.classId;
      }
      if (this.receiverInfo.course != null) {
        this.chatViewModel.chatTypeId = this.receiverInfo?.course.courseId;
        this.chatViewModel.schoolId = this.receiverInfo?.course.schoolId;
        chatTypeId = this.receiverInfo?.course.courseId;
      }
      // this.chatViewModel.chatTypeId = this.receiverInfo?.chatTypeId;
      if (
        this.receiverInfo.school?.ownerId == this.sender.id ||
        this.receiverInfo.school?.createdById == this.sender.id
      ) {
        this.isSchoolOwner = true;
        this.chatViewModel.chatTypeId = this.receiverInfo.school.schoolId;
        chatTypeId = this.receiverInfo.school.schoolId;
      } else {
        if (this.receiverInfo.class?.createdById == this.sender.id) {
          this.isSchoolOwner = true;
          this.chatViewModel.chatTypeId = this.receiverInfo.school.schoolId;
          chatTypeId = this.receiverInfo.school.schoolId;
        } else {
          if (this.receiverInfo.course?.createdById == this.sender.id) {
            this.isSchoolOwner = true;
            this.chatViewModel.chatTypeId = this.receiverInfo.school.schoolId;
            chatTypeId = this.receiverInfo.school.schoolId;
          }
          this.isSchoolOwner = false;
        }
      }
    }

    if (user == undefined) {
      if (this.replyMessageId != '') {
        this.chatViewModel.replyMessageId = this.replyMessageId;
      } else {
        this.chatViewModel.replyMessageId = null;
      }
      var schoolUsers: any[] = this.schoolInboxList;
      if (schoolUsers != undefined && this.chatType == '3') {
        user = schoolUsers.find(
          (x) =>
            x.userID == receiverId &&
            x.chatType == this.chatType &&
            x.chatHeadId == this.chatHeadId
        );
        this.receiverInfo = user;
        this.chatViewModel.chatTypeId = this.receiverInfo?.school?.schoolId;
        chatTypeId = this.receiverInfo?.school?.schoolId;
        if (
          this.receiverInfo.school?.ownerId == this.sender.id ||
          this.receiverInfo.school?.createdById == this.sender.id
        ) {
          this.isSchoolOwner = true;
        } else {
          this.isSchoolOwner = false;
        }
      }
      var classUsers: any[] = this.classInboxList;
      if (classUsers != undefined && this.chatType == '4') {
        user = classUsers.find(
          (x) =>
            x.userID == receiverId &&
            x.chatType == this.chatType &&
            x.chatHeadId == this.chatHeadId
        );
        this.receiverInfo = user;
        this.chatViewModel.chatTypeId = this.receiverInfo?.class?.classId;
        this.chatViewModel.schoolId = this.receiverInfo?.class?.schoolId;
        chatTypeId = this.receiverInfo?.class?.classId;
        if (
          this.receiverInfo.class?.ownerId == this.sender.id ||
          this.receiverInfo.class?.createdById == this.sender.id
        ) {
          this.isSchoolOwner = true;
        } else {
          this.isSchoolOwner = false;
        }
      }

      var courseUsers: any[] = this.courseInboxList;
      if (courseUsers != undefined && this.chatType == '5') {
        user = courseUsers.find(
          (x) =>
            x.userID == receiverId &&
            x.chatType == this.chatType &&
            x.chatHeadId == this.chatHeadId
        );
        this.receiverInfo = user;
        this.chatViewModel.chatTypeId = this.receiverInfo?.course?.courseId;
        this.chatViewModel.schoolId = this.receiverInfo?.course?.courseId;
        chatTypeId = this.receiverInfo?.course?.courseId;
        if (
          this.receiverInfo.course?.ownerId == this.sender.id ||
          this.receiverInfo.course?.createdById == this.sender.id
        ) {
          this.isSchoolOwner = true;
        } else {
          this.isSchoolOwner = false;
        }
      }
    }

    if (this.messageToUser != '') {
      user.lastMessage = this.messageToUser;
      user.time = new Date().toISOString().slice(0, -1);
    } else {
      if (this.forwardedFileName != undefined) {
        user.lastMessage = this.forwardedFileName;
        user.time = new Date().toISOString().slice(0, -1);
      } else {
        var attachments = [
          ...this.uploadImage,
          ...this.uploadVideos,
          ...this.uploadAttachments,
        ];
        user.lastMessage = attachments[0].fileName;
      }
    }

    if (this.uploadImage || this.uploadVideos) {
      if (!this.chatViewModel.attachments) {
        this.chatViewModel.attachments = [];
      }

      this.chatViewModel.attachments = [
        ...this.uploadImage,
        ...this.uploadVideos,
        ...this.uploadAttachments,
      ];

      if (
        this.chatViewModel.attachments.length == 0 &&
        this.messageToUser == '' &&
        this.forwardedFileName == undefined
      ) {
        this.invalidMessage = true;
        return;
      }
    }
    // if(this.userId ==""){
    //   this.userId = receiverId;
    // }

    this.userId = receiverId;

    this.chatheadSub = this._chatService
      .getChatHead(
        this.senderId,
        this.userId,
        Number(this.chatType),
        chatTypeId
      )
      .subscribe((response) => {
        debugger;
        this.chatViewModel.sender = this.senderId;
        this.chatViewModel.receiver = this.userId;

        if (response == null) this.chatViewModel.chatHeadId = response;
        else this.chatViewModel.chatHeadId = response.id;

        this.chatViewModel.message = this.messageToUser;
        this.chatViewModel.chatType = Number(this.chatType);
        if (this.chatViewModel.chatTypeId != '') {
          this.chatViewModel.chatTypeId = this.chatViewModel.chatTypeId;
        } else {
          this.chatViewModel.chatTypeId = null;
        }

        // var notificationContent = "sent you a message";
        // this._notificationService.initializeNotificationViewModel(receiverId,NotificationType.Messages,notificationContent,this.senderId,null,0,null,null, this.chatViewModel.chatType,this.chatViewModel.chatTypeId).subscribe((response) => {
        // });

        this.chatViewModel.fileName = this.fileName;
        this.chatViewModel.replyMessageType = this.replyMessageType;
        this.chatViewModel.replyChatContent = this.replyChat;
        this.chatViewModel.fileURL = this.fileURL;
        this._signalRService.sendToUser(this.chatViewModel);
        if (this.isForwarded) {
          const translatedInfoSummary =
            this.translateService.instant('Success');
          const translatedMessage = this.translateService.instant(
            'MessageForwardedSuccessfully'
          );
          this.messageService.add({
            severity: 'success',
            summary: translatedInfoSummary,
            life: 3000,
            detail: translatedMessage,
          });
        }
        this.chatViewModel = new Object() as ChatViewModel;

        var result = {
          receiver: this.sender.firstName + ' ' + this.sender.lastName,
          message: this.messageToUser,
          isTest: false,
          receiverId: this.sender.id,
          isSchoolOwner: this.isSchoolOwner,
          receiverName: this.recieverId,
        };
        if (this.isSchoolOwner && this.chatType == '3') {
          result.receiver = this.receiverInfo.school.schoolName;
          this.generateChatLi(
            result,
            this.receiverInfo.school.avatar,
            this.chatType
          );
        } else {
          if (this.isSchoolOwner && this.chatType == '4') {
            result.receiver = this.receiverInfo.class.className;
            this.generateChatLi(
              result,
              this.receiverInfo.class.avatar,
              this.chatType
            );
          } else {
            if (this.isSchoolOwner && this.chatType == '5') {
              result.receiver = this.receiverInfo.course.courseName;
              this.generateChatLi(
                result,
                this.receiverInfo.course.avatar,
                this.chatType
              );
            } else {
              this.generateChatLi(result, this.sender.avatar, this.chatType);
            }
          }
        }
        this.uploadImage = [];
        this.uploadVideo = [];
        this.uploadVideos = [];
        this.uploadAttachments = [];
        if (!this.isForwarded) {
          this.messageToUser = '';
          var dynamicMessages = localStorage.getItem('messages') ?? '';
          var dynamicMessagesArray = JSON.parse(dynamicMessages);
          var index = dynamicMessagesArray.findIndex(
            (x: { chatHeadId: string }) => x.chatHeadId == this.chatHeadId
          );
          if (index > -1) {
            dynamicMessagesArray.splice(index, 1);
            localStorage.setItem(
              'messages',
              JSON.stringify(dynamicMessagesArray)
            );
          }
        }
        this.isSubmitted = true;
        this.replyMessageType = null;
        this.isForwarded = false;
       debugger
        const userIndex = this.allChatUsers.findIndex((x: { chatHeadId: string; }) => x.chatHeadId === this.chatHeadId);
        if (userIndex !== -1) {
          const user = this.allChatUsers.find((x: { chatHeadId: string; }) => x.chatHeadId === this.chatHeadId);
          if(!user.isPinned){
            let insertIndex = this.allChatUsers.findIndex((x: { isPinned: boolean; }) => x.isPinned === false);
            if (insertIndex === -1) {
              insertIndex = this.allChatUsers.length;
            }
            const userToMove = this.allChatUsers.splice(userIndex, 1)[0];
            this.allChatUsers.splice(insertIndex, 0, userToMove);
          }
        }
        if(this.schoolInboxList != undefined){
        const schoolIndex = this.schoolInboxList?.findIndex((x: { chatHeadId: string; }) => x.chatHeadId === this.chatHeadId);
        if (schoolIndex !== -1) {
          const userToMove = this.schoolInboxList.splice(schoolIndex, 1)[0];
          this.schoolInboxList.unshift(userToMove);
        }
      }


        //  setTimeout(() => {
        //   this.replyChat =  "";
        // }, 5000);
      });
  }

  saveSentMessage(chatViewModel: ChatViewModel) {
    this.formData.append('sender', chatViewModel.sender);
  }

  generateChatLi(response: any, profileImage: string, chatType: string) {
    debugger;
    this.cd.detectChanges();
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // Add 1 because getUTCMonth() returns a zero-based index
    const day = date.getUTCDate();

    const today = `${year}-${month.toString().padStart(2, '0')}-${day
      .toString()
      .padStart(2, '0')}`;

    if (this.forwardedId != '') {
      if (this.forwardedId == response.receiverName) {
        this.isGenerateChatLi = true;
      } else {
        this.isGenerateChatLi = false;
      }
    } else {
      this.isGenerateChatLi = true;
    }

    if (this.isGenerateChatLi) {
      var isFromReciever = 'you';
      const p: HTMLParagraphElement = this.renderer.createElement('p');
      if (!response.isTest) {
        isFromReciever = 'me';
      }

      var userChat = {
        id: response.id != null ? response.id : null,
        sendByMe: isFromReciever == 'me' ? true : false,
        text: response.message,
        time: new Date().toISOString().slice(0, -1),
        attachment: [],
        replyMessageType:
          this.replyMessageType == null
            ? response.replyMessageType
            : this.replyMessageType,
        replyChatContent:
          this.replyChat == '' ? response.replyChatContent : this.replyChat,
        fileName:
          this.fileName == '' ? response.replyChatContent : this.replyChat,
        isForwarded:
          response.isForwarded != undefined
            ? response.isForwarded
            : this.isForwarded,
        forwardedFileName:
          response.forwardedFileName != undefined
            ? response.forwardedFileName
            : this.forwardedFileName,
        forwardedFileURL:
          response.forwardedFileURL != undefined
            ? response.forwardedFileURL
            : this.forwardedFileURL,
        forwardedFileType:
          response.forwardedFileType != undefined
            ? response.forwardedFileType
            : this.forwardedFileType,
      };
      debugger;
      if (chatType == '1' || (chatType == '3' && !response.isSchoolOwner) || (chatType == '4' && !response.isSchoolOwner) || (chatType == '5' && !response.isSchoolOwner)) {
        const chatExists = this.firstuserChats.hasOwnProperty(today);
        if (chatExists) {
          this.firstuserChats[today].push(userChat);
        } else {
          this.firstuserChats[today] = [userChat];
        }

        // this.firstuserChats.push(userChat);
        var attachments = this.firstuserChats[today].slice(-1)[0];
      } else {
        var a = this.schoolInboxList;
        // this.schoolInboxList.find(x => x.)

        const chatExists = this.schoolInboxList[0].chats.hasOwnProperty(today);
        if (chatExists) {
          this.schoolInboxList[0].chats[today].push(userChat);
        } else {
          this.schoolInboxList[0].chats[today] = [userChat];
        }

        // this.firstuserChats.push(userChat);
        var attachments = this.schoolInboxList[0].chats[today].slice(-1)[0];

        // this.schoolInboxList[0].chats.push(userChat);
        // var attachments = this.firstuserChats.slice(-1)[0];
      }

      var imageHtml = '';
      if (this.uploadImage != undefined) {
        for (var i = 0; i < this.uploadImage.length; i++) {
          // var obj = {
          //   sendByMe: isFromReciever == 'me'?true : false,
          //   text:response.message,
          //   time:new Date(),
          //   attachment: [{fileType:1,fileName:this.uploadImage[i].fileName, fileURL:this.uploadImage[i].fileURL}]
          // }

          // this.firstuserChats.push(obj);

          // imageHtml += `<div class="img-attach me-2 d-inline-block cursor-pointer"
          //  >
          // <img (click)="showFullChatImage('${this.uploadImage[i].fileName}', '${this.uploadImage[i].fileURL}')" src="${this.uploadImage[i].fileURL}" />
          // </div>`;

          var objImage = {
            fileType: 1,
            fileName: this.uploadImage[i].fileName,
            fileURL: this.uploadImage[i].fileURL,
          };
          attachments.attachment.push(objImage);
        }
      }

      var videoHtml = '';
      if (this.uploadVideos != undefined) {
        for (var i = 0; i < this.uploadVideos.length; i++) {
          //     videoHtml += `<span>
          //    <div class="videofile cursor-pointer" data-bs-toggle="modal"
          //    data-bs-target="#chat-video" (click)="showFullChatVideo('${this.uploadVideos[i].fileName}', '${this.uploadVideos[i].fileURL}')">
          //      <video preload="metadata" style="height: 300px;">
          //        <source src="${this.uploadVideos[i].fileURL}" type="video/mp4"/>
          //      </video>
          //    </div>
          //  </span>`
          var objVideo = {
            fileType: 2,
            fileName: this.uploadVideos[i].fileName,
            fileURL: this.uploadVideos[i].fileURL,
          };
          attachments.attachment.push(objVideo);
        }
      }

      var attachmentHtml = '';
      if (this.uploadAttachments != undefined) {
        for (var i = 0; i < this.uploadAttachments.length; i++) {
          //     attachmentHtml += `<div class="teacher-tags hashtag_post tag-boxattachment-outer mt-1 mb-0 hover-tags">
          //    <span class="custom-tag"><img src="../../../assets/images/Paper-gray.svg" class="me-1 dark-svg"> <img
          //        src="../../../assets/images/Paper-light.svg" class="me-1 light-svg"> ${this.uploadAttachments[i].fileName}</span>
          //  </div>`

          var objAttachment = {
            fileType: 3,
            fileName: this.uploadAttachments[i].fileName,
            fileURL: this.uploadAttachments[i].fileURL,
          };
          attachments.attachment.push(objAttachment);
        }

        var li =
          `<li class="${isFromReciever}">
    <div class="chat-username d-flex align-items-center mb-2">
      <img style="max-height: 35px;" src="${profileImage}" alt="" class="rounded-circle me-2">
      <h2 class="mb-0 font_16 fw_600 text_sec1">${response.receiver}</h2>
    </div>
    <div class="message">
     ${response.message}
    </div>` +
          attachmentHtml +
          `
    <div class="message-time text-end text_ltgray font_12">
      11:56
    </div>

    <div class="gallery-attch mt-2">
    <div class="img-attach me-2 d-inline-block cursor-pointer">` +
          imageHtml +
          videoHtml +
          `</div>
    </div>

    <div class="forward-reply">
      <button type="button" class="forward-btn">Answer <img src="../../../assets/images/answer-forward-icon.svg"
          class="ms-2" /></button><br />
      <button type="button" class="forward-btn">Forward <img src="../../../assets/images/forward-icon.svg"
          class="ms-2" /></button>
    </div>
  </li>
  <div class="text-line-border position-relative text-center">
  <span class="line-text font_12 text_ltgray fw_400 text-center"></span>
</div>`;
        // p.innerHTML =li;
        this.recieverMessageInfo = response;
        this.renderer.appendChild(this.chatList.nativeElement, p);
        if (chatType == '3' && response.isSchoolOwner) {
          document.getElementById('chats')?.appendChild(p);
          this.cd.detectChanges();
          this.schoolChatList.nativeElement.scrollTop =
            this.schoolChatList.nativeElement.scrollHeight;
          return;
        }
        if (chatType == '4' && response.isSchoolOwner) {
          document.getElementById('chats')?.appendChild(p);
          this.cd.detectChanges();
          this.schoolChatList.nativeElement.scrollTop =
            this.schoolChatList.nativeElement.scrollHeight;
          return;
        }

        if (chatType == '5' && response.isSchoolOwner) {
          document.getElementById('chats')?.appendChild(p);
          this.cd.detectChanges();
          this.schoolChatList.nativeElement.scrollTop =
            this.schoolChatList.nativeElement.scrollHeight;
          return;
        }
        if (response.receiverName == this.recieverId) {
          document.getElementById('chat')?.appendChild(p);
        }

        console.log(response);
      }
    }

    this.cd.detectChanges();
    this.chatList.nativeElement.scrollTop =
      this.chatList.nativeElement.scrollHeight;
    this.forwardedId = '';
  }

  showFullChatImage(fileName: string, fileUrl: string): any {
    this.fullSizeImageName = fileName;
    this.fullSizeImageUrl = fileUrl;
    this.cd.detectChanges();
    return fileUrl;
  }

  showFullChatVideo(fileName: string, fileUrl: string) {
    const initialState = {
      fileUrl: fileUrl,
      fileName: fileName,
    };
    this.bsModalService.show(ChatVideoComponent, { initialState });
  }

  showMyInboxDiv() {
    this.showMyInbox = true;
    this.showMySchoolInbox = false;
    this.chatType = this.allChatUsers[0].chatType;
    
    this.topChatViewIcon=this.allChatUsers[0]?.profileURL;
    this.topChatViewName=this.allChatUsers[0].userName;
    this.topChatViewIsSchoolVerified=this.allChatUsers[0].isVerified;
    this.topChatViewIsUserVerified=this.allChatUsers[0].isUserVerified;
    this.topChatViewChatType = this.allChatUsers[0].chatType;
  }

  showSchoolInboxDiv() {
    debugger;
    this.chatType = this.schoolInboxList[0].chatType;
  }

  back(): void {
    if(this.isScreenPc) window.history.back();
    else if(this.isScreenMobile){
      if(!this.isChatHeadSelected && this.isChatSelected){
        this.isChatHeadSelected=true;
        this.isChatSelected=false;
      }
      else{
        window.history.back();
      }
    }
  }

  openSidebar() {
    OpenSideBar.next({ isOpenSideBar: true });
  }

  @HostListener('scroll', ['$event'])
  scrollHandler(event: any) {
    debugger;
    const element = event.target; // get the scrolled element
    const scrollPosition = element.scrollHeight - element.scrollTop;
  const isScrollAtBottom = scrollPosition >= element.scrollHeight - element.clientHeight;
    // if (element.scrollHeight - element.scrollTop >= element.clientHeight) {
      if (isScrollAtBottom && !this.chatHeadScrolled && this.scrollChatHeadsResponseCount != 0) {
        this.chatHeadScrolled = true;
        this.chatHeadsLoadingIcon = true;
        this.chatHeadsPageNumber++;
        this.getNextChatHeads();
      }
    // }
  }

  getNextChatHeads() {
    debugger
    this._chatService
      .getAllChatUsers(
        this.senderId,
        this.chatHeadsPageNumber,
        this.searchString
      )
      .subscribe((response) => {
        this.allChatUsers = [...this.allChatUsers, ...response];
        this.chatHeadsLoadingIcon = false;
        this.cd.detectChanges();
        this.scrollChatHeadsResponseCount = response.length;
        this.chatHeadScrolled = false;

        const chatList = this.chatHeadsScrollList.nativeElement;
        const chatListHeight = chatList.scrollHeight;
        this.chatHeadsScrollList.nativeElement.scrollTop =
          this.chatHeadsScrollList.nativeElement.clientHeight;
        const scrollOptions = {
          duration: 300,
          easing: 'ease-in-out',
        };
        chatList.scrollTo({
          top: this.chatHeadsScrollList.nativeElement.scrollTop,
          left: 0,
          ...scrollOptions,
        });
      });
  }

  chatHeadsSearch() {
    this.chatHeadsPageNumber = 1;
    if (this.searchString.length > 2 || this.searchString == '') {
      this._chatService
        .getAllChatUsers(
          this.senderId,
          this.chatHeadsPageNumber,
          this.searchString
        )
        .subscribe((response) => {
          // this.filteredList = this.mainList.filter((item: { property: any; }) => this.filterList.includes(item.property));
          // response = response.filter( (x: { chatHeadId: any; }) => !this.schoolInboxList.includes(x.chatHeadId));

          response = response.filter((item: { chatHeadId: any }) => {
            const isMatch = this.schoolInboxList.some(
              (filterItem: { chatHeadId: any }) =>
                filterItem.chatHeadId === item.chatHeadId
            );
            return !isMatch;
          });

          this.allChatUsers = response;
          // here i will
          this.firstuserChats = {};
          response[0].chats.forEach((item: any) => {
            const date = item.time.slice(0, 10);
            // const dateTime = new Date(item.time);
            // const date = dateTime.toISOString().split('T')[0];
            if (this.firstuserChats[date]) {
              this.firstuserChats[date].push(item);
            } else {
              this.firstuserChats[date] = [item];
            }
          });
          // this.firstuserChats = response[0].chats;
        });
    }
  }

  @HostListener('scroll', ['$event'])
  scrollChatHandler(event: any) {
    const element = event.target;
    if (element.scrollTop === 0) {
      if (!this.chatsScrolled && this.scrollChatsResponseCount != 0) {
        this.chatsScrolled = true;
        this.chatsLoadingIcon = true;
        this.chatsPageNumber++;
        this.getNextChats();
      }
    }
  }

  getNextChats() {
    this._chatService
      .getUsersChat(
        this.chatHeadId,
        this.senderId,
        this.recieverId,
        Number(this.chatType),
        7,
        this.chatsPageNumber
      )
      .subscribe((response) => {
        response.forEach((item: any) => {
          const date = item.time.slice(0, 10);
          // const dateTime = new Date(item.time);
          // const date = dateTime.toISOString().split('T')[0];
          if (this.firstuserChats[date]) {
            this.firstuserChats[date].push(item);
          } else {
            this.firstuserChats[date] = [item];
          }
        });
        var a = this.firstuserChats;
        // this.firstuserChats = response.concat(this.firstuserChats);
        this.cd.detectChanges();
        this.chatsLoadingIcon = false;
        this.scrollChatsResponseCount = response.length;
        this.chatsScrolled = false;
        // Scroll to the bottom of the chat list with animation
        const chatList = this.chatList.nativeElement;
        const chatListHeight = chatList.scrollHeight;
        this.chatList.nativeElement.scrollTop =
          this.chatList.nativeElement.clientHeight;
        const scrollOptions = {
          duration: 300,
          easing: 'ease-in-out',
        };
        chatList.scrollTo({
          top: this.chatList.nativeElement.scrollTop,
          left: 0,
          ...scrollOptions,
        });
      });
  }

  @HostListener('scroll', ['$event'])
  scrollSchoolChatHandler(event: any) {
    const element = event.target;
    if (element.scrollTop === 0) {
      if (
        !this.schoolChatsScrolled &&
        this.scrollSchoolChatsResponseCount != 0 &&
        this.schoolInboxList[0].chats != null
      ) {
        this.schoolChatsScrolled = true;
        this.schoolChatsLoadingIcon = true;
        this.schoolChatsPageNumber++;
        this.getNextSchoolChats();
      }
    }
  }

  getNextSchoolChats() {
    this._chatService
      .getUsersChat(
        this.chatHeadId,
        this.senderId,
        this.schoolInboxList[0].userID,
        Number(this.chatType),
        7,
        this.schoolChatsPageNumber
      )
      .subscribe((response) => {
        var schoolChats = this.groupBySchoolChat(response);
        //  this.schoolInboxList[0].chats = response.concat(this.schoolInboxList[0].chats);
        this.schoolInboxList[0].chats = schoolChats;
        this.cd.detectChanges();
        this.schoolChatsLoadingIcon = false;
        this.scrollSchoolChatsResponseCount = response.length;
        this.schoolChatsScrolled = false;
        // Scroll to the bottom of the chat list with animation
        const chatList = this.schoolChatList.nativeElement;
        const chatListHeight = chatList.scrollHeight;
        this.schoolChatList.nativeElement.scrollTop =
          this.schoolChatList.nativeElement.clientHeight;
        const scrollOptions = {
          duration: 300,
          easing: 'ease-in-out',
        };
        chatList.scrollTo({
          top: this.schoolChatList.nativeElement.scrollTop,
          left: 0,
          ...scrollOptions,
        });
      });
  }

  openCertificateViewModal(fileUrl: string, fileName: string) {
    const initialState = {
      certificateUrl: fileUrl,
      certificateName: fileName,
      from: 6,
    };
    this.bsModalService.show(CertificateViewComponent, { initialState });
  }

  chatReply(userChat: any) {
    this.replyChat = userChat.text;
    this.replyMessageId = userChat.id;
    this.replyMessageType = 0;
    this.cd.detectChanges();
  }

  chatAttachmentReply(
    replyMessageId: string,
    fileName: string,
    fileURL: string,
    fileType: number
  ) {
    this.fileName = fileName;
    this.fileURL = fileURL;
    this.replyMessageId = replyMessageId;
    this.replyMessageType = fileType;
    this.replyChat = fileURL;
    this.cd.detectChanges();
  }

  removeReplyFile() {
    this.fileURL = '';
    this.fileName = '';
  }

  removeReplyText() {
    this.replyChat = '';
  }

  openForwardModal(
    chatMessage?: string,
    fileName?: string,
    fileURL?: string,
    fileTYpe?: number
  ) {
    if (chatMessage != null) {
      this.messageToUser = chatMessage;
    }
    if (fileName != null && fileURL != null && fileTYpe != null) {
      this.forwardedFileName = fileName;
      this.forwardedFileURL = fileURL;
      this.forwardedFileType = fileTYpe;
    }
    this._chatService
      .getAllChatUsers(this.senderId, this.forwardMessagePageNumber, '')
      .subscribe((response) => {
        this.forwardUsersList = response;
        var chatUsers: any[] = this.forwardUsersList;
        var schoolInboxList = chatUsers.filter(
          (x) => x.chatType == 3 && x.school.ownerId == this.sender.id
        );
        var classInboxList = chatUsers.filter(
          (x) => x.chatType == 4 && x.class.createdById == this.sender.id
        );
        var courseInboxList = chatUsers.filter(
          (x) => x.chatType == 5 && x.course.createdById == this.sender.id
        );
        schoolInboxList = [
          ...schoolInboxList,
          ...classInboxList,
          ...courseInboxList,
        ];

        schoolInboxList.forEach((item: any) => {
          this._userService.getUser(item.userID).subscribe((result) => {
            item.userName = result.firstName + result.lastName;
            item.profileURL = result.avatar;

            if (item.school != null && !(item.userName.indexOf('(') >= 0)) {
              item.userName =
                item.userName + '(' + item.school.schoolName + ')';
            }
            if (item.class != null && !(item.userName.indexOf('(') >= 0)) {
              item.userName = item.userName + '(' + item.class.className + ')';
            }
            if (item.course != null && !(item.userName.indexOf('(') >= 0)) {
              item.userName =
                item.userName + '(' + item.course.courseName + ')';
            }
          });
        });
      });
  }

  forwardToUser(receiverId: string, chatType: number) {
    this.forwardedId = receiverId;
    this.chatType = chatType.toString();
    this.isForwarded = true;
    this.sendToUser(receiverId);
  }

  forwardAttachmentToUser(receiverId: string, chatType: number) {
    this.forwardedId = receiverId;
    this.chatType = chatType.toString();
    this.isForwarded = true;
    this.sendToUser(receiverId);
  }

  getObjectKeys(obj: any): string[] {
    if (obj != null) {
      // console.log(Object.keys(obj));
      return Object.keys(obj).sort();
    }
    return [];
  }

  groupBySchoolChat(response: any) {
    debugger
    var schoolInboxList = this.schoolInboxList.find((x: { chatHeadId: any; }) => x.chatHeadId == response[0].chatHeadId);
    if (schoolInboxList.chats == null) {
      schoolInboxList.chats = {};
    }
    response.forEach((item: any) => {
      const date = item.time.slice(0, 10);
      // const dateTime = new Date(item.time);
      // const date = dateTime.toISOString().split('T')[0];
      if (schoolInboxList.chats[date]) {
        schoolInboxList.chats[date].push(item);
      } else {
        schoolInboxList.chats[date] = [item];
      }
    });
    return schoolInboxList.chats;
  }

  redirectToUser(userID:any){
    debugger;
    this.router.navigate(['/user/userProfile', userID]);
  }

  downloadFile(fileUrl: string, fileName: string) {
    debugger
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const screenWidth = window.innerWidth;
    this.isScreenPc = screenWidth >= 992;
    this.isScreenMobile = screenWidth < 992;

    if(this.isScreenMobile){
      this.isChatHeadSelected=true;
      this.isChatSelected=false;
    }
    if(this.isScreenPc){
      this.isChatHeadSelected=false;
      this.isChatSelected=false;
    }
  }
}

export enum ChartTypeEnum {
  Personal = 1,
  Group,
  School,
  Class,
  Course,
}
