import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { FollowUnfollow } from "../interfaces/FollowUnfollow";


@Injectable({providedIn: 'root'})

export class UserService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    }
    
    getSidebarInfo():Observable<any>{
        return this.http.get(`${this.apiUrl}/userdashboard/dashboardDetails`);
    }

    getUserById(userId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/users/getUser` + '?userId=' + userId);
    }

    getLanguageList():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/languageList`);
    }

    saveUserLanguages(addLanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/users/saveUserLanguages`,addLanguages);
    }

    deleteUserLanguage(deletelanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/users/deleteUserLanguage`,deletelanguages);
    }

    saveUserFollower(followUnfollowUser:FollowUnfollow):Observable<any>{
        return this.http.post(`${this.apiUrl}/users/followUnfollowUser`,followUnfollowUser);
    }

    getUserEditDetails(userId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/users/getUserEditDetails` + '?userId=' + userId);
    }

    editUser(credentials:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/updateUser`, credentials);
    }

    getUserFollowers(userId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/users/userFollowers` + '?userId=' + userId);
    }

    banFollower(followerId:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/banFollower` + '?followerId=' + followerId,'');
    }

    getUser(userId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/users/getBasicUserInfo` + '?userId=' + userId);

    }

    getMyFeed():Observable<any>{
        return this.http.get(`${this.apiUrl}/users/myFeed`);

    }

    getGlobalFeed():Observable<any>{
        return this.http.get(`${this.apiUrl}/users/globalFeed`);

    }

    saveUserPreference(preferenceString:string): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/saveUserPreference` + '?preferenceString=' + preferenceString,'');
    }

    shareDataSubject = new Subject<any>(); //Decalring new RxJs Subject
 
     sendDataToOtherComponent(userId:string){
        debugger
      this.shareDataSubject.next(userId);
     }

    

}
