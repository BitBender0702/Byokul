import { HttpClient, HttpEventType, HttpHeaders, HttpParams, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { map, Observable } from "rxjs";
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

    getFolders(parentId:string,searchString:string):Observable<any>{
        let queryParams = new HttpParams().append("parentId",parentId).append("searchString",searchString);
        return this.http.get(`${this.apiUrl}/fileStorage/getFolders`, {params:queryParams,headers: this.headers})
    }

    saveFiles(saveFiles:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/fileStorage/saveFiles`,saveFiles,{headers: this.headers,reportProgress:true});
    }

    getFiles(parentId:string,searchString:string):Observable<any>{
        let queryParams = new HttpParams().append("parentId",parentId).append("searchString",searchString);
        return this.http.get(`${this.apiUrl}/fileStorage/getFiles`, {params:queryParams,headers: this.headers,reportProgress:true})
    }

    getNestedFolders(folderId:string,searchString:string):Observable<any>{
        let queryParams = new HttpParams().append("folderId",folderId).append("searchString",searchString);
        return this.http.get(`${this.apiUrl}/fileStorage/getNestedFolders`, {params:queryParams,headers: this.headers})
    }

    getFileStorageAttachments():Observable<any>{
        return this.http.get(`${this.apiUrl}/fileStorage/getAttachments`, {headers: this.headers})
    }

    isFolderNameExist(folderName:string,parentId:string,parentFolderId:string){
        let queryParams = new HttpParams().append("folderName",folderName).append("parentId",parentId).append("parentFolderId",parentFolderId);
        return this.http.get(`${this.apiUrl}/fileStorage/isFolderNameExist`, {params:queryParams,headers: this.headers})
    }

    deleteFolder(folderId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/fileStorage/deleteFolder`  + '?folderId=' + folderId, {headers: this.headers})
    }

    deleteFile(fileId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/fileStorage/deleteFile`  + '?fileId=' + fileId, {headers: this.headers})
    }
}