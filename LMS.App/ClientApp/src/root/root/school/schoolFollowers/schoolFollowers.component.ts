import { Component, HostListener, Injectable, Injector, OnDestroy, OnInit } from "@angular/core"; 
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { SchoolService } from "src/root/service/school.service";
import { UserService } from "src/root/service/user.service";
import { MultilingualComponent, changeLanguage } from "../../sharedModule/Multilingual/multilingual.component";
import { OpenSideBar } from "src/root/user-template/side-bar/side-bar.component";

@Component({
  selector: 'user-Followers',
  templateUrl: './schoolFollowers.component.html',
  styleUrls: ['./schoolFollowers.component.css']
})

export class SchoolFollowersComponent extends MultilingualComponent implements OnInit, OnDestroy{

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
    changeLanguageSubscription!: Subscription;

    

    constructor(injector: Injector,schoolService: SchoolService,private route: ActivatedRoute,) { 
      super(injector);
      this._schoolService = schoolService;
    }

    ngOnInit(): void {

      this.loadingIcon = true;
      var selectedLang = localStorage.getItem('selectedLanguage');
      this.translate.use(selectedLang ?? '');
      this.schoolId = this.route.snapshot.paramMap.get('schoolId') ?? '';

      this._schoolService.getSchoolFollowers(this.schoolId,this.schoolFollowersPageNumber,this.searchString).subscribe((response) => {
        this.schoolFollowers = response;
        this.loadingIcon = false;
        this.isDataLoaded = true;
      });

      if(!this.changeLanguageSubscription){
        this.changeLanguageSubscription = changeLanguage.subscribe(response => {
          this.translate.use(response.language);
        })
      }

    }

    ngOnDestroy(): void {
      if(this.changeLanguageSubscription){
        this.changeLanguageSubscription.unsubscribe();
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
