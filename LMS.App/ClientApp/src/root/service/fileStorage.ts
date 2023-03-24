import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})

export class FileStorageService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }

    saveFolder(model:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/fileStorage/saveFolder`, model,{headers: this.headers});
    }

    getFolders(parentId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/fileStorage/getFolders` + '?parentId=' + parentId,{headers: this.headers});
    }

    saveFiles(saveFiles:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/fileStorage/saveFiles`,saveFiles,{headers: this.headers});
    }

    getFiles(parentId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/fileStorage/getFiles` + '?parentId=' + parentId,{headers: this.headers});
    }

    getNestedFolders(folderId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/fileStorage/getNestedFolders` + '?folderId=' + folderId ,{headers: this.headers});
    }
}