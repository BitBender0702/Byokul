import {Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'fileStorage',
    templateUrl: './privacyPolicy.component.html',
    styleUrls: ['./privacyPolicy.component.css'],
    providers: [MessageService]
  })

export class PrivecyPolicyComponent extends MultilingualComponent implements OnInit, OnDestroy {

  selectedLanguage:any;
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
}