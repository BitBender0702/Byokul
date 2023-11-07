import { Component, HostListener, Injector, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from 'src/root/service/user.service';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { OpenSideBar, notifyMessageAndNotificationCount, totalMessageAndNotificationCount } from 'src/root/user-template/side-bar/side-bar.component';
import { SchoolService } from 'src/root/service/school.service';
import { ClassService } from 'src/root/service/class.service';
import { PostService } from 'src/root/service/post.service';
import { CourseService } from 'src/root/service/course.service';

@Component({
    selector: 'globalSearch',
    templateUrl: './globalSearch.component.html',
    styleUrls: ['./globalSearch.component.css'],
    providers: [MessageService]
  })

  export class GlobalSearchComponent extends MultilingualComponent implements OnInit , OnDestroy{
    private _userService;
    private _schoolService;
    private _classService;
    private _postService;
    private _courseService;
    isDataLoaded:boolean = false;
    loadingIcon:boolean = false;
    postLoadingIcon: boolean = false;
    searchString:string = '';
    globalSearchPageNumber:number = 1;
    scrollSearchResponseCount:number = 1;
    globalSearchPageSize:number = 22;
    globalSearchResult:any;
    scrolled:boolean = false;
    searchType:any;
    hamburgerCountSubscription!: Subscription;
    hamburgerCount:number = 0;
    changeLanguageSubscription!: Subscription;

    constructor( injector: Injector,private route: ActivatedRoute,userService:UserService,schoolService:SchoolService,classService:ClassService,postService:PostService,courseService:CourseService) {
        super(injector);
        this._userService = userService;
        this._schoolService = schoolService;
        this._classService = classService;
        this._postService = postService;
        this._courseService = courseService;
    }  

    ngOnInit(): void {
      var selectedLang = localStorage.getItem('selectedLanguage');
      this.translate.use(selectedLang ?? '');
      this.globalSearchPageNumber = 1;
        this.loadingIcon = true;
        this.searchString = this.route.snapshot.paramMap.get('searchString')??'';
        this.searchType = this.route.snapshot.paramMap.get('type')??'';
        this.getGlobalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize);

        if (!this.hamburgerCountSubscription) {
          this.hamburgerCountSubscription = totalMessageAndNotificationCount.subscribe(response => {
            this.hamburgerCount = response.hamburgerCount;
          });
        }
        notifyMessageAndNotificationCount.next({});

        if (!this.changeLanguageSubscription) {
          this.changeLanguageSubscription = changeLanguage.subscribe(response => {
            this.translate.use(response.language);
          })
        }
    }

    ngOnDestroy(): void {
      if (this.hamburgerCountSubscription) {
        this.hamburgerCountSubscription.unsubscribe();
      }
      if (this.changeLanguageSubscription) {
        this.changeLanguageSubscription.unsubscribe();
      }
    }

    getGlobalSearch(searchString:string,pageNumber:number,pageSize:number){
      if(this.searchType == "1"){
        this._userService.usersGlobalSearch(searchString,pageNumber,pageSize).subscribe((response) => {
          this.loadingIcon = false;
          this.isDataLoaded = true;
          this.globalSearchResult = response;
        });
      }
      if(this.searchType == "2"){
        this._schoolService.schoolsGlobalSearch(searchString,pageNumber,pageSize).subscribe((response) => {
          this.loadingIcon = false;
          this.isDataLoaded = true;
          this.globalSearchResult = response;
        });
      }
      if(this.searchType == "3"){
      this._classService.classGlobalSearch(searchString,pageNumber,pageSize).subscribe((response) => {
        this.loadingIcon = false;
        this.isDataLoaded = true;
        this.globalSearchResult = response;
      });
    }

    if(this.searchType == "4"){
      this._courseService.courseGlobalSearch(searchString,pageNumber,pageSize).subscribe((response) => {
        this.loadingIcon = false;
        this.isDataLoaded = true;
        this.globalSearchResult = response;
      });
    }

    if(this.searchType == "5"){
      this._postService.postsGlobalSearch(searchString,pageNumber,pageSize).subscribe((response) => {
        this.loadingIcon = false;
        this.isDataLoaded = true;
        this.globalSearchResult = response;
      });
    }
    }
    
    back(): void {
      window.history.back();
    }

    openSidebar(){
      OpenSideBar.next({isOpenSideBar:true})
    }

    globalSearch(){
        this.globalSearchPageNumber = 1;
        if(this.searchString.length >2 || this.searchString == ""){
          this.getGlobalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize);
        }
      }
  
      @HostListener("window:scroll", [])
      onWindowScroll() {
        const scrollPosition = window.pageYOffset;
        const windowSize = window.innerHeight;
        const bodyHeight = document.body.offsetHeight;
        
        if (scrollPosition >= bodyHeight - windowSize) {
          if(!this.scrolled && this.scrollSearchResponseCount != 0){
          this.scrolled = true;
          this.postLoadingIcon = true;
          this.globalSearchPageNumber++;
          this.getNextSearchResults();
         }
        }
    }

    getNextSearchResults(){
      if(this.searchType == "1"){
        this._userService.usersGlobalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize).subscribe((response:any) => {
          if(response.length != 0){
            this.globalSearchResult =[...this.globalSearchResult, ...response];
          }
          this.postLoadingIcon = false;
          this.scrollSearchResponseCount = response.length; 
          this.scrolled = false;
        });
        
      }
      if(this.searchType == "2"){
        this._schoolService.schoolsGlobalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize).subscribe((response:any) => {
          if(response.length != 0){
            this.globalSearchResult =[...this.globalSearchResult, ...response];
          }
          this.postLoadingIcon = false;
          this.scrollSearchResponseCount = response.length; 
          this.scrolled = false;
        });
      }

      if(this.searchType == "3"){
        this._classService.classGlobalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize).subscribe((response:any) => {
          if(response.length != 0){
            this.globalSearchResult =[...this.globalSearchResult, ...response];
          }
          this.postLoadingIcon = false;
          this.scrollSearchResponseCount = response.length; 
          this.scrolled = false;
        });
      }

      if(this.searchType == "4"){
        this._courseService.courseGlobalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize).subscribe((response:any) => {
          if(response.length != 0){
            this.globalSearchResult =[...this.globalSearchResult, ...response];
          }
          this.postLoadingIcon = false;
          this.scrollSearchResponseCount = response.length; 
          this.scrolled = false;
        });
      }

      if(this.searchType == "5"){
        this._postService.postsGlobalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize).subscribe((response:any) => {
          if(response.length != 0){
            this.globalSearchResult =[...this.globalSearchResult, ...response];
          }
          this.postLoadingIcon = false;
          this.scrollSearchResponseCount = response.length; 
          this.scrolled = false;
        });
      }
      }
}
