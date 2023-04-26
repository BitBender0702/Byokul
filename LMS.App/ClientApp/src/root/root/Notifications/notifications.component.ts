import { Component, HostListener, Injector, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotificationService } from 'src/root/service/notification.service';
import { PostService } from 'src/root/service/post.service';
import { notificationResponse } from 'src/root/service/signalr.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PostViewComponent } from '../postView/postView.component';
import { ReelsViewComponent } from '../reels/reelsView.component';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';

export const unreadNotificationResponse =new Subject<{type:string}>(); 


@Component({
    selector: 'payment',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.css']
  })

  export class NotificationsComponent extends MultilingualComponent implements OnInit, OnDestroy {
    private _notificationService;
    private _postService;
    notifications:any;
    notificationSettings:any;
    loadingIcon:boolean = false;
    isDataLoaded:boolean = false;
    notificationSettingsList:any[] = [];
    userId!:string;
    validToken!: string;
    changeLanguageSubscription!: Subscription;
    notificationPageNumber:number = 1;
    scrolled:boolean = false;
    scrollNotificationResponseCount:number = 1;
    notificationLoadingIcon: boolean = false;


    constructor(injector: Injector,private fb: FormBuilder,notificationService:NotificationService,private router: Router,postService:PostService,private bsModalService: BsModalService) {
       super(injector);
       this._notificationService = notificationService;
       this._postService = postService;
    }

    ngOnInit(): void {
      debugger
        this.loadingIcon = true;
        var selectedLang = localStorage.getItem('selectedLanguage');
        this.translate.use(selectedLang ?? '');
        this._notificationService.getNotifications(this.notificationPageNumber).subscribe((notificationsResponse) => {
          debugger
            this.notifications = notificationsResponse;
            var notifications: any[] = this.notifications;
            var unreadNotifications = notifications.filter(x => !x.isRead);
            if(unreadNotifications.length > 0){
                this._notificationService.removeUnreadNotifications().subscribe((response) => {
                  debugger
                    unreadNotificationResponse.next({type:"remove"});
                });
            }
            this.loadingIcon = false;
            this.isDataLoaded = true;
            });

     notificationResponse.subscribe(response => {
       this.notifications.push(response);
       unreadNotificationResponse.next({type:"add"});
      });

      this.validToken = localStorage.getItem("jwt")?? '';
      if (this.validToken != null) {
        let jwtData = this.validToken.split('.')[1]
        let decodedJwtJsonData = window.atob(jwtData)
        let decodedJwtData = JSON.parse(decodedJwtJsonData);
        this.userId = decodedJwtData.jti;
      }
      
      if(!this.changeLanguageSubscription){
        this.changeLanguageSubscription = changeLanguage.subscribe(response => {
          this.translate.use(response.language);
        })
      }
    }

    ngOnDestroy(): void {
      if(this.changeLanguageSubscription){
        this.changeLanguageSubscription.unsubscribe();
      }
    }

    getNotificationSettings(){
        this._notificationService.getNotificationSettings(this.userId).subscribe((settingsResponse) => {
            this.notificationSettings = settingsResponse;
            });
    }

    openPostsViewModel(postId:string,postType:number,reelId?:string){
            this._postService.getPostById(postId).subscribe((postResponse) => {
                const initialState = {
                    posts: postResponse,
                  };
                  this.bsModalService.show(PostViewComponent, { initialState });
                });
    }

    openReelsViewModel(postType:number,reelId:string){
               const initialState = {
                postAttachmentId: reelId,
              };
              this.bsModalService.show(ReelsViewComponent, { initialState });
    }

    changeNotificationSettings(id:string,isActive:boolean){
        var notificationSettings: any[] = this.notificationSettings;
  
        var item = notificationSettings.find(x => x.id == id);
        item.isSettingActive = isActive;
        this.notificationSettings
        var notificationItem = {id:'',isSettingActive:false};
        notificationItem.id = id;
        notificationItem.isSettingActive = isActive;

        var index = this.notificationSettingsList.findIndex(x => x.id == id);
        if(index > -1){
        this.notificationSettingsList.splice(index, 1);
        }
        this.notificationSettingsList.push(notificationItem);

    }

    saveNotificationSettings(){
        this._notificationService.saveNotificationSettings(this.notificationSettingsList).subscribe((response) => {
            this.notificationSettingsList = [];
            });
    }

    openChat(userId: string, type: string, chatTypeId: string) {
        if (this.validToken == '') {
          window.open('user/auth/login', '_blank');
        } else {
          this.router.navigate([`user/chats`], {
            state: {
              chatHead: { receiverId: userId, type: type, chatTypeId: chatTypeId },
            },
          });
        }
      }

      back(): void {
        window.history.back();
    }

    @HostListener("window:scroll", [])
    onWindowScroll() {
      const scrollPosition = window.pageYOffset;
      const windowSize = window.innerHeight;
      const bodyHeight = document.body.offsetHeight;
        
      if (scrollPosition >= bodyHeight - windowSize) {
       if(!this.scrolled && this.scrollNotificationResponseCount != 0){
        this.scrolled = true;
        this.notificationLoadingIcon = true;
        this.notificationPageNumber++;
        this.getNotifications();
        }
      }
    }

    getNotifications(){
     this._notificationService.getNotifications(this.notificationPageNumber).subscribe((notificationsResponse) => {
       this.notifications =[...this.notifications, ...notificationsResponse];
       this.notificationLoadingIcon = false;
       this.scrollNotificationResponseCount = notificationsResponse.length; 
       this.scrolled = false;
     });
    }

}
