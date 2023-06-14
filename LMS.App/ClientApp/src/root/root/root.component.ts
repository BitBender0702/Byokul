import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { SignalrService } from '../service/signalr.service';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Params, Router } from '@angular/router';
import { Constant } from '../interfaces/constant';

@Component({
  selector: 'root-selector',
  templateUrl: './root.component.html',
  styleUrls: []
})
export class RootComponent implements OnInit {
  title = 'app';
  displaySideBar: boolean = false;
  displayAdminSideBar: boolean = false;
  constructor( private signalRService: SignalrService, private meta: Meta,authService: AuthService,private router: Router,private route: ActivatedRoute) { 
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
    this.connectSignalR();
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
