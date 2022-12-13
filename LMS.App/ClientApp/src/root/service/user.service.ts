import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";


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

    saveUserFollower(userId:string):Observable<any>{
        return this.http.post(`${this.apiUrl}/users/saveUserFollower` + '?userId=' + userId,'');
    }

    getUserEditDetails(userId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/users/getUserEditDetails` + '?userId=' + userId);
    }

    editUser(credentials:any): Observable<any> {
        debugger
        for(var pair of credentials.entries()) {
            console.log(pair[0]+ ', '+ pair[1]);
         }
        return this.http.post(`${this.apiUrl}/users/updateUser`, credentials);
    }




}
