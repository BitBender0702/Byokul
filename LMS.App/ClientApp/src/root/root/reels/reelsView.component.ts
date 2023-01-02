import { Component, ElementRef, Injector, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReelsService } from 'src/root/service/reels.service';
import { signalRResponse, SignalrService } from 'src/root/service/signalr.service';
import { UserService } from 'src/root/service/user.service';

@Component({
    selector: 'reels-view',
    templateUrl: 'reelsView.component.html',
    styleUrls: ['reelsView.component.css'],
  })
  
  export class ReelsViewComponent implements OnInit {

    private _reelsService;
    reelId!:string;
    reels:any;
    isOpenSidebar:boolean = false;
    isDataLoaded:boolean = false;
    showCommentsField:boolean = false;
    senderId!:string;
    sender:any;
    messageToGroup!:string;
    userId!:string;
    user:any;
    private _signalRService;
    private _userService;

    @ViewChild('groupChatList') groupChatList!: ElementRef;

    constructor(private renderer: Renderer2,private userService: UserService,public signalRService: SignalrService,private route: ActivatedRoute,reelsService: ReelsService,private activatedRoute: ActivatedRoute) { 
        // super(injector);
          this._reelsService = reelsService;
          this._signalRService = signalRService;
          this._userService = userService;
  
      }

    ngOnInit(): void {

        
        this.reelId = this.route.snapshot.paramMap.get('id') ?? '';
        this._reelsService.getReelById(this.reelId).subscribe((response) => {
            this.reels = response;
            this.isDataLoaded = true;
            // this.loadingIcon = false;
          });

          var validToken = localStorage.getItem("jwt");
          if (validToken != null) {
          let jwtData = validToken.split('.')[1]
          let decodedJwtJsonData = window.atob(jwtData)
          let decodedJwtData = JSON.parse(decodedJwtJsonData);
          this.senderId = decodedJwtData.jti;

        this._userService.getUser(this.senderId).subscribe((response) => {
          this.sender = response;
        });
        
      }

          this.signalRService.startConnection();

          setTimeout(() => {
            this._signalRService.createGroupName();
            this._signalRService.askServerListener();
            this._signalRService.askServer(this.sender.id);
          }, 5000);

          signalRResponse.subscribe(response => {
            //this.getSenderInfo(response.receiver);
             this.generateChatDiv(response,this.sender.avatar);
          });


    }

    sendToGroup(){
      this._signalRService.sendToGroup(this.sender.id,this.messageToGroup);
      var response ={receiver:this.sender.firstName,message:this.messageToGroup,isTest:false};
      // this.generateChatDiv(response,this.sender.avatar);
      }

    generateChatDiv(response:any,profileImage:string){
      const p: HTMLParagraphElement = this.renderer.createElement('p');

      var li=`<div class="live-message d-flex position-relative align-items-start">
      <img src="${profileImage}" class="comment-user">
      <p class="text_sec1 font_12 fw_400 text-start mb-0">${response.message}</p>
      <button type="button" class="btn bg-transparent text_ltgray font_12 p-0 border-0 reel-like-chat"><img
          src="../../../assets/images/Heart-dark.svg" class="d-block" /> 34</button>
      <button type="button" class="border-0 bg-transparent pinned-chat"><img src="../../../assets/images/pinned.svg" /></button>
    </div>`
    p.innerHTML =li;
      // this.recieverMessageInfo = response;
      this.renderer.appendChild(this.groupChatList.nativeElement, p)
      // document.getElementById('chat')?.appendChild();
      console.log(response)   
    }

    getSenderInfo(userId:string){
      this._userService.getUser(userId).subscribe((response) => {
        this.user = response;
        this.generateChatDiv(response,this.user.avatar);
      });
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

    openSidebar(){
        this.isOpenSidebar = true;
    
      }

  }