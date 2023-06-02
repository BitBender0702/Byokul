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

@Component({
    selector: 'globalSearch',
    templateUrl: './globalSearch.component.html',
    styleUrls: ['./globalSearch.component.css'],
    providers: [MessageService]
  })

  export class GlobalSearchComponent extends MultilingualComponent implements OnInit {
    private _userService;
    isDataLoaded:boolean = false;
    loadingIcon:boolean = false;
    postLoadingIcon: boolean = false;
    searchString:string = '';
    globalSearchPageNumber:number = 1;
    scrollSearchResponseCount:number = 1;
    globalSearchPageSize:number = 12;
    globalSearchResult:any;
    scrolled:boolean = false;

    constructor( injector: Injector,private route: ActivatedRoute,userService:UserService) {
        super(injector);
        this._userService = userService;
    }

    ngOnInit(): void {
        debugger
        this.loadingIcon = true;
        this.searchString = this.route.snapshot.paramMap.get('searchString')??'';
        this.getGlobalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize);
    }

    getGlobalSearch(searchString:string,pageNumber:number,pageSize:number){
      this._userService.globalSearch(searchString,pageNumber,pageSize).subscribe((response) => {
        this.loadingIcon = false;
        this.isDataLoaded = true;
        this.globalSearchResult = response;
      });
    }
    

    back(): void {
      window.history.back();
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
        this._userService.globalSearch(this.searchString,this.globalSearchPageNumber,this.globalSearchPageSize).subscribe((response:any) => {
          this.globalSearchResult =[...this.globalSearchResult, ...response];
          this.postLoadingIcon = false;
          this.scrollSearchResponseCount = response.length; 
          this.scrolled = false;
        });
      }
}
