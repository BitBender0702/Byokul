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
import { unreadChatResponse } from '../user-template/side-bar/side-bar.component';
import { banUnbanUserProgression } from '../admin/registeredUsers/registeredUsers.component';
import { disableEnableResponse } from '../admin/registeredCourses/registeredCourses.component';

export const signalRResponse = new Subject<{
  id:string;
  receiver: any;
  message: string;
  attachments: any;
  isTest: boolean;
  senderId: string;
  chatType: string;
  receiverId: string;
  chatTypeId: string;
  chatHeadId: string;
  replyChatContent: string;
  replyMessageType: number;
  fileName: string;
  fileURL: string;
  isForwarded: boolean | null;
  forwardedFileName: string | null;
  forwardedFileURL: string | null;
  forwardedFileType: number | null;

}>();
export const commentResponse = new Subject<{
  id:string;
  senderAvatar: string;
  message: string;
  userId: string;
  createdOn: Date,
  userName:string,
  gender:string,
  isUserVerified:boolean
}>();

export const commentLikeResponse = new Subject<{
  commentId: string;
  isLike: boolean;
}>();


export const commentDeleteResponse = new Subject<{
  commentId: string;
}>();


export const closeIyizicoThreeDAuthWindow = new Subject<{
  isClose: boolean;
}>();

export const postLikeResponse = new Subject<{isLiked: boolean;}>();
export const saveStreamResponse = new Subject<{isSaved: boolean;}>();
export const postViewResponse = new Subject<{isAddView: boolean;userId:string}>();
export const notifyCommentThrotllingResponse = new Subject<{noOfComments: boolean;}>();
export const liveUsersCountResponse = new Subject<{isLeaveStream: boolean;}>();
export const endMeetingResponse = new Subject<{}>();
export const shareStreamResponse = new Subject<{}>();
export const notiFyTeacherResponse = new Subject<{userId:string}>();
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
    debugger
    this.hubConnection?.invoke('SendToUser', model)
      .catch((err) => console.error(err));
  }

  askServerListener() {
    this.hubConnection?.on('ReceiveMessage', (user, message) => {
      debugger
      signalRResponse.next({
        id: user.id,
        receiver: 'test',
        message: user.message,
        attachments: user.attachments,
        isTest: true,
        senderId: user.sender,
        chatType: user.chatType,
        receiverId: user.receiver,
        chatTypeId: user.chatTypeId,
        chatHeadId: user.chatHeadId,
        replyMessageType: user.replyMessageType,
        replyChatContent: user.replyChatContent,
        fileName: user.fileName,
        fileURL: user.fileURL,
        isForwarded: user.isForwarded,
        forwardedFileName: user.forwardedFileName,
        forwardedFileURL:user.forwardedFileURL,
        forwardedFileType: user.forwardedFileType

      });
      unreadChatResponse.next({readMessagesCount:1,type:"add",chatHeadId: user.chatHeadId});
    });

    this.hubConnection?.on('ReceiveMessageFromGroup', (model) => {
      debugger
      commentResponse.next({
        id:model.id,
        senderAvatar: model.userAvatar,
        message: model.content,
        userId: model.userId,
        createdOn:model.createdOn,
        userName: model.userName,
        gender: model.gender,
        isUserVerified: model.isUserVerified
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

    this.hubConnection?.on('NotifyCommentDelete',
    (commentId) => {
      debugger;
      commentDeleteResponse.next({
        commentId: commentId
      });
    });

    this.hubConnection?.on('NotifyPostLikeToReceiver',
    (isLiked) => {
      postLikeResponse.next({
        isLiked:isLiked
      });
    });

    this.hubConnection?.on('NotifyPostViewToReceiver',
    (isAddView,userId) => {
      debugger
      postViewResponse.next({
        isAddView:isAddView,
        userId:userId
      });
    });

    this.hubConnection?.on('NotifyLiveUsersCountToReceiver',
    (isLeaveStream) => {
      liveUsersCountResponse.next({
        isLeaveStream:isLeaveStream
      });
    });

    this.hubConnection?.on('NotifyEndMeetingToReceiver',
    (response) => {
      debugger
      endMeetingResponse.next({});         
    });

    
    this.hubConnection?.on('ReceiveNotification',
    (model) => {
      debugger
      notificationResponse.next(model);
    });

    this.hubConnection?.on('UpdateProgress', (progress: number,fileName: string) => {
      progressResponse.next({
        progressCount:progress,
        fileName:fileName
      });
    });

    this.hubConnection?.on('closeIyizicoThreeDAuthWindow', (isClose: boolean) => {
      closeIyizicoThreeDAuthWindow.next({
        isClose:true
      });
    });

    this.hubConnection?.on('NotifyCommentThrotllingToReceiver', (noOfComments) => {
      notifyCommentThrotllingResponse.next({
        noOfComments:noOfComments
      });
    });

    this.hubConnection?.on('NotifySaveStreamToReceiver',
    (isSaved) => {
      saveStreamResponse.next({
        isSaved:isSaved
      });
    });

    this.hubConnection?.on('NotifyShareStreamToReceiver',
    () => {
      shareStreamResponse.next({});
    });

    this.hubConnection?.on('NotifyAddTeacher',
    (userId) => {
      debugger
      notiFyTeacherResponse.next({userId: userId});
    });


    this.hubConnection?.on('LogoutBanUser', (userId)=>{
      debugger;
      banUnbanUserProgression.next({userId: userId})
    })

    this.hubConnection?.on('ReloadClassCourseProfile', (reloadClassCourseProfile)=>{
      debugger;
      disableEnableResponse.next({reloadClassCourseProfile: reloadClassCourseProfile})
    })


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
    debugger;
    this.hubConnection?.invoke('NotifyCommentLike', model)
      .catch((err) => console.error(err));
  }

  notifyCommentDelete(model:CommentLikeUnlike) {
    debugger;
    this.hubConnection?.invoke('DeleteCommentById', model)
      .catch((err) => console.error(err));
  }

  notifyPostLike(groupName:string,userId:string,isLiked:boolean) {
    this.hubConnection?.invoke('NotifyPostLike', groupName,userId,isLiked)
      .catch((err) => console.error(err));
  }

  notifyEndMeeting(groupName:string) {
    debugger
    this.hubConnection?.invoke('NotifyEndMeeting', groupName)
      .catch((err) => console.error(err));
  }

  notifyPostView(groupName:string,userId:string) {
    debugger
    this.hubConnection?.invoke('notifyPostView', groupName,userId)
  }

  notifyShareStream(groupName:string) {
    this.hubConnection?.invoke('notifyShareStream', groupName)
  }

  notifyLiveUsers(groupName:string,isLeaveStream:boolean) {
    this.hubConnection?.invoke('notifyLiveUsersCount', groupName,isLeaveStream)
  }

  notifySaveStream(groupName:string,userId:string,isSaved:boolean) {
    debugger
    this.hubConnection?.invoke('notifySaveStream', groupName,userId,isSaved)
      .catch((err) => console.error(err));
  }

  notifyCommentThrotlling(groupName:string,noOfComments:number) {
    debugger
    this.hubConnection?.invoke('notifyCommentThrotlling', groupName,noOfComments)
      .catch((err) => console.error(err));
  }

  addTeacher(teacherId:string) {
    this.hubConnection?.invoke('notifyAddTeacher', teacherId)
  }

  sendNotification(model:NotificationViewModel){
    debugger
    if(model.followersIds != null){
      this._userService.getFollowersNotificationSettings(JSON.stringify(model.followersIds)).subscribe((response) => {
        debugger
        model.followersIds = model.followersIds?.filter((item: string) =>
        !response.some((obj: { userId: string }) => obj.userId === item)
      );

      this.hubConnection?.invoke('SendNotification', model)
      .catch((err) => console.error(err));
        
      });
    }
    else{
    this._userService.getNotificationSettings(model.userId).subscribe((response) => {
      debugger
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


  // for testing live stream only i can remove this after testing;
  // this.hubConnection?.invoke('SendNotification', model)
  //       .catch((err) => console.error(err));
  }

  logoutBanUser(userId:string){
    this.hubConnection?.invoke('logoutBanUser', userId)
      .catch((err => console.error(err)));
  }

  reloadClassCourseProfile(classCourseId:string){
    this.hubConnection?.invoke('reloadClassCourseProfile', classCourseId)
      .catch((err => console.error(err)));
    // banUnbanUserProgression.next({userId: userId})
  }
}
