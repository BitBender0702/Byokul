import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AddUserLanguage } from 'src/root/interfaces/user/addUserLanguage';
import { DeleteUserLanguage } from 'src/root/interfaces/user/deleteUserLanguage';
import { EditUserModel } from 'src/root/interfaces/user/editUserModel';
import { UserService } from 'src/root/service/user.service';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';

import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { BsModalService } from 'ngx-bootstrap/modal';
import { addPostResponse, CreatePostComponent } from '../../createPost/createPost.component';
import { FollowUnFollowEnum } from 'src/root/Enums/FollowUnFollowEnum';
import { FollowUnfollow } from 'src/root/interfaces/FollowUnfollow';
import { PostService } from 'src/root/service/post.service';
import { PostViewComponent } from '../../postView/postView.component';
import { MessageService } from 'primeng/api';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { BehaviorSubject, Subject } from 'rxjs';
import { ReelsViewComponent } from '../../reels/reelsView.component';
import { SignalrService } from 'src/root/service/signalr.service';
import { NotificationType, NotificationViewModel } from 'src/root/interfaces/notification/notificationViewModel';
import { PostAuthorTypeEnum } from 'src/root/Enums/postAuthorTypeEnum';
import { CertificateViewComponent } from '../../certificateView/certificateView.component';

export const userImageResponse =new Subject<{userAvatar : string}>();  
export const chatResponse =new Subject<{receiverId : string , type: string,chatTypeId:string}>();  



@Component({
    selector: 'userProfile-root',
    templateUrl: './userProfile.component.html',
    styleUrls: ['./userProfile.component.css'],
    providers: [MessageService]
  })

  export class UserProfileComponent extends MultilingualComponent implements OnInit {

    @BlockUI() blockUi!: NgBlockUI;

    isOpenSidebar:boolean = false;
    isDataLoaded:boolean = false;
    isSubmitted: boolean = false;
    isOpenModal:boolean = false;
    loadingIcon:boolean = false;
    postLoadingIcon: boolean = false;
    reelsLoadingIcon:boolean = false;
    blockedDocument: boolean = false;
    isProfileGrid:boolean = true;
    userId!:string;
    isFollowed!:boolean;
    likesLength!:number;
    isLiked!:boolean;

    private _userService;
    private _postService;
    private _signalrService;
    user:any;
    validToken!:string;

    userLanguage!:AddUserLanguage;
    deleteLanguage!: DeleteUserLanguage;
    filteredLanguages!: any[];
    languages:any;
    EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
    editUser:any;
    editUserForm!:FormGroup;
    languageForm!:FormGroup;
    updateUserDetails!:EditUserModel;
    isOwner!:boolean;
    followUnfollowUser!: FollowUnfollow;
    followersLength!:number;
    likeUnlikePost!: LikeUnlikePost;
    currentLikedPostId!:string;
    postView!:PostView;
    loginUserId!:string;
    gridItemInfo:any;
    isGridItemInfo: boolean = false;
    userParamsData$: any;

    itemsPerSlide = 7;
    singleSlideOffset = true;
    noWrap = true;

    frontEndPageNumber:number = 1;
    reelsPageNumber:number = 1;
    scrolled:boolean = false;
    scrollFeedResponseCount:number = 1;
    notificationViewModel!:NotificationViewModel;
    @ViewChild('closeEditModal') closeEditModal!: ElementRef;
    @ViewChild('closeLanguageModal') closeLanguageModal!: ElementRef;
    @ViewChild('imageFile') imageFile!: ElementRef;
    @ViewChild('carousel') carousel!: ElementRef;

    @ViewChild('createPostModal', { static: true }) createPostModal!: CreatePostComponent;


    uploadImage!:any;
    fileToUpload= new FormData();
    translate!: TranslateService;
    
    constructor(injector: Injector,signalrservice:SignalrService,public messageService:MessageService, private bsModalService: BsModalService,userService: UserService,postService: PostService,private route: ActivatedRoute,private domSanitizer: DomSanitizer,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute) { 
      super(injector);
        this._userService = userService;
        this._postService = postService;
        this._signalrService = signalrservice;
        this.userParamsData$ = this.route.params.subscribe(routeParams => {
          if(!this.loadingIcon)
          this.ngOnInit();
        });
    }
  
    ngOnInit(): void {
      this.postLoadingIcon = false;
      //document.addEventListener('scroll', this.myScrollFunction, false);

      this.validToken = localStorage.getItem("jwt")?? '';
      this.loadingIcon = true;
      // this.blockUI();
      var selectedLang = localStorage.getItem("selectedLanguage");
      this.translate.use(selectedLang?? '');
      
      var id = this.route.snapshot.paramMap.get('userId');
      this.userId = id ?? '';

      
      // this.getByUserId(this.userId);
      this._userService.getUserById(this.userId).subscribe((response) => {
        debugger
        this.frontEndPageNumber = 1;
        this.reelsPageNumber = 1;
        this.user = response;
        this.followersLength = this.user.followers.length;
        this.isOwnerOrNot();
        this.loadingIcon = false;
        this.scrolled = false;
        this.postLoadingIcon = false;
        // this.unblockUI();
        this.isDataLoaded = true;
        if(this.carousel!=undefined){
          if($('carousel')[0].querySelectorAll('a.carousel-control-next')[0])
          {
            $('carousel')[0].querySelectorAll('a.carousel-control-next')[0].addEventListener('click', () => {
              this.reelsPageNumber++;
              if(this.reelsPageNumber == 2){
                this.reelsLoadingIcon = true;
              }
              this._userService.getReelsByUserId(this.user.id, this.reelsPageNumber).subscribe((response) => {
                 this.user.reels = [...this.user.reels, ...response];
                 this.reelsLoadingIcon = false;
            });

            })
          }  
      }
      });

      this._userService.getLanguageList().subscribe((response) => {
        this.languages = response;
      });

      this.userLanguage = {
        userId: '',
        languageIds: []
       };

       this.languageForm = this.fb.group({
        languages:this.fb.control([],[Validators.required]),
      });

       this.deleteLanguage = {
        userId: '',
        languageId: ''
       };

       this.editUserForm = this.fb.group({
        firstName: this.fb.control(''),
        lastName: this.fb.control(''),
        dob: this.fb.control(''),
        gender: this.fb.control(''),
        description: this.fb.control(''),
        contactEmail: this.fb.control('')
      });

      this.InitializeFollowUnfollowUser();
      this.InitializeLikeUnlikePost();
      this.InitializePostView();

      userImageResponse.subscribe(response => {
        
        this.user.avatar = response.userAvatar;
        // this.ngOnInit();
      });

      addPostResponse.subscribe(response => {
        this.loadingIcon = true;
        this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post created successfully'});
        this._userService.getUserById(this.userId).subscribe((response) => {
          
          this.user = response;
          this.followersLength = this.user.followers.length;
          this.isOwnerOrNot();
          this.loadingIcon = false;
          // this.unblockUI();
          this.isDataLoaded = true;
          this.scrolled = false;
          this.postLoadingIcon = false;
        });
      });


    }

    getByUserId(){
      if(this.userId == undefined){
        this.postLoadingIcon = true;
        return;
      }
      this._userService.getPostsByUserId(this.userId,this.frontEndPageNumber).subscribe((response) => {
        this.user.posts =[...this.user.posts, ...response];
        this.postLoadingIcon = false;
        this.scrollFeedResponseCount = response.length; 
        this.scrolled = false;
        // this.followersLength = this.user.followers.length;
        // this.isOwnerOrNot();
        // this.loadingIcon = false;
        // // this.unblockUI();
        // this.isDataLoaded = true;
      });
    }

    

    ngOnDestroy(): void {
      if(this.userParamsData$) this.userParamsData$.unsubscribe();
    }

    @HostListener("window:scroll", [])
    onWindowScroll() {
      if(!this.scrolled && this.scrollFeedResponseCount != 0){
        this.scrolled = true;
        this.postLoadingIcon = true;
        this.frontEndPageNumber++;
        this.getByUserId();
      }
    }
    //     myScrollFunction= (ev: any): void => {
    //       this.postLoadingIcon = true;
    //       this.frontEndPageNumber++;
    //       this.getByUserId();
         
    // }

    
   


    InitializeFollowUnfollowUser(){
      this.followUnfollowUser = {
        id: '',
        isFollowed: false
       };
    }

    InitializePostView(){
      this.postView = {
        postId: '',
        userId: ''
       };
    }

    InitializeLikeUnlikePost(){
      this.likeUnlikePost = {
        postId: '',
        userId: '',
        isLike:false,
        commentId:''
       };

    }

    isOwnerOrNot(){
      var validToken = localStorage.getItem("jwt");
        if (validToken != null) {
          let jwtData = validToken.split('.')[1]
          let decodedJwtJsonData = window.atob(jwtData)
          let decodedJwtData = JSON.parse(decodedJwtJsonData);
          this.loginUserId = decodedJwtData.jti;
          if(decodedJwtData.sub == this.user.email){
            this.isOwner = true;
          }
          else{
            this.isOwner = false;
            this.isFollowedOwnerOrNot(decodedJwtData.jti);
          }

        }
        
    }

    isFollowedOwnerOrNot(userId:string){
      var followers: any[] = this.user.followers;
      var isFollowed = followers.filter(x => x.followerId == userId);
      if(isFollowed.length != 0){
        this.isFollowed = true;
      }
      else{
        this.isFollowed = false;
      }
    //   const isFound = this.user.followers.some(element => {
    //     if (element.followerId === 1) {
    //       this.isFollowed = true;
    //     }
    //     else{
    //     this.isFollowed = false;
    //     }

    // }
  }

    captureLanguageId(event: any) {
      var languageId = event.id;
      this.userLanguage.languageIds.push(languageId);
    }

    filterLanguages(event:any) {

      var userLanguages: any[] = this.user.languages;
      var languages: any[] = this.languages;
      this.languages = languages.filter(x => !userLanguages.find(y => y.id == x.id));
      
      let filtered: any[] = [];
      let query = event.query;
      for (let i = 0; i < this.languages.length; i++) {
        let language = this.languages[i];
        if (language.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
          filtered.push(language);
        }
      }
      this.filteredLanguages = filtered;
    }

    saveUserLanguages(){
      
      this.isSubmitted = true;
      if (!this.languageForm.valid) {
        return;
      }
      this.loadingIcon = true;
      this.userLanguage.userId = this.user.id;
      this._userService.saveUserLanguages(this.userLanguage).subscribe((response:any) => {
        
        this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Language added successfully'});
        this.closeLanguagesModal();
        this.isSubmitted = true;
        this.ngOnInit();     
  
      });
    }

    deleteUserLanguage(){
      this.loadingIcon = true;
      this.deleteLanguage.userId = this.user.id;
      this._userService.deleteUserLanguage(this.deleteLanguage).subscribe((response:any) => {
        this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Language deleted successfully'});
        this.ngOnInit();
      });
    }

    getDeletedLanguage(deletedLanguage:string){
      this.deleteLanguage.languageId = deletedLanguage;
    }

    followUser(userId:string,from:string){
      if(this.validToken == ''){
        window.open('user/auth/login', '_blank');
      }
      else{
      this.followUnfollowUser.id = userId;
      if(from == FollowUnFollowEnum.Follow){
        this.followersLength += 1;
        this.isFollowed = true;
        this.followUnfollowUser.isFollowed = true;
        var notificationContent = "followed you"
        var postId = '00000000-0000-0000-0000-000000000000';
        var post = null;
        this.initializeNotificationViewModel(userId,NotificationType.Followings,notificationContent,postId);
      }
      else{
        this.followersLength -= 1; 
        this.isFollowed = false;
        this.followUnfollowUser.isFollowed = false;
      }
      this._userService.saveUserFollower(this.followUnfollowUser).subscribe((response) => {
        this.InitializeFollowUnfollowUser();
      });
    }
    }

    initializeNotificationViewModel(userid:string,notificationType:NotificationType,notificationContent:string,postId:string,postType?:number,post?:any){
      this._userService.getUser(this.loginUserId).subscribe((response) => {
        this.notificationViewModel = {
          id:'00000000-0000-0000-0000-000000000000',
          userId: userid,
          actionDoneBy: this.loginUserId,
          avatar: response.avatar,
          isRead:false,
          notificationContent:`${response.firstName + ' ' + response.lastName + ' ' + notificationContent}`,
          notificationType:notificationType,
          postId:postId,
          postType:postType,
          post:post
        }
        this._signalrService.sendNotification(this.notificationViewModel);
      });
    }

    getUserDetails(userId:string){
      this._userService.getUserEditDetails(userId).subscribe((response) => {
        this.editUser = response;
        this.initializeEditFormControls();
    })
  }

  initializeEditFormControls(){
    this.uploadImage = '';
    this.imageFile.nativeElement.value = "";
    this.fileToUpload.set('avatarImage','');
    
    var dob = this.editUser.dob;
    if(dob!=null){
      dob = dob.substring(0, dob.indexOf('T'));
    }

    this.editUserForm = this.fb.group({
      firstName: this.fb.control(this.editUser.firstName,[Validators.required]),
      lastName: this.fb.control(this.editUser.lastName,[Validators.required]),
      dob: this.fb.control(dob,[Validators.required]),
      gender: this.fb.control(this.editUser.gender,[Validators.required]),
      description: this.fb.control(this.editUser.description??''),
      contactEmail: this.fb.control(this.editUser.contactEmail??'',[Validators.pattern(this.EMAIL_PATTERN)])
    });
    this.editUserForm.updateValueAndValidity();
  }

  handleImageInput(event: any) {
    this.fileToUpload.append("avatarImage", event.target.files[0], event.target.files[0].name);
    const reader = new FileReader();
    reader.onload = (_event) => { 
        this.uploadImage = _event.target?.result; 
        this.uploadImage = this.domSanitizer.bypassSecurityTrustUrl(this.uploadImage);
    }
    reader.readAsDataURL(event.target.files[0]); 
  }

  updateUser(){
    
    this.isSubmitted=true;
    if (!this.editUserForm.valid) {
      return;
    }
    this.loadingIcon = true;
    // this.blockUI();

    if(!this.uploadImage){
      this.fileToUpload.append('avatar', this.editUser.avatar);

    }

    this.updateUserDetails=this.editUserForm.value;
    this.fileToUpload.append('id', this.user.id);
    this.fileToUpload.append('firstName', this.updateUserDetails.firstName);
    this.fileToUpload.append('lastName', this.updateUserDetails.lastName);
    this.fileToUpload.append('dob', this.updateUserDetails.dob);
    this.fileToUpload.append('gender',this.updateUserDetails.gender.toString());
    this.fileToUpload.append('description',this.updateUserDetails.description);
    this.fileToUpload.append('contactEmail',this.updateUserDetails.contactEmail);

    this._userService.editUser(this.fileToUpload).subscribe((response:any) => {
      this.closeModal();
      this.isSubmitted=true;
      userImageResponse.next({userAvatar: response.avatar}); 
      this.fileToUpload = new FormData();
      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Profile updated successfully'});
      this.ngOnInit();
    });

  }
  
  private closeModal(): void {
    this.closeEditModal.nativeElement.click();
  }

  private closeLanguagesModal(): void {
    this.closeLanguageModal.nativeElement.click();
  }

omit_special_char(event:any)
{   
   var k;  
   k = event.charCode;
   return((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57)); 
}

removeLanguage(event: any){
  const languageIndex = this.userLanguage.languageIds.findIndex((item) => item === event.id);
  if (languageIndex > -1) {
    this.userLanguage.languageIds.splice(languageIndex, 1);
  }
}

resetLanguageModal(){
  this.isSubmitted = false;
  this.languageForm.setValue({
    languages: [],
  });
}

createPost(){
  this.isOpenModal = true;

}

blockUI() {
  this.blockUi.start("Loading");
}

unblockUI(){
  this.blockUi.stop();
}

profileGrid(){
  this.isProfileGrid = true;

}

profileList(){
  this.isProfileGrid = false;

}

back(): void {
  window.history.back();
}

openPostModal(): void {
  const initialState = {
    userId: this.user.id,
    from: "user"
  };
    this.bsModalService.show(CreatePostComponent,{initialState});
}

pinUnpinPost(attachmentId:string,isPinned:boolean){
  this._postService.pinUnpinPost(attachmentId,isPinned).subscribe((response) => {
    this.ngOnInit();
    console.log(response);
  });

}

openPostsViewModal(posts:string): void {
  const initialState = {
    posts: posts
  };
  this.bsModalService.show(PostViewComponent,{initialState});
}

openReelsViewModal(postAttachmentId:string): void {
  const initialState = {
    postAttachmentId: postAttachmentId
  };
  this.bsModalService.show(ReelsViewComponent,{initialState});
}

userChat(){
  if(this.validToken == ''){
    window.open('user/auth/login', '_blank');
  }
  else{
    window.location.href=`user/chat`;
  }   
}

likeUnlikePosts(postId:string, isLike:boolean,postType:number,post:any){
  this.currentLikedPostId = postId;
  this.user.posts.filter((p : any) => p.id == postId).forEach( (item : any) => {
    var likes: any[] = item.likes;
    var isLiked = likes.filter(x => x.userId == this.loginUserId && x.postId == postId);
  if(isLiked.length != 0){
    this.isLiked = false;
    this.likesLength = item.likes.length - 1;
    item.isPostLikedByCurrentUser = false;
  }
  else{
    this.isLiked = true;
    this.likesLength = item.likes.length + 1;
    item.isPostLikedByCurrentUser = true;
    var notificationType = NotificationType.Likes;
    var notificationContent = "liked your post";
    this.initializeNotificationViewModel(post.createdBy,notificationType,notificationContent,postId,postType,post);
  }
  }); 
  
 
  this.likeUnlikePost.postId = postId;
  this.likeUnlikePost.isLike = isLike;
  this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
  this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
     this.user.posts.filter((p : any) => p.id == postId).forEach( (item : any) => {
      var itemss = item.likes;
      item.likes = response;
    }); 




     this.InitializeLikeUnlikePost();
     console.log("succes");
  });


}

showPostDiv(postId:string){
  
  var posts: any[] = this.user.posts;
  this.gridItemInfo = posts.find(x => x.id == postId);
  this.isGridItemInfo = true;

  // here we also add a view for this post
  this.addPostView(this.gridItemInfo.id);
  

}

addPostView(postId:string){
  
  if(this.loginUserId != undefined){
   this.initializePostView();
  this.postView.postId = postId;
  this._postService.postView(this.postView).subscribe((response) => {
    
    this.gridItemInfo.views.length = response;
    // this.user.posts.filter((p : any) => p.id == postId).forEach( (item : any) => {
    //  var itemss = item.likes;
    //  item.likes = response;
   }); 
  }

 

}

initializePostView(){
  this.postView ={
    postId:'',
    userId:''
   }
}

hideGridItemInfo(){
  this.isGridItemInfo = this.isGridItemInfo ? false : true;

}

openChat(userId:string,type:string){
var chatTypeId = ''
  // this.router.navigate(['user/chats', {chatHead_object: JSON.stringify({receiverId: userId, type : type,chatTypeId:''})}]);

  this.router.navigate(
    [`user/chats`],
    { state: { chatHead: {receiverId: userId, type : type,chatTypeId:''} } });
}

openCertificateViewModal(certificateUrl:string,certificateName:string){
  debugger
  const initialState = {
    certificateUrl: certificateUrl,
    certificateName:certificateName,
    from:PostAuthorTypeEnum.School
  };
  this.bsModalService.show(CertificateViewComponent, { initialState });
}

}


