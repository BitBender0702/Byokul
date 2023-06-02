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


        // for facebook
        // this.meta.addTag({ property: 'og:title', content: 'test' });
        // this.meta.addTag({ property: 'og:type', content: 'profile' });
        // this.meta.addTag({ property: 'og:description', content: 'desc...' });
        // this.meta.addTag({ property: 'og:image', content: '' });
        // this.meta.addTag({ property: 'og:url', content: 'https://byokul.com' });


        


        // const urlWithoutParams = this.getUrlWithoutParams();
        // const containsParams = this.checkForParams(urlWithoutParams);
        event.urlAfterRedirects = event.urlAfterRedirects.split('/').slice(0, 3).join('/');
        // if(event.urlAfterRedirects.includes("/profile/school")){
        //   // event.urlAfterRedirects = event.urlAfterRedirects.split('/')[2];
        //   event.urlAfterRedirects = event.urlAfterRedirects.substring(0, event.urlAfterRedirects.indexOf('/school') + '/school'.length);
        // }

        // if(event.urlAfterRedirects.includes("/profile/class")){
        //   // event.urlAfterRedirects = event.urlAfterRedirects.split('/')[2];
        //   event.urlAfterRedirects = event.urlAfterRedirects.substring(0, event.urlAfterRedirects.indexOf('/class') + '/class'.length);
        // }

        // if(event.urlAfterRedirects.includes("/profile/course")){
        //   // event.urlAfterRedirects = event.urlAfterRedirects.split('/')[2];
        //   event.urlAfterRedirects = event.urlAfterRedirects.substring(0, event.urlAfterRedirects.indexOf('/course') + '/course'.length);
        // }

        // if(event.urlAfterRedirects.includes("/user/userProfile")){
        //   // event.urlAfterRedirects = event.urlAfterRedirects.split('/')[2];
        //   event.urlAfterRedirects = event.urlAfterRedirects.substring(0, event.urlAfterRedirects.indexOf('/userProfile') + '/userProfile'.length);
        // }



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

  // private getUrlWithoutParams(): string {
  //   const navigationExtras: NavigationExtras = {
  //     queryParamsHandling: 'ignore',
  //     preserveFragment: true
  //   };

  //   const urlTree = this.router.createUrlTree([], navigationExtras);
  //   const urlWithoutParams = urlTree.toString();
  //   return urlWithoutParams;
  // }

  // private getUrlWithoutParams(url: string): string {
  //   debugger
  //   const segments = url.split('/');

  //   // Remove the route parameters
  //   const filteredSegments = segments.filter(segment => !segment.startsWith(':'));
    
  //   const urlWithoutParams = filteredSegments.join('/');
  //   return urlWithoutParams;
  // }

  private checkForParams(url: string): boolean {
    debugger
    const params: Params = this.route.snapshot.params;

    // Check if any route parameter is present in the URL
    return Object.keys(params).some(param => url.includes(params[param]));
  }

  private getPathWithoutParams(url: string): string {
    debugger
    const routeSegments = this.router.parseUrl(url).root.children.primary.segments;
    const pathSegments = routeSegments.map(segment => segment.path);
    return '/' + pathSegments.join('/');
  }
  ngOnInit(): void {
    // this.meta.addTag({ rel: 'canonical', href: 'https://www.byokul.com' });
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
