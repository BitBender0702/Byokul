import { Component, ElementRef, HostListener, Injectable, ViewChild } from "@angular/core"; 
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "src/root/service/user.service";

@Component({
  selector: 'user-Followers',
  templateUrl: './userFollowings.component.html',
  styleUrls: ['./userFollowings.component.css']
})

export class UserFollowingsComponent{

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

    constructor(userService: UserService,private route: ActivatedRoute,) { 
        this._userService = userService;
      
      }

    ngOnInit(): void {

      this.loadingIcon = true;
      this.userId = this.route.snapshot.paramMap.get('userId') ?? '';

      this._userService.getUserFollowings(this.userId,this.userFollowingsPageNumber,this.searchString).subscribe((response) => {
        this.userFollowings = response;
        this.loadingIcon = false;
        this.isDataLoaded = true;
      });

    }

    getSelectedFollowing(followingId:string){
      window.location.href=`user/userProfile/${followingId}`;
    }

    back(): void {
      window.history.back();
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
}
