import { Component, Injectable } from "@angular/core"; 
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


    constructor(userService: UserService,private route: ActivatedRoute,) { 
        this._userService = userService;
      
      }

    ngOnInit(): void {

      this.loadingIcon = true;
      this.userId = this.route.snapshot.paramMap.get('userId') ?? '';

      this._userService.getUserFollowers(this.userId).subscribe((response) => {
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
}
