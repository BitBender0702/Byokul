import { Component, EventEmitter, Injector, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
export const changeLanguage =new Subject<{language:string}>();  

@Component({
    selector: 'multi-lingual',
    templateUrl: './multilingual.component.html',
    styleUrls: ['./multilingual.component.css']
  })

  export class MultilingualComponent implements OnInit {

    translate!: TranslateService;
    selectedLanguage:any;

    constructor(injector: Injector) { 
        this.translate = injector.get(TranslateService);
        this.translate.addLangs(['en','es','sp']);
        this.translate.setDefaultLang('en');
    }

    switchLanguage(lang:string){
        this.translate.use(lang);
        localStorage.setItem("selectedLanguage",lang);
        changeLanguage.next({language:lang}); 
      }

      ngOnInit(): void {
        this.selectedLanguage = localStorage.getItem("selectedLanguage");
        this.translate.use(this.selectedLanguage);
      }
}
