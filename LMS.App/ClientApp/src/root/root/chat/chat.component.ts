import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild ,OnDestroy, HostListener, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import { signalRResponse, SignalrService } from 'src/root/service/signalr.service';
import { HttpClient } from '@angular/common/http';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ActivatedRoute } from '@angular/router';
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
import { Subject } from 'rxjs';
import { NotificationService } from 'src/root/service/notification.service';
import { NotificationType } from 'src/root/interfaces/notification/notificationViewModel';

export const unreadChatResponse =new Subject<{readMessagesCount: number,type:string}>(); 



@Component({
  selector: 'chat-root',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {

  isOpenSidebar:boolean = false;
  userId:string = "";
  senderId!:string;
  chatType!:string;
  chatTypeId!:string;
  chatViewModel!:ChatViewModel;
  formData= new FormData();
  uploadImage :any;
  uploadVideos :any;
  uploadAttachments!:any;
  SaveChatAttachment!:SaveChatAttachment;
  @ViewChild('chatList') chatList!: ElementRef;
  @ViewChild('schoolChatList') schoolChatList!: ElementRef;

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        min: 0
      }
    }
  };

  chartLabels: string[] = ['Real time data for the chart'];
  chartType: ChartType = 'bar';
  chartLegend: boolean = true;
  user:any;
  sender:any;
  messageToUser:string = "";
  recieverMessageInfo!:any;
  private _userService;
  private _schoolService;
  private _classService;
  private _courseService;
  private _signalRService;
  private _chatService;
  private _notificationService;
  chatheadSub: any;
  saveChat:any;
  isDataLoaded:boolean = false;
  loadingIcon:boolean = false;
  allChatUsers:any;
  firstuserChats:any;
  usersChatSub:any;
  userChats:any;
  isPinned!:boolean;
  recieverId:any;
  receiverAvatar!:string;
  receiverName!:string;
  selectedFile: FileList | [] = [];
  addChatAttachments!:AddChatAttachments;
  userName!:string;
  invalidMessage!:boolean;
  fullSizeImageName!:string;
  fullSizeImageUrl!:string;
  profileURL!:string;
  showMyInbox!:boolean;
  showMySchoolInbox!:boolean;
  school!:any;
  schoolInboxList!:any;
  classInboxList!:any;
  courseInboxList!:any;
  userSchoolsList!:any;
  receiverInfo!:any;
  isSchoolOwner!:boolean;
  frontEndPageNumber:number=1;
  senderID!:string;
  schoolInfo!:any;
  classInfo!:any;
  courseInfo!:any;
  selectedChatHeadDiv:boolean = false;
  chatHeadId!:string;

  senderAvatar!:any;
  senderName!:any;
  schoolInboxChatType!:string;
  schoolInboxUserName!:string;
  schoolInboxUserAvatar!:string;
  schoolInboxReceiverId!:string;

  chatHeadsPageNumber:number = 1;
  chatHeadScrolled:boolean = false;
  chatHeadsLoadingIcon: boolean = false;
  scrollChatHeadsResponseCount:number = 1;

  chatsPageNumber:number = 1;
  chatsScrolled:boolean = false;
  chatsLoadingIcon: boolean = false;
  scrollChatsResponseCount:number = 1;

  schoolChatsPageNumber:number = 1;
  schoolChatsScrolled:boolean = false;
  schoolChatsLoadingIcon: boolean = false;
  scrollSchoolChatsResponseCount:number = 1;

  searchString:string = "";
  @ViewChild('chatHeadsScrollList') chatHeadsScrollList!: ElementRef;
  // @ViewChild('chatScrollList') chatScrollList!: ElementRef;



  constructor(@Inject(DOCUMENT) document: Document,notificationService:NotificationService,schoolService:SchoolService,classService:ClassService,courseService:CourseService, chatService:ChatService,private renderer: Renderer2,public signalRService: SignalrService, private http: HttpClient,private route: ActivatedRoute,private userService: UserService,private cd: ChangeDetectorRef) { 
    this._userService = userService;
    this._schoolService = schoolService;
    this._classService = classService;
    this._courseService = courseService;
    this._signalRService = signalRService;
    this._chatService = chatService;
    this._notificationService = notificationService;

    this._userService.shareDataSubject.subscribe(receiveddata=>{
      console.log(receiveddata); 
   });

  }

  ngOnInit() {
    this.loadingIcon = true;
    let chatHeadObj = history.state.chatHead;
    if(chatHeadObj!= undefined){




      this.userId = chatHeadObj.receiverId;
      this.chatType = chatHeadObj.type;
      this.chatTypeId = chatHeadObj.chatTypeId;
      this._userService.getUser(this.userId).subscribe((response) => {
        this.user = response;
      });

      if(this.chatTypeId != "" && this.chatType == "3"){
        this._schoolService.getSchool(this.chatTypeId).subscribe((result) => {
          this.schoolInfo = {
            userName:result.schoolName,
            userID:this.userId,
            profileURL: result.avatar,
            chatType:this.chatType,
            chatTypeId:this.chatTypeId,
            school:result,
            chats:[],
            unreadMessageCount:0
            };
         })
      }

      if(this.chatTypeId != "" && this.chatType == "4"){
        this._classService.getClass(this.chatTypeId).subscribe((result) => {
          this.classInfo = {
            userName:result.className,
            userID:this.userId,
            profileURL: result.avatar,
            chatType:this.chatType,
            chatTypeId:this.chatTypeId,
            class:result,
            chats:[]
            };
         })
      }

      if(this.chatTypeId != "" && this.chatType == "5"){
        this._courseService.getCourse(this.chatTypeId).subscribe((result) => {
          this.courseInfo = {
            userName:result.courseName,
            userID:this.userId,
            profileURL: result.avatar,
            chatType:this.chatType,
            chatTypeId:this.chatTypeId,
            course:result,
            chats:[]
            };
         })
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
    var validToken = localStorage.getItem("jwt");
    if (validToken != null) {
      let jwtData = validToken.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.senderId = decodedJwtData.jti;                          // sender 
      // this.getChatUsersList(this.senderId);
      this._userService.getUser(this.senderId).subscribe((response) => {
        this.sender = response;
        this.getChatUsersList(this.senderId);

      });

      this._schoolService.getUserAllSchools(this.senderId).subscribe((response) => {
        this.userSchoolsList = response;
      });


      
    }

      this.uploadImage = [];
      this.uploadVideos = [];
      this.uploadAttachments = [];

    
    signalRResponse.subscribe(response => {
     if(this.chatHeadId == response.chatHeadId){         
         this._chatService.removeUnreadMessageCount(response.receiverId,response.senderId,Number(response.chatType)).subscribe((result) => {
         });
     }
     else{
      if(this.chatHeadId != "1"){

    
      unreadChatResponse.next({readMessagesCount:1,type:"add"});
      var chatUsers: any[] = this.allChatUsers;
      var chatUser = chatUsers.find(x => x.userID == response.senderId && x.chatType == response.chatType);
      if(chatUser == undefined){
        var chatSchoolUsers: any[] = this.schoolInboxList;
        chatUser = chatSchoolUsers.find(x => x.userID == response.senderId && x.chatType == response.chatType);
        if(chatUser == undefined){
          var chatClassUsers: any[] = this.classInboxList;
          chatUser = chatClassUsers.find(x => x.userID == response.senderId && x.chatType == response.chatType);
          if(chatUser == undefined){
            var chatCourseUsers: any[] = this.courseInboxList;
            chatUser = chatCourseUsers.find(x => x.userID == response.senderId && x.chatType == response.chatType);
          }
        }
      }
      if(chatUser!=undefined){
        chatUser.unreadMessageCount = chatUser.unreadMessageCount + 1;
      }
     }
    }
    for(let i=0;i< response.attachments.length; i++){
      if(response.attachments[i].fileType ==1){
        this.uploadImage.push(response.attachments[i]);
      }

      if(response.attachments[i].fileType ==2){
        this.uploadVideos.push(response.attachments[i]);
      }

      if(response.attachments[i].fileType ==3){
        this.uploadAttachments.push(response.attachments[i]);
      }

    }
if(response.chatType =="1"){
    if(this.allChatUsers == undefined){
    this.allChatUsers = [];
    }

    var chatUsers: any[] = this.allChatUsers;
          var isuserExist = chatUsers.find(x => x.userID == response.senderId && x.chatType == 1);
          if(isuserExist == undefined)
          {
            this._userService.getUser(response.senderId).subscribe((result) => {
              var userDetails = {
                userName:result.firstName + " " + result.lastName,
                userID:response.senderId,
                profileURL: result.avatar,
                chatType:response.chatType,
                chats:[]
                };
         
               this.allChatUsers.unshift(userDetails);

               this.senderID = userDetails.userID;
               this.chatType = response.chatType;
               
               
               var users: any[] = this.allChatUsers;
                var user = users.find(x => x.userID == response.senderId);
               if(response.message != ""){
                user.lastMessage = response.message;
               }
               else{
                user.lastMessage = response.attachments[0].fileName;
               }
          
                var senderDetails ={receiver:result.firstName + " " + result.lastName,message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
                this.generateChatLi(senderDetails,result.avatar,"1");

               
            });
          }

          else{
                 

     var users: any[] = this.allChatUsers;
     var user = users.find(x => x.userID == response.senderId);
     if(this.receiverName == undefined){
      this.receiverName = user.userName;

     }
     if(this.receiverAvatar == undefined){
      this.receiverAvatar = user.profileURL;

     }
     this.senderID = user.userID;
     this.chatType = response.chatType;
     if(response.message != ""){
      user.lastMessage = response.message;
     }
     else{
      user.lastMessage = response.attachments[0].fileName;
     }

      var result ={receiver:this.receiverName,message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
      this.generateChatLi(result,this.receiverAvatar,"1");
    }
  }
  if(response.chatType =="3"){
    if(this.schoolInboxList == undefined){
      this.schoolInboxList = [];
      }
  
      var chatUsers: any[] = this.schoolInboxList;
      this.chatType = response.chatType;
              var isuserExist = chatUsers.find(x => x.userID == response.senderId && x.chatType == 3);
            if(isuserExist == undefined)
            {
              this._userService.getUser(response.senderId).subscribe((result) => {
                var userDetails = {
                  userName:result.firstName + " " + result.lastName,
                  userID:response.senderId,
                  profileURL: result.avatar,
                  chatType:response.chatType,
                  chats:[],
                  school:{createdById:'',schoolName:'',avatar:'',schoolId:''}
                  };

                this._schoolService.getSchool(response.chatTypeId).subscribe((schoolDeatail) => {
                userDetails.school['createdById']=schoolDeatail.createdById;
                userDetails.school['schoolName']=schoolDeatail.schoolName;
                userDetails.school['avatar']=schoolDeatail.avatar;
                userDetails.school['schoolId']=schoolDeatail.schoolId;
                userDetails.userName = userDetails.userName + "(" + schoolDeatail.schoolName + ")";
                 
           
                 this.schoolInboxList.unshift(userDetails);
                 
                 var users: any[] = this.allChatUsers;
                 var receiverLastMessage = users.find(x => x.userID == response.senderId && x.chatType == 3);
                 if(receiverLastMessage!= undefined){
                  receiverLastMessage.lastMessage = response.message;
                 }

                 var schoolUsers: any[] = this.schoolInboxList;
                 var user = schoolUsers.find(x => x.userID == response.senderId && x.chatType == 3);
                //  var users: any[] = this.schoolInboxList;
                //  var user = users.find(x => x.userID == response.senderId);
                //  user.lastMessage = response.message;
                 if(user.school != null){
                 if(user.school.ownerId == this.sender.id || user.school?.createdById == this.sender.id){
                  this.isSchoolOwner = true;
                  user.lastMessage = response.message;
                  var senderDetails ={receiver:result.firstName + " " + result.lastName + "(" + user.school.schoolName + ")",message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
                  this.generateChatLi(senderDetails,result.avatar,"3");
                 }
                 else{
                  this.isSchoolOwner = false;
                  var senderDetailss ={receiver:user.school.schoolName,message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
                  this.generateChatLi(senderDetailss,user.school.avatar,"3");
                 }
                }
                else{
                  this.isSchoolOwner = false;
                  var senderDetailsss ={receiver:user.school.schoolName ,message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
                  this.generateChatLi(senderDetailsss,user.school.avatar,"3");
                }
                 if(response.message != ""){
                  user.lastMessage = response.message;
                 }
                 else{
                  user.lastMessage = response.attachments[0].fileName;
                 }
                });
              });
            }
  
            else{
       var users: any[] = this.schoolInboxList;
       var user = users.find(x => x.userID == response.senderId);
       user.lastMessage = response.message;
       if(user.school != null){
       if(user.school.ownerId == this.sender.id || user.school?.createdById == this.sender.id){
        this.isSchoolOwner = true;
       }
       else{
        this.isSchoolOwner = false;
       }
      }
      else{
        this.isSchoolOwner = false;
      }
       if(response.message != ""){
        user.lastMessage = response.message;
       }
       else{
        user.lastMessage = response.attachments[0].fileName;
       }
  
        var senderDeatail ={receiver:this.receiverName,message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
        this.generateChatLi(senderDeatail,this.receiverAvatar,"3");
      }
  }

  if(response.chatType =="4"){
    if(this.classInboxList == undefined){
      this.classInboxList = [];
      }
  
      var chatUsers: any[] = this.classInboxList;
      this.chatType = response.chatType;
              var isuserExist = chatUsers.find(x => x.userID == response.senderId);
            if(isuserExist == undefined)
            {
              this._userService.getUser(response.senderId).subscribe((result) => {
                var userDetails = {
                  userName:result.firstName + " " + result.lastName,
                  userID:response.senderId,
                  profileURL: result.avatar,
                  chatType:response.chatType,
                  chats:[],
                  class:{createdById:'',className:'',avatar:'',classId:'',schoolId:''}
                  };

                this._classService.getClass(response.chatTypeId).subscribe((classDeatail) => {
                userDetails.class['createdById']=classDeatail.createdById;
                userDetails.class['className']=classDeatail.className;
                userDetails.class['avatar']=classDeatail.avatar;
                userDetails.class['classId']=classDeatail.classId;
                userDetails.class['classId']=classDeatail.classId;
                userDetails.class['schoolId']=classDeatail.schoolId;
                userDetails.userName = userDetails.userName + "(" + classDeatail.className + ")";
                 
           
                 this.classInboxList.unshift(userDetails);
                 this.schoolInboxList.unshift(userDetails);
                 
                 var users: any[] = this.allChatUsers;
                 var receiverLastMessage = users.find(x => x.userID == response.senderId && x.chatType == 4);
                 if(receiverLastMessage!= undefined){
                  receiverLastMessage.lastMessage = response.message;
                 }

                 var classUsers: any[] = this.classInboxList;
                 var user = classUsers.find(x => x.userID == response.senderId && x.chatType == 4);

                //  var users: any[] = this.schoolInboxList;
                //  var receiverLastMessage = users.find(x => x.userID == response.senderId && x.chatType == 4);
                //  receiverLastMessage.lastMessage = response.message;
                //  var users: any[] = this.classInboxList;
                //  var user = users.find(x => x.userID == response.senderId);
                //  if(response.message != ""){
                //   user.lastMessage = response.message;
                //  }
                //  else{
                //   user.lastMessage = response.attachments[0].fileName;
                //  }
                 if(user.class != null){
                 if(user.class.ownerId == this.sender.id || user.class?.createdById == this.sender.id){
                  this.isSchoolOwner = true;
                  user.lastMessage = response.message;
                  var senderDetails ={receiver:result.firstName + " " + result.lastName ,message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
                  this.generateChatLi(senderDetails,result.avatar,"4");
                 }
                 else{
                  this.isSchoolOwner = false;
                  var senderDetailss ={receiver:user.class.className,message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
                  this.generateChatLi(senderDetailss,user.class.avatar,"4");
                 }
                }
                else{
                  this.isSchoolOwner = false;
                  var senderDetailsss ={receiver:user.class.className ,message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
                  this.generateChatLi(senderDetailsss,user.class.avatar,"4");
                }
                });
  
                 
              });
            }
  
            else{
              var users: any[] = this.allChatUsers;
              var receiverLastMessage = users.find(x => x.userID == response.senderId && x.chatType == 4);
              if(receiverLastMessage!= undefined){
               receiverLastMessage.lastMessage = response.message;
              }

              var classUsers: any[] = this.classInboxList;
              var user = classUsers.find(x => x.userID == response.senderId && x.chatType == 4);

      //         var users: any[] = this.allChatUsers;
      //         var receiverLastMessage = users.find(x => x.userID == response.senderId);
      //         receiverLastMessage.lastMessage = response.message;
      //  var users: any[] = this.classInboxList;
      //  var user = users.find(x => x.userID == response.senderId);
       if(user.class != null){
       if(user.class.ownerId == this.sender.id || user.class?.createdById == this.sender.id){
        this.isSchoolOwner = true;
        user.lastMessage = response.message;
       }
       else{
        this.isSchoolOwner = false;
       }
      }
      else{
        this.isSchoolOwner = false;
      }
       if(response.message != ""){
        user.lastMessage = response.message;
       }
       else{
        user.lastMessage = response.attachments[0].fileName;
       }
  
        var senderDeatail ={receiver:this.receiverName ,message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
        this.generateChatLi(senderDeatail,this.receiverAvatar,"4");
      }
  }

  if(response.chatType =="5"){
    if(this.courseInboxList == undefined){
      this.courseInboxList = [];
      }
  
      var chatUsers: any[] = this.courseInboxList;
      this.chatType = response.chatType;
              var isuserExist = chatUsers.find(x => x.userID == response.senderId);
            if(isuserExist == undefined)
            {
              this._userService.getUser(response.senderId).subscribe((result) => {
                var userDetails = {
                  userName:result.firstName + " " + result.lastName,
                  userID:response.senderId,
                  profileURL: result.avatar,
                  chatType:response.chatType,
                  chats:[],
                  course:{createdById:'',courseName:'',avatar:'',courseId:'',schoolId:''}
                  };

                this._courseService.getCourse(response.chatTypeId).subscribe((courseDeatail) => {
                userDetails.course['createdById']=courseDeatail.createdById;
                userDetails.course['courseName']=courseDeatail.courseName;
                userDetails.course['avatar']=courseDeatail.avatar;
                userDetails.course['courseId']=courseDeatail.courseId;
                userDetails.course['schoolId']=courseDeatail.schoolId;
                userDetails.userName = userDetails.userName + "(" + courseDeatail.courseName + ")";
                 
           
                 this.courseInboxList.unshift(userDetails);
                 this.schoolInboxList.unshift(userDetails);


                 var users: any[] = this.allChatUsers;
                 var receiverLastMessage = users.find(x => x.userID == response.senderId && x.chatType == 5);
                 if(receiverLastMessage!= undefined){
                  receiverLastMessage.lastMessage = response.message;
                 }

                 var courseUsers: any[] = this.courseInboxList;
                 var user = courseUsers.find(x => x.userID == response.senderId && x.chatType == 5);


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
                 if(user.course != null){
                 if(user.course.ownerId == this.sender.id || user.course?.createdById == this.sender.id){
                  this.isSchoolOwner = true;
                  user.lastMessage = response.message;
                  var senderDetails ={receiver:result.firstName + " " + result.lastName ,message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
                  this.generateChatLi(senderDetails,result.avatar,"5");
                 }
                 else{
                  this.isSchoolOwner = false;
                  var senderDetailss ={receiver:user.course.courseName,message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
                  this.generateChatLi(senderDetailss,user.course.avatar,"5");
                 }
                }
                else{
                  this.isSchoolOwner = false;
                  var senderDetailsss ={receiver:user.course.courseName ,message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
                  this.generateChatLi(senderDetailsss,user.course.avatar,"5");
                }
                });
              });
            }
  
            else{
              var users: any[] = this.allChatUsers;
              var receiverLastMessage = users.find(x => x.userID == response.senderId && x.chatType == "5");
              if(receiverLastMessage!= undefined){
              receiverLastMessage.lastMessage = response.message;
              }
       var users: any[] = this.courseInboxList;
       var user = users.find(x => x.userID == response.senderId && x.chatType == "5");
       if(user.course != null){
       if(user.course.ownerId == this.sender.id || user.course?.createdById == this.sender.id){
        this.isSchoolOwner = true;
        user.lastMessage = response.message;
       }
       else{
        this.isSchoolOwner = false;
       }
      }
      else{
        this.isSchoolOwner = false;
      }
       if(response.message != ""){
        user.lastMessage = response.message;
       }
       else{
        user.lastMessage = response.attachments[0].fileName;
       }
  
        var senderDeatail ={receiver:this.receiverName ,message:response.message,isTest:true,receiverId:response.receiverId,isSchoolOwner:this.isSchoolOwner};
        this.generateChatLi(senderDeatail,this.receiverAvatar,"4");
      }
  }
    });
    

    this.InitializeChatViewModel();

  this.SaveChatAttachment = {
    files:[]
    

}

this.addChatAttachments = {
  fileType:'',
  file:[]
 }
  }

  ngAfterViewInit() {        
    //setTimeout(() => this.scrollToBottom());
  } 

// scrollToBottom(): void {
//     try {
//         this.cd.detectChanges();
//         this.chatScrollList.nativeElement.scrollTop = this.chatScrollList.nativeElement.scrollHeight;
//     } catch(err) { }                 
// }

    ngOnDestroy() {
      // this.chatheadSub.unsubscribe();
      // this.saveChat.unsubscribe();
      // this.usersChatSub.unsubscribe();
    }

    // myScrollFunction= (ev: any): void => {
    //   console.log("scrolled down!!",ev.srcElement.scrollTop,this.recieverId);
    //   if(ev.srcElement.scrollTop==100){
    //     this.frontEndPageNumber++;
    //     this.getUsersChat(this.recieverId,"","","1",10,this.frontEndPageNumber);
    //   }
    // }

    getChatUsersList(senderId:string){
      this.loadingIcon = true;
      this._chatService.getAllChatUsers(senderId,this.chatHeadsPageNumber,this.searchString).subscribe((response) => {
        this.allChatUsers = response;
        this.loadingIcon = false;
        this.isDataLoaded = true;

      var chatUsers: any[] = this.allChatUsers;
      this.schoolInboxList = chatUsers.filter(x => x.chatType == 3 && x.school.ownerId == this.sender.id);
      this.classInboxList = chatUsers.filter(x => x.chatType == 4 && x.class.createdById == this.sender.id);
      this.courseInboxList = chatUsers.filter(x => x.chatType == 5 && x.course.createdById == this.sender.id);
      this.schoolInboxList = [ ...this.schoolInboxList, ...this.classInboxList,...this.courseInboxList];
      
       if(this.userId!= null && this.chatType == "3"){
        var chatUsers: any[] = this.allChatUsers;
        var isuserExist = chatUsers.find(x => x.userID == this.userId && x.chatType =="3");
        if(isuserExist == undefined){
        this.allChatUsers.unshift(this.schoolInfo);
      }
      else{
        if(isuserExist.school.ownerId == this.senderId){
          this.getUsersChat(isuserExist.chatHeadId,isuserExist.userID,isuserExist.profileURL,isuserExist.userName,isuserExist.chatType,"FromSchoolInbox",10,1,isuserExist.school.schoolId);
        }
        else{
        this.getUsersChat(isuserExist.chatHeadId,isuserExist.userID,isuserExist.profileURL,isuserExist.userName,isuserExist.chatType,"FromMyInbox",10,1);
        }
      }

        }

         if(this.userId!= null && this.chatType == "4"){
        var chatUsers: any[] = this.allChatUsers;
        var isuserExist = chatUsers.find(x => x.userID == this.userId && x.chatType =="4");
        if(isuserExist == undefined){
        this.allChatUsers.unshift(this.classInfo);
      }
      else{
        this.getUsersChat(isuserExist.chatHeadId,isuserExist.userID,isuserExist.profileURL,isuserExist.userName,isuserExist.chatType,"FromMyInbox",10,1);
      }
    }

    if(this.userId!= null && this.chatType == "5"){
      var chatUsers: any[] = this.allChatUsers;
      var isuserExist = chatUsers.find(x => x.userID == this.userId && x.chatType =="5");
      if(isuserExist == undefined){
      this.allChatUsers.unshift(this.courseInfo);
    }
    else{
      this.getUsersChat(isuserExist.chatHeadId,isuserExist.userID,isuserExist.profileURL,isuserExist.userName,isuserExist.chatType,"FromMyInbox",10,1);
    }
  }

      this.schoolInboxList.forEach((item: any) => {
        this._userService.getUser(item.userID).subscribe((result) => {
          item.userName = result.firstName + result.lastName;
          item.profileURL = result.avatar;  
        });

        if(item.chatType == 3){
        const index = this.allChatUsers.indexOf(item);
         if (index > -1) {
          this.allChatUsers.splice(index, 1);
         }
        }

        if(item.chatType == 4){
          const index = this.allChatUsers.indexOf(item);
           if (index > -1) {
            this.allChatUsers.splice(index, 1);
           }
          }

          if(item.chatType == 5){
            const index = this.allChatUsers.indexOf(item);
             if (index > -1) {
              this.allChatUsers.splice(index, 1);
             }
            }
      });

      
        //here if click on message
        if(this.userId != "" && this.chatType == "1"){
          var chatUsers: any[] = this.allChatUsers;
          var isuserExist = chatUsers.find(x => x.userID == this.userId && x.chatType =="1");
          if(isuserExist == undefined){

          var user = {
            userName:this.user.firstName + " " + this.user.lastName,
            receiverName:this.user.firstName + " " + this.user.lastName,
            userID:this.user.id,
            profileURL: this.user.avatar,
            chatType: this.chatType,
            chats:[],
            unreadMessageCount:0,
            chatHeadId:"1"
          };
          
          this.allChatUsers.unshift(user);
          // if(this.allChatUsers.length == 0){
          //   this.allChatUsers.push(user);
          // }
        }
        else{
          this.getUsersChat(isuserExist.chatHeadId,isuserExist.userID,isuserExist.profileURL,isuserExist.userName,isuserExist.chatType,"FromMyInbox",10,1);
        }

        }


        this.selectedChatHeadDiv = true;
        this.firstuserChats = this.allChatUsers[0]?.chats;
        this.userName = this.allChatUsers[0].userName;
        this.recieverId = this.allChatUsers[0]?.userID;
        this.receiverAvatar = this.allChatUsers[0]?.profileURL;
        this.receiverName = this.allChatUsers[0]?.userName;
        this.chatType = this.allChatUsers[0]?.chatType;
        this.profileURL = this.sender.avatar;
        unreadChatResponse.next({readMessagesCount:this.allChatUsers[0]?.unreadMessageCount,type:"remove"});
        this.allChatUsers[0].unreadMessageCount = 0;


        this.chatHeadId = this.allChatUsers[0].chatHeadId;
        this.cd.detectChanges();
        this.chatList.nativeElement.scrollTop = this.chatList.nativeElement.scrollHeight;
      });
    }

    clearChat() {
      if(this.chatList != undefined){
      this.chatList.nativeElement.querySelectorAll('p').forEach((elem :Element) => {
         elem.remove();
      });
    }
    if(this.schoolChatList!= undefined){
      this.schoolChatList.nativeElement.querySelectorAll('p').forEach((elem :Element) => {
        elem.remove();
     });
    }
  }

    getSelectedSchoolInbox(schoolId?:string){
      this.showMySchoolInbox = true;
      this.showMyInbox = false;
      var inboxList: any[] = this.schoolInboxList;
      var classInboxList: any[] = this.classInboxList;
      var courseInboxList: any[] = this.courseInboxList;
      inboxList = inboxList.filter(x => x.school?.schoolId == schoolId);
      classInboxList = classInboxList.filter(x => x.class?.schoolId == schoolId);
      courseInboxList = courseInboxList.filter(x => x.course?.schoolId == schoolId);
      this.schoolInboxList = [ ...inboxList, ...classInboxList,...courseInboxList];

      let newList:any[] = [];
      var schoolIbList: any[] = this.schoolInboxList;

      // Point: here we will differentiate school, class, course individually
      schoolIbList.forEach(item => {
        if(item.school != null && !(item.userName.indexOf('(') >= 0)){
           item.userName = item.userName + "(" + item.school.schoolName + ")";
        }
        if(item.class != null && !(item.userName.indexOf('(') >= 0)){
          item.userName = item.userName + "(" + item.class.className + ")";
        }
        if(item.course != null && !(item.userName.indexOf('(') >= 0)){
          item.userName = item.userName + "(" + item.course.courseName + ")";
        }
      });
      // schoolIbList.forEach(item => {
      //   let isExist = newList.findIndex(x => x.userID == item.userID);
      //   if (!(isExist >= 0)) {
      //     newList.push(item);
      //   }
      // });
      // this.schoolInboxList = newList;
      this.chatHeadId = this.schoolInboxList[0].chatHeadId;

      unreadChatResponse.next({readMessagesCount:this.schoolInboxList[0]?.unreadMessageCount,type:"remove"});
      this.schoolInboxList[0].unreadMessageCount = 0;
      if(this.schoolInboxList[0].school != null){
        this.senderAvatar = this.schoolInboxList[0].school.avatar;
        this.senderName = this.schoolInboxList[0].school.schoolName;
      }

      if(this.schoolInboxList[0].class != null){
        this.senderAvatar = this.schoolInboxList[0].class.avatar;
        this.senderName = this.schoolInboxList[0].class.className;
      }

      if(this.schoolInboxList[0].course != null){
        this.senderAvatar = this.schoolInboxList[0].course.avatar;
        this.senderName = this.schoolInboxList[0].course.courseName;
        this.schoolInboxReceiverId = this.schoolInboxList[0].userID;
      }

      this.schoolInboxUserName = this.schoolInboxList[0].userName;
      this.schoolInboxUserAvatar = this.schoolInboxList[0].profileURL;
      this.schoolInboxReceiverId = this.schoolInboxList[0].userID;
      this.chatType = this.schoolInboxList[0].chatType;
      this.loadingIcon = false;

      this.cd.detectChanges();
      this.schoolChatList.nativeElement.scrollTop = this.schoolChatList.nativeElement.scrollHeight;

    }

    getUsersChat(chatHeadId:string,recieverId:string,receiverAvatar:string,username:string,chatType:string,From:string,pageSize:number,pageNumber:number,school?:any){
      this.loadingIcon = true;
      this.selectedChatHeadDiv = true;
      
      //var previousChatHeadId = localStorage.getItem("chatHead");
      this.chatHeadId = chatHeadId;
      //localStorage.setItem("chatHead", chatHeadId); 
      


      // here for remove unread message count from chathead and also minus from total count

      var chatUsers: any[] = this.allChatUsers;
      let currentChatHead = chatUsers.find(x => x.userID == recieverId && x.chatType == chatType);
      if(currentChatHead == undefined){
        var schoolChatUsers: any[] = this.schoolInboxList;
        currentChatHead = schoolChatUsers.find(x => x.userID == recieverId && x.chatType == chatType);
      }
      if(currentChatHead.unreadMessageCount > 0){
      unreadChatResponse.next({readMessagesCount:currentChatHead.unreadMessageCount,type:"remove"});
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
      this.usersChatSub = this._chatService.getUsersChat(this.senderId,recieverId,Number(chatType),pageSize,pageNumber).subscribe((response) => {
       if(chatType == "4" && From=="FromSchoolInbox"){
        this.schoolInboxChatType = "4";
        this.chatType = "4";
        var chatUsers: any[] = this.schoolInboxList;
        let currentChatHead = chatUsers.find(x => x.user2ID == this.sender.id && x.userID == recieverId && x.chatType == 4);
        
        this.schoolInboxList[0].chats = response;
        this.senderAvatar = currentChatHead.class.avatar;
        this.senderName = currentChatHead.class.className;
        this.loadingIcon = false;
        this.schoolInboxUserName = currentChatHead.userName;
        this.schoolInboxUserAvatar = currentChatHead.profileURL;
        this.schoolInboxReceiverId = currentChatHead.userID;
        // this.schoolInboxList[0].school = null;
        // this.schoolInboxList[0].course = null;
        // this.schoolInboxList[0].class = currentChatHead.class;
       }
       else{
       if(chatType == "3" && From=="FromSchoolInbox"){
        if(school.ownerId == this.senderId){
        this.getSelectedSchoolInbox(school.schoolId);
       }
       else{
        this.schoolInboxChatType = "3";
        this.chatType = "3";
        this.schoolInboxList[0].chats = response;
        this.senderAvatar = currentChatHead.school.avatar;
        this.senderName = currentChatHead.school.schoolName;
        this.loadingIcon = false;
        this.schoolInboxUserName = currentChatHead.userName;
        this.schoolInboxUserAvatar = currentChatHead.profileURL;
        this.schoolInboxReceiverId = currentChatHead.userID;
      }
       }
       else{
        if(chatType == "5" && From=="FromSchoolInbox"){
          this.schoolInboxChatType = "5";
          this.chatType = "5";
          this.schoolInboxList[0].chats = response;
          this.senderAvatar = currentChatHead.course.avatar;
          this.senderName = currentChatHead.course.courseName;
          this.loadingIcon = false;
          this.schoolInboxUserName = currentChatHead.userName;
          this.schoolInboxUserAvatar = currentChatHead.profileURL;
          this.schoolInboxReceiverId = currentChatHead.userID;
          // this.schoolInboxList[0].school = null;
          // this.schoolInboxList[0].course = currentChatHead.course;
          // this.schoolInboxList[0].class = null;
         }
         else{
          this.userChats = response;
          this.recieverId = recieverId;
          this.userName = username;
          this.receiverAvatar = receiverAvatar;
          this.receiverName = username;
          this.chatType = chatType;
          this.profileURL = this.sender.avatar;
          this.loadingIcon = false;
       
          
          if(!this.firstuserChats || this.firstuserChats.length==0)
            this.firstuserChats = response;
          else
            this.firstuserChats = this.userChats.concat(this.firstuserChats);
          this.firstuserChats = this.userChats;
         }
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
    }

    pinUnpinChat(recieverId:string,chatType:string,isPinned:boolean){
     this.isPinned = isPinned;
     var chatUsers: any[] = this.allChatUsers;
     
     var currentUser = chatUsers.find(x => x.userID == recieverId && x.chatType == chatType);
     const index = this.allChatUsers.indexOf(currentUser);
     if (index > -1) {
      this.allChatUsers.splice(index, 1);
     }
     if(!this.isPinned ){
       currentUser.isPinned = false;
     }
     this.allChatUsers.unshift(currentUser)
      this.usersChatSub = this._chatService.pinUnpinChat(this.senderId,recieverId,Number(chatType)).subscribe((response) => {
      var isPinned = response;
      });

    }
  InitializeChatViewModel(){
    this.chatViewModel = {
      chatHeadId:'',
      sender:'',
      receiver:'',
      chatType:0,
      chatTypeId:'',
      message:'',
      attachments:[]
  
     };
  }

  handleImages(event: any) {
    this.selectedFile = event.target.files;
    var formData = new FormData(); 
    for(var i=0; i<this.selectedFile.length; i++){
      formData.append('file', this.selectedFile[i]);
   }

    formData.append('fileType', '1');
    
      this._chatService.saveChatAttachments(formData).subscribe((response : FileUploadResult) => {
        this.uploadImage = response
        formData = new FormData();
        this.selectedFile = [];
        this.invalidMessage = false;
  });
}

handleVideos(event: any) {
  this.selectedFile = event.target.files;
  var formData = new FormData(); 
  for(var i=0; i<this.selectedFile.length; i++){
    formData.append('file', this.selectedFile[i]);
 }

  formData.append('fileType', '2');
  
    this._chatService.saveChatAttachments(formData).subscribe((response : FileUploadResult) => {
      this.uploadVideos = response
      formData = new FormData();
      this.selectedFile = [];
      this.invalidMessage = false;
});

}

handleAttachments(event: any) {
  this.selectedFile = event.target.files;
  var formData = new FormData(); 
  for(var i=0; i<this.selectedFile.length; i++){
    formData.append('file', this.selectedFile[i]);
 }

  formData.append('fileType', '3');
  
    this._chatService.saveChatAttachments(formData).subscribe((response : FileUploadResult) => {
      this.uploadAttachments = response
      formData = new FormData();
      this.selectedFile = [];
      this.invalidMessage = false;
});
}

removeUploadFile(fileURL:any){
  if(this.uploadImage != undefined){
  const index = this.uploadImage.findIndex((item:any) => item.fileURL === fileURL);
  if (index > -1) {
    this.uploadImage.splice(index, 1);
    this.invalidMessage = true;
  }
}

if(this.uploadVideos != undefined){
  const videoIndex = this.uploadVideos.findIndex((item:any) => item.fileURL === fileURL);
  if (videoIndex > -1) {
    this.uploadVideos.splice(videoIndex, 1);
    this.invalidMessage = true;
  }
}

if(this.uploadAttachments != undefined){
  const attachmentIndex = this.uploadAttachments.findIndex((item:any) => item.fileURL === fileURL);
  if (attachmentIndex > -1) {
    this.uploadAttachments.splice(attachmentIndex, 1);
    this.invalidMessage = true;
  }
}
  this._chatService.removeChatAttachment(fileURL).subscribe((response : any) => {
    this.uploadImage = response

});
}

getTextMessage(evant:any,receiverId:string){
  if(this.messageToUser ==""){
   this.invalidMessage = true;
  }
  else{
    this.invalidMessage = false;
    if(evant.code == "Enter"){
      this.sendToUser(receiverId);
   }
  }
}

  sendToUser(receiverId:string){

    this.InitializeChatViewModel();
    if(receiverId == undefined){
      receiverId = this.senderID;
    }

    var users: any[] = this.allChatUsers;
    var user = users.find(x => x.userID == receiverId && x.chatType == this.chatType);

    if(user!= undefined){
    this.receiverInfo = user;
    if(this.receiverInfo.school!= null){
      this.chatViewModel.chatTypeId = this.receiverInfo?.school.schoolId;
    }
    if(this.receiverInfo.class!= null){
      this.chatViewModel.chatTypeId = this.receiverInfo?.class.classId;
    }
    if(this.receiverInfo.course!= null){
      this.chatViewModel.chatTypeId = this.receiverInfo?.course.courseId;
    }
    // this.chatViewModel.chatTypeId = this.receiverInfo?.chatTypeId;
    if(this.receiverInfo.school?.ownerId == this.sender.id || this.receiverInfo.school?.createdById == this.sender.id){
       this.isSchoolOwner = true;
        this.chatViewModel.chatTypeId = this.receiverInfo.school.schoolId;

    }
    else{
    if(this.receiverInfo.class?.createdById == this.sender.id){
      this.isSchoolOwner = true;
      this.chatViewModel.chatTypeId = this.receiverInfo.school.schoolId;

   }
    else{
      if(this.receiverInfo.course?.createdById == this.sender.id){
        this.isSchoolOwner = true;
        this.chatViewModel.chatTypeId = this.receiverInfo.school.schoolId;
      }
      this.isSchoolOwner = false;

    }
  }
  }

    if(user == undefined){
      var schoolUsers: any[] = this.schoolInboxList;
      if(schoolUsers!=undefined && this.chatType== "3"){
      user = schoolUsers.find(x => x.userID == receiverId && x.chatType == this.chatType);
      this.receiverInfo = user;
      this.chatViewModel.chatTypeId = this.receiverInfo?.school?.schoolId;
      if(this.receiverInfo.school?.ownerId == this.sender.id || this.receiverInfo.school?.createdById == this.sender.id){
        this.isSchoolOwner = true;
     }
     else{
       this.isSchoolOwner = false;
 
     }
   }
   var classUsers: any[] = this.classInboxList;
   if(classUsers!=undefined && this.chatType== "4"){
    user = classUsers.find(x => x.userID == receiverId && x.chatType == this.chatType);
    this.receiverInfo = user;
    this.chatViewModel.chatTypeId = this.receiverInfo?.class?.classId;
    if(this.receiverInfo.class?.ownerId == this.sender.id || this.receiverInfo.class?.createdById == this.sender.id){
      this.isSchoolOwner = true;
   }
   else{
     this.isSchoolOwner = false;

   }
 }

 var courseUsers: any[] = this.courseInboxList;
   if(courseUsers!=undefined && this.chatType== "5"){
    user = courseUsers.find(x => x.userID == receiverId && x.chatType == this.chatType);
    this.receiverInfo = user;
    this.chatViewModel.chatTypeId = this.receiverInfo?.course?.courseId;
    if(this.receiverInfo.course?.ownerId == this.sender.id || this.receiverInfo.course?.createdById == this.sender.id){
      this.isSchoolOwner = true;
   }
   else{
     this.isSchoolOwner = false;

   }
 }
    }
    
    if(this.messageToUser != ""){
      user.lastMessage = this.messageToUser;
    }
    else{
      var attachments  = [ ...this.uploadImage, ...this.uploadVideos,...this.uploadAttachments];
      user.lastMessage =  attachments[0].fileName;
    }
    



    if(this.uploadImage || this.uploadVideos){
      if(!this.chatViewModel.attachments){
        this.chatViewModel.attachments = [];
      }

        this.chatViewModel.attachments  = [ ...this.uploadImage, ...this.uploadVideos,...this.uploadAttachments];

        if(this.chatViewModel.attachments.length == 0 && this.messageToUser == ""){
          this.invalidMessage = true;
          return
        }
    }
    if(this.userId ==""){
      this.userId = receiverId;
    }

    this.chatheadSub = this._chatService.getChatHead(this.senderId,this.userId,Number(this.chatType)).subscribe((response) => {
      this.chatViewModel.sender = this.senderId;
      this.chatViewModel.receiver = this.userId;

      if(response==null)
        this.chatViewModel.chatHeadId =response
      else
        this.chatViewModel.chatHeadId = response.id;
        
      this.chatViewModel.message = this.messageToUser;
      this.chatViewModel.chatType = Number(this.chatType);
      if(this.chatViewModel.chatTypeId != ""){
        this.chatViewModel.chatTypeId = this.chatViewModel.chatTypeId;
      }
      else{
        this.chatViewModel.chatTypeId = null;
      }

      var notificationContent = "sent you a message";
      this._notificationService.initializeNotificationViewModel(receiverId,NotificationType.Messages,notificationContent,this.senderId,null,0,null,null, this.chatViewModel.chatType,this.chatViewModel.chatTypeId).subscribe((response) => {
      });    

      this._signalRService.sendToUser(this.chatViewModel);
      console.log(this.chatViewModel);
      this.chatViewModel = new Object as ChatViewModel;
     
    var result ={receiver:this.sender.firstName + " " + this.sender.lastName,message:this.messageToUser,isTest:false,receiverId:this.sender.id,isSchoolOwner:this.isSchoolOwner,receiverName:this.recieverId};
    if(this.isSchoolOwner && this.chatType == "3"){
      result.receiver = this.receiverInfo.school.schoolName;
      this.generateChatLi(result,this.receiverInfo.school.avatar,this.chatType);
    }
    else{
      if(this.isSchoolOwner && this.chatType == "4"){
        result.receiver = this.receiverInfo.class.className;
        this.generateChatLi(result,this.receiverInfo.class.avatar,this.chatType);
      }
      else{
        if(this.isSchoolOwner && this.chatType == "5"){
          result.receiver = this.receiverInfo.course.courseName;
          this.generateChatLi(result,this.receiverInfo.course.avatar,this.chatType);
        }
        else{
         this.generateChatLi(result,this.sender.avatar,this.chatType);
        }
      }
    }
     this.uploadImage = [];
     this.uploadVideos = [];
     this.messageToUser = "";

    });

  }

  saveSentMessage(chatViewModel:ChatViewModel){
    this.formData.append('sender',chatViewModel.sender);
  }

  generateChatLi(response:any,profileImage:string,chatType:string){
    var isFromReciever='you';
    const p: HTMLParagraphElement = this.renderer.createElement('p');
     if(!response.isTest){
      isFromReciever = 'me'
     }
     

     var imageHtml = '';
     if(this.uploadImage != undefined){
     for (var i = 0; i < this.uploadImage.length; i++) {

      imageHtml += `<div class="img-attach me-2 d-inline-block cursor-pointer" data-bs-toggle="modal"
      data-bs-target="#full-chat-image">
      <img src="${this.uploadImage[i].fileURL}" />
      </div>`;          
     }
    }

     var videoHtml = '';
     if(this.uploadVideos != undefined){
     for (var i = 0; i < this.uploadVideos.length; i++) {
      videoHtml += `<span>
     <div class="videofile">
       <video preload="metadata" style="height: 300px;">
         <source src="${this.uploadVideos[i].fileURL}" type="video/mp4"/>
       </video>
     </div>
   </span>`
     }
    }

    var attachmentHtml = '';
    if(this.uploadAttachments != undefined){
      for (var i = 0; i < this.uploadAttachments.length; i++) {
        attachmentHtml += `<div class="teacher-tags hashtag_post tag-boxattachment-outer mt-1 mb-0 hover-tags">
       <span class="custom-tag"><img src="../../../assets/images/Paper-gray.svg" class="me-1 dark-svg"> <img
           src="../../../assets/images/Paper-light.svg" class="me-1 light-svg"> ${this.uploadAttachments[i].fileName}</span>
     </div>`
      }

    var li=`<li class="${isFromReciever}">
    <div class="chat-username d-flex align-items-center mb-2">
      <img style="max-height: 35px;" src="${profileImage}" alt="" class="rounded-circle me-2">
      <h2 class="mb-0 font_16 fw_600 text_sec1">${response.receiver}</h2>
    </div>
    <div class="message">
     ${response.message}
    </div>` + attachmentHtml +
    `
    <div class="message-time text-end text_ltgray font_12">
      11:56
    </div>

    <div class="gallery-attch mt-2">
    <div class="img-attach me-2 d-inline-block cursor-pointer" data-bs-toggle="modal"
      data-bs-target="#full-chat-image">`
      + imageHtml + videoHtml +
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
</div>`
  p.innerHTML =li;
    this.recieverMessageInfo = response;
    this.renderer.appendChild(this.chatList.nativeElement, p)
    if(chatType=="3" && response.isSchoolOwner){
      document.getElementById('chats')?.appendChild(p);
      this.cd.detectChanges();
      this.schoolChatList.nativeElement.scrollTop = this.schoolChatList.nativeElement.scrollHeight;
      return;
    }
    if(chatType=="4" && response.isSchoolOwner){
      document.getElementById('chats')?.appendChild(p);
      this.cd.detectChanges();
      this.schoolChatList.nativeElement.scrollTop = this.schoolChatList.nativeElement.scrollHeight;
      return;
    }

    if(chatType=="5" && response.isSchoolOwner){
      document.getElementById('chats')?.appendChild(p);
      this.cd.detectChanges();
      this.schoolChatList.nativeElement.scrollTop = this.schoolChatList.nativeElement.scrollHeight;
      return;
    }
      if(response.receiverName == this.recieverId){
            document.getElementById('chat')?.appendChild(p);
      }
    
    console.log(response)   
  }

  this.cd.detectChanges();
  this.chatList.nativeElement.scrollTop = this.chatList.nativeElement.scrollHeight;

  }


  showFullChatImage(fileName:string,fileUrl:string){
    this.fullSizeImageName = fileName;
    this.fullSizeImageUrl = fileUrl;

  }

  showMyInboxDiv(){
    this.showMyInbox = true;
    this.showMySchoolInbox = false;
    this.chatType = this.allChatUsers[0].chatType;
  }

  showSchoolInboxDiv(){
    this.chatType = this.schoolInboxList[0].chatType;
  }

  back(): void {
    window.history.back();
  }

  @HostListener('scroll', ['$event']) 
  scrollHandler(event:any) {
    const element = event.target; // get the scrolled element
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      if(!this.chatHeadScrolled && this.scrollChatHeadsResponseCount != 0){
        this.chatHeadScrolled = true;
        this.chatHeadsLoadingIcon = true;
        this.chatHeadsPageNumber++;
        this.getNextChatHeads();
        }
    }
  }


  getNextChatHeads(){
    this._chatService.getAllChatUsers(this.senderId,this.chatHeadsPageNumber,this.searchString).subscribe((response) => {
      this.allChatUsers = [...this.allChatUsers, ...response];
      this.chatHeadsLoadingIcon = false;
      this.cd.detectChanges();
      this.scrollChatHeadsResponseCount = response.length;  
      this.chatHeadScrolled = false;

      const chatList = this.chatHeadsScrollList.nativeElement;
      const chatListHeight = chatList.scrollHeight;
      this.chatHeadsScrollList.nativeElement.scrollTop = this.chatHeadsScrollList.nativeElement.clientHeight;
      const scrollOptions = { 
        duration: 300,
        easing: 'ease-in-out'
      };
      chatList.scrollTo({
        top: this.chatHeadsScrollList.nativeElement.scrollTop,
        left: 0,
        ...scrollOptions
      });
  });
}

chatHeadsSearch(){
  this.chatHeadsPageNumber = 1;
      if(this.searchString.length >2 || this.searchString == ""){
        this._chatService.getAllChatUsers(this.senderId,this.chatHeadsPageNumber,this.searchString).subscribe((response) => {
          this.allChatUsers = response;
          this.firstuserChats = this.allChatUsers[0]?.chats;
        });
      }
}

@HostListener('scroll', ['$event'])
scrollChatHandler(event: any) {
 const element = event.target;
 if (element.scrollTop === 0) {
    if(!this.chatsScrolled && this.scrollChatsResponseCount != 0){
        this.chatsScrolled = true;
        this.chatsLoadingIcon = true;
        this.chatsPageNumber++;
        this.getNextChats();
        }
 }
 
}

getNextChats(){
     this._chatService.getUsersChat(this.senderId,this.recieverId,Number(this.chatType),7,this.chatsPageNumber).subscribe((response) => {
      this.firstuserChats = response.concat(this.firstuserChats);
      this.cd.detectChanges();
      this.chatsLoadingIcon = false;
      this.scrollChatsResponseCount = response.length; 
      this.chatsScrolled = false;
      // Scroll to the bottom of the chat list with animation
      const chatList = this.chatList.nativeElement;
      const chatListHeight = chatList.scrollHeight;
      this.chatList.nativeElement.scrollTop = this.chatList.nativeElement.clientHeight;
      const scrollOptions = { 
        duration: 300,
        easing: 'ease-in-out'
      };
      chatList.scrollTo({
        top: this.chatList.nativeElement.scrollTop,
        left: 0,
        ...scrollOptions
      });
    });
  }


  @HostListener('scroll', ['$event'])
  scrollSchoolChatHandler(event: any) {
   const element = event.target;
   if (element.scrollTop === 0) {
    if(!this.schoolChatsScrolled && this.scrollSchoolChatsResponseCount != 0){
        this.schoolChatsScrolled = true;
        this.schoolChatsLoadingIcon = true;
        this.schoolChatsPageNumber++;
        this.getNextSchoolChats();
        }
 }

}

getNextSchoolChats(){
  this._chatService.getUsersChat(this.senderId,this.recieverId,Number(this.chatType),7,this.schoolChatsPageNumber).subscribe((response) => {
   this.schoolInboxList[0].chats = response.concat(this.schoolInboxList[0].chats);
   this.cd.detectChanges();
   this.schoolChatsLoadingIcon = false;
   this.scrollSchoolChatsResponseCount = response.length; 
   this.schoolChatsScrolled = false;
   // Scroll to the bottom of the chat list with animation
   const chatList = this.schoolChatList.nativeElement;
   const chatListHeight = chatList.scrollHeight;
   this.schoolChatList.nativeElement.scrollTop = this.schoolChatList.nativeElement.clientHeight;
   const scrollOptions = { 
     duration: 300,
     easing: 'ease-in-out'
   };
   chatList.scrollTo({
     top: this.schoolChatList.nativeElement.scrollTop,
     left: 0,
     ...scrollOptions
   });
 });
}





}


  export enum ChartTypeEnum {
    Personal = 1,
    Group, 
    School,
    Class ,
    Course
  }
  


