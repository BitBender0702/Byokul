import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { JoinMeetingModel } from "../interfaces/bigBlueButton/joinMeeting";

@Injectable({providedIn: 'root'})

export class BigBlueButtonService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }

    joinMeeting(model:JoinMeetingModel):Observable<any>{
        var token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + token);
        return this.http.post(`${this.apiUrl}/bigBlueButton/joinMeeting`,model,{headers: this.headers});
    }

    endMeeting(model:any):Observable<any>{
        var token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + token);
        return this.http.post(`${this.apiUrl}/bigBlueButton/endMeeting`,model,{headers: this.headers});
    }
}