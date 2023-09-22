import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { UserService } from 'src/root/service/user.service';
import { MultilingualComponent } from '../sharedModule/Multilingual/multilingual.component';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';
import { SchoolService } from 'src/root/service/school.service';
import { ClassService } from 'src/root/service/class.service';
import { PostService } from 'src/root/service/post.service';

@Component({
    selector: 'globalSearch',
    templateUrl: './globalSearch.component.html',
    styleUrls: ['./globalSearch.component.css'],
    providers: [MessageService]
  })

  export class GlobalSearchComponent extends MultilingualComponent implements OnInit {
    private _userService;
    private _schoolService;
    private _classService;
    private _postService;
    isDataLoaded:boolean = false;
    loadingIcon:boolean = false;
    postLoadingIcon: boolean = false;
    searchString:string = '';
    globalSearchPageNumber:number = 1;
    scrollSearchResponseCount:number = 1;
    globalSearchPageSize:number = 12;
    globalSearchResult:any;
    scrolled:boolean = false;
    searchType:any;

    constructor( injector: Injector,private route: ActivatedRoute,userService:UserService,schoolService:SchoolService,classService:ClassService,postService:PostService) {
        super(injector);
        this._userService = userService;
        this._schoolService = schoolService;
        this._classService = classService;
        this._postService = postService;
    }

    ngOnInit(): void {
      debugger
      this.globalSearchPageNumber = 1;
        this.loadingIcon = true;
        this.searchString = this.route.snapshot.paramMap.get('searchString')??'';
        this.searchType = this.route.snapshot.paramMap.get('type')??'';
        this.getGlobalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize);
    }

    getGlobalSearch(searchString:string,pageNumber:number,pageSize:number){
      debugger
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
      this._classService.classAndCoursesGlobalSearch(searchString,pageNumber,pageSize).subscribe((response) => {
        this.loadingIcon = false;
        this.isDataLoaded = true;
        this.globalSearchResult = response;
      });
      
    }

    if(this.searchType == "4"){
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
      debugger
      if(this.searchType == "1"){
        this._userService.usersGlobalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize).subscribe((response:any) => {
          this.globalSearchResult =[...this.globalSearchResult, ...response];
          this.postLoadingIcon = false;
          this.scrollSearchResponseCount = response.length; 
          this.scrolled = false;
        });
        
      }
      if(this.searchType == "2"){
        this._schoolService.schoolsGlobalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize).subscribe((response:any) => {
          this.globalSearchResult =[...this.globalSearchResult, ...response];
          this.postLoadingIcon = false;
          this.scrollSearchResponseCount = response.length; 
          this.scrolled = false;
        });
      }

      if(this.searchType == "3"){
        this._classService.classAndCoursesGlobalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize).subscribe((response:any) => {
          this.globalSearchResult =[...this.globalSearchResult, ...response];
          this.postLoadingIcon = false;
          this.scrollSearchResponseCount = response.length; 
          this.scrolled = false;
        });
      }

      if(this.searchType == "4"){
        this._postService.postsGlobalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize).subscribe((response:any) => {
          this.globalSearchResult =[...this.globalSearchResult, ...response];
          this.postLoadingIcon = false;
          this.scrollSearchResponseCount = response.length; 
          this.scrolled = false;
        });
      }
      }
}
