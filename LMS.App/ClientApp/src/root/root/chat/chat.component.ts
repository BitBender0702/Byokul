// import { SignalrService } from 'src/root/service/signalr.service';
// import { Component, OnInit, OnDestroy } from '@angular/core';

// @Component({
//   selector: 'app-root',
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.css'],
// })
// export class ChatComponent implements OnInit, OnDestroy {

//   constructor( 
//     public signalrService: SignalrService
//   ) 
//   {}


//   ngOnInit() {
//     this.signalrService.startConnection();

//     setTimeout(() => {
//       this.signalrService.askServerListener();
//       this.signalrService.askServer();
//     }, 5000);
//   }

  
//   ngOnDestroy() {
//     this.signalrService.hubConnection.off("askServerResponse");
//   }

// }

import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild ,OnDestroy} from '@angular/core';
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


@Component({
  selector: 'chat-root',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  isOpenSidebar:boolean = false;
  userId!:string;
  senderId!:string;
  chatType!:string;
  chatViewModel!:ChatViewModel;

  formData= new FormData();
  fileUploadResult :FileUploadResult | null= null;
  SaveChatAttachment!:SaveChatAttachment;

  @ViewChild('chatList') chatList!: ElementRef;

  
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
  messageToUser!:string;
  recieverMessageInfo!:any;
  private _userService;
  private _signalRService;
  private _chatService;
  chatheadSub: any;
  saveChat:any;

  constructor(@Inject(DOCUMENT) document: Document,chatService:ChatService,private renderer: Renderer2,public signalRService: SignalrService, private http: HttpClient,private route: ActivatedRoute,private userService: UserService) { 
    this._userService = userService;
    this._signalRService = signalRService;
    this._chatService = chatService;
  }

  ngOnInit() {
      this.userId = this.route.snapshot.paramMap.get('id')??'';   // reciever   
      this.chatType = this.route.snapshot.paramMap.get('chatType')??'';   
      this._userService.getUser(this.userId).subscribe((response) => {
        this.user = response;
      });

      var validToken = localStorage.getItem("jwt");
      if (validToken != null) {
        let jwtData = validToken.split('.')[1]
        let decodedJwtJsonData = window.atob(jwtData)
        let decodedJwtData = JSON.parse(decodedJwtJsonData);
        this.senderId = decodedJwtData.jti;                          // sender 

        this._userService.getUser(this.senderId).subscribe((response) => {
          this.sender = response;
        });
        
      }
    // this.signalRService.startConnection();
    // setTimeout(() => {
    //         this._signalRService.askServerListener();
    //         this._signalRService.askServer(this.sender.id);
    //       }, 5000);

    signalRResponse.subscribe(response => {

      this.generateChatLi(response,this.user.avatar);
    });

    this.InitializeChatViewModel();

  this.SaveChatAttachment = {
    files:[]
    

}
  }

    ngOnDestroy() {
      this.chatheadSub.unsubscribe();
      this.saveChat.unsubscribe();
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
    
    const formData = new FormData(); 
    const fileToUpload = event.target.files[0] as File ;
    formData.append('file', fileToUpload, fileToUpload.name);
    formData.append('fileType','2');
    
      this._chatService.saveChatAttachments(formData).subscribe((response : FileUploadResult) => {
        this.fileUploadResult = response
  });
}

  sendToUser(){
    if(this.fileUploadResult){
      if(!this.chatViewModel.attachments){
        this.chatViewModel.attachments = [];
      }
      this.chatViewModel.attachments.push(this.fileUploadResult);
      console.log(this.chatViewModel.attachments);
    }
    this.chatheadSub = this._chatService.getChatHead(this.senderId,this.userId).subscribe((response) => {
      
      this.chatViewModel.sender = this.senderId;
      this.chatViewModel.receiver = this.userId;

      if(response==null)
        this.chatViewModel.chatHeadId =response
      else
        this.chatViewModel.chatHeadId = response.id;
        
      this.chatViewModel.message = this.messageToUser;
      
      this.chatViewModel.chatType = +this.chatType;
      this.chatViewModel.chatTypeId = null;
      this._signalRService.sendToUser(this.chatViewModel);
      console.log(this.chatViewModel);
      this.chatViewModel = new Object as ChatViewModel;
     
    var result ={receiver:this.sender.firstName,message:this.messageToUser,isTest:false};
    this.generateChatLi(response,this.sender.avatar);
     

      

    });


    // this._signalRService.sendToUser(this.sender.firstName, this.user.id, this.messageToUser);
    // var response ={receiver:this.sender.firstName,message:this.messageToUser,isTest:false};
    // this.generateChatLi(response,this.sender.avatar);

  }

  saveSentMessage(chatViewModel:ChatViewModel){
    this.formData.append('sender',chatViewModel.sender);

    // this.saveChat = this._chatService.saveSentMessage().subscribe((response) => {

    // });

  }

  generateChatLi(response:any,profileImage:string){
    var isFromReciever='you';
    const p: HTMLParagraphElement = this.renderer.createElement('p');
    // if(!response.isTest){
      isFromReciever = 'me'
    // }
//     var li=`<li class="${isFromReciever}">
//     <div class="chat-username d-flex align-items-center mb-2">
//       <img style="max-height: 35px;" src="${profileImage}" alt="" class="rounded-circle me-2">
//       <h2 class="mb-0 font_16 fw_600 text_sec1">${response.receiver}</h2>
//     </div>
//     <div class="message">
//      ${response.message}
//     </div>
//     <div class="teacher-tags hashtag_post tag-boxattachment-outer mt-1 mb-0 hover-tags">
//       <span class="custom-tag"><img src="../../../assets/images/Paper-gray.svg" class="me-1 dark-svg"> <img
//           src="images/Paper-light.svg" class="me-1 light-svg"> Attachment
//         1 <button class="border-0 bg-transparent p-0 position-absolute delete-tag"><img
//             src="images/cross-sm-light.svg"></button></span>
//     </div>
//     <div class="message-time text-end text_ltgray font_12">
//       11:56
//     </div>

//     <div class="forward-reply">
//       <button type="button" class="forward-btn">Answer <img src="images/answer-forward-icon.svg"
//           class="ms-2" /></button><br />
//       <button type="button" class="forward-btn">Forward <img src="images/forward-icon.svg"
//           class="ms-2" /></button>
//     </div>
//   </li>
//   <div class="text-line-border position-relative text-center">
//   <span class="line-text font_12 text_ltgray fw_400 text-center"></span>
// </div>`
//   p.innerHTML =li;
//     this.recieverMessageInfo = response;
//     this.renderer.appendChild(this.chatList.nativeElement, p)
    // document.getElementById('chat')?.appendChild();
    console.log(response)   
  }

  }

  export enum ChartTypeEnum {
    Personal = 1,
    Group, 
    School,
    Class ,
    Course
  }


