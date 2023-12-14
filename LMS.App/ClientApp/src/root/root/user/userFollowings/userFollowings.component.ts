import { Component, ElementRef, HostListener, Injectable, Injector, OnDestroy, OnInit, ViewChild } from "@angular/core"; 
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "src/root/service/user.service";
import { MultilingualComponent, changeLanguage } from "../../sharedModule/Multilingual/multilingual.component";
import { Subscription } from "rxjs";
import { FollowUnfollow } from "src/root/interfaces/FollowUnfollow";
import { FollowUnFollowEnum } from "src/root/Enums/FollowUnFollowEnum";
import { OpenSideBar, notifyMessageAndNotificationCount, totalMessageAndNotificationCount } from "src/root/user-template/side-bar/side-bar.component";

@Component({
  selector: 'user-Followers',
  templateUrl: './userFollowings.component.html',
  styleUrls: ['./userFollowings.component.css']
})

export class UserFollowingsComponent extends MultilingualComponent implements OnInit, OnDestroy{

    private _userService;
    userId!:string;
    isOpenSidebar:boolean = false;
    loadingIcon:boolean = false;
    isDataLoaded:boolean = false;
    userFollowings!:any;
    searchString:string = "";
    userFollowingsPageNumber:number = 1;
    scrolled:boolean = false;
    scrollFollowingsResponseCount:number = 1;
    postLoadingIcon: boolean = false;
    followUnfollowUser!: FollowUnfollow;
    isFollowed:boolean = true;
    loginUserId!:string;
    isOwner:boolean = false;
    changeLanguageSubscription!: Subscription;
    gender!: string;
    hamburgerCountSubscription!: Subscription;
    hamburgerCount:number = 0;
    showSearchButtonForMobile:boolean=false;

    constructor(injector: Injector,userService: UserService,private route: ActivatedRoute) { 
      super(injector);
        this._userService = userService;
      
      }

    ngOnInit(): void {

      this.loadingIcon = true;
      var selectedLang = localStorage.getItem('selectedLanguage');
      this.gender = localStorage.getItem("gender") ?? '';
      this.translate.use(selectedLang ?? '');
      this.userId = this.route.snapshot.paramMap.get('userId') ?? '';

      this._userService.getUserFollowings(this.userId,this.userFollowingsPageNumber,this.searchString).subscribe((response) => {
        this.userFollowings = response;
        this.loadingIcon = false;
        this.isDataLoaded = true;
      });

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

      this.isOwnerOrNot();
    }

    ngOnDestroy(): void {
      if(this.changeLanguageSubscription){
        this.changeLanguageSubscription.unsubscribe();
      }
      if (!this.hamburgerCountSubscription) {
        this.hamburgerCountSubscription = totalMessageAndNotificationCount.subscribe(response => {
          this.hamburgerCount = response.hamburgerCount;
        });
      }
    }

    isOwnerOrNot(){
      var validToken = localStorage.getItem("jwt");
        if (validToken != null) {
          let jwtData = validToken.split('.')[1]
          let decodedJwtJsonData = window.atob(jwtData)
          let decodedJwtData = JSON.parse(decodedJwtJsonData);
          this.loginUserId = decodedJwtData.jti;
          if(this.loginUserId == this.userId){
            this.isOwner = true;
          }
          else{
            this.isOwner = false;
          }
        }
    }

    getSelectedFollowing(followingId:string){
      window.location.href=`user/userProfile/${followingId}`;
    }

    back(): void {
      window.history.back();
    }

    openSidebar() {
      OpenSideBar.next({isOpenSideBar:true})
    }

    userFollowingsSearch(){
      this.userFollowingsPageNumber = 1;
      if(this.searchString.length >2 || this.searchString == ""){
        this._userService.getUserFollowings(this.userId,this.userFollowingsPageNumber,this.searchString).subscribe((response) => {
          this.userFollowings = response;
        });
      }
      
    }

    @HostListener("window:scroll", [])
    onWindowScroll() {
      const scrollPosition = window.pageYOffset;
      const windowSize = window.innerHeight;
      const bodyHeight = document.body.offsetHeight;
      
      if (scrollPosition >= bodyHeight - windowSize) {
        if(!this.scrolled && this.scrollFollowingsResponseCount != 0){
        this.scrolled = true;
        this.postLoadingIcon = true;
        this.userFollowingsPageNumber++;
        this.getUserFollowings();
       }
      }
  }

  getUserFollowings(){
    this._userService.getUserFollowings(this.userId,this.userFollowingsPageNumber,this.searchString).subscribe((response) => {
      this.userFollowings =[...this.userFollowings, ...response];
      this.postLoadingIcon = false;
      this.scrollFollowingsResponseCount = response.length; 
      this.scrolled = false;
    });
  }

  followUser(userId:string,from:string){
    var followingUser = this.userFollowings.find((x: { userId: string; }) => x.userId == userId);

    this.InitializeFollowUnfollowUser();
    this.followUnfollowUser.id = userId;
    if(from == FollowUnFollowEnum.Follow){
      this.isFollowed = true;
      this.followUnfollowUser.isFollowed = true;
      followingUser.isUserFollowing = true;
    }
    else{
      this.isFollowed = false;
      this.followUnfollowUser.isFollowed = false;
      followingUser.isUserFollowing = false;
    }
    this._userService.saveUserFollower(this.followUnfollowUser).subscribe((response) => {
      this.InitializeFollowUnfollowUser();
    });
  }

  InitializeFollowUnfollowUser(){
    this.followUnfollowUser = {
      id: '',
      isFollowed: false
     };
  }

  openSearch(){
    this.showSearchButtonForMobile=true;
  }
}
