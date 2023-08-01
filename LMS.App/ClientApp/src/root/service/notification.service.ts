import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { CommentViewModel } from "../interfaces/chat/commentViewModel";
import { SaveChatAttachment } from "../interfaces/chat/saveChatAttachment";
import { FileUploadResult } from "../interfaces/chat/uploadFiles";
import { NotificationType, NotificationViewModel } from "../interfaces/notification/notificationViewModel";
import { SignalrService } from "./signalr.service";
import { UserService } from "./user.service";
import { Constant } from "../interfaces/constant";

@Injectable({providedIn: 'root'})

export class NotificationService{
    private _userService;
    private _signalrService;
    notificationViewModel!:NotificationViewModel;
    notificationViewModel2!:any;
    
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient,userService:UserService,signalrService:SignalrService) { 
        this._userService = userService;
        this._signalrService = signalrService;
        this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }

    getNotificationSettings(userId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/notifications/getNotificationSettings` + '?userId=' + userId, {headers: this.headers});
    }

    getNotifications(pageNumber:number):Observable<any>{
      let queryParams = new HttpParams().append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/notifications/getNotifications`, {params:queryParams,headers: this.headers})
    }






    removeUnreadNotifications():Observable<any>{
      debugger
      return this.http.post(`${this.apiUrl}/notifications/removeUnreadNotifications`,'', {headers: this.headers});
    }

    saveNotificationSettings(notificationSettingsList:any):Observable<any>{
      return this.http.post(`${this.apiUrl}/notifications/saveNotificationSettings`,notificationSettingsList, {headers: this.headers});
    }

    initializeNotificationViewModel(userid:string,notificationType:NotificationType,notificationContent:string,loginUserId:string,postId?:string | null,postType?:number,post?:any,reelId?:string | null,chatType?:number,chatTypeId?:string| null):Observable<any>{
      debugger
        this._userService.getUser(loginUserId).subscribe((response) => {
          debugger
          this.notificationViewModel = {
            id: Constant.defaultGuid,
            userId: userid,
            actionDoneBy: loginUserId,
            avatar: response.avatar,
            isRead:false,
            notificationContent:`${response.firstName + ' ' + response.lastName + ' ' + notificationContent}`,
            notificationType:notificationType,
            postId: postId,
            postType:postType,
            post:post,
            reelId:reelId,
            chatType:chatType,
            chatTypeId:chatTypeId
          }

          // this.notificationViewModel2 = {
          //   id: Constant.defaultGuid,
          //   userId: userid,
          //   actionDoneBy: loginUserId,
          //   avatar: response.avatar,
          //   isRead:false,
          //   notificationContent:`${response.firstName + ' ' + response.lastName + ' ' + notificationContent}`,
          //   notificationType:notificationType,
          //   postId: postId,
          //   postType:postType,
          //   //post:post,
          //   // reelId:reelId,
          //   // chatType:chatType,
          //   // chatTypeId:chatTypeId
          // }

          if(notificationType == NotificationType.CertificateSent){
            this.notificationViewModel.notificationContent = notificationContent;
          }
          this._signalrService.sendNotification(this.notificationViewModel);
        });
     return new Observable<void>();
      }


  getUserFollowersIds(userId:string):Observable<any>{
      return this.http.get(`${this.apiUrl}/notifications/getUserFollowersIds` + '?userId=' + userId, {headers: this.headers});
  }

  getSchoolFollowersIds(schoolId:string):Observable<any>{
      return this.http.get(`${this.apiUrl}/notifications/getSchoolFollowersIds` + '?schoolId=' + schoolId, {headers: this.headers});
  }

  getClassFollowersIds(classId:string):Observable<any>{
      return this.http.get(`${this.apiUrl}/notifications/getClassFollowersIds` + '?classId=' + classId, {headers: this.headers});
  }


}
