import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { getuid } from 'process';
import { Subject } from 'rxjs';
import { json } from 'stream/consumers';
import { ChartModel } from '../interfaces/chat/ChatModel';
import { CommentLikeUnlike } from '../interfaces/chat/commentsLike';
import { CommentViewModel } from '../interfaces/chat/commentViewModel';
import { NotificationViewModel } from '../interfaces/notification/notificationViewModel';
import { NotificationService } from './notification.service';
import { CustomXhrHttpClient } from './signalr.httpclient';
import { UserService } from './user.service';

export const signalRResponse = new Subject<{
  receiver: any;
  message: string;
  attachments: any;
  isTest: boolean;
  senderId: string;
  chatType: string;
  receiverId: string;
  chatTypeId: string;
  chatHeadId: string;
}>();
export const commentResponse = new Subject<{
  id:string;
  senderAvatar: string;
  message: string;
  userId: string;
  createdOn: Date,
  userName:string
}>();

export const commentLikeResponse = new Subject<{
  commentId: string;
  isLike: boolean;
}>();

export const notificationResponse = new Subject<NotificationViewModel>();

export const progressResponse = new Subject<{
  progressCount: number;
  fileName: string;
}>();

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private hubConnection?: signalR.HubConnection;
  private _userService;
  notificationSettings:any;

  constructor(userService: UserService) { 
    this._userService = userService;
}    

  initializeConnection(token: string) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://byokul.com/chatHub', {
         httpClient: new CustomXhrHttpClient(token)
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Trace)
      .build();
  }

  startConnection() {
    this.start();
    this.hubConnection?.onclose(async () => {
      console.log('Connection is closed');
      this.start();
    });
  }

  start() {
    this.hubConnection?.start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Error while starting connection: ' + err));
    this.hubConnection?.on('UserCount', (count) => {
      console.log('User Count ' + count);
    });

  }

  askServer(userId: string) {
    this.hubConnection?.invoke('GetConnectionId', userId)
      .catch((err) => console.error(err));
  }

  sendToUser(model: any) {
    this.hubConnection?.invoke('SendToUser', model)
      .catch((err) => console.error(err));
  }

  askServerListener() {
    this.hubConnection?.on('ReceiveMessage', (user, message) => {
      signalRResponse.next({
        receiver: 'test',
        message: user.message,
        attachments: user.attachments,
        isTest: true,
        senderId: user.sender,
        chatType: user.chatType,
        receiverId: user.receiver,
        chatTypeId: user.chatTypeId,
        chatHeadId: user.chatHeadId,
      });
      console.log(`this ${user} send ${message}`);
    });

    this.hubConnection?.on('ReceiveMessageFromGroup', (model) => {
      commentResponse.next({
        id:model.id,
        senderAvatar: model.userAvatar,
        message: model.content,
        userId: model.userId,
        createdOn:model.createdOn,
        userName: model.userName
      });

      console.log(`this ${model.userId} send ${model.content}`);
    });

    this.hubConnection?.on('NotifyCommentLikeToReceiver',
    (model) => {
      commentLikeResponse.next({
        commentId: model.commentId,
        isLike: model.isLike
      });
      console.log(`this ${model.commentId}`);
    });

    
    this.hubConnection?.on('ReceiveNotification',
    (model) => {
      notificationResponse.next(model);
    });

    this.hubConnection?.on('UpdateProgress', (progress: number,fileName: string) => {
      progressResponse.next({
        progressCount:progress,
        fileName:fileName
      });
    });
  }

  sendToGroup(model: CommentViewModel) {
    this.hubConnection?.invoke('SendMessageToGroup', model)
      .catch((err) => console.error(err));
  }
  

  createGroupName(attachmentId: string) {
    this.hubConnection?.invoke('JoinGroup', attachmentId + '_group')
      .catch((err) => console.error(err));
  }

  notifyCommentLike(model:CommentLikeUnlike) {
    this.hubConnection?.invoke('NotifyCommentLike', model)
      .catch((err) => console.error(err));
  }

  sendNotification(model:NotificationViewModel){
    this._userService.getNotificationSettings(model.userId).subscribe((response) => {
      this.notificationSettings = response;
      var notificationSettings: any[] = this.notificationSettings;
      var notificationInfo = notificationSettings.find(x => x.notificationType == model.notificationType);
      if(notificationInfo!= undefined){
      if(!notificationInfo.isSettingActive){
        return
      }
      else{
        this.hubConnection?.invoke('SendNotification', model)
        .catch((err) => console.error(err));
      }
    }
    else{
      this.hubConnection?.invoke('SendNotification', model)
        .catch((err) => console.error(err));
    }
  })
  }
}
