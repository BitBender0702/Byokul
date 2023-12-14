import {Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'sharedSSC-component',
    templateUrl: './sharedSSC.component.html',
    providers: [MessageService]
  })

export class SharedSSCComponent extends MultilingualComponent implements OnInit, OnDestroy {
  selectedLanguage:any;
  changeLanguageSubscription!:Subscription;
  @Input() sharedProfileUrl:any;


  constructor(injector: Injector) { 
    super(injector);
  }

  ngOnInit(): void {
    var a = this.sharedProfileUrl;
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