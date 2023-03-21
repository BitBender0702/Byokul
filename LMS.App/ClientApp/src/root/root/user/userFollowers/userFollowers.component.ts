import { Component, ElementRef, HostListener, Injectable, ViewChild } from "@angular/core"; 
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "src/root/service/user.service";

@Component({
  selector: 'user-Followers',
  templateUrl: './userFollowers.component.html',
  styleUrls: ['./userFollowers.component.css']
})

export class UserFollowersComponent{

    private _userService;
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

    constructor(userService: UserService,private route: ActivatedRoute,) { 
        this._userService = userService;
      
      }

    ngOnInit(): void {

      this.loadingIcon = true;
      this.userId = this.route.snapshot.paramMap.get('userId') ?? '';

      this._userService.getUserFollowers(this.userId,this.userFollowersPageNumber,this.searchString).subscribe((response) => {
        this.userFollowers = response;
        this.loadingIcon = false;
        this.isDataLoaded = true;
      });

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
}
