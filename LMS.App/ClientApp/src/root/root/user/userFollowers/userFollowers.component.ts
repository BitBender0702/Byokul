import { Component, ElementRef, HostListener, Injectable, Injector, OnDestroy, OnInit, ViewChild } from "@angular/core"; 
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { UserService } from "src/root/service/user.service";
import { MultilingualComponent, changeLanguage } from "../../sharedModule/Multilingual/multilingual.component";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { constants } from "buffer";
import { Constant } from "src/root/interfaces/constant";
import { NotificationType, NotificationViewModel } from "src/root/interfaces/notification/notificationViewModel";
import { SignalrService } from "src/root/service/signalr.service";
import { ReportFollowerViewModel } from "src/root/interfaces/user/reportFollowerViewModel";
import { MessageService } from "primeng/api";

@Component({
  selector: 'user-Followers',
  templateUrl: './userFollowers.component.html',
  styleUrls: ['./userFollowers.component.css'],
  providers: [MessageService]
})

export class UserFollowersComponent extends MultilingualComponent implements OnInit, OnDestroy {

    private _userService;
    private _signalrService;
    userId!:string;
    isOpenSidebar:boolean = false;
    loadingIcon:boolean = false;
    isDataLoaded:boolean = false;
    userFollowers!:any;
    searchString:string = "";
    userFollowersPageNumber:number = 1;
    scrolled:boolean = false;
    scrollFollowersResponseCount:number = 1;
    postLoadingIcon: boolean = false;
    loginUserId!:string;
    loginUserName!: string;
    followerName!: string;
    isOwner:boolean = false;
    changeLanguageSubscription!: Subscription;
    reportFollowerForm!:FormGroup;
    isSubmitted: boolean = false;
    reportedFollowerId!:string;
    notificationViewModel!:NotificationViewModel;
    reportFollowerViewModel!:ReportFollowerViewModel
    @ViewChild('closeReportModal') closeReportModal!: ElementRef;

    constructor(injector: Injector,public messageService:MessageService,userService: UserService,signalrService:SignalrService,private route: ActivatedRoute,private fb: FormBuilder) { 
      super(injector);
      this._userService = userService;
      this._signalrService = signalrService;
      
    }

    ngOnInit(): void {
      this.loadingIcon = true;
      var selectedLang = localStorage.getItem('selectedLanguage');
      this.translate.use(selectedLang ?? '');
      this.userId = this.route.snapshot.paramMap.get('userId') ?? '';

      this._userService.getUserFollowers(this.userId,this.userFollowersPageNumber,this.searchString).subscribe((response) => {
        this.userFollowers = response;
        this.loadingIcon = false;
        this.isDataLoaded = true;
      });

      if(!this.changeLanguageSubscription){
        this.changeLanguageSubscription = changeLanguage.subscribe(response => {
          this.translate.use(response.language);
        })
      }

      this.reportFollowerForm = this.fb.group({
        reportContent:this.fb.control([],[Validators.required]),
        followerId:this.fb.control('')
      });

      this.isOwnerOrNot();
      this.initializeReportFollowerViewModel();
    }

    ngOnDestroy(): void {
      if(this.changeLanguageSubscription){
        this.changeLanguageSubscription.unsubscribe();
      }
    }

    initializeReportFollowerViewModel(){
      this.reportFollowerViewModel = {
        followerId:'',
        followerName:'',
        userName:'',
        reportReason:''
      }
    }
    isOwnerOrNot(){
      var validToken = localStorage.getItem("jwt");
        if (validToken != null) {
          let jwtData = validToken.split('.')[1]
          let decodedJwtJsonData = window.atob(jwtData)
          let decodedJwtData = JSON.parse(decodedJwtJsonData);
          this.loginUserId = decodedJwtData.jti;
          this.loginUserName = decodedJwtData.name;
          if(this.loginUserId == this.userId){
            this.isOwner = true;
          }
          else{
            this.isOwner = false;
          }
        }
    }
    
    getSelectedFollower(followerId:string){
      window.location.href=`user/userProfile/${followerId}`;
    }

    back(): void {
      window.history.back();
    }

    banFollower(userId:string){
      this.loadingIcon = true;
      this._userService.banFollower(userId).subscribe((response) => {
        this.ngOnInit();
      });

    }

    userFollowersSearch(){
      this.userFollowersPageNumber = 1;
      if(this.searchString.length >2 || this.searchString == ""){
        this._userService.getUserFollowers(this.userId,this.userFollowersPageNumber,this.searchString).subscribe((response) => {
          this.userFollowers = response;
        });
      }
      
    }

    @HostListener("window:scroll", [])
    onWindowScroll() {
      const scrollPosition = window.pageYOffset;
      const windowSize = window.innerHeight;
      const bodyHeight = document.body.offsetHeight;
      
      if (scrollPosition >= bodyHeight - windowSize) {
        if(!this.scrolled && this.scrollFollowersResponseCount != 0){
        this.scrolled = true;
        this.postLoadingIcon = true;
        this.userFollowersPageNumber++;
        this.getUserFollowers();
       }
      }
  }

  getUserFollowers(){
    this._userService.getUserFollowers(this.userId,this.userFollowersPageNumber,this.searchString).subscribe((response) => {
      this.userFollowers =[...this.userFollowers, ...response];
      this.postLoadingIcon = false;
      this.scrollFollowersResponseCount = response.length; 
      this.scrolled = false;
    });
  }

  private closeReportsModal(): void {
    this.closeReportModal.nativeElement.click();
  }

  getReportFollower(id:string,followerName:string){
    debugger
    this.reportedFollowerId = id;
    this.followerName = followerName;
    this.isSubmitted = false;
    this.reportFollowerForm.patchValue({
      reportContent: ''
    });
  }

  reportFollower(){
    debugger
    this.isSubmitted = true;
    if (!this.reportFollowerForm.valid) {
      return;
    }
    var notificationContent = `${this.loginUserName} report a user - ${this.followerName}`
    var postId = Constant.defaultGuid;
    var post = null;
    this.initializeNotificationViewModel(this.reportedFollowerId,NotificationType.Report,notificationContent,postId);
    
    this.reportFollowerViewModel.followerId = this.reportedFollowerId;
    this.reportFollowerViewModel.userName = this.loginUserName;
    this.reportFollowerViewModel.followerName = this.followerName;
    this.reportFollowerViewModel.reportReason = this.reportFollowerForm.get('reportContent')?.value;
    this._userService.reportFollower(this.reportFollowerViewModel).subscribe((response) => {
      debugger
      this.closeReportsModal();
      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Report submitted successfully'});
    });
  }

  initializeNotificationViewModel(userid:string,notificationType:NotificationType,notificationContent:string,postId:string,postType?:number,post?:any){
    this._userService.getUser(this.loginUserId).subscribe((response) => {
      this.notificationViewModel = {
        id:Constant.defaultGuid,
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
}
