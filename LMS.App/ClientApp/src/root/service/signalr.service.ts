// import { Injectable } from "@angular/core";

// import * as signalR from '@microsoft/signalr'

// @Injectable({
//     providedIn: 'root'
// })

// export class SignalrService{
//     constructor(){

//     }

//     private thenable!: Promise<void>
//     hubConnection!:signalR.HubConnection;

//     startConnection = () => {
//         this.hubConnection = new signalR.HubConnectionBuilder()
//         .withUrl('/chatHub', {
//             skipNegotiation: true,
//             transport: signalR.HttpTransportType.WebSockets
//         })
//         .configureLogging(signalR.LogLevel.Information)
//         .build();

//         //this.start()
        
    
//         this.hubConnection.start()
//         .then(() => {
//             console.log('Hub Connection Started!');
//         })
//         .catch(err => console.log('Error while starting connection: ' + err))
//     }

//     askServer() {
//         this.hubConnection.invoke("SendToUser", "user","1","Hey")
//             .catch(err => console.error(err));


//             // this.thenable.then(() =>{
//             //     this.hubConnection
//             //        .invoke('askServer', "hey")
//             //        .catch(err => console.error(err));
//             // });
            
//     }
    
//     askServerListener() {
//         this.hubConnection.on("ReceiveMessage", (someText) => {
//             console.log(someText);
//         })
//     }
// }


import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr"
import { getuid } from 'process';
import { Subject } from 'rxjs';
import { json } from 'stream/consumers';
import { ChartModel } from '../interfaces/chat/ChatModel';
import { CustomXhrHttpClient } from './signalr.httpclient';

export const signalRResponse =new Subject<{receiver : any , message: string,attachments:any, isTest : boolean,senderId:string,chatType:string,receiverId:string,chatTypeId:string,chatHeadId:string}>();  


@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection!: signalR.HubConnection
    public startConnection = () => {
      this.hubConnection = new signalR.HubConnectionBuilder()
                              .withUrl('https://byokul.com/chatHub', 
                               {
                                            skipNegotiation: true,
                                            transport: signalR.HttpTransportType.WebSockets
                                        } )
                                        .withAutomaticReconnect()
                                        .configureLogging(signalR.LogLevel.Information)
                                        .build();
      this.hubConnection
        .start()
        .then(() => console.log('Connection started'))
        .catch(err => console.log('Error while starting connection: ' + err));
        this.hubConnection.on("UserCount", (count) => {
         console.log('User Count ' + count);   
                  })
                  this.hubConnection.on("DisconnectedUser", (userId) => {
                    console.log('Disconnected UserId ' + userId);   
                             })
}

askServer(userId:string) {
  this.hubConnection.invoke("GetConnectionId", userId)
  .catch(err => console.error(err));
}

sendToUser(model:any){
  
  this.hubConnection.invoke("SendToUser",  model)
  .catch(err => console.error(err));
}

askServerListener(){
this.hubConnection.on("ReceiveMessage", (user,message) => {
  signalRResponse.next({receiver: "test", message : user.message,attachments: user.attachments, isTest : true,senderId:user.sender,chatType:user.chatType,receiverId:user.receiver,chatTypeId:user.chatTypeId,chatHeadId:user.chatHeadId});
              console.log(`this ${user} send ${message}`);   
          })
}

sendToGroup(userId:string,messageToUser:string){
  this.hubConnection.invoke("SendMessageToGroup", 'test',userId,messageToUser)
  .catch(err => console.error(err));
}

createGroupName() {
  var groupName = 'test';
  this.hubConnection.invoke("JoinGroup", groupName)
  .catch(err => console.error(err));
}

// document.getElementById("sendGroup").addEventListener("click", function (event) {
    
    // public addTransferChartDataListener = () => {
    //   this.hubConnection.on('transferchartdata', (data) => {
    //     this.data = data;
    //     console.log(data);
    //   });
    // }

    // public broadcastChartData = () => {
    //   const data = this.data.map(m => {
    //     const temp = {
    //       data: m.data,
    //       label: m.label
    //     }
    //     return temp;
    //   });

    //   this.hubConnection.invoke('broadcastchartdata', data)
    //   .catch(err => console.error(err));
    // }

    // public addBroadcastChartDataListener = () => {
    //   this.hubConnection.on('broadcastchartdata', (data) => {
    //     this.bradcastedData = data;
    //   })
    // }
}



