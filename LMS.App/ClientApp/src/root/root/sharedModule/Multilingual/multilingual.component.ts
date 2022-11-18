import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'multi-lingual',
    templateUrl: './multilingual.component.html',
    styleUrls: ['./multilingual.component.css']
  })

  export class MultilingualComponent {

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
      }

      ngOnInit(): void {
        this.selectedLanguage = localStorage.getItem("selectedLanguage");
        this.translate.use(this.selectedLanguage);
      }
}
