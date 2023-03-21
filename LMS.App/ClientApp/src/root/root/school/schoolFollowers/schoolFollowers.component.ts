import { Component, HostListener, Injectable } from "@angular/core"; 
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
    searchString:string = "";
    schoolFollowersPageNumber:number = 1;

    scrolled:boolean = false;
    postLoadingIcon: boolean = false;
    scrollFollowersResponseCount:number = 1;




    constructor(schoolService: SchoolService,private route: ActivatedRoute,) { 
        this._schoolService = schoolService;
      
      }

    ngOnInit(): void {

      this.loadingIcon = true;
      this.schoolId = this.route.snapshot.paramMap.get('schoolId') ?? '';

      this._schoolService.getSchoolFollowers(this.schoolId,this.schoolFollowersPageNumber,this.searchString).subscribe((response) => {
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
        this.schoolFollowersPageNumber++;
        this.getSchoolFollowers();
       }
      }
  }

  getSchoolFollowers(){
    this._schoolService.getSchoolFollowers(this.schoolId,this.schoolFollowersPageNumber,this.searchString).subscribe((response) => {
      this.schoolFollowers =[...this.schoolFollowers, ...response];
      this.postLoadingIcon = false;
      this.scrollFollowersResponseCount = response.length; 
      this.scrolled = false;
    });
  }
}
