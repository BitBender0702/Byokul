import { Component, Injector, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { SignalrService } from '../service/signalr.service';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Params, Router } from '@angular/router';
import { Constant } from '../interfaces/constant';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { MultilingualComponent } from './sharedModule/Multilingual/multilingual.component';
export const postProgressNotification = new Subject();  

@Component({
  selector: 'root-selector',
  templateUrl: './root.component.html',
  styleUrls: [],
  providers: [MessageService]
})
export class RootComponent extends MultilingualComponent implements OnInit {
  title = 'app';
  displaySideBar: boolean = false;
  displayAdminSideBar: boolean = false;
  postProgressSubscription!:Subscription;
  constructor(injector: Injector, private signalRService: SignalrService,public messageService:MessageService,private translateService: TranslateService, private meta: Meta,authService: AuthService,private router: Router,private route: ActivatedRoute) { 
    super(injector);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        event.urlAfterRedirects = event.urlAfterRedirects.split('/').slice(0, 3).join('/');
        if(event.urlAfterRedirects.includes("/user/userProfile")){
          const existingTag = this.meta.getTag('content="noindex,nofollow"');
          if (!existingTag) {
            this.meta.addTag({ name: 'robots', content: 'noindex,nofollow' });
          }
        }

        if(event.urlAfterRedirects.includes("/profile/school") || event.urlAfterRedirects.includes("/profile/school") || event.urlAfterRedirects.includes("/profile/class") || event.urlAfterRedirects.includes("/profile/course")){
          const existingTag = this.meta.getTag('content="nofollow"');
          if (!existingTag) {
            this.meta.addTag({ name: 'robots', content: 'nofollow' });
          }
        }

        const canonicalUrl = Constant.WwwAppUrl + event.urlAfterRedirects;
        const existingCanonicalTag = this.meta.getTag('name="canonical"');
        if (existingCanonicalTag) {
          this.meta.updateTag({ name: 'canonical', content: canonicalUrl });
        }
        else {
          this.meta.addTag({ name: 'canonical', content: canonicalUrl });
        }
      }
    });

   authService.loginState$.asObservable().subscribe(x => { this.displaySideBar = x;});
   authService.loginAdminState$.asObservable().subscribe(x => { this.displayAdminSideBar = x;});
  }

  ngOnInit(): void {
   debugger
    this.connectSignalR();
    this.meta.updateTag({ property: 'og:title', content: "test" });
    this.meta.updateTag({ property: 'og:type', content: "profile" });
    this.meta.updateTag({ property: 'og:description', content: "description" });
    // this.meta.addTag({ property: 'og:image', content: "../../assets/images/logo.svg" });
    this.meta.updateTag({ property: 'og:url', content: "byokul.com" });

    if(!this.postProgressSubscription){
      this.postProgressSubscription = postProgressNotification.subscribe(response => {
        const translatedMessage = this.translateService.instant('PostProgressMessage');
        const translatedSummary = this.translateService.instant('Info');
        this.messageService.add({severity:'info', summary:translatedSummary,life: 3000, detail:translatedMessage});
      })
    }

    // here if language not selected in local storage we add english by default in local storage
    var selectedLang = localStorage.getItem('selectedLanguage');
    if(selectedLang == null || selectedLang == ""){
      this.translate.use("en");
    }
  }

  connectSignalR() : void {
    let token = localStorage.getItem("jwt"); 
    if(!token)
      return;
    this.signalRService.initializeConnection(token);
    this.signalRService.startConnection();
     setTimeout(() => {
             this.signalRService.askServerListener();
           }, 500);
  }

  getUserRoles(token:string): any{
    let jwtData = token.split('.')[1]
    let decodedJwtJsonData = window.atob(jwtData)
    let decodedJwtData = JSON.parse(decodedJwtJsonData)
    return decodedJwtData;
  }
}
