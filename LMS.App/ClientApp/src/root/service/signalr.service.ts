import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { getuid } from 'process';
import { Subject } from 'rxjs';
import { json } from 'stream/consumers';
import { ChartModel } from '../interfaces/chat/ChatModel';
import { CommentLikeUnlike } from '../interfaces/chat/commentsLike';
import { CommentViewModel } from '../interfaces/chat/commentViewModel';
import { CustomXhrHttpClient } from './signalr.httpclient';

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
}>();

export const commentLikeResponse = new Subject<{
  commentId: string;
  isLike: boolean;
}>();

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private hubConnection?: signalR.HubConnection;

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

  

      // this.hubConnection?.off('ReceiveMessage');

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
      });

      console.log(`this ${model.userId} send ${model.content}`);
      // this.hubConnection?.off('ReceiveMessageFromGroup');
    });

    this.hubConnection?.on('NotifyCommentLikeToReceiver',
    (model) => {
      commentLikeResponse.next({
        commentId: model.commentId,
        isLike: model.isLike
      });
      console.log(`this ${model.commentId}`);
    }
  );
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

    // this.hubConnection?.on(
    //   'NotifyCommentLikeToReceiver',
    //   (commentId, likeCount, isLike) => {
    //     console.log(`this ${commentId}`);
    //   }
    // );
  }
}
