import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})

export class VideoLibraryService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }

    getSchoolLibraryVideos(schoolId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/videoLibrary/getSchoolLibraryVideos` + '?schoolId=' + schoolId, {headers: this.headers});
    }

    deleteFile(fileId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/videoLibrary/deleteFile`  + '?fileId=' + fileId, {headers: this.headers})
    }

    saveFile(saveFile:any):Observable<any>{
        var token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + token);
        return this.http.post(`${this.apiUrl}/videoLibrary/saveFile`,saveFile,{headers: this.headers,reportProgress:true});
    }
}