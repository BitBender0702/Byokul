import { Component, Injectable } from "@angular/core"; 
import { ActivatedRoute, Router } from "@angular/router";
import { SchoolService } from "src/root/service/school.service";
import { UserService } from "src/root/service/user.service";

@Component({
  selector: 'user-Followers',
  templateUrl: './schoolFollowers.component.html',
  styleUrls: ['./schoolFollowers.component.css']
})

export class SchoolFollowersComponent{

    private _schoolService;
    schoolId!:string;
    isOpenSidebar:boolean = false;
    loadingIcon:boolean = false;
    isDataLoaded:boolean = false;
    schoolFollowers!:any;


    constructor(schoolService: SchoolService,private route: ActivatedRoute,) { 
        this._schoolService = schoolService;
      
      }

    ngOnInit(): void {

      this.loadingIcon = true;
      this.schoolId = this.route.snapshot.paramMap.get('schoolId') ?? '';

      this._schoolService.getSchoolFollowers(this.schoolId).subscribe((response) => {
        this.schoolFollowers = response;
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
}
