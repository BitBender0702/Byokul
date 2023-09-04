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
import { JoinMeetingModel } from 'src/root/interfaces/bigBlueButton/joinMeeting';
import { BigBlueButtonService } from 'src/root/service/bigBlueButton';
import { OpenSideBar } from 'src/root/user-template/side-bar/side-bar.component';
import { UserService } from 'src/root/service/user.service';
import { MessageService } from 'primeng/api';


import { DatePipe } from '@angular/common';


export const unreadNotificationResponse = new Subject<{ type: string }>();


@Component({
  selector: 'payment',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  providers: [MessageService],
})

export class NotificationsComponent extends MultilingualComponent implements OnInit, OnDestroy {
  private _notificationService;
  private _postService;
  private _bigBlueButtonService;
  private _userService;
  notifications: any;
  notificationSettings: any;
  loadingIcon: boolean = false;
  isDataLoaded: boolean = false;
  notificationSettingsList: any[] = [];
  userId!: string;
  validToken!: string;
  changeLanguageSubscription!: Subscription;
  notificationResponseSubscription!: Subscription;
  notificationPageNumber: number = 1;
  scrolled: boolean = false;
  gender!: string;
  scrollNotificationResponseCount: number = 1;
  notificationLoadingIcon: boolean = false;
  joinMeetingViewModel!: JoinMeetingModel;


  constructor(injector: Injector, public messageService: MessageService, private datePipe: DatePipe, userService: UserService, private fb: FormBuilder, notificationService: NotificationService, private router: Router, postService: PostService, private bsModalService: BsModalService, bigBlueButtonService: BigBlueButtonService) {
    super(injector);
    this._notificationService = notificationService;
    this._postService = postService;
    this._bigBlueButtonService = bigBlueButtonService;
    this._userService = userService;
  }

  notificationAvatar: any;
  dateForNotification: any;
  ngOnInit(): void {
    this.loadingIcon = true;
    var selectedLang = localStorage.getItem('selectedLanguage');
    this.gender = localStorage.getItem("gender") ?? '';
    this.translate.use(selectedLang ?? '');
    this._notificationService.getNotifications(this.notificationPageNumber).subscribe((notificationsResponse) => {
      debugger
      this.notifications = notificationsResponse;


      // this.notificationAvatar = this.notifications[0]?.user.avatar
      // this.dateForNotification = this.datePipe.transform(this.notifications.dateTime, 'yyyy-MM-dd');

      var notifications: any[] = this.notifications;
      var unreadNotifications = notifications.filter(x => !x.isRead);
      if (unreadNotifications.length > 0) {
        this._notificationService.removeUnreadNotifications().subscribe((response) => {
          unreadNotificationResponse.next({ type: "remove" });
        });
      }
      this.loadingIcon = false;
      this.isDataLoaded = true;
    });
    try {
      if (!this.notificationResponseSubscription) {
        this.notificationResponseSubscription = notificationResponse.subscribe(response => {
          debugger
          this.notifications.push(response);
          unreadNotificationResponse.next({ type: "add" });
        });
      }
    } catch { }

    this.validToken = localStorage.getItem("jwt") ?? '';
    if (this.validToken != null) {
      let jwtData = this.validToken.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.userId = decodedJwtData.jti;
    }

    if (!this.changeLanguageSubscription) {
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.translate.use(response.language);
      })
    }

    // this.notificationAvatar = this.notifications?.user?.avatar

  }

  ngOnDestroy(): void {
    if (this.changeLanguageSubscription) {
      this.changeLanguageSubscription.unsubscribe();
    }
    if (this.notificationResponseSubscription) {
      this.notificationResponseSubscription.unsubscribe();
    }
  }

  getNotificationSettings() {
    this._notificationService.getNotificationSettings(this.userId).subscribe((settingsResponse) => {
      this.notificationSettings = settingsResponse;
    });
  }

  openPostsViewModel(postId: string, postType: number, reelId?: string) {
    this._postService.getPostById(postId).subscribe((postResponse) => {
      const initialState = {
        posts: postResponse,
      };
      this.bsModalService.show(PostViewComponent, { initialState });
    });
  }

  openReelsViewModel(postType: number, reelId: string) {
    const initialState = {
      postAttachmentId: reelId,
    };
    this.bsModalService.show(ReelsViewComponent, { initialState });
  }

  changeNotificationSettings(id: string, isActive: boolean) {
    var notificationSettings: any[] = this.notificationSettings;

    var item = notificationSettings.find(x => x.id == id);
    item.isSettingActive = isActive;
    this.notificationSettings
    var notificationItem = { id: '', isSettingActive: false };
    notificationItem.id = id;
    notificationItem.isSettingActive = isActive;

    var index = this.notificationSettingsList.findIndex(x => x.id == id);
    if (index > -1) {
      this.notificationSettingsList.splice(index, 1);
    }
    this.notificationSettingsList.push(notificationItem);

  }

  saveNotificationSettings() {
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
      if (!this.scrolled && this.scrollNotificationResponseCount != 0) {
        this.scrolled = true;
        this.notificationLoadingIcon = true;
        this.notificationPageNumber++;
        this.getNotifications();
      }
    }
  }

  getNotifications() {
    this._notificationService.getNotifications(this.notificationPageNumber).subscribe((notificationsResponse) => {
      this.notifications = [...this.notifications, ...notificationsResponse];
      this.notificationLoadingIcon = false;
      this.scrollNotificationResponseCount = notificationsResponse.length;
      this.scrolled = false;
    });
  }

  joinMeeting(userId: string, meetingId: string, postId: string) {
    debugger
    this._postService.getPostById(postId).subscribe((response) => {
      debugger
      if (response.isLive) {
        this.initializeJoinMeetingViewModel();
        this._userService.getUser(userId).subscribe((result) => {
          debugger
          this.joinMeetingViewModel.name = result.firstName + " " + result.lastName;
          this.joinMeetingViewModel.meetingId = meetingId;
          this.joinMeetingViewModel.postId = postId;
          this._bigBlueButtonService.joinMeeting(this.joinMeetingViewModel).subscribe((response) => {
            //  const fullNameIndex = response.url.indexOf('fullName='); // find the index of "fullName="
            //  const newUrl = response.url.slice(fullNameIndex);
            this.router.navigate(
              [`liveStream`, postId, false]
              //     { state: { stream: {streamUrl: response.url, userId:this.userId, meetingId: meetingId, isOwner:false} } });
              // });
            );
          });

        })
      }
      else {
        this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: 'This live has ended!', });
      }

    });

  }

  initializeJoinMeetingViewModel() {
    this.joinMeetingViewModel = {
      name: '',
      meetingId: '',
      postId: ''
    }
  }

  openSidebar() {
    OpenSideBar.next({ isOpenSideBar: true })
  }

  opeStream(postId: string, chatType: number) {
    this._postService.getPostById(postId).subscribe((response) => {
      if(response.isLiveStreamEnded == false){
        this._postService.enableLiveStream(postId).subscribe((responses)=>{
          if(responses.success){
            response.isLive = true;
          }
          if (response.isLive) {
            var from = chatType == 1 ? "user" : chatType == 3 ? "school" : chatType == 4 ? "class" : "";
            this.router.navigate(
              [`liveStream`, postId, from]
            );
          }
          return;
        })
      } else{
        if (response.isLive) {
          var from = chatType == 1 ? "user" : chatType == 3 ? "school" : chatType == 4 ? "class" : "";
          this.router.navigate(
            [`liveStream`, postId, from]
          );
        }
        else {
          this.messageService.add({ severity: 'info', summary: 'Info', life: 3000, detail: 'This live has ended!', });
        }
      }
      

    });

    //   var from = chatType == 1 ? "user" : chatType == 3 ? "school" : chatType == 4 ? "class" : "";
    //   this.router.navigate(
    //     [`liveStream`,postId,from]
    // );

  }

}
