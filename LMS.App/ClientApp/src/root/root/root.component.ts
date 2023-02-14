import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { SignalrService } from '../service/signalr.service';

@Component({
  selector: 'root-selector',
  templateUrl: './root.component.html',
  styleUrls: []
})
export class RootComponent implements OnInit {
  title = 'app';
  displaySideBar: boolean = false;
  constructor( private signalRService: SignalrService, authService: AuthService) { 
   console.log("in app comp");
   authService.loginState$.asObservable().subscribe(x => { this.displaySideBar = x;})
  }
  ngOnInit(): void {
    console.log("temp");
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
