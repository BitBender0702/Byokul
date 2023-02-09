import { Component, ElementRef, Injector, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { PostService } from 'src/root/service/post.service';
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
    private _postService;
    //reelId!:string;
    reels:any;
    isOpenSidebar:boolean = false;
    isDataLoaded:boolean = false;
    showCommentsField:boolean = true;
    senderId!:string;
    sender:any;
    messageToGroup!:string;
    userId!:string;
    user:any;
    private _signalRService;
    private _userService;
    currentLikedPostId!:string;
    likesLength!:number;
    isLiked!:boolean;
    likeUnlikePost!: LikeUnlikePost;
    postView!:PostView;
    loginUserId!:string;

    postAttachmentId:any;

    @ViewChild('groupChatList') groupChatList!: ElementRef;

    constructor(private bsModalService: BsModalService,private renderer: Renderer2,public options: ModalOptions,private userService: UserService,postService: PostService,public signalRService: SignalrService,private route: ActivatedRoute,reelsService: ReelsService,private activatedRoute: ActivatedRoute) { 
        // super(injector);
          this._reelsService = reelsService;
          this._signalRService = signalRService;
          this._userService = userService;
          this._postService = postService;
  
      }

    ngOnInit(): void {
      

        this.getLoginUserId();
        //this.reelId = this.route.snapshot.paramMap.get('id') ?? '';
        this.postAttachmentId = this.options.initialState;
        this._reelsService.getReelById(this.postAttachmentId.postAttachmentId).subscribe((response) => {
            this.reels = response;
            this.addPostView(this.reels.post.id);
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


          this.InitializeLikeUnlikePost();
          this.InitializePostView();



    }

    getLoginUserId(){
      var validToken = localStorage.getItem("jwt");
      if (validToken != null) {
        let jwtData = validToken.split('.')[1]
        let decodedJwtJsonData = window.atob(jwtData)
        let decodedJwtData = JSON.parse(decodedJwtJsonData);
        this.loginUserId = decodedJwtData.jti;
      }
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

    InitializeLikeUnlikePost(){
      this.likeUnlikePost = {
        postId: '',
        userId: '',
        isLike:false,
        commentId:''
       };

    }

    InitializePostView(){
      this.postView = {
        postId: '',
        userId: ''
       };

    }

    back(): void {
        window.history.back();
      }

    openSidebar(){
        this.isOpenSidebar = true;
    
      }

      likeUnlikePosts(postId:string, isLike:boolean){
        this.currentLikedPostId = postId;
        // this.user.posts.filter((p : any) => p.id == postId).forEach( (item : any) => {
          var likes: any[] = this.reels.post.likes;
          var isLiked = likes.filter(x => x.userId == this.loginUserId && x.postId == postId);
        if(isLiked.length != 0){
          this.isLiked = false;
          this.likesLength = this.reels.post.likes.length - 1;
          this.reels.post.isPostLikedByCurrentUser = false;
        }
        else{
          this.isLiked = true;
          this.likesLength = this.reels.post.likes.length + 1;
          this.reels.post.isPostLikedByCurrentUser = true;
      
        }

        
       
        this.likeUnlikePost.postId = postId;
        this.likeUnlikePost.isLike = isLike;
        this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
        this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
           this.reels.post.likes = response;
           this.InitializeLikeUnlikePost();
           console.log("succes");
        });
      
      
      }

      addPostView(postId:string){
        
        if(this.loginUserId != undefined){
        this.postView.postId = postId;
        this._postService.postView(this.postView).subscribe((response) => {
          
          console.log('success');
          this.reels.post.views.length = response;
          // this.user.posts.filter((p : any) => p.id == postId).forEach( (item : any) => {
          //  var itemss = item.likes;
          //  item.likes = response;
         }); 
        }
      
      }

      close(): void {
        this.bsModalService.hide();
        //this.addAttachmentModal.nativeElement.click();
      }

  }
