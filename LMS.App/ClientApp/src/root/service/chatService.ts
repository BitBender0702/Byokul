import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { SaveChatAttachment } from "../interfaces/chat/saveChatAttachment";
import { FileUploadResult } from "../interfaces/chat/uploadFiles";

@Injectable({providedIn: 'root'})

export class ChatService{
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    }
    
    getChatHead(senderId:string,receiverId:string): Observable<any> {
        
        let queryParams = new HttpParams().append("senderId",senderId).append("receiverId",receiverId);
        return this.http.get(`${this.apiUrl}/users/getChatHead`, {params:queryParams});
    }

    saveSentMessage(formData:any){
        return this.http.post(`${this.apiUrl}/users/saveSentMssage`, formData);

    }

    saveChatAttachments(saveChatAttachments:any) : Observable<FileUploadResult>{
        
        return this.http.post<FileUploadResult>(`${this.apiUrl}/users/saveChatAttachments`, saveChatAttachments);

    }
}