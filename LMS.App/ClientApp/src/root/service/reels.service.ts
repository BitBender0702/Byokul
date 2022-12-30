import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})

export class ReelsService{

    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }

    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    }
    
    getReelById(id:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/posts/getReelById` + '?id=' + id);
id
    }

}