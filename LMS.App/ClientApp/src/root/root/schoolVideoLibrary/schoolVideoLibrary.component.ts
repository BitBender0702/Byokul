import {Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { Subscription } from 'rxjs';
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';

@Component({
    selector: 'fileStorage',
    templateUrl: './schoolVideoLibrary.component.html',
    styleUrls: ['./schoolVideoLibrary.component.css'],
    providers: [MessageService]
  })

export class SchoolVideoLibraryComponent extends MultilingualComponent implements OnInit, OnDestroy {
  selectedLanguage:any;
  isDataLoaded:boolean = false;

  changeLanguageSubscription!:Subscription;
  constructor(injector: Injector) { 
    super(injector);
  }

  ngOnInit(): void {
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage?? '');
    

    if(!this.changeLanguageSubscription){
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.selectedLanguage = localStorage.getItem("selectedLanguage");
        this.translate.use(this.selectedLanguage?? '');
      })
    }
  }

  ngOnDestroy(): void {
    if(this.changeLanguageSubscription){
      this.changeLanguageSubscription.unsubscribe();
    }
  }

  back(): void {
    window.history.back();
  }

  openSidebar(){
    OpenSideBar.next({isOpenSideBar:true})  
  }

  resetUploadFileModal(){
    
  }

}