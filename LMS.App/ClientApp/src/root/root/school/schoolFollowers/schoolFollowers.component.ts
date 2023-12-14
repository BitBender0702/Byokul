import { Component, ElementRef, HostListener, Injectable, Injector, OnDestroy, OnInit, ViewChild } from "@angular/core"; 
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { SchoolService } from "src/root/service/school.service";
import { UserService } from "src/root/service/user.service";
import { MultilingualComponent, changeLanguage } from "../../sharedModule/Multilingual/multilingual.component";
import { OpenSideBar, notifyMessageAndNotificationCount, totalMessageAndNotificationCount } from "src/root/user-template/side-bar/side-bar.component";
import { TranslateService } from "@ngx-translate/core";
import { MessageService } from "primeng/api";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Constant } from "src/root/interfaces/constant";
import { NotificationType, NotificationViewModel } from "src/root/interfaces/notification/notificationViewModel";
import { ReportFollowerViewModel } from "src/root/interfaces/user/reportFollowerViewModel";
import { SignalrService } from "src/root/service/signalr.service";

@Component({
  selector: 'user-Followers',
  templateUrl: './schoolFollowers.component.html',
  styleUrls: ['./schoolFollowers.component.css'],
  providers: [MessageService]
})

export class SchoolFollowersComponent extends MultilingualComponent implements OnInit, OnDestroy{

    private _schoolService;
    private _userService;
    private _signalrService;
    schoolId!:string;
    isOpenSidebar:boolean = false;
    loadingIcon:boolean = false;
    isDataLoaded:boolean = false;
    schoolFollowers!:any;
    searchString:string = "";
    schoolFollowersPageNumber:number = 1;

    scrolled:boolean = false;
    postLoadingIcon: boolean = false;
    scrollFollowersResponseCount:number = 1;
    reportedFollowerId!:string;
    followerName!: string;
    isSubmitted: boolean = false;
    reportFollowerForm!:FormGroup;
    loginUserName!: string;
    loginUserId!:string;
    isOwner:boolean = false;
    reportFollowerViewModel!:ReportFollowerViewModel;
    notificationViewModel!:NotificationViewModel;
    hamburgerCountSubscription!: Subscription;
    hamburgerCount:number = 0;
    changeLanguageSubscription!: Subscription;
    showSearchButtonForMobile:boolean=false;
    isFollowersTab:boolean=true;

    @ViewChild('closeReportModal') closeReportModal!: ElementRef;

    bannedFollower:any;
    schoolBannedPageNumber:number = 1;
    gender!: string;
    

    constructor(injector: Injector,userService: UserService,signalrService:SignalrService,private translateService: TranslateService,public messageService:MessageService,schoolService: SchoolService,private route: ActivatedRoute,private fb: FormBuilder) { 
      super(injector);
      this._schoolService = schoolService;
      this._userService = userService;
      this._signalrService = signalrService;
    }

    ngOnInit(): void {

      this.loadingIcon = true;
      var selectedLang = localStorage.getItem('selectedLanguage');
      this.gender = localStorage.getItem("gender") ?? '';
      this.translate.use(selectedLang ?? '');
      this.schoolId = this.route.snapshot.paramMap.get('schoolId') ?? '';

      this._schoolService.getSchoolFollowers(this.schoolId,this.schoolFollowersPageNumber,this.searchString).subscribe((response) => {
        this.schoolFollowers = response;
        this.loadingIcon = false;
        this.isDataLoaded = true;
        this.isOwnerOrNot(this.schoolFollowers[0].school.createdById);
        this.initializeReportFollowerViewModel();
      });


      this._schoolService.getBannedUser(this.schoolId, this.schoolBannedPageNumber,this.searchString).subscribe(response =>{
        this.bannedFollower = response.data;
      })



      if(!this.changeLanguageSubscription){
        this.changeLanguageSubscription = changeLanguage.subscribe(response => {
          this.translate.use(response.language);
        })
      }

      if (!this.hamburgerCountSubscription) {
        this.hamburgerCountSubscription = totalMessageAndNotificationCount.subscribe(response => {
          this.hamburgerCount = response.hamburgerCount;
        });
      }

      notifyMessageAndNotificationCount.next({});
      this.reportFollowerForm = this.fb.group({
        reportContent:this.fb.control([],[Validators.required]),
        followerId:this.fb.control('')
      });

    }

    ngOnDestroy(): void {
      if(this.changeLanguageSubscription){
        this.changeLanguageSubscription.unsubscribe();
      }
      if (this.hamburgerCountSubscription) {
        this.hamburgerCountSubscription.unsubscribe();
      }
    }

    getSelectedFollower(followerId:string){
      window.location.href=`user/userProfile/${followerId}`;
    }

    back(): void {
      window.history.back();
    }

    openSidebar(){
      OpenSideBar.next({isOpenSideBar:true})
    }

    schoolFollowersSearch(){
      this.schoolFollowersPageNumber = 1;
      if(this.searchString.length >2 || this.searchString == ""){
        this._schoolService.getSchoolFollowers(this.schoolId,this.schoolFollowersPageNumber,this.searchString).subscribe((response) => {
          this.schoolFollowers = response;
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
        if(this.isFollowersTab){
          this.schoolFollowersPageNumber++;
          this.getSchoolFollowers();
        } else{
          this.schoolBannedPageNumber++;
          this.getBannedUser();
        }
        
       }
      }
  }

  getSchoolFollowers(){
    this._schoolService.getSchoolFollowers(this.schoolId,this.schoolFollowersPageNumber,this.searchString).subscribe((response) => {
      this.schoolFollowers =[...this.schoolFollowers, ...response];
      this.postLoadingIcon = false;
      this.scrollFollowersResponseCount = response.length; 
      this.scrolled = false;
      this.isFollowersTab = true;
    });
  }

  banFollower(userId:string,schoolId:string){
    this.loadingIcon = true;
    this._schoolService.banFollower(userId,schoolId).subscribe((response) => {
      this.ngOnInit();
      const translatedMessage = this.translateService.instant('BannedSuccessfully');
      const translatedSummary = this.translateService.instant('Success');
        this.messageService.add({severity: 'success',summary: translatedSummary,life: 3000,detail: translatedMessage});
    });

  }

  getReportFollower(id:string,followerName:string){
    this.reportedFollowerId = id;
    this.followerName = followerName;
    this.isSubmitted = false;
    this.reportFollowerForm.patchValue({
      reportContent: ''
    });
  }

  reportFollower(){
    this.isSubmitted = true;
    if (!this.reportFollowerForm.valid) {
      return;
    }
    var notificationContent = `${this.schoolFollowers[0].school.schoolName} report a user - ${this.followerName}`
    var postId = Constant.defaultGuid;
    var post = null;
    this.initializeNotificationViewModel(this.reportedFollowerId,NotificationType.Report,notificationContent,postId);
    
    this.reportFollowerViewModel.followerId = this.reportedFollowerId;
    this.reportFollowerViewModel.userName = this.schoolFollowers[0].school.schoolName;
    this.reportFollowerViewModel.followerName = this.followerName;
    this.reportFollowerViewModel.reportReason = this.reportFollowerForm.get('reportContent')?.value;
    this._userService.reportFollower(this.reportFollowerViewModel).subscribe((response) => {
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

  isOwnerOrNot(ownerId:string){
    var validToken = localStorage.getItem("jwt");
      if (validToken != null) {
        let jwtData = validToken.split('.')[1]
        let decodedJwtJsonData = window.atob(jwtData)
        let decodedJwtData = JSON.parse(decodedJwtJsonData);
        this.loginUserId = decodedJwtData.jti;
        this.loginUserName = decodedJwtData.name;
        if(this.loginUserId == ownerId){
          this.isOwner = true;
        }
        else{
          this.isOwner = false;
        }
      }
  }

  private closeReportsModal(): void {
    this.closeReportModal.nativeElement.click();
  }

  initializeReportFollowerViewModel(){
    this.reportFollowerViewModel = {
      followerId:'',
      followerName:'',
      userName:'',
      reportReason:''
    }
  }


  getBannedUser(){
    this._schoolService.getBannedUser(this.schoolId, this.schoolBannedPageNumber,this.searchString).subscribe(response =>{
      this.bannedFollower = response.data;
      this.isFollowersTab = false;
    })
  }


  unBanFollower(userId:string,schoolId:string){
    this.loadingIcon = true;
    this._schoolService.unBanFollower(userId,schoolId).subscribe((response) => {
      const translatedMessage = this.translateService.instant('UnBannedSuccessfully');
      const translatedSummary = this.translateService.instant('Success');
      this.messageService.add({severity: 'success',summary: translatedSummary,life: 3000,detail: translatedMessage});
      this.ngOnInit();
    });

  }


  schoolFollower(){
    this._schoolService.getSchoolFollowers(this.schoolId,this.schoolFollowersPageNumber,this.searchString).subscribe((response) => {
      this.schoolFollowers =[...this.schoolFollowers];
      this.postLoadingIcon = false;
      this.scrollFollowersResponseCount = response.length; 
      this.scrolled = false;
      this.isFollowersTab = true;
    });
  }

  openSearch(){
    this.showSearchButtonForMobile=true;
  }


}
