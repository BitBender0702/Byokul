import { Component, OnInit } from '@angular/core';
import { SignalrService } from '../service/signalr.service';

@Component({
  selector: 'root-selector',
  templateUrl: './root.component.html',
  styleUrls: []
})
export class RootComponent implements OnInit {
  title = 'app';
  constructor( private signalRService: SignalrService) { 
   console.log("in app comp");
  }
  ngOnInit(): void {
    console.log("temp");
    this.connectSignalR();
  }

  connectSignalR() : void {
    let token = localStorage.getItem("jwt"); 
    if(!token)
      return;
    this.signalRService.startConnection();
    setTimeout(() => {
            this.signalRService.askServerListener();
            this.signalRService.askServer(this.getUserRoles(token!).jti);
          }, 500);
  }

  getUserRoles(token:string): any{
    let jwtData = token.split('.')[1]
    let decodedJwtJsonData = window.atob(jwtData)
    let decodedJwtData = JSON.parse(decodedJwtJsonData)
    return decodedJwtData;
  }
}
